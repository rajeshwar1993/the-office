# Forge — Learnings Log

Backend implementation lessons, database patterns, and debugging insights accumulated over time.

## Mistakes
<!-- Record implementation failures and their root causes. -->
<!-- e.g., "Used a serial primary key instead of UUID — caused merge conflicts in seed data." -->

## Wins

- **CHECK constraint with regex for language codes**: `CHECK (language_preference ~ '^[a-z]{2}(-[A-Z]{2})?$')` validates BCP 47 language tags (e.g., `'en'`, `'pt-BR'`) at the database level. Prevents garbage data without needing application-level validation.
- **`DEFAULT 'en'` with `NOT NULL` for backward-compatible column additions**: Adding `language_preference TEXT NOT NULL DEFAULT 'en'` to an existing table requires no backfill — all existing rows automatically get the default. No RLS policy changes needed since existing owner SELECT/UPDATE policies already cover new columns.

## Tech Debt
<!-- Record shortcuts taken for speed that need future cleanup. -->
<!-- e.g., "Hardcoded the storage bucket path in the Edge Function — needs env var." -->
