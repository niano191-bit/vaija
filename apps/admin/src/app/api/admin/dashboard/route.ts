import { err, getServiceClient, getUserFromAuthHeader, json } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "admin") return err("Apenas admin", 403);
  const supabase = getServiceClient();

  const activeStatuses = ["solicitada", "aceita", "a_caminho", "em_andamento"];
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [
    { count: activeRides },
    { data: taxas },
    { count: driversOnline },
    { count: openSos },
    { count: openTickets },
    { count: totalClients },
    { count: totalDrivers },
  ] = await Promise.all([
    supabase.from("rides").select("*", { count: "exact", head: true }).in("status", activeStatuses),
    supabase
      .from("transactions")
      .select("amount")
      .eq("type", "taxa")
      .gte("created_at", startOfDay.toISOString()),
    supabase.from("drivers").select("*", { count: "exact", head: true }).eq("online", true),
    supabase.from("sos_alerts").select("*", { count: "exact", head: true }).eq("status", "aberto"),
    supabase.from("support_tickets").select("*", { count: "exact", head: true }).neq("status", "resolvido"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "cliente"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "motorista"),
  ]);

  const revenueToday = (taxas || []).reduce((s, t) => s + Number(t.amount), 0);

  return json({
    activeRides: activeRides || 0,
    revenueToday: +revenueToday.toFixed(2),
    driversOnline: driversOnline || 0,
    openSos: openSos || 0,
    openTickets: openTickets || 0,
    totalClients: totalClients || 0,
    totalDrivers: totalDrivers || 0,
  });
}
