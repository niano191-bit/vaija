import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();
  const { data } = await supabase.from("favorites").select("*").eq("user_id", auth.profile.id);
  return json(
    (data || []).map((f: any) => ({
      id: f.id,
      userId: f.user_id,
      place: {
        id: f.place_id || f.id,
        label: f.label,
        address: f.address,
        lat: Number(f.lat),
        lng: Number(f.lng),
        icon: f.icon || undefined,
      },
    }))
  );
}

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const place = await req.json();
  const supabase = getServiceClient();
  let placeId: string | null = null;
  if (place.id) {
    const { data: known } = await supabase.from("places").select("id").eq("id", place.id).maybeSingle();
    if (known) placeId = known.id;
  }
  const { data, error } = await supabase
    .from("favorites")
    .insert({
      user_id: auth.profile.id,
      place_id: placeId,
      label: place.label,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      icon: place.icon || null,
    })
    .select("*")
    .single();
  if (error || !data) return err(error?.message || "Falha", 500);
  return json({
    id: data.id,
    userId: data.user_id,
    place: {
      id: data.place_id || data.id,
      label: data.label,
      address: data.address,
      lat: Number(data.lat),
      lng: Number(data.lng),
      icon: data.icon || undefined,
    },
  });
}
