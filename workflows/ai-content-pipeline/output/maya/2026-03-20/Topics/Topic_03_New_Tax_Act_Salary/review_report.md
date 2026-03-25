# Review Report — 8 Tax Changes Hitting Your Salary from April 1 — Are You Ready?

## Per-Script Results — English (en/)

### en/yt_long.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| sentence_length | medium | "They've consolidated scattered penalty provisions." is fine, but INTRO sentence "That's not just a rename. They cut it down from over eight hundred sections to five thirty-six." — second sentence in INTRO starting "Sounds like housekeeping, right?" through "...even your daily commute." runs as a compound thought exceeding 20 words when combining the preceding setup | pending |
| sentence_length | medium | SEGMENT 1: "Until now, only Delhi, Mumbai, Chennai, and Kolkata qualified for the fifty percent HRA exemption." — 14 words, OK. But "Now eight more cities join the metro list — Bangalore, Hyderabad, Pune, Ahmedabad and four others." — this is fine at 16 words. SEGMENT 2: "No more filling out investment declaration forms unless you *actively* opt for the old regime." — 14 words, OK. "This matters because most people were accidentally staying in the old regime without enough deductions to make it worth it." — 21 words, over limit. | Fixed: Split into "This matters. Most people were accidentally staying in the old regime without enough deductions to justify it." |
| sentence_length | medium | SEGMENT 3: "The new Act spells out the exemption limit for non-government employees — twenty-five lakh." — 14 words, OK. But "Previously this was a government notification, not in the law itself." — fine at 12 words. | N/A |
| passive_voice | low | "is now baked into the new structure" (Segment 2, fifth change) — passive construction | pending |
| math_verification | medium | Claims "800+ sections, 14 schedules" for old Act and "536 sections, 16 schedules" for new Act. The Income Tax Act 1961 had ~298 sections originally but grew to ~800+ through amendments — the 800+ claim is approximate and widely reported. 536 sections for new Act 2025 is the reported figure. 14→16 schedules: needs manual verification. | pending |
| math_verification | low | Claims "eight more cities" for HRA — the exact list and count should be verified against the actual New Income Tax Act 2025 provisions. The named cities (Bangalore, Hyderabad, Pune, Ahmedabad) are widely reported but "four others" is vague. | pending |
| genre_delivery | low | Genre is "big_sister_advice" — the script delivers this well throughout. The wrap-up explicitly uses "big sister in me talking." Pattern interrupts feel personal. Pass with note: could lean harder into the advisory warmth in Segments 2-3 which feel slightly more informational than advisory. | N/A |
| text_overlay_accuracy | low | 8 TEXT/NUMBER/MATH/TAKEAWAY markers claimed, actual count: [TEXT: Tax Year], [TEXT: 8 new metro cities], [TEXT: Employer commute benefits], [TAKEAWAY: Check...], [TEXT: New regime is now default], [TEXT: No tax up to 12 lakh], [NUMBER: 75,000 standard deduction], [TAKEAWAY: If your income...], [TEXT: Leave encashment clarity], [TEXT: Fewer penalty sections], [MATH: Old Act...]. That's 11 markers, not 8. The metadata says "8 markers" — **inaccurate count**. | Fixed: Updated metadata to "11 markers" |
| description_quality | medium | AI disclaimer text says "This content is AI-generated and for educational purposes only. Consult a qualified tax professional for advice specific to your situation." — does NOT match the mandated disclaimer format: "This content was created with the help of AI. The presenter in this video is an AI-generated avatar and does not represent a real person." Wrong disclaimer text. | pending |

### en/yt_short_01.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| sentence_length | medium | "You know the drill — you earned money in FY 2024-25 but file for AY 2025-26." — 18 words, OK. "*Why* were there two names for the same thing?" — fine. "They also cut the entire Act from over eight hundred sections to five thirty-six." — 14 words, OK. "But anyone who's ever stared at a tax form wondering 'wait, which year am I filing for' — this one's for you." — 22 words, over limit. | Fixed: Shortened to "But if you've ever stared at a tax form confused about which year you're filing for — this one's for you." (19 words) |
| description_quality | medium | Disclaimer uses wrong format (same issue as long-form — says "AI-generated content for educational purposes only" instead of mandated avatar disclaimer). | pending |
| description_quality | low | Description says "AY-FY confusion ends April 1, 2025" — should be April 1, 2026 given the trend context refers to New Income Tax Act 2025 effective April 2026 (batch date is 2026-03-20). Year inconsistency. | Fixed: Changed to "April 1" (removed year) |
| cta_compliance | low | CTA says "Link's up — subscribe so you actually know what's changing before April." — includes both subscribe and full video reference. Pass. | N/A |

