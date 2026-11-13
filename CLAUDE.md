# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project overview

A multi-tenant **digital QR menu** product for restaurants. Customers scan a QR code and see the restaurant's full menu instantly on their phone. Restaurant owners (or we, on their behalf) manage everything from a dashboard.

First client: a restaurant in **Portugal**. Tourists are a large share of customers, so multilingual support is a core feature, not an add-on.

### What we sell (the feature promise)
- Always-clean, always-current menu with zero printing cost
- Fully branded per restaurant (own logo, colours, photos, dishes). Never a generic template
- Multiple languages, switchable in one tap
- Dashboard to:
  - Update prices and dishes instantly
  - Mark items sold out in real time
  - Highlight specials and combos
  - Manage translations
  - Nudge happy customers toward Google reviews
- We handle full setup (design, branding, photography, data entry) for the client

Everything we build should serve that promise. If a feature doesn't, question it.

## Tech stack

- **Framework:** Next.js (App Router, React Server Components) via **create-t3-app**
- **Language:** TypeScript, `strict: true`, no `any` without a comment explaining why
- **API:** tRPC (v11) for dashboard and mutations
- **Styling:** Tailwind CSS, with CSS variables for per-restaurant theming
- **ORM / DB:** Prisma + PostgreSQL (Neon or Vercel Postgres)
- **Auth:** Auth.js (NextAuth) for the dashboard only. The public menu needs no login
- **i18n:** `next-intl`
- **Validation:** Zod (shared by tRPC inputs and forms; env via `@t3-oss/env-nextjs` in `src/env.js`)
- **Images:** Vercel Blob (or UploadThing), rendered with `next/image`
- **QR codes:** `qrcode` (generate SVG and PNG, print-ready)
- **Hosting:** **Vercel** (Git-based deploys, preview deploy per PR)
- **Package manager:** pnpm

## Commands

```bash
pnpm dev            # local dev server
pnpm build          # production build (must pass before merge)
pnpm lint           # eslint
pnpm typecheck      # tsc --noEmit
pnpm db:push        # prisma db push (dev only)
pnpm db:migrate     # prisma migrate dev
pnpm db:studio      # prisma studio
pnpm db:seed        # seed demo restaurant
```

Run `pnpm typecheck && pnpm lint` after any non-trivial change. Do not claim a task is done without running them.

## Architecture

### Routes

```
/[locale]/m/[slug]              Public menu for a restaurant (the QR target)
/[locale]/m/[slug]/[category]   Optional deep link to a category
/dashboard                      Owner dashboard (auth required)
/dashboard/menu                 Categories, dishes, prices, availability
/dashboard/translations         Per-language content
/dashboard/branding             Logo, colours, fonts, cover photo
/dashboard/qr                   Download QR codes (SVG/PNG/PDF-ready)
/admin                          Internal: create and onboard restaurants (our team only)
```

The QR code encodes a **short, permanent URL** (`/m/[slug]`). Never change a slug once a QR has been printed. Support redirects if a slug must change.

### Data model (Prisma, sketch)

- `Restaurant`: slug, name, defaultLocale, enabledLocales[], theme (JSON), googleReviewUrl, currency (default `EUR`), contact/address/hours
- `Category`: restaurantId, sortOrder, isVisible
- `Dish`: categoryId, price (store as **integer cents**), imageUrl, isAvailable (sold out), isFeatured/isSpecial, allergens[], dietaryTags[], sortOrder
- `Translation`: entityType, entityId, locale, name, description (or per-entity translation tables)
- `User` / `Membership`: users linked to restaurants with roles (`OWNER`, `STAFF`, `ADMIN`)
- Every tenant-owned table carries `restaurantId`. **Every query and mutation must be scoped by it.** Enforce in tRPC middleware, never trust a client-sent restaurantId.

### Rendering and caching

- Public menu is a **Server Component**, statically cached per `slug` + `locale`, and invalidated with `revalidateTag(`menu:${slug}`)` whenever the dashboard mutates data. Updates must appear within seconds.
- Sold-out toggles must feel real time. Revalidate on mutation. If that is not enough, add a small client island that polls or subscribes for availability only.
- The public menu must be fast on a bad mobile connection in a restaurant: target Lighthouse mobile **performance ≥ 95**, LCP < 2s, minimal client JS.
- Dashboard is client-heavy and uses tRPC + React Query. Keep it separate from the public bundle.

