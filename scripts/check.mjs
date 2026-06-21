import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { betaFeatures } from "../src/components/BetaLab.js";
import { officialGames, officialWinners } from "../src/data/officialSnapshot.js";
import { drawGames } from "../src/data/drawGamesData.js";
import { generateSmartPick, getDrawSnapshot } from "../src/services/drawGameService.js";
import { buildDailyPlayPlan } from "../src/services/dailyPlayPlanService.js";
import { getLotterySnapshot } from "../src/services/lotteryDataService.js";
import { locationRecommendations } from "../src/services/locationIntelligenceService.js";
import { estimateBuildGauge } from "../src/components/VirtualBuildGauge.js";

const required = [
  "index.html",
  "src/app.js",
  "src/styles.css",
  "src/components/GameDetailDrawer.js",
  "src/components/CommandCenter.js",
  "src/components/AIAssistantPanel.js",
  "src/components/ActivityCenter.js",
  "src/components/AnalyticsWorkbench.js",
  "src/components/SavedWorkspace.js",
  "src/components/ValueOpportunityBoard.js",
  "src/components/AllGamesExplorer.js",
  "src/components/LotteryHub.js",
  "src/components/VirtualBuildGauge.js",
  "src/components/WorkspaceSettings.js",
  "public/manifest.webmanifest",
  "public/sw.js",
  "docs/README.md",
  "docs/RESPONSIBLE_PLAY.md",
];

const sources = Object.fromEntries(required.map((file) => [file, readFileSync(file, "utf8")]));
const app = sources["src/app.js"];
const html = sources["index.html"];
const styles = sources["src/styles.css"];
const detailDrawer = sources["src/components/GameDetailDrawer.js"];
const interactionSource = [
  app,
  sources["src/components/CommandCenter.js"],
  sources["src/components/AIAssistantPanel.js"],
  sources["src/components/ActivityCenter.js"],
  sources["src/components/AnalyticsWorkbench.js"],
  sources["src/components/SavedWorkspace.js"],
  sources["src/components/ValueOpportunityBoard.js"],
  sources["src/components/AllGamesExplorer.js"],
  sources["src/components/LotteryHub.js"],
  sources["src/components/VirtualBuildGauge.js"],
  sources["src/components/WorkspaceSettings.js"],
].join("\n");

function assert(condition, message) {
  if (!condition) throw new Error(`Audit check failed: ${message}`);
}

for (const file of [
  "src/app.js",
  "src/components/DrawGamesDashboard.js",
  "src/components/CommandCenter.js",
  "src/components/AIAssistantPanel.js",
  "src/components/ActivityCenter.js",
  "src/components/AnalyticsWorkbench.js",
  "src/components/SavedWorkspace.js",
  "src/components/ValueOpportunityBoard.js",
  "src/components/AllGamesExplorer.js",
  "src/components/LotteryHub.js",
  "src/components/BetaLab.js",
  "src/components/VirtualBuildGauge.js",
  "src/components/WorkspaceSettings.js",
  "src/components/DailyPlayPlan.js",
  "src/services/dailyPlayPlanService.js",
  "src/services/drawGameService.js",
  "src/services/lotteryDataService.js",
]) {
  execFileSync(process.execPath, ["--check", file], { stdio: "inherit" });
}

const routeIds = ["home", "allgames", "scratch", "draws", "hotzones", "saved", "analytics", "beta"];
for (const route of routeIds) {
  assert(app.includes(`["${route}",`), `navigation route "${route}" is missing`);
}
assert(app.includes('root.querySelectorAll("[data-nav]")'), "navigation buttons are not wired");

