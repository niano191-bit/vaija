import { Platform } from "react-native";

async function store() {
  if (Platform.OS === "web") {
    return {
      get: async (k: string) => (typeof sessionStorage !== "undefined" ? sessionStorage.getItem(k) : null),
      set: async (k: string, v: string) => {
        sessionStorage?.setItem(k, v);
      },
    };
  }
  const SecureStore = await import("expo-secure-store");
  return {
    get: (k: string) => SecureStore.getItemAsync(k),
    set: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  };
}

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const s = await store();
    const raw = await s.get(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function saveJson<T>(key: string, value: T): Promise<void> {
  try {
    const s = await store();
    await s.set(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}
