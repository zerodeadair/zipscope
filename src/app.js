import { CompareGames } from "./components/CompareGames.js";
import { BudgetPlanner } from "./components/BudgetPlanner.js";
import { AIScoreExplainer } from "./components/AIScoreExplainer.js";
import { AIAssistantPanel, ExportStudio } from "./components/AIAssistantPanel.js";
import { ActivityButton, ActivityCenter } from "./components/ActivityCenter.js";
import { ActiveScratchDirectory, AllGamesExplorer } from "./components/AllGamesExplorer.js";
import { AnalyticsWorkbench } from "./components/AnalyticsWorkbench.js";
import { BetaFeatureModal, BetaLab, PinnedBetaWidgets, betaFeatures } from "./components/BetaLab.js";
import { CommandPalette, FloatingCommandDock } from "./components/CommandCenter.js";
import { DrawGamesDashboard } from "./components/DrawGamesDashboard.js";
import { GameDetailDrawer } from "./components/GameDetailDrawer.js";
import { HotZonePanel } from "./components/HotZonePanel.js";
import { LotteryHub } from "./components/LotteryHub.js";
import { ScratchCard } from "./components/ScratchCard.js";
import { SavedWorkspace } from "./components/SavedWorkspace.js";
import { StateIntelligenceHub } from "./components/StateIntelligenceHub.js";
import { TicketMatchmaker } from "./components/TicketMatchmaker.js";
import { VirtualBuildGauge } from "./components/VirtualBuildGauge.js";
import { ValueOpportunityBoard } from "./components/ValueOpportunityBoard.js";
import { initWinningLocationsMap, WinningLocationsMap } from "./components/WinningLocationsMap.js";
import { SettingsButton, WorkspaceSettings } from "./components/WorkspaceSettings.js";
import { featureLabels, stateLotteryResearch } from "./data/stateLotteryResearch.js";
import { generateSmartPick, getDrawSnapshot } from "./services/drawGameService.js";
import { getLotterySnapshot, filterGames } from "./services/lotteryDataService.js";
import { hotZones } from "./services/hotZoneService.js";
import { getLocationProfile, locationRecommendations } from "./services/locationIntelligenceService.js";
import { budgetPlan } from "./services/responsiblePlayService.js";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const key = "scratchscope-2035-kiosk-v9";
const root = document.querySelector("#root");
const snapshot = getLotterySnapshot();
const drawSnapshot = getDrawSnapshot();

let detailId = "";
let aiExplainId = "";
let matchmakerOpen = false;
let stateHubOpen = false;
let stateHubQuery = "";
let betaPreviewId = "";
let pendingScrollTarget = "";
let statusMessage = "";
let onlineState = navigator.onLine;
let activeModalKey = "";
let state = load();

function load() {
  const starter = {
    viewMode: "kiosk",
    query: "",
    libraryQuery: "",
    libraryFilter: "all",
    price: "all",
    status: "all",
    discoveryTab: "all",
    filtersOpen: false,
    minPrize: "",
    maxOdds: "",
    minTopRemaining: "",
    hideNoTop: false,
    newOnly: false,
    endingSoon: false,
    sort: "score",
    nav: "home",
    zip: "27617",
    glowMode: true,
    buildGauge: {
      open: false,
      selectedYear: 2016,
      mode: "compact",
      scope: "entire",
      roadmap: [],
      lastRecalculated: "",
      explainOpen: false,
    },
    command: { open: false, query: "" },
    assistant: { open: false, mode: "summary", query: "", messages: [] },
    exportOpen: false,
    recentViews: [],
    settingsOpen: false,
    activityOpen: false,
    settings: {
      density: "comfortable",
      cardView: "grid",
      fontScale: 120,
      contrast: "normal",
      motion: "system",
      ambient: true,
      readabilityVersion: 3,
    },
    activity: [],
    ticketNotes: {},
    valueBudget: 20,
    homeTab: "scratch",
    checkInDates: [],
    lastRefresh: "",
    compare: [],
    scratchWatchlist: [],
    scratchFavorites: [],
    beta: {
      pinned: [],
      enabled: ["new-game-pulse", "top-prize-tracker", "data-confidence"],
      query: "",
      category: "All",
    },
    matchmaker: { budget: "10", goal: "balanced", style: "balanced" },
    draw: {
      focusGameId: "cash-5",
      watchlist: ["cash-5"],
      compareDraws: ["cash-5", "powerball", "lucky-for-life"],
      pickMode: "balanced",
      generatedPick: null,
      savedPicks: [],
      pinnedPickId: "",
    },
    quickCompare: false,
    budget: { budget: 60, price: 20, goal: "balanced", lucky: 8, pickCount: 3 },
  };
  try {
    const saved = JSON.parse(localStorage.getItem(key));
    const next = {
      ...starter,
      ...saved,
      beta: { ...starter.beta, ...(saved?.beta || {}) },
      buildGauge: { ...starter.buildGauge, ...(saved?.buildGauge || {}) },
      command: { ...starter.command, ...(saved?.command || {}), open: false, query: "" },
      assistant: { ...starter.assistant, ...(saved?.assistant || {}) },
      settings: { ...starter.settings, ...(saved?.settings || {}) },
      matchmaker: { ...starter.matchmaker, ...(saved?.matchmaker || {}) },
      draw: { ...starter.draw, ...(saved?.draw || {}) },
    };
    const betaIds = new Set(betaFeatures.map((feature) => feature.id));
    next.buildGauge.open = Boolean(next.buildGauge.open);
    next.buildGauge.selectedYear = Math.min(new Date().getFullYear(), Math.max(2010, Number(next.buildGauge.selectedYear) || 2016));
    next.buildGauge.mode = ["compact", "expanded", "executive", "full"].includes(next.buildGauge.mode) ? next.buildGauge.mode : "compact";
    next.buildGauge.scope = ["entire", "hub", "scratch", "draws", "ai", "maps", "analytics", "exports", "dashboard", "animations"].includes(next.buildGauge.scope) ? next.buildGauge.scope : "entire";
    next.buildGauge.roadmap = Array.isArray(next.buildGauge.roadmap) ? [...new Set(next.buildGauge.roadmap)] : [];
    next.buildGauge.lastRecalculated = typeof next.buildGauge.lastRecalculated === "string" ? next.buildGauge.lastRecalculated : "";
    next.buildGauge.explainOpen = Boolean(next.buildGauge.explainOpen);
    next.recentViews = [...new Set(next.recentViews || [])].filter((id) => snapshot.games.some((game) => game.id === id)).slice(0, 8);
    next.settingsOpen = false;
    next.activityOpen = false;
    next.settings.density = ["comfortable", "compact", "executive"].includes(next.settings.density) ? next.settings.density : "comfortable";
    next.settings.cardView = ["grid", "list"].includes(next.settings.cardView) ? next.settings.cardView : "grid";
    if (Number(saved?.settings?.readabilityVersion || 0) < 3) {
      next.settings.fontScale = Math.max(120, Number(next.settings.fontScale) || 120);
      next.settings.readabilityVersion = 3;
    }
    next.settings.fontScale = [90, 100, 110, 120, 130].includes(Number(next.settings.fontScale)) ? Number(next.settings.fontScale) : 120;
    next.settings.contrast = ["normal", "high"].includes(next.settings.contrast) ? next.settings.contrast : "normal";
    next.settings.motion = ["system", "full", "reduced"].includes(next.settings.motion) ? next.settings.motion : "system";
    next.settings.ambient = next.settings.ambient !== false && next.settings.ambient !== "false";
    next.activity = Array.isArray(next.activity) ? next.activity.slice(0, 60) : [];
    next.libraryQuery = String(next.libraryQuery || "");
    next.libraryFilter = typeof next.libraryFilter === "string" ? next.libraryFilter : "all";
    next.ticketNotes = next.ticketNotes && typeof next.ticketNotes === "object" ? next.ticketNotes : {};
    next.valueBudget = [10, 20, 30, 50].includes(Number(next.valueBudget)) ? Number(next.valueBudget) : 20;
    next.assistant.messages = Array.isArray(next.assistant.messages) ? next.assistant.messages.slice(-12) : [];
    next.beta.pinned = [...new Set(next.beta.pinned || [])].filter((id) => betaIds.has(id));
    next.beta.enabled = [...new Set(next.beta.enabled || [])].filter((id) => betaIds.has(id));
    next.compare = next.compare.filter((id) => snapshot.games.some((game) => game.id === id));
    next.scratchWatchlist = (next.scratchWatchlist || []).filter((id) => snapshot.games.some((game) => game.id === id));
    next.scratchFavorites = (next.scratchFavorites || []).filter((id) => snapshot.games.some((game) => game.id === id));
    next.draw.watchlist = next.draw.watchlist.filter((id) => drawSnapshot.games.some((game) => game.gameId === id));
    next.draw.compareDraws = next.draw.compareDraws.filter((id) => drawSnapshot.games.some((game) => game.gameId === id));
    next.draw.pickMode = ["balanced", "spread", "random"].includes(next.draw.pickMode) ? next.draw.pickMode : "random";
    next.draw.savedPicks = next.draw.savedPicks.filter((pick) => {
      const game = drawSnapshot.games.find((item) => item.gameId === pick.gameId);
      if (!game || !Array.isArray(pick.numbers)) return false;
      const max = game.maxNumber || (game.gameId.includes("pick-") ? 9 : 69);
      const expected = game.pickCount || (game.gameId === "pick-3" ? 3 : game.gameId === "pick-4" ? 4 : 5);
      return pick.numbers.length === expected && pick.numbers.every((number) => Number.isInteger(number) && number >= (game.allowZero ? 0 : 1) && number <= max);
    });
    if (!drawSnapshot.games.some((game) => game.gameId === next.draw.focusGameId)) next.draw.focusGameId = drawSnapshot.games[0]?.gameId || "";
    localStorage.setItem(key, JSON.stringify(next));
    return next;
  }
  catch { return starter; }
}

function setState(patch, scrollTarget = "") {
  pendingScrollTarget = scrollTarget || pendingScrollTarget;
  state = { ...state, ...patch };
  localStorage.setItem(key, JSON.stringify(state));
  render();
}

function navigateTo(nav) {
  setState({ nav });
  window.requestAnimationFrame(() => {
    root.querySelector("#main-content")?.focus({ preventScroll: true });
    window.setTimeout(() => {
      const page = document.documentElement;
      const previousScrollBehavior = page.style.scrollBehavior;
      page.style.scrollBehavior = "auto";
      window.scrollTo(0, 0);
      page.scrollTop = 0;
      document.body.scrollTop = 0;
      page.style.scrollBehavior = previousScrollBehavior;
    }, 80);
  });
}

function showAllGames(filter = "all") {
  setState({
    nav: "allgames",
    libraryQuery: "",
    libraryFilter: filter,
    query: "",
    price: "all",
    status: "all",
    discoveryTab: "all",
    minPrize: "",
    maxOdds: "",
    minTopRemaining: "",
    hideNoTop: false,
    newOnly: false,
    endingSoon: false,
    sort: "score",
    filtersOpen: false,
    quickCompare: false,
    compare: [],
  });
  window.setTimeout(() => {
    window.scrollTo(0, 0);
    root.querySelector("#main-content")?.focus({ preventScroll: true });
  }, 80);
}

function openActiveScratchDirectory() {
  setState({
    nav: "scratch",
    query: "",
    price: "all",
    status: "all",
    discoveryTab: "all",
    minPrize: "",
    maxOdds: "",
    minTopRemaining: "",
    hideNoTop: false,
    newOnly: false,
    endingSoon: false,
    sort: "score",
    filtersOpen: false,
    quickCompare: false,
  }, ".activeScratchDirectory");
}

function activityEntry(type, title, detail, gameId = "") {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title,
    detail,
    gameId,
    at: new Date().toISOString(),
    read: false,
  };
}

function withActivity(patch, entry) {
  return {
    ...patch,
    activity: [entry, ...(state.activity || [])].slice(0, 60),
  };
}

function assistantResponse(query, game) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return "Ask about a ticket score, price, freshness, prize depth, comparison, draw schedule, or the current workspace.";
  if (normalized.includes("changed") || normalized.includes("refresh")) return `${game.name} currently shows ${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes} top prizes and a ${game.intelligence.trend.toLowerCase()} trend. ScratchScope cannot confirm a change until a newer official snapshot is loaded.`;
  if (normalized.includes("depth")) return `${game.name} has a prize-depth score of ${game.intelligence.prizeHealthScore}/100 across the displayed cached tiers. It summarizes visible inventory depth, not the complete payout table or expected value.`;
  if (normalized.includes("odds") || normalized.includes("simple")) return `${game.name} lists ${game.overallOdds} overall odds. In plain English, that is the game's published average across all tickets; timing, location, and strategy do not change a random ticket's odds.`;
  if (normalized.includes("fresh") || normalized.includes("stale") || normalized.includes("update")) return `${game.name} is marked ${game.dataState.toLowerCase()} with ${game.intelligence.confidenceScore}% model confidence. Treat it as stale when the official page shows newer inventory or the cached verification date is no longer current.`;
  if (normalized.includes("price") || normalized.includes("cost") || normalized.includes("budget")) return `${game.name} costs $${game.price}. Compare it with similarly priced games and set a hard entertainment budget before choosing any ticket.`;
  if (normalized.includes("top") || normalized.includes("prize")) return `${game.intelligence.topPrizesRemaining} of ${game.intelligence.originalTopPrizes} top prizes are visible for ${game.name} in the cached table. Displayed lower tiers may be incomplete.`;
  if (normalized.includes("compare") || normalized.includes("similar")) return `Compare ${game.name} with tickets near $${game.price}. Check ticket cost, published odds, top-prize visibility, displayed prize depth, and freshness side by side; no score guarantees a better outcome.`;
  if (normalized.includes("watch")) return `Watch ${game.name} only if you want to monitor its official inventory and freshness. A useful watchlist stays small, price-aware, and tied to a fixed entertainment budget.`;
  if (normalized.includes("best value")) return `${game.name}'s value signal is ${game.intelligence.bestBuyScore}/100. That is a relative comparison of cost and cached prize signals, not a promise of positive value or a win.`;
  if (normalized.includes("why") || normalized.includes("score")) return `${game.name} scores ${game.intelligence.score}/100 because of its current mix of visible inventory, top-prize ratio, published odds, ticket cost, and data confidence. The score is a research index, not a win probability.`;
  if (normalized.includes("draw")) return `Open Draw Intelligence for official schedules, cached jackpots, sales cutoffs, result history, and saved-number organization. Number patterns remain entertainment-only.`;
  if (normalized.includes("location") || normalized.includes("nearby") || normalized.includes("store")) return `Location views organize sourced historical winner articles. A retailer with past wins is not more likely to sell a future winner.`;
  return `For ${game.name}, the strongest next step is to verify the official prize table, inspect the prize-depth ladder, and compare its ${game.intelligence.score} score with similarly priced tickets.`;
}

