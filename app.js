/* ─────────────────────────────────────────────────────────
   Kibana Report Processor — app.js
   Infozillion Teletech BD Ltd · Service Assurance
   ───────────────────────────────────────────────────────── */

const MNO_OPERATORS = [
  "Grameenphone", "Banglalink", "Robi", "Teletalk"
];

const IPTSP_OPERATORS = [
  "ADN", "FusionNet", "Mirnet", "Brilliant", "RanksITT",
  "AmberIT", "Metronet", "Premium", "RaceOnline", "Bracnet",
  "Weblink", "RedData", "BDCOM", "BTCL", "Link3", "ICON", "AGNI", "ICC"
];

/* ── State: 4 CSVs ── */
let csvMnoSuccess   = null;  // MNO   ansResponseCode is     1000
let csvMnoError     = null;  // MNO   ansResponseCode is not 1000
let csvIptspSuccess = null;  // IPTSP ansResponseCode is     1000
let csvIptspError   = null;  // IPTSP ansResponseCode is not 1000

let allResults = [];

/* ── Yesterday: DD - Mon - YY ── */
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
    let cur = "", inQ = false;
    for (const ch of line) {
      if (ch === '"')             { inQ = !inQ; }
      else if (ch === ',' && !inQ){ cols.push(cur.trim()); cur = ""; }
      else                        { cur += ch; }
    }
    cols.push(cur.trim());
    const row = {};
    headers.forEach((h, i) => {
      row[h] = (cols[i] || "").replace(/^"|"$/g, "").trim();
    });
    return row;
  });
}

/* ── Get applicableSmsGateway value (case-insensitive key) ── */
function getGateway(row) {
  const key = Object.keys(row).find(
    k => k.toLowerCase() === "applicablesmsgateway"
  );
  return key ? row[key] : "";
}

/* ── Count rows per operator from a parsed CSV ── */
function countByOperator(rows, operators) {
  const counts = {};
  operators.forEach(op => counts[op] = 0);

  for (const row of rows) {
    const gw = getGateway(row);
    const match = operators.find(
      op => op.toLowerCase() === gw.toLowerCase()
    );
    if (match) counts[match]++;
  }
  return counts;
}

/* ── Build result rows ── */
function buildResults(successRows, errorRows, operators, type) {
  const date        = getYesterday();
  const successCount = countByOperator(successRows || [], operators);
  const errorCount   = countByOperator(errorRows   || [], operators);

  return operators.map(op => ({
    date,
    ans:     op,
    type,
    success: successCount[op] || 0,
    error:   errorCount[op]   || 0,
    total:  (successCount[op] || 0) + (errorCount[op] || 0)
  }));
}

/* ── Number formatter ── */
function fmt(n) { return n.toLocaleString(); }

/* ── File reader ── */
function readFile(file, callback) {
  const reader = new FileReader();
  reader.onload = e => callback(parseCSV(e.target.result));
  reader.readAsText(file);
}

/* ── Enable process button if at least one file loaded ── */
function checkReady() {
  const ready = csvMnoSuccess || csvMnoError || csvIptspSuccess || csvIptspError;
  document.getElementById("process-btn").disabled = !ready;
}

/* ── Toast ── */
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

/* ── Render table ── */
function renderTable() {
  const tbody = document.getElementById("result-tbody");
  tbody.innerHTML = "";

  let totalSuccess = 0, totalError = 0;
  let lastType = null;

  for (const row of allResults) {
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

  document.getElementById("stat-success").textContent = fmt(totalSuccess);
  document.getElementById("stat-error").textContent   = fmt(totalError);
  document.getElementById("stat-total").textContent   = fmt(totalSuccess + totalError);
  document.getElementById("results-meta").textContent =
    `${allResults.length} operators · ${getYesterday()}`;
}

/* ── Main process ── */
function processFiles() {
  allResults = [
    ...buildResults(csvMnoSuccess,   csvMnoError,   MNO_OPERATORS,   "MNO"),
    ...buildResults(csvIptspSuccess, csvIptspError, IPTSP_OPERATORS, "IPTSP")
  ];

  renderTable();

  const section = document.getElementById("results-section");
  section.classList.add("visible");
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ── Copy TSV for Google Sheets ── */
function copyForSheets() {
  const tsv = allResults
    .map(r => [r.date, r.ans, r.error, r.success, r.total].join("\t"))
    .join("\n");

  navigator.clipboard.writeText(tsv)
    .then(() => showToast("✓ Copied! Paste into Google Sheets"))
    .catch(() => showToast("Copy failed — please select manually"));
}

/* ── Download CSV ── */
function downloadCSV() {
  const header = "Date,ANS,Error,Success,Total";
  const rows   = allResults
    .map(r => [r.date, r.ans, r.error, r.success, r.total].join(","))
    .join("\n");
  const blob = new Blob([header + "\n" + rows], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `kibana-report-${getYesterday().replace(/ - /g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("✓ CSV downloaded");
}

/* ── File input bindings ── */
function bindFileInput(id, statusId, cardId, storeKey, statusClass) {
  document.getElementById(id).addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;
    const status = document.getElementById(statusId);
    status.textContent = "Reading...";
    status.className   = "file-status";
    readFile(file, rows => {
      if      (storeKey === "mnoSuccess")   csvMnoSuccess   = rows;
      else if (storeKey === "mnoError")     csvMnoError     = rows;
      else if (storeKey === "iptspSuccess") csvIptspSuccess = rows;
      else if (storeKey === "iptspError")   csvIptspError   = rows;

      status.textContent = `✓ ${file.name} · ${rows.length.toLocaleString()} rows`;
      status.className   = `file-status ${statusClass}`;
      document.getElementById(cardId).classList.add("has-file");
      checkReady();
    });
  });
}

bindFileInput("mno-success-file",   "mno-success-status",   "mno-success-card",   "mnoSuccess",   "success-loaded");
bindFileInput("mno-error-file",     "mno-error-status",     "mno-error-card",     "mnoError",     "error-loaded");
bindFileInput("iptsp-success-file", "iptsp-success-status", "iptsp-success-card", "iptspSuccess", "success-loaded");
bindFileInput("iptsp-error-file",   "iptsp-error-status",   "iptsp-error-card",   "iptspError",   "error-loaded");

/* ── Init ── */
document.getElementById("date-display").textContent = getYesterday();
