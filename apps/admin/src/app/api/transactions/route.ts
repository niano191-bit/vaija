import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();
  let q = supabase.from("transactions").select("*").order("created_at", { ascending: false });
  if (auth.profile.role !== "admin") q = q.eq("user_id", auth.profile.id);
  const { data } = await q;
  return json(
    (data || []).map((t: any) => ({
      id: t.id,
      rideId: t.ride_id || undefined,
      userId: t.user_id,
      type: t.type,
      amount: Number(t.amount),
      description: t.description,
      createdAt: t.created_at,
    }))
  );
}
