# sandbox-target-astro — agent conventions

**Purpose:** sandbox copy of a subset of humanjudge.com's astro-site, used for the PBI-044 spike (Claude-agent-driven dev workflow on GCP).

## Scope for agents

- **Target of edits** (default): `src/pages/agentic-ai-summit-2026/index.astro` and `src/pages/agentic-ai-summit-2026/report.astro`
- **Off-limits by default:** everything else (other pages, layouts, components, config, public assets). Only touch if a task explicitly requires it.
- If a task requires changes outside the summit dir, note it in `PLAN.md` first.

## Build

- `npm install` — install deps
- `npm run build` — production build (must pass QA gate)
- `npm run dev` — local dev server on `localhost:4321`

## Testing conventions

- Smoke: page loads, no console errors, expected elements present
- Lighthouse: performance + accessibility thresholds (set in QA agent config)
- Playwright: covers the target pages only

## Deploy

- Netlify preview: auto-triggered on PR
- Prod deploy: manual promote only (PBI-044 v0 policy)

## What NOT to do

- Never commit secrets (see `.env.example` for shape)
- Never touch other pages without explicit greenlight
- Never disable existing tests to make yours pass