const actionSelectors = [
  "data-theme-toggle",
  "data-ai-explain",
  "data-ai-close",
  "data-toggle-advanced",
  "data-discovery-select",
  "data-clear-filters",
  "data-compare",
  "data-clear-compare",
  "data-generate-pick",
  "data-save-pick",
  "data-copy-pick",
  "data-delete-pick",
  "data-check-saved",
  "data-export",
  "data-close",
  "data-glow-toggle",
  "data-home-tab",
  "data-quick-zip",
  "data-refresh",
  "data-check-in",
  "data-beta-pin",
  "data-beta-toggle",
  "data-beta-action",
  "data-beta-preview",
  "data-favorite-ticket",
  "data-command-open",
  "data-command-action",
  "data-dock-action",
  "data-assistant-mode",
  "data-export-format",
  "data-build-gauge-mode",
  "data-roadmap-feature",
  "data-settings-open",
  "data-setting",
  "data-activity-open",
  "data-save-ticket-note",
  "data-assistant-form",
  "data-card-view",
  "data-analytics-game",
  "data-pick-mode",
  "data-value-budget",
  "data-value-compare-all",
  "data-show-all",
  "data-open-active-scratch",
  "data-library-preset",
  "data-library-filter",
  "data-library-query",
  "data-all-draw",
  "data-command-draw",
  "data-build-gauge-scope",
  "data-build-gauge-recalculate",
  "data-build-gauge-explain",
  "data-section-jump",
];
for (const action of actionSelectors) {
  assert(interactionSource.includes(action), `${action} is missing from the interaction layer`);
}

assert(html.includes('saved === "night" || saved === "daytime"'), "saved theme preference is not restored");
assert(html.includes(': "daytime"'), "Daytime is not the first-run default");
assert(styles.includes('html[data-theme="night"]'), "explicit Night theme styles are missing");
assert(app.includes('localStorage.setItem("scratchscope-theme", theme)'), "manual theme preference is not persisted");

const lotterySnapshot = getLotterySnapshot();
const drawSnapshot = getDrawSnapshot();
const dailyPlan = buildDailyPlayPlan(
  { budget: 60, zip: "27617", date: new Date("2026-06-05T12:00:00-04:00") },
  lotterySnapshot.games,
  drawSnapshot.games,
  locationRecommendations(lotterySnapshot.winners, "27617")
);
assert(lotterySnapshot.games.length === officialGames.length && lotterySnapshot.games.length > 0, "scratch-off snapshot did not load");
assert(lotterySnapshot.winners.length === officialWinners.length && officialWinners.length > 0, "winner article data did not load");
assert(lotterySnapshot.games.every((game) => game.sourceUrl?.startsWith("https://nclottery.com/")), "scratch-off record lacks an official source");
assert(dailyPlan.total === 60 && dailyPlan.remaining === 0, "$60 daily plan is not fully allocated");
assert(dailyPlan.scratch.total === 45 && dailyPlan.draws.total === 15, "daily plan allocation changed unexpectedly");
assert(dailyPlan.locations.length > 0, "daily plan has no location research signals");

