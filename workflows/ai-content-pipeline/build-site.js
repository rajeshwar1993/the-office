#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

// ============================================================
// CONSTANTS
// ============================================================

const BASE_DIR = __dirname;
const OUTPUT_DIR = path.join(BASE_DIR, "output");
const ARCHIVE_DIR = path.join(BASE_DIR, "archive");
const SITE_DIR = path.join(BASE_DIR, "site");

const GENRE_COLORS = {
  myth_busting: { bg: "#ff6b6b22", text: "#ff6b6b", border: "#ff6b6b55" },
  storytelling: { bg: "#ffd93d22", text: "#ffd93d", border: "#ffd93d55" },
  comedy_satire: { bg: "#6bcb7722", text: "#6bcb77", border: "#6bcb7755" },
  shock_and_awe: { bg: "#4ecdc422", text: "#4ecdc4", border: "#4ecdc455" },
  big_sister_advice: { bg: "#ff8a5c22", text: "#ff8a5c", border: "#ff8a5c55" },
  hot_take: { bg: "#a855f722", text: "#a855f7", border: "#a855f755" },
};

const SECTION_COLORS = {
  HOOK: "#ff6b6b",
  CONTEXT: "#64b5f6",
  CORE: "#6c63ff",
  CTA: "#6bcb77",
  PAYOFF: "#4ecdc4",
  "COLD OPEN": "#ff4444",
  INTRO: "#64b5f6",
  "SEGMENT 1": "#6c63ff",
  "SEGMENT 2": "#9c7cff",
  "SEGMENT 3": "#b39dff",
  "PATTERN INTERRUPT": "#ffd93d",
  "WRAP-UP": "#90a4ae",
};

// ============================================================
// FILESYSTEM HELPERS
// ============================================================

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function deriveTopicStatus(statusJson) {
  if (!statusJson) return "Draft";
  // Backward compat: old format had { "status": "Draft" }
  if (typeof statusJson.status === "string") return statusJson.status;
  const statuses = Object.values(statusJson).map((v) =>
    typeof v === "string" ? v : v.status
  );
  if (statuses.length === 0) return "Draft";
  if (statuses.every((s) => s === "Published")) return "Published";
  if (statuses.every((s) => s === "Rejected")) return "Rejected";
  if (statuses.some((s) => s === "Video_Generating")) return "Video_Generating";
  if (statuses.some((s) => s === "Video_Generated")) return "Video_Generated";
  if (statuses.some((s) => s === "Approved")) return "Approved";
  return "Draft";
}

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function cleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

function discoverBatches() {
  const batches = new Map();
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  for (const [dir, source] of [
    [ARCHIVE_DIR, "archive"],
    [OUTPUT_DIR, "output"],
  ]) {
    if (!fs.existsSync(dir)) continue;
    for (const entry of fs.readdirSync(dir)) {
      if (dateRegex.test(entry)) {
        const fullPath = path.join(dir, entry);
        if (fs.statSync(fullPath).isDirectory()) {
          batches.set(entry, { date: entry, dir: fullPath, source });
        }
      }
    }
  }

  return [...batches.values()].sort((a, b) => b.date.localeCompare(a.date));
}

// ============================================================
// DATA LOADERS
// ============================================================

function detectStructure(batchDir) {
  return fs.existsSync(path.join(batchDir, "Topics")) ? "new" : "legacy";
}

function loadBatch(batchDir, date) {
  const topics = readJsonSafe(path.join(batchDir, "topics.json"));
  if (!topics || !topics.topics || topics.topics.length === 0) return null;

  const research = readJsonSafe(path.join(batchDir, "research.json"));
  const reviewReport = readJsonSafe(path.join(batchDir, "review_report.json"));
  const reviewSummary = readFileSafe(
    path.join(batchDir, "review_summary.md")
  );

  const structure = detectStructure(batchDir);
  const loadedTopics = topics.topics.map((t) =>
    loadTopic(batchDir, t, structure)
  );

  return {
    date,
    dir: batchDir,
    topicsMeta: topics,
    topics: loadedTopics,
    research,
    reviewReport,
    reviewSummary,
    structure,
  };
}

