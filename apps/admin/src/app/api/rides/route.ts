import { enrichRide, err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();
  const url = new URL(req.url);
  const mine = url.searchParams.get("mine") === "1";
  const status = url.searchParams.get("status");

  let q = supabase.from("rides").select("*").order("created_at", { ascending: false });
  if (mine) {
    if (auth.profile.role === "cliente") q = q.eq("client_id", auth.profile.id);
    else if (auth.profile.role === "motorista") q = q.eq("driver_id", auth.profile.id);
  }
  if (status) q = q.in("status", status.split(","));

  const { data, error } = await q;
  if (error) return err(error.message, 500);
  const enriched = await Promise.all((data || []).map((r) => enrichRide(supabase, r)));
  return json(enriched);
}

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "cliente") return err("Apenas clientes", 403);

  const supabase = getServiceClient();
  const { data: active } = await supabase
    .from("rides")
    .select("id")
    .eq("client_id", auth.profile.id)
    .not("status", "in", "(concluida,cancelada)")
    .limit(1);

  if (active && active.length) return err("Você já tem uma corrida ativa");

  const body = await req.json();
  const origin = body.origin;
  const destination = body.destination;
  const category = body.category || "economico";

  const { categoryQuotes } = await import("@/lib/supabase");
  const quotes = categoryQuotes(5);
  const quote = quotes.find((c) => c.id === category) || quotes[0];
  let price = quote.price;
  let couponCode: string | undefined;

  if (body.couponCode) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", String(body.couponCode).toUpperCase())
      .eq("active", true)
      .maybeSingle();
    if (coupon) {
      price = +(price * (1 - coupon.discount_percent / 100)).toFixed(2);
      couponCode = coupon.code;
    }
  }

  const serviceFee = 2.5;
  const { data: method } = await supabase
    .from("payment_methods")
    .select("label")
    .eq("user_id", auth.profile.id)
    .eq("selected", true)
    .maybeSingle();

  const { data: ride, error } = await supabase
    .from("rides")
    .insert({
      client_id: auth.profile.id,
      status: "solicitada",
      origin_label: origin.label,
      origin_address: origin.address,
      origin_lat: origin.lat,
      origin_lng: origin.lng,
      destination_label: destination.label,
      destination_address: destination.address,
      destination_lat: destination.lat,
      destination_lng: destination.lng,
      category,
      price,
      service_fee: serviceFee,
      total: +(price + serviceFee).toFixed(2),
      payment_method: body.paymentMethod || method?.label || "PIX",
      coupon_code: couponCode,
      eta_min: quote.etaMin,
      distance_km: 4.2,
    })
    .select("*")
    .single();

  if (error || !ride) return err(error?.message || "Falha ao criar corrida", 500);
  return json(await enrichRide(supabase, ride), 201);
}
