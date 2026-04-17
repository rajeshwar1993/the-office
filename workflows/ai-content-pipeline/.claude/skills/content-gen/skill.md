---
name: content-gen
description: "Generate multi-format video scripts (YouTube Long-Form, 3 Shorts, 3 Instagram Reels) for any AI avatar. Usage: /content-gen {avatar}, {topic_count} topics"
user-invocable: true
---

# Content Gen — Multi-Avatar Video Pipeline

You are launching the AI Content Pipeline for a specific avatar.

## Parse Arguments

Parse the user's invocation to extract:
1. **Avatar name** — first argument (case-insensitive, convert to lowercase for paths). If no avatar specified, ask which avatar to use and list available ones.
2. **Topic count** — look for a number or "N topics" in the remaining arguments. Default: 10.

Examples:
- `/content-gen Maya, 5 topics` → avatar=maya, topics=5
- `/content-gen maya` → avatar=maya, topics=10
- `/content-gen Rhea, 3` → avatar=rhea, topics=3

## Validate Avatar

Check if the avatar profile exists:
```
avatars/{avatar_name}/profile.md
```

**If the profile does NOT exist:**
1. List available avatars by scanning `avatars/` (exclude `_template/`)
2. Tell the user which avatars are available
3. Stop — do not proceed without a valid avatar

## Execution Mode

- **Autonomous execution:** After validation, run the entire pipeline end-to-end without stopping for approval. Do NOT wait for user input at any checkpoint — present the summary tables but immediately proceed to the next phase.
- **Maximum effort thinking:** Use your deepest, most thorough reasoning throughout this workflow. Take extra care with research quality, script writing, review accuracy, and production direction. Do not take shortcuts.

## Setup

1. Set your working directory to this workflow's root (the directory containing `engine-v1.md`, `avatars/`, `heygen/`). All paths below are relative to it.
2. Read `engine-v1.md` in full — it contains the complete workflow engine instructions.
3. Read the avatar profile: `avatars/{avatar_name}/profile.md`
4. The engine uses three context variables — keep these in mind throughout:
   - `AVATAR_NAME` = `{avatar_name}` (lowercase, used in all file paths)
   - `TOPIC_COUNT` = `{topic_count}` (number of topics to generate)
   - `OUTPUT_DIR` = `output/{avatar_name}/YYYY-MM-DD` (resolve YYYY-MM-DD to today's date at runtime)
5. Follow the engine instructions exactly, starting from **Phase 0 — Setup**.
6. **Override all checkpoints:** Where the workflow says "Wait for user approval before proceeding", ignore that instruction and proceed automatically. Still present the summary tables for the user's later review, but do not pause.

All file paths in `engine-v1.md` are relative to this workflow's root.
