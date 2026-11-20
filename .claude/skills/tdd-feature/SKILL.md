---
name: tdd-feature
description: Build one Weather Explorer feature test-first — plan, red tests, green implementation, verification, concept explanations. Use when starting or extending any feature in this app.
---

# TDD feature workflow

1. **Plan (short, before code):** purpose; approach; list of types, services, hooks, components; where it fits in `AGENTS.md` architecture.
2. **Red:** write tests per layer, smallest first — pure `lib/` → `services/` (mock axios) → `hooks/` (wrap in QueryClientProvider, `retry:false`) → `components/` (RTL, query by role/text) → `App` integration. Run `npm test`; confirm they fail for the right reason.
3. **Green:** implement the minimum. Re-run after each layer.
4. **Refactor:** remove duplication only where it exists now.
5. **Verify:** `npm test && npx tsc -b && npm run lint && npm run build`. Report real output; if anything fails, say so.
6. **Teach:** explain 2–4 React/TS/JS concepts that the feature used (e.g. effect cleanup, query keys, `enabled`, type narrowing).
7. **Commit** on the feature branch; stop and wait for the user before the next feature.

Checklist per feature: loading ✔ error ✔ empty ✔ responsive ✔ types (no `any`) ✔ API calls only in services ✔
