import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const { methodId } = await req.json();
  const supabase = getServiceClient();
  await supabase.from("payment_methods").update({ selected: false }).eq("user_id", auth.profile.id);
  await supabase.from("payment_methods").update({ selected: true }).eq("id", methodId).eq("user_id", auth.profile.id);

  const [{ data: wallet }, { data: methods }] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", auth.profile.id).maybeSingle(),
    supabase.from("payment_methods").select("*").eq("user_id", auth.profile.id),
  ]);
  return json({
    userId: auth.profile.id,
    balance: Number(wallet?.balance || 0),
    methods: (methods || []).map((m: any) => ({
      id: m.id,
      type: m.type,
      label: m.label,
      selected: m.selected,
    })),
  });
}
