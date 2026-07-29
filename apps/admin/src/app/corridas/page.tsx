"use client";

import { useEffect, useMemo, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatBRL, formatDate, STATUS_LABELS, type Ride } from "@vaija/shared";

const FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "ativas", label: "Ativas" },
  { id: "concluida", label: "Concluídas" },
  { id: "cancelada", label: "Canceladas" },
] as const;

export default function CorridasPage() {
  const token = useAdminAuth((s) => s.token);
  const [rides, setRides] = useState<Ride[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("todas");
  const [error, setError] = useState("");

  const load = () => {
    if (!token) return;
    api
      .getRides(token)
      .then((r) => {
        setRides(r);
        setError("");
      })
      .catch((e: any) => setError(e.message || "Falha ao carregar corridas"));
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [token]);

  const visible = useMemo(() => {
    if (filter === "todas") return rides;
    if (filter === "ativas") {
      return rides.filter((r) => !["concluida", "cancelada"].includes(r.status));
    }
    return rides.filter((r) => r.status === filter);
  }, [rides, filter]);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-2">Corridas</h1>
      <p className="text-sm text-gray-500 mb-4">
        {rides.length} no total · {visible.length} no filtro
      </p>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button className="font-bold underline" onClick={load}>
            Tentar de novo
          </button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
              filter === f.id ? "bg-[#0B1F3A] text-white border-[#0B1F3A]" : "bg-white"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Quando</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Motorista</th>
              <th className="p-3">Rota</th>
              <th className="p-3">Status</th>
              <th className="p-3">Total</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Nenhuma corrida neste filtro.
                </td>
              </tr>
            ) : (
              visible.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3 whitespace-nowrap">{formatDate(r.createdAt)}</td>
                  <td className="p-3">{r.clientName || "—"}</td>
                  <td className="p-3">{r.driverName || "—"}</td>
                  <td className="p-3">
                    {r.origin.label} → {r.destination.label}
                  </td>
                  <td className="p-3 font-semibold">{STATUS_LABELS[r.status]}</td>
                  <td className="p-3">{formatBRL(r.total)}</td>
                  <td className="p-3">
                    {!["concluida", "cancelada"].includes(r.status) ? (
                      <button
                        className="text-red-500 font-semibold"
                        onClick={async () => {
                          if (!confirm("Cancelar esta corrida?")) return;
                          try {
                            await api.updateRide(token!, r.id, { status: "cancelada" });
                            load();
                          } catch (e: any) {
                            setError(e.message || "Falha ao cancelar corrida");
                          }
                        }}
                      >
                        Cancelar
                      </button>
                    ) : (
                      "—"
                    )}
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
