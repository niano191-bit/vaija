import { json } from "@/lib/supabase";

export async function GET() {
  return json({
    ok: true,
    brand: "vaijá",
    supabase: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL),
  });
}
