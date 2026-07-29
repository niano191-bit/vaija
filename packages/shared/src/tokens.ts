export const colors = {
  navy: "#0B1F3A",
  yellow: "#FFC107",
  blue: "#1E88E5",
  green: "#22C55E",
  gray: "#F3F4F6",
  white: "#FFFFFF",
  text: "#0B1F3A",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  danger: "#EF4444",
  success: "#22C55E",
} as const;

export const brand = {
  name: "vaijá",
  tagline: "mobilidade para sua vida.",
  splashTagline: "Mais rápido, mais seguro, mais você.",
} as const;

/**
 * Base da API REST.
 * Expo only inlines static `process.env.EXPO_PUBLIC_*` (no dynamic lookup).
 * - Produção mobile: EXPO_PUBLIC_API_URL=https://vaija-admin.vercel.app/api
 * - Admin no browser: NEXT_PUBLIC_API_URL=/api
 * - Dev local Next: http://localhost:3000/api
 */
const raw =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:3000/api");

export const API_BASE_URL = String(raw).replace(/\/$/, "");
