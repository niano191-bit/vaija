import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "admin") return err("Apenas admin", 403);
  const { id } = await ctx.params;
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("sos_alerts")
    .update({ status: "atendido" })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return err("Não encontrado", 404);
  return json({
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    rideId: data.ride_id || undefined,
    status: data.status,
    createdAt: data.created_at,
    lat: Number(data.lat),
    lng: Number(data.lng),
  });
}
