"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, STATUS_LABELS, type Ride } from "@vaija/shared";

const LiveMap = dynamic(() => import("@/components/LiveMap").then((m) => m.LiveMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full grid place-items-center bg-[#D6E4F0] text-sm text-gray-500">
      Carregando mapa…
    </div>
  ),
});

type DriverRow = {
  userId: string;
  online: boolean;
  lat: number;
  lng: number;
  user?: { name?: string };
  vehicle?: { model?: string; plate?: string };
};

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
        OpenStreetMap · atualiza a cada 3s · {rides.length} corrida(s) · {onlineDrivers.length} motorista(s) online
      </p>

      <div className="relative h-[520px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm z-0">
        <LiveMap rides={rides} drivers={onlineDrivers} />
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 rounded-xl px-4 py-2 text-sm shadow">
          <span className="inline-block w-3 h-3 rounded-full bg-[#1E88E5] mr-2 align-middle" />
          Corridas
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