const unavailableIds = new Set(drawGames.filter((game) => game.dataAvailability === "unavailable").map((game) => game.gameId));
assert(unavailableIds.size > 0, "no unavailable-game protection is configured");
assert(drawSnapshot.games.every((game) => game.status !== "ended" && !unavailableIds.has(game.gameId)), "dead or unavailable draw game reached the active dashboard");
assert(drawSnapshot.unavailableGames.every((game) => game.unavailableReason), "Coming Soon game lacks a clear reason");
assert(app.includes("No games match these filters."), "scratch-off empty state is missing");
assert(app.includes("statusToast"), "action success/error feedback is missing");
assert(app.includes('id="home-intelligence-title">ScratchScope'), "compact intelligence-first home screen is missing");
assert(app.includes("Today's Best Plays"), "premium best-plays hero is missing");
assert(app.includes('nav: "home"'), "premium home is not the first-run route");
assert(app.includes("getLocationProfile"), "ZIP location profiles are not connected");
assert(styles.includes(".todayPlaysHero") && styles.includes(".revealCard"), "premium glass home styles are missing");
assert(styles.includes('html[data-glow="off"]'), "casino glow preference styling is missing");
assert(app.includes("BetaLab"), "beta feature hub is missing");
assert(betaFeatures.length >= 35, "Beta Lab must expose at least 35 experiments");
assert(new Set(betaFeatures.map((feature) => feature.id)).size === betaFeatures.length, "duplicate Beta Lab feature ID detected");
for (const requiredFeature of [
  "Best Value Radar",
  "Prize Heat Meter",
  "Budget Picker",
  "Smart Compare",
  "Pinned Dashboard Widgets",
  "Clean Pro Mode",
]) {
  assert(betaFeatures.some((feature) => feature.name === requiredFeature), `${requiredFeature} is missing from Beta Lab`);
}
assert(app.includes("PinnedBetaWidgets"), "pinned Beta Lab dashboard widgets are missing");
assert(app.includes("scratchFavorites"), "persistent ticket favorites are missing");
assert(app.includes("homeQuickActions") && app.includes("data-home-action"), "home quick actions are missing");
assert(app.includes("microBars") && styles.includes(".confidenceRing"), "home micro-visualizations are missing");
assert(styles.includes(".betaFeaturePreview"), "Beta Lab feature thumbnails are missing");
assert(app.includes("Today's strongest ticket signals."), "compact hero summary is missing");
assert(app.includes("revealSignalGrid") && styles.includes("Ticket-first hero optimization"), "ticket-first hero signals are missing");
assert(styles.includes("Fixed-footprint dashboard readability pass"), "fixed-footprint readability styles are missing");
assert(app.includes("Scores are relative research indices, not win probabilities."), "home score disclosure is missing");
assert(styles.includes("--type-hero") && styles.includes("--space-xxl") && styles.includes("--radius-hero"), "unified design tokens are incomplete");
assert(styles.includes("@media (prefers-reduced-motion: reduce)"), "reduced-motion support is missing");
assert(styles.includes(".homePulseCard button") && styles.includes("min-height: 44px"), "minimum touch target styling is missing");
assert(detailDrawer.includes('class="detailAtGlance"'), "ticket detail quick-facts panel is missing");
assert(detailDrawer.includes("Top Prizes Left") && detailDrawer.includes("Displayed Prizes Left"), "ticket prize availability facts are missing");
assert(detailDrawer.includes("Latest Matched Win") && detailDrawer.includes("Largest Prize Claimed"), "ticket winner summary is missing");
assert(app.includes("snapshot.winners)"), "winner data is not connected to ticket details");
assert(app.includes("VirtualBuildGauge(state.buildGauge)"), "virtual build gauge is not mounted");
assert(app.includes("data-build-gauge-toggle"), "virtual build gauge interactions are not wired");
assert(styles.includes(".virtualBuildGauge") && styles.includes(".buildGaugePanel"), "virtual build gauge styles are missing");
assert(app.includes("AI Insight") && app.includes("Trend Monitor"), "AI intelligence status indicators are missing");
assert(app.includes("CommandPalette(state.command.open"), "command palette is not mounted");
assert(app.includes("FloatingCommandDock"), "floating command center is not mounted");
assert(app.includes("AIAssistantPanel"), "persistent AI assistant is not mounted");
assert(app.includes("ExportStudio"), "export studio is not mounted");
assert(app.includes("WorkspaceSettings(state.settingsOpen"), "workspace settings are not mounted");
assert(app.includes("ActivityCenter(state.activityOpen"), "activity center is not mounted");
assert(app.includes("AnalyticsWorkbench(snapshot.games"), "analytics workbench is not mounted");
assert(app.includes("SavedWorkspace({"), "saved research workspace is not mounted");
assert(app.includes("ValueOpportunityBoard(snapshot.games"), "value opportunity board is not mounted");
assert(app.includes("AllGamesExplorer({"), "all-games explorer is not mounted");
assert(app.includes("ActiveScratchDirectory("), "active scratch-off directory is not mounted");
assert(app.includes("LotteryHub({"), "lottery hub is not mounted");
assert(app.includes('class="allGamesHeaderButton"'), "prominent header All Games access is missing");
assert(app.includes('["allgames", "All Games"') && app.includes('["allgames", "All"'), "desktop or mobile All Games navigation is missing");
assert(app.includes("function showAllGames") && app.includes("compare: []"), "Show All does not clear temporary views");
assert(app.includes('action === "value-lens"'), "value lens shortcut is not wired");
assert(app.includes('id="main-content" tabindex="-1"'), "focusable main landmark is missing");
assert(app.includes("function navigateTo(nav)") && app.includes("window.scrollTo(0, 0)"), "route changes do not restore the page origin");
assert(app.includes('event.key.toLowerCase() === "k"'), "Ctrl/Cmd+K command shortcut is missing");
assert(styles.includes(".commandPalette") && styles.includes(".floatingCommandDock"), "command center styling is missing");
assert(styles.includes(".floatingControlTooltip") && app.includes("data-tooltip"), "floating-control hover help is missing");
assert(sources["src/components/CommandCenter.js"].includes("data-tooltip") && sources["src/components/VirtualBuildGauge.js"].includes("data-tooltip"), "dock or build-gauge help text is missing");
assert(app.includes("fontScale: 120") && app.includes("readabilityVersion: 3"), "easy-read default zoom is missing");
assert(!html.includes("maximum-scale") && !html.includes("user-scalable=no"), "browser pinch zoom must remain available");
assert(styles.includes(".assistantPanel") && styles.includes(".exportStudio"), "assistant or export styling is missing");
assert(styles.includes(".analyticsWorkbench") && styles.includes(".savedWorkspace"), "analytics or saved workspace styling is missing");
assert(styles.includes(".workspaceSettings") && styles.includes(".activityCenter"), "settings or activity center styling is missing");
assert(styles.includes(".valueOpportunityBoard") && styles.includes(".valueBoardGrid"), "value lens styling is missing");
assert(styles.includes(".allGamesExplorer") && styles.includes(".gameLibraryGrid"), "all-games explorer styling is missing");
assert(styles.includes(".lotteryHub") && styles.includes(".scratchDirectoryGrid"), "lottery hub or active directory styling is missing");
assert(styles.includes(".frontierGrid") && styles.includes(".priceBandChips"), "analytics value frontier styling is missing");
assert(detailDrawer.includes("Prize depth engine") && detailDrawer.includes("Similar games"), "detail intelligence expansion is missing");

