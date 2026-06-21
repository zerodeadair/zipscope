const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function BudgetPlanner(state, plan) {
  return `<section class="panel budgetPanel">
    <div class="panelHead"><div><p>Responsible daily planner</p><h2>Budget Builder</h2></div><span>Stop at budget</span></div>
    <div class="budgetControls">
      <label>Daily budget<input type="number" min="0" data-budget="budget" value="${state.budget}"></label>
      <label>Max ticket<input type="number" min="1" data-budget="price" value="${state.price}"></label>
      <label>Goal<select data-budget="goal">
        ${["balanced", "jackpot", "low-cost", "best-odds", "best-value", "avoid-top-gone", "variety"].map((goal) => `<option value="${goal}" ${state.goal === goal ? "selected" : ""}>${goal.replaceAll("-", " ")}</option>`).join("")}
      </select></label>
    </div>
    <div class="budgetResult">
      <strong>${money.format(plan.totalCost)} suggested from ${money.format(plan.dailyBudget)} daily budget</strong>
      <span>Cached-data mix: ${plan.games.map((game) => game.name).join(", ") || "No games within this budget"}</span>
      <small>Remaining budget: ${money.format(plan.remaining)}. This is a budget organizer, not an odds advantage.</small>
    </div>
    <div class="budgetSuggestions">${plan.suggestions.map(({ game, reason }) => `<article data-detail="${game.id}"><img src="${game.imageUrl}" alt="${game.name} ticket"><div><strong>${game.name}</strong><span>$${game.price} · ${game.overallOdds} · Score ${game.intelligence.score}</span><small>${reason}</small></div></article>`).join("")}</div>
    <p class="fine">${plan.warning}</p>
  </section>`;
}
