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

export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const body = await req.json().catch(() => ({}));
  const type = String(body.type || "");
  if (!["pix", "visa", "mastercard"].includes(type)) {
    return err("type deve ser pix, visa ou mastercard", 400);
  }

  const label =
    typeof body.label === "string" && body.label.trim()
      ? body.label.trim()
      : type === "pix"
        ? "PIX"
        : type === "visa"
          ? "Visa •••• 4242"
          : "Mastercard •••• 4444";

  const supabase = getServiceClient();
  const makeSelected = Boolean(body.selected) || type === "pix";

  if (makeSelected) {
    await supabase.from("payment_methods").update({ selected: false }).eq("user_id", auth.profile.id);
  }

  const { error } = await supabase.from("payment_methods").insert({
    user_id: auth.profile.id,
    type,
    label,
    selected: makeSelected,
  });
  if (error) return err(error.message, 500);

  return json(await walletPayload(supabase, auth.profile.id), 201);
}
