# PreOpPal Evals

PoC-scoped evaluation harness for the two core workflows of the app:

1. **Chat reply quality** (`chat`) — given a patient profile, a care-team member, and a thread, does the LLM reply stay in role, anchor on the patient's specific procedure, avoid bad medical-advice patterns, and match the requested tone? Uses LLM-as-judge with a rubric.
2. **Profile → derived content snapshot** (`snapshot`) — given a `Profile` fixture, render every piece of derived state the UI depends on (system prompts, per-procedure tasks / meds / arrival / phases / phase details, token-personalized copy) and snapshot it. Catches: unresolved `{{tokens}}`, missing procedure customizations, broken `daysUntilSurgery` math, drift in prompt content.

## Run

```bash
# Both evals
npm run eval

# One at a time
npm run eval -- chat
npm run eval -- snapshot

# Refresh cached chat responses (e.g. after changing the system prompt)
npm run eval -- chat --refresh

# Update snapshot files (after an intentional change to content/prompt)
npm run eval -- snapshot --update
```

Requires `GOOGLE_GENERATIVE_AI_API_KEY` in `.env.local` (same key the dev server uses).

## Layout

```
evals/
  profiles.ts          # 5 shared Profile fixtures (varying procedure + daysOut)
  chat.ts              # chat fixtures + runner + LLM-judge
  snapshot.ts          # snapshot runner — pure derived-state extraction
  snapshots/*.json     # committed expected outputs (one per profile)
  cache/*.json         # cached chat responses (gitignored)
  results/*.json       # last run's results (gitignored)
  run.ts               # CLI entry
```

## Why this shape (PoC tradeoffs)

- **Calls library code directly, not the HTTP route.** Skips Supabase auth + the dev server. Same `streamText` + `buildCareSystemPrompt` as `/api/care-chat`, just unwrapped.
- **Cached responses by default.** First chat run hits Gemini once per fixture; subsequent runs replay from `evals/cache/`. Use `--refresh` to re-record after a prompt change.
- **JSON results, not a UI.** Polished for a portfolio demo means the *app* looks good — the eval is for you, not the audience.
- **Hardcoded "today" via `EVAL_TODAY` env.** `daysUntilSurgery()` is wall-clock-based; the harness sets `EVAL_TODAY=2026-06-01` so snapshots are deterministic.