function loadTopic(batchDir, topicMeta, structure) {
  const nn = String(topicMeta.id).padStart(2, "0");
  let scriptRaw, status, reviewReportMd, researchMd;
  let ytShortsProduction, instaReelProduction, ytLongProduction;
  let legacyProduction;

  if (structure === "new" && topicMeta.folder_name) {
    const topicDir = path.join(batchDir, "Topics", topicMeta.folder_name);
    scriptRaw = readFileSafe(path.join(topicDir, "script.md"));
    status = readJsonSafe(path.join(topicDir, "status.json"));
    reviewReportMd = readFileSafe(path.join(topicDir, "review_report.md"));
    researchMd = readFileSafe(path.join(topicDir, "research.md"));
    ytShortsProduction = readFileSafe(
      path.join(topicDir, "YTShorts_Production.md")
    );
    instaReelProduction = readFileSafe(
      path.join(topicDir, "InstaReel_Production.md")
    );
    ytLongProduction = readFileSafe(
      path.join(topicDir, "YTLong_Production.md")
    );
  } else {
    scriptRaw = readFileSafe(
      path.join(batchDir, "scripts", `topic_${nn}.md`)
    );
    legacyProduction = readFileSafe(
      path.join(batchDir, "productions", `topic_${nn}_production.md`)
    );
  }

  // Fallback: try legacy paths if new structure files are missing
  if (!scriptRaw) {
    scriptRaw = readFileSafe(
      path.join(batchDir, "scripts", `topic_${nn}.md`)
    );
  }
  if (!ytShortsProduction && !instaReelProduction) {
    legacyProduction = readFileSafe(
      path.join(batchDir, "productions", `topic_${nn}_production.md`)
    );
  }

  const scriptParsed = scriptRaw ? parseScript(scriptRaw) : null;

  // Try to find review verdict from batch review_report.json
  let reviewVerdict = null;
  const batchReview = readJsonSafe(
    path.join(batchDir, "review_report.json")
  );
  if (batchReview && batchReview.scripts) {
    const match = batchReview.scripts.find(
      (s) =>
        s.folder === `Topics/${topicMeta.folder_name}` ||
        s.file === `scripts/topic_${nn}.md`
    );
    if (match) reviewVerdict = match;
  }

  return {
    ...topicMeta,
    nn,
    scriptRaw,
    scriptParsed,
    status: deriveTopicStatus(status),
    reviewReportMd,
    researchMd,
    reviewVerdict,
    ytShortsProduction,
    instaReelProduction,
    ytLongProduction,
    legacyProduction,
  };
}

// ============================================================
// SCRIPT PARSER
// ============================================================

function parseScript(raw) {
  const meta = {};
  const sections = { youtube: [], instagram: [], longform: [] };
  let wordCount = "";

  // Extract metadata from the header
  const metaMatch = raw.match(
    /^---\s*\n([\s\S]*?)\n\s*---\s*(YOUTUBE|$)/m
  );
  if (metaMatch) {
    const metaBlock = metaMatch[1];
    for (const line of metaBlock.split("\n")) {
      const m = line.match(/^([A-Z\s]+):\s*(.+)$/);
      if (m) meta[m[1].trim()] = m[2].trim();
    }
  }

  // Extract word count
  const wcMatch = raw.match(/^WORD COUNT\s*[-—]\s*(.+)$/m);
  if (wcMatch) wordCount = wcMatch[1];

  // Split into format blocks
  const youtubeMatch = raw.match(
    /---\s*YOUTUBE VERSION.*?---\s*\n([\s\S]*?)(?=---\s*INSTAGRAM|---\s*YOUTUBE LONG|---\s*\nWORD COUNT|$)/
  );
  const instaMatch = raw.match(
    /---\s*INSTAGRAM VERSION.*?---\s*\n([\s\S]*?)(?=---\s*YOUTUBE LONG|---\s*\nWORD COUNT|---\s*$|$)/
  );
  const longMatch = raw.match(
    /---\s*YOUTUBE LONG-FORM VERSION.*?---\s*\n([\s\S]*?)(?=---\s*\nWORD COUNT|---\s*\nTEXT OVERLAYS|$)/
  );

  if (youtubeMatch) sections.youtube = parseScriptSections(youtubeMatch[1]);
  if (instaMatch) sections.instagram = parseScriptSections(instaMatch[1]);
  if (longMatch) sections.longform = parseScriptSections(longMatch[1]);

  // Extract long-form word count
  let longWordCount = "";
  const lwcMatch = raw.match(
    /WORD COUNT\s*[-—]\s*Long-form:\s*(.+?)(?:\n|$)/
  );
  if (lwcMatch) longWordCount = lwcMatch[1];

  return { meta, sections, wordCount, longWordCount };
}

function parseScriptSections(block) {
  const sections = [];
  const sectionRegex =
    /^(HOOK|CONTEXT|CORE|CTA|PAYOFF|COLD OPEN|INTRO|SEGMENT \d|PATTERN INTERRUPT|WRAP-UP):\s*$/gm;
  const matches = [...block.matchAll(sectionRegex)];

  for (let i = 0; i < matches.length; i++) {
    const name = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : block.length;
    const text = block.slice(start, end).trim();
    sections.push({ name, text });
  }

  return sections;
}

