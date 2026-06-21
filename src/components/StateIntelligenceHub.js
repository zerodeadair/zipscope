import { featureLabels, stateResearchSummary } from "../data/stateLotteryResearch.js";

function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character]);
}

export function StateIntelligenceHub(open, states, query) {
  if (!open) return "";
  const safeQuery = escapeText(query);
  return `<div class="featureModalBackdrop" data-state-hub-backdrop>
    <section class="featureModal stateHubModal" data-modal-stop role="dialog" aria-modal="true" aria-labelledby="state-hub-title">
      <header class="featureModalHeader">
        <div><span>Official lottery landscape</span><h2 id="state-hub-title">${stateResearchSummary.reviewed}-state scratch-off intelligence</h2><p>See which official experiences offer prize tracking, deadlines, scanners, rewards, retailer tools, and more.</p></div>
        <button type="button" class="iconBtn" data-close-state-hub aria-label="Close state intelligence">&times;</button>
      </header>
      <div class="stateHubSummary">
        <article><strong>${stateResearchSummary.reviewed}</strong><span>official sites reviewed</span></article>
        <article><strong>${stateResearchSummary.connected}</strong><span>live app connector</span></article>
        <article><strong>10</strong><span>capability types mapped</span></article>
        <article><strong>${stateResearchSummary.lastReviewed}</strong><span>research date</span></article>
      </div>
      <label class="stateHubSearch"><span>Search states or capabilities</span><input data-state-query value="${safeQuery}" placeholder="Try California, scanner, rewards..." autofocus></label>
      <div class="stateHubGrid">
        ${states.length ? states.map((state) => `<article class="${state.status === "connected" ? "connected" : ""}">
          <div class="stateCardHead"><b>${state.code}</b><div><h3>${state.name}</h3><span>${state.status === "connected" ? "Connected NC data" : `${state.region} official portal`}</span></div></div>
          <p>${state.note}</p>
          <div class="stateFeatures">${state.features.map((feature) => `<span>${featureLabels[feature]}</span>`).join("")}</div>
          <a href="${state.url}" target="_blank" rel="noreferrer" data-official-link>Open official ${state.code} site</a>
        </article>`).join("") : `<div class="emptyState"><strong>No states match that search.</strong><span>Try a state name or a feature such as scanner, retailer, or second chance.</span></div>`}
      </div>
      <footer class="featureModalFooter">Only North Carolina ticket data is connected today. Other states link to their official portals and show researched capabilities, not simulated inventory.</footer>
    </section>
  </div>`;
}
