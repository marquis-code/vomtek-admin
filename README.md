# Vomtek Studio

The internal operations application for Vomtek: pipeline, content, catalogue,
media, plans, settings, team and audit. Built as a separate Nuxt 3 SPA so it can
be hosted independently from the public website.

## Run

```bash
pnpm install
cp .env.example .env
pnpm dev          # http://localhost:3110
```

Requires the Vomtek API. Set `NUXT_PUBLIC_API_BASE` to the API's `/api` URL.

```bash
pnpm build
pnpm start
```

## Environment

| Variable | Default | Notes |
|---|---|---|
| `NUXT_PUBLIC_API_BASE` | `http://localhost:4010/api` | API base |
| `NUXT_PUBLIC_SITE_URL` | `http://localhost:3010` | Public site used for media previews |

## Access

The API seeds an owner account on first boot. Set `ADMIN_EMAIL` and
`ADMIN_PASSWORD` in the API environment before production. Roles:

- `owner` / `admin` — full access
- `sales` — quotes, messages, catalogue, subscribers
- `ops` — jobs, applications, operations
- `viewer` — read-only dashboards

Authentication uses a short-lived Bearer token plus an HttpOnly refresh cookie.
The SPA is client-only; all authorisation is enforced by the API.

## Features

Dashboard, quotes, messages, applications, jobs, field notes, standard systems,
media, subscribers, analytics, site settings (company, hero, carousel, plans,
quote rules, notifications, divisions, services, SEO, integrations, raw JSON),
team management, account security and audit log.

## Verification

```bash
pnpm typecheck
pnpm build
```
