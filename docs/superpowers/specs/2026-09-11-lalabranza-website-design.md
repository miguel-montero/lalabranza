# La Labranza Website — Design

## Summary

A bilingual (English/Spanish) marketing website for La Labranza — the
live-cooking, tableside-storytelling restaurant of Viña La Quirinca, a
boutique winery estate with alpacas on the grounds — with an in-house
table-reservation feature. Traditional Chilean cuisine is presented as
theater: dishes explained and cooked in front of guests, closer to an
upscale Chilean teppanyaki format than a casual sit-down meal. The primary
audience is American and European travelers staying at 4–5 star hotels in
Santiago — an affluent, mostly English-speaking, experienced-traveler
market, not local walk-in diners. The data model is tenant-scoped from day
one (every table keyed by `restaurant_id`) so that a second, third, or
tenth restaurant can be added later without a schema rewrite — but v1
ships with exactly one restaurant and no multi-tenant product surface (no
signup flow, no billing, no per-tenant admin provisioning). That
generalization work is explicitly out of scope here.

## Business & brand context

- La Labranza is part of Viña La Quirinca, a boutique winery. The site is
  branded as La Labranza first, with clear "part of Viña La Quirinca"
  messaging — the restaurant is the star, the winery is the credible
  context behind it.
- The winery's own wine is a real, ownable brand asset (used directly in
  the visual direction — see below), as are the alpacas on the estate.
- The dining format is experiential/theatrical (live cooking, tableside
  narration of dishes) — copy throughout the site, especially Reservations
  and About, should set that expectation rather than reading like a
  standard restaurant listing.
- Target audience is affluent international travelers who have likely
  already experienced comparable wine-country dining elsewhere (Napa,
  Tuscany) — the bar for perceived sophistication is high; content and
  design should read as "worth the drive from Santiago," not merely
  pleasant.

## Goals

- Give visitors the information they need to decide to visit: menu, photos,
  location, hours, contact.
- Let visitors request a table reservation online.
- Let restaurant staff see and manage the day's reservations without needing
  direct database access.
- Run entirely on infrastructure already owned (HostGator shared/cPanel
  hosting) with no new paid vendor.
- Keep the data model tenant-scoped so a future second restaurant — or a
  future SaaS product — doesn't require re-architecting.

## Non-goals (v1)

- Online ordering / delivery.
- Real menu content (placeholder items ship first; real menu comes later).
- A real logo (placeholder mark/wordmark ships first).
- Multi-tenant product surface: tenant signup, billing, per-tenant admin
  account provisioning. The schema supports multiple restaurants; the
  product does not yet expose that.
- Table-level assignment (which physical table a party sits at). V1 tracks
  total covers per time slot only.
- Adopting an existing open-source reservation/POS project (evaluated and
  explicitly rejected for v1 — see "Alternatives considered").

## Stack

- **Frontend:** Next.js (App Router) with `output: 'export'` (static
  export), React, TypeScript, Tailwind CSS, shadcn/ui components.
- **Backend:** PHP API endpoints + MySQL, hosted on the same HostGator
  shared/cPanel account as the static site — same origin as the frontend,
  so no CORS configuration is needed.
- **Deployment:** Static build output uploaded to HostGator; PHP endpoints
  deployed alongside it in a `/webdb`-style directory, following the same
  convention already used in the Lista Hoteles project
  (`webdb-endpoint.php`).
- **Images:** `next/image`'s optimization endpoint requires a Node server,
  which doesn't exist under static export on HostGator shared hosting.
  `next.config` needs `images: { unoptimized: true }`, and the real
  estate/gallery photos need to be pre-optimized (resized, converted to
  WebP) as a build step — e.g. a `sharp` script run before `next build` —
  rather than relying on Next to optimize them at request time.

This combination was chosen over two alternatives:

- **Next.js on Vercel + Supabase** — would give full Next.js SSR features
  and managed auth/RLS, but leaves the already-owned HostGator hosting
  unused and adds two new vendors. Rejected: no reason to pay for hosting
  twice.
- **Full Next.js SSR under cPanel's Node.js App (Passenger)** — would avoid
  a separate PHP layer, but Passenger + Next.js has known rough edges on
  shared hosting (memory limits, specific server setup) and is the least
  proven of the three paths. Rejected as too fragile for a first build.

## Alternatives considered for the reservation engine

Several existing open-source restaurant reservation/POS projects were
raised (Kitchenasty, Satisfecho POS, OpenResto, LibreBooking) as possible
foundations, motivated by the longer-term interest in eventually
generalizing this into a multi-restaurant SaaS product.