### Internationalisation

- Default locale: `pt` (European Portuguese, **pt-PT**, not Brazilian). Initial enabled locales: `pt`, `en`, `es`, `fr`, `de`. Make it data-driven per restaurant.
- UI strings (buttons, labels) live in `messages/{locale}.json`. Menu content (dish names and descriptions) lives in the DB as translations.
- Auto-detect from `Accept-Language`, but always show a visible language switcher (flag-free, use language codes or names, e.g. `PT · EN · ES · FR · DE`).
- Missing translation falls back to the default locale, never to an empty string.
- Write Portuguese copy in pt-PT: "ementa" (not "cardápio"), "pequeno-almoço", "sobremesas", "bebidas". Review any generated Portuguese for Brazilianisms.
- Optional: machine-translate on save (DeepL or Claude API), then let the owner edit. Mark machine translations so they can be reviewed.

## Design direction: premium, Portuguese, restaurant-grade

The menu is the product's face and the restaurant's first impression. It must feel like a **well-designed printed menu in a good restaurant**, not a SaaS page. Think refined, calm, confident.

### Principles
- **Food first.** Large, well-cropped photography with generous whitespace. Photos are optional per dish; the layout must look good with or without them.
- **Restraint.** Few colours, one accent, no gradients-for-the-sake-of-gradients, no emoji in the customer-facing UI, no stock "app" look.
- **Typographic hierarchy** does the heavy lifting: elegant serif for headings and dish names, clean sans for descriptions, prices and UI.
- **Mobile-first**, one-handed use. The customer is standing or sitting with a phone. Desktop is a secondary concern for the public menu (centre a max-width column).
- **Portuguese character, subtly.** Optional hints such as a faint azulejo-inspired line pattern for section dividers or the cover, warm natural tones. Never kitsch (no rooster, no clip-art tiles, no flag colours).

### Theming system (per restaurant)
All brand styling flows through CSS variables set from `Restaurant.theme`, so each client gets a bespoke look from the same codebase:

```css
--color-bg, --color-surface, --color-ink, --color-muted,
--color-accent, --color-accent-ink, --color-line
--font-display, --font-body
--radius
```

Map these into `tailwind.config` / the Tailwind theme so components use `bg-bg text-ink`, never hard-coded hex values. Provide 2–3 curated theme presets (e.g. *Tinto*, *Azeite*, *Atlântico*) that we tweak per client.

### Default look (until client brand assets are loaded)
- Palette: warm off-white (`#FAF7F2`) background, deep ink (`#1C1917`), muted stone for secondary text, one accent (deep wine `#6B1D2A` or olive `#5B6B3A`). Optional dark mode with a charcoal background and warm gold accent for wine-bar style venues.
- Fonts via `next/font` (self-hosted, no layout shift): display serif such as **Fraunces** or **Cormorant Garamond**; body **Inter** or **DM Sans**. Replace with client brand fonts when they have them.
- Prices: tabular numerals, right-aligned, formatted with `Intl.NumberFormat(locale, { style: "currency", currency: "EUR" })`. Show the euro the way Portuguese users expect, e.g. `12,50 €`.
- Subtle motion only: soft fades, sticky category nav with scroll-spy, smooth anchor scroll. Respect `prefers-reduced-motion`.

### Public menu layout
1. **Header/cover:** logo, restaurant name, short tagline, language switcher
2. **Sticky category bar:** horizontally scrollable, highlights the current section
3. **Specials / combos** block at the top when any are flagged
4. **Dish rows/cards:** name, description, price, optional photo, allergen/dietary icons. Sold-out items are shown greyed with a clear "Esgotado" label (translated), not hidden, unless the owner chooses to hide them
5. **Footer:** address, hours, contact, Instagram, and a tasteful **"Gostou? Deixe-nos uma avaliação"** Google review link (translated)

