# La Labranza Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build v1 of the La Labranza restaurant website — a bilingual (EN/ES) marketing site with an in-house table-reservation feature — deployable to existing HostGator shared hosting.

**Architecture:** A Next.js (App Router) static-export frontend under `frontend/` (React, TypeScript, Tailwind, shadcn/ui) serves all marketing pages as prebuilt HTML. A PHP + MySQL backend under `backend/` (deployed to a `/webdb` path at the same origin) handles the two dynamic surfaces — public reservation capacity/creation, and a session-gated admin reservations view — so no CORS setup is needed and no Node server is required in production.

**Tech Stack:** Next.js (App Router, `output: 'export'`), React, TypeScript, Tailwind CSS v4, shadcn/ui, Vitest + React Testing Library, PHP 8, MySQL, PHPUnit, sharp (build-time image optimization).

**Spec:** `docs/superpowers/specs/2026-09-11-lalabranza-website-design.md`

## Global Constraints

- Static export only: `next.config` sets `output: 'export'` and `images: { unoptimized: true }` — `next/image`'s optimization endpoint needs a Node server that does not exist on HostGator shared hosting (spec: Stack).
- Frontend and backend are deployed to the same origin (frontend static files at the web root, PHP endpoints under `/webdb/`) — no CORS configuration anywhere (spec: Stack).
- Tenant isolation is enforced in application code (`WHERE restaurant_id = ?` on every query), not by the database — every backend query in this plan must include that clause even though v1 has exactly one restaurant row (spec: Data model).
- English is the default locale; Spanish is available via a toggle. Locale-prefixed static routes: `/en/...`, `/es/...` (spec: Site structure & i18n).
- No online ordering, no real menu content yet (placeholder items), no real logo yet (placeholder mark), no table-level assignment (capacity is tracked per time slot, not per table) — see spec Non-goals.
- Do not adopt any third-party open-source reservation/POS project — the reservation module is built in-house per the spec's "Alternatives considered" section.
- Automated test scope follows the spec's Testing section exactly: Vitest + React Testing Library for frontend components, PHPUnit only for the capacity/availability calculation logic. PHP endpoint files are verified manually (PHP built-in dev server + `curl`), and full E2E/browser testing is explicitly out of scope for v1 — do not add broader automated coverage than this.
- Color tokens are used only in the roles the spec's WCAG table allows (e.g. `Cobre Viejo` and `Lana Dorada` are never used as body text on a surface the table marks as failing) — see spec's "Color → role mapping (WCAG-checked)".
- Interpretation note (spec does not spell this out explicitly): static marketing pages (Home, Menu, Gallery, About/Location, Contact) get their real content — address, phone, hours, placeholder menu items — hardcoded directly in the frontend source per locale, not fetched from MySQL at build or request time. The `restaurants` table's `address`/`phone`/`hours` columns exist for backend use (admin view, future editability) and must hold the same real values, seeded once. This keeps the static export fully static and avoids inventing a build-time-fetch architecture the spec never asked for.
- Real address/phone/hours/menu content is not yet available to this plan. Every task that needs it uses a clearly-marked placeholder value (e.g. `"[ADDRESS — REPLACE BEFORE LAUNCH]"`) in exactly one place per locale (the content config file built in Task 9) — never scattered inline — so swapping in real content later is a single-file edit.

---

## File Structure

```
lalabranza/
  frontend/                          # Next.js app
    app/
      page.tsx                       # root redirect to /en
      [locale]/
        layout.tsx                   # html lang, fonts, Header/Footer
        page.tsx                     # Home
        menu/page.tsx
        gallery/page.tsx
        about/page.tsx
        contact/page.tsx
        reservations/page.tsx
      admin/
        login/page.tsx
        reservations/page.tsx
      globals.css
    components/
      furrow-divider.tsx
      header.tsx
      footer.tsx
      locale-toggle.tsx
      eyebrow.tsx
      reservation-form.tsx
      admin-reservations-table.tsx
      ui/                            # shadcn/ui generated components
    content/
      restaurant.ts                  # real static content (address/hours/menu placeholders) per locale
      dictionaries/
        en.json
        es.json
      get-dictionary.ts
    lib/
      utils.ts                       # shadcn cn() helper
      api.ts                         # typed fetch wrappers for /webdb endpoints
    scripts/
      optimize-images.mjs
    __tests__/
      (colocated *.test.tsx files live next to the components they test)
    next.config.ts
    tailwind config via globals.css (Tailwind v4 CSS-first config)
    package.json
    vitest.config.ts
  backend/
    webdb/
      availability.php
      reservations_create.php
      admin_login.php
      admin_logout.php
      admin_reservations_list.php
      admin_reservations_update.php
    src/
      Db.php
      Capacity.php
      Session.php
    migrations/
      001_schema.sql
      002_seed.sql
    config.example.php
    tests/
      CapacityTest.php
    composer.json
    phpunit.xml
  docs/
    deploy.md
    superpowers/
      specs/2026-09-11-lalabranza-website-design.md
      plans/2026-09-11-lalabranza-website-implementation.md
```

Responsibilities:
- `frontend/content/restaurant.ts` is the single source of truth for real-world static content (address, phone, hours, placeholder menu items), keyed by locale. Every page reads from here — no inline content duplication.
- `frontend/content/dictionaries/*.json` + `get-dictionary.ts` hold UI copy (nav labels, button text, headings) separately from `restaurant.ts` (business facts) — a copy edit and a business-fact edit never touch the same file.
- `backend/src/Capacity.php` is a pure function with no DB dependency, so it's unit-testable without MySQL. `backend/webdb/*.php` files are thin — they do session/DB wiring and call into `src/`.
- `backend/migrations/` are plain `.sql` files applied manually with the `mysql` CLI (no migration framework needed for four tables).

---

### Task 1: Scaffold the Next.js frontend

**Files:**
- Create: `frontend/` (via `create-next-app`)
- Modify: `frontend/next.config.ts`

**Interfaces:**
- Produces: a buildable Next.js App Router project at `frontend/`, with static export configured, that every later frontend task builds on.

- [ ] **Step 1: Scaffold the project**

From the repo root:

```bash
npx create-next-app@latest frontend --typescript --tailwind --app --eslint --src-dir=false --import-alias "@/*" --use-npm
```

Answer "No" to Turbopack if prompted (static export tooling is more predictable without it for this plan).

- [ ] **Step 2: Configure static export**

Replace the contents of `frontend/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify it builds**

```bash
cd frontend && npm run build
```

Expected: build succeeds and prints `Exporting (3/3)` (or similar) with output written to `frontend/out/`.

- [ ] **Step 4: Commit**

```bash
cd frontend && cd .. && git add frontend && git commit -m "$(cat <<'EOF'
feat(frontend): scaffold Next.js app with static export

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Testing harness (Vitest + React Testing Library)

**Files:**
- Create: `frontend/vitest.config.ts`
- Create: `frontend/vitest.setup.ts`
- Create: `frontend/lib/utils.ts`
- Test: `frontend/lib/utils.test.ts`
- Modify: `frontend/package.json` (add `test` script and devDependencies)

**Interfaces:**
- Produces: `cn(...classes: (string | undefined | false)[]): string` in `frontend/lib/utils.ts`, used by every component task from here on to merge Tailwind classes (this is the same helper shadcn/ui's generator expects to find, so Task 4's `shadcn init` will reuse this file rather than creating a conflicting one).

- [ ] **Step 1: Install test dependencies**

```bash
cd frontend
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom clsx tailwind-merge
```

- [ ] **Step 2: Configure Vitest**

Create `frontend/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Create `frontend/vitest.setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

Add to `frontend/package.json` `scripts`:

```json
"test": "vitest run"
```

- [ ] **Step 3: Write the failing test**

Create `frontend/lib/utils.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("joins truthy class names with a space", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, "b")).toBe("a b");
  });

  it("lets a later conflicting Tailwind class win", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `frontend/lib/utils.ts` does not exist yet.

- [ ] **Step 5: Implement `cn`**

Create `frontend/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add frontend/vitest.config.ts frontend/vitest.setup.ts frontend/lib/utils.ts frontend/lib/utils.test.ts frontend/package.json frontend/package-lock.json
git commit -m "$(cat <<'EOF'
feat(frontend): add Vitest harness and cn() class-merge helper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Design tokens — colors and fonts

**Files:**
- Modify: `frontend/app/globals.css`
- Create: `frontend/components/eyebrow.tsx`
- Test: `frontend/components/eyebrow.test.tsx`

**Interfaces:**
- Produces: CSS variables `--color-fibra-cruda`, `--color-piedra-volcanica`, `--color-vino-tinto`, `--color-cobre-viejo`, `--color-lana-dorada`, `--color-vina`, and Tailwind utility classes `font-display` (Fraunces), `font-body` (Lora), `font-label` (Space Grotesk), consumed by every visual component task from here on.
- Produces: `<Eyebrow>` component (`frontend/components/eyebrow.tsx`), the small-caps wide-tracking label style used across Home/Menu, consumed by Task 10 (Home page).

- [ ] **Step 1: Write the failing test**

Create `frontend/components/eyebrow.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Eyebrow } from "./eyebrow";

describe("Eyebrow", () => {
  it("renders its text in the label font, uppercase, with wide tracking", () => {
    render(<Eyebrow>cocina de campo</Eyebrow>);
    const el = screen.getByText("cocina de campo");
    expect(el.className).toContain("font-label");
    expect(el.className).toContain("uppercase");
    expect(el.className).toContain("tracking-widest");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `./eyebrow` does not exist.

- [ ] **Step 3: Add design tokens to `globals.css`**

Replace the `@theme` block (or add one, if `create-next-app` didn't generate one) in `frontend/app/globals.css`, above the existing Tailwind import line — keep the existing `@import "tailwindcss";` line at the top:

```css
@import "tailwindcss";

@theme {
  --color-fibra-cruda: #d8cdbc;
  --color-piedra-volcanica: #2b2622;
  --color-vino-tinto: #4e1b26;
  --color-cobre-viejo: #8a5a34;
  --color-lana-dorada: #b8935a;
  --color-vina: #3d4a32;

  --font-display: "Fraunces", serif;
  --font-body: "Lora", serif;
  --font-label: "Space Grotesk", sans-serif;
}

body {
  background-color: var(--color-fibra-cruda);
  color: var(--color-piedra-volcanica);
  font-family: var(--font-body);
}
```

- [ ] **Step 4: Load the fonts and implement `Eyebrow`**

Modify `frontend/app/layout.tsx` to load the three fonts with `next/font/google` and expose them as CSS variables on `<html>`:

```typescript
import { Fraunces, Lora, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      className={`${fraunces.variable} ${lora.variable} ${spaceGrotesk.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

Create `frontend/components/eyebrow.tsx`:

```typescript
import { cn } from "@/lib/utils";

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "font-label text-xs uppercase tracking-widest text-[var(--color-cobre-viejo)]",
        className,
      )}
    >
      {children}
    </span>
  );
}
```

Note: `Cobre Viejo` is used here at a small size as a *label*, not body text — per the spec's WCAG table it fails contrast as body text (3.7:1 on the light surface) but this component is explicitly a short uppercase label, which is the one role the table allows for it in combination with adequate size/weight. If a later task needs a long-form Cobre Viejo text run, use `text-[var(--color-piedra-volcanica)]` instead.

- [ ] **Step 5: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/app/globals.css frontend/app/layout.tsx frontend/components/eyebrow.tsx frontend/components/eyebrow.test.tsx
git commit -m "$(cat <<'EOF'
feat(frontend): add color/font design tokens and Eyebrow component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Install and configure shadcn/ui

**Files:**
- Create: `frontend/components.json` (generated by shadcn CLI)
- Create: `frontend/components/ui/button.tsx`, `input.tsx`, `select.tsx`, `field.tsx`, `calendar.tsx`, `popover.tsx`, `table.tsx`, `badge.tsx`, `card.tsx` (generated)
- Test: `frontend/components/ui-smoke.test.tsx`

**Interfaces:**
- Produces: shadcn/ui primitives under `frontend/components/ui/` — `Button`, `Input`, `Select`, `Field`/`FieldLabel`/`FieldError`, `Calendar`, `Popover`, `Table`, `Badge`, `Card` — consumed by Task 23 (reservation form) and Task 25 (admin reservations table).

- [ ] **Step 1: Initialize shadcn/ui**

```bash
cd frontend
npx shadcn@latest init
```

When prompted: base color → pick a neutral base (it will be overridden by the design tokens from Task 3 in the components' actual usage; shadcn's generated components use CSS variables you already control). Confirm it detects the existing `lib/utils.ts` (from Task 2) instead of creating a duplicate — if it asks to overwrite, decline.

- [ ] **Step 2: Add the components this plan needs**

```bash
npx shadcn@latest add button input select field calendar popover table badge card
```

- [ ] **Step 3: Write a smoke test**

Create `frontend/components/ui-smoke.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

