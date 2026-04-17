---
name: generate-heygen-video
description: "Automate HeyGen video generation from production prompts. Usage: /generate-heygen-video learn | /generate-heygen-video run <topic-folder-or-file>"
user-invocable: true
---

# Generate HeyGen Video — Browser Automation Skill

You are automating video generation on HeyGen using Playwright browser automation.

**Working directory:** this workflow's root (the directory containing `heygen/`, `avatars/`, `engine-v1.md`). All paths below are relative to it.

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

All config lives in `heygen/`:

| File | Purpose |
|------|---------|
| `config.json` | HeyGen URLs, avatar name mappings, voice mappings, default settings |
| `playbook.json` | Recorded workflow steps from learn mode |

---

## Mode 1: LEARN — Record the HeyGen Workflow

### Purpose
Walk the user through HeyGen step-by-step. At each step, take a browser snapshot, ask what to do, execute the action, and record the step into `playbook.json`.

### Pre-flight
1. Read `heygen/config.json`
2. Read `heygen/playbook.json`
3. If playbook already has steps, warn: "A playbook already exists with N steps. This will overwrite it. Continue?"

### Procedure

**Step 1 — Open HeyGen**

Navigate to the HeyGen create page from config.json using Playwright:
```
mcp__plugin_playwright_playwright__browser_navigate({ url: config.create_video_url })
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
- `{{avatar_look_name}}` — from production file `AVATAR LOOK` header (e.g., "Curly Cascade Beauty"); falls back to config.json `heygen_avatar_look_name`
- `{{voice_name}}` — from config.json `heygen_voice_name` (e.g., "Kanika")
- `{{aspect_ratio}}` — from production file `ASPECT RATIO` header field ("9:16" or "16:9")
- `{{background_search_term}}` — search-friendly term extracted from production file `BACKGROUND` field
- `{{video_title}}` — production filename without extension (e.g., "YTShort_01_Production")
- `{{script_text}}` — cleaned script text (all markers removed, see cleaning rules)
- `{{caption_style}}` — from config.json `heygen_caption_style` (e.g., "bold")
- `{{folder_name}}` — from config.json `heygen_folder_name` (e.g., "Finance-Maya")
- `{{folder_date}}` — extracted from topic folder path (e.g., "2026-03-20")

**Step 4 — Save Playbook**

Write the final playbook to `heygen/playbook.json`:

```json
{
  "version": 1,
  "status": "recorded",
  "recorded_date": "YYYY-MM-DD",
  "total_steps": N,
  "variables_used": ["avatar_look_name", "voice_name", "aspect_ratio", "background_search_term", "video_title", "script_text", "caption_style", "folder_name", "folder_date"],
  "notes": "Recorded from learn session",
  "steps": [...]
}
```

Tell the user: "Playbook saved with N steps. You can now use `/generate-heygen-video run <topic-folder-or-file>` to generate videos automatically."

---

## Mode 2: RUN — Execute the Recorded Workflow

### Pre-flight Checks

1. Read `heygen/playbook.json`
   - If `status` is `"not_recorded"` → tell user to run learn mode first, stop
   - If `steps` is empty → tell user to run learn mode first, stop

2. Read `heygen/config.json`

3. **Resolve Input Path** (see section above) to determine single-file or batch mode

4. **Build the queue** (see Batch Queue Construction above)

### Extract Data from Production Prompt

For each item in the queue, read the production file and extract all 9 playbook variables:

**From production file header fields:**
```
ASPECT RATIO   → {{aspect_ratio}} ("9:16" or "16:9")
BACKGROUND     → {{background_search_term}} (extract a search-friendly term, e.g., "casual_advice — Modern apartment, warm lighting" → "modern apartment warm lighting")
AVATAR LOOK    → {{avatar_look_name}} (e.g., "Curly Cascade Beauty" or "Wavy-Haired Professional in Blue" — each production file may specify a different look)
```

**From config.json (avatar section):**

Resolve the avatar name from the topic folder path: `output/{avatar_name}/...` → extract `{avatar_name}` (e.g., `maya`). Then look up `config.avatars.{avatar_name}` to get all avatar-specific settings:

```
config.avatars.{avatar_name}.heygen_avatar_look_name → {{avatar_look_name}} fallback if production file AVATAR LOOK is missing
config.avatars.{avatar_name}.heygen_voice_name       → {{voice_name}} (e.g., "Kanika")
config.avatars.{avatar_name}.heygen_caption_style    → {{caption_style}} (e.g., "bold")
config.avatars.{avatar_name}.heygen_folder_name      → {{folder_name}} (e.g., "Finance-Maya")
config.avatars.{avatar_name}.heygen_motion_engine    → used to verify/set motion engine (e.g., "Avatar III")
```

**From path derivation:**
```
Production filename     → {{video_title}} (basename without extension, e.g., "YTShort_01_Production")
Topic folder path       → {{folder_date}} (e.g., "output/maya/2026-03-20/Topics/..." → "2026-03-20")
Queue item language     → {{folder_language}} ("en" or "hi"; null for legacy flat topics)
```

**From production file body — Script text → {{script_text}}:**

The production file contains `Script: "..."` fields across multiple sections. Concatenate all section scripts in order, then clean:

1. Remove `[beat]` → replace with `. ` (period + space, creates a natural pause in TTS)
2. Remove `[pause]` → replace with `... ` (ellipsis + space, creates a longer TTS pause)
3. Remove `*...*` emphasis markers → keep the inner text (TTS doesn't need emphasis markers)
4. Remove `[TEXT: "..."]`, `[NUMBER: "..."]`, `[MATH: "..."]`, `[TAKEAWAY: "..."]` overlay markers → these are visual, not spoken
5. Collapse multiple spaces into single spaces
6. Collapse consecutive periods (e.g., `". ."` → `". "`) — prevents double periods when `[beat]` follows a sentence-ending period
7. Trim leading/trailing whitespace

### Execution — Phase A: Session Setup (once)

**Step 1 — Open HeyGen Create Page**

```
mcp__plugin_playwright_playwright__browser_navigate({ url: config.create_video_url })
mcp__plugin_playwright_playwright__browser_snapshot()
```

Navigate to `config.create_video_url` (currently `https://app.heygen.com/create-v4`), NOT `config.heygen_url` (which is the home page). The create URL goes directly to the video editor.

