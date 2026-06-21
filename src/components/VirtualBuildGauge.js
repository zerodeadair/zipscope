const DEFAULT_YEAR = 2016;
const MIN_YEAR = 2010;

const MODULE_SCOPES = [
  ["entire", "Entire Application", 1],
  ["hub", "Lottery Hub", .16],
  ["scratch", "Scratch-Off Explorer", .24],
  ["draws", "Draw Games Center", .2],
  ["ai", "AI Insights Engine", .17],
  ["maps", "Maps", .1],
  ["analytics", "Analytics", .18],
  ["exports", "Export Studio", .09],
  ["dashboard", "Dashboard", .22],
  ["animations", "Animations", .08],
];

const BUILD_FACTORS = [
  "24 interface components",
  "8 route and page states",
  "3 structured lottery data sources",
  "7 service and API integrations",
  "18 charts and visualizations",
  "14 motion and interaction patterns",
  "13 AI decision helpers",
  "6 export workflows",
  "12 scratch-off game modules",
  "8 draw-game modules",
  "9 search and filter systems",
  "2 map and location systems",
  "18 audit and support checks",
  "Responsive desktop and mobile layouts",
  "Accessibility and focus management",
  "Offline service-worker support",
  "Persistent local workspace state",
];

const ENGINEERING_AREAS = [
  ["Frontend UI", 16, 93],
  ["Data Engineering", 10, 86],
  ["Lottery Logic", 10, 89],
  ["AI Tools", 8, 80],
  ["Visual Design", 8, 91],
  ["Animation", 4, 87],
  ["Testing", 7, 88],
  ["Performance", 4, 84],
  ["Exports", 3, 90],
  ["Navigation", 6, 94],
  ["Maintenance", 7, 82],
  ["Accessibility", 5, 92],
  ["Infrastructure", 5, 81],
  ["Security", 4, 84],
  ["Product Research", 3, 79],
];

const PROJECT_PROFILE = {
  components: 24,
  routes: 8,
  dataSources: 3,
  apiIntegrations: 7,
  visualizations: 18,
  animations: 14,
  aiFeatures: 13,
  exportFeatures: 6,
  scratchModules: 12,
  drawModules: 8,
  searchSystems: 9,
  mapSystems: 2,
  supportChecks: 18,
};

const COMPLEXITY_SIGNALS = [
  ["components", "UI components", 18],
  ["routes", "Routes and page states", 34],
  ["dataSources", "Data sources", 72],
  ["apiIntegrations", "API and service integrations", 58],
  ["visualizations", "Charts and visualizations", 15],
  ["animations", "Animation patterns", 12],
  ["aiFeatures", "AI helper features", 30],
  ["exportFeatures", "Export workflows", 24],
  ["scratchModules", "Scratch-off modules", 28],
  ["drawModules", "Draw-game modules", 32],
  ["searchSystems", "Search and filter systems", 22],
  ["mapSystems", "Map and location systems", 85],
  ["supportChecks", "Testing and support checks", 14],
];

const ROADMAP_FEATURES = [
  ["mobile", "Native Mobile App", 520, "12-16 weeks"],
  ["ai", "AI Assistant", 260, "6-8 weeks"],
  ["maps", "Live Maps", 180, "4-6 weeks"],
  ["analytics", "Advanced Analytics", 240, "6-8 weeks"],
  ["multi-user", "Multi-User", 320, "8-10 weeks"],
  ["subscriptions", "Subscriptions", 220, "5-7 weeks"],
  ["enterprise", "Enterprise Dashboard", 380, "9-12 weeks"],
  ["collaboration", "Collaboration", 300, "7-9 weeks"],
  ["api", "API Access", 190, "5-6 weeks"],
];

/**
 * @typedef {Object} BuildGaugeEstimate
 * @property {number} selectedYear
 * @property {2016} defaultYear
 * @property {2010} minYear
 * @property {number} maxYear
 * @property {number} minHours
 * @property {number} maxHours
 * @property {string} complexity
 * @property {string} confidence
 * @property {string} developerProfile
 * @property {string[]} factors
 */

function clampYear(year, maxYear) {
  return Math.min(maxYear, Math.max(MIN_YEAR, Number(year) || DEFAULT_YEAR));
}

