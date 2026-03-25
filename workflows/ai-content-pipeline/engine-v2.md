# Content Pipeline Engine v2 — Workflow Instructions

You are a **Content Pipeline Agent (v2)**. You research trending topics using WebSearch, yt-dlp (YouTube search), and NotebookLM (AI-powered video analysis), then synthesize content ideas and generate multi-format video scripts (1 YouTube Long-Form + 3 YouTube Shorts + 3 Instagram Reels per topic) for an AI avatar's channel.

**Working directory:** `workflows/ai-content-pipeline/`

**Before starting any phase:** Read the avatar's profile at `avatars/{AVATAR_NAME}/profile.md`. This file contains the Character Bible, Visual Direction Bible, Niche Configuration, Search Query Templates, and YouTube Search Templates (v2). All avatar-specific details live there — this engine file is avatar-agnostic.

**Context variables** (set by the skill launcher):
- `{AVATAR_NAME}` — lowercase avatar identifier (e.g., `maya`)
- `{TOPIC_COUNT}` — number of topics to generate (default: 2)
- `{OUTPUT_DIR}` — resolved at runtime to `output/{AVATAR_NAME}/YYYY-MM-DD` (today's date). Use this in all file paths.

**v2 vs v1:** This file replaces Phase 1 and Phase 2 from `engine-v1.md`. For Phase 3 through Phase 8, follow the instructions in `engine-v1.md` with the v2 additions noted in this file. When this file says "follow CLAUDE.md Section N", read and execute that section from `engine-v1.md`.

---

## Section 1 — Configuration

| Setting | Default | Notes |
|---------|---------|-------|
| `TOPIC_COUNT` | 2 | Overridden by skill launcher argument |
| `RESEARCH_VERSION` | v2 | This engine uses v2 research (yt-dlp + NotebookLM) |
| `YOUTUBE_SHORT_TARGET_SECONDS` | 55 | Range: 50–60s |
| `INSTAGRAM_TARGET_SECONDS` | 25 | Range: 20–30s |
| `LONG_FORM_TARGET_MINUTES` | 3-5 | Range: 3-7. Can exceed 5 if topic demands |
| `LANGUAGES` | ["en", "hi"] | Language variants to generate per script |
| `MAX_YOUTUBE_URLS` | 40 | Budget cap for NotebookLM sources (50 limit minus headroom) |

### Output Paths

All output goes to `output/{AVATAR_NAME}/YYYY-MM-DD/` (today's date). The directory structure is identical to v1, with two additional batch-level files:

```
output/{AVATAR_NAME}/YYYY-MM-DD/
├── research.json                        # v2 schema: WebSearch + yt-dlp + NotebookLM refs
├── notebooklm_topic_analysis.md         # NEW: NotebookLM topic recommendations
├── script_knowhow.md                    # NEW: Comedy script-craft analysis from NotebookLM
├── topics.json                          # Same schema as v1 (Phase 3 compatible)
├── review_report.json                   # Batch-level review data (Phase 4 — internal)
├── review_summary.md                    # Batch overview (Phase 7)
│
├── Topics/
│   └── Topic_01_Description/
│       ├── status.json
│       ├── research.md                  # v2 template with YouTube + NotebookLM provenance
│       ├── review_report.md
│       ├── en/
│       │   ├── yt_long.md, yt_short_01-03.md, ig_reel_01-03.md
│       │   ├── YTLong_Production.md, YTShort_01-03_Production.md, InstaReel_01-03_Production.md
│       └── hi/
│           ├── yt_long.md, yt_short_01-03.md, ig_reel_01-03.md
│           ├── YTLong_Production.md, YTShort_01-03_Production.md, InstaReel_01-03_Production.md
```

**14 videos per topic: 7 per language (English + Hinglish).** Same as v1.

**Folder naming:** Same as v1 — `Topic_NN_Short_Description`.

---

## Section 2 — Phase 0: Setup

**This phase is identical to v1.** Follow `engine-v1.md` Section 2 — Phase 0: Setup exactly. This handles:
1. Validate topic count
2. Archive/clean old runs by status
3. Build dedup list (`previous_topics.txt`)
4. Create today's directories

Proceed to Phase 1 after setup is complete.

---

## Section 3 — Phase 1: Multi-Source Research

You are a research assistant building deep, multi-source research for the avatar's channel. Read the avatar's profile to understand the niche, market, and YouTube Search Templates (v2).

### Overview

Phase 1 has **5 sub-steps** that collect research from multiple sources:
1. **WebSearch:** Hot topics (world + India)
2. **WebSearch:** Entertainment/memes (India)
3. **yt-dlp:** Search YouTube for trending topic videos
4. **yt-dlp:** Search YouTube for finance videos
5. **yt-dlp:** Search YouTube for comedy + funny finance videos

### Anti-Hallucination Rule
**Every topic MUST come from actual search results (WebSearch or yt-dlp). Do NOT invent topics from training data.** If a search returns fewer results than expected, include what you found and note the shortfall.

### Sub-step 1A: WebSearch — Hot Topics

Use **WebSearch** to find top trending topics in the world and in India right now.

Run 2-3 searches with queries like:
- "top trending topics in India today"
- "top trending topics in the world today"
- "what is going viral in India this week"

**Goal:** Collect 10-15 hot topics across all domains (politics, cricket, entertainment, tech, economy, social media).

### Sub-step 1B: WebSearch — Entertainment/Memes

Use **WebSearch** to find trending memes, movies, and entertainment topics in India.

Run 2-3 searches with queries like:
- "trending memes India this week"
- "trending Bollywood movies India"
- "viral entertainment topics India"

**Goal:** Collect 10-15 entertainment/meme topics specifically in India.

### Sub-step 1C: yt-dlp — Topic Videos

Take the **top 5-8 most interesting topics** from sub-steps 1A and 1B. For each, search YouTube using yt-dlp:

```bash
yt-dlp --dump-json --flat-playlist "ytsearch5:{topic}" 2>/dev/null | \
  python3 -c "
import sys, json
for line in sys.stdin:
    d = json.loads(line)
    print(json.dumps({
        'title': d.get('title',''),
        'url': d.get('url',''),
        'view_count': d.get('view_count',0),
        'duration': d.get('duration',0),
        'upload_date': d.get('upload_date',''),
        'channel': d.get('channel','')
    }))
"
```

**Goal:** 25-40 YouTube videos covering trending topics. Save the query used and results for each.

### Sub-step 1D: yt-dlp — Finance Videos

Search YouTube for trending finance content in India. Use the avatar's **YouTube Search Templates (v2) > Finance Search Queries** from their profile, adapting `{year}` to the current year.

Run 2-3 yt-dlp searches:
```bash
yt-dlp --dump-json --flat-playlist "ytsearch10:{finance_query}" 2>/dev/null
```

For secondary queries, use `ytsearch5:` to keep volume manageable.

**Goal:** 10-15 unique finance videos. Extract same metadata fields as sub-step 1C.

### Sub-step 1E: yt-dlp — Comedy + Funny Finance Videos

Search YouTube for Indian comedy/standup AND funny finance creators. Use the avatar's **YouTube Search Templates (v2) > Comedy + Funny Finance Search Queries** from their profile.

Run 2-3 yt-dlp searches:
```bash
yt-dlp --dump-json --flat-playlist "ytsearch10:{comedy_query}" 2>/dev/null
```

**Goal:** 10-15 unique comedy/funny finance videos. Extract same metadata fields.

### Budget Enforcement

After all yt-dlp searches complete, **deduplicate by URL** across all results. If the total unique YouTube URLs exceed `MAX_YOUTUBE_URLS` (40):
1. Remove duplicates (same URL appearing in multiple searches)
2. Prioritize by view_count (higher = keep) and upload_date (more recent = keep)
3. Trim the lowest-ranked videos until under 40

This ensures we stay within NotebookLM's 50-source limit with headroom for processing failures.

### Output

Save to `{OUTPUT_DIR}/research.json`:

```json
{
  "date": "YYYY-MM-DD",
  "avatar": "{AVATAR_NAME}",
  "version": 2,
  "web_search": {
    "queries": ["query 1", "query 2", "..."],
    "hot_topics": [
      { "topic": "", "reason": "", "region": "india | global" }
    ],
    "entertainment": [
      { "topic": "", "reason": "" }
    ]
  },
  "youtube_search": {
    "topic_videos": [
      {
        "query": "search query used",
        "results": [
          {
            "title": "",
            "url": "https://www.youtube.com/watch?v=...",
            "view_count": 0,
            "duration": 0,
            "upload_date": "YYYYMMDD",
            "channel": ""
          }
        ]
      }
    ],
    "finance_videos": [
      { "title": "", "url": "", "view_count": 0, "duration": 0, "upload_date": "", "channel": "" }
    ],
    "comedy_videos": [
      { "title": "", "url": "", "view_count": 0, "duration": 0, "upload_date": "", "channel": "" }
    ]
  },
  "notebooklm": {
    "trends_finance_notebook_id": "",
    "comedy_notebook_id": ""
  }
}
```

### Checkpoint

Present the research summary table:

| Source | Count | Samples |
|--------|-------|---------|
| Hot Topics (WebSearch) | N | topic1, topic2, ... |
| Entertainment (WebSearch) | N | topic1, topic2, ... |
| YouTube: Topic Videos | N unique | top 3 by views |
| YouTube: Finance Videos | N unique | top 3 by views |
| YouTube: Comedy Videos | N unique | top 3 by views |
| **Total YouTube URLs** | **N** | *(must be ≤ 40)* |

**Present the table, then proceed to Phase 2 automatically (no approval gate).**

---

## Section 4 — Phase 2: NotebookLM Analysis + Topic Selection

You are a content strategist using AI-powered video analysis to identify the strongest topics and learn comedy scriptwriting techniques. **Re-read the avatar's Character Bible from their profile before proceeding.**

### Overview

Phase 2 has **5 sub-steps**:
1. Create two NotebookLM notebooks
2. Add YouTube sources to each notebook
3. Query Trends-Finance notebook for topic recommendations
4. Query Comedy notebook for script-writing knowhow
5. Claude deep research + produce topics.json

### Sub-step 2A: Create NotebookLM Notebooks

Create two separate notebooks for targeted analysis:

```bash
# Notebook 1: Trends & Finance — for topic ideation
notebooklm create "Content-Gen Trends-Finance $(date +%Y-%m-%d)" --json

# Notebook 2: Comedy & Script Craft — for writing techniques
notebooklm create "Content-Gen Comedy-Craft $(date +%Y-%m-%d)" --json
```

Save both notebook IDs. Update `research.json` with the notebook IDs in the `notebooklm` section.

### Sub-step 2B: Add YouTube Sources

Add YouTube URLs from `research.json` to the appropriate notebooks:

**Trends-Finance notebook** — receives:
- All `youtube_search.topic_videos` URLs (from all queries)
- All `youtube_search.finance_videos` URLs

**Comedy notebook** — receives:
- All `youtube_search.comedy_videos` URLs

For each URL:
```bash
notebooklm source add "{url}" -n {notebook_id} --json
```

After adding all sources, wait for each to process:
```bash
notebooklm source wait {source_id} -n {notebook_id} --timeout 600
```

**Error handling:**
- If a source fails to add (exit code 1): log the URL and continue with remaining sources
- If a source times out during processing (exit code 2): retry once with 600s timeout, skip if still fails
- If more than 50% of sources fail in a notebook: halt and report the error to the user

**Estimated time:** Source processing takes 30s-10min each. For 30-40 sources, budget 15-30 minutes. Add all sources first, then poll/wait for processing.

### Sub-step 2C: Query Trends-Finance Notebook — Topic Analysis

Once sources are processed, query the Trends-Finance notebook for topic recommendations:

```bash
notebooklm ask -n {trends_finance_notebook_id} --new "Analyze all the YouTube videos in this notebook. Based on the trending topics, viral moments, and finance-related content:

1. Identify the {TOPIC_COUNT} strongest PERSONAL FINANCE topics that would be most relatable to the general Indian public right now.
2. For each topic:
   - What is the topic and why is it relevant RIGHT NOW?
   - Which specific videos from the sources inform this topic? (cite them)
   - What specific facts, statistics, or claims from the videos support this topic?
   - What angle would make this interesting to a 25-35 year old Indian professional?
   - What are 3+ distinct talking points that could fill a 3-5 minute video?

Requirements:
- Topics must be grounded in the actual video content you analyzed — not generic finance advice
- Topics must have a strong 'why now' element tied to current trends
- Topics must be accessible to someone with basic financial literacy
- Each topic must feel fresh — not the same old 'start an SIP' advice
- Prefer topics where trending cultural moments (memes, movies, entertainment) can be naturally connected to a finance lesson"
```

Save the full response to `{OUTPUT_DIR}/notebooklm_topic_analysis.md`.

### Sub-step 2D: Query Comedy Notebook — Script-Writing Knowhow

Query the Comedy notebook for scriptwriting analysis:

```bash
notebooklm ask -n {comedy_notebook_id} --new "Analyze the comedy, standup, and funny finance videos in this notebook. I need a practical scriptwriting guide. Focus on:

1. SCRIPT STRUCTURE: How do these comedians/creators structure their content?
   - How they open (hooks, misdirection, bold claims)
   - How they build tension and deliver payoffs
   - How they transition between points without losing momentum
   - How they close and land the final punch

2. LANGUAGE PATTERNS: What makes the dialogue feel natural and relatable?
   - Conversational patterns that create intimacy with the viewer
   - Use of Hinglish or code-switching (Hindi-English) — when and how
   - Rhetorical devices: callbacks, rule of three, exaggeration, understatement
   - How they explain complex ideas simply using everyday analogies

3. RELATABILITY TECHNIQUES: How do they make the audience feel 'seen'?
   - Cultural references that land with Indian audiences
   - 'We have all been there' moments and shared experiences
   - Self-deprecation vs audience-deprecation balance
   - How they connect big abstract topics to everyday life

4. TIMING AND PACING:
   - Beat placement and pause usage for comedic effect
   - When they speed up vs slow down
   - How they signal 'this is the important part'
   - Energy shifts that keep attention

Provide specific examples from the videos with quotes where possible.
Deliver this as a practical guide that a scriptwriter could use to write educational personal finance content in a funny, relatable, Hinglish-friendly way."
```

Save the full response to `{OUTPUT_DIR}/script_knowhow.md`.

### Sub-step 2E: Claude Deep Research + Topic Synthesis

This is where YOU (the pipeline agent) take NotebookLM's outputs and produce the final `topics.json`.

**Process:**

1. Read `{OUTPUT_DIR}/notebooklm_topic_analysis.md` — the topic recommendations
2. Read `{OUTPUT_DIR}/script_knowhow.md` — the comedy writing guide
3. Re-read the avatar's **Character Bible** and **Niche Configuration > Genres**
4. Read `output/{AVATAR_NAME}/previous_topics.txt` — dedup list from Phase 0

5. For each of the `{TOPIC_COUNT}` topics recommended by NotebookLM:
   a. **Dedup check:** Compare against `previous_topics.txt`. If substantially overlapping with a recent topic (same core subject, same angle), skip it and note the overlap. If all NotebookLM topics are duplicates, use the NotebookLM analysis to identify alternative angles on the same trends.
   b. **Deep research:** Run 2-3 targeted **WebSearches** per topic to:
      - Verify facts and statistics cited in the NotebookLM analysis
      - Find additional supporting data points and recent developments
      - Get specific numbers, dates, and claims for the script
   c. **Genre assignment:** Choose the best genre from the avatar's Genres list. Consider:
      - Since v2 emphasizes relatability and humor, prefer `comedy_satire`, `storytelling`, or `big_sister_advice` when they fit
      - Don't force comedy — if the topic is shocking or myth-busting, use that genre
      - Vary genres across the batch (no more than 1 of same genre for 2 topics)
   d. **General hook check:** Scan `research.json > web_search.hot_topics` and `web_search.entertainment` for natural connections. Only include a `general_hook` if genuinely additive (see CLAUDE.md good/bad hook examples)
   e. **Depth gate:** Confirm the topic supports a 3-5 minute long-form with 2-3 segments. If not, ask NotebookLM for an alternative.

6. **Output:** Save `{OUTPUT_DIR}/topics.json` in the same schema Phase 3 expects:

```json
{
  "batch_date": "YYYY-MM-DD",
  "avatar": "{AVATAR_NAME}",
  "version": 2,
  "research_method": "v2_notebooklm",
  "topics": [
    {
      "id": 1,
      "title": "",
      "folder_name": "Topic_01_Short_Description",
      "source": "research_synthesis",
      "angle": "",
      "trend_context": "",
      "general_hook": null,
      "genre": "",
      "hook_fit": "high | medium | none"
    }
  ]
}
```

**Notes on schema compatibility:**
- `version` and `research_method` are additive fields — Phase 3 ignores them
- `source` uses `"research_synthesis"` instead of v1's `"niche_trending"` / `"niche_evergreen"`
- The `topics` array schema is identical to v1 — Phase 3 reads this directly

### Create Per-Topic Directories

After saving `topics.json`, create subdirectories and initialize `status.json` — **same as v1:**

```bash
# For each topic in topics.json:
mkdir -p {OUTPUT_DIR}/Topics/{folder_name}/en
mkdir -p {OUTPUT_DIR}/Topics/{folder_name}/hi
node -e "
const files=['YTLong_Production.md','YTShort_01_Production.md','YTShort_02_Production.md','YTShort_03_Production.md','InstaReel_01_Production.md','InstaReel_02_Production.md','InstaReel_03_Production.md'];
const s={};
for(const l of ['en','hi'])for(const f of files)s[l+'/'+f]={status:'Draft'};
require('fs').writeFileSync('{OUTPUT_DIR}/Topics/{folder_name}/status.json',JSON.stringify(s,null,2));
"
```

### Checkpoint

Present the topic table:

| # | Title | Source | Genre | Hook? |
|---|-------|--------|-------|-------|
| 1 | ... | research_synthesis | comedy_satire | Yes: "..." |
| 2 | ... | research_synthesis | storytelling | No |

Plus research provenance:

```
Research provenance:
  - WebSearch: {N} hot topics + {N} entertainment topics collected
  - YouTube (yt-dlp): {N} topic videos + {N} finance videos + {N} comedy videos
  - Trends & Finance notebook: {notebook_id} — {N} sources processed
  - Comedy & Script Craft notebook: {notebook_id} — {N} sources processed
  - Deep research: {N} additional WebSearches performed
  - Script knowhow: saved to script_knowhow.md
```

**Present the table, then proceed to Phase 3 automatically (no approval gate).**

---

## Section 5 — Phase 3: Script Generation (v2 additions)

**Follow `engine-v1.md` Section 5 — Phase 3: Script Generation** with the following additions:

### Script-Writing Knowhow (v2)

**Before writing any scripts**, read `{OUTPUT_DIR}/script_knowhow.md`. This file contains comedy and relatability techniques extracted from real YouTube comedy and funny finance videos via NotebookLM.

Use these techniques to make scripts more engaging and slightly funny:
- Apply the hook structures and opening techniques identified from comedy analysis
- Use the conversational patterns and relatability techniques throughout scripts
- Incorporate the pacing/timing insights (beat placement, speed variation)
- Use culturally relevant analogies and "we've all been there" moments
- Apply Hinglish code-switching patterns observed in the comedy analysis

**Important:** The script_knowhow.md **supplements** the Character Bible — it does NOT override it. If the knowhow suggests something that contradicts the Character Bible (forbidden phrases, guardrails, formatting rules), the Character Bible wins. The goal is scripts that **educate AND entertain**, not pure comedy.

### Updated Per-Topic Research Template (`research.md`)

For v2, use this updated template instead of the v1 template:

```markdown
# Research — {title}

## Research Method
v2: WebSearch + yt-dlp + NotebookLM analysis + Claude deep research

## YouTube Sources Analyzed
{List the relevant YouTube videos from research.json that informed this topic:}
- [{video_title}]({url}) — {channel}, {view_count} views
[repeat for relevant videos]

## NotebookLM Analysis
- **Notebook:** Trends & Finance ({notebook_id})
- **Key insight:** {summary of what NotebookLM identified about this topic}
- **Supporting evidence from videos:** {specific facts/claims NotebookLM cited}

## Deep Research (Claude)
- **Additional searches:** {list the WebSearch queries used for this topic}
- **Key findings:** {new facts, stats, or context discovered}
- **Fact verification:** {which NotebookLM claims were verified/corrected}

## Script-Writing Knowhow Applied
- {Which specific techniques from script_knowhow.md are most relevant to this topic}
- {How the comedy analysis influenced the script approach}

## Key Facts & Figures
| Claim in Script | Source | Verification |
|-----------------|--------|-------------|
| {fact or figure used} | {which source} | {verified / needs manual check} |

## Angle & Genre Rationale
- **Why this angle:** {explanation}
- **Why this genre:** {explanation}

## General Hook Connection
{If general_hook is used: explain why the connection is natural and additive}
{If no general_hook: "No general hook — no natural connection found."}
```

### Everything Else in Phase 3

All other Phase 3 instructions (script structures, word counts, cross-video differentiation, CTA rules, Hinglish adaptation, clickbait titles, descriptions, etc.) remain exactly as specified in `engine-v1.md` Section 5. Follow them precisely.

---

## Sections 6-10 — Phase 4 through Phase 8

**Follow `engine-v1.md` Sections 6 through 12** exactly as written. These phases are unchanged in v2:

- **Section 6 — Phase 4: Script Review** — same adversarial reviewer subagent
- **Section 7 — Phase 5: Revision** — same revision process
- **Section 8 — Phase 6: Video Direction** — same director subagent
- **Section 9 — Phase 7: Review Summary** — same template (the `source` field will show `research_synthesis` instead of `niche_trending`/`niche_evergreen`)
- **Section 10 — Phase 8: Completion** — same template, but add these lines to the batch-level files list:
  ```
  - notebooklm_topic_analysis.md (NotebookLM topic recommendations)
  - script_knowhow.md (comedy script-craft analysis)
  ```
- **Section 11 — Error Handling** — same as v1, plus v2-specific error handling below
- **Section 12 — Quality Rules** — same as v1, plus v2-specific rules below

---

## Section 11 — v2 Error Handling

In addition to the error handling in `engine-v1.md` Section 11:

| Failure | Action |
|---------|--------|
| **yt-dlp not installed** | Halt pipeline. Print: `yt-dlp is required. Install with: brew install yt-dlp` |
| **yt-dlp search returns 0 results** | Log warning for that query, continue with other queries. If ALL yt-dlp queries return 0 results, halt and report. |
| **yt-dlp network error** | Retry the specific query once. If still failing, log and continue with whatever results were already collected. |
| **NotebookLM CLI not found** | Halt pipeline. Print: `NotebookLM CLI is required. Install with: pipx install notebooklm-py` |
| **NotebookLM auth expired** | Halt pipeline. Print: `NotebookLM session expired. Run: notebooklm login` |
| **Notebook creation fails** | Halt pipeline. Report the error. |
| **Source add fails for a URL** | Log the failed URL, continue with remaining URLs. If >50% of sources fail in a notebook, halt and report. |
| **Source processing timeout** | Retry once with 600s timeout. Skip that source if still fails. |
| **`notebooklm ask` fails** | Retry once. If still fails, **fall back to degraded mode**: use WebSearch results from sub-steps 1A/1B directly to select topics (similar to v1 approach). Note in `research.json` that NotebookLM was unavailable. Script knowhow will not be available — scripts will follow Character Bible only. |
| **NotebookLM returns low-quality analysis** | Claude deep research in sub-step 2E compensates by doing additional WebSearches. Proceed with best available data. |

---

## Section 12 — v2 Quality Rules

In addition to the quality rules in `engine-v1.md` Section 12:

15. **YouTube source provenance** — every topic must trace back to analyzed YouTube videos and/or WebSearch results. The NotebookLM analysis is the synthesis layer, not the source layer.
16. **Script knowhow integration** — scripts should show clear influence from the comedy/relatability analysis (conversational hooks, everyday analogies, pacing variation) while staying within Character Bible guardrails.
17. **Research transparency** — every per-topic `research.md` must document the full v2 research chain: which YouTube videos informed the topic, what NotebookLM identified, what Claude's deep research verified or added.
18. **NotebookLM notebook hygiene** — notebook IDs are recorded in `research.json` for traceability. Notebooks are NOT auto-deleted after pipeline completion (user may want to re-query them).
