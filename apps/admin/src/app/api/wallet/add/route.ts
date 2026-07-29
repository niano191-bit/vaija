import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const { amount } = await req.json();
  const value = Number(amount || 0);
  const supabase = getServiceClient();
  const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", auth.profile.id).single();
  if (!wallet) return err("Carteira não encontrada", 404);
  await supabase.from("wallets").update({ balance: Number(wallet.balance) + value }).eq("user_id", auth.profile.id);
  await supabase.from("transactions").insert({
    user_id: auth.profile.id,
    type: "credito",
    amount: value,
    description: "Adicionar saldo",
  });
  const [{ data: w }, { data: methods }] = await Promise.all([
    supabase.from("wallets").select("*").eq("user_id", auth.profile.id).single(),
    supabase.from("payment_methods").select("*").eq("user_id", auth.profile.id),
  ]);
  return json({
    userId: auth.profile.id,
    balance: Number(w.balance),
    methods: (methods || []).map((m: any) => ({
      id: m.id,
      type: m.type,
      label: m.label,
      selected: m.selected,
    })),
  });
}
