import { err, getUserFromAuthHeader, json, mapProfile } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  return json(mapProfile(auth.profile));
}
