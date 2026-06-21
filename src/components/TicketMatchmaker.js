const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function TicketMatchmaker(open, preferences, matches) {
  if (!open) return "";
  return `<div class="featureModalBackdrop" data-matchmaker-backdrop>
    <section class="featureModal matchmakerModal" data-modal-stop role="dialog" aria-modal="true" aria-labelledby="matchmaker-title">
      <header class="featureModalHeader">
        <div><span>Guided research</span><h2 id="matchmaker-title">Find your ticket match</h2><p>Choose your comfort zone. ScratchScope ranks the connected NC snapshot using public-data signals, never a promise of winning.</p></div>
        <button type="button" class="iconBtn" data-close-matchmaker aria-label="Close matchmaker">&times;</button>
      </header>
      <div class="matchmakerControls">
        <label>Maximum ticket price<select data-match-field="budget">${[1, 2, 3, 5, 10, 20, 30, 50].map((value) => `<option value="${value}" ${Number(preferences.budget) === value ? "selected" : ""}>Up to $${value}</option>`).join("")}</select></label>
        <label>What matters most?<select data-match-field="goal">${[["balanced", "Balanced signals"], ["odds", "Better overall odds"], ["jackpot", "Largest top prize"], ["depth", "More displayed prize depth"]].map(([value, label]) => `<option value="${value}" ${preferences.goal === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
        <label>Research style<select data-match-field="style">${[["cautious", "Lower-cost cautious"], ["balanced", "Balanced"], ["bold", "Bolder jackpot chase"]].map(([value, label]) => `<option value="${value}" ${preferences.style === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      </div>
      <div class="matchmakerResults">
        ${matches.length ? matches.map(({ game, reason }, index) => `<article>
          <div class="matchRank">${index + 1}</div>
          <img src="${game.imageUrl}" alt="${game.name} ticket">
          <div class="matchCopy"><span>${index === 0 ? "Best fit" : "Alternative"}</span><h3>${game.name}</h3><p>${reason}</p><div><b>$${game.price}</b><b>${game.overallOdds}</b><b>Score ${game.intelligence.score}</b><b>${money.format(game.topPrizeAmount)} top</b></div></div>
          <div class="matchActions"><button type="button" data-open-detail="${game.id}">Inspect</button><button type="button" data-watch-ticket="${game.id}">Save</button><a href="${game.sourceUrl}" target="_blank" rel="noreferrer" data-official-link>Official</a></div>
        </article>`).join("") : `<div class="emptyState"><strong>No connected ticket fits that budget.</strong><span>Raise the maximum price to see matches.</span></div>`}
      </div>
      <footer class="featureModalFooter">Matches use the cached official NC snapshot. Lottery outcomes are random; verify the official ticket page before buying.</footer>
    </section>
  </div>`;
}
