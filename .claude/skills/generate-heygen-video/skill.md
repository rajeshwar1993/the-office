---
name: generate-heygen-video
description: "Automate HeyGen video generation from production prompts. Usage: /generate-heygen-video learn | /generate-heygen-video run <topic-folder-or-file>"
user-invocable: true
---

# Generate HeyGen Video — Browser Automation Skill

You are automating video generation on HeyGen using Playwright browser automation.

**Working directory:** `workflows/ai-content-pipeline/`

## Parse Arguments

Parse the user's invocation to determine the mode:

1. **Learn mode:** `/generate-heygen-video learn` — Record the HeyGen workflow interactively
2. **Run mode:** `/generate-heygen-video run <path>` — Execute the recorded workflow with a production file or entire topic folder
3. **Config mode:** `/generate-heygen-video config` — Update HeyGen avatar/voice mappings

Examples:
- `/generate-heygen-video learn` → learn mode
- `/generate-heygen-video run output/maya/2026-03-20/Topics/Topic_02_SGB_Returns_Tax_Trap` → run mode (batch — processes all production files in topic folder)
- `/generate-heygen-video run output/maya/2026-03-20/Topics/Topic_01_Desc/en/YTShort_01_Production.md` → run mode (single file)
- `/generate-heygen-video config` → config mode

If no mode specified, check if playbook exists and has steps:
- If playbook is empty → suggest learn mode
- If playbook exists → suggest run mode

---

## Resolve Input Path

After parsing the run mode path, determine whether this is a single-file or batch invocation:

1. **Path ends with `_Production.md`** → **Single-file mode.** Build a one-item queue with that file.
2. **Path is a directory containing `status.json`** → **Batch topic-folder mode.** Build the full queue from status.json.
3. **Neither** → Error: "Path must be a `_Production.md` file or a topic folder containing `status.json`."

For batch mode, detect the language structure from status.json keys:
- Keys contain `/` (e.g., `en/YTShort_01_Production.md`) → **Multilingual** with `en/` and `hi/` subfolders
- Keys have no `/` (e.g., `YTShort_01_Production.md`) → **Legacy flat** topic (no language subfolders)

---

## Batch Queue Construction

When in batch topic-folder mode:

1. Read `status.json` from the topic folder
2. **Filter** to keys whose status is one of: `"Draft"`, `"Approved"`, `"Video_Failed"`
   - **Skip** keys with status: `"Video_Generating"`, `"Video_Generated"`, `"Published"`, `"Rejected"`
3. **Sort** the filtered keys:
   - All `en/` keys first, then all `hi/` keys
   - Within each language group, order: `YTLong` → `YTShort_01` → `YTShort_02` → `YTShort_03` → `InstaReel_01` → `InstaReel_02` → `InstaReel_03`
4. **Build queue** — an ordered list of items, each with:
   - `key` — the status.json key (e.g., `en/YTShort_01_Production.md`)
   - `file_path` — full path to the production file (topic folder + key)
   - `language` — `"en"` or `"hi"` (extracted from key prefix); `null` for legacy flat topics
5. If queue is empty → tell user: "All production files in this topic are already processed (Video_Generated/Video_Generating/Published). Nothing to do." Stop.
6. **Show batch plan** and proceed:

```
Batch plan: {topic_name} — {queue_length} videos to generate

  en/ (7 files):
    · YTLong_Production.md — Draft
    · YTShort_01_Production.md — Draft
    ...
  hi/ (7 files):
    · YTLong_Production.md — Draft
    ...

Proceeding with video generation...
```

For single-file mode, build a one-item queue using the same structure. Derive `language` from the path: if the parent folder is `en/` or `hi/`, use that; otherwise `null`.

---

## Config Files

All config lives in `workflows/ai-content-pipeline/heygen/`:

| File | Purpose |
|------|---------|
| `config.json` | HeyGen URLs, avatar name mappings, voice mappings, default settings |
| `playbook.json` | Recorded workflow steps from learn mode |

