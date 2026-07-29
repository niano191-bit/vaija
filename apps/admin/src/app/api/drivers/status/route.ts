import { err, getServiceClient, getUserFromAuthHeader, json, mapDriver } from "@/lib/supabase";

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "motorista") return err("Apenas motorista", 403);
  const { online } = await req.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("drivers")
    .update({ online: Boolean(online) })
    .eq("user_id", auth.profile.id)
    .select("*")
    .single();
  if (error || !data) return err(error?.message || "Falha", 500);
  return json(mapDriver(data));
}