// ============================================================
// CONTENT RENDERERS
// ============================================================

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function renderScriptText(text) {
  let html = escapeHtml(text);

  // Overlay markers
  html = html.replace(
    /\[TEXT:\s*"([^"]+)"\]/g,
    '<span class="overlay overlay-text" title="Term Definition">$1</span>'
  );
  html = html.replace(
    /\[NUMBER:\s*"([^"]+)"\]/g,
    '<span class="overlay overlay-number" title="Key Number">$1</span>'
  );
  html = html.replace(
    /\[MATH:\s*"([^"]+)"\]/g,
    '<span class="overlay overlay-math" title="Calculation">$1</span>'
  );
  html = html.replace(
    /\[TAKEAWAY:\s*"([^"]+)"\]/g,
    '<span class="overlay overlay-takeaway" title="Key Takeaway">$1</span>'
  );

  // Beat and pause markers
  html = html.replace(
    /\[beat\]/g,
    '<span class="marker marker-beat">beat</span>'
  );
  html = html.replace(
    /\[pause\]/g,
    '<span class="marker marker-pause">pause</span>'
  );

  // Emphasis: *word* -> bold italic
  html = html.replace(
    /\*([^*]+)\*/g,
    '<strong class="emphasis">$1</strong>'
  );

  // Newlines
  html = html.replace(/\n/g, "<br>");

  return html;
}

function renderMarkdownContent(md) {
  if (!md) return "";
  return marked.parse(md);
}

// ============================================================
// BADGE HELPERS
// ============================================================

function genreBadge(genre) {
  const c = GENRE_COLORS[genre] || {
    bg: "#66666622",
    text: "#999",
    border: "#66666655",
  };
  return `<span class="badge" style="background:${c.bg};color:${c.text};border:1px solid ${c.border}">${genre.replace(/_/g, " ")}</span>`;
}

function sourceBadge(source) {
  const isT = source === "finance_trending";
  const bg = isT ? "#2196f322" : "#4caf5022";
  const color = isT ? "#64b5f6" : "#81c784";
  const border = isT ? "#2196f355" : "#4caf5055";
  const label = isT ? "trending" : "evergreen";
  return `<span class="badge" style="background:${bg};color:${color};border:1px solid ${border}">${label}</span>`;
}

function statusBadge(status) {
  const STATUS_COLORS = {
    Approved: { bg: "#4caf5022", color: "#81c784", border: "#4caf5055" },
    Published: { bg: "#2196f322", color: "#64b5f6", border: "#2196f355" },
    Video_Generated: { bg: "#9c27b022", color: "#ce93d8", border: "#9c27b055" },
    Video_Generating: { bg: "#00bcd422", color: "#4dd0e1", border: "#00bcd455" },
    Rejected: { bg: "#f4433622", color: "#ef5350", border: "#f4433655" },
    Draft: { bg: "#ff980022", color: "#ffb74d", border: "#ff980055" },
  };
  const c = STATUS_COLORS[status] || STATUS_COLORS.Draft;
  return `<span class="badge" style="background:${c.bg};color:${c.color};border:1px solid ${c.border}">${status}</span>`;
}

function formatBadge(format) {
  const isLong = format === "long";
  const bg = isLong ? "#9c27b022" : "#60606022";
  const color = isLong ? "#ce93d8" : "#aaa";
  const border = isLong ? "#9c27b055" : "#60606055";
  const label = isLong ? "Long-form" : "Short-form";
  return `<span class="badge" style="background:${bg};color:${color};border:1px solid ${border}">${label}</span>`;
}

function verdictBadge(verdict) {
  if (!verdict) return "";
  const pass = verdict === "pass";
  const bg = pass ? "#4caf5022" : "#f4433622";
  const color = pass ? "#81c784" : "#ef5350";
  const border = pass ? "#4caf5055" : "#f4433655";
  return `<span class="badge" style="background:${bg};color:${color};border:1px solid ${border}">${pass ? "Passed" : "Failed"}</span>`;
}

function hookFitBadge(hookFit) {
  if (!hookFit || hookFit === "none") return "";
  const isHigh = hookFit === "high";
  const color = isHigh ? "#81c784" : "#ffb74d";
  return `<span style="color:${color};font-size:0.85em">Hook: ${hookFit}</span>`;
}

// ============================================================
// HTML TEMPLATES
// ============================================================

