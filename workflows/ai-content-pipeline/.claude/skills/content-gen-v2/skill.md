---
name: content-gen-v2
description: "v2 content pipeline with yt-dlp + NotebookLM research. Generates multi-format video scripts (YouTube Long-Form, 3 Shorts, 3 Instagram Reels) for any AI avatar. Usage: /content-gen-v2 {avatar}, {topic_count} topics"
user-invocable: true
---

# Content Gen v2 — Enhanced Research Pipeline

You are launching the AI Content Pipeline **v2** for a specific avatar. v2 uses yt-dlp (YouTube search) and NotebookLM (AI-powered video analysis) for deeper research, plus comedy script-craft analysis for more engaging scripts.

## Parse Arguments

Parse the user's invocation to extract:
1. **Avatar name** — first argument (case-insensitive, convert to lowercase for paths). If no avatar specified, ask which avatar to use and list available ones.
2. **Topic count** — look for a number or "N topics" in the remaining arguments. Default: **2**.

Examples:
- `/content-gen-v2 Maya, 3 topics` → avatar=maya, topics=3
- `/content-gen-v2 maya` → avatar=maya, topics=2
- `/content-gen-v2 Rhea, 5` → avatar=rhea, topics=5

## Validate Avatar

Check if the avatar profile exists:
```
avatars/{avatar_name}/profile.md
```

**If the profile does NOT exist:**
1. List available avatars by scanning `avatars/` (exclude `_template/`)
2. Tell the user which avatars are available
3. Stop — do not proceed without a valid avatar

## Prerequisite Checks

Before proceeding, verify external tool dependencies:

### 1. yt-dlp
```bash
which yt-dlp && yt-dlp --version
```
If yt-dlp is not found, halt and tell the user:
> yt-dlp is required for v2 research. Install it with: `brew install yt-dlp`

### 2. NotebookLM CLI
```bash
which notebooklm
```
If notebooklm is not found, halt and tell the user:
> NotebookLM CLI is required for v2 research. Install it with: `pipx install notebooklm-py`

## Execution Mode

- **Autonomous execution:** After validation, run the entire pipeline end-to-end without stopping for approval. Do NOT wait for user input at any checkpoint — present the summary tables but immediately proceed to the next phase.
- **Maximum effort thinking:** Use your deepest, most thorough reasoning throughout this workflow. Take extra care with research quality, script writing, review accuracy, and production direction. Do not take shortcuts.

## Setup

1. Set your working directory to this workflow's root (the directory containing `engine-v2.md`, `avatars/`, `heygen/`). All paths below are relative to it.
2. Read `engine-v2.md` in full — it contains the v2 workflow engine instructions.
3. Read the avatar profile: `avatars/{avatar_name}/profile.md`
4. The engine uses three context variables — keep these in mind throughout:
   - `AVATAR_NAME` = `{avatar_name}` (lowercase, used in all file paths)
   - `TOPIC_COUNT` = `{topic_count}` (number of topics to generate)
   - `OUTPUT_DIR` = `output/{avatar_name}/YYYY-MM-DD` (resolve YYYY-MM-DD to today's date at runtime)
5. Follow the engine instructions exactly, starting from **Phase 0 — Setup**.
6. **Override all checkpoints:** Where the workflow says "Wait for user approval before proceeding", ignore that instruction and proceed automatically. Still present the summary tables for the user's later review, but do not pause.

All file paths in `engine-v2.md` are relative to this workflow's root.