describe("shadcn/ui smoke test", () => {
  it("renders a Button", () => {
    render(<Button>Reserve a table</Button>);
    expect(screen.getByRole("button", { name: "Reserve a table" })).toBeInTheDocument();
  });

  it("renders a Badge", () => {
    render(<Badge>Pending</Badge>);
    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS. (This confirms the generated components compile and render — there is nothing to TDD here since the components' internals are generated, not authored by this plan.)

- [ ] **Step 5: Commit**

```bash
git add frontend/components.json frontend/components/ui frontend/components/ui-smoke.test.tsx frontend/package.json frontend/package-lock.json
git commit -m "$(cat <<'EOF'
feat(frontend): install shadcn/ui primitives

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: FurrowDivider signature component

**Files:**
- Create: `frontend/components/furrow-divider.tsx`
- Test: `frontend/components/furrow-divider.test.tsx`

**Interfaces:**
- Produces: `<FurrowDivider variant="divider" | "hero" />` — consumed by Task 10 (Home page, between sections and faintly in the hero) and any later page that needs a section break.

- [ ] **Step 1: Write the failing test**

Create `frontend/components/furrow-divider.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { FurrowDivider } from "./furrow-divider";

describe("FurrowDivider", () => {
  it("renders an svg with role img and a hidden accessible description", () => {
    const { container } = render(<FurrowDivider />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("role", "img");
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("defaults to the divider variant with full-opacity strokes", () => {
    const { container } = render(<FurrowDivider />);
    const paths = container.querySelectorAll("path");
    expect(paths.length).toBeGreaterThanOrEqual(2);
    paths.forEach((p) => {
      expect(p.getAttribute("stroke-opacity")).toBe("1");
    });
  });

  it("uses reduced opacity strokes for the hero variant", () => {
    const { container } = render(<FurrowDivider variant="hero" />);
    const paths = container.querySelectorAll("path");
    paths.forEach((p) => {
      expect(Number(p.getAttribute("stroke-opacity"))).toBeLessThan(0.3);
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `./furrow-divider` does not exist.

- [ ] **Step 3: Implement `FurrowDivider`**

Create `frontend/components/furrow-divider.tsx`:

```typescript
import { cn } from "@/lib/utils";

type FurrowDividerProps = {
  variant?: "divider" | "hero";
  className?: string;
};

// Four slightly-varied parallel strokes — the estate's own furrow/vineyard-row
// motif (see spec: "Furrow-line signature — implementation"). `divider` is
// the full-strength section-break version; `hero` is the faint version used
// behind hero content.
const STROKES = [
  { y: 8, length: 1, opacity: { divider: 1, hero: 0.18 } },
  { y: 18, length: 0.92, opacity: { divider: 1, hero: 0.14 } },
  { y: 28, length: 1, opacity: { divider: 0.85, hero: 0.16 } },
  { y: 38, length: 0.88, opacity: { divider: 0.85, hero: 0.12 } },
];

export function FurrowDivider({
  variant = "divider",
  className,
}: FurrowDividerProps) {
  const strokeColor =
    variant === "hero"
      ? "var(--color-cobre-viejo)"
      : "var(--color-piedra-volcanica)";

  return (
    <svg
      role="img"
      aria-hidden="true"
      viewBox="0 0 400 46"
      preserveAspectRatio="none"
      className={cn("w-full h-auto", className)}
    >
      {STROKES.map((s, i) => (
        <path
          key={i}
          d={`M ${(400 * (1 - s.length)) / 2} ${s.y} L ${
            400 - (400 * (1 - s.length)) / 2
          } ${s.y}`}
          stroke={strokeColor}
          strokeWidth={i % 2 === 0 ? 1.5 : 1}
          strokeOpacity={s.opacity[variant]}
        />
      ))}
    </svg>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/components/furrow-divider.tsx frontend/components/furrow-divider.test.tsx
git commit -m "$(cat <<'EOF'
feat(frontend): add FurrowDivider signature component

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: i18n dictionaries

**Files:**
- Create: `frontend/content/dictionaries/en.json`
- Create: `frontend/content/dictionaries/es.json`
- Create: `frontend/content/get-dictionary.ts`
- Test: `frontend/content/get-dictionary.test.ts`

**Interfaces:**
- Produces: `type Locale = "en" | "es"`, `type Dictionary` (shape below), `async function getDictionary(locale: Locale): Promise<Dictionary>` — consumed by every page task (7 through 14) and by `Header`/`Footer` (Task 8).

- [ ] **Step 1: Write the failing test**

Create `frontend/content/get-dictionary.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { getDictionary } from "./get-dictionary";

describe("getDictionary", () => {
  it("returns the English dictionary with expected top-level keys", async () => {
    const dict = await getDictionary("en");
    expect(Object.keys(dict)).toEqual(
      expect.arrayContaining(["nav", "home", "reservations", "footer"]),
    );
    expect(dict.nav.menu).toBe("Menu");
  });

  it("returns the Spanish dictionary with the same shape", async () => {
    const en = await getDictionary("en");
    const es = await getDictionary("es");
    expect(Object.keys(es).sort()).toEqual(Object.keys(en).sort());
    expect(es.nav.menu).toBe("Menú");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `./get-dictionary` does not exist.

- [ ] **Step 3: Create the dictionaries**

Create `frontend/content/dictionaries/en.json`:

```json
{
  "nav": {
    "home": "Home",
    "menu": "Menu",
    "gallery": "Gallery",
    "about": "About & Location",
    "contact": "Contact",
    "reservations": "Reservations"
  },
  "home": {
    "eyebrow": "Viña La Quirinca",
    "headline": "La Labranza",
    "subhead": "A tableside table — dinner cooked, explained, and poured in front of you.",
    "cta": "Reserve your seating",
    "valueProp": "Traditional Chilean cuisine, told as a story: each course prepared and narrated at your table, paired with wine grown on the estate you're sitting on."
  },
  "reservations": {
    "title": "Reserve a seating",
    "intro": "Seatings are limited so every table gets the full tableside experience. Choose a date, time, and party size to check availability.",
    "dateLabel": "Date",
    "timeLabel": "Seating time",
    "partySizeLabel": "Party size",
    "nameLabel": "Full name",
    "emailLabel": "Email",
    "phoneLabel": "Phone",
    "notesLabel": "Notes (optional)",
    "submit": "Request reservation",
    "submitting": "Requesting…",
    "successTitle": "Request received",
    "successBody": "We'll confirm your seating by email shortly.",
    "errorSummaryTitle": "There is a problem",
    "noCapacity": "That seating is fully booked — try another time."
  },
  "footer": {
    "partOf": "Part of Viña La Quirinca",
    "rights": "All rights reserved."
  }
}
```

Create `frontend/content/dictionaries/es.json`:

```json
{
  "nav": {
    "home": "Inicio",
    "menu": "Menú",
    "gallery": "Galería",
    "about": "Nosotros y Ubicación",
    "contact": "Contacto",
    "reservations": "Reservas"
  },
  "home": {
    "eyebrow": "Viña La Quirinca",
    "headline": "La Labranza",
    "subhead": "Una mesa contada — la cena se cocina, se explica y se sirve frente a ti.",
    "cta": "Reserva tu mesa",
    "valueProp": "Cocina tradicional chilena, contada como una historia: cada plato preparado y narrado en tu mesa, maridado con vino cultivado en el mismo fundo donde estás sentado."
  },
  "reservations": {
    "title": "Reserva una mesa",
    "intro": "Los cupos son limitados para que cada mesa reciba la experiencia completa. Elige fecha, hora y número de personas para consultar disponibilidad.",
    "dateLabel": "Fecha",
    "timeLabel": "Horario",
    "partySizeLabel": "Número de personas",
    "nameLabel": "Nombre completo",
    "emailLabel": "Correo electrónico",
    "phoneLabel": "Teléfono",
    "notesLabel": "Notas (opcional)",
    "submit": "Solicitar reserva",
    "submitting": "Enviando…",
    "successTitle": "Solicitud recibida",
    "successBody": "Confirmaremos tu reserva por correo en breve.",
    "errorSummaryTitle": "Hay un problema",
    "noCapacity": "Ese horario está completo — prueba con otro."
  },
  "footer": {
    "partOf": "Parte de Viña La Quirinca",
    "rights": "Todos los derechos reservados."
  }
}
```

- [ ] **Step 4: Implement `getDictionary`**

Create `frontend/content/get-dictionary.ts`:

```typescript
import en from "./dictionaries/en.json";
import es from "./dictionaries/es.json";

export type Locale = "en" | "es";
export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = { en, es };

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale];
}

export const locales: Locale[] = ["en", "es"];
export const defaultLocale: Locale = "en";
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/content
git commit -m "$(cat <<'EOF'
feat(frontend): add EN/ES dictionaries and getDictionary helper

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Locale routing shell

**Files:**
- Create: `frontend/app/page.tsx` (root redirect)
- Create: `frontend/app/[locale]/layout.tsx`
- Create: `frontend/components/locale-toggle.tsx`
- Test: `frontend/components/locale-toggle.test.tsx`
- Modify: `frontend/app/layout.tsx` (move font/html-level setup so `[locale]/layout.tsx` can set `lang`)

**Interfaces:**
- Consumes: `Locale`, `locales`, `defaultLocale`, `getDictionary` from Task 6.
- Produces: the `/en/...` and `/es/...` route prefixes every page task (9 through 14, 23) renders under; `<LocaleToggle currentLocale locale-relative pathname />`, consumed by `Header` (Task 8).

- [ ] **Step 1: Write the failing test for LocaleToggle**

Create `frontend/components/locale-toggle.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleToggle } from "./locale-toggle";

describe("LocaleToggle", () => {
  it("links to the same path under the other locale", () => {
    render(<LocaleToggle currentLocale="en" pathname="/en/menu" />);
    const link = screen.getByRole("link", { name: "Español" });
    expect(link).toHaveAttribute("href", "/es/menu");
  });

  it("links to English when currently on the Spanish site", () => {
    render(<LocaleToggle currentLocale="es" pathname="/es/gallery" />);
    const link = screen.getByRole("link", { name: "English" });
    expect(link).toHaveAttribute("href", "/en/gallery");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `./locale-toggle` does not exist.

- [ ] **Step 3: Implement `LocaleToggle`**

Create `frontend/components/locale-toggle.tsx`:

```typescript
import Link from "next/link";
import type { Locale } from "@/content/get-dictionary";

const OTHER_LOCALE: Record<Locale, Locale> = { en: "es", es: "en" };
const LABEL: Record<Locale, string> = { en: "English", es: "Español" };

export function LocaleToggle({
  currentLocale,
  pathname,
}: {
  currentLocale: Locale;
  pathname: string;
}) {
  const target = OTHER_LOCALE[currentLocale];
  const rest = pathname.replace(/^\/(en|es)/, "");
  const href = `/${target}${rest}`;

  return (
    <Link href={href} className="font-label text-sm underline">
      {LABEL[target]}
    </Link>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 5: Wire up the `[locale]` route segment**

Replace `frontend/app/layout.tsx` with a minimal root layout (fonts stay here since they must load once for the whole app):

```typescript
import { Fraunces, Lora, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-label",
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`${fraunces.variable} ${lora.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

Create `frontend/app/page.tsx` (static export emits this as a redirect page):

```typescript
import { redirect } from "next/navigation";
import { defaultLocale } from "@/content/get-dictionary";

export default function RootPage() {
  redirect(`/${defaultLocale}`);
}
```

Create `frontend/app/[locale]/layout.tsx`:

```typescript
import { locales, type Locale } from "@/content/get-dictionary";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <div lang={locale}>{children}</div>;
}
```

(The `<html lang>` attribute can't vary per static-exported subtree, so this plan sets `lang` on a wrapping `<div>` at the locale root instead — screen readers respect the nearest `lang` ancestor.)

- [ ] **Step 6: Verify the build produces both locale trees**

```bash
cd frontend && npm run build
```

Expected: `frontend/out/en/` doesn't exist yet (no page.tsx under `[locale]` yet — that's Task 10), but the build succeeds with no errors about `[locale]`. If it fails because `[locale]` has no `page.tsx`, that's expected at this point; proceed — Task 10 adds it. Re-run this same build check again at the end of Task 10 and expect it to pass fully.

- [ ] **Step 7: Commit**

```bash
git add frontend/app/layout.tsx frontend/app/page.tsx frontend/app/[locale]/layout.tsx frontend/components/locale-toggle.tsx frontend/components/locale-toggle.test.tsx
git commit -m "$(cat <<'EOF'
feat(frontend): add locale routing shell and LocaleToggle

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Header and Footer

**Files:**
- Create: `frontend/components/header.tsx`
- Create: `frontend/components/footer.tsx`
- Test: `frontend/components/header.test.tsx`
- Test: `frontend/components/footer.test.tsx`
- Modify: `frontend/app/[locale]/layout.tsx` (render Header/Footer around `children`)

**Interfaces:**
- Consumes: `Dictionary` (Task 6), `LocaleToggle` (Task 7).
- Produces: `<Header dictionary={dict} locale={locale} pathname={pathname} />`, `<Footer dictionary={dict} />` — wrapped around every page from Task 10 onward via the locale layout.

- [ ] **Step 1: Write the failing tests**

Create `frontend/components/header.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./header";
import { getDictionary } from "@/content/get-dictionary";

describe("Header", () => {
  it("renders every nav link from the dictionary", async () => {
    const dict = await getDictionary("en");
    render(<Header dictionary={dict} locale="en" pathname="/en" />);
    expect(screen.getByRole("link", { name: "Menu" })).toHaveAttribute("href", "/en/menu");
    expect(screen.getByRole("link", { name: "Reservations" })).toHaveAttribute(
      "href",
      "/en/reservations",
    );
  });
});
```

Create `frontend/components/footer.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";
import { getDictionary } from "@/content/get-dictionary";

describe("Footer", () => {
  it("credits Viña La Quirinca", async () => {
    const dict = await getDictionary("en");
    render(<Footer dictionary={dict} />);
    expect(screen.getByText("Part of Viña La Quirinca")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd frontend && npm test
```

Expected: FAIL — `./header` and `./footer` don't exist.

- [ ] **Step 3: Implement `Header` and `Footer`**

Create `frontend/components/header.tsx`:

```typescript
import Link from "next/link";
import type { Dictionary, Locale } from "@/content/get-dictionary";
import { LocaleToggle } from "./locale-toggle";

const NAV_ITEMS: Array<{ key: keyof Dictionary["nav"]; path: string }> = [
  { key: "home", path: "" },
  { key: "menu", path: "/menu" },
  { key: "gallery", path: "/gallery" },
  { key: "about", path: "/about" },
  { key: "contact", path: "/contact" },
  { key: "reservations", path: "/reservations" },
];

export function Header({
  dictionary,
  locale,
  pathname,
}: {
  dictionary: Dictionary;
  locale: Locale;
  pathname: string;
}) {
  return (
    <header className="flex items-center justify-between px-6 py-4 md:px-12">
      <Link href={`/${locale}`} className="font-display text-xl">
        La Labranza
      </Link>
      <nav className="flex items-center gap-6">
        {NAV_ITEMS.map(({ key, path }) => (
          <Link
            key={key}
            href={`/${locale}${path}`}
            className="font-label text-sm uppercase tracking-wide"
          >
            {dictionary.nav[key]}
          </Link>
        ))}
        <LocaleToggle currentLocale={locale} pathname={pathname} />
      </nav>
    </header>
  );
}
```

Create `frontend/components/footer.tsx`:

```typescript
import type { Dictionary } from "@/content/get-dictionary";

export function Footer({ dictionary }: { dictionary: Dictionary }) {
  return (
    <footer className="px-6 py-8 md:px-12 text-sm font-body">
      <p className="font-label uppercase tracking-wide">{dictionary.footer.partOf}</p>
      <p>&copy; {new Date().getFullYear()} La Labranza. {dictionary.footer.rights}</p>
    </footer>
  );
}
```

- [ ] **Step 4: Wire them into the locale layout**

Modify `frontend/app/[locale]/layout.tsx`:

```typescript
import { locales, getDictionary, type Locale } from "@/content/get-dictionary";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  return (
    <div lang={locale}>
      <Header dictionary={dictionary} locale={locale} pathname={`/${locale}`} />
      {children}
      <Footer dictionary={dictionary} />
    </div>
  );
}
```

Note: `pathname` is hardcoded to the locale root here because the layout doesn't have access to the active sub-path in a static-exported Server Component without a client boundary. This means the `LocaleToggle` in the header always links to the *root* of the other locale rather than the equivalent page. Accept this for v1 (still correct, just not path-preserving); if path-preserving toggling becomes a priority later, promote `Header` to a Client Component using `usePathname()`.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add frontend/components/header.tsx frontend/components/footer.tsx frontend/components/header.test.tsx frontend/components/footer.test.tsx frontend/app/[locale]/layout.tsx
git commit -m "$(cat <<'EOF'
feat(frontend): add Header and Footer, wire into locale layout

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 9: Restaurant static content config

**Files:**
- Create: `frontend/content/restaurant.ts`
- Test: `frontend/content/restaurant.test.ts`

**Interfaces:**
- Produces: `type RestaurantContent` (shape below), `restaurantContent: Record<Locale, RestaurantContent>` — consumed by Task 10 (Home hero photo path), Task 11 (Menu items), Task 13 (About address/hours/map), Task 14 (Contact phone/email).

- [ ] **Step 1: Write the failing test**

Create `frontend/content/restaurant.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { restaurantContent } from "./restaurant";

describe("restaurantContent", () => {
  it("has matching menu category counts across locales", () => {
    expect(restaurantContent.es.menu.length).toBe(restaurantContent.en.menu.length);
  });

  it("has a phone and email usable in tel:/mailto: links", () => {
    expect(restaurantContent.en.phone).toMatch(/^\+/);
    expect(restaurantContent.en.email).toContain("@");
  });

  it("has at least one gallery photo entry with alt text", () => {
    expect(restaurantContent.en.gallery.length).toBeGreaterThan(0);
    expect(restaurantContent.en.gallery[0].alt.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `./restaurant` does not exist.

- [ ] **Step 3: Implement the content config**

Create `frontend/content/restaurant.ts`. All bracketed values are placeholders the restaurant must supply before launch — this is the one file to edit when real content arrives:

```typescript
import type { Locale } from "./get-dictionary";

export type MenuItem = {
  name: string;
  description: string;
  price: string;
};

export type MenuCategory = {
  category: string;
  items: MenuItem[];
};

export type GalleryPhoto = {
  src: string;
  alt: string;
};

export type RestaurantContent = {
  address: string;
  phone: string;
  email: string;
  hours: string;
  mapEmbedSrc: string;
  heroPhoto: GalleryPhoto;
  gallery: GalleryPhoto[];
  menu: MenuCategory[];
};

const heroPhoto: GalleryPhoto = {
  src: "/images/hero-estate.jpg",
  alt: "The estate at golden hour, table set outdoors among the vines",
};

const gallery: GalleryPhoto[] = [
  { src: "/images/gallery-1.jpg", alt: "Outdoor dining table set among the vineyard rows" },
  { src: "/images/gallery-2.jpg", alt: "Chef preparing a dish tableside" },
  { src: "/images/gallery-3.jpg", alt: "Alpacas grazing on the estate grounds" },
];

const menuEn: MenuCategory[] = [
  {
    category: "To Start",
    items: [
      { name: "Placeholder empanada", description: "Placeholder description", price: "$8" },
      { name: "Placeholder pebre & bread", description: "Placeholder description", price: "$6" },
    ],
  },
  {
    category: "Cooked at Your Table",
    items: [
      { name: "Placeholder parrillada", description: "Placeholder description", price: "$42" },
    ],
  },
];

const menuEs: MenuCategory[] = [
  {
    category: "Para Empezar",
    items: [
      { name: "Empanada de referencia", description: "Descripción de referencia", price: "$8" },
      { name: "Pebre y pan de referencia", description: "Descripción de referencia", price: "$6" },
    ],
  },
  {
    category: "Cocinado en tu Mesa",
    items: [
      { name: "Parrillada de referencia", description: "Descripción de referencia", price: "$42" },
    ],
  },
];

export const restaurantContent: Record<Locale, RestaurantContent> = {
  en: {
    address: "[ADDRESS — REPLACE BEFORE LAUNCH]",
    phone: "+56 [PHONE — REPLACE BEFORE LAUNCH]",
    email: "reservas@lalabranza.example",
    hours: "Seatings Thursday–Sunday, 1:00 PM and 8:00 PM",
    mapEmbedSrc: "https://maps.google.com/maps?q=[COORDINATES]&output=embed",
    heroPhoto,
    gallery,
    menu: menuEn,
  },
  es: {
    address: "[DIRECCIÓN — REEMPLAZAR ANTES DEL LANZAMIENTO]",
    phone: "+56 [TELÉFONO — REEMPLAZAR ANTES DEL LANZAMIENTO]",
    email: "reservas@lalabranza.example",
    hours: "Servicio de jueves a domingo, 13:00 y 20:00 horas",
    mapEmbedSrc: "https://maps.google.com/maps?q=[COORDINATES]&output=embed",
    heroPhoto,
    gallery,
    menu: menuEs,
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/content/restaurant.ts frontend/content/restaurant.test.ts
git commit -m "$(cat <<'EOF'
feat(frontend): add restaurant static content config with placeholders

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 10: Home page

**Files:**
- Create: `frontend/app/[locale]/page.tsx`
- Test: `frontend/app/[locale]/page.test.tsx`

**Interfaces:**
- Consumes: `getDictionary` (Task 6), `restaurantContent` (Task 9), `FurrowDivider` (Task 5), `Eyebrow` (Task 3).

- [ ] **Step 1: Write the failing test**

Create `frontend/app/[locale]/page.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renders the headline, subhead, and a reservations CTA for English", async () => {
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(screen.getByRole("heading", { name: "La Labranza" })).toBeInTheDocument();
    expect(
      screen.getByText("A tableside table — dinner cooked, explained, and poured in front of you."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Reserve your seating" })).toHaveAttribute(
      "href",
      "/en/reservations",
    );
  });

  it("renders the hero photo with descriptive alt text", async () => {
    const Page = await HomePage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(
      screen.getByAltText("The estate at golden hour, table set outdoors among the vines"),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `frontend/app/[locale]/page.tsx` does not exist.

- [ ] **Step 3: Implement the Home page**

Create `frontend/app/[locale]/page.tsx`:

```typescript
import Image from "next/image";
import Link from "next/link";
import { getDictionary, type Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { Eyebrow } from "@/components/eyebrow";
import { FurrowDivider } from "@/components/furrow-divider";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);
  const content = restaurantContent[locale];

  return (
    <main>
      <section className="relative h-[80vh] min-h-[480px] w-full">
        <Image
          src={content.heroPhoto.src}
          alt={content.heroPhoto.alt}
          fill
          priority
          className="object-cover"
        />
        <FurrowDivider
          variant="hero"
          className="absolute inset-x-0 bottom-0 pointer-events-none"
        />
        <div className="absolute bottom-8 left-6 md:left-12 text-[var(--color-fibra-cruda)]">
          <Eyebrow className="text-[var(--color-fibra-cruda)]">
            {dict.home.eyebrow}
          </Eyebrow>
          <h1 className="font-display text-4xl md:text-6xl mt-2">{dict.home.headline}</h1>
          <p className="font-body text-lg mt-2 max-w-md">{dict.home.subhead}</p>
        </div>
      </section>

      <FurrowDivider />

      <section className="px-6 py-16 md:px-12 max-w-2xl">
        <p className="font-body text-lg">{dict.home.valueProp}</p>
        <Link
          href={`/${locale}/reservations`}
          className="inline-block mt-6 px-6 py-3 bg-[var(--color-vino-tinto)] text-[var(--color-fibra-cruda)] font-label uppercase tracking-wide"
        >
          {dict.home.cta}
        </Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 5: Verify the static build now produces the locale trees**

```bash
cd frontend && npm run build
```

Expected: `frontend/out/en/index.html` and `frontend/out/es/index.html` both exist.

- [ ] **Step 6: Commit**

```bash
git add "frontend/app/[locale]/page.tsx" "frontend/app/[locale]/page.test.tsx"
git commit -m "$(cat <<'EOF'
feat(frontend): add Home page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 11: Menu page

**Files:**
- Create: `frontend/app/[locale]/menu/page.tsx`
- Test: `frontend/app/[locale]/menu/page.test.tsx`

**Interfaces:**
- Consumes: `getDictionary`, `restaurantContent` (Task 9), `Eyebrow`, `FurrowDivider`.

- [ ] **Step 1: Write the failing test**

Create `frontend/app/[locale]/menu/page.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import MenuPage from "./page";

describe("MenuPage", () => {
  it("renders every category and item with its price", async () => {
    const Page = await MenuPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(screen.getByRole("heading", { name: "To Start" })).toBeInTheDocument();
    expect(screen.getByText("Placeholder empanada")).toBeInTheDocument();
    expect(screen.getByText("$8")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL.

- [ ] **Step 3: Implement the Menu page**

Create `frontend/app/[locale]/menu/page.tsx`:

```typescript
import { getDictionary, type Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";
import { FurrowDivider } from "@/components/furrow-divider";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  await getDictionary(locale);
  const content = restaurantContent[locale];

  return (
    <main className="px-6 py-16 md:px-12 max-w-3xl">
      {content.menu.map((category, i) => (
        <section key={category.category} className="mb-12">
          {i > 0 && <FurrowDivider className="mb-8" />}
          <h2 className="font-display text-2xl mb-4">{category.category}</h2>
          <ul>
            {category.items.map((item) => (
              <li
                key={item.name}
                className="flex justify-between items-baseline py-3 border-b border-[var(--color-cobre-viejo)]/20"
              >
                <div>
                  <p className="font-body">{item.name}</p>
                  <p className="font-body text-sm text-[var(--color-piedra-volcanica)]/70">
                    {item.description}
                  </p>
                </div>
                <span className="font-label">{item.price}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/[locale]/menu"
git commit -m "$(cat <<'EOF'
feat(frontend): add Menu page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 12: Gallery page

**Files:**
- Create: `frontend/app/[locale]/gallery/page.tsx`
- Test: `frontend/app/[locale]/gallery/page.test.tsx`

**Interfaces:**
- Consumes: `restaurantContent` (Task 9).

- [ ] **Step 1: Write the failing test**

Create `frontend/app/[locale]/gallery/page.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import GalleryPage from "./page";
import { restaurantContent } from "@/content/restaurant";

describe("GalleryPage", () => {
  it("renders one image per gallery entry with its alt text", async () => {
    const Page = await GalleryPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    for (const photo of restaurantContent.en.gallery) {
      expect(screen.getByAltText(photo.alt)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL.

- [ ] **Step 3: Implement the Gallery page**

Create `frontend/app/[locale]/gallery/page.tsx`:

```typescript
import Image from "next/image";
import type { Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const content = restaurantContent[locale];

  return (
    <main className="px-6 py-16 md:px-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {content.gallery.map((photo) => (
          <div key={photo.src} className="relative aspect-[4/3]">
            <Image src={photo.src} alt={photo.alt} fill className="object-cover" />
          </div>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/[locale]/gallery"
git commit -m "$(cat <<'EOF'
feat(frontend): add Gallery page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 13: About/Location page

**Files:**
- Create: `frontend/app/[locale]/about/page.tsx`
- Test: `frontend/app/[locale]/about/page.test.tsx`

**Interfaces:**
- Consumes: `restaurantContent` (Task 9).

- [ ] **Step 1: Write the failing test**

Create `frontend/app/[locale]/about/page.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import AboutPage from "./page";
import { restaurantContent } from "@/content/restaurant";

describe("AboutPage", () => {
  it("renders the address and hours", async () => {
    const Page = await AboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(screen.getByText(restaurantContent.en.address)).toBeInTheDocument();
    expect(screen.getByText(restaurantContent.en.hours)).toBeInTheDocument();
  });

  it("embeds a map iframe", async () => {
    const Page = await AboutPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    expect(screen.getByTitle("Location map")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL.

- [ ] **Step 3: Implement the About page**

Create `frontend/app/[locale]/about/page.tsx`:

```typescript
import type { Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const content = restaurantContent[locale];

  return (
    <main className="px-6 py-16 md:px-12 max-w-2xl">
      <address className="font-body not-italic">
        <p>{content.address}</p>
        <p>{content.hours}</p>
      </address>
      <iframe
        title="Location map"
        src={content.mapEmbedSrc}
        className="mt-8 w-full h-96 border-0"
        loading="lazy"
      />
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/[locale]/about"
git commit -m "$(cat <<'EOF'
feat(frontend): add About/Location page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 14: Contact page

**Files:**
- Create: `frontend/app/[locale]/contact/page.tsx`
- Test: `frontend/app/[locale]/contact/page.test.tsx`

**Interfaces:**
- Consumes: `restaurantContent` (Task 9).

- [ ] **Step 1: Write the failing test**

Create `frontend/app/[locale]/contact/page.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import ContactPage from "./page";
import { restaurantContent } from "@/content/restaurant";

describe("ContactPage", () => {
  it("renders working tel: and mailto: links", async () => {
    const Page = await ContactPage({ params: Promise.resolve({ locale: "en" }) });
    render(Page);
    const { phone, email } = restaurantContent.en;
    expect(screen.getByRole("link", { name: phone })).toHaveAttribute(
      "href",
      `tel:${phone.replace(/\s+/g, "")}`,
    );
    expect(screen.getByRole("link", { name: email })).toHaveAttribute("href", `mailto:${email}`);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL.

- [ ] **Step 3: Implement the Contact page**

Create `frontend/app/[locale]/contact/page.tsx`:

```typescript
import type { Locale } from "@/content/get-dictionary";
import { restaurantContent } from "@/content/restaurant";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const content = restaurantContent[locale];

  return (
    <main className="px-6 py-16 md:px-12 max-w-2xl font-body">
      <p>
        <a href={`tel:${content.phone.replace(/\s+/g, "")}`}>{content.phone}</a>
      </p>
      <p>
        <a href={`mailto:${content.email}`}>{content.email}</a>
      </p>
    </main>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add "frontend/app/[locale]/contact"
git commit -m "$(cat <<'EOF'
feat(frontend): add Contact page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 15: MySQL schema and seed data

**Files:**
- Create: `backend/migrations/001_schema.sql`
- Create: `backend/migrations/002_seed.sql`

**Interfaces:**
- Produces: the `restaurants`, `admin_users`, `reservations`, `capacity_rules` tables, and one seeded restaurant/admin/capacity-rule row — consumed by every backend task from here on (16 through 22).

- [ ] **Step 1: Write the schema migration**

Create `backend/migrations/001_schema.sql`:

```sql
CREATE TABLE restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  hours VARCHAR(500) NOT NULL,
  default_locale VARCHAR(5) NOT NULL DEFAULT 'en'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  username VARCHAR(64) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  UNIQUE KEY uniq_restaurant_username (restaurant_id, username),
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE capacity_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  day_of_week TINYINT NULL COMMENT '0=Sunday..6=Saturday, NULL means date_override is set instead',
  date_override DATE NULL,
  time_slot TIME NOT NULL,
  max_covers INT NOT NULL,
  slot_length_minutes INT NOT NULL DEFAULT 120,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  INDEX idx_restaurant_slot (restaurant_id, time_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reservations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurant_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  party_size INT NOT NULL,
  reservation_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurant_id) REFERENCES restaurants(id),
  INDEX idx_restaurant_date_slot (restaurant_id, reservation_date, time_slot)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

- [ ] **Step 2: Write the seed data**

Create `backend/migrations/002_seed.sql`. The password hash below is `password_hash('changeme123', PASSWORD_DEFAULT)` computed once — Task 20 documents how to regenerate it for a real password:

```sql
INSERT INTO restaurants (slug, name, address, phone, hours, default_locale)
VALUES (
  'la-labranza',
  'La Labranza',
  '[ADDRESS — REPLACE BEFORE LAUNCH]',
  '+56 [PHONE — REPLACE BEFORE LAUNCH]',
  'Seatings Thursday-Sunday, 1:00 PM and 8:00 PM',
  'en'
);

INSERT INTO admin_users (restaurant_id, username, password_hash)
VALUES (
  (SELECT id FROM restaurants WHERE slug = 'la-labranza'),
  'staff',
  '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
);

INSERT INTO capacity_rules (restaurant_id, day_of_week, time_slot, max_covers, slot_length_minutes)
SELECT id, dow, slot, 24, 120
FROM restaurants
CROSS JOIN (SELECT 4 AS dow UNION SELECT 5 UNION SELECT 6 UNION SELECT 0) days
CROSS JOIN (SELECT '13:00:00' AS slot UNION SELECT '20:00:00') slots
WHERE slug = 'la-labranza';
```

- [ ] **Step 3: Apply and verify locally**

Requires a local MySQL server running (adjust host/user/password flags to match your local setup):

```bash
mysql -u root -p -e "CREATE DATABASE lalabranza_dev;"
mysql -u root -p lalabranza_dev < backend/migrations/001_schema.sql
mysql -u root -p lalabranza_dev < backend/migrations/002_seed.sql
mysql -u root -p lalabranza_dev -e "SHOW TABLES; SELECT * FROM restaurants; SELECT COUNT(*) FROM capacity_rules;"
```

Expected: four tables listed, one restaurant row, 8 capacity_rules rows (4 days × 2 slots).

- [ ] **Step 4: Commit**

```bash
git add backend/migrations
git commit -m "$(cat <<'EOF'
feat(backend): add MySQL schema and seed data

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 16: Capacity calculation (pure function + PHPUnit)

**Files:**
- Create: `backend/composer.json`
- Create: `backend/phpunit.xml`
- Create: `backend/src/Capacity.php`
- Test: `backend/tests/CapacityTest.php`

**Interfaces:**
- Produces: `Labranza\Capacity::remaining(int $maxCovers, array $existingPartySizes): int` — consumed by Task 18 (`availability.php`) and Task 19 (`reservations_create.php`).

- [ ] **Step 1: Set up Composer and PHPUnit**

Create `backend/composer.json`:

```json
{
  "name": "lalabranza/backend",
  "require": {
    "php": ">=8.1"
  },
  "require-dev": {
    "phpunit/phpunit": "^10.0"
  },
  "autoload": {
    "psr-4": {
      "Labranza\\": "src/"
    }
  },
  "autoload-dev": {
    "psr-4": {
      "Labranza\\Tests\\": "tests/"
    }
  }
}
```

```bash
cd backend && composer install
```

Create `backend/phpunit.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit bootstrap="vendor/autoload.php" colors="true">
  <testsuites>
    <testsuite name="Backend">
      <directory>tests</directory>
    </testsuite>
  </testsuites>
</phpunit>
```

- [ ] **Step 2: Write the failing test**

Create `backend/tests/CapacityTest.php`:

```php
<?php

namespace Labranza\Tests;

use Labranza\Capacity;
use PHPUnit\Framework\TestCase;

final class CapacityTest extends TestCase
{
    public function testFullCapacityWhenNoExistingReservations(): void
    {
        $this->assertSame(24, Capacity::remaining(24, []));
    }

    public function testSubtractsNonCancelledPartySizes(): void
    {
        $this->assertSame(14, Capacity::remaining(24, [4, 6]));
    }

    public function testNeverReturnsNegative(): void
    {
        $this->assertSame(0, Capacity::remaining(10, [8, 8]));
    }

    public function testZeroMaxCoversMeansNoCapacity(): void
    {
        $this->assertSame(0, Capacity::remaining(0, []));
    }
}
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd backend && vendor/bin/phpunit
```

Expected: FAIL — class `Labranza\Capacity` not found.

- [ ] **Step 4: Implement `Capacity`**

Create `backend/src/Capacity.php`:

```php
<?php

namespace Labranza;

final class Capacity
{
    /**
     * @param int[] $existingPartySizes party sizes of non-cancelled
     *        reservations already booked for this restaurant/date/slot
     */
    public static function remaining(int $maxCovers, array $existingPartySizes): int
    {
        $booked = array_sum($existingPartySizes);
        return max(0, $maxCovers - $booked);
    }
}
```

- [ ] **Step 5: Run test to verify it passes**

```bash
cd backend && vendor/bin/phpunit
```

Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add backend/composer.json backend/composer.lock backend/phpunit.xml backend/src/Capacity.php backend/tests/CapacityTest.php
git commit -m "$(cat <<'EOF'
feat(backend): add Capacity::remaining with PHPUnit coverage

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 17: Database connection helper and config

**Files:**
- Create: `backend/src/Db.php`
- Create: `backend/config.example.php`
- Modify: `backend/.gitignore` (create if absent) — ignore `config.php`

**Interfaces:**
- Produces: `Labranza\Db::connect(): PDO` — consumed by every `backend/webdb/*.php` endpoint (Tasks 18–22).

- [ ] **Step 1: Create the example config and gitignore**

Create `backend/config.example.php`:

```php
<?php

return [
    'db_host' => '127.0.0.1',
    'db_name' => 'lalabranza_dev',
    'db_user' => 'root',
    'db_pass' => '',
];
```

Create `backend/.gitignore`:

```
config.php
vendor/
```

- [ ] **Step 2: Implement `Db`**

Create `backend/src/Db.php`:

```php
<?php

namespace Labranza;

use PDO;
use PDOException;

final class Db
{
    private static ?PDO $connection = null;

    public static function connect(): PDO
    {
        if (self::$connection !== null) {
            return self::$connection;
        }

        $configPath = __DIR__ . '/../config.php';
        if (!file_exists($configPath)) {
            throw new \RuntimeException(
                'backend/config.php not found. Copy config.example.php to config.php and fill in real credentials.',
            );
        }

        $config = require $configPath;

        try {
            self::$connection = new PDO(
                sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $config['db_host'], $config['db_name']),
                $config['db_user'],
                $config['db_pass'],
                [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],
            );
        } catch (PDOException $e) {
            throw new \RuntimeException('Database connection failed: ' . $e->getMessage(), 0, $e);
        }

        return self::$connection;
    }
}
```

- [ ] **Step 3: Verify manually**

```bash
cp backend/config.example.php backend/config.php
php -r "require 'backend/vendor/autoload.php'; var_dump(Labranza\Db::connect());"
```

Expected: prints a `PDO` object with no exception (assuming the local MySQL DB from Task 15 is running and `config.php`'s credentials match it).

- [ ] **Step 4: Commit**

Note: `config.php` itself must never be committed (it's gitignored) — only the example and the helper.

```bash
git add backend/src/Db.php backend/config.example.php backend/.gitignore
git commit -m "$(cat <<'EOF'
feat(backend): add PDO connection helper and example config

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 18: `availability.php` endpoint

**Files:**
- Create: `backend/webdb/availability.php`

**Interfaces:**
- Consumes: `Labranza\Db::connect()` (Task 17), `Labranza\Capacity::remaining()` (Task 16).
- Produces: `GET /webdb/availability.php?date=YYYY-MM-DD&time_slot=HH:MM:SS` → `{"remaining": <int>}` or `{"remaining": 0}` when no matching capacity rule exists — consumed by Task 23 (reservation form).

- [ ] **Step 1: Implement the endpoint**

Create `backend/webdb/availability.php`:

```php
<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Capacity;
use Labranza\Db;

header('Content-Type: application/json');

$date = $_GET['date'] ?? null;
$timeSlot = $_GET['time_slot'] ?? null;

if (!$date || !$timeSlot || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)) {
    http_response_code(400);
    echo json_encode(['error' => 'date (YYYY-MM-DD) and time_slot are required']);
    exit;
}

$pdo = Db::connect();

// v1 has exactly one restaurant, but every query is still scoped by
// restaurant_id per the spec's tenant-isolation rule.
$restaurantId = (int) $pdo->query("SELECT id FROM restaurants WHERE slug = 'la-labranza'")->fetchColumn();

$dayOfWeek = (int) date('w', strtotime($date));

$ruleStmt = $pdo->prepare(
    'SELECT max_covers FROM capacity_rules
     WHERE restaurant_id = :restaurant_id
       AND time_slot = :time_slot
       AND (date_override = :date OR (date_override IS NULL AND day_of_week = :day_of_week))
     ORDER BY date_override IS NULL ASC
     LIMIT 1',
);
$ruleStmt->execute([
    'restaurant_id' => $restaurantId,
    'time_slot' => $timeSlot,
    'date' => $date,
    'day_of_week' => $dayOfWeek,
]);
$maxCovers = $ruleStmt->fetchColumn();

if ($maxCovers === false) {
    echo json_encode(['remaining' => 0]);
    exit;
}

$reservationsStmt = $pdo->prepare(
    "SELECT party_size FROM reservations
     WHERE restaurant_id = :restaurant_id
       AND reservation_date = :date
       AND time_slot = :time_slot
       AND status != 'cancelled'",
);
$reservationsStmt->execute([
    'restaurant_id' => $restaurantId,
    'date' => $date,
    'time_slot' => $timeSlot,
]);
$existingPartySizes = array_map('intval', $reservationsStmt->fetchAll(\PDO::FETCH_COLUMN));

echo json_encode(['remaining' => Capacity::remaining((int) $maxCovers, $existingPartySizes)]);
```

- [ ] **Step 2: Verify manually**

```bash
cd backend && php -S localhost:8000 &
curl "http://localhost:8000/webdb/availability.php?date=2026-09-17&time_slot=13:00:00"
```

Expected: `2026-09-17` is a Thursday (`day_of_week` 4) — response `{"remaining":24}` (matches the seeded `max_covers`). Try a date with no matching rule (e.g. a Monday) and expect `{"remaining":0}`. Stop the dev server (`kill %1`) when done.

- [ ] **Step 3: Commit**

```bash
git add backend/webdb/availability.php
git commit -m "$(cat <<'EOF'
feat(backend): add availability.php endpoint

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 19: `reservations_create.php` endpoint

**Files:**
- Create: `backend/webdb/reservations_create.php`

**Interfaces:**
- Consumes: `Labranza\Db::connect()`, `Labranza\Capacity::remaining()`.
- Produces: `POST /webdb/reservations_create.php` with JSON body `{date, time_slot, party_size, name, email, phone, notes?}` → `{"status": "pending", "id": <int>}` on success, `{"error": "..."}` with 4xx status otherwise — consumed by Task 23.

- [ ] **Step 1: Implement the endpoint**

Create `backend/webdb/reservations_create.php`:

```php
<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Capacity;
use Labranza\Db;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST required']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];

$date = $body['date'] ?? null;
$timeSlot = $body['time_slot'] ?? null;
$partySize = isset($body['party_size']) ? (int) $body['party_size'] : null;
$name = trim($body['name'] ?? '');
$email = trim($body['email'] ?? '');
$phone = trim($body['phone'] ?? '');
$notes = trim($body['notes'] ?? '');

if (
    !$date || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date)
    || !$timeSlot
    || !$partySize || $partySize < 1
    || !$name
    || !filter_var($email, FILTER_VALIDATE_EMAIL)
    || !$phone
) {
    http_response_code(422);
    echo json_encode(['error' => 'Missing or invalid reservation fields']);
    exit;
}

$pdo = Db::connect();
$restaurantId = (int) $pdo->query("SELECT id FROM restaurants WHERE slug = 'la-labranza'")->fetchColumn();

$pdo->beginTransaction();

try {
    // Re-check capacity inside the transaction with a row lock on the
    // capacity rule, so two concurrent requests can't both succeed past
    // the limit.
    $dayOfWeek = (int) date('w', strtotime($date));
    $ruleStmt = $pdo->prepare(
        'SELECT max_covers FROM capacity_rules
         WHERE restaurant_id = :restaurant_id
           AND time_slot = :time_slot
           AND (date_override = :date OR (date_override IS NULL AND day_of_week = :day_of_week))
         ORDER BY date_override IS NULL ASC
         LIMIT 1 FOR UPDATE',
    );
    $ruleStmt->execute([
        'restaurant_id' => $restaurantId,
        'time_slot' => $timeSlot,
        'date' => $date,
        'day_of_week' => $dayOfWeek,
    ]);
    $maxCovers = $ruleStmt->fetchColumn();

    if ($maxCovers === false) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['error' => 'No availability for that date/time']);
        exit;
    }

    $existingStmt = $pdo->prepare(
        "SELECT party_size FROM reservations
         WHERE restaurant_id = :restaurant_id
           AND reservation_date = :date
           AND time_slot = :time_slot
           AND status != 'cancelled'
         FOR UPDATE",
    );
    $existingStmt->execute([
        'restaurant_id' => $restaurantId,
        'date' => $date,
        'time_slot' => $timeSlot,
    ]);
    $existingPartySizes = array_map('intval', $existingStmt->fetchAll(\PDO::FETCH_COLUMN));

    $remaining = Capacity::remaining((int) $maxCovers, $existingPartySizes);

    if ($remaining < $partySize) {
        $pdo->rollBack();
        http_response_code(409);
        echo json_encode(['error' => 'Not enough remaining capacity for that party size']);
        exit;
    }

    $insertStmt = $pdo->prepare(
        "INSERT INTO reservations
            (restaurant_id, name, email, phone, party_size, reservation_date, time_slot, status, notes)
         VALUES
            (:restaurant_id, :name, :email, :phone, :party_size, :date, :time_slot, 'pending', :notes)",
    );
    $insertStmt->execute([
        'restaurant_id' => $restaurantId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'party_size' => $partySize,
        'date' => $date,
        'time_slot' => $timeSlot,
        'notes' => $notes ?: null,
    ]);

    $id = (int) $pdo->lastInsertId();
    $pdo->commit();

    echo json_encode(['status' => 'pending', 'id' => $id]);
} catch (\Throwable $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Could not create reservation']);
}
```

- [ ] **Step 2: Verify manually**

```bash
cd backend && php -S localhost:8000 &
curl -X POST "http://localhost:8000/webdb/reservations_create.php" \
  -H "Content-Type: application/json" \
  -d '{"date":"2026-09-17","time_slot":"13:00:00","party_size":4,"name":"Test Guest","email":"test@example.com","phone":"+15551234567"}'
```

Expected: `{"status":"pending","id":1}`. Re-run with `"party_size": 25` and expect a 409 with an error (exceeds the seeded 24-cover limit). Verify the row landed: `mysql -u root -p lalabranza_dev -e "SELECT * FROM reservations;"`. Stop the dev server when done.

- [ ] **Step 3: Commit**

```bash
git add backend/webdb/reservations_create.php
git commit -m "$(cat <<'EOF'
feat(backend): add reservations_create.php endpoint

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 20: Admin session helper, login, and logout

**Files:**
- Create: `backend/src/Session.php`
- Create: `backend/webdb/admin_login.php`
- Create: `backend/webdb/admin_logout.php`

**Interfaces:**
- Produces: `Labranza\Session::requireAdmin(): array` (returns the session's admin payload or sends a 401 JSON response and exits) — consumed by Task 21 and Task 22. `POST /webdb/admin_login.php` `{username, password}` → sets a PHP session cookie and returns `{"status":"ok"}`, or 401. `POST /webdb/admin_logout.php` → destroys the session.

- [ ] **Step 1: Implement `Session`**

Create `backend/src/Session.php`:

```php
<?php

namespace Labranza;

final class Session
{
    public static function start(): void
    {
        if (session_status() !== PHP_SESSION_ACTIVE) {
            session_start();
        }
    }

    public static function login(int $adminUserId, int $restaurantId): void
    {
        self::start();
        $_SESSION['admin_user_id'] = $adminUserId;
        $_SESSION['restaurant_id'] = $restaurantId;
    }

    public static function logout(): void
    {
        self::start();
        $_SESSION = [];
        session_destroy();
    }

    /**
     * @return array{admin_user_id: int, restaurant_id: int}
     */
    public static function requireAdmin(): array
    {
        self::start();
        if (!isset($_SESSION['admin_user_id'], $_SESSION['restaurant_id'])) {
            http_response_code(401);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Not authenticated']);
            exit;
        }

        return [
            'admin_user_id' => $_SESSION['admin_user_id'],
            'restaurant_id' => $_SESSION['restaurant_id'],
        ];
    }
}
```

- [ ] **Step 2: Implement `admin_login.php` and `admin_logout.php`**

Create `backend/webdb/admin_login.php`:

```php
<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Db;
use Labranza\Session;

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST required']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$username = trim($body['username'] ?? '');
$password = $body['password'] ?? '';

if (!$username || !$password) {
    http_response_code(422);
    echo json_encode(['error' => 'username and password are required']);
    exit;
}

$pdo = Db::connect();
$stmt = $pdo->prepare('SELECT id, restaurant_id, password_hash FROM admin_users WHERE username = :username');
$stmt->execute(['username' => $username]);
$admin = $stmt->fetch(\PDO::FETCH_ASSOC);

if (!$admin || !password_verify($password, $admin['password_hash'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
    exit;
}

Session::login((int) $admin['id'], (int) $admin['restaurant_id']);
echo json_encode(['status' => 'ok']);
```

Create `backend/webdb/admin_logout.php`:

```php
<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Session;

header('Content-Type: application/json');
Session::logout();
echo json_encode(['status' => 'ok']);
```

- [ ] **Step 3: Verify manually**

The seeded password from Task 15 is `changeme123`. To generate a hash for a real password before launch: `php -r "echo password_hash('YOUR_REAL_PASSWORD', PASSWORD_DEFAULT);"` and `UPDATE admin_users SET password_hash = '<result>' WHERE username = 'staff';`.

```bash
cd backend && php -S localhost:8000 &
curl -i -c /tmp/labranza-cookie.txt -X POST "http://localhost:8000/webdb/admin_login.php" \
  -H "Content-Type: application/json" \
  -d '{"username":"staff","password":"changeme123"}'
```

Expected: `HTTP/1.1 200 OK`, body `{"status":"ok"}`, and a `Set-Cookie` header for `PHPSESSID`. Then:

```bash
curl -i -X POST "http://localhost:8000/webdb/admin_login.php" \
  -H "Content-Type: application/json" \
  -d '{"username":"staff","password":"wrong"}'
```

Expected: `HTTP/1.1 401`. Stop the dev server when done.

- [ ] **Step 4: Commit**

```bash
git add backend/src/Session.php backend/webdb/admin_login.php backend/webdb/admin_logout.php
git commit -m "$(cat <<'EOF'
feat(backend): add admin session helper, login, and logout endpoints

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 21: `admin_reservations_list.php` endpoint

**Files:**
- Create: `backend/webdb/admin_reservations_list.php`

**Interfaces:**
- Consumes: `Labranza\Session::requireAdmin()`, `Labranza\Db::connect()`.
- Produces: `GET /webdb/admin_reservations_list.php` (session-gated) → `{"reservations": [{id, name, email, phone, party_size, reservation_date, time_slot, status, notes}, ...]}` for the logged-in admin's restaurant, from today onward — consumed by Task 25.

- [ ] **Step 1: Implement the endpoint**

Create `backend/webdb/admin_reservations_list.php`:

```php
<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Db;
use Labranza\Session;

header('Content-Type: application/json');

$session = Session::requireAdmin();
$pdo = Db::connect();

$stmt = $pdo->prepare(
    'SELECT id, name, email, phone, party_size, reservation_date, time_slot, status, notes
     FROM reservations
     WHERE restaurant_id = :restaurant_id
       AND reservation_date >= CURDATE()
     ORDER BY reservation_date ASC, time_slot ASC',
);
$stmt->execute(['restaurant_id' => $session['restaurant_id']]);

echo json_encode(['reservations' => $stmt->fetchAll(\PDO::FETCH_ASSOC)]);
```

- [ ] **Step 2: Verify manually**

```bash
cd backend && php -S localhost:8000 &
curl -i "http://localhost:8000/webdb/admin_reservations_list.php"
```

Expected: `401` without a session cookie. Then, reusing the cookie jar from Task 20's login:

```bash
curl -b /tmp/labranza-cookie.txt "http://localhost:8000/webdb/admin_reservations_list.php"
```

Expected: `200` with `{"reservations":[...]}` including the reservation created in Task 19 (if its date is today or later). Stop the dev server when done.

- [ ] **Step 3: Commit**

```bash
git add backend/webdb/admin_reservations_list.php
git commit -m "$(cat <<'EOF'
feat(backend): add admin_reservations_list.php endpoint

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 22: `admin_reservations_update.php` endpoint

**Files:**
- Create: `backend/webdb/admin_reservations_update.php`

**Interfaces:**
- Consumes: `Labranza\Session::requireAdmin()`, `Labranza\Db::connect()`.
- Produces: `POST /webdb/admin_reservations_update.php` `{id, status}` (`status` one of `confirmed`/`cancelled`) → `{"status": "ok"}` or 404/422 — consumed by Task 25.

- [ ] **Step 1: Implement the endpoint**

Create `backend/webdb/admin_reservations_update.php`:

```php
<?php

require __DIR__ . '/../vendor/autoload.php';

use Labranza\Db;
use Labranza\Session;

header('Content-Type: application/json');

$session = Session::requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST required']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$id = isset($body['id']) ? (int) $body['id'] : null;
$status = $body['status'] ?? null;

if (!$id || !in_array($status, ['confirmed', 'cancelled'], true)) {
    http_response_code(422);
    echo json_encode(['error' => 'id and a valid status (confirmed|cancelled) are required']);
    exit;
}

$pdo = Db::connect();
$stmt = $pdo->prepare(
    'UPDATE reservations SET status = :status WHERE id = :id AND restaurant_id = :restaurant_id',
);
$stmt->execute([
    'status' => $status,
    'id' => $id,
    'restaurant_id' => $session['restaurant_id'],
]);

if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['error' => 'Reservation not found']);
    exit;
}

echo json_encode(['status' => 'ok']);
```

- [ ] **Step 2: Verify manually**

```bash
cd backend && php -S localhost:8000 &
curl -b /tmp/labranza-cookie.txt -X POST "http://localhost:8000/webdb/admin_reservations_update.php" \
  -H "Content-Type: application/json" \
  -d '{"id":1,"status":"confirmed"}'
```

Expected: `{"status":"ok"}`. Verify: `mysql -u root -p lalabranza_dev -e "SELECT id, status FROM reservations WHERE id = 1;"` shows `confirmed`. Stop the dev server when done.

- [ ] **Step 3: Commit**

```bash
git add backend/webdb/admin_reservations_update.php
git commit -m "$(cat <<'EOF'
feat(backend): add admin_reservations_update.php endpoint

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 23: Reservation form page

**Files:**
- Create: `frontend/lib/api.ts`
- Create: `frontend/app/[locale]/reservations/page.tsx`
- Create: `frontend/components/reservation-form.tsx`
- Test: `frontend/components/reservation-form.test.tsx`
- Modify: `frontend/package.json` (add `react-hook-form`, `zod`, `@hookform/resolvers`)

**Interfaces:**
- Consumes: shadcn `Field`/`FieldLabel`/`FieldError`/`Input`/`Select`/`Button` (Task 4), `Dictionary` (Task 6), `checkAvailability`/`createReservation` (this task's `lib/api.ts`).
- Produces: `<ReservationForm dictionary={dict} />`, `checkAvailability(date, timeSlot): Promise<{remaining: number}>`, `createReservation(payload): Promise<{status: string; id: number} | {error: string}>` — the API functions are what Task 19/18's manual `curl` checks proved the shape of.

- [ ] **Step 1: Install form dependencies**

```bash
cd frontend
npm install react-hook-form zod @hookform/resolvers
```

- [ ] **Step 2: Write the failing test**

Create `frontend/components/reservation-form.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReservationForm } from "./reservation-form";
import { getDictionary } from "@/content/get-dictionary";
import * as api from "@/lib/api";

vi.mock("@/lib/api");

describe("ReservationForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("shows a focusable error summary and per-field errors on empty submit", async () => {
    const dict = await getDictionary("en");
    render(<ReservationForm dictionary={dict} />);

    fireEvent.click(screen.getByRole("button", { name: dict.reservations.submit }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(dict.reservations.errorSummaryTitle);
    });
    expect(screen.getByLabelText(dict.reservations.nameLabel)).toBeInvalid();
  });

  it("submits successfully when the form is valid and capacity remains", async () => {
    vi.mocked(api.checkAvailability).mockResolvedValue({ remaining: 4 });
    vi.mocked(api.createReservation).mockResolvedValue({ status: "pending", id: 1 });

    const dict = await getDictionary("en");
    const user = userEvent.setup();
    render(<ReservationForm dictionary={dict} />);

    await user.type(screen.getByLabelText(dict.reservations.dateLabel), "2026-09-17");
    await user.selectOptions(screen.getByLabelText(dict.reservations.timeLabel), "13:00:00");
    await user.type(screen.getByLabelText(dict.reservations.partySizeLabel), "2");
    await user.type(screen.getByLabelText(dict.reservations.nameLabel), "Jane Doe");
    await user.type(screen.getByLabelText(dict.reservations.emailLabel), "jane@example.com");
    await user.type(screen.getByLabelText(dict.reservations.phoneLabel), "+15551234567");

    await user.click(screen.getByRole("button", { name: dict.reservations.submit }));

    await waitFor(() => {
      expect(screen.getByText(dict.reservations.successTitle)).toBeInTheDocument();
    });
    expect(api.createReservation).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Jane Doe", partySize: 2 }),
    );
  });

  it("shows the no-capacity message when the party size exceeds remaining capacity", async () => {
    vi.mocked(api.checkAvailability).mockResolvedValue({ remaining: 1 });

    const dict = await getDictionary("en");
    const user = userEvent.setup();
    render(<ReservationForm dictionary={dict} />);

    await user.type(screen.getByLabelText(dict.reservations.dateLabel), "2026-09-17");
    await user.selectOptions(screen.getByLabelText(dict.reservations.timeLabel), "13:00:00");
    await user.type(screen.getByLabelText(dict.reservations.partySizeLabel), "4");
    await user.type(screen.getByLabelText(dict.reservations.nameLabel), "Jane Doe");
    await user.type(screen.getByLabelText(dict.reservations.emailLabel), "jane@example.com");
    await user.type(screen.getByLabelText(dict.reservations.phoneLabel), "+15551234567");

    await user.click(screen.getByRole("button", { name: dict.reservations.submit }));

    await waitFor(() => {
      expect(screen.getByText(dict.reservations.noCapacity)).toBeInTheDocument();
    });
    expect(api.createReservation).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd frontend && npm install -D @testing-library/user-event && npm test
```

Expected: FAIL — `./reservation-form` and `@/lib/api` don't exist.

- [ ] **Step 4: Implement `lib/api.ts`**

Create `frontend/lib/api.ts`:

```typescript
export type ReservationPayload = {
  date: string;
  timeSlot: string;
  partySize: number;
  name: string;
  email: string;
  phone: string;
  notes?: string;
};

export async function checkAvailability(
  date: string,
  timeSlot: string,
): Promise<{ remaining: number }> {
  const res = await fetch(
    `/webdb/availability.php?date=${encodeURIComponent(date)}&time_slot=${encodeURIComponent(timeSlot)}`,
  );
  return res.json();
}

export async function createReservation(
  payload: ReservationPayload,
): Promise<{ status: string; id: number } | { error: string }> {
  const res = await fetch("/webdb/reservations_create.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      date: payload.date,
      time_slot: payload.timeSlot,
      party_size: payload.partySize,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      notes: payload.notes,
    }),
  });
  return res.json();
}
```

- [ ] **Step 5: Implement `ReservationForm`**

Create `frontend/components/reservation-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Dictionary } from "@/content/get-dictionary";
import { checkAvailability, createReservation } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const TIME_SLOTS = ["13:00:00", "20:00:00"];

const schema = z.object({
  date: z.string().min(1),
  timeSlot: z.enum(["13:00:00", "20:00:00"]),
  partySize: z.coerce.number().int().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ReservationForm({ dictionary }: { dictionary: Dictionary }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const [result, setResult] = useState<"idle" | "success" | "no_capacity" | "error">("idle");

  const hasErrors = Object.keys(errors).length > 0;

  const onSubmit = async (values: FormValues) => {
    setResult("idle");
    const availability = await checkAvailability(values.date, values.timeSlot);
    if (availability.remaining < values.partySize) {
      setResult("no_capacity");
      return;
    }

    const response = await createReservation({
      date: values.date,
      timeSlot: values.timeSlot,
      partySize: values.partySize,
      name: values.name,
      email: values.email,
      phone: values.phone,
      notes: values.notes,
    });

    if ("error" in response) {
      setResult("error");
      return;
    }

    setResult("success");
  };

  if (result === "success") {
    return (
      <div>
        <h2 className="font-display text-2xl">{dictionary.reservations.successTitle}</h2>
        <p className="font-body">{dictionary.reservations.successBody}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {hasErrors && (
        <div role="alert" tabIndex={-1} className="mb-4 border border-[var(--color-vino-tinto)] p-4">
          <h2 className="font-label uppercase text-sm">{dictionary.reservations.errorSummaryTitle}</h2>
          <ul>
            {Object.entries(errors).map(([field, error]) => (
              <li key={field}>
                <a href={`#field-${field}`}>{error?.message ?? field}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result === "no_capacity" && (
        <p className="mb-4 font-body text-[var(--color-vino-tinto)]">
          {dictionary.reservations.noCapacity}
        </p>
      )}

      <div className="mb-4">
        <label htmlFor="field-date" className="block font-label text-sm">
          {dictionary.reservations.dateLabel}
        </label>
        <Input
          id="field-date"
          type="date"
          aria-invalid={!!errors.date}
          {...register("date")}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="field-timeSlot" className="block font-label text-sm">
          {dictionary.reservations.timeLabel}
        </label>
        <select id="field-timeSlot" aria-invalid={!!errors.timeSlot} {...register("timeSlot")}>
          {TIME_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {slot.slice(0, 5)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="field-partySize" className="block font-label text-sm">
          {dictionary.reservations.partySizeLabel}
        </label>
        <Input
          id="field-partySize"
          type="number"
          min={1}
          aria-invalid={!!errors.partySize}
          {...register("partySize")}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="field-name" className="block font-label text-sm">
          {dictionary.reservations.nameLabel}
        </label>
        <Input id="field-name" aria-invalid={!!errors.name} {...register("name")} />
      </div>

      <div className="mb-4">
        <label htmlFor="field-email" className="block font-label text-sm">
          {dictionary.reservations.emailLabel}
        </label>
        <Input id="field-email" type="email" aria-invalid={!!errors.email} {...register("email")} />
      </div>

      <div className="mb-4">
        <label htmlFor="field-phone" className="block font-label text-sm">
          {dictionary.reservations.phoneLabel}
        </label>
        <Input id="field-phone" type="tel" aria-invalid={!!errors.phone} {...register("phone")} />
      </div>

      <div className="mb-4">
        <label htmlFor="field-notes" className="block font-label text-sm">
          {dictionary.reservations.notesLabel}
        </label>
        <textarea id="field-notes" {...register("notes")} />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? dictionary.reservations.submitting : dictionary.reservations.submit}
      </Button>
    </form>
  );
}
```

- [ ] **Step 6: Create the Reservations page**

Create `frontend/app/[locale]/reservations/page.tsx`:

```typescript
import { getDictionary, type Locale } from "@/content/get-dictionary";
import { ReservationForm } from "@/components/reservation-form";

export default async function ReservationsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <main className="px-6 py-16 md:px-12 max-w-xl">
      <h1 className="font-display text-3xl mb-2">{dict.reservations.title}</h1>
      <p className="font-body mb-8">{dict.reservations.intro}</p>
      <ReservationForm dictionary={dict} />
    </main>
  );
}
```

- [ ] **Step 7: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add frontend/lib/api.ts frontend/components/reservation-form.tsx frontend/components/reservation-form.test.tsx "frontend/app/[locale]/reservations" frontend/package.json frontend/package-lock.json
git commit -m "$(cat <<'EOF'
feat(frontend): add reservation form and Reservations page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 24: Admin login page

**Files:**
- Create: `frontend/app/admin/login/page.tsx`
- Create: `frontend/components/admin-login-form.tsx`
- Test: `frontend/components/admin-login-form.test.tsx`
- Modify: `frontend/lib/api.ts` (add `adminLogin`)

**Interfaces:**
- Consumes: shadcn `Input`/`Button` (Task 4).
- Produces: `adminLogin(username, password): Promise<{status: string} | {error: string}>` in `lib/api.ts`, consumed by Task 25's redirect-on-401 logic (both live under `/admin`, and the list page links back to this one).

- [ ] **Step 1: Add `adminLogin` to `lib/api.ts`**

Append to `frontend/lib/api.ts`:

```typescript
export async function adminLogin(
  username: string,
  password: string,
): Promise<{ status: string } | { error: string }> {
  const res = await fetch("/webdb/admin_login.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}
```

- [ ] **Step 2: Write the failing test**

Create `frontend/components/admin-login-form.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminLoginForm } from "./admin-login-form";
import * as api from "@/lib/api";

vi.mock("@/lib/api");
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

describe("AdminLoginForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("redirects to the reservations list on successful login", async () => {
    vi.mocked(api.adminLogin).mockResolvedValue({ status: "ok" });
    const user = userEvent.setup();
    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText("Username"), "staff");
    await user.type(screen.getByLabelText("Password"), "changeme123");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/admin/reservations"));
  });

  it("shows an error message on failed login", async () => {
    vi.mocked(api.adminLogin).mockResolvedValue({ error: "Invalid credentials" });
    const user = userEvent.setup();
    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText("Username"), "staff");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("Invalid credentials"));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `./admin-login-form` does not exist.

- [ ] **Step 4: Implement `AdminLoginForm`**

Create `frontend/components/admin-login-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (formData: FormData) => {
    setSubmitting(true);
    setError(null);
    const username = String(formData.get("username") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await adminLogin(username, password);
    setSubmitting(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    router.push("/admin/reservations");
  };

  return (
    <form action={onSubmit}>
      {error && (
        <p role="alert" className="mb-4 text-[var(--color-vino-tinto)]">
          {error}
        </p>
      )}
      <div className="mb-4">
        <label htmlFor="username" className="block font-label text-sm">
          Username
        </label>
        <Input id="username" name="username" />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block font-label text-sm">
          Password
        </label>
        <Input id="password" name="password" type="password" />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 5: Create the login page**

Create `frontend/app/admin/login/page.tsx`:

```typescript
import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="px-6 py-16 md:px-12 max-w-sm">
      <h1 className="font-display text-2xl mb-6">Staff Login</h1>
      <AdminLoginForm />
    </main>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add frontend/lib/api.ts frontend/components/admin-login-form.tsx frontend/components/admin-login-form.test.tsx frontend/app/admin/login
git commit -m "$(cat <<'EOF'
feat(frontend): add admin login page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 25: Admin reservations list page

**Files:**
- Create: `frontend/app/admin/reservations/page.tsx`
- Create: `frontend/components/admin-reservations-table.tsx`
- Test: `frontend/components/admin-reservations-table.test.tsx`
- Modify: `frontend/lib/api.ts` (add `fetchAdminReservations`, `updateReservationStatus`)

**Interfaces:**
- Consumes: shadcn `Table`/`Badge`/`Button` (Task 4).
- Produces: `<AdminReservationsTable />` — a self-contained Client Component that fetches its own data (redirects to `/admin/login` on a 401), consumed directly by the admin reservations page.

- [ ] **Step 1: Add API functions**

Append to `frontend/lib/api.ts`:

```typescript
export type AdminReservation = {
  id: number;
  name: string;
  email: string;
  phone: string;
  party_size: number;
  reservation_date: string;
  time_slot: string;
  status: "pending" | "confirmed" | "cancelled";
  notes: string | null;
};

export async function fetchAdminReservations(): Promise<
  { reservations: AdminReservation[] } | { error: string }
> {
  const res = await fetch("/webdb/admin_reservations_list.php");
  if (res.status === 401) {
    return { error: "unauthorized" };
  }
  return res.json();
}

export async function updateReservationStatus(
  id: number,
  status: "confirmed" | "cancelled",
): Promise<{ status: string } | { error: string }> {
  const res = await fetch("/webdb/admin_reservations_update.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  return res.json();
}
```

- [ ] **Step 2: Write the failing test**

Create `frontend/components/admin-reservations-table.test.tsx`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminReservationsTable } from "./admin-reservations-table";
import * as api from "@/lib/api";

vi.mock("@/lib/api");
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: pushMock }) }));

const sampleReservation: api.AdminReservation = {
  id: 1,
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+15551234567",
  party_size: 2,
  reservation_date: "2026-09-17",
  time_slot: "13:00:00",
  status: "pending",
  notes: null,
};

describe("AdminReservationsTable", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders each reservation with a status badge", async () => {
    vi.mocked(api.fetchAdminReservations).mockResolvedValue({
      reservations: [sampleReservation],
    });

    render(<AdminReservationsTable />);

    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    expect(screen.getByText("pending")).toBeInTheDocument();
  });

  it("redirects to /admin/login when the fetch is unauthorized", async () => {
    vi.mocked(api.fetchAdminReservations).mockResolvedValue({ error: "unauthorized" });

    render(<AdminReservationsTable />);

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/admin/login"));
  });

  it("confirms a reservation and updates its badge", async () => {
    vi.mocked(api.fetchAdminReservations).mockResolvedValue({
      reservations: [sampleReservation],
    });
    vi.mocked(api.updateReservationStatus).mockResolvedValue({ status: "ok" });

    const user = userEvent.setup();
    render(<AdminReservationsTable />);

    await waitFor(() => expect(screen.getByText("Jane Doe")).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Confirm" }));

    await waitFor(() => expect(api.updateReservationStatus).toHaveBeenCalledWith(1, "confirmed"));
    expect(await screen.findByText("confirmed")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
cd frontend && npm test
```

Expected: FAIL — `./admin-reservations-table` does not exist.

- [ ] **Step 4: Implement `AdminReservationsTable`**

Create `frontend/components/admin-reservations-table.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchAdminReservations,
  updateReservationStatus,
  type AdminReservation,
} from "@/lib/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const STATUS_VARIANT: Record<AdminReservation["status"], string> = {
  pending: "bg-[var(--color-lana-dorada)]",
  confirmed: "bg-[var(--color-vina)]",
  cancelled: "bg-[var(--color-piedra-volcanica)]/40",
};

export function AdminReservationsTable() {
  const router = useRouter();
  const [reservations, setReservations] = useState<AdminReservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminReservations().then((result) => {
      if ("error" in result) {
        router.push("/admin/login");
        return;
      }
      setReservations(result.reservations);
      setLoading(false);
    });
  }, [router]);

  const handleUpdate = async (id: number, status: "confirmed" | "cancelled") => {
    const result = await updateReservationStatus(id, status);
    if (!("error" in result)) {
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    }
  };

  if (loading) {
    return <p>Loading…</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Time</TableHead>
          <TableHead>Party</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations.map((r) => (
          <TableRow key={r.id}>
            <TableCell>{r.name}</TableCell>
            <TableCell>{r.reservation_date}</TableCell>
            <TableCell>{r.time_slot.slice(0, 5)}</TableCell>
            <TableCell>{r.party_size}</TableCell>
            <TableCell>
              <Badge className={STATUS_VARIANT[r.status]}>{r.status}</Badge>
            </TableCell>
            <TableCell>
              {r.status === "pending" && (
                <>
                  <Button size="sm" onClick={() => handleUpdate(r.id, "confirmed")}>
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdate(r.id, "cancelled")}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [ ] **Step 5: Create the admin reservations page**

Create `frontend/app/admin/reservations/page.tsx`:

```typescript
import { AdminReservationsTable } from "@/components/admin-reservations-table";

export default function AdminReservationsPage() {
  return (
    <main className="px-6 py-8 md:px-12">
      <h1 className="font-display text-2xl mb-6">Reservations</h1>
      <AdminReservationsTable />
    </main>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

```bash
cd frontend && npm test
```

Expected: PASS.

- [ ] **Step 7: Verify the full static build still succeeds**

```bash
cd frontend && npm run build
```

Expected: build succeeds, `frontend/out/` now contains `en/`, `es/`, and `admin/` trees.

- [ ] **Step 8: Commit**

```bash
git add frontend/lib/api.ts frontend/components/admin-reservations-table.tsx frontend/components/admin-reservations-table.test.tsx frontend/app/admin/reservations
git commit -m "$(cat <<'EOF'
feat(frontend): add admin reservations list page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 26: Image pre-optimization script

**Files:**
- Create: `frontend/scripts/optimize-images.mjs`
- Create: `frontend/images-src/` (a `.gitkeep` placeholder directory for original, unoptimized source photos)
- Modify: `frontend/package.json` (add `sharp` devDependency and a `prebuild` script)

**Interfaces:**
- Produces: a script that reads every image in `frontend/images-src/` and writes a resized WebP copy into `frontend/public/images/`, matching the paths `restaurantContent` (Task 9) already references.

- [ ] **Step 1: Install sharp**

```bash
cd frontend && npm install -D sharp
```

- [ ] **Step 2: Write the script**

Create `frontend/scripts/optimize-images.mjs`:

```javascript
import sharp from "sharp";
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";

const SRC_DIR = path.resolve("images-src");
const OUT_DIR = path.resolve("public/images");
const MAX_WIDTH = 2000;

async function run() {
  await mkdir(OUT_DIR, { recursive: true });

  let files;
  try {
    files = await readdir(SRC_DIR);
  } catch {
    console.log(`No ${SRC_DIR} directory found — skipping image optimization.`);
    return;
  }

  const imageFiles = files.filter((f) => /\.(jpe?g|png)$/i.test(f));

  if (imageFiles.length === 0) {
    console.log("No source images found — skipping.");
    return;
  }

  for (const file of imageFiles) {
    const outName = file.replace(/\.(jpe?g|png)$/i, ".webp");
    const outPath = path.join(OUT_DIR, outName);

    await sharp(path.join(SRC_DIR, file))
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(outPath);

    console.log(`Optimized ${file} -> images/${outName}`);
  }
}

run();
```

Add to `frontend/package.json` `scripts`:

```json
"optimize-images": "node scripts/optimize-images.mjs",
"prebuild": "npm run optimize-images"
```

Create `frontend/images-src/.gitkeep` (empty file) so the directory exists in git even before real photos are dropped in.

- [ ] **Step 3: Verify manually**

```bash
mkdir -p frontend/images-src
# copy a sample .jpg into frontend/images-src/ named hero-estate.jpg for this test
cd frontend && npm run optimize-images
ls public/images/
```

Expected: `public/images/hero-estate.webp` exists and is smaller than the source file. Note: `restaurantContent.ts` currently references `.jpg` paths as illustrative placeholders — once real photos are optimized to `.webp` by this script, update the `src` values in `frontend/content/restaurant.ts` (Task 9) to match the actual `.webp` filenames produced here.

- [ ] **Step 4: Commit**

```bash
git add frontend/scripts/optimize-images.mjs frontend/images-src/.gitkeep frontend/package.json frontend/package-lock.json
git commit -m "$(cat <<'EOF'
feat(frontend): add build-time image optimization script

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

### Task 27: Deployment documentation

**Files:**
- Create: `docs/deploy.md`

**Interfaces:**
- None — this is a documentation-only task with no code interfaces.

- [ ] **Step 1: Write the deployment guide**

Create `docs/deploy.md`:

```markdown
# Deploying La Labranza to HostGator

## One-time setup

1. In cPanel, create a MySQL database and user (Databases → MySQL Database
   Wizard). Note the database name, username, and password — cPanel
   prefixes them with your account name (e.g. `youracct_lalabranza`).
2. Via phpMyAdmin (cPanel → phpMyAdmin), run `backend/migrations/001_schema.sql`
   then `backend/migrations/002_seed.sql` against that database. Edit the
   seed file's placeholder address/phone before running it if real content
   is ready.
3. Generate a real admin password hash:
   `php -r "echo password_hash('YOUR_REAL_PASSWORD', PASSWORD_DEFAULT);"`
   and update the `admin_users` row with it via phpMyAdmin.
4. Create `backend/config.php` on the server (copy `config.example.php`
   and fill in the real cPanel database host/name/user/password). This
   file is gitignored — it only ever exists on the server, never in the
   repo.

## Every deploy

1. Locally: drop real source photos into `frontend/images-src/`, then run
   `cd frontend && npm run build` (this runs `optimize-images` via the
   `prebuild` script automatically, then produces `frontend/out/`).
2. Upload the *contents* of `frontend/out/` to the HostGator account's web
   root (e.g. `public_html/`) via SFTP or cPanel File Manager.
3. Upload `backend/webdb/`, `backend/src/`, `backend/vendor/`, and
   `backend/config.php` to `public_html/webdb/`, `public_html/src/`, etc.
   — i.e. preserve the same relative layout so `require __DIR__ .
   '/../vendor/autoload.php'` in each endpoint still resolves correctly.
   Do **not** upload `backend/config.example.php`, `backend/tests/`, or
   `backend/migrations/` to production — they're development-only.
4. Confirm PHP's session save path is writable on the host (HostGator's
   default shared-hosting PHP config normally handles this without
   changes — only revisit if `admin_login.php` fails to persist a
   session).
5. Smoke-test in a browser: load `/en`, submit a test reservation on
   `/en/reservations`, then log into `/admin/login` and confirm it
   appears in `/admin/reservations`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/deploy.md
git commit -m "$(cat <<'EOF'
docs: add HostGator deployment guide

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
EOF
)"
```

---

## Plan Self-Review

**Spec coverage:**
- Bilingual EN/ES static site → Tasks 6, 7, 8.
- Home/Menu/Reservations/Gallery/About-Location/Contact pages → Tasks 10–14, 23.
- Tenant-scoped data model → Task 15 (schema), every backend endpoint's `restaurant_id` scoping (Tasks 18, 19, 21, 22).
- Reservation flow (public capacity check → submit → confirmation) → Tasks 18, 19, 23.
- Admin flow (session-gated list, confirm/cancel) → Tasks 20, 21, 22, 24, 25.
- Visual & brand direction (color tokens, type, FurrowDivider, hero pattern) → Tasks 3, 5, 10.
- WCAG color-role constraints → enforced explicitly in Task 3 (`Eyebrow`'s Cobre Viejo usage note) and Global Constraints; carried through every component that touches those two colors (Task 25's status badges use `Vina`/`Lana Dorada`/`Piedra Volcánica` only in the roles the table allows).
- next/image + static export fix → Task 1 (`images: unoptimized`) and Task 26 (build-time pipeline).
- shadcn Field/FieldError + error-summary accessibility requirement → Task 23.
- PHPUnit for capacity calculation only, no broader automated backend testing → Task 16 (automated), Tasks 18–22 (manual curl verification) — matches spec's Testing section exactly.
- Deployment to existing HostGator hosting → Task 27.

Not covered by this plan (intentionally, per spec Non-goals / Open items — not gaps): online ordering, real menu/logo content beyond placeholders, table-level assignment, multi-tenant signup/billing UI, outbound reservation-confirmation email (spec leaves the channel as an implementation-time decision; this plan's confirmation message tells the guest "we'll confirm by email" per the `en.json`/`es.json` copy, but no email-sending code is included — sending that email is a follow-up task once an email provider decision is made, since the spec explicitly scoped it as an open item, not a v1 requirement).

**Placeholder scan:** no "TBD"/"implement later"/"add appropriate error handling" language found; every step has runnable code or an exact command. Content placeholders (`[ADDRESS — REPLACE BEFORE LAUNCH]`, image filenames) are real data-entry TODOs for the restaurant, not implementation vagueness, and are each confined to a single file (Task 9, Task 15's seed).

**Type consistency check:** `party_size` (snake_case) is the on-the-wire/DB field name throughout the PHP endpoints (Tasks 18, 19, 21, 22) and the raw JSON shape in `frontend/lib/api.ts`'s `AdminReservation` type (Task 25); `partySize` (camelCase) is used only inside the frontend's own `ReservationPayload` type and `ReservationForm`'s internal form state (Task 23), with `lib/api.ts`'s `createReservation` doing the camelCase→snake_case translation at the fetch boundary — verified consistent across Tasks 18, 19, 23, 25. `time_slot` stays snake_case end-to-end including in `ReservationPayload.timeSlot` values (e.g. `"13:00:00"`), since it's a raw SQL `TIME` string passed through, not a translated field — confirmed matching between Task 15's schema, Tasks 18/19's SQL, and Task 23's Zod enum.

---

**Plan complete and saved to `docs/superpowers/plans/2026-09-11-lalabranza-website-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
