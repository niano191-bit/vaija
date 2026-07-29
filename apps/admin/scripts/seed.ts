/**
 * Seed demo users into Supabase Auth + profiles.
 * Usage (from apps/admin):
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm seed
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  {
    email: "lucas@vaija.com",
    password: "123456",
    name: "Lucas Oliveira",
    phone: "(11) 98888-0001",
    role: "cliente" as const,
    referral: "LUCAS10",
    balance: 120.5,
  },
  {
    email: "carlos@vaija.com",
    password: "123456",
    name: "Carlos Silva",
    phone: "(11) 97777-0002",
    role: "motorista" as const,
    referral: "CARLOS10",
    balance: 980,
    driver: {
      model: "Chevrolet Onix",
      color: "Prata",
      plate: "ABC1D23",
      approved: true,
      earningsToday: 186.5,
      earningsWeek: 1240,
    },
  },
  {
    email: "admin@vaija.com",
    password: "123456",
    name: "Admin Vaijá",
    phone: "(11) 90000-0000",
    role: "admin" as const,
    referral: "ADMIN",
    balance: 0,
  },
];

async function ensureUser(u: (typeof USERS)[number]) {
  const { data: listed } = await supabase.auth.admin.listUsers({ perPage: 200 });
  let user = listed?.users?.find((x) => x.email === u.email);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    });
    if (error || !data.user) throw new Error(error?.message || `create ${u.email}`);
    user = data.user;
    console.log("created auth", u.email);
  } else {
    console.log("auth exists", u.email);
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    referral_code: u.referral,
    rating: 4.9,
    blocked: false,
  });

  await supabase.from("wallets").upsert({ user_id: user.id, balance: u.balance });

  const { data: methods } = await supabase.from("payment_methods").select("id").eq("user_id", user.id);
  if (!methods?.length) {
    const rows =
      u.role === "cliente"
        ? [
            { user_id: user.id, type: "pix", label: "PIX", selected: true },
            { user_id: user.id, type: "visa", label: "Visa •••• 4242", selected: false },
            { user_id: user.id, type: "mastercard", label: "Mastercard •••• 8899", selected: false },
          ]
        : [{ user_id: user.id, type: "pix", label: "PIX", selected: true }];
    await supabase.from("payment_methods").insert(rows);
  }

  if (u.role === "motorista" && u.driver) {
    await supabase.from("drivers").upsert({
      user_id: user.id,
      online: false,
      vehicle_model: u.driver.model,
      vehicle_color: u.driver.color,
      vehicle_plate: u.driver.plate,
      documents_approved: u.driver.approved,
      earnings_today: u.driver.earningsToday,
      earnings_week: u.driver.earningsWeek,
      lat: -23.56,
      lng: -46.66,
    });
  }

  if (u.role === "cliente") {
    const { data: favs } = await supabase.from("favorites").select("id").eq("user_id", user.id);
    if (!favs?.length) {
      await supabase.from("favorites").insert([
        {
          user_id: user.id,
          place_id: "p-home",
          label: "Casa",
          address: "Rua das Flores, 120 — Pinheiros",
          lat: -23.5615,
          lng: -46.691,
          icon: "home",
        },
        {
          user_id: user.id,
          place_id: "p-work",
          label: "Trabalho",
          address: "Av. Paulista, 1000 — Bela Vista",
          lat: -23.5614,
          lng: -46.6559,
          icon: "work",
        },
        {
          user_id: user.id,
          place_id: "p-airport",
          label: "Aeroporto",
          address: "Aeroporto de Congonhas — SP",
          lat: -23.6261,
          lng: -46.6566,
          icon: "airport",
        },
      ]);
    }
  }
}

async function main() {
  for (const u of USERS) await ensureUser(u);
  console.log("Seed OK — lucas / carlos / admin @vaija.com (senha 123456)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