Check if logged in. If login page detected:
- Tell user: "Please log in to HeyGen. I'll wait."
- Wait for navigation away from login
- Snapshot to confirm

**Step 2 — Confirm session is ready**

Take a snapshot to verify we're on the HeyGen editor or dashboard. This completes session setup.

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

  ── 3. Execute video creation steps ──

  Each step below is prescriptive — follow it exactly. Take a snapshot before and after
  each step to verify the UI state. If an element can't be found, enter ASSIST MODE.

  **Step 3A — Open in AI Studio**
  Snapshot. Look for "Open in AI Studio" link/button.
  - If found: click it, wait for network_idle, snapshot to verify editor loaded.
  - If not found (already in AI Studio): skip this step.

  **Step 3B — Dismiss popups**
  Snapshot. Look for any modal dialog (e.g., "Brand Systems", "What's New").
  - If a Close button is visible: click it, wait 1s.
  - If no dialog: skip.

  **Step 3C — Select avatar look**
  Snapshot. Click "Avatar" button in the right sidebar panel.
  Wait 2s, snapshot. Click on the avatar preview area to open the looks/search panel.
  Search for {{avatar_look_name}} (e.g., "Curly Cascade Beauty") and click on the matching result.
  **IMPORTANT:** Click the avatar look's CONTAINER div (the card/thumbnail area), NOT the small
  button overlaid on it. The small button toggles **favorites** (heart icon), not selection.
  Wait 2s, snapshot to verify the avatar look changed.

  **Step 3D — Set voice**
  Snapshot. Click the "Voice" area/button to open voice selection.
  Search for {{voice_name}} (e.g., "Kanika") and select it.
  Wait 2s, snapshot to verify voice is set.

  **Step 3E — Set aspect ratio**
  Snapshot. Look for the aspect ratio buttons in the top toolbar.
  - If {{aspect_ratio}} is "9:16": click "Portrait (9:16)" button.
  - If {{aspect_ratio}} is "16:9": click "Landscape (16:9)" button.
  Wait 1s, snapshot to verify.

  **Step 3F — Set Motion Engine to Avatar III**
  Snapshot. Find the "Motion Engine" dropdown in the avatar settings panel.
  - Check current value. If already "Avatar III": skip.
  - If set to "Avatar IV" or anything else: click dropdown, select "Avatar III".
  Wait 2s, snapshot to verify.
  **CRITICAL:** Avatar IV costs ~79 credits per video. Avatar III costs ~1 credit.
  Always verify this is set to Avatar III before proceeding.

  **Step 3G — Set background**
  Snapshot. Click "Background" in the right sidebar.
  Wait 1s. Switch to the "Stock" tab. Search for {{background_search_term}}.
  Wait 2s for results. Select the first relevant result.
  If no good match: keep the default background.
  Wait 1s, snapshot to verify.

  **Step 3H — Set video title**
  Snapshot. Find the title textbox (shows "Untitled Video" or previous title).
  Click it, select all (Ctrl+A / Cmd+A), then type {{video_title}}.
  Wait 1s, snapshot to verify title is set.
  **IMPORTANT:** Set the title BEFORE pasting the script (Step 3I).

  **Step 3I — Paste script**
  Snapshot. Find the script area — look for placeholder text "Type your script or use '/' for commands".
  - Click DIRECTLY on the placeholder text. Do NOT click "Script Writer".
  - Once cursor is active in the rich text editor, type/paste {{script_text}}.
  - Click somewhere else outside the script area to deselect.
  - Snapshot to verify the script text persists AND the timeline duration is > 0:00.
  **CRITICAL:** NEVER press Enter in the script area — it triggers HeyGen AI rewrite
  which changes the script content. Use fill/type only.
  **RETRY:** If after pasting the timeline still shows 00:00 or the placeholder reappears,
  the paste didn't stick (intermittent HeyGen rich text editor issue). Re-click the placeholder
  and re-paste. Verify duration > 0 before proceeding.

  **Step 3J — Enable Auto-enhance**
  Snapshot. Click "Delivery style" to expand delivery options.
  Wait 1s. Click "Auto-enhance" to enable it.
  Wait 2s, snapshot to verify auto-enhance is on (adds emotion tags like [surprised], [excited]).

  **Step 3K — Set captions**
  Snapshot. Click "Captions" in the right sidebar panel.
  Wait 1s. Look for the caption style matching {{caption_style}} (e.g., "bold").
  Click the caption style button (matches pattern '{style_name} caption preview' in Other Styles).
  Wait 2s, snapshot to verify caption style is applied.

  **Step 3L — Click Generate**
  Snapshot. Click the "Generate" button in the top-right toolbar.
  Wait 2s. Snapshot to verify the "Generate Video" dialog opened.
  Check the dialog shows the correct video title.

  **Step 3M — Open folder selection**
  In the Generate Video dialog, click the "My Videos" button (next to "Add to folder").
  Wait 1s. Snapshot to verify the folder tree selection dialog opened.

  **Step 3N — Navigate folder tree (3-level nesting)**
  In the folder tree dialog:

  1. Find the avatar folder ({{folder_name}}, e.g., "Finance-Maya").
     Click the LEFT chevron/arrow next to it to expand — do NOT click the folder name text
     (that activates rename mode) and do NOT click the right "+" button (that creates a subfolder).

  2. Look for a date subfolder matching {{folder_date}} (e.g., "2026-03-20").
     - If it exists: click the LEFT chevron to expand it.
     - If it doesn't exist: click the "+" button on the avatar folder to create it, name it {{folder_date}}.

  3. If {{folder_language}} is set (multilingual topic):
     - Look for a language subfolder ("en" or "hi") inside the date folder.
     - If it doesn't exist: click "+" on the date folder to create it, name it {{folder_language}}.
     - Click the language subfolder's FOLDER ICON to select it as destination.
  4. If {{folder_language}} is null (legacy flat):
     - Click the date folder's FOLDER ICON to select it.

  **CRITICAL:** NEVER click folder name text directly — it activates rename mode.
  Always click the folder ICON (left side) or the container div to select.

  **VERIFICATION:** After clicking a folder to select it, use `browser_take_screenshot` (not just
  `browser_snapshot`) to verify the blue checkmark appears. The accessibility tree may not
  reflect the selected state, but the screenshot will show the visual checkmark.

  **Optimization:** Between consecutive videos in the SAME language, the folder may already
  be correct. Before clicking "My Videos" in Step 3M, check if the folder path already shows
  the correct destination. If so, skip Steps 3M-3O entirely.

  **Step 3O — Confirm folder selection**
  Click "Confirm" button in the folder selection dialog.
  Wait 1s. Snapshot to verify we're back in the Generate Video dialog with the correct folder shown.

  **Step 3P — Submit video generation**
  Click "Submit" button in the Generate Video dialog.
  Wait for network_idle. Snapshot to verify submission succeeded.
  Default settings: 1080p, 25fps, MP4 format.
  After submission, HeyGen navigates to the Projects page showing the video in progress.

  ── 4. On success ──
  Update status.json: item.key → { "status": "Video_Generated", "heygen_completed": "YYYY-MM-DD HH:MM" }
  Show progress table (see below).

  ── 5. On failure ──
  Update status.json: item.key → { "status": "Video_Failed", "error": "description of what went wrong" }
  Ask user: "Video {i}/{N} failed: {error}. Continue to next video? (y/n)"
  If no → stop batch, show completion summary.

  ── 6. Navigate back for next video ──
  After Submit, HeyGen redirects to the Projects page. Navigate back to the create page:
  ```
  mcp__plugin_playwright_playwright__browser_navigate({ url: config.create_video_url })
  ```
  Wait for network_idle. Snapshot to verify we're on the create page (should show "Open in AI Studio" or the editor directly).

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

