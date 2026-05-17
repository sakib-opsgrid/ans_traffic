/* ─────────────────────────────────────────────────────────
   Kibana Report Processor — app.js
   Infozillion Teletech BD Ltd · Service Assurance
   ───────────────────────────────────────────────────────── */

/* ── Operator lists ── */
const MNO_OPERATORS = [
  "Grameenphone", "Banglalink", "Robi", "Teletalk"
];

const IPTSP_OPERATORS = [
  "ADN", "FusionNet", "Mirnet", "Brilliant", "RanksITT",
  "AmberIT", "Metronet", "Premium", "RaceOnline", "Bracnet",
  "Weblink", "RedData", "BDCOM", "BTCL", "Link3", "ICON", "AGNI", "ICC"
];

/* ── State ── */
let mnoRawRows   = null;
let iptspRawRows = null;
let allResults   = [];

/* ── Date helper — yesterday in DD - Mon - YY format ── */
function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const months = ["Jan","Feb","Mar","Apr","May","Jun",
                  "Jul","Aug","Sep","Oct","Nov","Dec"];
  const day = String(d.getDate()).padStart(2, "0");
  const yr  = String(d.getFullYear()).slice(2);
  return `${day} - ${months[d.getMonth()]} - ${yr}`;
}

/* ── CSV parser ── */
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h =>
    h.trim().replace(/^"|"$/g, "").trim()
  );

  return lines.slice(1).map(line => {
    const cols = [];
    let cur = "", inQuote = false;
    for (const ch of line) {
      if (ch === '"')              { inQuote = !inQuote; }
      else if (ch === ',' && !inQuote) { cols.push(cur.trim()); cur = ""; }
      else                         { cur += ch; }
    }
    cols.push(cur.trim());

    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || "").replace(/^"|"$/g, "").trim();
    });
    return row;
  });
}

/* ── Flexible field getter (case-insensitive key matching) ── */
function getField(row, ...candidates) {
  for (const key of candidates) {
    const match = Object.keys(row).find(
      k => k.toLowerCase() === key.toLowerCase()
    );
    if (match && row[match]) return row[match];
  }
  return "";
}

/* ── Process rows for a list of operators ── */
function processOperators(rows, operators, type) {
  const dateStr = getYesterday();

  return operators.map(op => {
    const opRows = rows.filter(r => {
      const gw = getField(r,
        "applicableSmsGateway",
        "applicableSmSGateway",
        "gateway",
        "operator",
        "ans"
      );
      return gw.toLowerCase() === op.toLowerCase();
    });

    let success = 0, error = 0;
    for (const r of opRows) {
      const code = getField(r,
        "ansResponseCode",
        "ansresponsecode",
        "responseCode",
        "response_code",
        "code"
      );
      if (String(code).trim() === "1000") success++;
      else error++;
    }

    return { date: dateStr, ans: op, type, error, success, total: error + success };
  });
}

/* ── Number formatter ── */
function fmt(n) { return n.toLocaleString(); }

/* ── Read a file and parse it ── */
function readFile(file, callback) {
  const reader = new FileReader();
  reader.onload = e => callback(parseCSV(e.target.result));
  reader.readAsText(file);
}

/* ── Check if button should be enabled ── */
function checkReady() {
  const btn = document.getElementById("process-btn");
  btn.disabled = !(mnoRawRows || iptspRawRows);
}

/* ── Show toast notification ── */
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ── Render results table ── */
function renderTable() {
  const tbody = document.getElementById("result-tbody");
  tbody.innerHTML = "";

  let totalSuccess = 0, totalError = 0;
  let lastType = null;

  for (const row of allResults) {

    // Section divider
    if (!lastType && row.type === "MNO") {
      const div = document.createElement("tr");
      div.className = "divider-row";
      div.innerHTML = `<td colspan="5">— MNO Operators —</td>`;
      tbody.appendChild(div);
    }
    if (lastType === "MNO" && row.type === "IPTSP") {
      const div = document.createElement("tr");
      div.className = "divider-row";
      div.innerHTML = `<td colspan="5">— IPTSP Operators —</td>`;
      tbody.appendChild(div);
    }
    lastType = row.type;

    totalSuccess += row.success;
    totalError   += row.error;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="td-date">${row.date}</td>
      <td class="td-ans">
        ${row.ans}
        <span class="td-badge ${row.type.toLowerCase()}">${row.type}</span>
      </td>
      <td class="td-num td-error">${fmt(row.error)}</td>
      <td class="td-num td-success">${fmt(row.success)}</td>
      <td class="td-num td-total">${fmt(row.total)}</td>
    `;
    tbody.appendChild(tr);
  }

  // Update summary stats
  document.getElementById("stat-success").textContent = fmt(totalSuccess);
  document.getElementById("stat-error").textContent   = fmt(totalError);
  document.getElementById("stat-total").textContent   = fmt(totalSuccess + totalError);
  document.getElementById("results-meta").textContent =
    `${allResults.length} operators · ${getYesterday()}`;
}

/* ── Main: process uploaded files ── */
function processFiles() {
  allResults = [];
  if (mnoRawRows)   allResults.push(...processOperators(mnoRawRows,   MNO_OPERATORS,   "MNO"));
  if (iptspRawRows) allResults.push(...processOperators(iptspRawRows, IPTSP_OPERATORS, "IPTSP"));

  renderTable();

  const section = document.getElementById("results-section");
  section.classList.add("visible");
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── Copy tab-separated values for Google Sheets ── */
function copyForSheets() {
  const tsv = allResults
    .map(r => [r.date, r.ans, r.error, r.success, r.total].join("\t"))
    .join("\n");

  navigator.clipboard.writeText(tsv)
    .then(() => showToast("✓ Copied! Now paste into Google Sheets"))
    .catch(() => showToast("Copy failed — please select and copy manually"));
}

/* ── Download as CSV file ── */
function downloadCSV() {
  const header = "Date,ANS,Error,Success,Total";
  const rows   = allResults
    .map(r => [r.date, r.ans, r.error, r.success, r.total].join(","))
    .join("\n");

  const blob = new Blob([header + "\n" + rows], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  const date = getYesterday().replace(/ - /g, "-");

  a.href     = url;
  a.download = `kibana-report-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("✓ CSV downloaded");
}

/* ── File input event listeners ── */
document.getElementById("mno-file").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const status = document.getElementById("mno-status");
  const card   = document.getElementById("mno-card");
  status.textContent  = "Reading...";
  status.className    = "file-status";

  readFile(file, rows => {
    mnoRawRows          = rows;
    status.textContent  = `✓ ${file.name} · ${rows.length.toLocaleString()} rows`;
    status.className    = "file-status loaded";
    card.classList.add("has-file");
    checkReady();
  });
});

document.getElementById("iptsp-file").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

  const status = document.getElementById("iptsp-status");
  const card   = document.getElementById("iptsp-card");
  status.textContent  = "Reading...";
  status.className    = "file-status";

  readFile(file, rows => {
    iptspRawRows        = rows;
    status.textContent  = `✓ ${file.name} · ${rows.length.toLocaleString()} rows`;
    status.className    = "file-status iptsp-loaded";
    card.classList.add("has-file");
    checkReady();
  });
});

/* ── Init: set yesterday date on load ── */
document.getElementById("date-display").textContent = getYesterday();
