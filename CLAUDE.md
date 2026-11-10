# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

RCStockManager is the stock manager for "Radiadores Carranza" (an auto radiator shop). It's a SvelteKit 2 + Svelte 5 (runes) app backed by MongoDB via Mongoose, deployed with `@sveltejs/adapter-vercel`. UI text, domain names, comments and error messages are in **Spanish** — keep new code consistent with that.

A `src-tauri/` desktop wrapper exists, but its config (`frontendDist: ../public`) doesn't match the Vercel adapter output; treat it as non-functional unless asked to work on it.

## Commands

Both `package-lock.json` and `pnpm-lock.yaml` are committed; Tauri's config invokes `pnpm`.

- `npm run dev` — Vite dev server (http://localhost:5173)
- `npm run build` / `npm run preview`
- `npm run check` — svelte-kit sync + svelte-check (type checking)
- `npm run lint` — prettier --check + eslint; `npm run format` to fix formatting
- `npm run test:unit` — Vitest (watch mode); `npm run test` runs unit (once) + Playwright e2e
- Single test file: `npx vitest run src/path/to/file.test.ts`; single project: `npx vitest run --project server` (or `client`)
- `npm run test:e2e` — Playwright (`e2e/`)
- `node --env-file=.env scripts/seed-movimientos.ts` — one-time backfill of the movement log from each product's `ultimoIngreso`/`ultimoEgreso` (idempotent; Node 23.6+ runs the TS directly)

Vitest has two projects (see `vite.config.ts`): `client` (jsdom, `*.svelte.{test,spec}.{js,ts}`) and `server` (node, all other `*.{test,spec}.{js,ts}`). Real unit tests cover the type registry, form parsing and session tokens (`src/lib/**/*.test.ts`).

Required env vars (all read via `$env/dynamic/private`): `MONGODB_URI`, `ADMIN_PASSWORD`, `SESSION_SECRET` (≥32 chars, used to sign session cookies).

## Architecture

**Single-page app on `/`.** All functionality lives on `src/routes/+page.svelte`, which lays out "section" components (`src/lib/components/sections/`: buscar, nuevo, display, editar, eliminar, ingreso, egreso). Which sections are visible is driven by the `currentDisplayed` rune state, not by routes. Components are re-exported from `src/lib/components/index.ts` and icons from `src/lib/icons/index.ts`.

**Auth.** Single admin password. `src/routes/login/+page.server.ts` has `login` and `logout` actions; login checks `ADMIN_PASSWORD` in constant time and sets an HMAC-signed `session` cookie (`<expiresAtMs>.<sig>`, 30 days) built in `src/lib/server/auth.ts` with Web Crypto. `src/hooks.server.ts` verifies it on every request: pages redirect to `/login`, `/api/*` returns 401.

**Mutations = SvelteKit form actions** in `src/routes/+page.server.ts`: `createProduct`, `editProduct`, `increaseProductQuantity`, `decreaseProductQuantity`, `deleteProduct` (posted from forms via `action="?/..."`). Actions resolve the incoming `tipo` with `resolveTipo()`, parse fields with `parseProductForm()` / `parseAmount()` (`src/lib/server/forms.ts`), and return `{ actionResult: { success, message, producto } }` (`fail()` on errors); the UI surfaces these through the `popup` store (`src/lib/stores/popup.ts`). Stock in/out are atomic single-document updates (`$inc` / update pipeline clamped at 0) that also record `ultimoIngreso` / `ultimoEgreso`. Changing a product's type moves the document to the other collection keeping `_id`, `marca` and movement history (the edit form sends a hidden `originalTipo`).

**Movement log and statistics.** Every stock change also writes a document to the `movimientos` collection (`src/lib/server/models/Movimiento.ts`) via `logMovimiento()` (`src/lib/server/movimientos.ts`): `ingreso`/`egreso` from the stock actions (egreso records the units actually removed, which can be less than requested; taking stock from 0 throws `SinStockError`), and `ajuste` (signed delta, never counted as a sale or purchase) when a product is created with stock (`motivo: 'alta'`) or its `cantidad` is edited (`motivo: 'edicion'`). Logging is best-effort: failures are logged and don't block the stock change. Movements copy codigo/detalle/marca so history survives deletes. `GET /api/stats?range=hoy|7d|30d|90d|12m|all` (`src/lib/server/stats.ts`) aggregates them, grouped by hour (hoy)/day/week/month in Argentina time; range and bucket logic is pure and tested in `src/lib/logic/statsRange.ts`. The panel is `statsDisplay.svelte` (opened by the `estadisticas` section); Chart.js is used only for the time series, through the `Chart.svelte` wrapper.

**Reads are lazy-loaded per product type.** `load()` in `+page.server.ts` only fetches `Radiadores`; other types are fetched on demand by `loadProductsByType()` (`src/lib/logic/lazyLoading.js`) from `GET /api/products/[type]`, which calls `getProductsByType()` in `src/lib/server/data.ts`. Loaded/loading types are tracked in `products.loadedTypes` / `products.loadingTypes`.

**Client state** uses module-level Svelte 5 `$state` objects in `src/lib/shared/*.svelte.js` (`products`, `selectedProduct`, `filters`, `currentDisplayed`, `app`). Products on the client are keyed by plural UI label (`products.allProducts['Radiadores']`).

**Data model: one Mongoose model/collection per product type.** `src/lib/server/models/ProductBase.ts` defines the shared schema (codigo, detalle, tipo, cantidad, dimensiones, marca, notas, ultimoIngreso/ultimoEgreso); each type file spreads `ProductBaseSchema.obj` and adds type-specific fields (e.g. Radiador `material`, Panel `material` + `filas`, Electroventilador `aspas`/`diametro`). Lean query results go through `toSerializableArray/Object` (`src/lib/logic/serialization.ts`) to stringify `_id` before crossing to the client.

### Three naming forms for product types

Every type has a plural UI label (`'Tanques de combustible'`, used as client-side keys and in the API path), a singular label (`'Tanque de combustible'`, used in forms), and a slug stored as `tipo` (`'tanque-combustible'`). The single source of truth is `PRODUCT_TYPES` in `src/lib/logic/productTypes.ts` (client-safe). Use `resolveTipo()` to turn any form (case/accent-insensitive) into the slug, and `pluralOf` / `singularOf` to go back. Filter lists, form datalists, the `tipo` enum, the `Products` type and `emptyProductsMap()` are all derived from it. Server-side, `modelBySlug` (`src/lib/server/models/index.ts`) maps slug → Mongoose model.

**Adding a new product type:** add an entry to `PRODUCT_TYPES`, create its model file in `src/lib/server/models/`, register it in `models/index.ts`, and add its TS type to the `Product` union in `src/lib/types/types.ts`. Type-specific form fields (like `material`, `filas`, `aspas`) need handling in `parseProductForm()` and the two form components.

## Conventions

Prettier: tabs, single quotes, no trailing commas, print width 100, with `prettier-plugin-svelte` and `prettier-plugin-tailwindcss`. Styling is Tailwind v4 plus custom CSS in `src/app.css`.
