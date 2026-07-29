"use client";

import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatBRL, type DashboardStats } from "@vaija/shared";

export default function DashboardPage() {
  const token = useAdminAuth((s) => s.token);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (!token) return;
    const load = () => api.getDashboard(token).then(setStats).catch(() => {});
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [token]);

  const cards = [
    { label: "Corridas ativas", value: stats?.activeRides ?? "—" },
    { label: "Receita (taxas)", value: formatBRL(stats?.revenueToday || 0) },
    { label: "Motoristas online", value: stats?.driversOnline ?? "—" },
    { label: "SOS abertos", value: stats?.openSos ?? "—" },
    { label: "Tickets abertos", value: stats?.openTickets ?? "—" },
    { label: "Clientes", value: stats?.totalClients ?? "—" },
    { label: "Motoristas", value: stats?.totalDrivers ?? "—" },
  ];

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold text-[#0B1F3A] mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500">{c.label}</p>
            <p className="text-3xl font-extrabold text-[#0B1F3A] mt-2">{c.value}</p>
          </div>
        ))}
      </div>
    </Guard>
  );
}