---

## Mode 1: LEARN — Record the HeyGen Workflow

### Purpose
Walk the user through HeyGen step-by-step. At each step, take a browser snapshot, ask what to do, execute the action, and record the step into `playbook.json`.

### Pre-flight
1. Read `workflows/ai-content-pipeline/heygen/config.json`
2. Read `workflows/ai-content-pipeline/heygen/playbook.json`
3. If playbook already has steps, warn: "A playbook already exists with N steps. This will overwrite it. Continue?"

### Procedure

**Step 1 — Open HeyGen**

Navigate to the HeyGen URL from config.json using Playwright:
```
mcp__plugin_playwright_playwright__browser_navigate({ url: config.heygen_url })
```

Take a snapshot to check if we're logged in:
```
mcp__plugin_playwright_playwright__browser_snapshot()
```

If the page shows a login form:
- Tell the user: "HeyGen login page detected. Please log in manually. I'll wait."
- Use `mcp__plugin_playwright_playwright__browser_wait_for` to wait for navigation away from the login page
- Once logged in, take another snapshot to confirm

**Step 2 — Interactive Recording Loop**

Initialize an empty steps array. Then enter a loop:

```
recording_steps = []
step_number = 1

LOOP:
  1. Take a snapshot:
     mcp__plugin_playwright_playwright__browser_snapshot()

  2. Summarize what you see on the screen to the user:
     - What page/section is visible
     - Key interactive elements (buttons, inputs, dropdowns)
     - What seems like the logical next action

  3. Ask the user: "What should I do next? (or type 'done' to finish recording)"

  4. When the user responds:
     a. Parse their instruction (e.g., "click the Create Video button", "type the script in the text box", "select 9:16 aspect ratio")

     b. Identify the target element from the snapshot's accessibility tree

     c. Record the step as a structured object:
        {
          "step_number": N,
          "action": "click" | "fill" | "select" | "navigate" | "wait" | "scroll",
          "description": "Human-readable description of what this step does",
          "element_strategy": {
            "primary": {
              "method": "role_and_name",
              "role": "button",
              "name_pattern": "Create Video"
            },
            "fallback": {
              "method": "text_content",
              "text": "Create Video"
            }
          },
          "value": null | "{{variable_name}}" | "static_value",
          "wait_after": "network_idle" | "element_visible" | "seconds:2",
          "notes": "Any user-provided context about this step"
        }

     d. Execute the action using the appropriate Playwright tool:
        - click → mcp__plugin_playwright_playwright__browser_click({ element: "description", ref: "refN" })
        - fill → mcp__plugin_playwright_playwright__browser_fill_form({ ref: "refN", value: "..." })
        - select → mcp__plugin_playwright_playwright__browser_select_option(...)
        - type → mcp__plugin_playwright_playwright__browser_type({ ref: "refN", text: "..." })

     e. Wait briefly for UI to settle

     f. Take a verification snapshot to confirm the action worked

     g. Show the user the result: "Done — [description]. The page now shows [summary]."

     h. Append the step to recording_steps

     i. Continue LOOP

  5. If user says "done":
     - Stop the loop
     - Save playbook.json with all recorded steps
```

**Step 3 — Variable Identification**

After recording, review all steps and identify which ones need dynamic data from production prompts. Ask the user to confirm:

"I recorded N steps. These steps seem to need dynamic data:
- Step 3 (paste script): I'll map this to the script text from the production file
- Step 5 (select aspect ratio): I'll map this to the ASPECT RATIO field
- Step 2 (select avatar): I'll map this to config.json avatar mapping

Does this look right?"

Mark variable steps with `{{variable_name}}` in the value field:
- `{{script_text}}` — cleaned script text (markers removed)
- `{{aspect_ratio}}` — from production prompt header
- `{{avatar_name}}` — from config.json mapping
- `{{voice_name}}` — from config.json mapping
- `{{video_title}}` — from CLICKBAIT_TITLE in production prompt

**Step 4 — Save Playbook**

