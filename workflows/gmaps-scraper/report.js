#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.join(__dirname, 'output');

// ── helpers ────────────────────────────────────────────────────────────────

function escHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pickLatestFile() {
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.startsWith('all_results_') && f.endsWith('.json'))
    .map(f => ({ name: f, mtime: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);
  if (!files.length) {
    console.error('No all_results_*.json files found in output/');
    process.exit(1);
  }
  return path.join(OUTPUT_DIR, files[0].name);
}

function ratingColor(r) {
  if (r == null) return '#888';
  if (r >= 4.0) return '#16a34a';
  if (r >= 3.0) return '#d97706';
  return '#dc2626';
}

function starsFill(rating) {
  if (rating == null) return '';
  const pct = Math.round((rating / 5) * 100);
  return `<span class="stars" title="${rating}">
    <span class="stars-bg">★★★★★</span>
    <span class="stars-fg" style="width:${pct}%">★★★★★</span>
  </span>`;
}

function iconBool(val, trueIcon, falseIcon, nullIcon) {
  if (val === null || val === undefined) return `<span class="icon-null">${nullIcon}</span>`;
  return val
    ? `<span class="icon-yes">${trueIcon}</span>`
    : `<span class="icon-no">${falseIcon}</span>`;
}

function photoCell(photo_count) {
  if (photo_count === null) return `<span class="icon-null" title="Has photos (count unknown)">📷</span>`;
  if (photo_count === 0) return `<span class="icon-no" title="No photos">✗</span>`;
  return `<span class="icon-yes" title="${photo_count} photos">📷 ${photo_count}</span>`;
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata'
  });
}

// ── build HTML ─────────────────────────────────────────────────────────────