function htmlShell(title, breadcrumbs, bodyContent, cssPath) {
  const breadcrumbHtml = breadcrumbs
    .map((b, i) => {
      if (i === breadcrumbs.length - 1) {
        return `<span class="bc-current">${escapeHtml(b.label)}</span>`;
      }
      return `<a href="${b.href}">${escapeHtml(b.label)}</a>`;
    })
    .join(' <span class="bc-sep">/</span> ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${cssPath}">
</head>
<body>
  <nav class="breadcrumb">${breadcrumbHtml}</nav>
  <div class="container">
    ${bodyContent}
  </div>
  <footer class="site-footer">
    <p>Generated ${new Date().toISOString().split("T")[0]} &middot; Maya Content Pipeline</p>
  </footer>
</body>
</html>`;
}

// ============================================================
// HOME PAGE
// ============================================================

function renderHomePage(batches) {
  let html = `<header class="page-header">
    <h1>Maya Content Pipeline</h1>
    <p class="subtitle">Personal Finance (India) &mdash; Script Archive</p>
  </header>
  <section class="batch-list">`;

  for (const batch of batches) {
    const topicCount = batch.topics.length;
    const longCount = batch.topics.filter(
      (t) => t.format === "long"
    ).length;
    const shortCount = topicCount - longCount;
    const approvedCount = batch.topics.filter(
      (t) => t.status === "Approved"
    ).length;
    const draftCount = topicCount - approvedCount;

    const genres = {};
    for (const t of batch.topics) {
      genres[t.genre] = (genres[t.genre] || 0) + 1;
    }

    let reviewHtml = "";
    if (batch.reviewReport) {
      const rr = batch.reviewReport;
      reviewHtml = `<div class="batch-review-stats">
        Reviewed: ${rr.scripts_reviewed} &middot;
        <span style="color:#81c784">Passed: ${rr.passed}</span> &middot;
        <span style="color:#ef5350">Failed: ${rr.failed}</span>
      </div>`;
    }

    html += `
    <a href="batch/${batch.date}/" class="batch-card">
      <div class="batch-card-header">
        <h2>${batch.date}</h2>
        <span class="source-label">${batch.source || ""}</span>
      </div>
      <div class="batch-stats">
        <span>${topicCount} topic${topicCount !== 1 ? "s" : ""}</span>
        <span>${shortCount} short${longCount > 0 ? `, ${longCount} long-form` : ""}</span>
      </div>
      <div class="badge-row">
        ${Object.keys(genres).map((g) => genreBadge(g)).join(" ")}
      </div>
      <div class="batch-status-row">
        <span style="color:#81c784">${approvedCount} approved</span>
        <span style="color:#ffb74d">${draftCount} draft</span>
      </div>
      ${reviewHtml}
    </a>`;
  }

  html += `</section>`;
  return html;
}

// ============================================================
// BATCH PAGE
// ============================================================

function renderBatchPage(batch) {
  const topicCount = batch.topics.length;
  const longCount = batch.topics.filter((t) => t.format === "long").length;
  const shortCount = topicCount - longCount;
  const hookCount = batch.topics.filter(
    (t) => t.general_hook
  ).length;

  let html = `<header class="page-header">
    <h1>Batch: ${batch.date}</h1>
    <div class="batch-meta-bar">
      <span>${topicCount} topics</span>
      <span>${shortCount} short-form</span>
      ${longCount > 0 ? `<span>${longCount} long-form</span>` : ""}
      <span>Hooks: ${hookCount}/${topicCount}</span>
    </div>
  </header>`;

  // Research section
  if (batch.research) {
    html += `<details class="collapsible-section">
      <summary><h2 class="inline-h2">Trend Research</h2></summary>
      <div class="collapsible-content">
        ${renderResearchJson(batch.research)}
      </div>
    </details>`;
  }

  // Batch review report
  if (batch.reviewReport) {
    html += `<details class="collapsible-section">
      <summary><h2 class="inline-h2">Batch Review Report</h2>
        <span class="summary-badges">
          <span style="color:#81c784">Passed: ${batch.reviewReport.passed}</span>
          <span style="color:#ef5350">Failed: ${batch.reviewReport.failed}</span>
        </span>
      </summary>
      <div class="collapsible-content">
        ${renderBatchReviewReport(batch.reviewReport)}
      </div>
    </details>`;
  }

  // Topic grid
  html += `<section class="topic-grid">`;
  for (const topic of batch.topics) {
    html += renderTopicCard(topic, batch.date);
  }
  html += `</section>`;

  return html;
}

function renderResearchJson(research) {
  let html = `<div class="research-section">`;

  if (research.search_queries) {
    html += `<h3>Search Queries</h3><ul class="query-list">`;
    for (const q of research.search_queries) {
      html += `<li><code>${escapeHtml(q)}</code></li>`;
    }
    html += `</ul>`;
  }

  const renderTable = (title, items, valueKey) => {
    if (!items || items.length === 0) return "";
    let t = `<h3>${title}</h3><div class="table-wrap"><table><thead><tr><th>Topic</th><th>${valueKey === "intent" ? "Intent" : "Reason"}</th></tr></thead><tbody>`;
    for (const item of items) {
      t += `<tr><td>${escapeHtml(item.topic)}</td><td>${escapeHtml(item[valueKey] || "")}</td></tr>`;
    }
    t += `</tbody></table></div>`;
    return t;
  };

  html += renderTable(
    "General Trending India",
    research.general_trending,
    "reason"
  );
  html += renderTable(
    "Finance Trending",
    research.finance_trending,
    "reason"
  );
  html += renderTable(
    "Finance Evergreen",
    research.finance_evergreen,
    "intent"
  );

  html += `</div>`;
  return html;
}

function renderBatchReviewReport(rr) {
  let html = `<div class="review-report-section">`;

  for (const script of rr.scripts || []) {
    const folderName = script.folder || script.file || "Unknown";
    html += `<div class="review-script-block">
      <h4>${escapeHtml(folderName)} ${verdictBadge(script.verdict)}</h4>`;

    if (script.issues && script.issues.length > 0) {
      html += `<div class="table-wrap"><table class="issue-table">
        <thead><tr><th>Check</th><th>Severity</th><th>Detail</th><th>Fix</th></tr></thead><tbody>`;
      for (const issue of script.issues) {
        const sevColor =
          issue.severity === "high"
            ? "#ef5350"
            : issue.severity === "medium"
              ? "#ffb74d"
              : "#81c784";
        html += `<tr>
          <td><code>${escapeHtml(issue.check)}</code></td>
          <td><span style="color:${sevColor}">${issue.severity}</span></td>
          <td>${escapeHtml(issue.detail)}</td>
          <td>${escapeHtml(issue.fix)}</td>
        </tr>`;
      }
      html += `</tbody></table></div>`;
    } else {
      html += `<p class="all-passed">All checks passed</p>`;
    }

    html += `</div>`;
  }

  if (rr.batch_issues && rr.batch_issues.length > 0) {
    html += `<h4>Batch-level Issues</h4><ul>`;
    for (const issue of rr.batch_issues) {
      html += `<li>${escapeHtml(issue)}</li>`;
    }
    html += `</ul>`;
  }

  html += `</div>`;
  return html;
}

function renderTopicCard(topic, batchDate) {
  const verdictStr = topic.reviewVerdict
    ? verdictBadge(topic.reviewVerdict.verdict)
    : "";
  const issueCount =
    topic.reviewVerdict && topic.reviewVerdict.issues
      ? topic.reviewVerdict.issues.length
      : 0;

  return `
  <a href="topic-${topic.nn}.html" class="topic-card">
    <div class="card-top">
      <span class="topic-num">#${topic.nn}</span>
      <div class="card-badges">
        ${genreBadge(topic.genre)}
        ${sourceBadge(topic.source)}
        ${formatBadge(topic.format || "short")}
      </div>
    </div>
    <h3 class="card-title">${escapeHtml(topic.title)}</h3>
    <p class="card-angle">${escapeHtml(topic.angle || "")}</p>
    ${
      topic.general_hook
        ? `<div class="card-hook"><span class="hook-icon">&#128279;</span> ${escapeHtml(topic.general_hook)}</div>`
        : ""
    }
    <div class="card-bottom">
      ${statusBadge(topic.status)}
      ${verdictStr}
      ${issueCount > 0 ? `<span class="issue-count">${issueCount} issue${issueCount !== 1 ? "s" : ""}</span>` : ""}
    </div>
  </a>`;
}

// ============================================================
// TOPIC PAGE
// ============================================================

function renderTopicPage(topic, batch) {
  let html = `<header class="page-header">
    <h1>${escapeHtml(topic.title)}</h1>
    <div class="topic-meta-badges">
      ${genreBadge(topic.genre)}
      ${sourceBadge(topic.source)}
      ${formatBadge(topic.format || "short")}
      ${statusBadge(topic.status)}
      ${topic.reviewVerdict ? verdictBadge(topic.reviewVerdict.verdict) : ""}
    </div>
    <div class="topic-meta-details">
      <div class="meta-row"><span class="meta-label">Angle</span><span>${escapeHtml(topic.angle || "")}</span></div>
      <div class="meta-row"><span class="meta-label">Trend Context</span><span>${escapeHtml(topic.trend_context || "")}</span></div>
      <div class="meta-row"><span class="meta-label">General Hook</span><span>${topic.general_hook ? escapeHtml(topic.general_hook) : '<span class="muted">None</span>'}</span></div>
    </div>
  </header>`;

  // Script content
  if (topic.scriptParsed) {
    const sp = topic.scriptParsed;

    if (sp.sections.youtube.length > 0) {
      html += renderScriptFormat(
        "YouTube Shorts",
        "yt-shorts",
        sp.sections.youtube
      );
    }

    if (sp.sections.instagram.length > 0) {
      html += renderScriptFormat(
        "Instagram Reel",
        "ig-reel",
        sp.sections.instagram
      );
    }

    if (sp.sections.longform.length > 0) {
      html += renderScriptFormat(
        "YouTube Long-Form",
        "yt-long",
        sp.sections.longform
      );
    }

    if (sp.wordCount) {
      html += `<div class="word-count-bar">${escapeHtml(sp.wordCount)}</div>`;
    }
    if (sp.longWordCount) {
      html += `<div class="word-count-bar">Long-form: ${escapeHtml(sp.longWordCount)}</div>`;
    }
  } else {
    html += `<div class="empty-state">Script not available</div>`;
  }

  // Research
  if (topic.researchMd) {
    html += `<details class="collapsible-section" open>
      <summary><h2 class="inline-h2">Research Sources</h2></summary>
      <div class="collapsible-content markdown-body">${renderMarkdownContent(topic.researchMd)}</div>
    </details>`;
  }

  // Review Report (per-topic markdown)
  if (topic.reviewReportMd) {
    html += `<details class="collapsible-section" open>
      <summary><h2 class="inline-h2">Review Report</h2></summary>
      <div class="collapsible-content markdown-body">${renderMarkdownContent(topic.reviewReportMd)}</div>
    </details>`;
  }

  // Review verdict from batch JSON (if no per-topic md)
  if (!topic.reviewReportMd && topic.reviewVerdict) {
    html += `<details class="collapsible-section" open>
      <summary><h2 class="inline-h2">Review Verdict</h2> ${verdictBadge(topic.reviewVerdict.verdict)}</summary>
      <div class="collapsible-content">
        ${renderReviewVerdict(topic.reviewVerdict)}
      </div>
    </details>`;
  }

  // Production prompts
  const prodSections = [];
  if (topic.ytShortsProduction) {
    prodSections.push({
      label: "YouTube Shorts — Production Prompt",
      content: topic.ytShortsProduction,
    });
  }
  if (topic.instaReelProduction) {
    prodSections.push({
      label: "Instagram Reel — Production Prompt",
      content: topic.instaReelProduction,
    });
  }
  if (topic.ytLongProduction) {
    prodSections.push({
      label: "YouTube Long-Form — Production Prompt",
      content: topic.ytLongProduction,
    });
  }
  if (topic.legacyProduction) {
    prodSections.push({
      label: "Production Prompt (Combined)",
      content: topic.legacyProduction,
    });
  }

  if (prodSections.length > 0) {
    html += `<div class="production-section">
      <h2>Production Prompts</h2>`;
    for (const ps of prodSections) {
      html += `<details class="collapsible-section">
        <summary><h3 class="inline-h3">${escapeHtml(ps.label)}</h3></summary>
        <div class="collapsible-content"><pre class="production-pre">${escapeHtml(ps.content)}</pre></div>
      </details>`;
    }
    html += `</div>`;
  }

  // Topic navigation
  const topicIdx = batch.topics.findIndex((t) => t.id === topic.id);
  const prev = topicIdx > 0 ? batch.topics[topicIdx - 1] : null;
  const next =
    topicIdx < batch.topics.length - 1 ? batch.topics[topicIdx + 1] : null;

  html += `<nav class="topic-nav">`;
  if (prev) {
    html += `<a href="topic-${prev.nn}.html" class="nav-prev">&larr; #${prev.nn} ${escapeHtml(prev.title)}</a>`;
  } else {
    html += `<span></span>`;
  }
  if (next) {
    html += `<a href="topic-${next.nn}.html" class="nav-next">#${next.nn} ${escapeHtml(next.title)} &rarr;</a>`;
  }
  html += `</nav>`;

  return html;
}

