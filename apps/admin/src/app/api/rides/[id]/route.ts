import { enrichRide, err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const { id } = await ctx.params;
  const supabase = getServiceClient();
  const { data, error } = await supabase.from("rides").select("*").eq("id", id).maybeSingle();
  if (error || !data) return err("Corrida não encontrada", 404);
  return json(await enrichRide(supabase, data));
}

export async function PATCH(req: Request, ctx: Ctx) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const { id } = await ctx.params;
  const body = await req.json();
  const supabase = getServiceClient();

  const { data: ride, error } = await supabase.from("rides").select("*").eq("id", id).maybeSingle();
  if (error || !ride) return err("Corrida não encontrada", 404);

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  const status = body.status;

  if (status === "aceita") {
    if (auth.profile.role !== "motorista") return err("Apenas motorista", 403);
    if (ride.status !== "solicitada") return err("Corrida indisponível");
    patch.status = "aceita";
    patch.driver_id = auth.profile.id;
  } else if (status === "a_caminho" || status === "em_andamento") {
    if (auth.profile.id !== ride.driver_id) return err("Não autorizado", 403);
    patch.status = status;
  } else if (status === "concluida") {
    if (auth.profile.id !== ride.driver_id && auth.profile.role !== "admin") {
      return err("Não autorizado", 403);
    }
    if (ride.status === "concluida") {
      // already settled — only allow rating/comment updates below
    } else {
    patch.status = "concluida";
    const driverEarn = +(Number(ride.price) * 0.8).toFixed(2);
    const total = Number(ride.total);

    if (ride.driver_id) {
      const { data: driver } = await supabase.from("drivers").select("*").eq("user_id", ride.driver_id).single();
      if (driver) {
        await supabase
          .from("drivers")
          .update({
            earnings_today: Number(driver.earnings_today) + driverEarn,
            earnings_week: Number(driver.earnings_week) + driverEarn,
          })
          .eq("user_id", ride.driver_id);
      }
      const { data: wallet } = await supabase.from("wallets").select("*").eq("user_id", ride.driver_id).single();
      if (wallet) {
        await supabase
          .from("wallets")
          .update({ balance: Number(wallet.balance) + driverEarn })
          .eq("user_id", ride.driver_id);
      }
      await supabase.from("transactions").insert([
        {
          ride_id: ride.id,
          user_id: ride.client_id,
          type: "corrida",
          amount: -total,
          description: `Corrida até ${ride.destination_label}`,
        },
        {
          ride_id: ride.id,
          user_id: ride.driver_id,
          type: "credito",
          amount: driverEarn,
          description: `Ganho — ${ride.destination_label}`,
        },
        {
          ride_id: ride.id,
          user_id: auth.profile.role === "admin" ? auth.profile.id : ride.driver_id,
          type: "taxa",
          amount: Number(ride.service_fee) + +(Number(ride.price) * 0.2).toFixed(2),
          description: "Taxa plataforma",
        },
      ]);
    }

    // Debit client wallet balance for demo (all payment methods use the app wallet ledger)
    const { data: clientWallet } = await supabase
      .from("wallets")
      .select("*")
      .eq("user_id", ride.client_id)
      .maybeSingle();
    if (clientWallet) {
      const nextBal = Math.max(0, +(Number(clientWallet.balance) - total).toFixed(2));
      await supabase.from("wallets").update({ balance: nextBal }).eq("user_id", ride.client_id);
    }
    }
  } else if (status === "cancelada") {
    if (
      auth.profile.id !== ride.client_id &&
      auth.profile.id !== ride.driver_id &&
      auth.profile.role !== "admin"
    ) {
      return err("Não autorizado", 403);
    }
    patch.status = "cancelada";
  }

  if (typeof body.rating === "number") {
    patch.rating = body.rating;
    patch.comment = body.comment || null;

    const driverId = ride.driver_id;
    if (driverId) {
      const { data: allRated } = await supabase
        .from("rides")
        .select("id, rating")
        .eq("driver_id", driverId)
        .not("rating", "is", null);
      const byId = new Map((allRated || []).map((r: any) => [r.id, Number(r.rating)]));
      byId.set(id, Number(body.rating));
      const vals = [...byId.values()].filter((n) => n > 0);
      if (vals.length) {
        const avg = +(vals.reduce((s, n) => s + n, 0) / vals.length).toFixed(2);
        await supabase.from("profiles").update({ rating: avg }).eq("id", driverId);
      }
    }
  }

  const { data: updated, error: uErr } = await supabase
    .from("rides")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (uErr || !updated) return err(uErr?.message || "Falha ao atualizar", 500);
  return json(await enrichRide(supabase, updated));
}
