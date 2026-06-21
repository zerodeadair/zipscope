const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function verdict(game) {
  const score = game.intelligence.score;
  if (score >= 90) return "One of the strongest research profiles in the current cached dataset.";
  if (score >= 80) return "A strong research candidate with several favorable public-data signals.";
  if (score >= 70) return "A balanced candidate worth comparing with similarly priced tickets.";
  if (score >= 55) return "A mixed profile. Review the weaker factors before considering it.";
  return "A weak or incomplete profile that deserves extra verification.";
}

export function AIScoreExplainer(game) {
  if (!game) return "";
  const intelligence = game.intelligence;
  const strongest = [...intelligence.scoreFactors].filter((factor) => factor.max > 0).sort((a, b) => (b.points / b.max) - (a.points / a.max))[0];
  const weakest = [...intelligence.scoreFactors].filter((factor) => factor.max > 0).sort((a, b) => (a.points / a.max) - (b.points / b.max))[0];
  return `<div class="aiExplainerBackdrop" data-ai-close>
    <section class="aiExplainer" data-stop role="dialog" aria-modal="true" aria-labelledby="ai-explainer-title">
      <header class="aiExplainerHeader">
        <div><span>ScratchScope Intelligence</span><h2 id="ai-explainer-title">What does the ${intelligence.score} score for ${game.name} mean?</h2></div>
        <button class="iconBtn" data-ai-close aria-label="Close AI score explanation">&times;</button>
      </header>
      <div class="aiVerdict">
        <div class="aiScoreOrb" style="--ai-score:${intelligence.score}%"><strong>${intelligence.score}</strong><span>of 100</span></div>
        <div><span>${intelligence.label}</span><h3>${verdict(game)}</h3><p>This score ranks research signals. It does not predict whether the next ticket will win.</p></div>
      </div>
      <div class="aiPlainLanguage">
        <article><span>Strongest signal</span><strong>${strongest.label}</strong><p>${strongest.detail}</p></article>
        <article><span>Biggest tradeoff</span><strong>${weakest.label}</strong><p>${weakest.detail}</p></article>
        <article><span>Confidence</span><strong>${intelligence.confidenceScore}%</strong><p>Confidence reflects source completeness and freshness, not winning certainty.</p></article>
      </div>
      <div class="aiFactorList">
        <div class="aiFactorHeading"><div><span>Score anatomy</span><h3>How the model built this score</h3></div><strong>${money.format(game.topPrizeAmount)} top prize</strong></div>
        ${intelligence.scoreFactors.map((factor) => {
          const width = factor.max > 0 ? Math.max(0, Math.min(100, factor.points / factor.max * 100)) : 100;
          return `<article class="${factor.points < 0 ? "penalty" : ""}">
            <div class="aiFactorLabel"><strong>${factor.label}</strong><span>${factor.points > 0 ? "+" : ""}${factor.points} pts${factor.max > 0 ? ` / ${factor.max}` : ""}</span></div>
            <div class="aiFactorMeter"><i style="width:${width}%"></i></div>
            <p>${factor.detail}</p>
          </article>`;
        }).join("")}
      </div>
      <div class="aiTakeaway">
        <span>AI takeaway</span>
        <p>${intelligence.summary} Compare it with tickets at the same price before making a budgeted choice.</p>
      </div>
      <footer class="aiExplainerFooter">
        <button type="button" data-ai-close>Got it</button>
        <a href="${game.sourceUrl}" target="_blank" rel="noreferrer">Verify official data</a>
      </footer>
    </section>
  </div>`;
}
