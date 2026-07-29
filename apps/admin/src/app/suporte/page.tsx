"use client";

import { useEffect, useMemo, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatDate, type SupportTicket } from "@vaija/shared";

export default function SuportePage() {
  const token = useAdminAuth((s) => s.token);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [filter, setFilter] = useState<"todos" | "abertos" | "resolvido">("todos");

  const load = () => token && api.getTickets(token).then(setTickets).catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [token]);

  const visible = useMemo(() => {
    if (filter === "todos") return tickets;
    if (filter === "resolvido") return tickets.filter((t) => t.status === "resolvido");
    return tickets.filter((t) => t.status !== "resolvido");
  }, [tickets, filter]);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-2">Suporte</h1>
      <p className="text-sm text-gray-500 mb-4">{tickets.length} ticket(s)</p>

      <div className="flex gap-2 mb-4">
        {(
          [
            ["todos", "Todos"],
            ["abertos", "Abertos"],
            ["resolvido", "Resolvidos"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
              filter === id ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {visible.length === 0 ? (
          <div className="bg-white rounded-2xl border p-5 text-gray-500">Nenhum ticket neste filtro.</div>
        ) : (
          visible.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border">
              <div className="flex justify-between gap-3 flex-wrap">
                <p className="font-bold">{t.subject}</p>
                <span className="text-xs font-semibold uppercase text-gray-500">{t.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {t.userName} · {t.category} · {formatDate(t.createdAt)}
              </p>
              <p className="mt-2 text-sm">{t.message}</p>
              <div className="mt-3 flex gap-3">
                {t.status === "aberto" ? (
                  <button
                    className="text-[#1E88E5] font-semibold text-sm"
                    onClick={async () => {
                      await api.updateTicket(token!, t.id, "em_andamento");
                      load();
                    }}
                  >
                    Em andamento
                  </button>
                ) : null}
                {t.status !== "resolvido" ? (
                  <button
                    className="text-green-600 font-semibold text-sm"
                    onClick={async () => {
                      await api.updateTicket(token!, t.id, "resolvido");
                      load();
                    }}
                  >
                    Marcar resolvido
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </Guard>
  );
}