function updateCountdowns() {
  root.querySelectorAll("[data-draw-countdown]").forEach((node) => {
    if (node.dataset.drawStatus === "ended" || !node.dataset.drawCountdown) {
      node.textContent = "Game ended";
      return;
    }
    const diff = new Date(node.dataset.drawCountdown).getTime() - Date.now();
    if (diff <= 0) {
      node.textContent = "Verify next drawing";
      return;
    }
    const totalMinutes = Math.floor(diff / 60000);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    node.textContent = days ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
  });
}

function interactionPulse(kind = "tap") {
  document.dispatchEvent(new CustomEvent("scratchscope:interaction", { detail: { kind } }));
  if (navigator.vibrate && window.matchMedia("(pointer: coarse)").matches) navigator.vibrate(kind === "success" ? [12, 20, 12] : 8);
}

function showStatus(message) {
  statusMessage = message;
  render();
  window.clearTimeout(showStatus.timer);
  showStatus.timer = window.setTimeout(() => {
    statusMessage = "";
    render();
  }, 2600);
}

function scrollToTarget(selector) {
  if (!selector) return;
  setTimeout(() => {
    const target = root.querySelector(selector);
    if (!target) return;
    const page = document.documentElement;
    const previousScrollBehavior = page.style.scrollBehavior;
    page.style.scrollBehavior = "auto";
    target.scrollIntoView({ behavior: "auto", block: "start" });
    page.style.scrollBehavior = previousScrollBehavior;
  }, 80);
}

function openGameDetail(id) {
  const game = snapshot.games.find((item) => item.id === id);
  if (!game) return;
  detailId = id;
  state = {
    ...state,
    recentViews: [id, ...(state.recentViews || []).filter((item) => item !== id)].slice(0, 8),
    command: { ...state.command, open: false, query: "" },
    activity: [activityEntry("view", `Viewed ${game.name}`, `$${game.price} ticket · Score ${game.intelligence.score}`, id), ...(state.activity || [])].slice(0, 60),
  };
  localStorage.setItem(key, JSON.stringify(state));
  render();
}

function closeCommandPalette() {
  setState({ command: { ...state.command, open: false, query: "" } });
}

