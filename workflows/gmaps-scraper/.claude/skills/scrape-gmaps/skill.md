---
name: scrape-gmaps
description: "Scrape Google Maps listings (single query or batch across configured locations), apply ICP filters, render an HTML report. Usage: /scrape-gmaps {vertical}[, location] [flags]"
user-invocable: true
---

# Scrape GMaps — Workflow Launcher

You are launching the gmaps-scraper workflow.

## Setup

1. Set your working directory to this workflow's root (the directory containing `scraper.js`, `report.js`, `CLAUDE.md`).
2. Read `CLAUDE.md` in full — it has the job-to-be-done, invocation patterns, and input/output contract.
3. All paths referenced below are relative to the workflow root.

## Parse Arguments

Extract from the user's invocation:

1. **Vertical** (required) — first argument, e.g., `salons`, `gyms`, `dental clinics`, `restaurants`. If missing, ask.
2. **Location** (optional) — if the user specifies a single location (e.g., "salons in Kalkaji New Delhi"), build a single-query invocation. If they say "all locations" / "batch" / don't specify, use `--batch`.
3. **Filter overrides** (optional) — any of `--min-rating`, `--max-rating`, `--max-reviews`, `--incomplete-only`, `--delay-multiplier`. Pass through as given; defaults live in `README.md`.

Examples:
- `/scrape-gmaps salons` → `node scraper.js --batch "salons"`
- `/scrape-gmaps salons in Kalkaji New Delhi` → `node scraper.js "salons in Kalkaji New Delhi"`
- `/scrape-gmaps gyms, incomplete only` → `node scraper.js --batch "gyms" --incomplete-only`

## Prerequisite Check

Before the first run, confirm setup:

```bash
test -d node_modules && test -d node_modules/playwright
```

If `node_modules/` is missing, halt and tell the user:

> gmaps-scraper dependencies are not installed. Run: `npm install && npx playwright install chromium` from the workflow root.

## Execute

1. Run the scraper with the composed command. Stream output to the user — runs take several minutes for batch mode, longer with `--delay-multiplier` bumped.
2. On success, run the reporter to generate the HTML report from the newest `output/all_results_*.json`:

   ```bash
   node report.js
   ```

3. Show the user:
   - Path of `output/all_results_{timestamp}.json`
   - Path of `output/icp_filtered_{timestamp}.json` (if any records matched)
   - Path of the generated `output/report_*.html`
   - A one-line count summary: `{total} scraped, {icp_matched} match ICP`.

## Failure Handling

- **Google blocks / CAPTCHA:** the scraper pauses and retries once, then exits with partial results in `output/partial_*.json`. Surface that file path and suggest re-running with `--delay-multiplier 2.0` or higher.
- **Missing binary:** if Playwright complains about a missing Chromium, re-run `npx playwright install chromium` and retry.
- **No results:** if both JSON files are empty, the query or location may be too narrow. Suggest broadening the vertical term or trying a single-query invocation against one specific area before going batch.