When an expected element can't be found during any prescriptive step (3A–3P):

1. Take a screenshot for visual context
2. Show the user: "Step {step_id} ({description}): I couldn't find the expected element. I was looking for '{element description}'."
3. Show a summary of what IS visible on the page
4. Ask: "Can you help me find the right element? Describe what to click/fill, or say 'skip' to skip this step."
5. If user provides guidance:
   - Execute the action with the user's guidance
   - Note the updated element identification for future reference

---

## Mode 3: CONFIG — Update Avatar Mappings

### Procedure

1. Read `heygen/config.json`
2. List available avatars by scanning `avatars/` (exclude `_template/`)
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
| Insufficient credits | Take screenshot showing credit count. Report to user: "HeyGen shows insufficient credits ({N} available). Avatar III costs ~1 credit per video, Avatar IV costs ~79. Verify Motion Engine is set to Avatar III (Step 3F). If credits are genuinely exhausted, stop batch." |

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
- **Credit checking.** Avatar III costs ~1 credit per video; Avatar IV costs ~79 credits. Step 3F explicitly verifies Motion Engine is set to Avatar III. If the Generate dialog shows insufficient credits, stop and report — do not submit.
- **Motion Engine enforcement.** Always verify and set Motion Engine to Avatar III (from `config.json`) at Step 3F. The v4 editor may default to Avatar IV which is 79x more expensive.
- **Navigation URL.** Always use `config.create_video_url` (the editor URL, currently `/create-v4`) to navigate — never `config.heygen_url` (the home page). The create URL goes directly to the editor.