const valueBoard = sources["src/components/ValueOpportunityBoard.js"];
const scratchCard = readFileSync("src/components/ScratchCard.js", "utf8");
const analyticsWorkbench = sources["src/components/AnalyticsWorkbench.js"];
const allGamesExplorer = sources["src/components/AllGamesExplorer.js"];
const lotteryHub = sources["src/components/LotteryHub.js"];
const commandCenter = sources["src/components/CommandCenter.js"];
assert(valueBoard.includes("Best balanced profile") && valueBoard.includes("Budget sandbox"), "value lens decision surfaces are incomplete");
assert(valueBoard.includes("This does not improve lottery odds."), "value lens responsible-play disclosure is missing");
assert(scratchCard.includes("<small>Buy</small>") && scratchCard.includes("<small>Health</small>") && scratchCard.includes("<small>Data</small>"), "ticket cards do not expose the refined value indicators");
assert(analyticsWorkbench.includes("Balanced opportunities") && analyticsWorkbench.includes("bestBuyScore"), "analytics value frontier is missing");
assert(allGamesExplorer.includes("Search every game") && allGamesExplorer.includes("Active Scratch-Offs"), "universal game discovery surfaces are incomplete");
assert(allGamesExplorer.includes("Top Prize") && allGamesExplorer.includes("Top Left") && allGamesExplorer.includes("Prize Depth"), "active scratch directory facts are incomplete");
assert(lotteryHub.includes("View All Games") && lotteryHub.includes("Active Scratch-Offs") && lotteryHub.includes("Draw Games"), "lottery hub quick access is incomplete");
for (const dockAction of ["show-all", "active-scratch", "draws", "watchlist", "favorites", "assistant", "gauge", "search-games", "recent"]) {
  assert(commandCenter.includes(`"${dockAction}"`), `floating command dock action "${dockAction}" is missing`);
}
for (const commandId of ["show-all", "active-scratch", "lottery-hub", "search-games"]) {
  assert(commandCenter.includes(`id: "${commandId}"`), `command palette command "${commandId}" is missing`);
}

