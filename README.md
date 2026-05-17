# Kibana Report Processor

**Infozillion Teletech BD Ltd · Service Assurance**

Browser-based tool to process Kibana CSV exports and generate daily ANS traffic reports — formatted directly for Google Sheets.

---

## How it works

Upload **4 CSV files** exported from Kibana:

| # | File | Filter used in Kibana |
|---|------|-----------------------|
| 1 | MNO Success   | A2P Transactional MNO CDR · `ansResponseCode is 1000` |
| 2 | MNO Error     | A2P Transactional MNO CDR · `ansResponseCode is not 1000` |
| 3 | IPTSP Success | A2P Transactional IPTSP CDR · `ansResponseCode is 1000` |
| 4 | IPTSP Error   | A2P Transactional IPTSP CDR · `ansResponseCode is not 1000` |

The tool reads `applicableSmsGateway` from each CSV and counts rows per operator.

---

## Operators

**MNO:** Grameenphone, Banglalink, Robi, Teletalk

**IPTSP:** ADN, FusionNet, Mirnet, Brilliant, RanksITT, AmberIT, Metronet, Premium, RaceOnline, Bracnet, Weblink, RedData, BDCOM, BTCL, Link3, ICON, AGNI, ICC

---

## Daily workflow

1. Open Kibana → Discover → **A2P Transactional MNO CDR**
2. Set date: yesterday 00:00:00.000 → 23:59:59.999
3. Filter: `ansResponseCode is 1000` → Export CSV (MNO Success)
4. Filter: `ansResponseCode is not 1000` → Export CSV (MNO Error)
5. Switch to **A2P Transactional IPTSP CDR** → repeat steps 3–4
6. Open the tool → upload 4 files → **⚡ Generate Report**
7. Click **📋 Copy for Google Sheets** → paste into Sheet

---

## Project structure

```
kibana-csv-processor/
├── index.html   — Page structure
├── style.css    — Styling
├── app.js       — Logic
└── README.md    — This file
```

---

## Deploy to GitHub Pages

1. Create repo (e.g. `kibana-report-processor`) — Public
2. Upload all 4 files
3. Settings → Pages → Branch: `main` → Folder: `/ (root)` → Save
4. Live at: `https://your-username.github.io/kibana-report-processor/`

> All processing is done in the browser. No data is sent anywhere.

---

© 2026 Najmaz Sakib · Infozillion Teletech Bd Ltd
