function assistantIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/></svg>`;
}

function escapeText(value = "") {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

function activeInsight(game, mode, route = "home") {
  if (!game) return "Select a ticket to inspect its public-data signals.";
  const top = `${game.intelligence.topPrizesRemaining} of ${game.intelligence.originalTopPrizes}`;
  const insights = {
    summary: `${game.name} currently scores ${game.intelligence.score}/100. ${game.intelligence.summary}`,
    trend: `${game.name} is classified as ${game.intelligence.trend.toLowerCase()}. Its visible inventory health is ${game.intelligence.prizeHealthScore}/100, with ${top} top prizes visible in the cached table.`,
    freshness: `This record is marked ${game.dataState.toLowerCase()} with ${game.intelligence.confidenceScore}% model confidence. Verify the official page before acting on any change.`,
    next: `Inspect the prize ladder, compare ${game.name} with tickets near its $${game.price} price, and check whether its visible top-prize ratio changed at the next refresh.`,
    compare: `Compare ${game.name} with tickets near $${game.price}. Focus on published odds, visible top-prize ratio, displayed prize depth, freshness, and cost. No ranking changes random odds.`,
    changed: `${game.name} currently shows ${top} top prizes, ${game.intelligence.prizeHealthScore}/100 prize depth, and a ${game.intelligence.trend.toLowerCase()} trend. A newer official snapshot is required to confirm a change.`,
    depth: `Prize depth is ${game.intelligence.prizeHealthScore}/100 across displayed cached tiers. It describes visible inventory layers, not full expected value or a prediction.`,
    budget: `At $${game.price}, one ticket uses ${game.price} dollars of a fixed entertainment budget. Compare only with tickets you can afford to lose and stop at the limit you set.`,
    odds: `${game.overallOdds} is the published game-wide average. In simple terms, timing, retailer history, and ticket selection do not improve a random ticket's odds.`,
    similar: `Look for tickets near $${game.price} with comparable freshness and stronger visible prize depth. Similarity helps comparison; it does not identify a future winner.`,
    route: route === "draws"
      ? "You are in Draw Intelligence. Focus on official schedules, cutoffs, cached results, and saved-number organization."
      : route === "hotzones"
        ? "You are in Location Intelligence. Winner locations are historical records and never imply a luckier retailer."
        : route === "analytics"
          ? "You are in the Analytics Workbench. Use the views to compare relative data signals, not winning probability."
          : route === "saved"
            ? "You are in your private research library. Review saved profiles, notes, draw sets, and official verification links."
            : `You are reviewing ${game.name}. Start with freshness, prize depth, and comparable tickets.`,
  };
  return insights[mode] || insights.summary;
}

export function AIAssistantPanel(open, game, assistant = {}, route = "home") {
  const mode = assistant.mode || "summary";
  const messages = Array.isArray(assistant.messages) ? assistant.messages : [];
  return `<aside class="assistantPanel ${open ? "open" : ""}" aria-label="ScratchScope AI assistant" ${open ? "" : "inert"}>
    <header>
      <span>${assistantIcon()}</span>
      <div><small>ScratchScope AI</small><strong>Research copilot</strong></div>
      <button type="button" data-assistant-close aria-label="Close AI assistant">&times;</button>
    </header>
    <div class="assistantContext">
      <span>Current context</span>
      <strong>${game?.name || "Dashboard overview"}</strong>
      <small>Explanations use cached public data and relative research indices.</small>
    </div>
    <div class="assistantPrompts" role="group" aria-label="AI explanation prompts">
      ${[
        ["summary", "Explain this view"],
        ["compare", "Compare this game"],
        ["changed", "What changed?"],
        ["depth", "Explain prize depth"],
        ["freshness", "Stale data check"],
        ["similar", "Similar tickets"],
        ["budget", "Safer budget view"],
        ["odds", "Explain odds simply"],
        ["next", "Watchlist suggestion"],
        ["route", "Draw reminder summary"],
      ].map(([value, label]) => `<button type="button" class="${mode === value ? "active" : ""}" data-assistant-mode="${value}">${label}</button>`).join("")}
    </div>
    <article class="assistantAnswer">
      <span><i></i> Analysis complete</span>
      <p>${activeInsight(game, mode, route)}</p>
    </article>
    ${messages.length ? `<div class="assistantConversation">${messages.slice(-5).map((message) => `<article class="${message.role === "user" ? "user" : "assistant"}"><span>${message.role === "user" ? "You" : "ScratchScope"}</span><p>${escapeText(message.text)}</p></article>`).join("")}</div>` : ""}
    <form class="assistantComposer" data-assistant-form>
      <input data-assistant-query value="${escapeText(assistant.query || "")}" maxlength="180" placeholder="Ask about score, price, freshness, or next steps..." aria-label="Ask ScratchScope AI">
      <button type="submit">Ask</button>
    </form>
    <div class="assistantActions">
      ${game ? `<button type="button" data-assistant-action="detail" data-assistant-game="${game.id}">Open detail</button>
      <button type="button" data-assistant-action="watch" data-assistant-game="${game.id}">Watch ticket</button>
      <button type="button" data-assistant-action="compare" data-assistant-game="${game.id}">Compare</button>` : ""}
    </div>
    <div class="assistantSignals">
      <article><span>Confidence</span><strong>${game?.intelligence?.confidenceScore || 0}%</strong></article>
      <article><span>Freshness</span><strong>${game?.dataState || "Cached"}</strong></article>
      <article><span>Trend</span><strong>${game?.intelligence?.trend || "Stable"}</strong></article>
    </div>
    <p class="assistantGuardrail">No prediction guarantees. No strategy changes random lottery odds.</p>
  </aside>`;
}

export function ExportStudio(open) {
  if (!open) return "";
  return `<div class="featureModalBackdrop exportBackdrop" data-export-close>
    <section class="featureModal exportStudio" data-export-stop role="dialog" aria-modal="true" aria-labelledby="export-title">
      <header>
        <div><span>Output lab</span><h2 id="export-title">Export Studio</h2><p>Package the current intelligence view for review or reporting.</p></div>
        <button type="button" class="iconBtn" data-export-close aria-label="Close export studio">&times;</button>
      </header>
      <div class="exportGrid">
        <button type="button" data-export-format="png"><b>PNG</b><strong>Dashboard Snapshot</strong><span>Presentation-ready visual summary</span></button>
        <button type="button" data-export-format="csv"><b>CSV</b><strong>Game Intelligence</strong><span>Scores, prize depth, odds, and status</span></button>
        <button type="button" data-export-format="json"><b>JSON</b><strong>Complete Dataset</strong><span>Snapshot plus saved dashboard state</span></button>
        <button type="button" data-export-format="print"><b>PDF</b><strong>Executive Summary</strong><span>Print-optimized current dashboard</span></button>
        <button type="button" data-export-format="watchlist"><b>CSV</b><strong>Watchlist Report</strong><span>Only your saved scratch-off profiles</span></button>
        <button type="button" data-export-format="markdown"><b>MD</b><strong>Research Brief</strong><span>Portable plain-text executive summary</span></button>
      </div>
      <div class="exportFoot"><span>Exports include a responsible-play disclosure.</span><strong>Local only</strong></div>
    </section>
  </div>`;
}
