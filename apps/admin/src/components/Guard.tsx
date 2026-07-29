"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/AdminShell";
import { useAdminAuth } from "@/lib/store";

export function Guard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, hydrate } = useAdminAuth();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setReady(true);
  }, [hydrate]);

  useEffect(() => {
    if (!ready) return;
    if (!token) router.replace("/login");
  }, [ready, token, router]);

  if (!ready || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] text-[#FFC107] font-bold">
        Carregando...
      </div>
    );
  }

  return <AdminShell>{children}</AdminShell>;
}