Decision: **do not adopt any of them for v1.** Reasons:

- Satisfecho POS is AGPL-licensed, which requires offering source to users
  of any network service built on modified AGPL code — a real constraint
  given the SaaS ambition, not evaluated further.
- None of the others were vetted for activity, maturity, or multi-tenant
  readiness before this decision — that vetting was scoped as a research
  task and explicitly declined in favor of building a minimal in-house
  module.
- A restaurant with one location has a genuinely small reservation problem
  (check remaining capacity for a slot, record a request, let staff
  confirm). Building it directly, tenant-scoped from the start, is less
  work than integrating, understanding, and constraining someone else's
  system — and avoids inheriting their licensing and architecture
  decisions.

This can be revisited later if the SaaS direction firms up and the
in-house module's limits are actually hit.

## Data model (MySQL)

Tenant isolation is enforced in application code (`WHERE restaurant_id =
?` on every query) rather than by the database. This is the standard
approach for PHP/MySQL multi-tenant apps before there's a concrete need
for database-enforced isolation (e.g. Postgres RLS) — revisit if/when this
becomes a real multi-tenant product.

- **`restaurants`** — `id`, `slug`, `name`, `address`, `phone`, `hours`
  (structured, e.g. JSON), `default_locale`. Exactly one row in v1.
- **`admin_users`** — `id`, `restaurant_id`, `username`, `password_hash`.
  Staff login for the admin reservations view.
- **`reservations`** — `id`, `restaurant_id`, `name`, `email`, `phone`,
  `party_size`, `date`, `time_slot`, `status` (`pending` / `confirmed` /
  `cancelled`), `notes`, `created_at`.
- **`capacity_rules`** — `id`, `restaurant_id`, day-of-week or date
  override, `time_slot`, `max_covers`, `slot_length_minutes`. Defines how
  many total covers can be booked per slot; no individual table tracking.

Menu content is **not** stored in the database in v1 — it's placeholder
content hardcoded into the static site, matching current content readiness
(no real menu yet). Moving menu content into the database is a natural
follow-up once real menu content and an editing need exist, but is out of
scope now.

## Reservation flow

**Public flow:**
1. Visitor picks a date, time slot, and party size on the Reservations
   page.
2. Frontend calls a PHP endpoint to check remaining capacity for that
   restaurant/date/slot (`capacity_rules.max_covers` minus the sum of
   non-cancelled `reservations.party_size` already booked for that
   slot).
3. If capacity remains, the visitor submits name, email, phone, and
   optional notes; a `reservations` row is created with status `pending`.
4. The visitor sees a confirmation message that the restaurant will
   confirm the reservation (exact confirmation channel — email vs. phone
   — is an implementation detail to settle during build, not a design
   blocker).

**Admin flow:**
- `/admin/reservations`, gated by a PHP session login against
  `admin_users`.
- Lists the current day's (and near-future) reservations for the logged-in
  staff member's restaurant, with basic confirm/cancel actions.
- No self-service password reset, no multi-role permissions in v1 — one
  shared staff login is sufficient in v1.

## Site structure & i18n

Pages: Home, Menu (placeholder items), Reservations, Gallery (real
photos), About/Location (real address, map embed), Contact.

All pages except Reservations and the admin view are static, built at
deploy time via Next.js static export.

Bilingual support (English default, Spanish available) is implemented via
locale-prefixed static routes (`/en/...`, `/es/...`) generated at build
time — compatible with static export — with a locale toggle in the site
header. English is the default because the primary audience is
English-speaking international travelers, not local Spanish-speaking
diners.

## Content readiness

- **Logo:** none yet — ships with a placeholder mark/wordmark.
- **Photos:** real photos available, used from the start.
- **Address/hours/contact:** real, used from the start.
- **Menu:** placeholder content; real menu to follow later.

## Testing

- **Frontend:** Vitest + React Testing Library for key UI components
  (reservation form, admin list view).
- **Backend logic:** PHPUnit (or equivalent lightweight PHP test approach)
  for the one piece of real business logic worth testing directly —
  capacity/availability calculation given existing reservations and
  capacity rules.
- E2E/browser testing of the full booking flow is not required for v1 but
  can be added later (e.g. Playwright) if the flow grows more complex.

## Visual & brand direction

Worked out using the `frontend-design` skill process, grounded in the
business context above rather than generic "rustic restaurant" defaults.

