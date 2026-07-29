import { err, getServiceClient, getUserFromAuthHeader, json, mapProfile } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "admin") return err("Apenas admin", 403);
  const { id } = await ctx.params;
  const { blocked } = await req.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ blocked: Boolean(blocked) })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return err("Não encontrado", 404);
  return json(mapProfile(data));
}