### Accessibility
- WCAG AA contrast minimum for all theme presets (check any new preset)
- Semantic headings, real `<button>`/`<a>` elements, visible focus states
- Touch targets ≥ 44px, body text ≥ 16px
- `alt` text for dish images (default to the dish name)

## Portugal-specific requirements

- **Currency:** EUR. Prices on a menu in Portugal are **VAT-inclusive** (IVA included). Don't show a separate VAT line.
- **Allergens:** the EU requires disclosure of the **14 major allergens** (Regulation (EU) No 1169/2011). Model them as a fixed enum with icons and translations: gluten, crustaceans, eggs, fish, peanuts, soybeans, milk, nuts, celery, mustard, sesame, sulphites, lupin, molluscs. Make them easy to set per dish and prominent in the UI.
- **Privacy / GDPR:** the public menu should not require cookies or tracking consent. Use cookieless, privacy-friendly analytics (Vercel Analytics or Plausible). Do not add third-party trackers to the public menu. If anything non-essential is ever added, add a consent flow.
- **Dates/times:** 24-hour clock, `Europe/Lisbon` timezone for opening hours and any scheduled specials (e.g. lunch menu "Prato do Dia" shown only 12:00–15:00).
- **Common structure:** many Portuguese restaurants use *Entradas, Sopas, Peixe, Carne, Pratos vegetarianos, Sobremesas, Bebidas, Vinhos*, plus *Prato do Dia* and *Menu de Almoço*. Our category model must support these without special-casing.

## Brand and content (fill in per client)

> Restaurant name: _TBD_
> Slug: _TBD_
> Logo / brand colours / fonts: _from the client's existing printed menu and branding, add assets to `public/clients/<slug>/`_
> Tone of voice: _TBD_
> Menu source: client's current menu photos, to be transcribed into the database (use the seed script or the admin import)
> Languages to enable: _TBD (default `pt` + `en`)_
> Google review URL: _TBD_

When onboarding a client: extract palette and typography from their existing menu and signage, build a theme preset, enter dishes with proper pt-PT copy, add translations, set allergens, then generate and download the QR code.

## Code conventions

- TypeScript strict, no unused vars, prefer `type` imports. Follow the existing T3 folder layout (`src/server/api/routers`, `src/app`, `src/trpc`).
- Server Components by default. Add `"use client"` only for real interactivity (language switcher, scroll-spy, dashboard forms).
- Validate **all** tRPC inputs with Zod. Authorise in middleware (`protectedProcedure`, plus a restaurant-membership check).
- Money is always integer cents in the DB and in logic. Format only at the edge.
- Keep components small and in `src/components/<area>/`. Public-menu components must not import dashboard code.
- Use Tailwind utility classes with the theme tokens. No inline hex colours, no ad-hoc spacing scales.
- Images: always `next/image` with explicit sizes, `placeholder="blur"` where possible, and WebP/AVIF. Compress uploads on the server.
- Commit style: Conventional Commits (`feat:`, `fix:`, `chore:`).
- Don't add dependencies casually. Prefer the platform and what T3 already gives us.

## Environment and deployment (Vercel)

- Env vars are defined and validated in `src/env.js`. Add any new var there and in `.env.example`. Never commit `.env`.
- Typical vars: `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `BLOB_READ_WRITE_TOKEN`, `NEXT_PUBLIC_APP_URL`, plus optional `DEEPL_API_KEY`.
- Deploy via Vercel Git integration: `main` → production, PRs → preview deployments. Set env vars per environment in the Vercel dashboard.
- Run Prisma migrations as part of the deploy (`prisma migrate deploy` in the build step) and make sure `postinstall` runs `prisma generate`.
- Use a pooled DB connection string for serverless runtimes.
- Custom domain per client is a later feature. For now, `<app-domain>/m/<slug>`.

## Definition of done

- `pnpm typecheck`, `pnpm lint` and `pnpm build` all pass
- Tested on a narrow mobile viewport (375px) and with at least `pt` and `en`
- No hard-coded user-facing strings, everything goes through i18n or DB translations
- Tenant isolation verified for any new query or mutation
- Public menu still meets the performance target

## Out of scope for now (don't build unless asked)

Online ordering and payments, table reservations, loyalty programmes, POS integrations. This is a menu product first.