- **Color:** `Fibra Cruda` `#D8CDBC` (undyed alpaca-wool background),
  `Piedra Volcánica` `#2B2622` (volcanic stone, text), `Vino Tinto`
  `#4E1B26` (the estate's own wine — primary accent), `Cobre Viejo`
  `#8A5A34` (aged copper, secondary), `Lana Dorada` `#B8935A` (warm fiber
  highlight), `Viña` `#3D4A32` (vineyard green, tertiary). The wine-red
  primary accent is deliberate: it's literally what the estate produces,
  not a generic "earthy" color choice.
- **Type:** Fraunces (display — warm, high-contrast serif, reads as
  elegant/editorial rather than templated), Lora (body — carries
  storytelling copy, since dishes are narrated tableside and the web copy
  should share that voice), Space Grotesk (labels/course numbers — a
  modern-artisanal, wine-label quality, small caps with wide tracking).
- **Signature element — the furrow line:** a precise, etched (not
  hand-drawn-rustic) parallel-line motif used as the section-divider
  device throughout, and faintly in the hero background. It carries two
  true meanings at once: tilled fields (*labranza*) and vineyard rows —
  specific to this estate, not decorative.
- **Hero:** a real photo of the estate at golden hour (table set outdoors,
  land and, if available, alpacas) rather than a studio food shot or a
  generic stat/gradient hero — the estate itself is the strongest asset
  competitors can't replicate. This matches the "Hero-Centric Design"
  pattern (full-bleed hero → single value-prop strip → proof → primary
  CTA), verified via the `ui-ux-pro-max` skill's landing-pattern search.

### Color → role mapping (WCAG-checked)

The six tokens above aren't interchangeable as text colors — contrast was
computed against both surfaces, not assumed:

| Role | Color | Against | Ratio | Verdict |
|---|---|---|---|---|
| Background | Fibra Cruda `#D8CDBC` | — | — | base surface |
| Text (default) | Piedra Volcánica `#2B2622` | on Fibra Cruda | 9.5:1 | AAA — safe everywhere |
| Primary accent / CTA fill | Vino Tinto `#4E1B26` | text on Fibra Cruda | 8.9:1 | AAA |
| On-primary (text on Vino Tinto buttons) | Fibra Cruda | on Vino Tinto | 8.9:1 | AAA — keep it warm, not stark white |
| Cobre Viejo `#8A5A34` | — | on Fibra Cruda / Piedra Volcánica | 3.7:1 / 2.6:1 | Large text/icons/borders only — fails as body text on either surface |
| Lana Dorada `#B8935A` | — | on Fibra Cruda / Piedra Volcánica | 1.8:1 / 5.2:1 | Usable as text only on the dark surface (e.g. footer); decorative-only on light bg |
| Viña `#3D4A32` | — | on Fibra Cruda / Piedra Volcánica | 6.0:1 / 1.6:1 | Usable as text only on the light surface |

### Type & spacing scale

- Base 16px, line-height 1.5–1.6 for Lora body copy.
- Fraunces (display): ~36px mobile h1 up to ~64–72px desktop h1.
- Space Grotesk (labels/course numbers): 12–14px, uppercase, wide tracking.
- Spacing: generous/spacious scale (24–96px) on public marketing pages —
  this is an experiential estate site, not a dashboard. The admin
  reservations page may use a tighter, denser scale since it's a utility
  screen, not brand-critical.

### Furrow-line signature — implementation

Inline SVG component (`<FurrowDivider />`), not a background image: 2–4
slightly-varied horizontal strokes. Full-opacity Piedra Volcánica or Vino
Tinto for section dividers; ~15–20% opacity Cobre Viejo for the faint
hero-background version. Static by default; an optional subtle "etch"
reveal-on-scroll must be gated behind `prefers-reduced-motion:
no-preference` so it degrades to static rather than breaking.

### Reservation form & admin list — component guidance

Current shadcn CLI uses `Field` / `FieldLabel` / `FieldError` primitives
(not the older `FormField` pattern) with either React Hook Form+Zod or
TanStack Form for validation. Reservation form: `Field` +
`Input`/`Select`/`Calendar`+`Popover` for date, `Button` with an explicit
loading state. Accessibility requirement (High severity, from
`ui-ux-pro-max`'s UX guidelines): a focusable error summary
(`role="alert"`, linking to each invalid field) in *addition to* inline
per-field errors, not instead of them. Admin list: `Table` + `Badge` for
status, colored using the verified pairs above rather than raw hex.

## Open items for implementation time (not design blockers)

- Exact reservation confirmation channel (email send vs. "we'll call you")
  and whether v1 needs outbound email at all.
- Exact `hours` JSON shape and how it renders across locales.
- Whether the admin reservations page gets its own dark surface (using
  Piedra Volcánica/Fibra Cruda/Lana Dorada) — not required for v1, since
  it's a utility screen rather than brand-critical.
