# vaijá — App de mobilidade

Monorepo: **Cliente + Motorista** (Expo) · **Admin + API** (Next.js na Vercel) · **Supabase** (Auth + Postgres).

## Deploy (produção)

Siga o guia completo: **[DEPLOY.md](DEPLOY.md)**

## Dev local

1. Configure Supabase (SQL migration + seed) — ver DEPLOY.md
2. Em `apps/admin/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_API_URL=/api
```

3. Em `apps/mobile/.env`:

```
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_NO_METRO_WORKSPACE_ROOT=1
```

4. Rode:

```bash
pnpm install
pnpm admin    # http://localhost:3000  (UI + /api)
pnpm mobile   # Expo
```

> O mock Express (`pnpm mock-api` :4000) ainda existe para demos offline; o caminho oficial é Next API + Supabase.

## Logins demo

| Papel | E-mail | Senha |
|-------|--------|-------|
| Cliente | `lucas@vaija.com` | `123456` |
| Motorista | `carlos@vaija.com` | `123456` |
| Admin | `admin@vaija.com` | `123456` |

## Estrutura

```
apps/mobile      # Expo — Cliente + Motorista
apps/admin       # Next.js — Admin UI + /api/*
packages/shared  # tipos, tokens, cliente HTTP
packages/mock-api# Express legado (opcional)
supabase/        # migrations SQL
```
