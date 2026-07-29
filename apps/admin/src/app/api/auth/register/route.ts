import { err, getAnonClient, getServiceClient, json, mapDriver, mapProfile } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const phone = String(body.phone || "");
    const password = String(body.password || "");
    const role = body.role === "motorista" ? "motorista" : "cliente";
    const referralCode = String(body.referralCode || body.referral || "")
      .trim()
      .toUpperCase();

    if (!name || !email || !password) return err("Dados incompletos");

    const service = getServiceClient();
    const { data: created, error } = await service.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role },
    });
    if (error || !created.user) return err(error?.message || "Falha no cadastro", 400);

    const referral = `${name.split(" ")[0].toUpperCase()}10`;
    const { error: pErr } = await service.from("profiles").insert({
      id: created.user.id,
      name,
      email,
      phone,
      role,
      referral_code: referral,
      rating: 5,
    });
    if (pErr) return err(pErr.message, 400);

    await service.from("wallets").insert({ user_id: created.user.id, balance: 0 });
    await service.from("payment_methods").insert({
      user_id: created.user.id,
      type: "pix",
      label: "PIX",
      selected: true,
    });

    if (role === "motorista") {
      await service.from("drivers").insert({
        user_id: created.user.id,
        online: false,
        documents_approved: false,
      });
    }

    if (referralCode) {
      const { data: referrer } = await service
        .from("profiles")
        .select("id,name")
        .eq("referral_code", referralCode)
        .maybeSingle();
      if (referrer && referrer.id !== created.user.id) {
        const bonus = 10;
        const { data: refWallet } = await service
          .from("wallets")
          .select("*")
          .eq("user_id", referrer.id)
          .maybeSingle();
        const { data: newWallet } = await service
          .from("wallets")
          .select("*")
          .eq("user_id", created.user.id)
          .maybeSingle();
        if (refWallet) {
          await service
            .from("wallets")
            .update({ balance: Number(refWallet.balance) + bonus })
            .eq("user_id", referrer.id);
        }
        if (newWallet) {
          await service
            .from("wallets")
            .update({ balance: Number(newWallet.balance) + bonus })
            .eq("user_id", created.user.id);
        }
        await service.from("transactions").insert([
          {
            user_id: referrer.id,
            type: "credito",
            amount: bonus,
            description: `Indicação: ${name}`,
          },
          {
            user_id: created.user.id,
            type: "credito",
            amount: bonus,
            description: `Bônus código ${referralCode}`,
          },
        ]);
      }
    }

    const anon = getAnonClient();
    const { data: sessionData, error: sErr } = await anon.auth.signInWithPassword({ email, password });
    if (sErr || !sessionData.session) return err("Conta criada, mas falha ao entrar", 500);

    const { data: profile } = await service.from("profiles").select("*").eq("id", created.user.id).single();
    let driver;
    if (role === "motorista") {
      const { data: d } = await service.from("drivers").select("*").eq("user_id", created.user.id).maybeSingle();
      if (d) driver = mapDriver(d);
    }

    return json({
      token: sessionData.session.access_token,
      user: mapProfile(profile),
      driver,
    });
  } catch (e: any) {
    return err(e.message || "Erro no cadastro", 500);
  }
}
