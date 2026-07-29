"use client";

import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatBRL, formatDate, type Transaction } from "@vaija/shared";

export default function FinanceiroPage() {
  const token = useAdminAuth((s) => s.token);
  const [txs, setTxs] = useState<Transaction[]>([]);

  useEffect(() => {
    if (!token) return;
    api.getTransactions(token).then(setTxs);
  }, [token]);

  const taxas = txs.filter((t) => t.type === "taxa").reduce((s, t) => s + t.amount, 0);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-2">Financeiro</h1>
      <p className="text-gray-500 mb-6">Receita de taxas: <strong>{formatBRL(taxas)}</strong></p>
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
            {txs.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{formatDate(t.createdAt)}</td>
                <td className="p-3 capitalize">{t.type}</td>
                <td className="p-3">{t.description}</td>
                <td className={`p-3 font-bold ${t.amount < 0 ? "text-red-500" : "text-green-600"}`}>
                  {formatBRL(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Guard>
  );
}
