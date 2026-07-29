import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();
  let q = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
  if (auth.profile.role !== "admin") q = q.eq("user_id", auth.profile.id);
  const { data } = await q;
  return json(
    (data || []).map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      userName: t.user_name,
      category: t.category,
      subject: t.subject,
      message: t.message,
      status: t.status,
      createdAt: t.created_at,
    }))
  );
}

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const body = await req.json();
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      user_id: auth.profile.id,
      user_name: auth.profile.name,
      category: body.category || "Geral",
      subject: body.subject || "Ajuda",
      message: body.message || "",
      status: "aberto",
    })
    .select("*")
    .single();
  if (error || !data) return err(error?.message || "Falha", 500);
  return json(
    {
      id: data.id,
      userId: data.user_id,
      userName: data.user_name,
      category: data.category,
      subject: data.subject,
      message: data.message,
      status: data.status,
      createdAt: data.created_at,
    },
    201
  );
}
