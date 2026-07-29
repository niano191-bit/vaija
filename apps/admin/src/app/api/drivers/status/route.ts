import { err, getServiceClient, getUserFromAuthHeader, json, mapDriver } from "@/lib/supabase";

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "motorista") return err("Apenas motorista", 403);
  const { online, lat, lng } = await req.json();
  const supabase = getServiceClient();
  const patch: Record<string, unknown> = { online: Boolean(online) };
  if (typeof lat === "number" && typeof lng === "number") {
    patch.lat = lat;
    patch.lng = lng;
  } else if (online) {
    // slight jitter so the admin map moves when going online without GPS
    patch.lat = -23.55 + (Math.random() - 0.5) * 0.04;
    patch.lng = -46.63 + (Math.random() - 0.5) * 0.04;
  }
  const { data, error } = await supabase
    .from("drivers")
    .update(patch)
    .eq("user_id", auth.profile.id)
    .select("*")
    .single();
  if (error || !data) return err(error?.message || "Falha", 500);
  return json(mapDriver(data));
}
