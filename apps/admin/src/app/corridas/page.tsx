"use client";

import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatBRL, formatDate, STATUS_LABELS, type Ride } from "@vaija/shared";

export default function CorridasPage() {
  const token = useAdminAuth((s) => s.token);
  const [rides, setRides] = useState<Ride[]>([]);

  const load = () => token && api.getRides(token).then(setRides);

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-6">Corridas</h1>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Quando</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Rota</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {rides.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{formatDate(r.createdAt)}</td>
                <td className="p-3">{r.clientName}</td>
                <td className="p-3">{r.origin.label} → {r.destination.label}</td>
                <td className="p-3 font-semibold">{STATUS_LABELS[r.status]}</td>
                <td className="p-3">{formatBRL(r.total)}</td>
                <td className="p-3">
                  {!["concluida", "cancelada"].includes(r.status) ? (
                    <button
                      className="text-red-500 font-semibold"
                      onClick={async () => {
                        await api.updateRide(token!, r.id, { status: "cancelada" });
                        load();
                      }}
                    >
                      Cancelar
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Guard>
  );
}
