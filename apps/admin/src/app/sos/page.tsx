"use client";

import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatDate, type SosAlert } from "@vaija/shared";

export default function SosPage() {
  const token = useAdminAuth((s) => s.token);
  const [alerts, setAlerts] = useState<SosAlert[]>([]);
  const [error, setError] = useState("");

  const load = () => {
    if (!token) return;
    api
      .getSos(token)
      .then((data) => {
        setAlerts(data);
        setError("");
      })
      .catch((e: any) => setError(e.message || "Falha ao carregar SOS"));
  };

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
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}{" "}
          <button className="font-bold underline" onClick={load}>
            Tentar de novo
          </button>
        </div>
      ) : null}
      <div className="grid gap-3">
        {alerts.length === 0 && !error ? (
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
                  {a.userPhone ? (
                    <a className="text-sm font-semibold text-[#1E88E5]" href={`tel:${a.userPhone.replace(/\D/g, "")}`}>
                      {a.userPhone}
                    </a>
                  ) : (
                    <p className="text-sm text-gray-400">Telefone indisponível</p>
                  )}
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
                      try {
                        await api.resolveSos(token!, a.id);
                        load();
                      } catch (e: any) {
                        setError(e.message || "Falha ao atender SOS");
                      }
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
