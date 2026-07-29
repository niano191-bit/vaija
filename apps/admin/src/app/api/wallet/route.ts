import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

async function walletPayload(supabase: any, userId: string) {
  const [{ data: wallet }, { data: methods }] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("payment_methods").select("*").eq("user_id", userId),
  ]);
  return {
    userId,
    balance: Number(wallet?.balance || 0),
    methods: (methods || []).map((m: any) => ({
      id: m.id,
      type: m.type,
      label: m.label,
      selected: m.selected,
    })),
  };
}

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const supabase = getServiceClient();
  return json(await walletPayload(supabase, auth.profile.id));
}
