import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

function subjectFor(rideId: string) {
  return `ride:${rideId}`;
}

function mapMsg(t: any, rideId: string) {
  return {
    id: t.id,
    rideId,
    fromUserId: t.user_id,
    fromName: t.user_name,
    text: t.message,
    createdAt: t.created_at,
  };
}

export async function GET(req: Request, ctx: Ctx) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const { id } = await ctx.params;
  const supabase = getServiceClient();

  const { data: ride } = await supabase.from("rides").select("id, client_id, driver_id").eq("id", id).maybeSingle();
  if (!ride) return err("Corrida não encontrada", 404);
  if (
    auth.profile.role !== "admin" &&
    auth.profile.id !== ride.client_id &&
    auth.profile.id !== ride.driver_id
  ) {
    return err("Não autorizado", 403);
  }

  const { data } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("category", "Chat")
    .eq("subject", subjectFor(id))
    .order("created_at", { ascending: true });

  return json((data || []).map((t: any) => mapMsg(t, id)));
}

export async function POST(req: Request, ctx: Ctx) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const { id } = await ctx.params;
  const body = await req.json();
  const text = String(body.text || "").trim();
  if (!text) return err("Mensagem vazia");

  const supabase = getServiceClient();
  const { data: ride } = await supabase.from("rides").select("id, client_id, driver_id, status").eq("id", id).maybeSingle();
  if (!ride) return err("Corrida não encontrada", 404);
  if (auth.profile.id !== ride.client_id && auth.profile.id !== ride.driver_id) {
    return err("Não autorizado", 403);
  }
  if (["concluida", "cancelada"].includes(ride.status)) {
    return err("Corrida encerrada");
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: auth.profile.id,
      user_name: auth.profile.name,
      category: "Chat",
      subject: subjectFor(id),
      message: text.slice(0, 280),
      status: "aberto",
    })
    .select("*")
    .single();

  if (error || !data) return err(error?.message || "Falha ao enviar", 500);
  return json(mapMsg(data, id), 201);
}
