# Weather Explorer — agent guide

Portfolio app: interactive 2D map (MapLibre) → click → Open-Meteo weather. Built
feature by feature, test-first, for a junior-to-mid React/TypeScript showcase.

## Stack
React 19, TypeScript, Vite, MapLibre GL JS, Axios, TanStack Query, Vitest +
React Testing Library. Planned: React Router, Tailwind, Recharts, localStorage.
Open-Meteo needs no API key; if one is ever needed, use `import.meta.env.VITE_*`
and document it in `.env.example` (never commit `.env`).

## Commands
- `npm test` — run all tests once (the definition of "done")
- `npm run test:watch` — watch mode while developing
- `npx tsc -b` — type-check; `npm run lint`; `npm run build`
- `npm run dev` — dev server

## Workflow: strict TDD (see `.claude/skills/tdd-feature/SKILL.md`)
1. Before coding a feature: state purpose, approach, components/hooks/services/types, and how it fits the architecture.
2. Write failing tests first and run them to see them fail (red).
3. Implement the minimum to pass (green), then refactor.
4. A feature is done only when `npm test`, `npx tsc -b`, `npm run lint` and `npm run build` all pass.
5. Explain key React/TS concepts used. Build ONE feature at a time; never generate the whole app.

## Architecture
```
src/types/       API response types + app models (Open-Meteo shape vs. app shape)
src/services/    ALL HTTP calls (axios). Components never call axios.
src/hooks/       Custom hooks (TanStack Query wrappers, browser APIs)
src/components/  Presentational, reusable components
src/lib/         Pure helpers (formatting, coordinate normalization, WMO codes)
src/test/        Test setup
```
Tests live next to the code: `Foo.tsx` ↔ `Foo.test.tsx`.

## Rules
- Weather requests use latitude/longitude only. **No reverse geocoding.**
- Geolocation (later) only centers/zooms the map.
- Persist locations only (never weather data); fetch fresh weather on selection; no duplicate saved locations.
- Every data view handles loading, error and empty states.
- Mock at boundaries: `axios` in service tests, services in hook tests, `maplibre-gl` in component tests (jsdom has no WebGL). No real network in tests.
- Keep it simple: no abstractions without a second use. No `any`; use `import type` for types (`verbatimModuleSyntax` is on; `erasableSyntaxOnly` forbids enums).
- Responsive layout is required; keep accessibility roles (`status`, `alert`) on state messages.
- Git: one feature branch per feature, small commits, conventional messages.
