"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, formatBRL, type DashboardStats } from "@vaija/shared";

export default function DashboardPage() {
  const token = useAdminAuth((s) => s.token);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    const load = () =>
      api
        .getDashboard(token)
        .then((s) => {
          setStats(s);
          setError("");
        })
        .catch((e: any) => setError(e.message || "Falha ao carregar dashboard"));
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [token]);

  const cards = [
    { label: "Corridas ativas", value: stats?.activeRides ?? "—", href: "/corridas", hot: (stats?.activeRides || 0) > 0 },
    { label: "Receita hoje (taxas)", value: formatBRL(stats?.revenueToday || 0), href: "/financeiro" },
    { label: "Motoristas online", value: stats?.driversOnline ?? "—", href: "/mapa", hot: (stats?.driversOnline || 0) > 0 },
    {
      label: "SOS abertos",
      value: stats?.openSos ?? "—",
      href: "/sos",
      hot: (stats?.openSos || 0) > 0,
      danger: true,
    },
    { label: "Tickets abertos", value: stats?.openTickets ?? "—", href: "/suporte", hot: (stats?.openTickets || 0) > 0 },
    { label: "Clientes", value: stats?.totalClients ?? "—", href: "/usuarios" },
    { label: "Motoristas", value: stats?.totalDrivers ?? "—", href: "/motoristas" },
  ];

  const actions = [
    { href: "/mapa", label: "Abrir mapa ao vivo", desc: "Corridas e motoristas" },
    { href: "/motoristas", label: "Aprovar documentos", desc: "Liberar motoristas" },
    { href: "/cupons", label: "Criar cupom", desc: "Promoções do app" },
    { href: "/sos", label: "Central SOS", desc: "Alertas de emergência" },
  ];

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold text-[#0B1F3A] mb-2">Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">Atualiza a cada 3s · clique nos cards para ir à área</p>
      {error ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className={`bg-white rounded-2xl p-5 border shadow-sm transition hover:border-[#FFC107] ${
              c.danger && c.hot ? "border-red-300 bg-red-50" : "border-gray-100"
            }`}
          >
            <p className="text-sm text-gray-500 flex items-center gap-2">
              {c.label}
              {c.hot ? <span className="w-2 h-2 rounded-full bg-[#FFC107]" /> : null}
            </p>
            <p className={`text-3xl font-extrabold mt-2 ${c.danger && c.hot ? "text-red-600" : "text-[#0B1F3A]"}`}>
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <h2 className="text-lg font-extrabold text-[#0B1F3A] mb-3">Ações rápidas</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {actions.map((a) => (
          <Link key={a.href} href={a.href} className="bg-[#0B1F3A] text-white rounded-2xl p-4 hover:bg-[#123158] transition">
            <p className="font-bold">{a.label}</p>
            <p className="text-sm text-white/70 mt-1">{a.desc}</p>
          </Link>
        ))}
      </div>
    </Guard>
  );
}