Write the final playbook to `workflows/ai-content-pipeline/heygen/playbook.json`:

```json
{
  "version": 1,
  "status": "recorded",
  "recorded_date": "YYYY-MM-DD",
  "total_steps": N,
  "variables_used": ["script_text", "aspect_ratio", "avatar_name"],
  "notes": "Recorded from learn session",
  "steps": [...]
}
```

Tell the user: "Playbook saved with N steps. You can now use `/generate-heygen-video run <topic-folder-or-file>` to generate videos automatically."

---

## Mode 2: RUN — Execute the Recorded Workflow

### Pre-flight Checks

1. Read `workflows/ai-content-pipeline/heygen/playbook.json`
   - If `status` is `"not_recorded"` → tell user to run learn mode first, stop
   - If `steps` is empty → tell user to run learn mode first, stop

2. Read `workflows/ai-content-pipeline/heygen/config.json`

3. **Resolve Input Path** (see section above) to determine single-file or batch mode

4. **Build the queue** (see Batch Queue Construction above)

### Extract Data from Production Prompt

For each item in the queue, read the production file and parse these fields:

```
TOPIC         → {{video_title}} (used for naming the video in HeyGen)
ASPECT RATIO  → {{aspect_ratio}} ("9:16" or "16:9")
Avatar name   → {{avatar_name}} (from path + config.json mapping)
Voice name    → {{voice_name}} (from config.json mapping)
Language      → {{folder_language}} ("en" or "hi", extracted from key prefix; null for legacy flat)

Script text   → {{script_text}} (see cleaning rules below)
```

**Folder date** — extracted from the topic folder path (e.g., `output/maya/2026-03-20/Topics/...` → `{{folder_date}}` = `2026-03-20`).

**Script text cleaning rules:**

The production prompt contains the script inside `Script: "..."` fields across multiple sections (HOOK, CONTEXT, CORE, CTA or HOOK, PAYOFF, CTA). Concatenate all section scripts in order, then clean:

