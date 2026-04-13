# gmaps-scraper

Google Maps ICP scraper. Scrapes business listings from Google Maps and filters by Ideal Customer Profile criteria. Supports single-query and batch mode across multiple target locations.

## Setup

```bash
cd workflows/gmaps-scraper
npm install
npx playwright install chromium
```

## Usage

### Single location

```bash
node scraper.js "gyms in Kalkaji New Delhi"
node scraper.js "salons in Chittaranjan Park New Delhi" --min-rating 3.0 --max-rating 4.2
```

### Batch mode (all 5 target locations)

```bash
node scraper.js --batch "salons"
node scraper.js --batch "restaurants" --incomplete-only --delay-multiplier 1.5
```

This runs the query across all target locations and combines results into one JSON file.

### Multiple verticals

```bash
node scraper.js --batch "salons" && \
node scraper.js --batch "gyms" && \
node scraper.js --batch "dental clinics" && \
node scraper.js --batch "restaurants"
```

## CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--batch <vertical>` | — | Run across all target locations |
| `--min-rating <n>` | 3.0 | Minimum star rating for ICP |
| `--max-rating <n>` | 4.2 | Maximum star rating for ICP |
| `--max-reviews <n>` | 100 | Maximum review count for ICP |
| `--incomplete-only` | false | Only include businesses missing hours, <5 photos, or unanswered reviews |
| `--delay-multiplier <n>` | 1.0 | Multiply all delays (e.g., 2.0 = twice as slow) |

## Output

Two JSON files per run in `output/`:

- `all_results_[timestamp].json` — every scraped business
- `icp_filtered_[timestamp].json` — only businesses matching ICP filters

Each business object includes: `business_name`, `category`, `rating`, `review_count`, `phone`, `website`, `address`, `location_area`, `google_maps_url`, `has_hours`, `photo_count`, `latest_review_has_reply`, `meets_icp`.

## Target Locations

Edit the `TARGET_LOCATIONS` array in `scraper.js` to add or remove locations:

```js
const TARGET_LOCATIONS = [
  "Chittaranjan Park, New Delhi",
  "Greater Kailash 1, New Delhi",
  "Greater Kailash 2, New Delhi",
  "Kalkaji, New Delhi",
  "Nehru Place, New Delhi",
];
```

Add a new location by appending to the array. Remove one by deleting the line. The batch mode uses this array directly.

## Anti-Detection

The scraper uses `playwright-extra` with the stealth plugin, realistic user agents, random delays between every action, slow scrolling, periodic pauses every 10 listings, and 30-60s waits between locations. If Google shows a CAPTCHA, it pauses 60s and retries once. On persistent blocks, it saves partial results and exits.

Use `--delay-multiplier 2.0` or higher if you're getting blocked frequently.

## Error Handling

- Missing fields on a listing are set to `null`
- On crashes, partial results are saved to `output/partial_*.json`
- Progress is logged to console throughout
