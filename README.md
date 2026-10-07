# ToneAtlas — Guitar Tone Community Platform

Community-driven guitar tone platform. Tones are structured **Tone Recipes**: gear, ordered signal chains, typed parameters, presets, screenshots, audio demos, ratings, tries, feedback, and forks — built so a future AI tone system can train on real data without redesigning the schema.

## Stack

- Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui
- PostgreSQL + Drizzle ORM + Zod
- Better Auth (email/password)
- Local filesystem or S3-compatible object storage (MinIO)
- Vitest + Playwright
- pnpm, Docker Compose

## Quick start (local)

### Prerequisites

- Node 22+, pnpm 10+
- PostgreSQL 16 (`DATABASE_URL`)

```bash
cp .env.example .env
# adjust DATABASE_URL if needed

pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev
```

App: [http://127.0.0.1:43187](http://127.0.0.1:43187)

### Seed accounts

| Email | Password | Role |
| --- | --- | --- |
| `maya@tone.local` | `password123` | user |
| `diego@tone.local` | `password123` | user |
| `priya@tone.local` | `password123` | user |
| `admin@tone.local` | `password123` | admin |

Critical demo path: search **Apocalypse** → Cigarettes After Sex song → **Blackstar bedroom Apocalypse**.

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Dev server on port **43187** |
| `pnpm build` / `pnpm start` | Production |
| `pnpm lint` / `pnpm typecheck` | Quality gates |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright critical journey |
| `pnpm db:generate` | Generate migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Seed realistic catalog |
| `pnpm db:reset` | Drop + recreate public schema |

## Environment

See `.env.example`.

- `STORAGE_DRIVER=local` (default) writes to `.data/uploads`, served at `/api/media/...`
- `STORAGE_DRIVER=s3` uses MinIO/R2/S3 via `S3_*` vars

## Docker

```bash
docker compose up --build
```

Starts Postgres, MinIO, and the app on port 43187. Run migrations/seed against the compose DB if the app container does not seed automatically:

```bash
DATABASE_URL=postgresql://tone:tone@127.0.0.1:5432/tone_community pnpm db:seed
```

## Architecture

Feature-oriented modular monolith under `src/features/*` with DB in `src/db`, validation in `src/validation`, and Server Actions for mutations.

Project docs (Agent Store):

- Architecture
- Database schema
- Implementation checklist

Also see `IMPLEMENTATION_CHECKLIST.md` in this repo.

## Testing

```bash
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
```

## Product principles

1. Structured data first — not free-form posts
2. No fake UI — community actions persist
3. No custom ML in MVP — schema ready for it
4. Answer: how was this tone made, and can I recreate it?

## AI roadmap (not built yet)

Recommendation, gear-aware generation, amp-sim conversion, audio matching — enabled by normalized equipment, parameter values, provenance, and contributor consent flags on profiles.
