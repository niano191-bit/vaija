# Deploy vaijá — GitHub + Vercel + Supabase

## 1. Supabase

1. Crie/abra o projeto em https://supabase.com/dashboard
2. **SQL Editor** → New query → cole o conteúdo de `supabase/migrations/20260729000000_init.sql` → Run
3. **Project Settings → API** copie:
   - Project URL
   - `anon` `public` key
   - `service_role` key (secret)

4. Seed dos usuários demo (na pasta `apps/admin`):

```bash
$env:SUPABASE_URL="https://XXXX.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="eyJ..."
pnpm seed
```

Logins: `lucas@vaija.com` / `carlos@vaija.com` / `admin@vaija.com` — senha `123456`

## 2. GitHub

Já versionado neste repo. Push:

```bash
git remote add origin https://github.com/SEU_USER/vaija.git
git push -u origin main
```

## 3. Vercel (Admin + API)

1. https://vercel.com/new → Import do repo GitHub
2. **Root Directory:** `apps/admin`
3. Framework: Next.js
4. Environment Variables:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `NEXT_PUBLIC_API_URL` | `https://vaija-admin.vercel.app/api` (ou `/api` no mesmo deploy) |

5. Deploy

CLI (alternativa):

```bash
cd apps/admin
vercel link
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod
```

## 4. Mobile (Expo)

Em `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL=https://vaija-admin.vercel.app/api
EXPO_NO_METRO_WORKSPACE_ROOT=1
```

> Inclua o sufixo `/api`. Sem ele o app chama `/auth/login` em vez de `/api/auth/login`.

Health check: `GET https://vaija-admin.vercel.app/api/health`

### Build APK (celular)

Na pasta `apps/mobile` (conta Expo logada):

```bash
npx eas-cli login
npx eas build -p android --profile preview
```

O perfil `preview` gera um **APK** instalável (veja `eas.json`).

## Arquitetura

```
Mobile / Admin UI  →  Vercel Next.js (/api/*)  →  Supabase (Auth + Postgres)
```
