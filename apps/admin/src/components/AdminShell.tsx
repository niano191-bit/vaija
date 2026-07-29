"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAdminAuth } from "@/lib/store";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/mapa", label: "Mapa ao vivo" },
  { href: "/usuarios", label: "Usuários" },
  { href: "/motoristas", label: "Motoristas" },
  { href: "/corridas", label: "Corridas" },
  { href: "/financeiro", label: "Financeiro" },
  { href: "/cupons", label: "Cupons" },
  { href: "/suporte", label: "Suporte" },
  { href: "/sos", label: "SOS" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const [apiOk, setApiOk] = useState<boolean | null>(null);

  useEffect(() => {
    let alive = true;
    const ping = async () => {
      try {
        const res = await fetch("/api/health");
        if (!alive) return;
        setApiOk(res.ok);
      } catch {
        if (alive) setApiOk(false);
      }
    };
    ping();
    const id = setInterval(ping, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="min-h-screen flex bg-[#F3F4F6]">
      <aside className="w-64 bg-[#0B1F3A] text-white flex flex-col p-5">
        <div className="mb-8">
          <span className="text-2xl font-extrabold italic">
            vai<span className="text-[#FFC107]">já</span>
          </span>
          <p className="text-xs text-white/60 mt-1">Painel Admin</p>
          <p className="mt-3 inline-flex items-center gap-2 text-[11px] font-semibold rounded-full bg-white/10 px-2.5 py-1">
            <span
              className={`w-2 h-2 rounded-full ${
                apiOk == null ? "bg-white/40" : apiOk ? "bg-[#22C55E]" : "bg-[#EF4444]"
              }`}
            />
            {apiOk == null ? "Checando API…" : apiOk ? "API online" : "API offline"}
          </p>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active ? "bg-[#FFC107] text-[#0B1F3A]" : "text-white/80 hover:bg-white/10"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="pt-4 border-t border-white/10">
          <p className="text-sm text-white/70 mb-2">{user?.name}</p>
          <button
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="text-sm font-semibold text-[#EF4444]"
          >
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