function downloadBlob(contents, type, filename) {
  const blob = contents instanceof Blob ? contents : new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function exportCsv() {
  const columns = ["Game", "Number", "Price", "Top Prize", "Top Remaining", "Top Original", "Overall Odds", "Score", "Trend", "Confidence", "Status", "Data State"];
  const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = snapshot.games.map((game) => [
    game.name,
    game.number,
    game.price,
    game.topPrizeAmount,
    game.intelligence.topPrizesRemaining,
    game.intelligence.originalTopPrizes,
    game.overallOdds,
    game.intelligence.score,
    game.intelligence.trend,
    game.intelligence.confidenceScore,
    game.status,
    game.dataState,
  ]);
  downloadBlob([columns, ...rows].map((row) => row.map(quote).join(",")).join("\r\n"), "text/csv;charset=utf-8", "scratchscope-game-intelligence.csv");
}

function exportWatchlistCsv() {
  const watched = state.scratchWatchlist.map((id) => snapshot.games.find((game) => game.id === id)).filter(Boolean);
  const columns = ["Game", "Price", "Score", "Trend", "Top Prize", "Top Remaining", "Overall Odds", "Note", "Official Source"];
  const quote = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const rows = watched.map((game) => [
    game.name,
    game.price,
    game.intelligence.score,
    game.intelligence.trend,
    game.topPrizeAmount,
    game.intelligence.topPrizesRemaining,
    game.overallOdds,
    state.ticketNotes[game.id] || "",
    game.sourceUrl,
  ]);
  downloadBlob([columns, ...rows].map((row) => row.map(quote).join(",")).join("\r\n"), "text/csv;charset=utf-8", "scratchscope-watchlist.csv");
}

function exportResearchBrief() {
  const best = topGame();
  const watched = state.scratchWatchlist.map((id) => snapshot.games.find((game) => game.id === id)).filter(Boolean);
  const lines = [
    "# ScratchScope Research Brief",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Data status: ${snapshot.dataHealth.status}`,
    `Last verified: ${snapshot.dataHealth.lastVerified}`,
    "",
    "## Strongest Current Signal",
    "",
    `- Game: ${best.name}`,
    `- Ticket: $${best.price}`,
    `- Research score: ${best.intelligence.score}/100`,
    `- Published odds: ${best.overallOdds}`,
    `- Visible top prizes: ${best.intelligence.topPrizesRemaining}/${best.intelligence.originalTopPrizes}`,
    `- Summary: ${best.intelligence.summary}`,
    "",
    "## Watchlist",
    "",
    ...(watched.length ? watched.map((game) => `- ${game.name}: score ${game.intelligence.score}, $${game.price}, ${game.overallOdds}, ${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes} top prizes${state.ticketNotes[game.id] ? ` — Note: ${state.ticketNotes[game.id]}` : ""}`) : ["- No watched tickets"]),
    "",
    "## Responsible Use",
    "",
    "Lottery outcomes are random. ScratchScope organizes public-data fields and relative research indices. It does not predict wins or improve odds. Verify official sources before play.",
  ];
  downloadBlob(lines.join("\r\n"), "text/markdown;charset=utf-8", "scratchscope-research-brief.md");
}

function exportDashboardPng() {
  const canvas = document.createElement("canvas");
  canvas.width = 1600;
  canvas.height = 1000;
  const context = canvas.getContext("2d");
  const best = topGame();
  const gradient = context.createLinearGradient(0, 0, 1600, 1000);
  gradient.addColorStop(0, "#eaf8fb");
  gradient.addColorStop(.55, "#f7fbfd");
  gradient.addColorStop(1, "#fff4db");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#103448";
  context.font = "800 64px system-ui";
  context.fillText("ScratchScope Intelligence", 100, 130);
  context.fillStyle = "#5c7784";
  context.font = "28px system-ui";
  context.fillText(`NC Lottery research snapshot · ${new Date().toLocaleString()}`, 100, 180);
  context.fillStyle = "rgba(255,255,255,.82)";
  context.strokeStyle = "rgba(25,111,140,.15)";
  context.lineWidth = 2;
  context.beginPath();
  context.roundRect(100, 240, 1400, 520, 40);
  context.fill();
  context.stroke();
  context.fillStyle = "#168ca4";
  context.font = "800 24px system-ui";
  context.fillText("STRONGEST CURRENT PUBLIC-DATA SIGNAL", 160, 320);
  context.fillStyle = "#103448";
  context.font = "800 76px system-ui";
  context.fillText(best.name, 160, 420);
  context.font = "800 112px system-ui";
  context.fillText(String(best.intelligence.score), 160, 580);
  context.fillStyle = "#64808d";
  context.font = "26px system-ui";
  context.fillText("RESEARCH SCORE", 160, 625);
  const facts = [
    ["Top Prize", money.format(best.topPrizeAmount)],
    ["Top Prizes", `${best.intelligence.topPrizesRemaining}/${best.intelligence.originalTopPrizes}`],
    ["Overall Odds", best.overallOdds],
    ["Trend", best.intelligence.trend],
  ];
  facts.forEach(([label, value], index) => {
    const x = 520 + (index % 2) * 450;
    const y = 390 + Math.floor(index / 2) * 170;
    context.fillStyle = "#64808d";
    context.font = "700 22px system-ui";
    context.fillText(label.toUpperCase(), x, y);
    context.fillStyle = "#103448";
    context.font = "800 42px system-ui";
    context.fillText(String(value), x, y + 58);
  });
  context.fillStyle = "#52717f";
  context.font = "24px system-ui";
  context.fillText("Lottery outcomes are random. Analysis does not predict wins or improve odds. Verify official sources.", 100, 890);
  canvas.toBlob((blob) => {
    if (blob) downloadBlob(blob, "image/png", "scratchscope-dashboard-snapshot.png");
  }, "image/png");
}

function runExport(format) {
  if (format === "csv") exportCsv();
  if (format === "json") downloadBlob(JSON.stringify({ exportedAt: new Date().toISOString(), snapshot, state }, null, 2), "application/json", "scratchscope-current-dataset.json");
  if (format === "png") exportDashboardPng();
  if (format === "print") window.print();
  if (format === "watchlist") exportWatchlistCsv();
  if (format === "markdown") exportResearchBrief();
  setState(withActivity({ exportOpen: false }, activityEntry("export", `${format.toUpperCase()} export prepared`, "Generated locally from the current ScratchScope workspace.")));
  showStatus(format === "print" ? "Print view opened for PDF export." : `${format.toUpperCase()} export prepared.`);
}

function icon(name) {
  const paths = {
    scan: "M4 7V4h3M17 4h3v3M20 17v3h-3M7 20H4v-3M8 12h8M12 8v8",
    map: "M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Zm0-15v15m6-12v15",
    shield: "M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z",
    bolt: "M13 2 4 14h7l-1 8 9-12h-7l1-8Z",
    ticket: "M4 7a3 3 0 0 0 3-3h10a3 3 0 0 0 3 3v10a3 3 0 0 0-3 3H7a3 3 0 0 0-3-3V7Z",
    wallet: "M4 7h14a2 2 0 0 1 2 2v8H4V7Zm12 5h4",
    data: "M5 7c0-2 14-2 14 0s-14 2-14 0Zm0 0v10c0 2 14 2 14 0V7",
    search: "M11 19a8 8 0 1 1 5.7-2.4L21 21",
    sparkle: "M12 3l1.7 5.1L19 10l-5.3 1.9L12 17l-1.7-5.1L5 10l5.3-1.9L12 3ZM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z",
    trophy: "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Zm0 2H4v2a3 3 0 0 0 3 3m10-5h3v2a3 3 0 0 1-3 3",
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${paths[name] || paths.bolt}"/></svg>`;
}

function navRail() {
  const items = [
    ["home", "Home", "sparkle", "Return to the main intelligence dashboard and today's strongest signals."],
    ["allgames", "All Games", "scan", "Browse every supported scratch-off and draw game in one library."],
    ["scratch", "Active", "ticket", "Open active scratch-offs with filters, rankings, and prize-depth details."],
    ["draws", "Draws", "trophy", "Review draw schedules, cached jackpots, reminders, and saved number sets."],
    ["hotzones", "Zones", "map", "Explore sourced historical winner locations. Past wins do not predict future wins."],
    ["saved", "Saved", "wallet", "Open your watchlist, pinned tickets, notes, and saved draw sets."],
    ["analytics", "Insights", "data", "Compare games, inspect data quality, and review responsible AI explanations."],
    ["beta", "Beta", "sparkle", "Preview optional ScratchScope experiments and dashboard tools."],
  ];
  return `<nav class="mainNav floatingNavRail" aria-label="ScratchScope navigation">${items.map(([id, label, iconName, help]) => `<button class="${state.nav === id ? "active" : ""}" data-nav="${id}" data-tooltip="${help}" data-tooltip-side="right" aria-label="${label}" ${state.nav === id ? 'aria-current="page"' : ""}>${icon(iconName)}<span>${label}</span></button>`).join("")}</nav>`;
}

function workspaceContextBar() {
  const routes = {
    home: ["Dashboard", "Overview"],
    allgames: ["Game Library", "All Games"],
    scratch: ["Game Library", "Active Scratch-Offs"],
    draws: ["Game Library", "Draw Games"],
    hotzones: ["Research", "Location Intelligence"],
    saved: ["Workspace", "Watchlist"],
    analytics: ["Research", "AI Insights"],
    beta: ["Workspace", "Beta Lab"],
  };
  const [group, label] = routes[state.nav] || routes.home;
  const jumps = state.nav === "scratch"
    ? [["#discovery-title", "Recommendations"], [".activeScratchDirectory", "Directory"], [".comparePanel", "Compare"]]
    : state.nav === "home"
      ? [["#home-intelligence-title", "Today"], [".valueOpportunityBoard", "Best Value"], [".lotteryHub", "Lottery Hub"]]
      : state.nav === "analytics"
        ? [[".analyticsWorkbench", "Workbench"], [".comparePanel", "Compare"], [".dataCenter", "Sources"]]
        : [];
  return `<section class="workspaceContextBar" aria-label="Current workspace">
    <div class="breadcrumbPills">
      <button type="button" data-nav="home">${icon("sparkle")} Dashboard</button>
      <span>${group}</span>
      <strong>${label}</strong>
    </div>
    <div class="contextJumpMenu">
      ${jumps.map(([target, jumpLabel]) => `<button type="button" data-section-jump="${target}">${jumpLabel}</button>`).join("")}
      <button type="button" data-show-all>Show All</button>
      <button type="button" data-dock-action="gauge">Development Gauge</button>
    </div>
  </section>`;
}

function topGame(predicate = () => true, sorter = (a, b) => b.intelligence.score - a.intelligence.score) {
  return [...snapshot.games].filter(predicate).sort(sorter)[0] || snapshot.games[0];
}

function uniqueGames(games, limit) {
  const seen = new Set();
  return games.filter((game) => {
    if (!game || seen.has(game.id)) return false;
    seen.add(game.id);
    return true;
  }).slice(0, limit);
}

function topPrizeLine(game) {
  return `${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes}`;
}

function heroPick(label, game, reason) {
  return `<article class="heroPick" data-detail="${game.id}">
    <img src="${game.imageUrl}" alt="${game.name} ticket">
    <div><span>${label}</span><strong>${game.name}</strong><small>${reason}</small></div>
    <b>${game.intelligence.score}</b>
  </article>`;
}

function statusPick(label, title, reason) {
  return `<article class="heroPick statusOnly">
    <div><span>${label}</span><strong>${title}</strong><small>${reason}</small></div>
    <b>!</b>
  </article>`;
}

function header() {
  const location = getLocationProfile(state.zip);
  return `<header class="kioskHeader">
    <div class="kioskBrand"><span>${icon("scan")}</span><div><strong>ScratchScope</strong><small>Lottery intelligence / AI Command Center</small></div></div>
    <div class="headerTools">
      <button type="button" class="allGamesHeaderButton" data-show-all aria-label="Show all lottery games">${icon("ticket")}<span><b>All Games</b><small>Show All</small></span></button>
      <button type="button" class="headerCommandButton" data-command-open aria-label="Open command palette">${icon("search")}<span>Search</span><kbd>Ctrl K</kbd></button>
      ${ActivityButton(state.activity)}
      ${SettingsButton(state.settings)}
      <button type="button" class="stateHubButton" data-open-state-hub aria-label="Explore official scratch-off features across 29 states">${icon("map")} 29 States</button>
      <label class="zipKiosk"><span>${location.city}</span><input id="zip" value="${state.zip}" maxlength="5" inputmode="numeric" autocomplete="postal-code" aria-label="ZIP code"><button data-apply-zip>Go</button></label>
      <button class="glowToggle ${state.glowMode ? "active" : ""}" data-glow-toggle aria-pressed="${state.glowMode}" aria-label="Toggle casino glow mode">${icon("sparkle")} Glow</button>
      <button class="themeToggle" data-theme-toggle aria-label="Switch to ${document.documentElement.dataset.theme === "night" ? "Daytime" : "Nighttime"} theme">${document.documentElement.dataset.theme === "night" ? `${icon("sparkle")} Day` : `${icon("bolt")} Night`}</button>
    </div>
  </header>`;
}

function aiIntelligenceRibbon() {
  return `<section class="intelligenceRibbon" aria-label="AI intelligence status">
    <div><span><i></i> AI Insight</span><strong>Analysis Complete</strong></div>
    <div><span><i></i> Smart Scan</span><strong>${snapshot.games.length} tickets indexed</strong></div>
    <div><span><i></i> Pattern Analysis</span><strong>Historical indicators active</strong></div>
    <div><span><i></i> Trend Monitor</span><strong>Observations, not predictions</strong></div>
  </section>`;
}

function engagementStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const dates = [...new Set(state.checkInDates || [])].sort().reverse();
  let streak = 0;
  const cursor = new Date(`${today}T12:00:00`);
  for (let index = 0; index < 30; index += 1) {
    const keyDate = cursor.toISOString().slice(0, 10);
    if (!dates.includes(keyDate)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { checked: dates.includes(today), streak, today };
}

function homeQuickTabs() {
  const tabs = [
    ["scratch", "Scratch-Offs", "ticket"],
    ["draws", "Draw Games", "trophy"],
    ["hotzones", "Hot Zones", "map"],
    ["new", "New Tickets", "sparkle"],
    ["favorites", "Favorites", "wallet"],
  ];
  return `<div class="homeQuickTabs" role="tablist" aria-label="Home intelligence views">
    ${tabs.map(([value, label, iconName]) => `<button type="button" role="tab" aria-selected="${state.homeTab === value}" class="${state.homeTab === value ? "active" : ""}" data-home-tab="${value}">${icon(iconName)}<span>${label}</span></button>`).join("")}
  </div>`;
}

function todayBestPlays() {
  const location = getLocationProfile(state.zip);
  const best = topGame();
  const jackpot = topGame((game) => game.intelligence.topPrizesRemaining > 0, (a, b) => b.topPrizeAmount - a.topPrizeAmount);
  const value = topGame((game) => game.price <= 10, (a, b) => b.intelligence.valuePerDollar - a.intelligence.valuePerDollar);
  const picks = uniqueGames([best, value, jackpot, ...snapshot.games], 3);
  const streak = engagementStreak();
  return `<section class="todayPlaysHero" aria-labelledby="today-best-plays">
    <div class="todayPlaysCopy">
      <div class="liveLine"><span class="liveDot"></span><strong>Official cached snapshot</strong><small>${snapshot.dataHealth.lastVerified}</small></div>
      <span class="heroKicker">${icon("sparkle")} AI Insight / ${location.city} intelligence</span>
      <h1 id="today-best-plays">Today's Best Plays</h1>
      <p>Today's strongest ticket signals.</p>
      <div class="heroControls">
        <button type="button" class="refreshButton" data-refresh><span>${icon("data")}</span>${state.lastRefresh ? "Checked just now" : "Check data"}</button>
        <button type="button" class="checkInButton ${streak.checked ? "checked" : ""}" data-check-in>${streak.checked ? "Checked in" : "Daily check-in"} <b>${streak.streak} day${streak.streak === 1 ? "" : "s"}</b></button>
      </div>
      <div class="locationPills" aria-label="Quick locations">
        <button type="button" class="${state.zip.startsWith("276") ? "active" : ""}" data-quick-zip="27617">Raleigh</button>
        <button type="button" class="${state.zip.startsWith("270") ? "active" : ""}" data-quick-zip="27030">Mount Airy</button>
      </div>
    </div>
    <div class="revealDeck">
      ${picks.map((game, index) => `<article class="revealCard ${index === 0 ? "lead" : ""}" data-detail="${game.id}" style="--reveal:${index}">
        <div class="revealTicket"><img src="${game.imageUrl}" alt="${game.name} ticket"><span>$${game.price}</span></div>
        <div class="revealInfo">
          <em>${index === 0 ? "Smart Pick" : index === 1 ? "Hot Ticket" : "High Prize Left"}</em>
          <strong>${game.name}</strong>
          <div class="revealSignalGrid">
            <span class="revealPrizeSignal"><small>Top left</small><b>${topPrizeLine(game)}</b><i><u style="width:${Math.round(game.intelligence.topRatio * 100)}%"></u></i></span>
            <span class="revealHeatSignal"><small>Strength</small><b>${game.intelligence.score >= 88 ? "Elite" : game.intelligence.score >= 80 ? "Hot" : "Strong"}</b><i><u style="width:${game.intelligence.score}%"></u></i></span>
          </div>
        </div>
        <b class="scoreRing" style="--ring:${game.intelligence.score * 3.6}deg">${game.intelligence.score}</b>
      </article>`).join("")}
    </div>
  </section>`;
}

function homeTabPanel() {
  if (state.homeTab === "draws") return DrawGamesDashboard(drawSnapshot, state.draw);
  if (state.homeTab === "hotzones") return `<section class="split">${WinningLocationsMap(snapshot.winners)}${HotZonePanel(hotZones(snapshot.winners))}</section>`;
  if (state.homeTab === "new") {
    const games = sortGames(snapshot.games.filter((game) => game.isCurrentRelease));
    return ticketWall(games);
  }
  if (state.homeTab === "favorites") return favoritesSection();
  return premiumCommandCenter();
}

function featuredTicket(game, label, reason, spotlight = false) {
  return `<article class="featuredTicket ${spotlight ? "spotlight" : ""}" data-detail="${game.id}" title="Tap to inspect ${game.name}">
    <div class="featuredImage">
      <img src="${game.imageUrl}" alt="${game.name} scratch-off ticket">
      <span>$${game.price}</span>
      <b>${game.intelligence.score}</b>
    </div>
    <div class="featuredBody">
      <div><em>${label}</em><h3>${game.name}</h3><small>Tap to inspect</small></div>
      <div class="featuredStats">
        <div><span>Top Prize</span><strong>${money.format(game.topPrizeAmount)}</strong></div>
        <div><span>Top Left</span><strong>${topPrizeLine(game)}</strong></div>
      </div>
      <div class="featureChips"><span>${reason}</span><span>Score ${game.intelligence.score}</span></div>
      <div class="featuredActions">
        <button type="button" data-compare="${game.id}" title="Add ${game.name} to compare">Compare</button>
        <a href="${game.sourceUrl}" target="_blank" rel="noreferrer" data-official-link title="Open official NC Lottery source">Official</a>
      </div>
    </div>
  </article>`;
}

function microBars(value, tone = "stable", count = 8) {
  const active = Math.max(1, Math.min(count, Math.round((Number(value) / 100) * count)));
  return `<span class="microBars tone-${tone}" aria-hidden="true">${Array.from({ length: count }, (_, index) => `<i class="${index < active ? "on" : ""}"></i>`).join("")}</span>`;
}

function commandBoard(best, hotArea) {
  return `<div class="commandBoard">
    <article class="signal-strong"><div><span>Active Games</span><strong>${snapshot.stats.activeGames}</strong></div>${microBars(Math.min(100, snapshot.stats.activeGames * 8), "strong")}</article>
    <article class="signal-stable"><div><span>Top Prizes</span><strong>${snapshot.stats.topPrizesLeft}</strong></div>${microBars(Math.min(100, snapshot.stats.topPrizesLeft * 8), "stable")}</article>
    <article class="signal-gold"><div><span>Top Prize</span><strong>${money.format(snapshot.stats.biggestTopPrize)}</strong></div><span class="miniPrizeMeter"><i style="width:100%"></i></span></article>
    <article class="signal-new"><div><span>New Games</span><strong>${snapshot.stats.newGames}</strong></div><span class="pulseDots" aria-hidden="true">${Array.from({ length: Math.min(7, snapshot.stats.newGames) }, () => "<i></i>").join("")}</span></article>
    <article class="signal-score"><div><span>Best Profile</span><strong>${best.name}</strong></div><b class="miniScoreRing" style="--mini-score:${best.intelligence.score * 3.6}deg">${best.intelligence.score}</b></article>
    <article class="signal-local"><div><span>Near ZIP</span><strong>${hotArea}</strong></div><span class="locationSignal" aria-hidden="true"><i></i><i></i><i></i></span></article>
  </div>`;
}

function dayPartContext() {
  const hour = new Date().getHours();
  if (hour < 12) return { label: "Morning discovery", message: "Review new releases and overnight data changes." };
  if (hour < 18) return { label: "Afternoon research", message: "Compare active tickets and check your saved shortlist." };
  return { label: "Evening command view", message: "Review draw schedules, cached results, and official cutoffs." };
}

function watchlistPulse() {
  const watched = state.scratchWatchlist.map((id) => snapshot.games.find((game) => game.id === id)).filter(Boolean);
  const strongest = [...watched].sort((a, b) => b.intelligence.score - a.intelligence.score)[0];
  if (!watched.length) return { count: 0, title: "Build a watchlist", message: "Save tickets to monitor their research profile in one place." };
  return {
    count: watched.length,
    title: strongest?.name || "Watchlist ready",
    message: strongest ? `Highest current score in your shortlist: ${strongest.intelligence.score}.` : "Your shortlist is ready to review.",
  };
}

function homeQuickActions() {
  return `<section class="homeQuickActions" aria-label="Quick actions">
    <span>Quick Actions</span>
    <div>
      <button type="button" data-home-action="refresh">${icon("data")}<b>Refresh</b></button>
      <button type="button" data-home-action="compare">${icon("scan")}<b>Compare</b></button>
      <button type="button" data-nav="saved">${icon("wallet")}<b>Watchlist</b></button>
      <button type="button" data-home-action="value-lens">${icon("bolt")}<b>Value Lens</b></button>
      <button type="button" data-beta-action="new-games">${icon("sparkle")}<b>New</b></button>
      <button type="button" data-nav="beta">${icon("sparkle")}<b>Beta Lab</b></button>
      <button type="button" data-home-action="filters">${icon("data")}<b>Filters</b></button>
      <button type="button" data-home-action="search">${icon("search")}<b>Search</b></button>
    </div>
  </section>`;
}

function premiumCommandCenter() {
  const overall = topGame();
  const jackpot = topGame((game) => game.intelligence.topPrizesRemaining > 0, (a, b) => b.topPrizeAmount - a.topPrizeAmount);
  const value = topGame((game) => game.price > 0, (a, b) => b.intelligence.valuePerDollar - a.intelligence.valuePerDollar);
  const low = topGame((game) => game.price <= 2);
  const compareFirst = topGame((game) => game.intelligence.topPrizesRemaining > 0, (a, b) => {
    const oddsA = Number(a.overallOdds.match(/[\d.]+$/)?.[0] || 99);
    const oddsB = Number(b.overallOdds.match(/[\d.]+$/)?.[0] || 99);
    return (b.intelligence.score - oddsB) - (a.intelligence.score - oddsA);
  });
  const featured = uniqueGames([value, overall, jackpot, low, compareFirst, ...snapshot.games], 5);
  const spotlightIndex = 0;
  const recs = locationRecommendations(snapshot.winners, state.zip);
  const rec = [...recs].sort((a, b) => {
    if (a.distance === null || a.distance === undefined) return 1;
    if (b.distance === null || b.distance === undefined) return -1;
    return a.distance - b.distance || b.wins - a.wins;
  })[0] || recs[0];
  const hotArea = rec ? rec.city : "NC";
  const warning = snapshot.games.find((game) => game.intelligence.topPrizesRemaining === 0);
  const context = dayPartContext();
  const watchlist = watchlistPulse();
  const biggestDraw = [...drawSnapshot.games].sort((a, b) => (b.jackpotAmount || 0) - (a.jackpotAmount || 0))[0];
  const confidence = overall.intelligence.confidenceScore;
  const watchActivity = Math.min(100, watchlist.count * 18);
  return `<section class="commandCenter premiumCommand intelligenceHome" aria-labelledby="home-intelligence-title">
    <div class="commandHero">
      <div class="commandCopy">
        <div class="compactCommandTitle">
          <div>
            <p>${context.label}</p>
            <h1 id="home-intelligence-title">ScratchScope</h1>
          </div>
          <span class="dataVerified"><i></i>${snapshot.dataHealth.status} &middot; ${snapshot.dataHealth.lastVerified.replace("Official pages checked ", "")}</span>
        </div>
        <div class="commandStatusRow" aria-label="ScratchScope status">
          <span><i class="statusDot strong"></i><b>${snapshot.stats.activeGames}</b> Active</span>
          <span><i class="statusDot new"></i><b>${snapshot.stats.newGames}</b> New</span>
          <span><i class="statusDot gold"></i><b>${money.format(snapshot.stats.biggestTopPrize)}</b> Top Prize</span>
          <span><i class="statusDot stable"></i><b>${confidence}%</b> Confidence</span>
        </div>
        ${commandBoard(overall, hotArea)}
      </div>
      <div class="heroSideStack">
        <article class="homePulseCard confidenceCard">
          <div class="homePulseHeading"><span>Data Confidence</span><i class="signalDot strong"></i></div>
          <div class="confidenceVisual">
            <b class="confidenceRing" style="--confidence:${confidence * 3.6}deg"><strong>${confidence}%</strong><small>Verified</small></b>
            <div>${microBars(confidence, "strong", 10)}<small>Ticket, prize and odds fields</small></div>
          </div>
          <button type="button" data-nav="analytics">Sources ${icon("data")}</button>
        </article>
        <article class="homePulseCard watchPulseCard">
          <div class="homePulseHeading"><span>Watchlist Pulse</span><i class="signalDot ${watchlist.count ? "strong" : "watch"}"></i></div>
          <div class="watchPulseVisual">
            <strong>${watchlist.count}</strong>
            <div><b>${watchlist.title}</b><span class="activityMeter"><i style="width:${watchActivity}%"></i></span><small>${watchlist.count ? "Local activity signal" : "Pin tickets to activate"}</small></div>
          </div>
          <button type="button" data-nav="${watchlist.count ? "saved" : "scratch"}">${watchlist.count ? "Review" : "Add tickets"} ${icon("wallet")}</button>
        </article>
      </div>
    </div>
    <div class="homeSignalRail" aria-label="Current platform signals">
      <article><div><span>Scratch Snapshot</span><i class="signalDot strong"></i></div><strong>${snapshot.stats.activeGames} active</strong>${microBars(Math.min(100, snapshot.stats.activeGames * 8), "strong", 11)}<small>${snapshot.stats.newGames} new releases</small></article>
      <article><div><span>Largest Draw</span><i class="signalDot gold"></i></div><strong>${biggestDraw?.intelligence?.jackpotDisplay || "Verify"}</strong><span class="sparkline spark-gold" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span><small>${biggestDraw?.gameName || "Official source required"}</small></article>
      <article><div><span>Watchlist</span><i class="signalDot ${watchlist.count ? "strong" : "watch"}"></i></div><strong>${watchlist.count} tickets</strong><span class="activityMeter"><i style="width:${watchActivity}%"></i></span><small>Stored locally</small></article>
      <article><div><span>Refresh State</span><i class="signalDot stable"></i></div><strong>Cached official</strong><span class="refreshTimeline" aria-hidden="true"><i></i><i></i><i></i><i></i></span><small>Connector ready</small></article>
    </div>
    ${homeQuickActions()}
    ${ValueOpportunityBoard(snapshot.games, state.valueBudget, state.scratchWatchlist)}
    ${state.beta.pinned.length ? PinnedBetaWidgets(state.beta) : ""}
    <div class="featuredHeader"><div><span>Research Shortlist</span><strong>Compare signals before spending.</strong></div><small>Scores are relative research indices, not win probabilities.</small></div>
    <div class="featuredTickets">
      ${featured.map((game, index) => featuredTicket(game, index === spotlightIndex ? "Deep Dive" : index === 0 ? "Value Signal" : index === 1 ? "Compare First" : index === 3 ? "Lower Cost" : "Prize Scale", index === spotlightIndex ? "Open the 11-metric dashboard" : index === 0 ? "Strong relative value index" : index === 1 ? "Useful comparison baseline" : index === 3 ? "Lower ticket cost" : "Large advertised top prize", index === spotlightIndex)).join("")}
    </div>
    <div class="homeActions">
      <button type="button" class="primaryBtn" data-nav="scratch">Explore scratch-offs</button>
      <button type="button" class="secondaryBtn" data-nav="draws">Open draw center</button>
      <button type="button" class="secondaryBtn" data-nav="hotzones">Explore winner archive</button>
    </div>
    ${warning ? `<div class="legacyHeroPicks" aria-label="Secondary research picks">${heroPick("Top-Prize Warning", warning, "Verify before buying")}</div>` : ""}
  </section>`;
}

function kioskFilters() {
  const chips = [["all", "Any price"], [1, "$1"], [2, "$2"], [3, "$3"], [5, "$5"], [10, "$10"], [20, "$20"], [30, "$30"], [50, "$50"]];
  const tabs = [["all", "Discover"], ["new", "New"], ["odds", "Best Odds"], ["top", "Top Prizes"], ["budget", "Budget"]];
  const moreViews = [["recommended", "For You"], ["watchlist", "My Watchlist"], ["ending", "Ending Soon"], ["trending", "Trending"], ["under-10", "Best Under $10"], ["low-value", "Low Value Warnings"], ["high-roller", "High Roller"]];
  const advancedCount = [state.price !== "all", state.status !== "all", state.minPrize, state.maxOdds, state.minTopRemaining].filter(Boolean).length;
  return `<section class="kioskFilters discoveryControls" aria-label="Scratch-off filters">
    <div class="discoveryTabs" role="tablist" aria-label="Discovery views">
      ${tabs.map(([value, label]) => `<button role="tab" aria-selected="${state.discoveryTab === value}" class="${state.discoveryTab === value ? "active" : ""}" data-discovery-tab="${value}">${label}</button>`).join("")}
      <label class="moreViews"><span>More</span><select data-discovery-select aria-label="More discovery views"><option value="">More views</option>${moreViews.map(([value, label]) => `<option value="${value}" ${state.discoveryTab === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
    </div>
    <div class="filterCommandRow">
      <label class="kioskSearch">${icon("search")}<input id="query" value="${state.query}" placeholder="Search tickets" aria-label="Search scratch-off tickets"></label>
      <label class="compactSort"><span>Sort</span><select data-filter-field="sort" aria-label="Sort tickets">${[["score", "Recommended"], ["newest", "Newest"], ["odds", "Best odds"], ["jackpot", "Top prize"], ["top-left", "Most prizes left"], ["price", "Lowest price"], ["value", "Best value"], ["popular", "Trending"]].map(([value, label]) => `<option value="${value}" ${state.sort === value ? "selected" : ""}>${label}</option>`).join("")}</select></label>
      <button type="button" class="filterToggle ${state.filtersOpen ? "active" : ""}" data-toggle-advanced aria-expanded="${state.filtersOpen}">${icon("data")} Filters${advancedCount ? `<b>${advancedCount}</b>` : ""}</button>
    </div>
    <div class="advancedFilters ${state.filtersOpen ? "open" : ""}">
      <div class="priceFilter"><span>Ticket price</span><div class="chipDeck" role="group" aria-label="Ticket price">${chips.map(([value, label]) => `<button class="${String(state.price) === String(value) ? "active" : ""}" data-price="${value}" aria-pressed="${String(state.price) === String(value)}">${label}</button>`).join("")}</div></div>
      <label>Status<select data-filter-field="status"><option value="all">All statuses</option><option value="active" ${state.status === "active" ? "selected" : ""}>Active</option><option value="new" ${state.status === "new" ? "selected" : ""}>New</option><option value="ending soon" ${state.status === "ending soon" ? "selected" : ""}>Ending soon</option></select></label>
      <label>Minimum top prize<select data-filter-field="minPrize"><option value="">Any prize</option>${[50000, 100000, 200000, 1000000].map((value) => `<option value="${value}" ${Number(state.minPrize) === value ? "selected" : ""}>${money.format(value)}+</option>`).join("")}</select></label>
      <label>Overall odds<select data-filter-field="maxOdds"><option value="">Any odds</option>${[3.5, 4, 4.5, 5].map((value) => `<option value="${value}" ${Number(state.maxOdds) === value ? "selected" : ""}>1 in ${value} or better</option>`).join("")}</select></label>
      <label>Top prizes left<select data-filter-field="minTopRemaining"><option value="">Any amount</option>${[1, 2, 3, 5].map((value) => `<option value="${value}" ${Number(state.minTopRemaining) === value ? "selected" : ""}>${value}+</option>`).join("")}</select></label>
      <button type="button" class="clearFilters" data-clear-filters>Reset filters</button>
    </div>
  </section>`;
}

function discoveryWelcome() {
  const best = topGame();
  return `<section class="discoveryWelcome">
    <div class="welcomeCopy">
      <span class="welcomeEyebrow">${icon("sparkle")} Today's research pick</span>
      <h1>Find a ticket worth researching.</h1>
      <p>ScratchScope compares visible prize inventory, odds, ticket cost, and data quality so you can start with the strongest public-data signals.</p>
      <div class="welcomeActions">
        <button type="button" data-open-matchmaker>${icon("sparkle")} Find my ticket match</button>
        <button type="button" class="quietAction" data-ai-explain="${best.id}">Why this scored ${best.intelligence.score}</button>
      </div>
      <small>${snapshot.dataHealth.status} · Updated ${snapshot.dataHealth.lastVerified.replace("Official pages checked ", "")} · Always verify before buying</small>
    </div>
    <article class="welcomeTicket" data-detail="${best.id}">
      <div class="welcomeTicketImage"><img src="${best.imageUrl}" alt="${best.name} scratch-off ticket"><span>$${best.price}</span></div>
      <div class="welcomeTicketInfo">
        <span>Best match today</span>
        <h2>${best.name}</h2>
        <p>${best.intelligence.summary}</p>
        <div class="welcomeMetrics"><div><strong>${best.intelligence.score}</strong><span>Score</span></div><div><strong>${best.overallOdds.replace("1 in ", "1:")}</strong><span>Odds</span></div><div><strong>${topPrizeLine(best)}</strong><span>Top prizes</span></div></div>
      </div>
    </article>
  </section>`;
}

function sortGames(games) {
  return [...games].sort((a, b) => {
    if (state.sort === "jackpot") return b.topPrizeAmount - a.topPrizeAmount;
    if (state.sort === "value") return b.intelligence.valuePerDollar - a.intelligence.valuePerDollar;
    if (state.sort === "odds") return Number(a.overallOdds.match(/[\d.]+$/)?.[0] || 99) - Number(b.overallOdds.match(/[\d.]+$/)?.[0] || 99);
    if (state.sort === "newest") return String(b.launchDate).localeCompare(String(a.launchDate));
    if (state.sort === "top-left") return b.intelligence.topPrizesRemaining - a.intelligence.topPrizesRemaining;
    if (state.sort === "price") return a.price - b.price || b.intelligence.score - a.intelligence.score;
    if (state.sort === "popular") return b.intelligence.trendScore - a.intelligence.trendScore;
    return b.intelligence.score - a.intelligence.score;
  });
}

function discoveryGames(games) {
  const tab = state.discoveryTab;
  const filtered = games.filter((game) => {
    if (tab === "new") return game.isCurrentRelease;
    if (tab === "odds") return Number(game.overallOdds.match(/[\d.]+$/)?.[0] || 99) <= 4;
    if (tab === "top") return game.intelligence.topPrizesRemaining > 0;
    if (tab === "ending") return game.status === "ending soon";
    if (tab === "trending") return game.intelligence.trendScore >= 65;
    if (tab === "recommended") return game.intelligence.score >= 70;
    if (tab === "watchlist") return state.scratchWatchlist.includes(game.id);
    if (tab === "budget") return game.price <= 5;
    if (tab === "under-10") return game.price < 10;
    if (tab === "low-value") return game.intelligence.score < 65 || game.intelligence.topPrizesRemaining === 0;
    if (tab === "high-roller") return game.price >= 20;
    return game.status !== "ended";
  });
  if (tab === "new") return [...filtered].sort((a, b) => String(b.launchDate).localeCompare(String(a.launchDate)));
  if (tab === "odds") return [...filtered].sort((a, b) => Number(a.overallOdds.match(/[\d.]+$/)?.[0] || 99) - Number(b.overallOdds.match(/[\d.]+$/)?.[0] || 99));
  if (tab === "top") return [...filtered].sort((a, b) => b.intelligence.topPrizesRemaining - a.intelligence.topPrizesRemaining);
  if (tab === "trending") return [...filtered].sort((a, b) => b.intelligence.trendScore - a.intelligence.trendScore);
  if (tab === "low-value") return [...filtered].sort((a, b) => a.intelligence.score - b.intelligence.score);
  return sortGames(filtered);
}

function ticketWall(games) {
  return `<section class="kioskPanel ticketWallPanel" aria-labelledby="discovery-title">
    <div class="sectionHead"><div><p>Explore tickets</p><h2 id="discovery-title">${state.quickCompare ? "Choose tickets to compare" : "All recommendations"}</h2><span class="sectionIntro">Ranked from the current cached official snapshot.</span></div><div class="sectionActions"><div class="cardViewToggle" role="group" aria-label="Ticket layout"><button type="button" class="${state.settings.cardView === "grid" ? "active" : ""}" data-card-view="grid">Grid</button><button type="button" class="${state.settings.cardView === "list" ? "active" : ""}" data-card-view="list">List</button></div><button class="${state.quickCompare ? "active" : ""}" data-quick-compare>${state.quickCompare ? "Done selecting" : "Compare"}</button><strong>${games.length} tickets</strong></div></div>
    <div class="gameGrid">${games.length ? games.map((game) => ScratchCard(game, state.compare.includes(game.id), state.scratchWatchlist.includes(game.id), state.scratchFavorites.includes(game.id))).join("") : `<div class="emptyState"><strong>${state.discoveryTab === "watchlist" ? "Your scratch-off watchlist is empty." : "No games match these filters."}</strong><span>${state.discoveryTab === "watchlist" ? "Save tickets from any card to keep a research shortlist here." : "Clear a filter or search a different ticket name."}</span>${state.discoveryTab === "watchlist" ? "" : `<button type="button" data-clear-filters>Clear filters</button>`}</div>`}</div>
  </section>`;
}

function watchlistSection() {
  const games = state.scratchWatchlist.map((id) => snapshot.games.find((game) => game.id === id)).filter(Boolean);
  return `<section class="kioskPanel ticketWallPanel watchlistPanel">
    <div class="sectionHead"><div><p>Saved scratch-offs</p><h2>Your ticket watchlist</h2><span class="sectionIntro">A personal shortlist for checking score changes and official prize tables before buying.</span></div><div class="sectionActions"><button type="button" data-nav="scratch">Browse tickets</button><strong>${games.length} saved</strong></div></div>
    <div class="gameGrid">${games.length ? games.map((game) => ScratchCard(game, state.compare.includes(game.id), true, state.scratchFavorites.includes(game.id))).join("") : `<div class="emptyState"><strong>No scratch-offs saved yet.</strong><span>Use Save on a ticket card or in the matchmaker to build this list.</span><button type="button" data-nav="scratch">Find tickets</button></div>`}</div>
  </section>`;
}

function favoritesSection() {
  const games = state.scratchFavorites.map((id) => snapshot.games.find((game) => game.id === id)).filter(Boolean);
  return `<section class="kioskPanel ticketWallPanel favoritesPanel">
    <div class="sectionHead"><div><p>Pinned tickets</p><h2>Your favorites</h2><span class="sectionIntro">Fast access to the ticket profiles you research most.</span></div><div class="sectionActions"><button type="button" data-nav="scratch">Browse tickets</button><strong>${games.length} pinned</strong></div></div>
    <div class="gameGrid">${games.length ? games.map((game) => ScratchCard(game, state.compare.includes(game.id), state.scratchWatchlist.includes(game.id), true)).join("") : `<div class="emptyState"><strong>No favorite tickets pinned.</strong><span>Use the pin on any ticket card to build this row.</span><button type="button" data-nav="scratch">Find tickets</button></div>`}</div>
  </section>`;
}

function oddsValue(game) {
  return Number(game.overallOdds.match(/[\d.]+$/)?.[0] || 99);
}

function matchmakerMatches() {
  const preferences = state.matchmaker;
  const budget = Number(preferences.budget) || 10;
  return snapshot.games
    .filter((game) => game.price <= budget && game.status !== "ended")
    .map((game) => {
      let fit = game.intelligence.score;
      if (preferences.goal === "odds") fit += Math.max(0, 5.2 - oddsValue(game)) * 12;
      if (preferences.goal === "jackpot") fit += Math.log10(game.topPrizeAmount || 1) * 4 + Math.min(12, game.intelligence.topPrizesRemaining * 2);
      if (preferences.goal === "depth") fit += Math.min(24, Math.log10(game.intelligence.midTierDepth + 1) * 6);
      if (preferences.style === "cautious") fit += game.price <= 5 ? 14 : -game.price * .5;
      if (preferences.style === "bold") fit += game.topPrizeAmount >= 1000000 ? 14 : 0;
      const reason = preferences.goal === "odds"
        ? `${game.overallOdds} overall odds lead this fit, with ${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes} visible top prizes.`
        : preferences.goal === "jackpot"
          ? `${money.format(game.topPrizeAmount)} top prize with ${game.intelligence.topPrizesRemaining} still visible in the cached table.`
          : preferences.goal === "depth"
            ? `${game.intelligence.midTierDepth.toLocaleString()} prizes remain across displayed non-top tiers.`
            : `${game.intelligence.valueRating} value rating, score ${game.intelligence.score}, and a $${game.price} ticket cost.`;
      return { game, fit, reason };
    })
    .sort((a, b) => b.fit - a.fit)
    .slice(0, 3);
}

function filteredStateResearch() {
  const query = stateHubQuery.trim().toLowerCase();
  if (!query) return stateLotteryResearch;
  return stateLotteryResearch.filter((item) => [
    item.name,
    item.code,
    item.region,
    item.note,
    ...item.features.map((feature) => featureLabels[feature]),
  ].join(" ").toLowerCase().includes(query));
}

function aiPicks() {
  const picks = [
    ["Best Overall Research Pick", topGame(), "Highest blended score"],
    ["Best $1 to $2 Play", topGame((g) => g.price <= 2), "Low-cost research lane"],
    ["Best $5 Play", topGame((g) => g.price === 5), "Mid-cost value lane"],
    ["Best $10+ Play", topGame((g) => g.price >= 10), "Higher-cost research lane"],
    ["Best Mid-Tier Depth", topGame(() => true, (a, b) => b.intelligence.midTierDepth - a.intelligence.midTierDepth), "Visible remaining tier depth"],
  ];
  return `<section class="kioskPanel">
    <div class="sectionHead"><div><p>Cached Data Shortlist</p><h2>Scratch-offs to verify and compare</h2></div><strong>Not a prediction</strong></div>
    <div class="aiPickGrid">${picks.map(([label, game, why]) => `<article data-detail="${game.id}"><img src="${game.imageUrl}" alt="${game.name} ticket"><span>${label}</span><strong>${game.name}</strong><small>${why}. Verify official page first.</small><b>${game.intelligence.score}</b></article>`).join("")}</div>
  </section>`;
}

function strategyLab() {
  const strategies = [
    ["Top Prize Visibility", "Prioritize games where official tables still show top prizes remaining.", "hideNoTop"],
    ["Avoid Dead Jackpot", "Flag games where top prizes appear gone or missing from data.", "hideNoTop"],
    ["Value Per Dollar", "Compare ticket cost against top prize and visible prize inventory.", "sort:value"],
    ["Prize Tier Depth", "Look beyond jackpot and inspect mid-tier remaining prizes.", "sort:score"],
    ["New Game Watch", "New games may show fuller inventory, but verify first.", "newOnly"],
    ["Ending Soon Risk", "Check end dates and claim deadlines before buying older games.", "endingSoon"],
    ["Budget Lock", "Set the spend before choosing tickets and stop there.", "budget"],
    ["Retailer Research", "Use public winner-location history as context, never prediction.", "hotzones"],
    ["Reality Check", "Lottery outcomes are random; hot zones do not change odds.", "responsible"],
  ];
  return `<section class="kioskPanel">
    <div class="sectionHead"><div><p>Strategy Lab</p><h2>Real research strategies, responsibly framed</h2></div><strong>Entertainment only</strong></div>
    <div class="strategyGrid">${strategies.map(([title, body, action]) => `<article><strong>${title}</strong><p>${body}</p><button data-strategy="${action}">Apply</button><small>Do not chase losses. Verify at official source.</small></article>`).join("")}</div>
  </section>`;
}

function locationPanel() {
  const recs = locationRecommendations(snapshot.winners, state.zip);
  return `<section class="kioskPanel locationIntel">
    <div class="sectionHead"><div><p>Best Locations to Research</p><h2>Public winner-density workspace</h2></div><strong>Approximate</strong></div>
    <div class="locationGrid">${recs.map((item) => `<article><strong>${item.city}, ${item.county}</strong><span>${item.distance === null ? "Distance needs ZIP match" : `${item.distance} mi from ZIP`}</span><small>${item.why}</small><b>${money.format(item.largestPrize)}</b></article>`).join("")}</div>
    <p class="fine">Historical winner locations do not change the odds of future tickets. Use this as public-data research only.</p>
  </section>`;
}

function dataSourceCenter() {
  return `<section class="kioskPanel dataCenter">
    <div class="sectionHead"><div><p>Data Source Center</p><h2>Open, verify, export</h2></div><strong>${snapshot.dataHealth.status}</strong></div>
    <div class="sourceButtons">
      <a href="${snapshot.officialSources.scratchOffGames}" target="_blank" rel="noreferrer">Official Scratch-Off Games</a>
      <a href="${snapshot.officialSources.prizesRemaining}" target="_blank" rel="noreferrer">Official Prizes Remaining</a>
      <a href="${snapshot.officialSources.winners}" target="_blank" rel="noreferrer">Official Scratch-Off Winners</a>
      <a href="${snapshot.officialSources.playSmart}" target="_blank" rel="noreferrer">NC Play Smart</a>
      <button data-export>Export Current Dataset</button>
    </div>
    <p class="fine">Automatic refresh requires a same-origin backend connector. This build never substitutes sample records when live data is unavailable.</p>
  </section>`;
}

function responsibleLayer() {
  return `<section class="responsibleLayer">${icon("shield")} Lottery games are random. Historical winner locations do not predict future results. Verify all prize data with the official NC Lottery before buying. Stop at budget.</section>`;
}

function compareTray(selectedCompare) {
  if (!selectedCompare.length) return "";
  const ready = selectedCompare.length >= 2;
  return `<aside class="compareTrayLive">
    <div class="compareTrayHead"><strong>${selectedCompare.length} selected for compare</strong><span>${ready ? "Live comparison" : "Select at least 2 tickets"}</span></div>
    <div class="compareTrayTickets">${selectedCompare.map((game) => `<article>
      <img src="${game.imageUrl}" alt="${game.name} ticket">
      <div><b>${game.name}</b><span>$${game.price} · ${game.overallOdds}</span><small>${game.intelligence.topPrizesRemaining}/${game.intelligence.originalTopPrizes} top prizes · Score ${game.intelligence.score}</small></div>
    </article>`).join("")}</div>
    <button type="button" data-jump-compare>${ready ? "Full Compare" : "Add one more"}</button>
    <button type="button" data-clear-compare>Clear</button>
  </aside>`;
}

function mobileNav() {
  const items = [
    ["home", "Home", "sparkle"],
    ["allgames", "All", "scan"],
    ["scratch", "Active", "ticket"],
    ["draws", "Draws", "trophy"],
    ["hotzones", "Zones", "map"],
    ["saved", "Saved", "wallet"],
    ["analytics", "Data", "data"],
    ["beta", "Beta", "sparkle"],
  ];
  return `<nav class="bottomNav" aria-label="Mobile navigation">${items.map(([id, label, iconName]) => `<button class="${state.nav === id ? "active" : ""}" data-nav="${id}" aria-label="${label}" ${state.nav === id ? 'aria-current="page"' : ""}>${icon(iconName)}<span>${label}</span></button>`).join("")}</nav>`;
}

function hotAreaLabel() {
  const recs = locationRecommendations(snapshot.winners, state.zip);
  const rec = [...recs].sort((a, b) => {
    if (a.distance === null || a.distance === undefined) return 1;
    if (b.distance === null || b.distance === undefined) return -1;
    return a.distance - b.distance || b.wins - a.wins;
  })[0] || recs[0];
  return rec ? `${rec.city}, ${rec.county}` : "NC public records";
}

function routeOverview(kicker, title, copy, stats = []) {
  return `<section class="routeOverview">
    <div><span>${kicker}</span><h1>${title}</h1><p>${copy}</p></div>
    <div class="routeOverviewStats">${stats.map(([value, label]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join("")}</div>
  </section>`;
}

function pageSections({ filtered, selectedCompare, zones, budget }) {
  const home = `
    ${todayBestPlays()}
    ${homeQuickTabs()}
    ${LotteryHub({ scratchGames: snapshot.games, drawGames: drawSnapshot.games, watchlist: state.scratchWatchlist, favorites: state.scratchFavorites })}
    ${homeTabPanel()}
    ${responsibleLayer()}`;
  const allgames = `
    ${AllGamesExplorer({
      scratchGames: snapshot.games,
      drawGames: drawSnapshot.games,
      query: state.libraryQuery,
      filter: state.libraryFilter,
      watchlist: state.scratchWatchlist,
      favorites: state.scratchFavorites,
      recent: state.recentViews,
      drawWatchlist: state.draw.watchlist,
    })}
    ${responsibleLayer()}`;
  const scratch = `
    ${selectedCompare.length ? CompareGames(selectedCompare) : ""}
    ${discoveryWelcome()}
    ${ActiveScratchDirectory(snapshot.games, state.scratchWatchlist, state.scratchFavorites)}
    ${kioskFilters()}
    ${ticketWall(filtered)}
    ${responsibleLayer()}`;
  const hotzones = `
    ${routeOverview("Location intelligence", "Explore the public winner archive.", "Map sourced winner articles and retailer locations as historical context only. Past wins never change future odds.", [[snapshot.winners.length, "winner records"], [zones.cities.length, "city clusters"], [getLocationProfile(state.zip).city, "current area"]])}
    <section class="split">${WinningLocationsMap(snapshot.winners)}${HotZonePanel(zones)}</section>
    ${locationPanel()}`;
  const favoriteGames = state.scratchFavorites.map((id) => snapshot.games.find((game) => game.id === id)).filter(Boolean);
  const watchedGames = state.scratchWatchlist.map((id) => snapshot.games.find((game) => game.id === id)).filter(Boolean);
  const recentGames = state.recentViews.map((id) => snapshot.games.find((game) => game.id === id)).filter(Boolean);
  const saved = `
    ${SavedWorkspace({
      favorites: favoriteGames,
      watchlist: watchedGames,
      recent: recentGames,
      notes: state.ticketNotes,
      savedPicks: state.draw.savedPicks,
      watchedDraws: state.draw.watchlist,
    })}
    ${favoritesSection()}
    ${watchlistSection()}
    ${DrawGamesDashboard(drawSnapshot, { ...state.draw, focusGameId: state.draw.focusGameId || drawSnapshot.games[0].gameId })}
    ${BudgetPlanner(state.budget, budget)}`;
  const analytics = `
    ${AnalyticsWorkbench(snapshot.games, state.scratchWatchlist, snapshot.winners, drawSnapshot)}
    ${selectedCompare.length ? CompareGames(selectedCompare) : CompareGames(selectedCompare)}
    ${BudgetPlanner(state.budget, budget)}
    ${dataSourceCenter()}`;
  const beta = BetaLab({
    scratchCount: snapshot.games.length,
    drawCount: drawSnapshot.games.length,
    savedScratch: state.scratchWatchlist.length,
    savedPicks: state.draw.savedPicks.length,
    unavailableCount: drawSnapshot.unavailableGames.length,
    beta: state.beta,
  });
  if (state.nav === "allgames") return allgames;
  if (state.nav === "scratch") return scratch;
  if (state.nav === "draws") return DrawGamesDashboard(drawSnapshot, state.draw);
  if (state.nav === "hotzones") return hotzones;
  if (state.nav === "saved") return saved;
  if (state.nav === "analytics") return analytics;
  if (state.nav === "beta") return beta;
  return home;
}

function toggleCompare(id) {
  const game = snapshot.games.find((item) => item.id === id);
  if (!game) return;
  const removing = state.compare.includes(id);
  const compare = state.compare.includes(id) ? state.compare.filter((item) => item !== id) : [...state.compare, id].slice(-5);
  setState(withActivity({ compare }, activityEntry("compare", `${removing ? "Removed" : "Added"} ${game.name}`, `${removing ? "Removed from" : "Added to"} ticket comparison.`, id)));
}

function toggleWatch(id) {
  const game = snapshot.games.find((item) => item.id === id);
  if (!game) return;
  const watched = state.scratchWatchlist.includes(id);
  const scratchWatchlist = watched ? state.scratchWatchlist.filter((item) => item !== id) : [...state.scratchWatchlist, id];
  setState(withActivity({ scratchWatchlist }, activityEntry("save", `${watched ? "Removed" : "Watched"} ${game.name}`, watched ? "Removed from scratch-off watchlist." : `Saved score ${game.intelligence.score} profile.`, id)));
  showStatus(watched ? "Removed from scratch-off watchlist." : "Saved to scratch-off watchlist.");
}

function toggleFavorite(id) {
  const game = snapshot.games.find((item) => item.id === id);
  if (!game) return;
  const favorite = state.scratchFavorites.includes(id);
  const scratchFavorites = favorite ? state.scratchFavorites.filter((item) => item !== id) : [id, ...state.scratchFavorites];
  setState(withActivity({ scratchFavorites }, activityEntry("pin", `${favorite ? "Unpinned" : "Pinned"} ${game.name}`, favorite ? "Removed from favorites." : "Pinned for fast access.", id)));
  showStatus(favorite ? "Ticket unpinned." : "Ticket pinned to favorites.");
}

function setDrawState(patch) {
  setState({ draw: { ...state.draw, ...patch } });
}

function findGeneratedPick(id) {
  if (state.draw.generatedPick?.id === id) return state.draw.generatedPick;
  return (state.draw.savedPicks || []).find((pick) => pick.id === id);
}

function pickText(pick) {
  const bonus = pick.bonusNumber === null || pick.bonusNumber === undefined ? "" : ` + ${pick.bonusNumber}`;
  return `${pick.gameName}: ${pick.numbers.join("-")}${bonus}`;
}

function applyStrategy(action) {
  if (action.startsWith("sort:")) {
    setState({ nav: "scratch", sort: action.split(":")[1] }, ".ticketWallPanel");
    return;
  }
  if (action === "newOnly" || action === "hideNoTop" || action === "endingSoon") {
    setState({ nav: "scratch", [action]: true }, ".ticketWallPanel");
    return;
  }
  if (action === "compare") {
    setState({ nav: "scratch", quickCompare: true }, ".ticketWallPanel");
    return;
  }
  if (action === "budget") {
    setState({ nav: "analytics" }, ".budgetPanel");
    return;
  }
  if (action === "hotzones") {
    setState({ nav: "hotzones" }, ".mapPanel");
    return;
  }
  if (action === "responsible") {
    setState({ nav: "home" }, ".responsibleLayer");
  }
}

function applyBetaAction(action) {
  betaPreviewId = "";
  const scratchPatch = { nav: "scratch", query: "", status: "all" };
  if (action === "best-value") return setState({ ...scratchPatch, discoveryTab: "all", sort: "value" }, ".ticketWallPanel");
  if (action === "heat") return setState({ ...scratchPatch, discoveryTab: "trending", sort: "popular" }, ".ticketWallPanel");
  if (action === "new-games") return setState({ ...scratchPatch, discoveryTab: "new", sort: "newest" }, ".ticketWallPanel");
  if (action === "ending-soon") return setState({ ...scratchPatch, discoveryTab: "ending", sort: "score" }, ".ticketWallPanel");
  if (action === "top-prizes") return setState({ ...scratchPatch, discoveryTab: "top", minTopRemaining: "1", sort: "top-left" }, ".ticketWallPanel");
  if (action === "best-odds") return setState({ ...scratchPatch, discoveryTab: "odds", sort: "odds" }, ".ticketWallPanel");
  if (action === "budget") return setState({ nav: "analytics" }, ".budgetPanel");
  if (action.startsWith("price-")) return setState({ ...scratchPatch, discoveryTab: "all", price: action.replace("price-", ""), sort: "score" }, ".ticketWallPanel");
  if (action === "premium") return setState({ ...scratchPatch, discoveryTab: "high-roller", price: "all", sort: "jackpot" }, ".ticketWallPanel");
  if (action === "favorites") return setState({ nav: "saved" });
  if (action === "compare") return setState({ nav: "scratch", quickCompare: true }, ".ticketWallPanel");
  if (action === "daily-pick" || action === "home") return setState({ nav: "home", homeTab: "scratch" });
  if (action === "low-value") return setState({ ...scratchPatch, discoveryTab: "low-value", sort: "score" }, ".ticketWallPanel");
  if (action === "jackpot") return setState({ ...scratchPatch, discoveryTab: "top", sort: "jackpot" }, ".ticketWallPanel");
  if (action === "winners") return setState({ nav: "hotzones" }, ".mapPanel");
  if (action === "raleigh") return setState({ nav: "hotzones", zip: "27617" }, ".mapPanel");
  if (action === "mount-airy") return setState({ nav: "hotzones", zip: "27030" }, ".mapPanel");
  if (action === "daily-pick-detail") {
    openGameDetail(topGame().id);
    return;
  }
  if (action === "sources") return setState({ nav: "analytics" }, ".dataCenter");
  if (action === "draws") return setState({ nav: "draws" });
  if (action === "toggle-glow") return setState({ glowMode: !state.glowMode });
  if (action === "clean-pro") return setState({ glowMode: false, nav: "analytics" });
  if (action === "under-10") return setState({ ...scratchPatch, discoveryTab: "under-10", price: "all", sort: "score" }, ".ticketWallPanel");
}

function runCommand(action) {
  state = { ...state, command: { ...state.command, open: false, query: "" } };
  localStorage.setItem(key, JSON.stringify(state));
  if (action === "search-games") {
    showAllGames();
    window.setTimeout(() => root.querySelector("[data-library-query]")?.focus(), 90);
    return;
  }
  if (action === "show-all") return showAllGames();
  if (action === "active-scratch") return openActiveScratchDirectory();
  if (action === "lottery-hub") return setState({ nav: "home" }, ".lotteryHub");
  if (action === "hot-games") return applyBetaAction("heat");
  if (action === "new-games") return applyBetaAction("new-games");
  if (action === "ending-games") return applyBetaAction("ending-soon");
  if (action === "value-lens") return setState({ nav: "home" }, ".valueOpportunityBoard");
  if (action === "draws") return setState({ nav: "draws" });
  if (action === "refresh") {
    setState(withActivity({ lastRefresh: new Date().toISOString() }, activityEntry("refresh", "Checked cached data", `Last verified ${snapshot.dataHealth.lastVerified}.`)));
    showStatus(`Cached official snapshot checked. Last verified ${snapshot.dataHealth.lastVerified}.`);
    return;
  }
  if (action === "watchlist" || action === "favorites") return setState({ nav: "saved" });
  if (action === "recent") return showAllGames("recent");
  if (action === "nearby") return setState({ nav: "hotzones" }, ".mapPanel");
  if (action === "statistics") return setState({ nav: "analytics" });
  if (action === "assistant") return setState({ assistant: { ...state.assistant, open: true } });
  if (action === "export") return setState({ exportOpen: true });
  if (action === "gauge") return setState({ buildGauge: { ...state.buildGauge, open: !state.buildGauge.open } });
  if (action === "activity") return setState({ activityOpen: true, activity: state.activity.map((item) => ({ ...item, read: true })) });
  if (action === "settings") return setState({ settingsOpen: true });
}

function render() {
  document.documentElement.dataset.glow = state.glowMode ? "on" : "off";
  document.documentElement.dataset.density = state.settings.density;
  document.documentElement.dataset.cardView = state.settings.cardView;
  document.documentElement.dataset.contrast = state.settings.contrast;
  document.documentElement.dataset.motion = state.settings.motion;
  document.documentElement.dataset.ambient = state.settings.ambient ? "on" : "off";
  document.documentElement.style.setProperty("--user-font-scale", String(state.settings.fontScale / 100));
  const filtered = discoveryGames(filterGames(snapshot.games, state));
  const selectedCompare = state.compare.map((id) => snapshot.games.find((game) => game.id === id)).filter(Boolean);
  const zones = hotZones(snapshot.winners);
  const budget = budgetPlan({ ...state.budget, zip: state.zip }, snapshot.games);
  const detailGame = snapshot.games.find((game) => game.id === detailId);
  const aiExplainGame = snapshot.games.find((game) => game.id === aiExplainId);
  const assistantGame = detailGame || snapshot.games.find((game) => game.id === state.recentViews?.[0]) || topGame();
  const modalOpen = Boolean(detailGame || aiExplainGame || matchmakerOpen || stateHubOpen || betaPreviewId || state.exportOpen || state.settingsOpen || state.activityOpen);
  const modalKey = detailGame?.id
    ? `detail-${detailGame.id}`
    : aiExplainGame?.id
      ? `explain-${aiExplainGame.id}`
      : matchmakerOpen
        ? "matchmaker"
        : stateHubOpen
          ? "states"
          : betaPreviewId
            ? `beta-${betaPreviewId}`
            : state.exportOpen
              ? "export"
              : state.settingsOpen
                ? "settings"
                : state.activityOpen
                  ? "activity"
                  : "";
  document.body.style.overflow = modalOpen ? "hidden" : "";
  root.innerHTML = `<div class="appShell kioskMode ${modalOpen ? "hasModal" : ""}">
    <a class="skipLink" href="#main-content">Skip to main content</a>
    ${header()}
    ${navRail()}
    ${aiIntelligenceRibbon()}
    ${workspaceContextBar()}
    <main id="main-content" tabindex="-1">${pageSections({ filtered, selectedCompare, zones, budget })}</main>
    <footer class="footerNote">Cached official data: ticket artwork, odds, top prize, visible prize tiers, and sourced winner articles. Draw values are dated snapshots. Always verify the official source.</footer>
    ${statusMessage ? `<div class="statusToast" role="status">${statusMessage}</div>` : ""}
    ${compareTray(selectedCompare)}
    ${GameDetailDrawer(detailGame, state.scratchWatchlist.includes(detailGame?.id), state.scratchFavorites.includes(detailGame?.id), state.compare.includes(detailGame?.id), snapshot.winners, snapshot.games, state.ticketNotes[detailGame?.id] || "")}
    ${AIScoreExplainer(aiExplainGame)}
    ${TicketMatchmaker(matchmakerOpen, state.matchmaker, matchmakerMatches())}
    ${StateIntelligenceHub(stateHubOpen, filteredStateResearch(), stateHubQuery)}
    ${BetaFeatureModal(betaPreviewId)}
    ${VirtualBuildGauge(state.buildGauge)}
    ${FloatingCommandDock({ watchlist: state.scratchWatchlist.length, favorites: state.scratchFavorites.length, recent: state.recentViews.length })}
    <div id="floating-control-tooltip" class="floatingControlTooltip" role="tooltip" aria-hidden="true"></div>
    ${CommandPalette(state.command.open, state.command.query, snapshot.games, state.recentViews, drawSnapshot.games)}
    ${AIAssistantPanel(state.assistant.open, assistantGame, state.assistant, state.nav)}
    ${ExportStudio(state.exportOpen)}
    ${WorkspaceSettings(state.settingsOpen, state.settings)}
    ${ActivityCenter(state.activityOpen, state.activity, onlineState)}
    ${mobileNav()}
  </div>`;
  bind();
  initWinningLocationsMap(snapshot.winners);
  updateCountdowns();
  if (modalKey && modalKey !== activeModalKey) {
    window.setTimeout(() => {
      const dialog = root.querySelector('[role="dialog"]');
      const target = dialog?.querySelector("input[autofocus], button, input, select, textarea, a[href]");
      target?.focus({ preventScroll: true });
    }, 30);
  }
  activeModalKey = modalKey;
  if (pendingScrollTarget) {
    const target = pendingScrollTarget;
    pendingScrollTarget = "";
    scrollToTarget(target);
  }
}

function bind() {
  const floatingTooltip = root.querySelector(".floatingControlTooltip");
  let activeTooltipControl = null;
  const hideFloatingTooltip = () => {
    if (!floatingTooltip) return;
    activeTooltipControl?.removeAttribute("aria-describedby");
    activeTooltipControl = null;
    floatingTooltip.classList.remove("visible");
    floatingTooltip.setAttribute("aria-hidden", "true");
  };
  const showFloatingTooltip = (control) => {
    if (!floatingTooltip || !control?.dataset.tooltip) return;
    activeTooltipControl?.removeAttribute("aria-describedby");
    activeTooltipControl = control;
    control.setAttribute("aria-describedby", "floating-control-tooltip");
    floatingTooltip.textContent = control.dataset.tooltip;
    floatingTooltip.dataset.side = control.dataset.tooltipSide || "top";
    floatingTooltip.classList.add("visible");
    floatingTooltip.setAttribute("aria-hidden", "false");
    window.requestAnimationFrame(() => {
      const rect = control.getBoundingClientRect();
      const tip = floatingTooltip.getBoundingClientRect();
      const margin = 12;
      const side = floatingTooltip.dataset.side;
      let left = rect.left + (rect.width - tip.width) / 2;
      let top = rect.top - tip.height - margin;
      if (side === "right") {
        left = rect.right + margin;
        top = rect.top + (rect.height - tip.height) / 2;
      }
      if (side === "left") {
        left = rect.left - tip.width - margin;
        top = rect.top + (rect.height - tip.height) / 2;
      }
      if (side === "bottom") top = rect.bottom + margin;
      left = Math.max(10, Math.min(window.innerWidth - tip.width - 10, left));
      top = Math.max(10, Math.min(window.innerHeight - tip.height - 10, top));
      floatingTooltip.style.left = `${Math.round(left)}px`;
      floatingTooltip.style.top = `${Math.round(top)}px`;
    });
  };
  root.querySelectorAll("[data-tooltip]").forEach((control) => {
    control.addEventListener("pointerenter", () => showFloatingTooltip(control));
    control.addEventListener("mouseenter", () => showFloatingTooltip(control));
    control.addEventListener("pointerleave", hideFloatingTooltip);
    control.addEventListener("mouseleave", hideFloatingTooltip);
    control.addEventListener("focus", () => showFloatingTooltip(control));
    control.addEventListener("blur", hideFloatingTooltip);
    control.addEventListener("click", hideFloatingTooltip);
  });
  root.addEventListener("focusin", (event) => {
    const control = event.target.closest?.("[data-tooltip]");
    if (control) showFloatingTooltip(control);
  });
  root.addEventListener("focusout", (event) => {
    if (event.target.closest?.("[data-tooltip]")) hideFloatingTooltip();
  });
  root.querySelectorAll("[data-nav]").forEach((button) => button.addEventListener("click", () => {
    navigateTo(button.dataset.nav);
  }));
  root.querySelectorAll("[data-settings-open]").forEach((button) => button.addEventListener("click", () => setState({ settingsOpen: true })));
  root.querySelectorAll("[data-settings-close]").forEach((button) => button.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-settings-close") || event.target.closest("button[data-settings-close]")) setState({ settingsOpen: false });
  }));
  root.querySelectorAll("[data-setting]").forEach((button) => button.addEventListener("click", () => {
    const field = button.dataset.setting;
    let value = button.dataset.settingValue;
    if (field === "fontScale") value = Number(value);
    if (field === "ambient") value = value === "true";
    setState({ settings: { ...state.settings, [field]: value } });
  }));
  root.querySelector("[data-settings-reset]")?.addEventListener("click", () => {
    setState({
      settings: { density: "comfortable", cardView: "grid", fontScale: 120, contrast: "normal", motion: "system", ambient: true, readabilityVersion: 3 },
    });
    showStatus("Display settings reset.");
  });
  root.querySelectorAll("[data-activity-open]").forEach((button) => button.addEventListener("click", () => {
    setState({ activityOpen: true, activity: state.activity.map((item) => ({ ...item, read: true })) });
  }));
  root.querySelectorAll("[data-activity-close]").forEach((button) => button.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-activity-close") || event.target.closest("button[data-activity-close]")) setState({ activityOpen: false });
  }));
  root.querySelector("[data-activity-clear]")?.addEventListener("click", () => {
    setState({ activity: [], activityOpen: false });
    showStatus("Local activity history cleared.");
  });
  root.querySelectorAll("[data-card-view]").forEach((button) => button.addEventListener("click", () => {
    setState({ settings: { ...state.settings, cardView: button.dataset.cardView } });
  }));
  root.querySelectorAll("[data-show-all]").forEach((button) => button.addEventListener("click", () => showAllGames()));
  root.querySelectorAll("[data-section-jump]").forEach((button) => button.addEventListener("click", () => {
    scrollToTarget(button.dataset.sectionJump);
  }));
  root.querySelectorAll("[data-open-active-scratch]").forEach((button) => button.addEventListener("click", () => openActiveScratchDirectory()));
  root.querySelectorAll("[data-library-preset]").forEach((button) => button.addEventListener("click", () => showAllGames(button.dataset.libraryPreset)));
  root.querySelectorAll("[data-library-filter]").forEach((button) => button.addEventListener("click", () => {
    setState({ nav: "allgames", libraryFilter: button.dataset.libraryFilter });
  }));
  root.querySelector("[data-library-query]")?.addEventListener("input", (event) => {
    state = { ...state, libraryQuery: event.target.value, nav: "allgames" };
    localStorage.setItem(key, JSON.stringify(state));
    render();
    const input = root.querySelector("[data-library-query]");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  });
  root.querySelectorAll("[data-value-budget]").forEach((button) => button.addEventListener("click", () => {
    setState({ valueBudget: Number(button.dataset.valueBudget) });
  }));
  root.querySelectorAll("[data-value-compare-all]").forEach((button) => button.addEventListener("click", () => {
    const compare = String(button.dataset.valueCompareAll || "")
      .split(",")
      .filter((id) => snapshot.games.some((game) => game.id === id))
      .slice(0, 5);
    if (!compare.length) return;
    setState(withActivity(
      { compare, nav: "scratch", quickCompare: false },
      activityEntry("compare", "Built a value basket", `${compare.length} price-aware ticket profiles added to comparison.`)
    ), ".comparePanel");
    showStatus(`${compare.length} value-lens tickets added to comparison.`);
  }));
  root.querySelectorAll("[data-command-open]").forEach((button) => button.addEventListener("click", () => {
    setState({ command: { ...state.command, open: true, query: "" } });
    window.setTimeout(() => root.querySelector("[data-command-query]")?.focus(), 50);
  }));
  root.querySelector("[data-command-close]")?.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-command-close")) closeCommandPalette();
  });
  root.querySelector("[data-command-query]")?.addEventListener("input", (event) => {
    state = { ...state, command: { ...state.command, query: event.target.value } };
    localStorage.setItem(key, JSON.stringify(state));
    render();
    const input = root.querySelector("[data-command-query]");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  });
  root.querySelector("[data-command-query]")?.addEventListener("keydown", (event) => {
    const results = [...root.querySelectorAll(".commandResult")];
    if (event.key === "ArrowDown" && results.length) {
      event.preventDefault();
      results[0].focus();
    }
    if (event.key === "Enter" && results.length) {
      event.preventDefault();
      results[0].click();
    }
  });
  root.querySelectorAll(".commandResult").forEach((result, index, results) => result.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const next = event.key === "ArrowDown" ? Math.min(results.length - 1, index + 1) : Math.max(0, index - 1);
    results[next].focus();
  }));
  root.querySelectorAll("[data-build-gauge-toggle]").forEach((button) => button.addEventListener("click", () => {
    setState({ buildGauge: { ...state.buildGauge, open: !state.buildGauge.open } });
  }));
  root.querySelectorAll("[data-build-gauge-mode]").forEach((button) => button.addEventListener("click", () => {
    setState({ buildGauge: { ...state.buildGauge, mode: button.dataset.buildGaugeMode } });
  }));
  root.querySelectorAll("[data-build-gauge-scope]").forEach((button) => button.addEventListener("click", () => {
    setState({ buildGauge: { ...state.buildGauge, scope: button.dataset.buildGaugeScope } });
  }));
  root.querySelector("[data-build-gauge-recalculate]")?.addEventListener("click", () => {
    setState({ buildGauge: { ...state.buildGauge, lastRecalculated: new Date().toISOString() } });
    showStatus("Development estimate recalculated from the current project profile.");
  });
  root.querySelector("[data-build-gauge-explain]")?.addEventListener("click", () => {
    setState({ buildGauge: { ...state.buildGauge, explainOpen: !state.buildGauge.explainOpen } });
  });
  root.querySelectorAll("[data-roadmap-feature]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.roadmapFeature;
    const roadmap = state.buildGauge.roadmap.includes(id)
      ? state.buildGauge.roadmap.filter((item) => item !== id)
      : [...state.buildGauge.roadmap, id];
    setState({ buildGauge: { ...state.buildGauge, roadmap } });
  }));
  root.querySelectorAll("[data-build-gauge-year]").forEach((button) => button.addEventListener("click", () => {
    const selectedYear = Math.min(new Date().getFullYear(), Math.max(2010, state.buildGauge.selectedYear + Number(button.dataset.buildGaugeYear)));
    setState({ buildGauge: { ...state.buildGauge, selectedYear } });
  }));
  root.querySelector("[data-build-gauge-range]")?.addEventListener("change", (event) => {
    setState({ buildGauge: { ...state.buildGauge, selectedYear: Number(event.target.value) } });
  });
  root.querySelectorAll("[data-assistant-mode]").forEach((button) => button.addEventListener("click", () => {
    setState({ assistant: { ...state.assistant, open: true, mode: button.dataset.assistantMode } });
  }));
  root.querySelector("[data-assistant-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = root.querySelector("[data-assistant-query]");
    const query = input?.value.trim() || "";
    if (!query) return;
    const game = snapshot.games.find((item) => item.id === detailId)
      || snapshot.games.find((item) => item.id === state.recentViews?.[0])
      || topGame();
    const messages = [
      ...(state.assistant.messages || []),
      { role: "user", text: query },
      { role: "assistant", text: assistantResponse(query, game) },
    ].slice(-12);
    setState({ assistant: { ...state.assistant, open: true, query: "", messages } });
  });
  root.querySelector("[data-assistant-close]")?.addEventListener("click", () => {
    setState({ assistant: { ...state.assistant, open: false } });
  });
  root.querySelector("[data-export-close]")?.addEventListener("click", (event) => {
    if (event.target.hasAttribute("data-export-close") || event.target.closest("button[data-export-close]")) setState({ exportOpen: false });
  });
  root.querySelectorAll("[data-export-format]").forEach((button) => button.addEventListener("click", () => runExport(button.dataset.exportFormat)));
  root.querySelectorAll("[data-save-ticket-note]").forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.saveTicketNote;
    const game = snapshot.games.find((item) => item.id === id);
    const note = root.querySelector(`[data-ticket-note="${id}"]`)?.value.trim() || "";
    setState(withActivity({ ticketNotes: { ...state.ticketNotes, [id]: note } }, activityEntry("save", `${note ? "Saved" : "Cleared"} note for ${game?.name || "ticket"}`, note ? "Private research note updated." : "Private note removed.", id)));
    showStatus(note ? "Research note saved locally." : "Research note cleared.");
  }));
  root.querySelector("[data-theme-toggle]")?.addEventListener("click", () => {
    const theme = document.documentElement.dataset.theme === "night" ? "daytime" : "night";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("scratchscope-theme", theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "night" ? "#071a23" : "#dcecf4");
    render();
  });
  root.querySelector("[data-glow-toggle]")?.addEventListener("click", () => {
    interactionPulse();
    setState({ glowMode: !state.glowMode });
  });
  root.querySelectorAll("[data-home-tab]").forEach((button) => button.addEventListener("click", () => {
    interactionPulse();
    setState({ homeTab: button.dataset.homeTab });
  }));
  root.querySelectorAll("[data-quick-zip]").forEach((button) => button.addEventListener("click", () => {
    interactionPulse("success");
    setState({ zip: button.dataset.quickZip, homeTab: "hotzones" });
    showStatus(`Location updated to ${getLocationProfile(button.dataset.quickZip).city}.`);
  }));
  root.querySelector("[data-refresh]")?.addEventListener("click", () => {
    interactionPulse("success");
    setState(withActivity({ lastRefresh: new Date().toISOString() }, activityEntry("refresh", "Checked cached data", `Last verified ${snapshot.dataHealth.lastVerified}.`)));
    showStatus(`Cached official snapshot checked. Last verified ${snapshot.dataHealth.lastVerified}.`);
  });
  root.querySelector("[data-check-in]")?.addEventListener("click", () => {
    const today = new Date().toISOString().slice(0, 10);
    if ((state.checkInDates || []).includes(today)) {
      showStatus("Today's research check-in is already complete.");
      return;
    }
    interactionPulse("success");
    setState({ checkInDates: [...(state.checkInDates || []), today].slice(-30) });
    showStatus("Daily research check-in complete.");
  });
  root.querySelector("#query")?.addEventListener("input", (event) => setState({ query: event.target.value }));
  const zipInput = root.querySelector("#zip");
  const commitZip = () => {
    const zip = zipInput?.value.replace(/\D/g, "").slice(0, 5) || state.zip;
    if (zip.length === 5 && zip !== state.zip) {
      interactionPulse("success");
      setState({ zip });
      showStatus(`Location updated: ${getLocationProfile(zip).city} (${getLocationProfile(zip).precision}).`);
    }
    else if (zipInput) zipInput.value = state.zip;
  };
  zipInput?.addEventListener("input", (event) => {
    event.target.value = event.target.value.replace(/\D/g, "").slice(0, 5);
  });
  zipInput?.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitZip();
    }
  });
  zipInput?.addEventListener("change", commitZip);
  zipInput?.addEventListener("blur", commitZip);
  root.querySelector("[data-apply-zip]")?.addEventListener("click", commitZip);
  root.querySelectorAll("[data-price]").forEach((button) => button.addEventListener("click", () => setState({ price: button.dataset.price })));
  root.querySelectorAll("[data-discovery-tab]").forEach((button) => button.addEventListener("click", () => setState({ discoveryTab: button.dataset.discoveryTab })));
  root.querySelector("[data-discovery-select]")?.addEventListener("change", (event) => {
    if (event.target.value) setState({ discoveryTab: event.target.value });
  });
  root.querySelector("[data-toggle-advanced]")?.addEventListener("click", () => setState({ filtersOpen: !state.filtersOpen }));
  root.querySelectorAll("[data-filter-field]").forEach((field) => field.addEventListener("change", () => setState({ [field.dataset.filterField]: field.value })));
  root.querySelectorAll("[data-sort]").forEach((button) => button.addEventListener("click", () => setState({ sort: button.dataset.sort })));
  root.querySelectorAll("[data-toggle-filter]").forEach((button) => button.addEventListener("click", () => setState({ [button.dataset.toggleFilter]: !state[button.dataset.toggleFilter] })));
  root.querySelectorAll("[data-match-field]").forEach((field) => field.addEventListener("change", () => setState({ matchmaker: { ...state.matchmaker, [field.dataset.matchField]: field.value } })));
  root.querySelector("[data-state-query]")?.addEventListener("input", (event) => {
    stateHubQuery = event.target.value;
    render();
    const input = root.querySelector("[data-state-query]");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  });
  root.querySelector("[data-beta-query]")?.addEventListener("input", (event) => {
    const query = event.target.value;
    setState({ beta: { ...state.beta, query } });
    const input = root.querySelector("[data-beta-query]");
    input?.focus();
    input?.setSelectionRange(input.value.length, input.value.length);
  });
  root.querySelectorAll("[data-beta-category]").forEach((button) => button.addEventListener("click", () => {
    setState({ beta: { ...state.beta, category: button.dataset.betaCategory } });
  }));
  root.querySelectorAll("[data-beta-pin]").forEach((button) => button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const id = button.dataset.betaPin;
    const wasPinned = state.beta.pinned.includes(id);
    const pinned = wasPinned
      ? state.beta.pinned.filter((item) => item !== id)
      : [id, ...state.beta.pinned];
    setState({ beta: { ...state.beta, pinned } });
    showStatus(wasPinned ? "Beta tool unpinned." : "Beta tool pinned to your dashboard.");
  }));
  root.querySelectorAll("[data-beta-toggle]").forEach((button) => button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const id = button.dataset.betaToggle;
    const wasEnabled = state.beta.enabled.includes(id);
    const enabled = wasEnabled
      ? state.beta.enabled.filter((item) => item !== id)
      : [id, ...state.beta.enabled];
    setState({ beta: { ...state.beta, enabled } });
    showStatus(wasEnabled ? "Beta feature disabled." : "Beta feature enabled.");
  }));
  root.querySelector("[data-beta-clear]")?.addEventListener("click", () => {
    setState({ beta: { ...state.beta, query: "", category: "All" } });
  });
  root.onclick = (event) => {
    if (event.target.closest("button, a, [role='button']")) interactionPulse();
    const official = event.target.closest("[data-official-link]");
    if (official) {
      event.stopPropagation();
    }
    const navTarget = event.target.closest("[data-nav]");
    if (navTarget && !navTarget.matches("button")) {
      event.preventDefault();
      event.stopPropagation();
      navigateTo(navTarget.dataset.nav);
      return;
    }
    const commandAction = event.target.closest("[data-command-action]");
    if (commandAction) {
      event.preventDefault();
      event.stopPropagation();
      runCommand(commandAction.dataset.commandAction);
      return;
    }
    const commandGame = event.target.closest("[data-command-game]");
    if (commandGame) {
      event.preventDefault();
      event.stopPropagation();
      openGameDetail(commandGame.dataset.commandGame);
      return;
    }
    const commandDraw = event.target.closest("[data-command-draw]");
    if (commandDraw) {
      event.preventDefault();
      event.stopPropagation();
      state = { ...state, command: { ...state.command, open: false, query: "" } };
      setState({ nav: "draws", draw: { ...state.draw, focusGameId: commandDraw.dataset.commandDraw } }, "#draw-games");
      return;
    }
    const dockAction = event.target.closest("[data-dock-action]");
    if (dockAction) {
      event.preventDefault();
      event.stopPropagation();
      runCommand(dockAction.dataset.dockAction);
      return;
    }
    const activityGame = event.target.closest("[data-activity-game]");
    if (activityGame) {
      event.preventDefault();
      event.stopPropagation();
      state = { ...state, activityOpen: false };
      openGameDetail(activityGame.dataset.activityGame);
      return;
    }
    const analyticsGame = event.target.closest("[data-analytics-game]");
    if (analyticsGame) {
      event.preventDefault();
      event.stopPropagation();
      openGameDetail(analyticsGame.dataset.analyticsGame);
      return;
    }
    const allDraw = event.target.closest("[data-all-draw]");
    if (allDraw) {
      event.preventDefault();
      event.stopPropagation();
      setState({ nav: "draws", draw: { ...state.draw, focusGameId: allDraw.dataset.allDraw } }, "#draw-games");
      return;
    }
    const assistantAction = event.target.closest("[data-assistant-action]");
    if (assistantAction) {
      event.preventDefault();
      event.stopPropagation();
      const id = assistantAction.dataset.assistantGame;
      if (assistantAction.dataset.assistantAction === "detail") {
        state = { ...state, assistant: { ...state.assistant, open: false } };
        openGameDetail(id);
      }
      if (assistantAction.dataset.assistantAction === "watch") toggleWatch(id);
      if (assistantAction.dataset.assistantAction === "compare") toggleCompare(id);
      return;
    }
    const strategyTarget = event.target.closest("[data-strategy]");
    if (strategyTarget) {
      event.preventDefault();
      event.stopPropagation();
      applyStrategy(strategyTarget.dataset.strategy);
      return;
    }
    const homeAction = event.target.closest("[data-home-action]");
    if (homeAction) {
      event.preventDefault();
      event.stopPropagation();
      const action = homeAction.dataset.homeAction;
      if (action === "refresh") {
        setState(withActivity({ lastRefresh: new Date().toISOString() }, activityEntry("refresh", "Checked cached data", `Last verified ${snapshot.dataHealth.lastVerified}.`)));
        showStatus(`Cached official snapshot checked. Last verified ${snapshot.dataHealth.lastVerified}.`);
        return;
      }
      if (action === "compare") {
        setState({ nav: "scratch", quickCompare: true }, ".ticketWallPanel");
        return;
      }
      if (action === "value-lens") {
        setState({ nav: "home" }, ".valueOpportunityBoard");
        return;
      }
      if (action === "filters" || action === "search") {
        setState({ nav: "scratch", filtersOpen: true }, ".kioskFilters");
        if (action === "search") {
          window.setTimeout(() => root.querySelector("#query")?.focus(), 90);
        }
        return;
      }
    }
    const betaAction = event.target.closest("[data-beta-action]");
    if (betaAction) {
      event.preventDefault();
      event.stopPropagation();
      applyBetaAction(betaAction.dataset.betaAction);
      return;
    }
    const betaPreview = event.target.closest("[data-beta-preview]");
    if (betaPreview) {
      event.preventDefault();
      event.stopPropagation();
      betaPreviewId = betaPreview.dataset.betaPreview;
      render();
      return;
    }
    if (event.target.hasAttribute("data-beta-preview-close") || event.target.closest("button[data-beta-preview-close]")) {
      event.preventDefault();
      event.stopPropagation();
      betaPreviewId = "";
      render();
      return;
    }
    const openDetail = event.target.closest("[data-open-detail]");
    if (openDetail) {
      event.preventDefault();
      event.stopPropagation();
      matchmakerOpen = false;
      openGameDetail(openDetail.dataset.openDetail);
      return;
    }
    if (event.target.closest("[data-open-matchmaker]")) {
      event.preventDefault();
      event.stopPropagation();
      matchmakerOpen = true;
      render();
      return;
    }
    if (event.target.closest("[data-close-matchmaker]") || event.target.hasAttribute("data-matchmaker-backdrop")) {
      event.preventDefault();
      event.stopPropagation();
      matchmakerOpen = false;
      render();
      return;
    }
    if (event.target.closest("[data-open-state-hub]")) {
      event.preventDefault();
      event.stopPropagation();
      stateHubOpen = true;
      render();
      return;
    }
    if (event.target.closest("[data-close-state-hub]") || event.target.hasAttribute("data-state-hub-backdrop")) {
      event.preventDefault();
      event.stopPropagation();
      stateHubOpen = false;
      render();
      return;
    }
    const watchTicket = event.target.closest("[data-watch-ticket]");
    if (watchTicket) {
      event.preventDefault();
      event.stopPropagation();
      toggleWatch(watchTicket.dataset.watchTicket);
      return;
    }
    const favoriteTicket = event.target.closest("[data-favorite-ticket]");
    if (favoriteTicket) {
      event.preventDefault();
      event.stopPropagation();
      toggleFavorite(favoriteTicket.dataset.favoriteTicket);
      return;
    }
    const compareButton = event.target.closest("[data-compare]");
    if (compareButton) {
      event.preventDefault();
      event.stopPropagation();
      toggleCompare(compareButton.dataset.compare);
      return;
    }
    const aiExplainButton = event.target.closest("[data-ai-explain]");
    if (aiExplainButton) {
      event.preventDefault();
      event.stopPropagation();
      aiExplainId = aiExplainButton.dataset.aiExplain;
      render();
      return;
    }
    if (event.target.closest("[data-ai-close]")) {
      event.preventDefault();
      event.stopPropagation();
      aiExplainId = "";
      render();
      return;
    }
    if (event.target.closest("[data-clear-compare]")) {
      event.preventDefault();
      event.stopPropagation();
      setState({ compare: [] });
      return;
    }
    if (event.target.closest("[data-jump-compare]")) {
      event.preventDefault();
      event.stopPropagation();
      setState({ nav: "analytics" }, ".comparePanel");
      return;
    }
    if (event.target.closest("[data-clear-filters]")) {
      event.preventDefault();
      setState({ query: "", price: "all", status: "all", discoveryTab: "all", minPrize: "", maxOdds: "", minTopRemaining: "", hideNoTop: false, newOnly: false, endingSoon: false, sort: "score" });
      return;
    }
    const focusDraw = event.target.closest("[data-focus-draw]");
    if (focusDraw) {
      event.preventDefault();
      event.stopPropagation();
      setDrawState({ focusGameId: focusDraw.dataset.focusDraw });
      return;
    }
    const dailyDraw = event.target.closest("[data-daily-draw]");
    if (dailyDraw) {
      event.preventDefault();
      event.stopPropagation();
      setState({ nav: "draws", draw: { ...state.draw, focusGameId: dailyDraw.dataset.dailyDraw } }, "#draw-games");
      return;
    }
    const watchDraw = event.target.closest("[data-watch-draw]");
    if (watchDraw) {
      event.preventDefault();
      event.stopPropagation();
      const id = watchDraw.dataset.watchDraw;
      const game = drawSnapshot.games.find((item) => item.gameId === id);
      const removing = state.draw.watchlist.includes(id);
      const watchlist = state.draw.watchlist.includes(id) ? state.draw.watchlist.filter((item) => item !== id) : [...state.draw.watchlist, id];
      setState(withActivity({ draw: { ...state.draw, watchlist } }, activityEntry("save", `${removing ? "Stopped watching" : "Watched"} ${game?.gameName || "draw game"}`, "Draw-game watchlist updated.")));
      return;
    }
    const compareDraw = event.target.closest("[data-compare-draw]");
    if (compareDraw) {
      event.preventDefault();
      event.stopPropagation();
      const id = compareDraw.dataset.compareDraw;
      const compareDraws = state.draw.compareDraws.includes(id) ? state.draw.compareDraws.filter((item) => item !== id) : [...state.draw.compareDraws, id].slice(-4);
      setDrawState({ compareDraws });
      return;
    }
    const pickMode = event.target.closest("[data-pick-mode]");
    if (pickMode) {
      event.preventDefault();
      event.stopPropagation();
      setDrawState({ pickMode: pickMode.dataset.pickMode });
      return;
    }
    const generate = event.target.closest("[data-generate-pick]");
    if (generate) {
      event.preventDefault();
      event.stopPropagation();
      const game = drawSnapshot.games.find((item) => item.gameId === generate.dataset.generatePick) || drawSnapshot.games[0];
      setState(withActivity({ draw: { ...state.draw, generatedPick: generateSmartPick(game, state.draw.pickMode || "balanced") } }, activityEntry("view", `Generated ${game.gameName} set`, `${state.draw.pickMode || "balanced"} entertainment mode.`)));
      return;
    }
    const savePick = event.target.closest("[data-save-pick]");
    if (savePick) {
      event.preventDefault();
      event.stopPropagation();
      const pick = findGeneratedPick(savePick.dataset.savePick);
      if (pick && !state.draw.savedPicks.some((item) => item.id === pick.id)) {
        setState(withActivity({ draw: { ...state.draw, savedPicks: [pick, ...state.draw.savedPicks].slice(0, 24) } }, activityEntry("save", `Saved ${pick.gameName} numbers`, pickText(pick))));
      }
      return;
    }
    const favoritePick = event.target.closest("[data-favorite-pick]");
    if (favoritePick) {
      event.preventDefault();
      event.stopPropagation();
      const savedPicks = state.draw.savedPicks.map((pick) => pick.id === favoritePick.dataset.favoritePick ? { ...pick, favorite: !pick.favorite } : pick);
      setDrawState({ savedPicks });
      return;
    }
    const deletePick = event.target.closest("[data-delete-pick]");
    if (deletePick) {
      event.preventDefault();
      event.stopPropagation();
      setDrawState({ savedPicks: state.draw.savedPicks.filter((pick) => pick.id !== deletePick.dataset.deletePick) });
      return;
    }
    const copyPick = event.target.closest("[data-copy-pick], [data-copy-saved]");
    if (copyPick) {
      event.preventDefault();
      event.stopPropagation();
      const id = copyPick.dataset.copyPick || copyPick.dataset.copySaved;
      const pick = findGeneratedPick(id);
      if (pick) {
        if (navigator.clipboard?.writeText) {
          navigator.clipboard.writeText(pickText(pick)).then(() => showStatus("Numbers copied.")).catch(() => showStatus("Copy was unavailable."));
        } else {
          showStatus("Copy was unavailable.");
        }
      }
      return;
    }
    const checkSaved = event.target.closest("[data-check-saved]");
    if (checkSaved) {
      event.preventDefault();
      const game = drawSnapshot.games.find((item) => item.gameId === checkSaved.dataset.checkSaved);
      const result = game?.lastResults?.find((item) => item.numbers?.length);
      const picks = state.draw.savedPicks.filter((pick) => pick.gameId === game?.gameId);
      if (!picks.length) showStatus(`No saved ${game?.gameName || "game"} numbers to check.`);
      else if (!result) showStatus("No result is available in the cached snapshot.");
      else {
        const best = Math.max(...picks.map((pick) => pick.numbers.filter((number) => result.numbers.includes(number)).length));
        showStatus(`Best cached match: ${best} number${best === 1 ? "" : "s"}. Verify officially.`);
      }
      return;
    }
  };
  root.querySelector("[data-quick-compare]")?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setState({ quickCompare: !state.quickCompare });
  });
  root.querySelectorAll("[data-clear-compare]").forEach((button) => button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    setState({ compare: [] });
  }));
  root.querySelectorAll("[data-detail]").forEach((node) => node.addEventListener("click", (event) => {
    if (event.target.closest("a,button,input,select,textarea")) return;
    event.preventDefault();
    event.stopPropagation();
    if (state.quickCompare) toggleCompare(node.dataset.detail);
    else {
      openGameDetail(node.dataset.detail);
    }
  }));
  root.querySelectorAll('[data-detail][role="button"]').forEach((node) => node.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (state.quickCompare) toggleCompare(node.dataset.detail);
    else {
      openGameDetail(node.dataset.detail);
    }
  }));
  root.querySelectorAll("[data-ai-close]").forEach((node) => node.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    aiExplainId = "";
    render();
  }));
  root.querySelectorAll("[data-close-matchmaker]").forEach((node) => node.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    matchmakerOpen = false;
    render();
  }));
  root.querySelectorAll("[data-close-state-hub]").forEach((node) => node.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    stateHubOpen = false;
    render();
  }));
  root.querySelectorAll("[data-close]").forEach((node) => node.addEventListener("click", (event) => {
    if (event.target !== node && !event.target.closest("button[data-close]")) return;
    detailId = "";
    render();
  }));
  root.querySelectorAll("[data-stop]").forEach((node) => node.addEventListener("click", (event) => {
    if (event.target === node) event.stopPropagation();
  }));
  root.querySelectorAll("[data-budget]").forEach((field) => {
    const updateBudget = (event) => setState({ budget: { ...state.budget, [event.target.dataset.budget]: event.target.value } });
    field.addEventListener(field.tagName === "SELECT" || field.type === "range" ? "input" : "change", updateBudget);
  });
  root.querySelector("[data-export]")?.addEventListener("click", () => {
    setState({ exportOpen: true });
  });
}

render();

document.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    const dialog = root.querySelector('[role="dialog"]');
    if (dialog) {
      const focusable = [...dialog.querySelectorAll('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter((node) => node.offsetParent !== null);
      if (focusable.length) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
          return;
        }
        if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
          return;
        }
      }
    }
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const open = !state.command.open;
    setState({ command: { ...state.command, open, query: "" } });
    if (open) window.setTimeout(() => root.querySelector("[data-command-query]")?.focus(), 50);
    return;
  }
  if (event.key === "Escape" && state.command.open) {
    closeCommandPalette();
    return;
  }
  if (event.key === "Escape" && state.settingsOpen) {
    setState({ settingsOpen: false });
    return;
  }
  if (event.key === "Escape" && state.activityOpen) {
    setState({ activityOpen: false });
    return;
  }
  if (event.key === "Escape" && state.exportOpen) {
    setState({ exportOpen: false });
    return;
  }
  if (event.key === "Escape" && state.assistant.open) {
    setState({ assistant: { ...state.assistant, open: false } });
    return;
  }
  if (event.key === "Escape" && state.buildGauge.open) {
    setState({ buildGauge: { ...state.buildGauge, open: false } });
    return;
  }
  if (event.key === "Escape" && stateHubOpen) {
    stateHubOpen = false;
    render();
    return;
  }
  if (event.key === "Escape" && betaPreviewId) {
    betaPreviewId = "";
    render();
    return;
  }
  if (event.key === "Escape" && matchmakerOpen) {
    matchmakerOpen = false;
    render();
    return;
  }
  if (event.key === "Escape" && aiExplainId) {
    aiExplainId = "";
    render();
    return;
  }
  if (event.key === "Escape" && detailId) {
    detailId = "";
    render();
  }
});

window.setInterval(updateCountdowns, 30000);
window.addEventListener("online", () => {
  onlineState = true;
  showStatus("Connection restored. Official links and map tiles are available.");
});
window.addEventListener("offline", () => {
  onlineState = false;
  showStatus("Offline mode. Cached ScratchScope data remains available.");
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => undefined));
}
