import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();
  const { data } = await supabase.from("coupons").select("*").eq("active", true);
  return json(
    (data || []).map((c: any) => ({
      id: c.id,
      code: c.code,
      description: c.description,
      discountPercent: c.discount_percent,
      expiresAt: c.expires_at,
      active: c.active,
    }))
  );
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
  return json({
    id: data.id,
    code: data.code,
    description: data.description,
    discountPercent: data.discount_percent,
    expiresAt: data.expires_at,
    active: data.active,
  });
}
