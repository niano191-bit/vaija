import { categoryQuotes, err, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const url = new URL(req.url);
  const distanceKm = Number(url.searchParams.get("distanceKm") || 5);
  return json(categoryQuotes(distanceKm));
}
