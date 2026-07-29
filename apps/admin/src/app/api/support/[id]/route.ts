import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "admin") return err("Apenas admin", 403);
  const { id } = await ctx.params;
  const { status } = await req.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  if (error || !data) return err("Não encontrado", 404);
  return json({
    id: data.id,
    userId: data.user_id,
    userName: data.user_name,
    category: data.category,
    subject: data.subject,
    message: data.message,
    status: data.status,
    createdAt: data.created_at,
  });
}