1. Remove `[beat]` → replace with `. ` (period + space, creates a natural pause in TTS)
2. Remove `[pause]` → replace with `... ` (ellipsis + space, creates a longer TTS pause)
3. Remove `*...*` emphasis markers → keep the inner text (TTS doesn't need emphasis markers)
4. Remove `[TEXT: "..."]`, `[NUMBER: "..."]`, `[MATH: "..."]`, `[TAKEAWAY: "..."]` overlay markers → these are visual, not spoken
5. Collapse multiple spaces into single spaces
6. Trim leading/trailing whitespace

### Execution — Phase A: Session Setup (once)

**Step 1 — Open HeyGen**

```
mcp__plugin_playwright_playwright__browser_navigate({ url: config.heygen_url })
mcp__plugin_playwright_playwright__browser_snapshot()
```

Check if logged in. If login page detected:
- Tell user: "Please log in to HeyGen. I'll wait."
- Wait for navigation away from login
- Snapshot to confirm

**Step 2 — Confirm session is ready**

Take a snapshot to verify we're on the HeyGen dashboard/home page. This completes session setup.

### Execution — Phase B: Per-Video Loop

For each item in the queue:

```
for each item in queue (index i, total N):

  ── 1. Update status.json ──
  Read status.json from topic folder.
  Set item.key → { "status": "Video_Generating", "heygen_submitted": "YYYY-MM-DD HH:MM" }
  Write back full JSON (preserve all other keys).

  ── 2. Extract production data ──
  Read item.file_path.
  Parse all variables: {{video_title}}, {{aspect_ratio}}, {{script_text}}, etc.
  Set {{folder_language}} from item.language.

  ── 3. Execute playbook Steps 3–18 ──
  For each step in playbook.steps:

    a. Take a snapshot:
       mcp__plugin_playwright_playwright__browser_snapshot()

    b. Find the target element using the step's element_strategy:
       - Search snapshot accessibility tree for matching role + name_pattern
       - If not found, try fallback strategy
       - If still not found → ENTER ASSIST MODE (see below)

    c. Resolve variables in the step's value:
       - Replace {{script_text}} with cleaned script
       - Replace {{aspect_ratio}} with extracted aspect ratio
       - Replace {{avatar_name}} with mapped name from config.json
       - Replace {{voice_name}} with mapped voice from config.json
       - Replace {{video_title}} with extracted title
       - etc.

    d. Execute the action:
       - "click" → mcp__plugin_playwright_playwright__browser_click(...)
       - "fill" → mcp__plugin_playwright_playwright__browser_fill_form(...)
       - "type" → mcp__plugin_playwright_playwright__browser_type(...)
       - "select" → mcp__plugin_playwright_playwright__browser_select_option(...)
       - "navigate" → mcp__plugin_playwright_playwright__browser_navigate(...)
       - "wait" → mcp__plugin_playwright_playwright__browser_wait_for(...)
       - "scroll" → mcp__plugin_playwright_playwright__browser_evaluate(...)

    e. Wait for UI to settle (use step.wait_after or default 2 seconds)

    f. Take verification snapshot

    g. Brief status: "Step S/M: {description} — done"

    **Step 16 — Folder Navigation (3-level nesting):**

    When the playbook reaches the folder selection step, navigate using 3-level nesting:

    1. Click LEFT chevron on the avatar folder (e.g., "Finance-Maya") to expand it
    2. Find or create the date subfolder ({{folder_date}}), expand it via LEFT chevron
    3. If {{folder_language}} is set (multilingual topic):
       - Find or create the language subfolder ("en" or "hi")
       - Click the FOLDER ICON on the language subfolder to select it as destination
    4. If {{folder_language}} is null (legacy flat topic):
       - Click the date folder ICON to select it as destination (unchanged from original behavior)

    **Optimization:** Between consecutive videos in the SAME language, the folder may already
    be correct. Take a snapshot to check the current folder selection before re-navigating.
    If the correct folder is already selected, skip folder navigation for this video.

  ── 4. On success ──
  Update status.json: item.key → { "status": "Video_Generated", "heygen_completed": "YYYY-MM-DD HH:MM" }
  Show progress table (see below).

  ── 5. On failure ──
  Update status.json: item.key → { "status": "Video_Failed", "error": "description of what went wrong" }
  Ask user: "Video {i}/{N} failed: {error}. Continue to next video? (y/n)"
  If no → stop batch, show completion summary.

  ── 6. Navigate back for next video ──
  Execute playbook Step 19 (navigate back to video creation page for the next video).

  ── 7. Compact context ──
  Run /compact to compress the conversation context before starting the next video.
  This prevents context window exhaustion over 14 videos (each uses ~19 Playwright tool calls).
  The compacted context retains: batch queue, current position, status.json state, config/playbook references.
```

Single-file mode follows the same flow — the queue simply has 1 item.

### Progress Table

After each video completes (success or failure), display a progress table:

```
[3/14] Topic: SGB_Returns_Tax_Trap

  en/:
    ✓ YTLong_Production.md — Video_Generated
    ✓ YTShort_01_Production.md — Video_Generated
    → YTShort_02_Production.md — Video_Generating (current)
    · YTShort_03_Production.md — Draft
    · InstaReel_01_Production.md — Draft
    · InstaReel_02_Production.md — Draft
    · InstaReel_03_Production.md — Draft
  hi/:
    · YTLong_Production.md — Draft
    · YTShort_01_Production.md — Draft
    · YTShort_02_Production.md — Draft
    · YTShort_03_Production.md — Draft
    · InstaReel_01_Production.md — Draft
    · InstaReel_02_Production.md — Draft
    · InstaReel_03_Production.md — Draft

Legend: ✓ done  → current  ✗ failed  · pending  ○ skipped
```

For legacy flat topics (no language subfolders), omit the `en:/hi:` grouping.

### Batch Completion Summary

After processing all items in the queue (or stopping early due to user choosing not to continue):

```
Batch complete: {topic_name}
  Total: 14 | Generated: 12 ✓ | Failed: 1 ✗ | Skipped: 1 ○

  Failed videos can be retried: /generate-heygen-video run {topic_folder}
```

### Assist Mode (Element Not Found)

When an element from the playbook can't be found in the current snapshot:

1. Take a screenshot for visual context
2. Show the user: "I couldn't find the element for step N: '{description}'. The playbook expects a {role} matching '{name_pattern}'."
3. Show a summary of what IS visible on the page
4. Ask: "Can you help me find the right element? Describe what to click/fill, or say 'skip' to skip this step."
5. If user provides guidance:
   - Execute the action with the user's guidance
   - Ask: "Should I update the playbook with this new element identification?"
   - If yes, update the step in playbook.json (self-healing)

---

## Mode 3: CONFIG — Update Avatar Mappings

### Procedure

1. Read `workflows/ai-content-pipeline/heygen/config.json`
2. List available avatars by scanning `workflows/ai-content-pipeline/avatars/` (exclude `_template/`)
3. For each avatar, show current HeyGen mapping:
   ```
   Avatar: maya
     HeyGen avatar name: [not set]
     HeyGen voice name: [not set]
   ```
4. Ask user which avatar to configure
5. Ask for the HeyGen avatar name (as it appears in the HeyGen UI)
6. Ask for the HeyGen voice name
7. Update config.json
8. Confirm: "Config updated for {avatar}."

---

## Error Handling

| Scenario | Action |
|----------|--------|
| Playbook not recorded | Tell user to run learn mode first |
| Login required | Pause, ask user to log in, wait for navigation |
| Element not found | Enter assist mode (show snapshot, ask for help) |
| Page navigation unexpected | Take snapshot, show user, ask how to recover |
| HeyGen shows error/modal | Take screenshot, report to user, ask whether to retry or abort |
| Production file not found | List available production files in the topic folder, ask user to pick |
| Network timeout | Retry once, then report to user |
| `status.json` not found | If path is a directory without `status.json`, error: "No status.json found in {path}. Is this a valid topic folder?" |
| All files already processed | Show status summary: "All N production files are already Video_Generated/Video_Generating/Published. Nothing to do." |
| Video fails mid-batch | Mark as `Video_Failed` in status.json with error description. Ask user whether to continue to next video or stop. |
| Session expires mid-batch | Detect login page on any snapshot. Pause and ask user to re-login. Resume from current queue position after login confirmed. |
| Folder creation fails in HeyGen | Take screenshot, report to user. Ask whether to use existing folder or retry. |

---

## Important Notes

- **Batch mode supported.** Pass a topic folder to process all production files in one invocation. The skill loops through the queue, generating videos one-by-one using the recorded playbook.
- **Login persists** across the batch. If the session expires mid-batch, the skill detects the login page and re-prompts the user.
- **Failure handling.** Failed videos are marked `Video_Failed` in status.json. The user can continue to the next video or stop. Re-running the same topic folder retries only failed/unprocessed files.
- **Language subfolders in HeyGen.** For multilingual topics, videos are organized as `{avatar_folder}/{date}/{language}/` (e.g., `Finance-Maya/2026-03-20/en/`). Legacy flat topics use `{avatar_folder}/{date}/`.
- **Context management.** The skill runs `/compact` between videos to prevent context window exhaustion over long batches (14+ videos).
- **Browser state.** The Playwright browser may or may not persist sessions between Claude Code conversations. If login is required each time, the skill handles it gracefully by asking the user to log in.
- **Playbook maintenance.** If HeyGen updates its UI, some playbook steps may break. The assist mode + self-healing update mechanism handles this — the user guides through the changed step once and the playbook updates itself.
- **Script cleaning is critical.** HeyGen's TTS engine needs clean text without formatting markers. Always clean the script before pasting.
- **Single-file backward compatibility.** Passing a `_Production.md` file path still works — it runs as a one-item batch with the same flow.
