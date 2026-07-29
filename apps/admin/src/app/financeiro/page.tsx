"use client";

import { useEffect, useMemo, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatBRL, formatDate, type Transaction } from "@vaija/shared";

export default function FinanceiroPage() {
  const token = useAdminAuth((s) => s.token);
  const [txs, setTxs] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<"todas" | "taxa" | "credito" | "corrida">("todas");

  useEffect(() => {
    if (!token) return;
    const load = () => api.getTransactions(token).then(setTxs).catch(() => {});
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [token]);

  const summary = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const today = txs.filter((t) => new Date(t.createdAt) >= start);
    return {
      taxasTotal: txs.filter((t) => t.type === "taxa").reduce((s, t) => s + t.amount, 0),
      taxasHoje: today.filter((t) => t.type === "taxa").reduce((s, t) => s + t.amount, 0),
      creditos: txs.filter((t) => t.type === "credito").reduce((s, t) => s + t.amount, 0),
      corridas: txs.filter((t) => t.type === "corrida").reduce((s, t) => s + Math.abs(t.amount), 0),
    };
  }, [txs]);

  const visible = filter === "todas" ? txs : txs.filter((t) => t.type === filter);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-2">Financeiro</h1>
      <p className="text-sm text-gray-500 mb-6">Atualiza a cada 5s · extrato completo da plataforma</p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Taxas (total)", value: formatBRL(summary.taxasTotal) },
          { label: "Taxas hoje", value: formatBRL(summary.taxasHoje) },
          { label: "Créditos motoristas", value: formatBRL(summary.creditos) },
          { label: "Volume corridas", value: formatBRL(summary.corridas) },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl border p-4">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-2xl font-extrabold text-[#0B1F3A] mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(
          [
            ["todas", "Todas"],
            ["taxa", "Taxas"],
            ["credito", "Créditos"],
            ["corrida", "Corridas"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
              filter === id ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white text-[#0B1F3A]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Data</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Descrição</th>
              <th className="p-3">Valor</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  Nenhuma movimentação neste filtro.
                </td>
              </tr>
            ) : (
              visible.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">{formatDate(t.createdAt)}</td>
                  <td className="p-3 capitalize">{t.type}</td>
                  <td className="p-3">{t.description}</td>
                  <td className={`p-3 font-bold ${t.amount < 0 ? "text-red-500" : "text-green-600"}`}>
                    {formatBRL(t.amount)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Guard>
  );
}
