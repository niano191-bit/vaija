import { err, getServiceClient, getUserFromAuthHeader, json, mapDriver } from "@/lib/supabase";

/** Demo: motorista marca documentos como enviados e abre ticket para o admin. */
export async function POST(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  if (auth.profile.role !== "motorista") return err("Apenas motoristas", 403);

  const body = await req.json().catch(() => ({}));
  const docs = Array.isArray(body.docs) ? body.docs.map(String) : [];
  const supabase = getServiceClient();

  const { data: driver, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("user_id", auth.profile.id)
    .maybeSingle();
  if (error || !driver) return err(error?.message || "Perfil de motorista não encontrado", 404);

  // Keep approved status; submission only notifies admin when still pending.
  if (!driver.documents_approved) {
    await supabase.from("support_tickets").insert({
      user_id: auth.profile.id,
      user_name: auth.profile.name,
      category: "Documentos",
      subject: "Documentos enviados para análise",
      message:
        docs.length > 0
          ? `Motorista enviou: ${docs.join(", ")}. Aguardando aprovação no painel.`
          : "Motorista enviou documentos para análise. Aguardando aprovação no painel.",
      status: "aberto",
    });
  }

  return json({
    driver: mapDriver(driver),
    submitted: true,
    alreadyApproved: Boolean(driver.documents_approved),
  });
}
