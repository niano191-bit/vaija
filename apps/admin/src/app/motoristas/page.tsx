"use client";

import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api } from "@vaija/shared";

export default function MotoristasPage() {
  const token = useAdminAuth((s) => s.token);
  const [drivers, setDrivers] = useState<any[]>([]);

  const load = () => token && api.getDrivers(token).then(setDrivers);

  useEffect(() => {
    load();
  }, [token]);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-6">Motoristas</h1>
      <div className="grid gap-3">
        {drivers.map((d) => (
          <div key={d.userId} className="bg-white rounded-2xl p-5 border flex items-center justify-between">
            <div>
              <p className="font-bold text-lg">{d.user?.name}</p>
              <p className="text-sm text-gray-500">
                {d.vehicle.model} · {d.vehicle.plate} · {d.online ? "Online" : "Offline"}
              </p>
              <p className="text-sm mt-1">
                Docs:{" "}
                <span className={d.documentsApproved ? "text-green-600" : "text-amber-600"}>
                  {d.documentsApproved ? "Aprovados" : "Pendentes"}
                </span>
              </p>
            </div>
            <button
              className="px-4 py-2 rounded-xl bg-[#FFC107] font-bold text-[#0B1F3A]"
              onClick={async () => {
                await api.approveDriver(token!, d.userId, !d.documentsApproved);
                load();
              }}
            >
              {d.documentsApproved ? "Revogar docs" : "Aprovar docs"}
            </button>
          </div>
        ))}
      </div>
    </Guard>
  );
}
