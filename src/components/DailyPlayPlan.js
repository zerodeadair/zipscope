const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function scratchLines(plan) {
  return plan.lines.map(({ game, quantity, subtotal, reason }) => `<article class="dailyLine scratchDailyLine" data-detail="${game.id}">
    <div class="dailyTicketThumb"><img src="${game.imageUrl}" alt="${game.name} ticket"><b>${quantity}x</b></div>
    <div class="dailyLineCopy"><span>Scratch-off</span><h3>${game.name}</h3><p>${reason}</p><small>$${game.price} each · ${game.overallOdds} · Score ${game.intelligence.score}</small></div>
    <strong>${money.format(subtotal)}</strong>
  </article>`).join("");
}

function drawLines(plan) {
  return plan.lines.map(({ game, quantity, subtotal, reason }) => `<article class="dailyLine drawDailyLine">
    <div class="drawPlanMark">${quantity}x</div>
    <div class="dailyLineCopy"><span>Scheduled play</span><h3>${game.gameName}</h3><p>${reason}</p><small>${game.drawDays.join(", ")} · ${game.oddsOverall} overall odds</small></div>
    <strong>${money.format(subtotal)}</strong>
    <button type="button" data-daily-draw="${game.gameId}">Open</button>
  </article>`).join("");
}

function locationLines(locations, zip) {
  return locations.map((location, index) => `<article class="dailyLocation">
    <b>${index + 1}</b>
    <div><span>${location.distance === null ? `ZIP ${zip} area` : `${location.distance} mi from ${zip}`}</span><h3>${location.name}</h3><p>${location.address || `${location.city}, ${location.county}`}</p><small>Historical signal only. Check current ticket availability.</small></div>
    ${location.sourceUrl ? `<a href="${location.sourceUrl}" target="_blank" rel="noreferrer" data-official-link>Source</a>` : ""}
  </article>`).join("");
}

export function DailyPlayPlan(plan) {
  return `<section class="dailyPlayPlan" aria-labelledby="daily-plan-title">
    <header class="dailyPlanHeader">
      <div>
        <span class="dailyPlanEyebrow">${plan.dateLabel} · ZIP ${plan.zip}</span>
        <h1 id="daily-plan-title">Your ${money.format(plan.budget)} daily play plan</h1>
        <p>A single, budget-locked mix of researched scratch-offs and draw games. Quantities are suggestions for entertainment, not predictions.</p>
      </div>
      <div class="dailyTotal"><span>Hard limit</span><strong>${money.format(plan.total)}</strong><small>${plan.remaining ? `${money.format(plan.remaining)} unallocated` : "Fully allocated"}</small></div>
    </header>
    <div class="dailyAllocation" aria-label="Daily budget allocation">
      <div style="--allocation:${Math.round(plan.scratch.total / plan.budget * 100)}%"><span>Scratch-offs</span><strong>${money.format(plan.scratch.total)}</strong><small>${plan.scratch.ticketCount} tickets</small></div>
      <div style="--allocation:${Math.round(plan.draws.total / plan.budget * 100)}%"><span>Draw games</span><strong>${money.format(plan.draws.total)}</strong><small>${plan.draws.playCount} plays</small></div>
      <div><span>Remaining</span><strong>${money.format(plan.remaining)}</strong><small>Do not exceed limit</small></div>
    </div>
    <div class="dailyPlanGrid">
      <section class="dailyPlanColumn scratchPlanColumn">
        <div class="dailyColumnHead"><div><span>01 · Buy list</span><h2>${money.format(plan.scratch.total)} scratch-off mix</h2></div><button type="button" data-nav="scratch">Browse all</button></div>
        <div class="dailyLineList">${scratchLines(plan.scratch)}</div>
      </section>
      <section class="dailyPlanColumn drawPlanColumn">
        <div class="dailyColumnHead"><div><span>02 · Scheduled today</span><h2>${money.format(plan.draws.total)} draw-game mix</h2></div><button type="button" data-nav="draws">Draw center</button></div>
        <div class="dailyLineList">${drawLines(plan.draws)}</div>
      </section>
      <aside class="dailyPlanColumn locationPlanColumn">
        <div class="dailyColumnHead"><div><span>03 · Retailer research</span><h2>Nearby location signals</h2></div><button type="button" data-nav="hotzones">Map</button></div>
        <p class="locationIntro">These are nearby retailers from sourced historical winner articles. Past wins do not make a location luckier.</p>
        <div class="dailyLocationList">${locationLines(plan.locations, plan.zip)}</div>
      </aside>
    </div>
    <footer class="dailyPlanFooter">
      <strong>Before buying</strong>
      <span>Verify ticket availability, remaining prizes, draw schedule, and sales cutoff on the official NC Lottery site.</span>
      <b>${plan.warning}</b>
    </footer>
  </section>`;
}
