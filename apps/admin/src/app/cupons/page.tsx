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

  const load = () => token && api.getCoupons(token).then(setCoupons);

  useEffect(() => {
    load();
  }, [token]);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    await api.createCoupon(token!, { code, description: desc, discountPercent: pct });
    setCode("");
    setDesc("");
    load();
  };

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-6">Cupons</h1>
      <form onSubmit={onCreate} className="bg-white rounded-2xl p-5 border mb-6 grid md:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs font-semibold text-gray-500">Código</label>
          <input className="w-full h-10 rounded-lg border px-3 mt-1" value={code} onChange={(e) => setCode(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">Descrição</label>
          <input className="w-full h-10 rounded-lg border px-3 mt-1" value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500">% desconto</label>
          <input type="number" className="w-full h-10 rounded-lg border px-3 mt-1" value={pct} onChange={(e) => setPct(Number(e.target.value))} />
        </div>
        <button className="h-10 rounded-xl bg-[#FFC107] font-bold text-[#0B1F3A]">Criar</button>
      </form>
      <div className="grid gap-3">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white rounded-xl p-4 border flex justify-between">
            <div>
              <p className="font-extrabold text-lg">{c.code}</p>
              <p className="text-sm text-gray-500">{c.description}</p>
            </div>
            <p className="font-bold text-[#1E88E5]">{c.discountPercent}% OFF</p>
          </div>
        ))}
      </div>
    </Guard>
  );
}
