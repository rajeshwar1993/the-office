# Pulse — Product Vision

## What is Pulse?

Pulse is a **daily check-in app** that helps people stay connected through lightweight, habitual micro-updates. Instead of lengthy status messages or social media posts, users send a single daily "pulse" — a quick signal that they're thinking of the people in their circle.

## Architecture

**Hybrid Flutter + Next.js** — Flutter provides the native mobile shell (splash screen, auth, WebView container), while all UI screens are rendered by a Next.js web app inside the WebView. This gives us native app distribution with web development speed.

## Core Concepts

- **Pulse Day:** Resets at 4 AM local time. One pulse per day.
- **Auto-pulse:** Fires automatically during the splash screen on app launch.
- **Connections:** Users connect via invite codes to form their circle.

## Target Users

People who want to maintain close relationships without the overhead of social media — friends, family, small teams.

## Key Principles

1. **Minimal friction** — the check-in should take seconds, not minutes
2. **Privacy-first** — no public feeds, no algorithmic ranking
3. **Habitual by design** — daily rhythm, not on-demand engagement

## Success Metrics

- Daily active pulse rate (users who pulse at least once per day)
- Connection retention (how many connections stay active over 30 days)
- Time-to-pulse (seconds from app open to pulse sent)
