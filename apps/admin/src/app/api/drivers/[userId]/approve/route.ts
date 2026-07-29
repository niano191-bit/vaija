import { err, getServiceClient, getUserFromAuthHeader, json, mapDriver } from "@/lib/supabase";

type Ctx = { params: Promise<{ userId: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "admin") return err("Apenas admin", 403);
  const { userId } = await ctx.params;
  const { approved } = await req.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("drivers")
    .update({ documents_approved: Boolean(approved) })
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error || !data) return err(error?.message || "Não encontrado", 404);
  return json(mapDriver(data));
}