function renderScriptFormat(label, cssClass, sections) {
  let html = `<section class="script-format ${cssClass}">
    <h2 class="format-label">${escapeHtml(label)}</h2>`;

  for (const section of sections) {
    const borderColor = SECTION_COLORS[section.name] || "#666";
    html += `<div class="script-block" style="border-left-color:${borderColor}">
      <span class="section-name" style="color:${borderColor}">${escapeHtml(section.name)}</span>
      <div class="script-text">${renderScriptText(section.text)}</div>
    </div>`;
  }

  html += `</section>`;
  return html;
}

function renderReviewVerdict(verdict) {
  if (!verdict.issues || verdict.issues.length === 0) {
    return `<p class="all-passed">All checks passed</p>`;
  }

  let html = `<div class="table-wrap"><table class="issue-table">
    <thead><tr><th>Check</th><th>Severity</th><th>Detail</th><th>Suggested Fix</th></tr></thead><tbody>`;
  for (const issue of verdict.issues) {
    const sevColor =
      issue.severity === "high"
        ? "#ef5350"
        : issue.severity === "medium"
          ? "#ffb74d"
          : "#81c784";
    html += `<tr>
      <td><code>${escapeHtml(issue.check)}</code></td>
      <td><span style="color:${sevColor}">${issue.severity}</span></td>
      <td>${escapeHtml(issue.detail)}</td>
      <td>${escapeHtml(issue.fix)}</td>
    </tr>`;
  }
  html += `</tbody></table></div>`;
  return html;
}

