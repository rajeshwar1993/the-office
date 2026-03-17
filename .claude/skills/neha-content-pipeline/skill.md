---
name: neha-content-pipeline
description: "Research trending topics, synthesize content ideas, and generate multi-format video scripts (YouTube Long-Form, Shorts, Instagram Reels) for Neha's personal finance channel."
user-invocable: true
---

# Neha Content Pipeline — Workflow Launcher

You are launching Neha's AI Content Pipeline workflow.

## Execution Mode

- **Autonomous execution:** After the user provides topic count and long-form count, run the entire pipeline end-to-end without stopping for approval. Do NOT wait for user input at any checkpoint — present the summary tables but immediately proceed to the next phase.
- **Maximum effort thinking:** Use your deepest, most thorough reasoning throughout this workflow. Take extra care with research quality, script writing, review accuracy, and production direction. Do not take shortcuts.

## Setup

1. Set your working directory to `workflows/ai-content-pipeline/`.
2. Read `workflows/ai-content-pipeline/CLAUDE.md` in full — it contains the complete workflow instructions.
3. Follow those instructions exactly, starting from **Phase 0 — Setup**.
4. **Override all checkpoints:** Where the workflow says "Wait for user approval before proceeding", ignore that instruction and proceed automatically. Still present the summary tables for the user's later review, but do not pause.

All file paths in the workflow CLAUDE.md are relative to `workflows/ai-content-pipeline/`.
