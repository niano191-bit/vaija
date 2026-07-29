"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const login = useAdminAuth((s) => s.login);
  const [email, setEmail] = useState("admin@vaija.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B1F3A] p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-extrabold italic text-[#0B1F3A]">
          vai<span className="text-[#FFC107]">já</span>
        </h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Painel administrativo</p>
        {error ? <p className="text-red-500 text-sm mb-3">{error}</p> : null}
        <label className="block text-sm font-semibold text-gray-600 mb-1">E-mail</label>
        <input
          className="w-full mb-4 h-11 rounded-xl border border-gray-200 px-3 bg-gray-50"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="block text-sm font-semibold text-gray-600 mb-1">Senha</label>
        <input
          type="password"
          className="w-full mb-6 h-11 rounded-xl border border-gray-200 px-3 bg-gray-50"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          disabled={loading}
          className="w-full h-12 rounded-xl bg-[#FFC107] text-[#0B1F3A] font-bold"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
