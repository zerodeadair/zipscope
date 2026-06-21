# ScratchScope Upgrade Log

## 2026-06-02 Premium Intelligence Upgrade

- Confirmed target folder: `C:\Users\planf\OneDrive\Documents\ScratchScope Lottery Intelligence`.
- Created pre-upgrade backup: `C:\Users\planf\OneDrive\Documents\ScratchScope Lottery Intelligence\backups\ScratchScope-pre-upgrade-20260602-184209`.
- Modified only the ScratchScope app folder.
- Reworked the app into a premium North Carolina scratch-off intelligence dashboard.
- Added a local demo data layer with official NC Lottery and NC Play Smart source links.
- Added service modules for lottery data, ScratchScope scoring, hot zones, location intelligence, and responsible play budget planning.
- Added component modules for scratch cards, detail drawer, winning locations map, hot zone panel, compare mode, budget planner, and data freshness badges.
- Added responsible-play guardrails throughout the interface.
- Added safe data-access fallbacks: official source buttons, manual refresh placeholder, and paste/import prize table workflow.

## Data Limitation

Current app data is marked `DEMO DATA` and `SAMPLE ONLY`. It must be verified against official NC Lottery sources before real-world use. No live automated scraping or aggressive public-site fetching was added.
