function readEnv(key: string): string | undefined {
  try {
    return typeof process !== "undefined" ? process.env?.[key] : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Base da API REST.
 * - Produção mobile: EXPO_PUBLIC_API_URL=https://seu-app.vercel.app/api
 * - Admin no browser: NEXT_PUBLIC_API_URL=https://seu-app.vercel.app/api (ou /api relativo)
 * - Dev local Next: http://localhost:3000/api
 * - Dev mock Express legado: http://localhost:4000
 */
const raw =
  readEnv("EXPO_PUBLIC_API_URL") ||
  readEnv("NEXT_PUBLIC_API_URL") ||
  (typeof window !== "undefined" ? "/api" : "http://localhost:3000/api");

export const API_BASE_URL = raw.replace(/\/$/, "");
