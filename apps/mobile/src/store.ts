import { create } from "zustand";
import { api, type DriverProfile, type Place, type Ride, type User, type VehicleCategory } from "@vaija/shared";
import { Platform } from "react-native";

/** Web: sessionStorage so cliente and motorista can stay logged in in separate tabs. */
function webStore() {
  return typeof sessionStorage !== "undefined" ? sessionStorage : null;
}

async function storageGet(key: string) {
  if (Platform.OS === "web") {
    return webStore()?.getItem(key) ?? null;
  }
  const SecureStore = await import("expo-secure-store");
  return SecureStore.getItemAsync(key);
}

async function storageSet(key: string, value: string) {
  if (Platform.OS === "web") {
    webStore()?.setItem(key, value);
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.setItemAsync(key, value);
}

async function storageDelete(key: string) {
  if (Platform.OS === "web") {
    webStore()?.removeItem(key);
    return;
  }
  const SecureStore = await import("expo-secure-store");
  await SecureStore.deleteItemAsync(key);
}

type BookingDraft = {
  origin?: Place;
  destination?: Place;
  category?: VehicleCategory;
  couponCode?: string;
  paymentMethod?: string;
};

type AuthState = {
  token: string | null;
  user: User | null;
  driver: DriverProfile | null;
  hydrated: boolean;
  booking: BookingDraft;
  activeRideId: string | null;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<User>;
  register: (data: { name: string; email: string; phone: string; password: string; role?: string }) => Promise<User>;
  logout: () => Promise<void>;
  setBooking: (partial: BookingDraft) => void;
  clearBooking: () => void;
  setActiveRideId: (id: string | null) => Promise<void> | void;
  setDriver: (driver: DriverProfile | null) => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  driver: null,
  hydrated: false,
  booking: {},
  activeRideId: null,

  hydrate: async () => {
    try {
      const raw = await storageGet("vaija_session");
      if (raw) {
        const data = JSON.parse(raw);
        set({
          token: data.token,
          user: data.user,
          driver: data.driver || null,
          activeRideId: data.activeRideId || null,
        });
      }
    } finally {
      set({ hydrated: true });
    }
  },

  login: async (email, password) => {
    const res = await api.login(email, password);
    await storageSet(
      "vaija_session",
      JSON.stringify({ token: res.token, user: res.user, driver: res.driver })
    );
    set({ token: res.token, user: res.user, driver: res.driver || null });
    return res.user;
  },

  register: async (data) => {
    const res = await api.register(data);
    await storageSet(
      "vaija_session",
      JSON.stringify({ token: res.token, user: res.user, driver: res.driver })
    );
    set({ token: res.token, user: res.user, driver: res.driver || null });
    return res.user;
  },

  logout: async () => {
    await storageDelete("vaija_session");
    set({ token: null, user: null, driver: null, booking: {}, activeRideId: null });
  },

  setBooking: (partial) => set({ booking: { ...get().booking, ...partial } }),
  clearBooking: () => set({ booking: {} }),
  setActiveRideId: async (id) => {
    set({ activeRideId: id });
    const { token, user, driver } = get();
    if (token && user) {
      await storageSet(
        "vaija_session",
        JSON.stringify({ token, user, driver, activeRideId: id })
      );
    }
  },
  setDriver: (driver) => set({ driver }),
}));
