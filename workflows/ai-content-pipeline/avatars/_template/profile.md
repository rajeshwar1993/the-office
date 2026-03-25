# {Avatar Name} — Avatar Profile

<!--
  HOW TO USE THIS TEMPLATE:
  1. Copy this entire directory to avatars/{name}/ (lowercase, no spaces)
  2. Fill in every section below — replace all {TODO} placeholders
  3. The pipeline engine reads this file at runtime; no engine changes needed
  4. Test with: /content-gen {name}, 2 topics
-->

## Meta

| Field | Value |
|-------|-------|
| **Name** | {TODO: Avatar display name} |
| **Niche** | {TODO: e.g., Personal Finance, Health & Wellness, Tech Reviews} |
| **Market** | {TODO: e.g., India, US, Global} |
| **Default Topics Per Run** | {TODO: e.g., 10} |

---

## Character Bible

### Who They Are
{TODO: 2-3 sentences. Age, background, personality summary. What's their relationship with the audience?}

### Appearance (for HeyGen avatar reference)
{TODO: Physical description, age, look/style for avatar generation}

### Voice & Tone
{TODO: 3-5 bullet points describing how they speak. Include:
- Overall tone (warm/sharp/casual/authoritative)
- Confidence level
- Language style (formal/informal, any code-switching like Hinglish)
- Conversational pace}

### Personality Traits
{TODO: 3-5 traits that define how they engage with the audience}

### What {Name} NEVER Does
{TODO: 5+ anti-patterns — phrases, behaviors, tones to avoid}

### Positioning Line
> {TODO: One-line description of the avatar's value proposition to the audience}

### Language Patterns to Use
{TODO: 5-8 signature phrases or sentence starters}

### Language Patterns to AVOID
{TODO: 5-8 forbidden phrases or constructions}

### Script Formatting Rules
{TODO: Rules for how scripts should be written for this avatar. Include:
- Sentence length/breath rules
- Formatting (bullet points allowed or not)
- Pause/emphasis markers
- Number formatting conventions}

### Content Guardrails
{TODO: Legal/ethical boundaries. What can and can't this avatar recommend or claim?}

---

## Visual Direction Bible

{TODO: Intro line explaining this section's purpose for the Director Agent}

### Signature Gestures & Body Language
{TODO: 5-8 specific gestures mapped to content moments. Include a "Never:" list.}

### Background Templates

| Mood | Background | When to Use |
|------|-----------|-------------|
| {TODO} | {TODO: description} | {TODO: which genres} |
| `default` | {TODO: fallback background} | Fallback for any genre |

### Outfit × Genre Mapping

| Genre | Outfit | Vibe |
|-------|--------|------|
| {TODO: genre} | {TODO: outfit description} | {TODO: vibe} |

### Energy × Section Mapping (Short-Form)

| Script Section | Energy Level | Pace | Expression |
|----------------|-------------|------|------------|
| HOOK | {TODO} | {TODO} | {TODO} |
| CONTEXT | {TODO} | {TODO} | {TODO} |
| CORE | {TODO} | {TODO} | {TODO} |
| CTA | {TODO} | {TODO} | {TODO} |
| PAYOFF (IG) | {TODO} | {TODO} | {TODO} |

### Energy × Section Mapping (Long-Form)

| Section | Energy | Pace |
|---------|--------|------|
| COLD OPEN | {TODO} | {TODO} |
| INTRO | {TODO} | {TODO} |
| SEGMENT | {TODO} | {TODO} |
| PATTERN INTERRUPT | {TODO} | {TODO} |
| WRAP-UP | {TODO} | {TODO} |
| CTA | {TODO} | {TODO} |

### HeyGen-Specific Constraints
{TODO: Avatar ID, voice clone ID, framing defaults, aspect ratios, gesture limits, transition rules}

### Long-Form Framing (16:9)
{TODO: Aspect ratio, default framing, per-section framing variations, gesture limits per section type}

### Text Overlay Rules (all formats)

**Running Captions (short-form + long-form):**
{TODO: Caption style, font, colors, timing rules}

**Popup Overlays (long-form only):**

| Type | When | Example |
|------|------|---------|
| `term_card` | {TODO} | {TODO} |
| `number_card` | {TODO} | {TODO} |
| `math_breakdown` | {TODO} | {TODO} |
| `key_takeaway` | {TODO} | {TODO} |

{TODO: Style rules for overlays — font, colors, display duration, position}

---

## Niche Configuration

### Genres

| Genre | Description |
|-------|-------------|
| {TODO: genre_slug} | {TODO: one-line description of the genre style} |

### Niche Keywords (context, not search queries)
{TODO: comma-separated list of keywords relevant to this avatar's niche}

### Search Query Templates

**Search A — General Trending (Right Now)**
Search for: {TODO: what general trending topics to find in this avatar's market}
Goal: Find 10 topics that are currently getting the MOST eyeballs, regardless of niche.
Return: topic name + one-line summary of why it's trending.
Example queries: {TODO: 2-3 example search queries}

**Search B — Trending in Niche (Right Now)**
Search for: {TODO: what niche-specific trending topics to find}
Goal: Find 10 currently trending niche-specific topics.
Return: topic name + one-line summary of why it's trending.
Example queries: {TODO: 2-3 example search queries}

**Search C — Evergreen Niche (What People Always Search For)**
Search for: {TODO: what evergreen questions people always search for in this niche}
Goal: Find 10 high-search-volume evergreen topics.
Return: topic name + estimated search intent (curiosity / anxiety / aspiration).
Example queries: {TODO: 2-3 example search queries}
