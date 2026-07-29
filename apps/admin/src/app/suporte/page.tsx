"use client";

import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatDate, type SupportTicket } from "@vaija/shared";

export default function SuportePage() {
  const token = useAdminAuth((s) => s.token);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const load = () => token && api.getTickets(token).then(setTickets);

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-6">Suporte</h1>
      <div className="grid gap-3">
        {tickets.length === 0 ? (
          <p className="text-gray-500">Nenhum ticket aberto</p>
        ) : (
          tickets.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl p-5 border">
              <div className="flex justify-between">
                <p className="font-bold">{t.subject}</p>
                <span className="text-xs font-semibold uppercase text-gray-500">{t.status}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {t.userName} · {t.category} · {formatDate(t.createdAt)}
              </p>
              <p className="mt-2 text-sm">{t.message}</p>
              {t.status !== "resolvido" ? (
                <button
                  className="mt-3 text-[#1E88E5] font-semibold text-sm"
                  onClick={async () => {
                    await api.updateTicket(token!, t.id, "resolvido");
                    load();
                  }}
                >
                  Marcar resolvido
                </button>
              ) : null}
            </div>
          ))
        )}
      </div>
    </Guard>
  );
}
