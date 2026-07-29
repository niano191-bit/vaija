import { err, getAnonClient, getServiceClient, json, mapDriver, mapProfile } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!email || !password) return err("E-mail ou senha inválidos", 401);

    const anon = getAnonClient();
    const { data, error } = await anon.auth.signInWithPassword({ email, password });
    if (error || !data.session || !data.user) {
      return err("E-mail ou senha inválidos", 401);
    }

    const supabase = getServiceClient();
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
    if (!profile) return err("Perfil não encontrado", 404);
    if (profile.blocked) return err("Conta bloqueada", 403);

    let driver;
    if (profile.role === "motorista") {
      const { data: d } = await supabase.from("drivers").select("*").eq("user_id", profile.id).maybeSingle();
      if (d) driver = mapDriver(d);
    }

    return json({
      token: data.session.access_token,
      user: mapProfile(profile),
      driver,
    });
  } catch (e: any) {
    return err(e.message || "Erro no login", 500);
  }
}
