import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

function mapCoupon(c: any) {
  return {
    id: c.id,
    code: c.code,
    description: c.description,
    discountPercent: c.discount_percent,
    expiresAt: c.expires_at,
    active: c.active,
  };
}

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();
  let q = supabase.from("coupons").select("*").order("created_at", { ascending: false });
  if (auth.profile.role !== "admin") q = q.eq("active", true);
  const { data, error } = await q;
  if (error) return err(error.message, 500);
  return json((data || []).map(mapCoupon));
}

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "admin") return err("Apenas admin", 403);
  const body = await req.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("coupons")
    .insert({
      code: String(body.code || "").toUpperCase(),
      description: body.description || "",
      discount_percent: Number(body.discountPercent || 10),
      expires_at: body.expiresAt || "2026-12-31",
      active: true,
    })
    .select("*")
    .single();
  if (error || !data) return err(error?.message || "Falha", 500);
  return json(mapCoupon(data));
}

export async function PATCH(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "admin") return err("Apenas admin", 403);
  const body = await req.json().catch(() => ({}));
  if (!body.id) return err("id obrigatório", 400);
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("coupons")
    .update({ active: Boolean(body.active) })
    .eq("id", body.id)
    .select("*")
    .single();
  if (error || !data) return err(error?.message || "Falha", 500);
  return json(mapCoupon(data));
}