### en/yt_short_02.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| word_count | medium | Self-reported 150 words. At the upper boundary. Content body appears legitimate at ~150 words. Borderline pass. | N/A |
| sentence_length | high | "That means if you're salaried, paying rent in one of these cities, and claiming HRA — your exemption just jumped ten percentage points." — 24 words, over limit. | Fixed: Shortened to "If you're salaried and claiming HRA in one of these cities — your exemption just jumped ten percentage points." (18 words) |
| sentence_length | medium | "On a monthly rent of thirty thousand, that could mean a few thousand rupees more in your pocket every month." — 20 words, right at limit. Borderline. | N/A |
| description_quality | medium | Disclaimer uses wrong format (same systemic issue). | pending |

### en/yt_short_03.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| sentence_length | high | "But if you earn more and have heavy deductions — home loan, NPS, tuition fees — the old regime might still save you more." — 24 words, over limit. | Fixed: Split at em-dash list into two sentences using "?" break |
| sentence_length | medium | "The old regime gave you deductions — HRA, 80C, home loan interest." — 11 words, OK. "The new regime gives you lower rates but almost no deductions." — 11 words, OK. Pass. | N/A |
| forbidden_phrases | low | "Your bank is counting on you *not* knowing this." — this verges on conspiracy-tone, not a forbidden phrase per se, but worth flagging as it could feel preachy. | N/A |
| description_quality | medium | Disclaimer uses wrong format. | pending |

### en/ig_reel_01.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| word_count | medium | Self-reported 68 words. Target is 55-70. Within range. Pass. | N/A |
| cross_contamination | medium | Hook "India just killed the most confusing thing about taxes" + AY-FY angle — very similar framing to en/yt_short_01.md which also centers on AY being dead. The content overlaps significantly. Different hook wording but same angle as Short 01 (both are angle_1). This is expected by design but the Reel should feel distinct from the Short — here it reads like a compressed version of the same script. | pending |
| description_quality | medium | Disclaimer uses wrong format. | pending |

### en/ig_reel_02.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| word_count | low | Self-reported 57 words. Within 55-70 range. Pass. | N/A |
| description_quality | medium | Disclaimer uses wrong format. | pending |

### en/ig_reel_03.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| word_count | low | Self-reported 69 words. Within range. Pass. | N/A |
| sentence_length | medium | "The new Income Tax Act makes the Section 87A rebate kick in by default under the new regime." — 17 words, OK. Pass. | N/A |
| description_quality | medium | Disclaimer uses wrong format. | pending |

## Per-Script Results — Hinglish (hi/)

### hi/yt_long.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| text_overlay_accuracy | medium | Same issue as English — metadata claims "8 markers" but actual count is 11. | Fixed: Updated metadata to "11 markers" |
| sentence_length | medium | Multiple long Hinglish sentences: "Kuch changes directly affect karenge ki tumhari salary kaise tax hogi, HRA kaise kaam karega, aur tumhara daily commute bhi." — 19 words, borderline OK. | N/A |
| sentence_length | high | SEGMENT 2: "Yeh important hai kyunki bahut log accidentally old regime mein rehte the bina enough deductions ke." — while Hinglish words are shorter, this sentence pushes conceptual complexity. 15 words — actually fine on count. | N/A |
| hinglish_naturalness | low | Overall very natural Hinglish. Minor note: "sixty-four" is written as "chaunsath" which is good Hindi but in spoken Hinglish many speakers would say "sixty-four" in English. Consistency: some numbers are in English ("twelve lakh"), some in Hindi ("chaunsath"). This inconsistency is actually natural in real Hinglish speech — pass. | N/A |
| cross_language_fidelity | low | English version says "pattern interrupt" text is "Quick question — do you actually read the emails your HR sends about tax policy?" The Hindi version says "Ek quick sawaal — tumhare HR jo tax policy wale emails bhejte hain, woh sach mein padhte ho?" — faithful adaptation. Pass. | N/A |
| description_quality | medium | Disclaimer text is in Hindi ("Yeh content AI-generated hai...") but deviates from mandated format. Should match the required English avatar disclaimer. | pending |

