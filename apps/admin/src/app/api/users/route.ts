import { err, getServiceClient, getUserFromAuthHeader, json, mapProfile } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "admin") return err("Apenas admin", 403);
  const supabase = getServiceClient();
  const { data } = await supabase.from("profiles").select("*").neq("role", "admin");
  return json((data || []).map(mapProfile));
}