// ============================================================
// CSS
// ============================================================

function generateCSS() {
  return `
:root {
  --bg: #0f0f0f;
  --surface: #1a1a2e;
  --surface-hover: #222240;
  --border: #2a2a4a;
  --text: #e0e0e0;
  --text-secondary: #a0a0a0;
  --accent: #6c63ff;
  --accent-dim: #6c63ff33;
  --max-width: 1200px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  min-height: 100vh;
}

.container { max-width: var(--max-width); margin: 0 auto; padding: 1rem; }

/* Breadcrumb */
.breadcrumb {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0.75rem 1rem;
  font-size: 0.85rem;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--bg);
  z-index: 10;
}
.breadcrumb a { color: var(--accent); text-decoration: none; }
.breadcrumb a:hover { text-decoration: underline; }
.bc-sep { margin: 0 0.4rem; opacity: 0.5; }
.bc-current { color: var(--text); }

/* Page header */
.page-header { margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border); }
.page-header h1 { font-size: 1.75rem; font-weight: 700; margin-bottom: 0.5rem; }
.subtitle { color: var(--text-secondary); font-size: 1rem; }

/* Badges */
.badge {
  display: inline-block;
  padding: 0.2em 0.6em;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;
  white-space: nowrap;
}
.badge-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.5rem 0; }

/* Batch list (homepage) */
.batch-list { display: flex; flex-direction: column; gap: 1rem; }
.batch-card {
  display: block;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  text-decoration: none;
  color: var(--text);
  transition: background 0.15s, border-color 0.15s;
}
.batch-card:hover { background: var(--surface-hover); border-color: var(--accent); }
.batch-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
.batch-card-header h2 { font-size: 1.35rem; font-weight: 700; color: var(--accent); }
.source-label { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; }
.batch-stats { display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem; }
.batch-status-row { display: flex; gap: 1rem; font-size: 0.85rem; margin-top: 0.5rem; }
.batch-review-stats { font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.4rem; }

/* Batch meta bar */
.batch-meta-bar { display: flex; flex-wrap: wrap; gap: 1rem; font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem; }

/* Topic grid */
.topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}
.topic-card {
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.25rem;
  text-decoration: none;
  color: var(--text);
  transition: background 0.15s, border-color 0.15s;
}
.topic-card:hover { background: var(--surface-hover); border-color: var(--accent); }
.card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; }
.topic-num { font-size: 0.85rem; font-weight: 700; color: var(--accent); }
.card-badges { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.card-title { font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem; line-height: 1.4; }
.card-angle { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem; flex: 1; line-height: 1.5; }
.card-hook {
  font-size: 0.8rem;
  color: var(--text-secondary);
  background: var(--accent-dim);
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  line-height: 1.4;
}
.hook-icon { margin-right: 0.3rem; }
.card-bottom { display: flex; align-items: center; gap: 0.5rem; margin-top: auto; }
.issue-count { font-size: 0.75rem; color: #ef5350; }

/* Topic meta */
.topic-meta-badges { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0.75rem 0; }
.topic-meta-details { margin-top: 1rem; }
.meta-row { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; font-size: 0.9rem; line-height: 1.5; }
.meta-label {
  flex-shrink: 0;
  font-weight: 600;
  color: var(--text-secondary);
  min-width: 120px;
}
.muted { color: var(--text-secondary); font-style: italic; }

/* Script sections */
.script-format { margin: 2rem 0; }
.format-label {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}
.script-block {
  background: var(--surface);
  border-left: 3px solid #666;
  border-radius: 0 6px 6px 0;
  padding: 1rem 1.25rem;
  margin-bottom: 0.75rem;
}
.section-name {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.5rem;
}
.script-text { font-size: 0.95rem; line-height: 1.7; }

/* Markers */
.marker {
  display: inline-block;
  padding: 0.1em 0.45em;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  vertical-align: middle;
  margin: 0 0.15em;
}
.marker-beat { background: #ffffff15; color: #aaa; }
.marker-pause { background: #ffffff20; color: #ccc; padding: 0.15em 0.55em; }

.emphasis { color: #fff; font-style: normal; }

/* Overlays */
.overlay {
  display: inline-block;
  padding: 0.15em 0.5em;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0.1em 0;
}
.overlay-text { background: #2196f322; color: #64b5f6; border: 1px solid #2196f344; }
.overlay-number { background: #ff980022; color: #ffb74d; border: 1px solid #ff980044; }
.overlay-math { background: #9c27b022; color: #ce93d8; border: 1px solid #9c27b044; }
.overlay-takeaway { background: #4caf5022; color: #81c784; border: 1px solid #4caf5044; }

/* Word count */
.word-count-bar {
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 0.75rem 1rem;
  background: var(--surface);
  border-radius: 4px;
  margin: 0.5rem 0;
}

/* Collapsible sections */
.collapsible-section {
  margin: 1.5rem 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
}
.collapsible-section summary {
  padding: 0.75rem 1rem;
  cursor: pointer;
  background: var(--surface);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.collapsible-section summary:hover { background: var(--surface-hover); }
.inline-h2 { font-size: 1rem; font-weight: 600; display: inline; }
.inline-h3 { font-size: 0.9rem; font-weight: 600; display: inline; }
.summary-badges { display: flex; gap: 0.75rem; font-size: 0.8rem; }
.collapsible-content { padding: 1rem; }

/* Research section */
.research-section h3 { font-size: 0.95rem; margin: 1rem 0 0.5rem; color: var(--accent); }
.query-list { list-style: none; padding: 0; }
.query-list li { margin-bottom: 0.3rem; }
.query-list code { background: var(--surface); padding: 0.2em 0.5em; border-radius: 3px; font-size: 0.8rem; }

/* Tables */
.table-wrap { overflow-x: auto; margin: 0.5rem 0; }
table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
th { text-align: left; padding: 0.5rem 0.75rem; background: var(--surface); border-bottom: 2px solid var(--border); color: var(--text-secondary); font-weight: 600; }
td { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); vertical-align: top; }
tr:hover td { background: #ffffff05; }

/* Review */
.review-script-block { margin-bottom: 1.5rem; }
.review-script-block h4 { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
.all-passed { color: #81c784; font-style: italic; }
.issue-table code { background: var(--bg); padding: 0.1em 0.4em; border-radius: 3px; }

/* Markdown body */
.markdown-body h1 { font-size: 1.15rem; margin: 1rem 0 0.5rem; }
.markdown-body h2 { font-size: 1rem; margin: 1rem 0 0.5rem; }
.markdown-body h3 { font-size: 0.9rem; margin: 0.75rem 0 0.4rem; }
.markdown-body p { margin-bottom: 0.5rem; }
.markdown-body ul, .markdown-body ol { margin: 0.5rem 0; padding-left: 1.5rem; }
.markdown-body code { background: var(--surface); padding: 0.1em 0.4em; border-radius: 3px; font-size: 0.85em; }
.markdown-body table { margin: 0.75rem 0; }

/* Production */
.production-section { margin-top: 2rem; }
.production-section h2 { font-size: 1.15rem; margin-bottom: 1rem; }
.production-pre {
  font-size: 0.8rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: var(--text-secondary);
}

/* Topic nav */
.topic-nav {
  display: flex;
  justify-content: space-between;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
  gap: 1rem;
}
.topic-nav a {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.85rem;
  max-width: 45%;
}
.topic-nav a:hover { text-decoration: underline; }
.nav-next { text-align: right; }

/* Footer */
.site-footer {
  max-width: var(--max-width);
  margin: 3rem auto 0;
  padding: 1.5rem 1rem;
  border-top: 1px solid var(--border);
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

/* Empty state */
.empty-state {
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header h1 { font-size: 1.35rem; }
  .topic-grid { grid-template-columns: 1fr; }
  .meta-row { flex-direction: column; gap: 0.2rem; }
  .meta-label { min-width: auto; }
  .topic-nav { flex-direction: column; }
  .topic-nav a { max-width: 100%; }
  .nav-next { text-align: left; }
  .batch-meta-bar { flex-direction: column; gap: 0.3rem; }
}

@media (max-width: 480px) {
  .container { padding: 0.5rem; }
  .breadcrumb { padding: 0.5rem; font-size: 0.8rem; }
  .script-block { padding: 0.75rem; }
  .card-badges { gap: 0.2rem; }
  .badge { font-size: 0.65rem; }
}
`;
}

