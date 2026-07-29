"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/store";

export default function Home() {
  const router = useRouter();
  const hydrate = useAdminAuth((s) => s.hydrate);
  const token = useAdminAuth((s) => s.token);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (token) router.replace("/dashboard");
    else router.replace("/login");
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] text-[#FFC107] font-bold">
      Carregando vaijá...
    </div>
  );
}
