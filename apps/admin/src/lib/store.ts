import { create } from "zustand";
import { api, type User } from "@vaija/shared";

type AdminState = {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hydrate: () => void;
};

export const useAdminAuth = create<AdminState>((set) => ({
  token: null,
  user: null,
  hydrate: () => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("vaija_admin");
    if (raw) {
      const data = JSON.parse(raw);
      set({ token: data.token, user: data.user });
    }
  },
  login: async (email, password) => {
    const res = await api.login(email, password);
    if (res.user.role !== "admin") {
      throw new Error("Acesso apenas para administradores");
    }
    localStorage.setItem("vaija_admin", JSON.stringify({ token: res.token, user: res.user }));
    set({ token: res.token, user: res.user });
  },
  logout: () => {
    localStorage.removeItem("vaija_admin");
    set({ token: null, user: null });
  },
}));