// ============================================================
// MAIN BUILD
// ============================================================

function buildSite() {
  console.log("Building site...\n");

  // 1. Discover batches
  const batchEntries = discoverBatches();
  if (batchEntries.length === 0) {
    console.log("No batches found in output/ or archive/. Nothing to build.");
    return;
  }
  console.log(`Found ${batchEntries.length} batch(es): ${batchEntries.map((b) => b.date).join(", ")}`);

  // 2. Load all batches
  const batches = [];
  for (const entry of batchEntries) {
    const batch = loadBatch(entry.dir, entry.date);
    if (batch) {
      batch.source = entry.source;
      batches.push(batch);
    } else {
      console.log(`  Skipping ${entry.date} (missing topics.json)`);
    }
  }

  if (batches.length === 0) {
    console.log("No valid batches found. Nothing to build.");
    return;
  }

  // 3. Clean and create site directory
  cleanDir(SITE_DIR);

  // 4. Write CSS
  fs.writeFileSync(path.join(SITE_DIR, "styles.css"), generateCSS());

  // 5. Write homepage
  const homeBody = renderHomePage(batches);
  const homeHtml = htmlShell(
    "Maya Content Pipeline",
    [{ label: "Home", href: "#" }],
    homeBody,
    "styles.css"
  );
  fs.writeFileSync(path.join(SITE_DIR, "index.html"), homeHtml);

  let totalTopics = 0;

  // 6. Write batch pages and topic pages
  for (const batch of batches) {
    const batchDir = path.join(SITE_DIR, "batch", batch.date);
    ensureDir(batchDir);

    // Batch page
    const batchBody = renderBatchPage(batch);
    const batchHtml = htmlShell(
      `Batch: ${batch.date}`,
      [
        { label: "Home", href: "../../" },
        { label: batch.date, href: "#" },
      ],
      batchBody,
      "../../styles.css"
    );
    fs.writeFileSync(path.join(batchDir, "index.html"), batchHtml);

    // Topic pages
    for (const topic of batch.topics) {
      const topicBody = renderTopicPage(topic, batch);
      const topicHtml = htmlShell(
        `#${topic.nn} ${topic.title}`,
        [
          { label: "Home", href: "../../" },
          { label: batch.date, href: "./" },
          { label: `Topic ${topic.nn}`, href: "#" },
        ],
        topicBody,
        "../../styles.css"
      );
      fs.writeFileSync(path.join(batchDir, `topic-${topic.nn}.html`), topicHtml);
      totalTopics++;
    }
  }

  console.log(`\nSite built successfully!`);
  console.log(`  Output: ${SITE_DIR}/`);
  console.log(`  Batches: ${batches.length}`);
  console.log(`  Topics: ${totalTopics}`);
  console.log(`  Open: file://${SITE_DIR}/index.html`);
}

buildSite();
