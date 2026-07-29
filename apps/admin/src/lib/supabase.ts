import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function getServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getAnonClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error("Missing Supabase anon credentials");
  }
  return createClient(url, key);
}

export async function getUserFromAuthHeader(req: Request) {
  const header = req.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  if (!token) return null;

  const supabase = getServiceClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.blocked) return null;
  return { token, user: data.user, profile };
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function err(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function mapProfile(p: any) {
  return {
    id: p.id,
    name: p.name,
    email: p.email,
    phone: p.phone || "",
    role: p.role,
    avatar: p.avatar || undefined,
    blocked: p.blocked,
    referralCode: p.referral_code || undefined,
    rating: p.rating != null ? Number(p.rating) : undefined,
  };
}

export function mapDriver(d: any) {
  return {
    userId: d.user_id,
    online: d.online,
    vehicle: {
      model: d.vehicle_model,
      color: d.vehicle_color,
      plate: d.vehicle_plate,
    },
    documentsApproved: d.documents_approved,
    earningsToday: Number(d.earnings_today || 0),
    earningsWeek: Number(d.earnings_week || 0),
    lat: Number(d.lat),
    lng: Number(d.lng),
  };
}

export function mapRide(r: any, extra: any = {}) {
  return {
    id: r.id,
    clientId: r.client_id,
    driverId: r.driver_id || undefined,
    status: r.status,
    origin: {
      id: "origin",
      label: r.origin_label,
      address: r.origin_address,
      lat: Number(r.origin_lat),
      lng: Number(r.origin_lng),
    },
    destination: {
      id: "destination",
      label: r.destination_label,
      address: r.destination_address,
      lat: Number(r.destination_lat),
      lng: Number(r.destination_lng),
    },
    category: r.category,
    price: Number(r.price),
    serviceFee: Number(r.service_fee),
    total: Number(r.total),
    paymentMethod: r.payment_method,
    couponCode: r.coupon_code || undefined,
    etaMin: r.eta_min,
    distanceKm: Number(r.distance_km),
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    rating: r.rating ?? undefined,
    comment: r.comment || undefined,
    ...extra,
  };
}

export function categoryQuotes(distanceKm = 5) {
  const base = Math.max(8, distanceKm * 3.2);
  return [
    { id: "economico", name: "Econômico", capacity: 4, price: +(base * 1).toFixed(2), etaMin: 3, icon: "car" },
    { id: "comfort", name: "Comfort", capacity: 4, price: +(base * 1.35).toFixed(2), etaMin: 4, icon: "car" },
    { id: "suv", name: "SUV", capacity: 6, price: +(base * 1.75).toFixed(2), etaMin: 6, icon: "suv" },
    { id: "moto", name: "Moto", capacity: 1, price: +(base * 0.7).toFixed(2), etaMin: 2, icon: "moto" },
  ];
}

export async function enrichRide(supabase: SupabaseClient, ride: any) {
  const [{ data: client }, { data: driverProfile }, { data: driverUser }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", ride.client_id).maybeSingle(),
    ride.driver_id
      ? supabase.from("drivers").select("*").eq("user_id", ride.driver_id).maybeSingle()
      : Promise.resolve({ data: null }),
    ride.driver_id
      ? supabase.from("profiles").select("name,rating").eq("id", ride.driver_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return mapRide(ride, {
    clientName: client?.name,
    driverName: driverUser?.name,
    driverRating: driverUser?.rating != null ? Number(driverUser.rating) : undefined,
    vehicle: driverProfile
      ? {
          model: driverProfile.vehicle_model,
          color: driverProfile.vehicle_color,
          plate: driverProfile.vehicle_plate,
        }
      : undefined,
  });
}
