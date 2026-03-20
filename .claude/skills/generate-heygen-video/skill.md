---
name: generate-heygen-video
description: "Automate HeyGen video generation from production prompts. Usage: /generate-heygen-video learn | /generate-heygen-video run <production-file-path>"
user-invocable: true
---

# Generate HeyGen Video — Browser Automation Skill

You are automating video generation on HeyGen using Playwright browser automation.

**Working directory:** `workflows/ai-content-pipeline/`

## Parse Arguments

Parse the user's invocation to determine the mode:

1. **Learn mode:** `/generate-heygen-video learn` — Record the HeyGen workflow interactively
2. **Run mode:** `/generate-heygen-video run <path>` — Execute the recorded workflow with a production prompt file
3. **Config mode:** `/generate-heygen-video config` — Update HeyGen avatar/voice mappings

Examples:
- `/generate-heygen-video learn` → learn mode
- `/generate-heygen-video run output/maya/2026-03-20/Topics/Topic_01_Desc/en/YTShort_01_Production.md` → run mode
- `/generate-heygen-video config` → config mode

If no mode specified, check if playbook exists and has steps:
- If playbook is empty → suggest learn mode
- If playbook exists → suggest run mode

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

Tell the user: "Playbook saved with N steps. You can now use `/generate-heygen-video run <production-file>` to generate videos automatically."

---

## Mode 2: RUN — Execute the Recorded Workflow

### Pre-flight Checks

1. Read `workflows/ai-content-pipeline/heygen/playbook.json`
   - If `status` is `"not_recorded"` → tell user to run learn mode first, stop
   - If `steps` is empty → tell user to run learn mode first, stop

2. Read `workflows/ai-content-pipeline/heygen/config.json`

3. Parse the production file path from the user's command
   - Read the production file (e.g., `YTShort_01_Production.md`)
   - Extract: script text, aspect ratio, genre, title, clickbait title, description
   - Determine avatar from the file path (e.g., `output/maya/...` → avatar=maya)

### Extract Data from Production Prompt

Parse the production file to extract these fields:

```
TOPIC         → {{video_title}} (used for naming the video in HeyGen)
ASPECT RATIO  → {{aspect_ratio}} ("9:16" or "16:9")
Avatar name   → {{avatar_name}} (from path + config.json mapping)
Voice name    → {{voice_name}} (from config.json mapping)

Script text   → {{script_text}} (see cleaning rules below)
```

**Script text cleaning rules:**

The production prompt contains the script inside `Script: "..."` fields across multiple sections (HOOK, CONTEXT, CORE, CTA or HOOK, PAYOFF, CTA). Concatenate all section scripts in order, then clean:

1. Remove `[beat]` → replace with `. ` (period + space, creates a natural pause in TTS)
2. Remove `[pause]` → replace with `... ` (ellipsis + space, creates a longer TTS pause)
3. Remove `*...*` emphasis markers → keep the inner text (TTS doesn't need emphasis markers)
4. Remove `[TEXT: "..."]`, `[NUMBER: "..."]`, `[MATH: "..."]`, `[TAKEAWAY: "..."]` overlay markers → these are visual, not spoken
5. Collapse multiple spaces into single spaces
6. Trim leading/trailing whitespace

### Execution

**Step 1 — Open HeyGen**

```
mcp__plugin_playwright_playwright__browser_navigate({ url: config.heygen_url })
mcp__plugin_playwright_playwright__browser_snapshot()
```

Check if logged in. If login page detected:
- Tell user: "Please log in to HeyGen. I'll wait."
- Wait for navigation away from login
- Snapshot to confirm

**Step 2 — Execute Playbook Steps**

For each step in `playbook.steps`:

```
1. Take a snapshot:
   mcp__plugin_playwright_playwright__browser_snapshot()

2. Find the target element using the step's element_strategy:
   a. Search the snapshot's accessibility tree for an element matching:
      - role matches step.element_strategy.primary.role
      - name/label contains step.element_strategy.primary.name_pattern
   b. If not found, try fallback strategy
   c. If still not found → ENTER ASSIST MODE (see below)

3. Resolve variables in the step's value:
   - Replace {{script_text}} with cleaned script
   - Replace {{aspect_ratio}} with extracted aspect ratio
   - Replace {{avatar_name}} with mapped name from config.json
   - etc.

4. Execute the action:
   - "click" → mcp__plugin_playwright_playwright__browser_click({ element: step.description, ref: matched_ref })
   - "fill" → mcp__plugin_playwright_playwright__browser_fill_form({ ref: matched_ref, value: resolved_value })
   - "type" → mcp__plugin_playwright_playwright__browser_type({ ref: matched_ref, text: resolved_value, submit: false })
   - "select" → mcp__plugin_playwright_playwright__browser_select_option(...)
   - "navigate" → mcp__plugin_playwright_playwright__browser_navigate({ url: step.url })
   - "wait" → mcp__plugin_playwright_playwright__browser_wait_for(...)
   - "scroll" → mcp__plugin_playwright_playwright__browser_evaluate({ expression: "window.scrollBy(0, 500)" })

5. Wait for UI to settle (use step.wait_after or default 2 seconds)

6. Take verification snapshot

7. Brief status update to user: "Step N/M: {description} — done"
```

**Step 3 — Post-generation**

After the final "Generate/Submit" step:
1. Take a screenshot for the user's reference
2. Tell the user: "Video generation submitted for: {title}"
3. If the production file path can be traced to a topic folder, update `status.json` for that specific production file:
   - Parse the production file path to extract the status key:
     - If the topic has `en/`/`hi/` subfolders: key = `en/YTShort_01_Production.md` (language prefix + filename)
     - If the topic is legacy flat: key = `YTShort_01_Production.md` (filename only)
   - Read the existing `status.json` from the topic folder
   - Update only that key's value: `{ "status": "Video_Generating", "heygen_submitted": "YYYY-MM-DD HH:MM" }`
   - Write back the full JSON (preserving all other keys unchanged)

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

---

## Important Notes

- **One video at a time.** This skill processes a single production file per invocation. For batch processing, the user should call it multiple times or a future batch mode can be added.
- **Browser state.** The Playwright browser may or may not persist sessions between Claude Code conversations. If login is required each time, the skill handles it gracefully by asking the user to log in.
- **Playbook maintenance.** If HeyGen updates its UI, some playbook steps may break. The assist mode + self-healing update mechanism handles this — the user guides through the changed step once and the playbook updates itself.
- **Script cleaning is critical.** HeyGen's TTS engine needs clean text without formatting markers. Always clean the script before pasting.