function buildHtml(data) {
  const { meta, businesses } = data;
  const matchRate = meta.total_results > 0
    ? ((meta.icp_matches / meta.total_results) * 100).toFixed(1)
    : '0.0';

  const locations = (meta.locations || []).map(escHtml).join(', ');
  const isBatch = meta.mode === 'batch';

  const uniqueLocations = [...new Set(businesses.map(b => b.location_area).filter(Boolean))].sort();
  const uniqueCategories = [...new Set(businesses.map(b => b.category).filter(Boolean))].sort();

  const locationOptions = uniqueLocations.map(l =>
    `<option value="${escHtml(l)}">${escHtml(l)}</option>`
  ).join('\n');

  const categoryOptions = uniqueCategories.map(c =>
    `<option value="${escHtml(c)}">${escHtml(c)}</option>`
  ).join('\n');

  const rows = businesses.map((b, i) => {
    const icpClass = b.meets_icp ? 'row-icp' : '';
    const icpBadge = b.meets_icp
      ? `<span class="badge badge-icp">ICP</span>`
      : `<span class="badge badge-no">No</span>`;

    const nameCell = b.google_maps_url
      ? `<a href="${escHtml(b.google_maps_url)}" target="_blank" rel="noopener">${escHtml(b.business_name)}</a>`
      : escHtml(b.business_name);

    const websiteCell = b.website
      ? `<a href="${escHtml(b.website)}" target="_blank" rel="noopener" title="${escHtml(b.website)}">🔗</a>`
      : '<span class="icon-null">—</span>';

    const ratingCell = b.rating != null
      ? `<span class="rating" style="color:${ratingColor(b.rating)}">${starsFill(b.rating)} ${b.rating}</span>`
      : '<span class="icon-null">—</span>';

    const hoursCell = iconBool(b.has_hours, '✓', '✗', '?');
    const replyCell = iconBool(b.latest_review_has_reply, '✓', '✗', '—');

    return `<tr class="${icpClass}"
      data-icp="${b.meets_icp ? '1' : '0'}"
      data-location="${escHtml(b.location_area || '')}"
      data-category="${escHtml(b.category || '')}"
      data-name="${escHtml((b.business_name || '').toLowerCase())}">
      <td class="col-idx">${i + 1}</td>
      <td class="col-name">${nameCell}</td>
      <td class="col-cat">${escHtml(b.category)}</td>
      <td class="col-rating">${ratingCell}</td>
      <td class="col-reviews">${b.review_count != null ? b.review_count : '—'}</td>
      <td class="col-phone">${escHtml(b.phone) || '<span class="icon-null">—</span>'}</td>
      <td class="col-web">${websiteCell}</td>
      <td class="col-addr">${escHtml(b.address)}</td>
      <td class="col-hours">${hoursCell}</td>
      <td class="col-photos">${photoCell(b.photo_count)}</td>
      <td class="col-reply">${replyCell}</td>
      <td class="col-icp">${icpBadge}</td>
    </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>GMaps Report — ${escHtml(meta.query)}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; background: #f8fafc; color: #1e293b; font-size: 14px; }
  a { color: #2563eb; text-decoration: none; }
  a:hover { text-decoration: underline; }

  /* ── header ── */
  .header { background: #1e293b; color: #f1f5f9; padding: 24px 32px 20px; }
  .header h1 { margin: 0 0 6px; font-size: 1.4rem; font-weight: 700; }
  .header .subtitle { font-size: 0.85rem; color: #94a3b8; }
  .header .subtitle span { margin-right: 16px; }

  /* ── stat cards ── */
  .stats { display: flex; gap: 16px; padding: 20px 32px; background: #fff; border-bottom: 1px solid #e2e8f0; flex-wrap: wrap; }
  .stat-card { background: #f1f5f9; border-radius: 10px; padding: 14px 20px; min-width: 140px; }
  .stat-card .label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .stat-card .value { font-size: 1.8rem; font-weight: 700; line-height: 1.1; margin-top: 4px; }
  .stat-card.icp .value { color: #16a34a; }
  .stat-card.rate .value { color: #2563eb; }

  /* ── filters chip row ── */
  .filter-chips { padding: 10px 32px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
  .chip-label { font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 4px; }
  .chip { background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 20px; padding: 3px 10px; font-size: 0.78rem; color: #475569; }

  /* ── controls ── */
  .controls { padding: 12px 32px; background: #fff; border-bottom: 1px solid #e2e8f0; display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
  .controls input, .controls select { border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px 10px; font-size: 0.85rem; color: #1e293b; background: #fff; outline: none; }
  .controls input:focus, .controls select:focus { border-color: #2563eb; box-shadow: 0 0 0 2px #dbeafe; }
  .controls input { width: 220px; }
  .toggle-group { display: flex; border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; }
  .toggle-btn { border: none; background: #fff; padding: 6px 14px; font-size: 0.85rem; cursor: pointer; color: #475569; }
  .toggle-btn.active { background: #2563eb; color: #fff; }
  .row-count { margin-left: auto; font-size: 0.82rem; color: #64748b; }

  /* ── table ── */
  .table-wrap { overflow-x: auto; padding: 0 32px 40px; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.07); }
  thead tr { background: #1e293b; color: #f1f5f9; }
  thead th { padding: 10px 12px; text-align: left; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; cursor: pointer; user-select: none; }
  thead th:hover { background: #334155; }
  thead th .sort-arrow { display: inline-block; width: 12px; color: #94a3b8; font-size: 0.7rem; }
  tbody tr { border-bottom: 1px solid #f1f5f9; transition: background 0.1s; }
  tbody tr:last-child { border-bottom: none; }
  tbody tr:hover { background: #f8fafc !important; }
  tbody tr.row-icp { background: #f0fdf4; }
  tbody td { padding: 9px 12px; vertical-align: top; }

  /* ── column widths ── */
  .col-idx { width: 36px; color: #94a3b8; font-size: 0.8rem; text-align: right; }
  .col-name { min-width: 160px; max-width: 240px; font-weight: 500; }
  .col-cat { min-width: 110px; color: #475569; }
  .col-rating { min-width: 120px; white-space: nowrap; }
  .col-reviews { min-width: 60px; text-align: right; }
  .col-phone { min-width: 110px; font-size: 0.82rem; }
  .col-web { width: 50px; text-align: center; }
  .col-addr { min-width: 200px; max-width: 280px; font-size: 0.78rem; color: #475569; }
  .col-hours, .col-photos, .col-reply { width: 60px; text-align: center; }
  .col-icp { width: 60px; text-align: center; }

  /* ── icons + badges ── */
  .icon-yes { color: #16a34a; font-weight: 700; }
  .icon-no { color: #dc2626; font-weight: 700; }
  .icon-null { color: #94a3b8; }
  .badge { display: inline-block; border-radius: 20px; padding: 2px 9px; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.04em; }
  .badge-icp { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
  .badge-no { background: #f1f5f9; color: #94a3b8; border: 1px solid #e2e8f0; }

  /* ── rating stars ── */
  .stars { position: relative; display: inline-block; font-size: 0.85rem; line-height: 1; vertical-align: middle; margin-right: 3px; }
  .stars-bg { color: #e2e8f0; }
  .stars-fg { position: absolute; top: 0; left: 0; overflow: hidden; white-space: nowrap; color: #f59e0b; }
  .rating { font-size: 0.85rem; font-weight: 600; white-space: nowrap; }

  /* ── hidden rows ── */
  tr.hidden { display: none; }
</style>
</head>
<body>

<div class="header">
  <h1>📍 ${escHtml(meta.query)}</h1>
  <div class="subtitle">
    <span>🕒 Scraped ${fmtDate(meta.scraped_at)} IST</span>
    <span>📂 Mode: ${escHtml(meta.mode)}</span>
    ${isBatch || uniqueLocations.length > 1 ? `<span>📌 ${escHtml(locations)}</span>` : `<span>📌 ${escHtml(locations)}</span>`}
  </div>
</div>

<div class="stats">
  <div class="stat-card">
    <div class="label">Total Scraped</div>
    <div class="value">${meta.total_results}</div>
  </div>
  <div class="stat-card icp">
    <div class="label">ICP Matches</div>
    <div class="value">${meta.icp_matches}</div>
  </div>
  <div class="stat-card rate">
    <div class="label">Match Rate</div>
    <div class="value">${matchRate}%</div>
  </div>
</div>

<div class="filter-chips">
  <span class="chip-label">ICP filters used:</span>
  <span class="chip">Min rating: ${meta.filters.min_rating}</span>
  <span class="chip">Max rating: ${meta.filters.max_rating}</span>
  <span class="chip">Max reviews: ${meta.filters.max_reviews}</span>
  <span class="chip">Incomplete only: ${meta.filters.incomplete_only ? 'yes' : 'no'}</span>
</div>

<div class="controls">
  <input type="text" id="search" placeholder="Search by name…" oninput="applyFilters()">
  <div class="toggle-group">
    <button class="toggle-btn active" id="btn-all" onclick="setIcpFilter('all')">All</button>
    <button class="toggle-btn" id="btn-icp" onclick="setIcpFilter('icp')">ICP only</button>
  </div>
  ${uniqueLocations.length > 1 ? `
  <select id="loc-filter" onchange="applyFilters()">
    <option value="">All locations</option>
    ${locationOptions}
  </select>` : ''}
  ${uniqueCategories.length > 1 ? `
  <select id="cat-filter" onchange="applyFilters()">
    <option value="">All categories</option>
    ${categoryOptions}
  </select>` : ''}
  <span class="row-count" id="row-count">${businesses.length} businesses</span>
</div>

<div class="table-wrap">
  <table id="biz-table">
    <thead>
      <tr>
        <th class="col-idx" onclick="sortTable(0)">#<span class="sort-arrow" id="sa0"></span></th>
        <th class="col-name" onclick="sortTable(1)">Business<span class="sort-arrow" id="sa1"></span></th>
        <th class="col-cat" onclick="sortTable(2)">Category<span class="sort-arrow" id="sa2"></span></th>
        <th class="col-rating" onclick="sortTable(3)">Rating<span class="sort-arrow" id="sa3"></span></th>
        <th class="col-reviews" onclick="sortTable(4)">Reviews<span class="sort-arrow" id="sa4"></span></th>
        <th class="col-phone">Phone</th>
        <th class="col-web">Web</th>
        <th class="col-addr">Address</th>
        <th class="col-hours" onclick="sortTable(8)">Hours<span class="sort-arrow" id="sa8"></span></th>
        <th class="col-photos">Photos</th>
        <th class="col-reply">Reply</th>
        <th class="col-icp" onclick="sortTable(11)">ICP<span class="sort-arrow" id="sa11"></span></th>
      </tr>
    </thead>
    <tbody id="tbody">
      ${rows}
    </tbody>
  </table>
</div>

<script>
let icpFilter = 'all';
let sortCol = -1;
let sortDir = 1;

function setIcpFilter(val) {
  icpFilter = val;
  document.getElementById('btn-all').classList.toggle('active', val === 'all');
  document.getElementById('btn-icp').classList.toggle('active', val === 'icp');
  applyFilters();
}

function applyFilters() {
  const q = (document.getElementById('search').value || '').toLowerCase().trim();
  const loc = (document.getElementById('loc-filter') || {}).value || '';
  const cat = (document.getElementById('cat-filter') || {}).value || '';
  const rows = document.querySelectorAll('#tbody tr');
  let visible = 0;
  rows.forEach(row => {
    const nameMatch = !q || row.dataset.name.includes(q);
    const icpMatch = icpFilter === 'all' || row.dataset.icp === '1';
    const locMatch = !loc || row.dataset.location === loc;
    const catMatch = !cat || row.dataset.category === cat;
    const show = nameMatch && icpMatch && locMatch && catMatch;
    row.classList.toggle('hidden', !show);
    if (show) visible++;
  });
  const total = rows.length;
  document.getElementById('row-count').textContent =
    visible === total ? \`\${total} businesses\` : \`\${visible} of \${total} businesses\`;
}

function sortTable(col) {
  if (sortCol === col) sortDir *= -1;
  else { sortCol = col; sortDir = 1; }

  // Update arrows
  document.querySelectorAll('[id^="sa"]').forEach(el => el.textContent = '');
  const arrowEl = document.getElementById('sa' + col);
  if (arrowEl) arrowEl.textContent = sortDir === 1 ? ' ▲' : ' ▼';

  const tbody = document.getElementById('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));

  rows.sort((a, b) => {
    const ac = a.cells[col], bc = b.cells[col];
    if (!ac || !bc) return 0;
    const at = ac.textContent.trim();
    const bt = bc.textContent.trim();
    const an = parseFloat(at), bn = parseFloat(bt);
    if (!isNaN(an) && !isNaN(bn)) return (an - bn) * sortDir;
    return at.localeCompare(bt) * sortDir;
  });

  rows.forEach(r => tbody.appendChild(r));
  // Re-number index column
  let idx = 1;
  rows.forEach(r => { r.cells[0].textContent = idx++; });
}
</script>

</body>
</html>`;
}

// ── main ───────────────────────────────────────────────────────────────────

const arg = process.argv[2];
let inputPath;

if (arg) {
  inputPath = path.isAbsolute(arg) ? arg : path.join(process.cwd(), arg);
} else {
  inputPath = pickLatestFile();
}

if (!fs.existsSync(inputPath)) {
  console.error(`File not found: ${inputPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(inputPath, 'utf8');
const data = JSON.parse(raw);

const stem = path.basename(inputPath, '.json');
const outName = `report_${stem}.html`;
const outPath = path.join(OUTPUT_DIR, outName);

const html = buildHtml(data);
fs.writeFileSync(outPath, html, 'utf8');

console.log(`Report written to: output/${outName}`);
console.log(`Open with: open output/${outName}`);
