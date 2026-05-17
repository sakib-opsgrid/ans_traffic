# Kibana Report Processor

**Infozillion Teletech BD Ltd · Service Assurance**

A professional browser-based tool to generate daily ANS traffic reports from Kibana — formatted directly for Google Sheets paste.

---

## Live Tool

```
https://your-username.github.io/kibana-report-processor/
```

---

## How it works

Instead of downloading large CSVs, you read the **Documents count** directly from Kibana's Discover page and enter the numbers into this tool. The tool calculates totals, formats the date, and gives you a one-click copy for Google Sheets.

---

## Daily Workflow

### Step 1 — Open Kibana Discover

1. Connect VPN
2. Go to `https://loganalyzerdc.mnpspbd.com/`
3. Login with your credentials
4. Navigate to **Discover**

### Step 2 — MNO Data (A2P Transactional MNO CDR)

1. Select data view: **A2P Transactional MNO CDR**
2. Set date range: yesterday `00:00:00.000` → `23:59:59.999`
3. For each operator (Grameenphone, Robi, Banglalink, Teletalk):
   - Add filter: `ansResponseCode is 1000` + `applicableSmsGateway is [operator]`
   - Note the **Documents (X)** count → this is **Success**
   - Change filter to `ansResponseCode is not 1000`
   - Note the count → this is **Error**

### Step 3 — IPTSP Data (A2P Transactional IPTSP CDR)

1. Select data view: **A2P Transactional IPTSP CDR**
2. Same date range
3. Repeat for all 18 IPTSP operators

### Step 4 — Generate Report

1. Open the tool
2. Enter all Success and Error counts
3. Click **⚡ Generate Report**
4. Click **📋 Copy for Google Sheets**
5. Open Google Sheet → click first empty cell → **Paste**

---

## Operators

**MNO (4 operators)**
| Operator | Type |
|----------|------|
| Grameenphone | MNO |
| Robi | MNO |
| Banglalink | MNO |
| Teletalk | MNO |

**IPTSP (18 operators)**
| Operator | Operator | Operator |
|----------|----------|----------|
| ADN | FusionNet | Mirnet |
| Brilliant | RanksITT | AmberIT |
| Metronet | Premium | RaceOnline |
| Bracnet | Weblink | RedData |
| BDCOM | BTCL | Link3 |
| ICON | AGNI | ICC |

---

## Google Sheet Column Format

| A | B | C | D | E |
|---|---|---|---|---|
| Date | ANS | Error | Success | Total |
| 17 - May - 26 | Grameenphone | 172717 | 4879070 | 5051787 |

---

## Keyboard Shortcut

- **Enter** on any input → moves to next input automatically
- **Enter** on the last input → generates the report

---

## Project Structure

```
kibana-csv-processor/
├── index.html   — Page structure and input form
├── style.css    — Dark theme styling
├── app.js       — Report generation logic
└── README.md    — This file
```

---

## Deploy to GitHub Pages

1. Create a new GitHub repository — name: `kibana-report-processor` — set to **Public**
2. Upload all 4 files: `index.html`, `style.css`, `app.js`, `README.md`
3. Go to **Settings → Pages**
4. Source: **Deploy from a branch** → Branch: `main` → Folder: `/ (root)` → **Save**
5. Wait ~2 minutes — live at:

```
https://your-username.github.io/kibana-report-processor/
```

> All processing happens in the browser. No data is sent to any server.

---

© 2026 Najmaz Sakib · Infozillion Teletech Bd Ltd
