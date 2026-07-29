"use client";

import { useEffect, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, type User } from "@vaija/shared";

export default function UsuariosPage() {
  const token = useAdminAuth((s) => s.token);
  const [users, setUsers] = useState<User[]>([]);

  const load = () => token && api.getUsers(token).then(setUsers);

  useEffect(() => {
    load();
  }, [token]);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-6">Usuários</h1>
      <div className="bg-white rounded-2xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Nome</th>
              <th className="p-3">E-mail</th>
              <th className="p-3">Papel</th>
              <th className="p-3">Status</th>
              <th className="p-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="p-3 font-semibold">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">{u.blocked ? "Bloqueado" : "Ativo"}</td>
                <td className="p-3">
                  <button
                    className="text-[#1E88E5] font-semibold"
                    onClick={async () => {
                      await api.blockUser(token!, u.id, !u.blocked);
                      load();
                    }}
                  >
                    {u.blocked ? "Desbloquear" : "Bloquear"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Guard>
  );
}
