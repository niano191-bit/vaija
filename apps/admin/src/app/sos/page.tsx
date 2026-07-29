"use client";

import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatDate, type SosAlert } from "@vaija/shared";

export default function SosPage() {
  const token = useAdminAuth((s) => s.token);
  const [alerts, setAlerts] = useState<SosAlert[]>([]);

  const load = () => token && api.getSos(token).then(setAlerts).catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, 2000);
    return () => clearInterval(id);
  }, [token]);

  const open = alerts.filter((a) => a.status === "aberto").length;

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-2 text-red-600">SOS</h1>
      <p className="text-gray-500 mb-6">
        Alertas prioritários · {open} aberto(s) · atualiza a cada 2s
      </p>
      <div className="grid gap-3">
        {alerts.length === 0 ? (
          <div className="bg-white rounded-2xl border p-5 text-gray-500">Nenhum alerta registrado.</div>
        ) : (
          alerts.map((a) => (
            <div
              key={a.id}
              className={`rounded-2xl p-5 border ${a.status === "aberto" ? "bg-red-50 border-red-200" : "bg-white"}`}
            >
              <div className="flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <p className="font-bold text-lg">{a.userName}</p>
                  <p className="text-sm text-gray-500">{formatDate(a.createdAt)}</p>
                  <p className="text-sm mt-1">
                    Lat {a.lat.toFixed(4)}, Lng {a.lng.toFixed(4)}
                    {a.rideId ? ` · Corrida ${a.rideId.slice(0, 8)}…` : ""}
                  </p>
                  <a
                    className="text-sm font-semibold text-[#1E88E5] mt-2 inline-block"
                    href={`https://www.openstreetmap.org/?mlat=${a.lat}&mlon=${a.lng}#map=16/${a.lat}/${a.lng}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Abrir no mapa
                  </a>
                </div>
                {a.status === "aberto" ? (
                  <button
                    className="px-4 py-2 rounded-xl bg-red-500 text-white font-bold"
                    onClick={async () => {
                      await api.resolveSos(token!, a.id);
                      load();
                    }}
                  >
                    Atender
                  </button>
                ) : (
                  <span className="text-green-600 font-semibold">Atendido</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Guard>
  );
}
