# US Scratch-Off Product Review

Reviewed June 5, 2026 using official state lottery websites only.

## Coverage

ScratchScope reviewed 29 state lottery scratch-off experiences: North Carolina plus 28 additional states.

States reviewed:

NC, CA, TX, FL, PA, OH, GA, VA, MD, MA, MI, NJ, IN, KY, TN, SC, CT, CO, AZ, WA, MN, MO, IA, OK, LA, WV, DE, RI, and NH.

The source URLs and capability tags used by the app live in `src/data/stateLotteryResearch.js`.

## Strongest Patterns

1. Full prize ladders and remaining-prize counts
2. Game end, final-sale, and claim-deadline tracking
3. Ticket scanners and mobile claiming
4. Second-chance entry and player rewards
5. Front, back, scratched, or interactive ticket previews
6. Retailer search, sometimes filtered by a specific game
7. Payout-percentage education
8. Daily winner activity and winning-location tools
9. Searchable and sortable master data tables
10. Guided game-finder experiences based on play style

## Product Decisions

Features that can be shipped honestly with the current NC cached dataset:

- Guided Ticket Matchmaker
- Local scratch-off Watchlist
- Displayed-tier profit and break-even analysis
- Multi-state official source and capability hub
- Stronger lifecycle-ready data model

Features that require additional official connectors:

- Live nationwide ticket inventory
- State-specific claim deadline alerts
- Game-level retailer availability
- Ticket barcode scanning
- Second-chance submission
- Mobile prize claiming
- Daily winner velocity

## Notable Official Sources

- North Carolina: https://nclottery.com/scratch-off
- California: https://www.calottery.com/en/scratchers
- Texas: https://www.texaslottery.com/export/sites/lottery/Games/Scratch_Offs/
- Maryland: https://www.mdlottery.com/games/scratch-offs/
- Massachusetts: https://www.masslottery.com/tools/mobile-app
- Michigan: https://www.michiganlottery.com/resources/instant-games-prizes-remaining
- Kentucky: https://www.kylottery.com/apps/scratch_offs/prizes_remaining.html
- South Carolina: https://www.sceducationlottery.com/Games/PrizesRemaining
- Connecticut: https://www.ctlottery.org/ScratchGames
- Colorado: https://www.coloradolottery.com/en/games/scratch/
- Washington: https://www.walottery.com/Scratch/TopPrizesRemaining.aspx
- Missouri: https://www.molottery.com/scratchers-list.do
- Iowa: https://ialottery.com/Pages/Games/RemainingPrizes.aspx
- Oklahoma: https://www.lottery.ok.gov/scratchers/remaining-prizes
- West Virginia: https://wvlottery.com/games/scratch-offs
- Delaware: https://www.delottery.com/Instant-Games/Top-Prizes-Remaining
- Rhode Island: https://www.rilot.com/en-us/instantgames.html
- New Hampshire: https://www.nhlottery.com/Games/Scratch-Tickets/Current-Scratch-Game-Schedule

Lottery outcomes remain random. State inventory reports generally reflect claimed prizes and may include winning tickets that have already been sold but not yet claimed.
