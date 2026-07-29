import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

async function mapSos(supabase: ReturnType<typeof getServiceClient>, s: any) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("name,phone")
    .eq("id", s.user_id)
    .maybeSingle();
  return {
    id: s.id,
    userId: s.user_id,
    userName: profile?.name || s.user_name || "Usuário",
    userPhone: profile?.phone || undefined,
    rideId: s.ride_id || undefined,
    status: s.status,
    createdAt: s.created_at,
    lat: Number(s.lat),
    lng: Number(s.lng),
  };
}

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();
  let q = supabase.from("sos_alerts").select("*").order("created_at", { ascending: false });
  if (auth.profile.role !== "admin") q = q.eq("user_id", auth.profile.id);
  const { data, error } = await q;
  if (error) return err(error.message, 500);
  const mapped = await Promise.all((data || []).map((s: any) => mapSos(supabase, s)));
  return json(mapped);
}

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const body = await req.json().catch(() => ({}));
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("sos_alerts")
    .insert({
      user_id: auth.profile.id,
      user_name: auth.profile.name,
      ride_id: body.rideId || null,
      status: "aberto",
      lat: body.lat ?? -23.55,
      lng: body.lng ?? -46.63,
    })
    .select("*")
    .single();
  if (error || !data) return err(error?.message || "Falha", 500);
  return json(await mapSos(supabase, data), 201);
}
