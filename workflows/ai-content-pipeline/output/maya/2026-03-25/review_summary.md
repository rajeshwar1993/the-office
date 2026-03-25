# Content Batch — 2026-03-25
**Avatar:** Maya
**Niche:** Personal Finance
**Research:** v2 (WebSearch + yt-dlp + NotebookLM)
**Topics:** 2 topics × 7 videos × 2 languages = 28 total videos

---

## How To Review
1. Scan the topics below
2. Open any topic folder at `output/maya/2026-03-25/Topics/{folder_name}/`
3. Review scripts in `en/` and `hi/` subfolders (yt_long.md, yt_short_01-03.md, ig_reel_01-03.md), research.md, review_report.md, and production files
4. **Bulk approve** all production files in a topic:
   ```bash
   cd output/maya/2026-03-25/Topics/{folder_name}
   node -e "const s=JSON.parse(require('fs').readFileSync('status.json','utf8'));for(const k in s)s[k].status='Approved';require('fs').writeFileSync('status.json',JSON.stringify(s,null,2))"
   ```
5. **Or edit individual entries** in `status.json` — each key is a production file path (e.g., `"en/YTShort_01_Production.md"`)
6. To reject an entire topic, set all entries to `"Rejected"`
7. Topics stay in place until ALL production files reach "Published" (then archived) or ALL reach "Rejected" (then deleted)

---

## Research Provenance (v2)
- **WebSearch:** 11 hot topics + 7 entertainment topics
- **YouTube (yt-dlp):** 13 topic videos + 12 finance videos + 10 comedy videos (35 total)
- **NotebookLM Trends-Finance:** `ebcb7dd8-756f-4792-a8f9-a2662ef077da` — 22 sources analyzed
- **NotebookLM Comedy-Craft:** `65b548fd-df87-4d58-b522-c124d7f43b97` — 9 sources analyzed
- **Script Knowhow:** Comedy/relatability techniques from Bassi, Gaurav Kapoor, Tanmay Bhat, Nischa, Harsh Gujral + others
- **Deep Research:** 3 additional WebSearches for fact verification

---

## Topics This Batch

### Topic 01 — Don't Be a Chhuchhundar in the Year of the Dhurandhar — Why Small-Caps Beat Your Home Loan EMI
- **Angle:** Use the Dhurandhar cultural moment to challenge "play it safe" mindset. Small-cap SIPs vs home loan EMIs with real math.
- **Genre:** `comedy_satire`  |  **Source:** `research_synthesis`
- **Hook:** Dhurandhar 2 just became the biggest Bollywood opener ever — and it teaches a finance lesson most people miss
- **Folder:** `Topics/Topic_01_Dhurandhar_SmallCap_Strategy/`
- **Scripts (en/):** `yt_long.md` | `yt_short_01.md` | `yt_short_02.md` | `yt_short_03.md` | `ig_reel_01.md` | `ig_reel_02.md` | `ig_reel_03.md`
- **Scripts (hi/):** `yt_long.md` | `yt_short_01.md` | `yt_short_02.md` | `yt_short_03.md` | `ig_reel_01.md` | `ig_reel_02.md` | `ig_reel_03.md`
- **Production (en/):** `YTLong_Production.md` | `YTShort_01_Production.md` | `YTShort_02_Production.md` | `YTShort_03_Production.md` | `InstaReel_01_Production.md` | `InstaReel_02_Production.md` | `InstaReel_03_Production.md`
- **Production (hi/):** `YTLong_Production.md` | `YTShort_01_Production.md` | `YTShort_02_Production.md` | `YTShort_03_Production.md` | `InstaReel_01_Production.md` | `InstaReel_02_Production.md` | `InstaReel_03_Production.md`

### Topic 02 — Your Savings Account Is Quietly Robbing You — The 2026 Money Shield Every 20-Something Needs
- **Angle:** Expose savings account as "leaking bucket." 3-part Money Shield: term insurance, inflation-beating SIP, 10% Memory Fund.
- **Genre:** `shock_and_awe`  |  **Source:** `research_synthesis`
- No general hook
- **Folder:** `Topics/Topic_02_Savings_Inflation_Shield/`
- **Scripts (en/):** `yt_long.md` | `yt_short_01.md` | `yt_short_02.md` | `yt_short_03.md` | `ig_reel_01.md` | `ig_reel_02.md` | `ig_reel_03.md`
- **Scripts (hi/):** `yt_long.md` | `yt_short_01.md` | `yt_short_02.md` | `yt_short_03.md` | `ig_reel_01.md` | `ig_reel_02.md` | `ig_reel_03.md`
- **Production (en/):** `YTLong_Production.md` | `YTShort_01_Production.md` | `YTShort_02_Production.md` | `YTShort_03_Production.md` | `InstaReel_01_Production.md` | `InstaReel_02_Production.md` | `InstaReel_03_Production.md`
- **Production (hi/):** `YTLong_Production.md` | `YTShort_01_Production.md` | `YTShort_02_Production.md` | `YTShort_03_Production.md` | `InstaReel_01_Production.md` | `InstaReel_02_Production.md` | `InstaReel_03_Production.md`

---

## Batch Stats
- Topics with general hook: **1/2**
- Genre breakdown:
  - `comedy_satire`: 1
  - `shock_and_awe`: 1
- Total videos: **28** (4 long-form, 12 shorts, 12 reels) — 7 English + 7 Hinglish per topic
