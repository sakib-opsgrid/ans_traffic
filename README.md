# Kibana Report Processor

**Infozillion Teletech BD Ltd · Service Assurance**

A lightweight browser-based tool to process Kibana CSV exports and generate daily ANS traffic reports — formatted directly for Google Sheets.

---

## What it does

- Upload MNO CDR and IPTSP CDR CSV files exported from Kibana
- Automatically calculates **Error**, **Success**, and **Total** per operator
- Uses **yesterday's date** automatically (no manual input needed)
- One-click **Copy for Google Sheets** or **Download as CSV**

---

## Logic

| ansResponseCode | Count as |
|-----------------|----------|
| `1000`          | ✅ Success |
| anything else   | ❌ Error |

---

## Operators

**MNO (A2P Transactional MNO CDR)**
- Grameenphone, Banglalink, Robi, Teletalk

**IPTSP (A2P Transactional IPTSP CDR)**
- ADN, FusionNet, Mirnet, Brilliant, RanksITT, AmberIT, Metronet, Premium, RaceOnline, Bracnet, Weblink, RedData, BDCOM, BTCL, Link3, ICON, AGNI, ICC

---

## How to use

### Step 1 — Export CSVs from Kibana
1. Open Kibana → Discover
2. Select **A2P Transactional MNO CDR**
3. Set date range: yesterday 00:00:00 → 23:59:59
4. No filters needed — export the full dataset
5. Click **Share → CSV Export** (or use the download option)
6. Repeat for **A2P Transactional IPTSP CDR**

### Step 2 — Process
1. Open the tool: `https://your-username.github.io/kibana-report-processor/`
2. Upload MNO CSV → Upload IPTSP CSV
3. Click **⚡ Generate Report**

### Step 3 — Export to Google Sheets
- Click **📋 Copy for Google Sheets**
- Open your Google Sheet → click the first empty cell in the data area → Paste

---

## Project structure

```
kibana-csv-processor/
├── index.html   — Page structure
├── style.css    — All styling
├── app.js       — CSV parsing and report logic
└── README.md    — This file
```

---

## Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `kibana-report-processor`)
2. Upload all 4 files: `index.html`, `style.css`, `app.js`, `README.md`
3. Go to **Settings → Pages**
4. Source: **Deploy from a branch** → Branch: `main` → Folder: `/ (root)`
5. Save — your site will be live at:

```
https://your-username.github.io/kibana-report-processor/
```

---

## Notes

- All processing happens **in the browser** — no data is sent to any server
- Works fully offline after the page loads
- Date auto-updates every day — no configuration needed
