#!/usr/bin/env node

import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Command } from "commander";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Configuration ──────────────────────────────────────────────────────────

const TARGET_LOCATIONS = [
  "Chittaranjan Park, New Delhi",
  "Greater Kailash 1, New Delhi",
  "Greater Kailash 2, New Delhi",
  "Kalkaji, New Delhi",
  "Nehru Place, New Delhi",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

const MAX_LISTINGS = 60;

// ─── Helpers ────────────────────────────────────────────────────────────────

let delayMultiplier = 1.0;

function randomDelay(minMs, maxMs) {
  const base = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) =>
    setTimeout(resolve, Math.round(base * delayMultiplier))
  );
}

function pickUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}

function log(msg) {
  console.log(`[${new Date().toISOString().slice(11, 19)}] ${msg}`);
}

function savePartial(allResults, opts, label) {
  try {
    const ts = timestamp();
    const outDir = join(__dirname, "output");
    mkdirSync(outDir, { recursive: true });
    const path = join(outDir, `partial_${label}_${ts}.json`);
    const json = buildOutput(allResults, opts);
    writeFileSync(path, JSON.stringify(json, null, 2));
    log(`Partial results saved: ${path}`);
  } catch (e) {
    console.error("Failed to save partial results:", e.message);
  }
}

function dedup(businesses) {
  const seen = new Map();
  const result = [];
  for (const b of businesses) {
    const key = `${(b.business_name || "").toLowerCase().trim()}||${(b.address || "").toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.set(key, true);
      result.push(b);
    }
  }
  return result;
}

function meetsIcp(b, opts) {
  if (b.rating === null || b.review_count === null) return false;
  if (b.rating < opts.minRating || b.rating > opts.maxRating) return false;
  if (b.review_count > opts.maxReviews) return false;
  if (opts.incompleteOnly) {
    const incomplete =
      b.has_hours === false ||
      (b.photo_count !== null && b.photo_count < 5) ||
      b.latest_review_has_reply === false;
    if (!incomplete) return false;
  }
  return true;
}

function buildOutput(businesses, opts) {
  const tagged = businesses.map((b) => ({
    ...b,
    meets_icp: meetsIcp(b, opts),
  }));
  return {
    meta: {
      query: opts.query,
      mode: opts.batch ? "batch" : "single",
      locations: opts.batch ? TARGET_LOCATIONS : [opts.query.split(" in ").pop() || opts.query],
      filters: {
        min_rating: opts.minRating,
        max_rating: opts.maxRating,
        max_reviews: opts.maxReviews,
        incomplete_only: opts.incompleteOnly,
      },
      total_results: tagged.length,
      icp_matches: tagged.filter((b) => b.meets_icp).length,
      scraped_at: new Date().toISOString(),
    },
    businesses: tagged,
  };
}

// ─── Scraping ───────────────────────────────────────────────────────────────

async function dismissConsent(page) {
  try {
    const acceptBtn = page.locator(
      'button:has-text("Accept all"), button:has-text("Accept"), button:has-text("I agree")'
    );
    if (await acceptBtn.first().isVisible({ timeout: 3000 })) {
      await acceptBtn.first().click();
      await randomDelay(1000, 2000);
    }
  } catch {
    // no consent dialog
  }
}

async function checkBlocked(page) {
  try {
    const content = await page.textContent("body", { timeout: 2000 });
    return (
      content.includes("unusual traffic") ||
      content.includes("automated queries") ||
      content.includes("not a robot")
    );
  } catch {
    return false;
  }
}

async function scrollResultsPanel(page) {
  // The results panel is a scrollable div inside the Maps sidebar
  const feed = page.locator('div[role="feed"]');
  if (!(await feed.isVisible({ timeout: 5000 }).catch(() => false))) {
    log("Results feed not found, trying alternative selector...");
    return;
  }

  let previousCount = 0;
  let stableRounds = 0;

  for (let i = 0; i < 40; i++) {
    const currentCount = await feed.locator('a[href*="/maps/place/"]').count();
    log(`  Scroll ${i + 1}: ${currentCount} listings loaded`);

    if (currentCount >= MAX_LISTINGS) break;

    if (currentCount === previousCount) {
      stableRounds++;
      if (stableRounds >= 3) {
        log("  No new results after 3 scrolls — end of list");
        break;
      }
    } else {
      stableRounds = 0;
    }
    previousCount = currentCount;

    // Check for "end of results" indicator
    const endOfList = page.locator('span.HlvSq, p.fontBodyMedium:has-text("end of")');
    if (await endOfList.isVisible({ timeout: 500 }).catch(() => false)) {
      log("  Reached end of results");
      break;
    }

    const scrollAmount = 300 + Math.floor(Math.random() * 200);
    await feed.evaluate((el, px) => el.scrollBy(0, px), scrollAmount);
    await randomDelay(1000, 3000);
  }
}

async function extractListingDetails(page) {
  const biz = {
    business_name: null,
    category: null,
    rating: null,
    review_count: null,
    phone: null,
    website: null,
    address: null,
    location_area: null,
    google_maps_url: null,
    has_hours: false,
    photo_count: null,
    latest_review_has_reply: false,
  };

  try {
    // Business name
    const nameEl = page.locator("h1.DUwDvf, h1.fontHeadlineLarge");
    if (await nameEl.isVisible({ timeout: 3000 }).catch(() => false)) {
      biz.business_name = (await nameEl.textContent()).trim();
    }

    // Category
    const catEl = page.locator('button.DkEaL, span.DkEaL, button[jsaction*="category"]');
    if (await catEl.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      biz.category = (await catEl.first().textContent()).trim();
    }

    // Rating
    const ratingEl = page.locator('div.F7nice span[aria-hidden="true"]');
    if (await ratingEl.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      const raw = await ratingEl.first().textContent();
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) biz.rating = parsed;
    }

    // Review count
    const reviewEl = page.locator('div.F7nice span[aria-label*="review"]');
    if (await reviewEl.first().isVisible({ timeout: 1000 }).catch(() => false)) {
      const raw = await reviewEl.first().getAttribute("aria-label");
      const match = raw?.match(/([\d,]+)/);
      if (match) biz.review_count = parseInt(match[1].replace(/,/g, ""), 10);
    }

    // Google Maps URL
    biz.google_maps_url = page.url();

    // Address, phone, website, hours — from data-item-id elements
    // Google Maps uses [data-item-id] on button/a/div elements directly (class CsEnBe)
    const dataItems = await page.evaluate(() => {
      const els = document.querySelectorAll("[data-item-id]");
      return Array.from(els).map((el) => ({
        id: el.getAttribute("data-item-id") || "",
        text: el.textContent?.trim().slice(0, 300) || "",
        href: el.getAttribute("href") || "",
      }));
    });

    for (const item of dataItems) {
      if (item.id === "address" || item.id === "laddress") {
        biz.address = item.text;
      } else if (item.id.startsWith("phone:")) {
        biz.phone = item.text;
      } else if (item.id === "authority") {
        biz.website = item.href || item.text;
      } else if (item.id === "oh") {
        biz.has_hours = true;
      }
    }

    // Fallback: check for hours via aria-label or Open/Closed text
    if (!biz.has_hours) {
      const hoursEl = page.locator(
        '[data-item-id^="oh"], [aria-label*="hour"], span:has-text("Open"), span:has-text("Closed")'
      );
      if (await hoursEl.first().isVisible({ timeout: 1000 }).catch(() => false)) {
        biz.has_hours = true;
      }
    }

    // Photo count — extract while still on Overview tab (before switching to Reviews)
    // Google Maps only shows 1 thumbnail in the side panel, so we can't get exact count
    // without navigating to the photos page. We use a heuristic:
    //   - "See photos" button exists → has multiple photos (null = unknown count)
    //   - No "See photos" but carousel has images → 1 photo
    //   - No carousel images at all → 0 photos
    try {
      const photoCount = await page.evaluate(() => {
        const hasSeePhotos = Array.from(document.querySelectorAll("button")).some(
          (b) => b.textContent?.includes("See photos")
        );
        if (hasSeePhotos) return null; // has photos, exact count unknown from this view
        const photoButtons = document.querySelectorAll("button.aoRNLd");
        if (photoButtons.length > 0) return photoButtons.length;
        return 0;
      });
      biz.photo_count = photoCount;
    } catch {
      // leave as null
    }

    // Latest review has owner reply — check the reviews tab
    try {
      const reviewsTab = page.locator(
        'button[aria-label*="Reviews"], button[data-tab-index="1"]'
      );
      if (await reviewsTab.isVisible({ timeout: 1000 }).catch(() => false)) {
        await reviewsTab.click();
        await randomDelay(1500, 2500);

        // Look for owner responses in the visible reviews
        const ownerReplies = page.locator(
          'div.CDe7pd:has-text("Response from"), span:has-text("Response from the owner")'
        );
        const replyCount = await ownerReplies.count().catch(() => 0);
        biz.latest_review_has_reply = replyCount > 0;
      }
    } catch {
      // can't check reviews — leave as false
    }
  } catch (e) {
    log(`  Warning: error extracting details — ${e.message}`);
  }

  return biz;
}

async function scrapeLocation(page, searchQuery, locationArea) {
  const businesses = [];

  // Navigate directly to Maps search URL — avoids consent page issues
  const encodedQuery = encodeURIComponent(searchQuery);
  const url = `https://www.google.com/maps/search/${encodedQuery}/`;
  log(`Navigating to Google Maps search: ${searchQuery}`);
  await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 30000,
  });
  await randomDelay(3000, 5000);
  await dismissConsent(page);

  // After consent dismiss, the page may reload — wait again
  await randomDelay(2000, 4000);

  if (await checkBlocked(page)) {
    log("CAPTCHA detected on initial load — waiting 60s...");
    await new Promise((r) => setTimeout(r, 60000));
    await page.reload({ waitUntil: "domcontentloaded" });
    if (await checkBlocked(page)) {
      log("Still blocked after retry. Returning partial results.");
      return businesses;
    }
  }

  // Wait for results to load
  await randomDelay(3000, 7000);

  if (await checkBlocked(page)) {
    log("CAPTCHA detected after search — waiting 60s...");
    await new Promise((r) => setTimeout(r, 60000));
    await page.keyboard.press("Enter");
    await randomDelay(3000, 5000);
    if (await checkBlocked(page)) {
      log("Still blocked. Returning partial results.");
      return businesses;
    }
  }

  // Scroll to load all results
  log("Scrolling results panel...");
  await scrollResultsPanel(page);

  // Collect listing links
  const feed = page.locator('div[role="feed"]');
  const links = feed.locator('a[href*="/maps/place/"]');
  const linkCount = await links.count();
  log(`Found ${linkCount} listing links`);

  for (let i = 0; i < linkCount; i++) {
    try {
      // Every 10 listings, take a longer pause
      if (i > 0 && i % 10 === 0) {
        const pause = 10000 + Math.floor(Math.random() * 10000);
        log(`  Pausing ${Math.round(pause / 1000)}s after 10 listings...`);
        await new Promise((r) => setTimeout(r, Math.round(pause * delayMultiplier)));
      }

      const linkEl = links.nth(i);
      const ariaLabel = (await linkEl.getAttribute("aria-label")) || `Listing ${i + 1}`;
      log(
        `  Processing ${i + 1}/${linkCount}: ${ariaLabel.slice(0, 50)}...`
      );

      await linkEl.click();
      await randomDelay(2000, 4000);

      const biz = await extractListingDetails(page);
      biz.location_area = locationArea;
      businesses.push(biz);

      // Go back to results list
      const backBtn = page.locator('button[aria-label="Back"], button.hYBRP');
      if (await backBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await backBtn.click();
        await randomDelay(1500, 3000);
      } else {
        await page.goBack();
        await randomDelay(2000, 3500);
      }
    } catch (e) {
      log(`  Error on listing ${i + 1}: ${e.message}`);
      // Try to recover — go back
      try {
        await page.goBack();
        await randomDelay(2000, 3000);
      } catch {
        // nothing we can do
      }
    }
  }

  return businesses;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const program = new Command();

  program
    .name("gmaps-scraper")
    .description("Scrape Google Maps listings and filter by ICP")
    .argument("[query]", "Search query (e.g., 'salons in Kalkaji New Delhi')")
    .option("--batch <vertical>", "Run across all target locations (e.g., --batch salons)")
    .option("--min-rating <n>", "Minimum star rating", parseFloat, 3.0)
    .option("--max-rating <n>", "Maximum star rating", parseFloat, 4.2)
    .option("--max-reviews <n>", "Maximum review count", parseInt, 100)
    .option("--incomplete-only", "Only include businesses with incomplete profiles", false)
    .option("--delay-multiplier <n>", "Multiply all delays by this factor", parseFloat, 1.0)
    .parse(process.argv);

  const opts = program.opts();
  const query = program.args[0];

  if (!query && !opts.batch) {
    console.error(
      'Error: provide a search query or use --batch "vertical"\n' +
        'Examples:\n  node scraper.js "salons in Kalkaji New Delhi"\n  node scraper.js --batch "salons"'
    );
    process.exit(1);
  }

  delayMultiplier = opts.delayMultiplier;

  const runOpts = {
    query: opts.batch || query,
    batch: !!opts.batch,
    minRating: opts.minRating,
    maxRating: opts.maxRating,
    maxReviews: opts.maxReviews,
    incompleteOnly: opts.incompleteOnly,
  };

  log(`Starting scraper — mode: ${runOpts.batch ? "batch" : "single"}`);
  log(
    `Filters: rating ${runOpts.minRating}-${runOpts.maxRating}, max reviews ${runOpts.maxReviews}, incomplete only: ${runOpts.incompleteOnly}`
  );
  if (delayMultiplier !== 1.0) log(`Delay multiplier: ${delayMultiplier}x`);

  // Build search queries
  const searches = runOpts.batch
    ? TARGET_LOCATIONS.map((loc) => ({
        query: `${opts.batch} in ${loc}`,
        area: loc,
      }))
    : [{ query, area: query.split(" in ").pop()?.trim() || "Unknown" }];

  // Launch browser with stealth
  chromium.use(StealthPlugin());

  const browser = await chromium.launch({
    headless: true,
    args: ["--disable-blink-features=AutomationControlled"],
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 },
    userAgent: pickUserAgent(),
    locale: "en-IN",
    geolocation: { latitude: 28.5494, longitude: 77.2501 },
    permissions: ["geolocation"],
  });

  const page = await context.newPage();
  let allResults = [];

  try {
    for (let si = 0; si < searches.length; si++) {
      const { query: sq, area } = searches[si];

      if (runOpts.batch) {
        log(`\nLocation ${si + 1}/${searches.length}: ${area}`);
      }

      const results = await scrapeLocation(page, sq, area);
      allResults.push(...results);

      log(`  Collected ${results.length} listings from ${area}`);

      // Between locations in batch mode, wait 30-60s
      if (runOpts.batch && si < searches.length - 1) {
        const wait = 30000 + Math.floor(Math.random() * 30000);
        log(`  Waiting ${Math.round(wait / 1000)}s before next location...`);
        await new Promise((r) => setTimeout(r, Math.round(wait * delayMultiplier)));
      }
    }
  } catch (e) {
    console.error(`Fatal error: ${e.message}`);
    savePartial(allResults, runOpts, "crash");
  } finally {
    await browser.close();
  }

  // Dedup
  const beforeDedup = allResults.length;
  allResults = dedup(allResults);
  if (beforeDedup !== allResults.length) {
    log(`Deduped: ${beforeDedup} → ${allResults.length} unique businesses`);
  }

  // Build output
  const allOutput = buildOutput(allResults, runOpts);
  const icpOutput = {
    ...allOutput,
    businesses: allOutput.businesses.filter((b) => b.meets_icp),
    meta: {
      ...allOutput.meta,
      total_results: allOutput.businesses.filter((b) => b.meets_icp).length,
    },
  };

  // Write files
  const ts = timestamp();
  const outDir = join(__dirname, "output");
  mkdirSync(outDir, { recursive: true });

  const allPath = join(outDir, `all_results_${ts}.json`);
  const icpPath = join(outDir, `icp_filtered_${ts}.json`);

  writeFileSync(allPath, JSON.stringify(allOutput, null, 2));
  writeFileSync(icpPath, JSON.stringify(icpOutput, null, 2));

  log(`\nDone!`);
  log(`Total results: ${allOutput.meta.total_results}`);
  log(`ICP matches:   ${allOutput.meta.icp_matches}`);
  log(`All results:   ${allPath}`);
  log(`ICP filtered:  ${icpPath}`);
}

main().catch((e) => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
