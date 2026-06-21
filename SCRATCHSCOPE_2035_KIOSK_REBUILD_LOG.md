# ScratchScope 2035 Kiosk Rebuild Log

## 2026-06-02 Product Rescue Rebuild

- Confirmed target folder: `C:\Users\planf\OneDrive\Documents\ScratchScope Lottery Intelligence`.
- Created ScratchScope-only backup: `C:\Users\planf\OneDrive\Documents\ScratchScope Lottery Intelligence\backups\ScratchScope-2035-kiosk-pre-rebuild-20260602-204717`.
- Left unrelated apps untouched.
- Added a kiosk-first product direction with Mobile View as an explicit toggle, not the default.
- Connected a safe official-data snapshot from public NC Lottery scratch-off pages:
  - real ticket artwork URLs
  - game names and numbers
  - ticket prices
  - top prizes
  - overall odds
  - prize tier total and remaining counts where visible
  - official verification links
- Kept all winner-location records as demo/approximate until an official winner feed is imported or safely connected.
- Added responsible-play and no-prediction language throughout.

## Source Notes

Official public sources used:

- `https://nclottery.com/scratch-off`
- `https://nclottery.com/scratch-off-prizes-remaining`
- `https://nclottery.com/WinnersScratchOffs`
- `https://ncplaysmart.com`

Current limitation: real ticket and prize snapshot data is cached in the app, not a live automated updater. Users must verify against official NC Lottery pages before making any purchase decision.
