import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const { code } = await req.json();
  const supabase = getServiceClient();
  const { data } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", String(code || "").toUpperCase())
    .eq("active", true)
    .maybeSingle();
  if (!data) return err("Cupom inválido", 404);
  return json({
    id: data.id,
    code: data.code,
    description: data.description,
    discountPercent: data.discount_percent,
    expiresAt: data.expires_at,
    active: data.active,
  });
}