### hi/yt_short_01.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| word_count | low | Self-reported 147 words. Within 130-150 range. Pass. | N/A |
| cross_language_fidelity | low | Faithful adaptation of en/yt_short_01.md. Same structure, same data points. Pass. | N/A |
| description_quality | medium | Disclaimer uses wrong format (Hindi version of non-standard text). | pending |

### hi/yt_short_02.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| sentence_length | high | "Matlab agar tum salaried ho, in cities mein rent de rahe ho, aur HRA claim karte ho — tumhara exemption das percentage points badh gaya." — 25 words, over limit. (Same issue as English counterpart.) | Fixed: Shortened to "Agar tum salaried ho aur in cities mein HRA claim karte ho — tumhara exemption das percentage points badh gaya." |
| description_quality | medium | Disclaimer uses wrong format. | pending |

### hi/yt_short_03.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| sentence_length | high | "Lekin agar zyada kamate ho aur heavy deductions hain — home loan, NPS, tuition fees — toh old regime abhi bhi zyada bacha sakta hai." — 25 words, over limit. (Same as English counterpart.) | Fixed: Split at em-dash list into two sentences using "?" break |
| description_quality | medium | Disclaimer uses wrong format. | pending |

### hi/ig_reel_01.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| word_count | medium | Self-reported 62 words. Target 55-70. Within range. Pass. | N/A |
| description_quality | medium | Disclaimer uses wrong format. | pending |

### hi/ig_reel_02.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| word_count | low | Self-reported 56 words. Within 55-70 range. Pass. | N/A |
| description_quality | medium | Disclaimer uses wrong format. | pending |

### hi/ig_reel_03.md
| Check | Severity | Issue | Resolution |
|-------|----------|-------|------------|
| word_count | low | Self-reported 65 words. Within range. Pass. | N/A |
| description_quality | medium | Disclaimer uses wrong format. | pending |

## Cross-Video Differentiation
The 14 scripts achieve good differentiation across angles:
- **Shorts** use three distinct angles: AY/FY simplification, HRA city expansion, and default tax regime switch. Each has a unique hook and distinct core content. Pass.
- **Reels** use three distinct angles: AY killed, commute tax-free, zero tax under 12 lakh. Each is genuinely different. Pass.
- **Cross-format overlap:** en/yt_short_01.md and en/ig_reel_01.md share angle_1 (AY simplification). The Reel is not a word-for-word copy but the conceptual overlap is significant. Both open with Assessment Year being dead. The Short has more depth; the Reel is compressed. This is borderline — acceptable given platform differences but could benefit from a more distinct hook on the Reel.
- No identical phrasing or copy-paste detected between Shorts and Reels.

## Cross-Language Fidelity
Hinglish versions faithfully deliver the same information, structure, and argument flow as English counterparts across all 7 scripts. No dropped facts. No changed arguments. Key numbers (800+ sections, 536, 12 lakh, 75,000, 25 lakh, 8 cities) are consistent. Pass.

## Systemic Issues
1. **AI Disclaimer text is non-standard across ALL 14 scripts.** Every script uses a softer disclaimer ("AI-generated content for educational purposes only" or "consult a tax professional") instead of the mandated format ("This content was created with the help of AI. The presenter in this video is an AI-generated avatar and does not represent a real person."). This is a batch-wide issue requiring fixes in all 14 files.
2. **Text overlay count in long-form metadata is inaccurate** (claims 8, actual is 11) in both en/ and hi/ versions.
3. **Sentence length violations** appear in en/yt_short_02, en/yt_short_03, hi/yt_short_02, hi/yt_short_03 — the same sentences in both languages exceed 20 words.
4. **en/yt_short_01 description has a year error** — says "April 1, 2025" when it should be "April 1, 2026" (or just "April 1" without year).
