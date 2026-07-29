import { enrichRide, err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();

  if (auth.profile.role === "motorista") {
    const { data } = await supabase
      .from("rides")
      .select("*")
      .eq("status", "solicitada")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return json(data ? await enrichRide(supabase, data) : null);
  }

  const { data } = await supabase
    .from("rides")
    .select("*")
    .eq("client_id", auth.profile.id)
    .not("status", "in", "(concluida,cancelada)")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return json(data ? await enrichRide(supabase, data) : null);
}
