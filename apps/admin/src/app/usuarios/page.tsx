"use client";

import { useEffect, useMemo, useState } from "react";
import { Guard } from "@/components/Guard";
import { useAdminAuth } from "@/lib/store";
import { api, type User } from "@vaija/shared";

export default function UsuariosPage() {
  const token = useAdminAuth((s) => s.token);
  const [users, setUsers] = useState<User[]>([]);
  const [q, setQ] = useState("");

  const load = () => token && api.getUsers(token).then(setUsers).catch(() => {});

  useEffect(() => {
    load();
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [token]);

  const visible = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term),
    );
  }, [users, q]);

  return (
    <Guard>
      <h1 className="text-2xl font-extrabold mb-2">Usuários</h1>
      <p className="text-sm text-gray-500 mb-4">{users.length} cadastrado(s)</p>

      <input
        className="w-full max-w-md h-10 rounded-xl border px-3 mb-4"
        placeholder="Buscar por nome, e-mail ou papel…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

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
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-500">
                  Nenhum usuário encontrado.
                </td>
              </tr>
            ) : (
              visible.map((u) => (
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </Guard>
  );
}
