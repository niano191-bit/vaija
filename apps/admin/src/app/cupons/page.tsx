"use client";

import { FormEvent, useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, type Coupon } from "@vaija/shared";

export default function CuponsPage() {
  const token = useAdminAuth((s) => s.token);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [pct, setPct] = useState(10);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    api
      .getCoupons(token)
      .then(setCoupons)
      .catch((e: any) => setError(e.message || "Falha ao carregar cupons"));
  };

  useEffect(() => {
    load();
  }, [token]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.createCoupon(token!, {
        code: code.trim().toUpperCase(),
        description: desc,
        discountPercent: pct,
      });
      setCode("");
      setDesc("");
      setPct(10);
      load();
    } catch (err: any) {
      setError(err.message || "Falha ao criar cupom");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (c: Coupon) => {
    setToggling(c.id);
    setError("");
    try {
      await api.updateCoupon(token!, { id: c.id, active: !c.active });
      load();
    } catch (err: any) {
      setError(err.message || "Falha ao atualizar cupom");
    } finally {
      setToggling(null);
    }
  };

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-2">Cupons</h1>
      <p className="text-sm text-gray-500 mb-6">Crie códigos promocionais para o app cliente</p>

      <form
        onSubmit={onCreate}
        className="bg-white rounded-2xl p-5 border mb-6 grid md:grid-cols-4 gap-3 items-end"
      >
        <div>
          <label className="text-xs font-semibold text-gray-500">Código</label>
          <input
            className="w-full h-10 rounded-lg border px-3 mt-1 uppercase"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Descrição</label>
          <input className="w-full h-10 rounded-lg border px-3 mt-1" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">% desconto</label>
          <input
            type="number"
            min={1}
            max={100}
            className="w-full h-10 rounded-lg border px-3 mt-1"
            value={pct}
            onChange={(e) => setPct(Number(e.target.value))}
          />
        </div>
        <button disabled={saving} className="h-10 rounded-xl bg-[#FFC107] font-bold text-[#0B1F3A] disabled:opacity-60">
          {saving ? "Salvando…" : "Criar"}
        </button>
      </form>
      {error ? <p className="text-red-500 text-sm mb-4">{error}</p> : null}

      <div className="grid gap-3">
        {coupons.length === 0 ? (
          <div className="bg-white rounded-xl p-4 border text-gray-500">Nenhum cupom ainda.</div>
        ) : (
          coupons.map((c) => (
            <div key={c.id} className="bg-white rounded-xl p-4 border flex justify-between items-center gap-3">
              <div>
                <p className="font-extrabold text-lg">{c.code}</p>
                <p className="text-sm text-gray-500">{c.description || "Sem descrição"}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-2">
                <p className="font-bold text-[#1E88E5]">{c.discountPercent}% OFF</p>
                <button
                  disabled={toggling === c.id}
                  onClick={() => toggle(c)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border ${
                    c.active ? "text-green-700 border-green-200 bg-green-50" : "text-gray-500 border-gray-200 bg-gray-50"
                  }`}
                >
                  {toggling === c.id ? "…" : c.active ? "Ativo · desativar" : "Inativo · ativar"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Guard>
  );
}