const drawDashboard = readFileSync("src/components/DrawGamesDashboard.js", "utf8");
assert(drawDashboard.includes("heatMeter(focus)") && drawDashboard.includes("numberIntelligence(focus)"), "draw intelligence modules are not mounted");
assert(drawDashboard.includes('"balanced", "Balanced"') && drawDashboard.includes('"spread", "Wide Spread"') && drawDashboard.includes('"random", "Pure Random"'), "draw quick-pick modes are incomplete");
const pickGame = drawSnapshot.games.find((game) => game.pickCount || game.gameId.includes("pick-")) || drawSnapshot.games[0];
for (const mode of ["balanced", "spread", "random"]) {
  const pick = generateSmartPick(pickGame, mode);
  const expected = pickGame.pickCount || (pickGame.gameId === "pick-3" ? 3 : pickGame.gameId === "pick-4" ? 4 : 5);
  assert(pick.mode === mode, `${mode} draw-pick mode was not preserved`);
  assert(pick.numbers.length === expected && new Set(pick.numbers).size === expected, `${mode} draw-pick generated an invalid number set`);
  assert(/entertainment only/i.test(pick.notes), `${mode} draw-pick is missing responsible-play framing`);
}

const build2010 = estimateBuildGauge(2010, 2026);
const build2016 = estimateBuildGauge(2016, 2026);
const build2026 = estimateBuildGauge(2026, 2026);
assert(build2010.minHours > build2016.minHours && build2016.minHours > build2026.minHours, "build gauge effort must decrease over time");
assert(build2016.selectedYear === 2016 && build2016.defaultYear === 2016, "build gauge default year changed");
assert(build2016.factors.length >= 17, "build gauge factors are incomplete");
assert(build2016.breakdown.length >= 15, "build gauge engineering breakdown is incomplete");
assert(build2016.replacementCost > 0 && build2016.teamSize >= 2, "build gauge executive model is incomplete");
const hubBuild = estimateBuildGauge(2016, 2026, "hub");
assert(hubBuild.scopeId === "hub" && hubBuild.maxHours < build2016.maxHours, "build gauge module scopes are not applied");
assert(build2016.enterpriseReplacementCost > build2016.replacementCost && build2016.aiAssistedHours > 0, "build gauge value model is incomplete");
assert(build2016.complexityScore > 0 && build2016.confidenceScore > 0, "build gauge scoring model is incomplete");
assert(build2016.profile.components > 0 && build2016.profile.aiFeatures > 0, "build gauge project profile is incomplete");
assert(build2016.increases.length >= 5, "build gauge complexity drivers are incomplete");

for (const game of lotterySnapshot.games) {
  assert(game.intelligence.metrics?.length === 11, `${game.name} does not expose the complete metric dashboard`);
  assert(game.intelligence.metrics.every((metric) => metric.value >= 0 && metric.value <= 100), `${game.name} has an out-of-range metric`);
}

const activeSourceText = [
  readFileSync("src/data/officialSnapshot.js", "utf8"),
  readFileSync("src/data/drawGamesData.js", "utf8"),
].join("\n");
assert(!/\bDEMO\b|\bTODO\b|Latest mock results/i.test(activeSourceText), "demo or TODO data remains in active data files");

const ids = officialGames.map((game) => game.id);
const drawIds = drawGames.map((game) => game.gameId);
assert(new Set(ids).size === ids.length, "duplicate scratch-off game ID detected");
assert(new Set(drawIds).size === drawIds.length, "duplicate draw game ID detected");

console.log(`ScratchScope audit checks passed: ${routeIds.length} routes, ${lotterySnapshot.games.length} scratch-offs, ${drawSnapshot.games.length} ready draw games, ${drawSnapshot.unavailableGames.length} Coming Soon.`);
