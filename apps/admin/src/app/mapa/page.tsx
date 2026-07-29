"use client";

import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, STATUS_LABELS, type Ride } from "@vaija/shared";

export default function MapaPage() {
  const token = useAdminAuth((s) => s.token);
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const [r, d] = await Promise.all([
        api.getRides(token, { status: "solicitada,aceita,a_caminho,em_andamento" }),
        api.getDrivers(token),
      ]);
      setRides(r);
      setDrivers(d);
    };
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [token]);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-6">Mapa ao vivo</h1>
      <div className="relative h-[480px] rounded-2xl overflow-hidden bg-[#D6E4F0] border border-gray-200">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "linear-gradient(#9BB8D0 1px, transparent 1px), linear-gradient(90deg, #9BB8D0 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        {rides.map((r, i) => (
          <div
            key={r.id}
            className="absolute w-4 h-4 rounded-full bg-[#1E88E5] border-2 border-white shadow"
            style={{ left: `${20 + i * 12}%`, top: `${30 + (i % 3) * 15}%` }}
            title={`${r.destination.label} (${STATUS_LABELS[r.status]})`}
          />
        ))}
        {drivers.filter((d) => d.online).map((d, i) => (
          <div
            key={d.userId}
            className="absolute w-4 h-4 rounded-full bg-[#FFC107] border-2 border-[#0B1F3A] shadow"
            style={{ left: `${55 + i * 8}%`, top: `${45 + i * 10}%` }}
            title={d.user?.name}
          />
        ))}
        <div className="absolute bottom-4 left-4 bg-white/90 rounded-xl px-4 py-2 text-sm">
          <span className="inline-block w-3 h-3 rounded-full bg-[#1E88E5] mr-2" /> Corridas
          <span className="inline-block w-3 h-3 rounded-full bg-[#FFC107] ml-4 mr-2" /> Motoristas online
        </div>
      </div>
      <div className="mt-4 grid gap-2">
        {rides.map((r) => (
          <div key={r.id} className="bg-white rounded-xl p-3 text-sm flex justify-between">
            <span>{r.origin.label} → {r.destination.label}</span>
            <span className="font-semibold">{STATUS_LABELS[r.status]}</span>
          </div>
        ))}
      </div>
    </Guard>
  );
}