function eraProfile(year) {
  if (year >= 2023) return {
    label: "AI-accelerated workflow",
    note: "Modern frameworks, cloud platforms, design systems, and coding assistants reduce repetitive implementation work.",
  };
  if (year >= 2020) return {
    label: "Cloud-native workflow",
    note: "Mature component frameworks, managed services, and stronger deployment tooling shorten the build cycle.",
  };
  if (year >= 2017) return {
    label: "Component framework era",
    note: "Modern front-end patterns and package ecosystems help, while most implementation remains manual.",
  };
  return {
    label: "Pre-AI development era",
    note: "More interface, testing, data, and deployment work is estimated as hands-on senior engineering time.",
  };
}

/**
 * Creates a conceptual senior-developer effort estimate for the selected tooling era.
 * @param {number} selectedYear
 * @param {number} [currentYear]
 * @returns {BuildGaugeEstimate & { intensity: number, era: { label: string, note: string } }}
 */
export function estimateBuildGauge(selectedYear, currentYear = new Date().getFullYear(), scopeId = "entire") {
  const maxYear = Math.max(MIN_YEAR, currentYear);
  const year = clampYear(selectedYear, maxYear);
  const span = Math.max(1, maxYear - MIN_YEAR);
  const progress = (year - MIN_YEAR) / span;
  const cloudAcceleration = Math.max(0, year - 2019) / Math.max(1, maxYear - 2019);
  const aiAcceleration = Math.max(0, year - 2022) / Math.max(1, maxYear - 2022);
  const effortFactor = Math.max(.22, 1 - (.42 * progress) - (.13 * cloudAcceleration) - (.23 * aiAcceleration));
  const scope = MODULE_SCOPES.find(([id]) => id === scopeId) || MODULE_SCOPES[0];
  const scopeFactor = scope[2];
  const detectedHours = COMPLEXITY_SIGNALS.reduce((sum, [key, , weight]) => sum + PROJECT_PROFILE[key] * weight, 0);
  const minHours = Math.max(20, Math.round((detectedHours * .72 * effortFactor * scopeFactor) / 10) * 10);
  const maxHours = Math.max(minHours + 20, Math.round((detectedHours * 1.04 * effortFactor * scopeFactor) / 10) * 10);
  const averageHours = Math.round((minHours + maxHours) / 2);
  const hourlyRate = Math.round(115 + (progress * 70));
  const replacementCost = averageHours * hourlyRate;
  const breakdown = ENGINEERING_AREAS.map(([label, percentage, confidence]) => ({
    label,
    percentage,
    confidence,
    hours: Math.max(5, Math.round((averageHours * percentage / 100) / 5) * 5),
  }));
  const complexityScore = Math.min(100, Math.round(54 + Math.log2(detectedHours / 100) * 6.2));
  const confidenceScore = Math.min(96, Math.round(
    68
    + Math.min(10, PROJECT_PROFILE.supportChecks / 2)
    + Math.min(8, PROJECT_PROFILE.dataSources * 2)
    + Math.min(7, PROJECT_PROFILE.components / 8)
  ));
  const increases = COMPLEXITY_SIGNALS
    .map(([key, label, weight]) => ({ label, count: PROJECT_PROFILE[key], hours: PROJECT_PROFILE[key] * weight }))
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 5);

  return {
    selectedYear: year,
    scopeId: scope[0],
    scopeLabel: scope[1],
    defaultYear: DEFAULT_YEAR,
    minYear: MIN_YEAR,
    maxYear,
    minHours,
    maxHours,
    averageHours,
    hourlyRate,
    replacementCost,
    enterpriseReplacementCost: Math.round(replacementCost * 2.4),
    aiAssistedHours: Math.max(12, Math.round((averageHours * .38) / 5) * 5),
    breakdown,
    profile: PROJECT_PROFILE,
    increases,
    detectedHours,
    complexityScore,
    confidenceScore,
    teamSize: Math.max(2, Math.ceil(averageHours / 320)),
    timelineWeeks: Math.max(8, Math.ceil(averageHours / 72)),
    ratings: {
      maintainability: Math.round(78 + progress * 14),
      scalability: Math.round(74 + progress * 17),
      aiReadiness: Math.round(38 + aiAcceleration * 58),
      architecture: Math.round(80 + progress * 11),
      complexity: Math.round(91 - progress * 9),
      innovation: Math.round(72 + progress * 22),
    },
    complexity: complexityScore >= 88 ? "Advanced" : complexityScore >= 72 ? "Substantial" : "Moderate",
    confidence: `${confidenceScore}%`,
    developerProfile: "Senior Software Developer (20 Years Experience)",
    factors: BUILD_FACTORS,
    intensity: Math.round(28 + (72 * effortFactor)),
    era: eraProfile(year),
  };
}

