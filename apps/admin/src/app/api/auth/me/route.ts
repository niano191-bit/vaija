import { err, getServiceClient, getUserFromAuthHeader, json, mapProfile } from "@/lib/supabase";

export async function GET(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  return json(mapProfile(auth.profile));
}

export async function PATCH(req: Request) {
  const auth = await getUserFromAuthHeader(req);
  if (!auth) return err("Não autorizado", 401);
  const body = await req.json().catch(() => ({}));
  const patch: Record<string, string> = {};
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.phone === "string" && body.phone.trim()) patch.phone = body.phone.trim();
  if (!Object.keys(patch).length) return err("Nada para atualizar", 400);

  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", auth.profile.id)
    .select("*")
    .single();
  if (error || !data) return err(error?.message || "Falha ao atualizar", 500);
  return json(mapProfile(data));
}
