# Implementation Checklist

Mirror of the Project store checklist. Keep both updated.

## Phase 0 — Plan

- [x] Inspect empty repository
- [x] Architecture + schema docs in store
- [x] Repo checklist
- [ ] Draft PR linking store docs

## Phase 1 — Foundation

- [x] Next.js App Router + TS + Tailwind + shadcn/ui
- [x] pnpm, ESLint, Prettier, strict TS
- [x] PostgreSQL + Drizzle
- [x] Better Auth
- [x] Storage abstraction (local + S3)
- [x] Vitest + Playwright
- [x] App shell + theme
- [x] docker-compose + `.env.example`
- [x] Dev server on port 43187

## Phase 2 — Database

- [x] Full schema + migrations
- [x] Indexes / unique constraints
- [x] Seed (CAS, Deftones, Radiohead, Pixies + gear + recipes)
- [x] Query helpers

## Phase 3 — Discovery

- [x] Home (search-focused)
- [x] Global search
- [x] Artists / songs / tone list + detail
- [x] Song tone filters & sort

## Phase 4 — Tone creation

- [x] Draft autosave
- [x] Multi-step editor
- [x] Guitar / amp / chain / params
- [x] Preview + publish

## Phase 5 — Media

- [x] Screenshots / presets / audio upload APIs
- [x] Validation + local media serving
- [x] Audio player (no autoplay)

## Phase 6 — Community

- [x] Ratings, favorites, tries, feedback, comments, forks

## Phase 7 — User gear

- [x] My Gear CRUD + catalog submit + profile gear

## Phase 8 — Admin / moderation

- [x] Admin gate + users/artists/songs/equipment/reports

## Phase 9 — Quality

- [x] Responsive shell, empty/loading/error states
- [x] Keyboard chain move up/down
- [x] Unit tests + Playwright journey
- [x] Upload authZ + validation

## Phase 10 — Release

- [ ] Production build
- [x] Docker / compose
- [x] README
- [ ] Full test suite green
- [ ] Live URL + demo media
- [ ] Draft PR
