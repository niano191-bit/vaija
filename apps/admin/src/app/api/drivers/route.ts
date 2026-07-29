import { err, getServiceClient, getUserFromAuthHeader, json, mapDriver, mapProfile } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();
  const { data } = await supabase.from("drivers").select("*");
  const list = [];
  for (const d of data || []) {
    const { data: user } = await supabase.from("profiles").select("*").eq("id", d.user_id).single();
    list.push({ ...mapDriver(d), user: mapProfile(user) });
  }
  return json(list);
}
