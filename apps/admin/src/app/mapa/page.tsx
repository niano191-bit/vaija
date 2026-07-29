"use client";

import { useEffect, useMemo, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, STATUS_LABELS, type Ride } from "@vaija/shared";

type DriverRow = {
  userId: string;
  online: boolean;
  lat: number;
  lng: number;
  user?: { name?: string };
  vehicle?: { model?: string; plate?: string };
};

/** Project São Paulo-ish lat/lng into % of the map box. */
function project(lat: number, lng: number) {
  const latMin = -23.65;
  const latMax = -23.5;
  const lngMin = -46.75;
  const lngMax = -46.55;
  const x = ((lng - lngMin) / (lngMax - lngMin)) * 100;
  const y = ((latMax - lat) / (latMax - latMin)) * 100;
  return {
    left: `${Math.min(94, Math.max(4, x))}%`,
    top: `${Math.min(90, Math.max(6, y))}%`,
  };
}

export default function MapaPage() {
  const token = useAdminAuth((s) => s.token);
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<DriverRow[]>([]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const [r, d] = await Promise.all([
        api.getRides(token, { status: "solicitada,aceita,a_caminho,em_andamento" }),
        api.getDrivers(token),
      ]);
      setRides(r);
      setDrivers(d as DriverRow[]);
    };
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [token]);

  const onlineDrivers = useMemo(() => drivers.filter((d) => d.online), [drivers]);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-2">Mapa ao vivo</h1>
      <p className="text-sm text-gray-500 mb-6">
        Atualiza a cada 3s · {rides.length} corrida(s) · {onlineDrivers.length} motorista(s) online
      </p>

      <div className="relative h-[520px] rounded-2xl overflow-hidden bg-[#D6E4F0] border border-gray-200 shadow-sm">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(#9BB8D0 1px, transparent 1px), linear-gradient(90deg, #9BB8D0 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {rides.map((r) => {
          const origin = project(r.origin.lat, r.origin.lng);
          const dest = project(r.destination.lat, r.destination.lng);
          return (
            <div key={r.id}>
              <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
                <line
                  x1={origin.left}
                  y1={origin.top}
                  x2={dest.left}
                  y2={dest.top}
                  stroke="#1E88E5"
                  strokeWidth="3"
                  strokeDasharray="8 6"
                  strokeOpacity="0.7"
                />
              </svg>
              <div
                className="absolute w-3.5 h-3.5 rounded-full bg-white border-2 border-[#1E88E5] shadow -translate-x-1/2 -translate-y-1/2"
                style={{ left: origin.left, top: origin.top }}
                title={`Origem: ${r.origin.label}`}
              />
              <div
                className="absolute w-4 h-4 rounded-full bg-[#1E88E5] border-2 border-white shadow -translate-x-1/2 -translate-y-1/2"
                style={{ left: dest.left, top: dest.top }}
                title={`${r.origin.label} → ${r.destination.label} (${STATUS_LABELS[r.status]})`}
              />
            </div>
          );
        })}

        {onlineDrivers.map((d) => {
          const pos = project(Number(d.lat), Number(d.lng));
          return (
            <div
              key={d.userId}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: pos.left, top: pos.top }}
              title={d.user?.name || "Motorista"}
            >
              <div className="w-4 h-4 rounded-full bg-[#FFC107] border-2 border-[#0B1F3A] shadow" />
              <div className="mt-1 whitespace-nowrap rounded bg-[#0B1F3A] text-white text-[10px] px-1.5 py-0.5">
                {d.user?.name?.split(" ")[0] || "Motorista"}
              </div>
            </div>
          );
        })}

        <div className="absolute bottom-4 left-4 bg-white/95 rounded-xl px-4 py-2 text-sm shadow">
          <span className="inline-block w-3 h-3 rounded-full bg-[#1E88E5] mr-2 align-middle" />
          Corridas / destino
          <span className="inline-block w-3 h-3 rounded-full bg-[#FFC107] ml-4 mr-2 align-middle border border-[#0B1F3A]" />
          Motoristas online
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        {rides.length === 0 ? (
          <div className="bg-white rounded-xl p-4 text-sm text-gray-500">Nenhuma corrida ativa no momento.</div>
        ) : (
          rides.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-3 text-sm flex flex-wrap justify-between gap-2">
              <span className="font-medium">
                {r.origin.label} → {r.destination.label}
                {r.driverName ? ` · ${r.driverName}` : ""}
              </span>
              <span className="font-semibold text-[#0B1F3A]">{STATUS_LABELS[r.status]}</span>
            </div>
          ))
        )}
      </div>
    </Guard>
  );
}