function gaugeIcon() {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 19a9 9 0 1 1 14 0M12 12l4-4M7.5 16h.01M16.5 16h.01M12 18h.01"/>
  </svg>`;
}

/**
 * Renders the floating development complexity control.
 * @param {{ open?: boolean, selectedYear?: number }} gaugeState
 */
export function VirtualBuildGauge(gaugeState = {}) {
  const scope = MODULE_SCOPES.some(([id]) => id === gaugeState.scope) ? gaugeState.scope : "entire";
  const estimate = estimateBuildGauge(gaugeState.selectedYear, new Date().getFullYear(), scope);
  const open = Boolean(gaugeState.open);
  const mode = ["compact", "expanded", "executive", "full"].includes(gaugeState.mode) ? gaugeState.mode : "compact";
  const selectedRoadmap = Array.isArray(gaugeState.roadmap) ? gaugeState.roadmap : [];
  const roadmap = ROADMAP_FEATURES.filter(([id]) => selectedRoadmap.includes(id));
  const roadmapHours = roadmap.reduce((sum, feature) => sum + feature[2], 0);
  const roadmapCost = roadmapHours * estimate.hourlyRate;
  const range = estimate.maxYear - estimate.minYear;
  const yearProgress = range ? ((estimate.selectedYear - estimate.minYear) / range) * 100 : 100;
  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const lastRecalculated = gaugeState.lastRecalculated
    ? new Date(gaugeState.lastRecalculated).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : "Not recalculated yet";
  const explainOpen = Boolean(gaugeState.explainOpen);

  return `<aside class="virtualBuildGauge ${open ? "open" : ""} mode-${mode}" aria-label="Development complexity gauge">
    <button type="button" class="buildGaugeToggle" data-build-gauge-toggle data-tooltip="Open the dynamic development-hours estimate, complexity score, confidence, cost, and module breakdown." data-tooltip-side="left" aria-expanded="${open}" aria-controls="build-gauge-panel">
      <span class="buildGaugeMiniRing" style="--gauge-value:${estimate.intensity * 3.6}deg">${gaugeIcon()}</span>
      <span><small>Build Gauge</small><strong>${open ? `${estimate.averageHours}h · ${mode}` : "Hidden"}</strong></span>
    </button>
    <section id="build-gauge-panel" class="buildGaugePanel" ${open ? "" : "hidden"}>
      <div class="buildGaugeHeader">
        <div>
          <span class="intelligenceLabel"><i></i> Pattern Analysis</span>
          <h2>Development Complexity Gauge</h2>
          <p>Senior Developer Build Estimate</p>
        </div>
        <button type="button" class="buildGaugeClose" data-build-gauge-toggle aria-label="Close development complexity gauge">&times;</button>
      </div>

      <div class="buildGaugeModes" role="tablist" aria-label="Build gauge view">
        ${[["compact", "Compact"], ["expanded", "Expanded"], ["executive", "Executive"], ["full", "Full Analysis"]].map(([value, label]) => `<button type="button" role="tab" aria-selected="${mode === value}" class="${mode === value ? "active" : ""}" data-build-gauge-mode="${value}">${label}</button>`).join("")}
      </div>

      <div class="buildScopeSelector" role="group" aria-label="Development estimate scope">
        ${MODULE_SCOPES.map(([id, label]) => `<button type="button" class="${scope === id ? "active" : ""}" data-build-gauge-scope="${id}" aria-pressed="${scope === id}">${label}</button>`).join("")}
      </div>

      <div class="buildGaugeHero">
        <div class="buildGaugeDial" style="--gauge-value:${estimate.intensity * 3.6}deg">
          <div><strong>${estimate.averageHours.toLocaleString()}</strong><span>senior dev hours</span></div>
        </div>
        <div class="buildGaugeSummary">
          <span>Selected tooling era</span>
          <strong>${estimate.selectedYear}</strong>
          <b>${estimate.era.label}</b>
          <small>${estimate.scopeLabel} &middot; ${estimate.minHours.toLocaleString()}-${estimate.maxHours.toLocaleString()} hour range</small>
        </div>
      </div>

      <p class="buildGaugeDescription">Complexity-weighted estimate using the detected ScratchScope module profile and tools available in the selected year.</p>

      <div class="buildGaugeYearControl">
        <div class="buildGaugeStepper" aria-label="Selected development year">
          <button type="button" data-build-gauge-year="-1" ${estimate.selectedYear <= estimate.minYear ? "disabled" : ""} aria-label="Previous year">&minus;</button>
          <output>${estimate.selectedYear}</output>
          <button type="button" data-build-gauge-year="1" ${estimate.selectedYear >= estimate.maxYear ? "disabled" : ""} aria-label="Next year">&plus;</button>
        </div>
        <input type="range" min="${estimate.minYear}" max="${estimate.maxYear}" value="${estimate.selectedYear}" data-build-gauge-range aria-label="Development tooling year" style="--year-progress:${yearProgress}%">
        <div class="buildGaugeRangeLabels"><span>${estimate.minYear}</span><span>${estimate.maxYear}</span></div>
      </div>

      <div class="buildGaugeMetrics">
        <article><span>Complexity</span><strong>${estimate.complexityScore}/100</strong><small>${estimate.complexity}</small></article>
        <article><span>Confidence</span><strong>${estimate.confidence}</strong><small>Profile coverage</small></article>
        <article><span>Estimated Cost</span><strong>${money.format(estimate.replacementCost)}</strong></article>
        <article><span>Last Recalculated</span><strong>${lastRecalculated}</strong></article>
      </div>

      <div class="buildGaugeActions">
        <button type="button" class="primary" data-build-gauge-recalculate>Recalculate Estimate</button>
        <button type="button" data-build-gauge-explain aria-expanded="${explainOpen}">Explain Estimate</button>
      </div>

      ${explainOpen ? `<section class="buildEstimateExplanation">
        <div class="buildSectionHead"><div><span>Estimate method</span><strong>Detected complexity model</strong></div><small>${estimate.detectedHours.toLocaleString()} weighted baseline hours</small></div>
        <p>ScratchScope weights its interface components, routes, data services, visualizations, AI helpers, exports, game modules, maps, search systems, and support checks. The selected year then adjusts implementation effort for the tooling available in that era.</p>
      </section>` : ""}

      <section class="buildModuleInventory">
        <div class="buildSectionHead"><div><span>Modules included</span><strong>${Object.values(estimate.profile).reduce((sum, value) => sum + value, 0)} detected signals</strong></div><small>Current project profile</small></div>
        <div>${[
          ["Components", estimate.profile.components],
          ["Routes", estimate.profile.routes],
          ["Data Sources", estimate.profile.dataSources],
          ["API Integrations", estimate.profile.apiIntegrations],
          ["Visualizations", estimate.profile.visualizations],
          ["AI Tools", estimate.profile.aiFeatures],
          ["Exports", estimate.profile.exportFeatures],
          ["Game Modules", estimate.profile.scratchModules + estimate.profile.drawModules],
          ["Search / Filters", estimate.profile.searchSystems],
          ["Maps", estimate.profile.mapSystems],
          ["Support Checks", estimate.profile.supportChecks],
        ].map(([label, value]) => `<span><b>${value}</b>${label}</span>`).join("")}</div>
      </section>

      <section class="buildIncreasePanel">
        <div class="buildSectionHead"><div><span>What increased hours?</span><strong>Largest complexity drivers</strong></div><small>Weighted contribution before era adjustment</small></div>
        <div>${estimate.increases.map((item) => `<article><span>${item.label}</span><strong>${item.count}</strong><i><b style="width:${Math.round(item.hours / estimate.increases[0].hours * 100)}%"></b></i><small>+${item.hours.toLocaleString()} weighted hours</small></article>`).join("")}</div>
      </section>

      <section class="buildTimeline">
        <div class="buildSectionHead"><div><span>Historical build timeline</span><strong>${estimate.scopeLabel}</strong></div><small>Equivalent effort by tooling era</small></div>
        <div>${[2010, 2016, 2020, 2023, estimate.maxYear].map((year) => {
          const point = estimateBuildGauge(year, estimate.maxYear, scope);
          return `<article class="${year === estimate.selectedYear ? "active" : ""}"><span>${year}</span><i><b style="height:${Math.max(18, Math.round(point.averageHours / estimateBuildGauge(2010, estimate.maxYear, scope).averageHours * 100))}%"></b></i><strong>${point.averageHours}h</strong></article>`;
        }).join("")}</div>
      </section>

      <div class="buildGaugeEraNote">
        <span>Data Hint</span>
        <p>${estimate.era.note}</p>
      </div>

      ${mode === "expanded" || mode === "full" ? `<section class="buildBreakdown">
        <div class="buildSectionHead"><div><span>Engineering breakdown</span><strong>${estimate.averageHours} total hours</strong></div><small>Confidence-weighted conceptual allocation</small></div>
        <div class="buildBreakdownRows">${estimate.breakdown.map((area) => `<article>
          <div><strong>${area.label}</strong><span>${area.hours}h · ${area.confidence}% confidence</span></div>
          <i><b style="width:${area.percentage}%"></b></i>
          <em>${area.percentage}%</em>
        </article>`).join("")}</div>
      </section>` : ""}

      ${mode === "executive" || mode === "full" ? `<section class="buildExecutive">
        <div class="buildSectionHead"><div><span>Executive model</span><strong>${money.format(estimate.replacementCost)} build value</strong></div><small>Senior product engineering estimate</small></div>
        <div class="executiveMetrics">
          <article><span>Team Size</span><strong>${estimate.teamSize}-${estimate.teamSize + 2}</strong><small>Cross-functional contributors</small></article>
          <article><span>Timeline</span><strong>${estimate.timelineWeeks}-${estimate.timelineWeeks + 4} wk</strong><small>Parallel delivery estimate</small></article>
          <article><span>Blended Rate</span><strong>${money.format(estimate.hourlyRate)}/h</strong><small>Conceptual replacement rate</small></article>
          <article><span>Enterprise Replacement</span><strong>${money.format(estimate.enterpriseReplacementCost)}</strong><small>Rebuild, governance, data, and operating overhead</small></article>
        </div>
        <div class="architectureRatings">${Object.entries(estimate.ratings).map(([label, value]) => `<article><span>${label.replace(/([A-Z])/g, " $1")}</span><strong>${value}</strong><i><b style="width:${value}%"></b></i></article>`).join("")}</div>
      </section>` : ""}

      ${mode === "full" ? `<section class="roadmapSimulator">
        <div class="buildSectionHead"><div><span>Roadmap simulator</span><strong>${roadmapHours ? `+${roadmapHours} hours` : "Select future features"}</strong></div><small>${roadmapHours ? `${money.format(roadmapCost)} additional cost` : "Model scope, cost, and timeline"}</small></div>
        <div class="roadmapOptions">${ROADMAP_FEATURES.map(([id, label, hours, timeline]) => `<button type="button" class="${selectedRoadmap.includes(id) ? "active" : ""}" data-roadmap-feature="${id}" aria-pressed="${selectedRoadmap.includes(id)}"><span>${label}</span><strong>+${hours}h</strong><small>${timeline}</small></button>`).join("")}</div>
        ${roadmapHours ? `<div class="roadmapTotals"><article><span>Additional Hours</span><strong>${roadmapHours}</strong></article><article><span>Additional Cost</span><strong>${money.format(roadmapCost)}</strong></article><article><span>Scope Items</span><strong>${roadmap.length}</strong></article></div>` : ""}
      </section>` : ""}

      <details class="buildGaugeFactors">
        <summary><span>Development factors</span><strong>${estimate.factors.length} signals</strong></summary>
        <div>${estimate.factors.map((factor) => `<span>${factor}</span>`).join("")}</div>
      </details>

      <p class="buildGaugeDisclaimer">Planning estimate only. It is not historical time tracking, an invoice, or a claim about exact development effort.</p>
    </section>
  </aside>`;
}
