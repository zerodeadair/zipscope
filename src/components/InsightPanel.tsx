import { Activity, AlertTriangle, ArrowRightLeft, Banknote, Binary, Clipboard, ClipboardList, Database, Download, FileDown, HelpCircle, Lightbulb, Printer, RadioTower, Save, ShieldCheck, Sparkles, Target, TrendingDown, TrendingUp, Trophy, Users, WandSparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { DemographicProfile } from "../providers/demographicsProvider";
import { formatNumber, formatOptionalCurrency, formatOptionalPercent, localMarketScore } from "../utils/formatters";
import { buildPremiumSignals, buildSimilarAreas, buildSourceConfidence, buildTopInsights } from "../utils/demographicIntelligence";

type Props = {
  isExportingImage?: boolean;
  onCopySummary?: () => void;
  onExportImage?: () => void;
  onPinRecommended?: () => void;
  onPrintReport?: () => void;
  pinnedCount?: number;
  profile: DemographicProfile;
};

export default function InsightPanel({ isExportingImage = false, onCopySummary, onExportImage, onPinRecommended, onPrintReport, pinnedCount = 0, profile }: Props) {
  const score = localMarketScore(profile);
  const topInsights = buildTopInsights(profile).slice(0, 3);
  const confidence = buildSourceConfidence(profile);
  const similarAreas = buildSimilarAreas(profile);
  const premiumSignals = buildPremiumSignals(profile);
  const pressureSignal = premiumSignals.find((signal) => signal.label === "Cost Pressure Alert");
  const growthSignal = premiumSignals.find((signal) => signal.label === "Growth / Stability Signal");
  const employmentSignal = premiumSignals.find((signal) => signal.label === "Employment Base Proxy");
  const [openWidgets, setOpenWidgets] = useState<Set<string>>(() => new Set(defaultSidebarWidgetIds));
  const [selectedQuestion, setSelectedQuestion] = useState("Why does this ZIP matter?");
  const [copied, setCopied] = useState(false);
  const aiSummary = useMemo(() => buildAiSummary(profile, score, topInsights), [profile, score, topInsights]);
  const futureWidgets = useMemo(() => build2040IntelWidgets(profile, score), [profile, score]);
  const questionAnswer = answerSidebarQuestion(selectedQuestion, profile, score);

  function isWidgetOpen(id: string) {
    return openWidgets.has(id);
  }

  function toggleWidget(id: string) {
    setOpenWidgets((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function copySummary() {
    const text = `${profile.displayName}: ${aiSummary.oneSentence} Market score ${score}. Source: ${profile.sourceName}.`;
    void navigator.clipboard?.writeText(text);
    onCopySummary?.();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <aside className="insight-panel">
      <div className="panel-title">
        <RadioTower size={20} />
        <div>
          <span>AI-style insight summary</span>
          <h2>Local Market Signal</h2>
        </div>
      </div>
      <div className="score-ring">
        <div className="orb-core" />
        <strong>{score}</strong>
        <span>market score</span>
      </div>

      <div className="future-intel-header">
        <span>2040 AI Intelligence</span>
        <strong>Estimated scenario widgets</strong>
      </div>

      <div className="future-widget-stack" aria-label="2040 estimated AI intelligence widgets">
        {futureWidgets.map((widget, index) => (
          <SidebarWidget
            badge="2040 est."
            icon={widget.icon}
            key={widget.id}
            open={isWidgetOpen(widget.id)}
            title={`${String(index + 1).padStart(2, "0")} ${widget.title}`}
            onToggle={() => toggleWidget(widget.id)}
          >
            <div className="future-widget-body">
              <div className="future-widget-score">
                <strong>{widget.value}</strong>
                <span>{widget.label}</span>
              </div>
              <p>{widget.insight}</p>
              <div className="future-widget-metrics">
                {widget.metrics.map((metric) => <MiniMetric key={metric.label} label={metric.label} value={metric.value} />)}
              </div>
              <div className="beta-note">Estimated 2040 scenario signal. Not a verified forecast.</div>
            </div>
          </SidebarWidget>
        ))}
      </div>

      <section className={`sidebar-widget ai-summary-widget ${isWidgetOpen("summary") ? "open" : ""}`}>
        <button className="sidebar-widget-title" type="button" onClick={() => toggleWidget("summary")}>
          <WandSparkles size={16} />
          AI ZIP Summary
          <span>Live</span>
        </button>
        {isWidgetOpen("summary") && (
          <div className="sidebar-widget-body">
            <p>{aiSummary.oneSentence}</p>
            <dl className="summary-stack">
              <div><dt>Stands out</dt><dd>{aiSummary.standsOut}</dd></div>
              <div><dt>Strength</dt><dd>{aiSummary.strength}</dd></div>
              <div><dt>Weakness</dt><dd>{aiSummary.weakness}</dd></div>
              <div><dt>Best use</dt><dd>{aiSummary.bestUse}</dd></div>
            </dl>
            <button className="micro-action-button" type="button" onClick={copySummary}><Clipboard size={14} /> {copied ? "Copied" : "Copy summary"}</button>
          </div>
        )}
      </section>

      <div className="sidebar-intel-card">
        <div className="xai-title"><ClipboardList size={15} /> Top 3 ZIP Insights</div>
        <ol className="sidebar-insight-list">
          {topInsights.map((insight) => <li key={insight}>{insight}</li>)}
        </ol>
      </div>

      <SidebarWidget icon={Sparkles} title="Similar ZIP Finder" badge="Beta" open={isWidgetOpen("similar")} onToggle={() => toggleWidget("similar")}>
        <div className="sidebar-similar-list">
          {similarAreas.map((area) => (
            <a href="#similar-areas" key={area.zip} title={`Beta match: ${area.why}`}>
              <span>{area.zip}</span>
              <strong>{area.city}, {area.stateCode}</strong>
              <em>{area.matchScore}%</em>
            </a>
          ))}
        </div>
        <div className="beta-note">Matches use income, housing, population, education, density, and proximity patterns.</div>
      </SidebarWidget>

      <SidebarWidget icon={Target} title="Opportunity Radar" badge="AI" open={isWidgetOpen("opportunity")} onToggle={() => toggleWidget("opportunity")}>
        <InsightChips items={[
          `Business: ${employmentSignal?.value ?? "Preview"}`,
          `Real estate: ${growthSignal?.value ?? "Preview"}`,
          `Sports/event: ${Math.min(96, score + 18)}/100 est.`,
          `Restaurant/retail: ${profile.population > 35000 ? "High traffic" : "Targeted demand"}`,
        ]} />
      </SidebarWidget>

      <SidebarWidget icon={AlertTriangle} title="Risk Radar" badge="Preview" open={isWidgetOpen("risk")} onToggle={() => toggleWidget("risk")}>
        <InsightChips tone="risk" items={[
          `Affordability: ${pressureSignal?.value ?? "Beta estimate"}`,
          `Vacancy: ${formatOptionalPercent(profile.vacancyRate)}`,
          `Commute burden: ${profile.averageCommuteMinutes === null ? "Unavailable" : `${profile.averageCommuteMinutes.toFixed(1)} min`}`,
          `Poverty pressure: ${formatOptionalPercent(profile.povertyRate)}`,
        ]} />
      </SidebarWidget>

      <SidebarWidget icon={ArrowRightLeft} title="ZIP Comparison Shortcuts" badge="Beta" open={isWidgetOpen("compare")} onToggle={() => toggleWidget("compare")}>
        <div className="sidebar-beta-button-grid">
          {["Nearby ZIP", "Similar ZIP", "Higher income", "Lower cost", "Better sports", "Better growth"].map((label, index) => (
            <button key={label} type="button" disabled={index > 1} title={index > 1 ? `${label} comparison is coming soon.` : `Jump to ${label.toLowerCase()} comparison preview.`}>
              {label}<span>{index > 1 ? "Soon" : "Beta"}</span>
            </button>
          ))}
        </div>
      </SidebarWidget>

      <SidebarWidget icon={Lightbulb} title="AI Tile Recommendation" badge="Smart" open={isWidgetOpen("tiles")} onToggle={() => toggleWidget("tiles")}>
        <InsightChips items={buildTileRecommendations(profile)} />
        <div className="sidebar-inline-actions">
          <button type="button" onClick={onPinRecommended}>Pin recommended</button>
          <a href="#demographics">Show priority tiles</a>
        </div>
      </SidebarWidget>

      <SidebarWidget icon={Trophy} title="Sports Market Pulse" badge="Estimated" open={isWidgetOpen("sports")} onToggle={() => toggleWidget("sports")}>
        <div className="sports-pulse-mini">
          <MiniMetric label="Event demand" value={`${Math.min(96, score + 20)}/100`} />
          <MiniMetric label="Fan intensity" value={`${Math.min(94, Math.round(profile.population / 1000 + score))}/100`} />
          <MiniMetric label="Weekend lift" value={profile.population > 45000 ? "Strong" : "Selective"} />
          <MiniMetric label="Odds intel" value="Preview" />
        </div>
      </SidebarWidget>

      <SidebarWidget icon={FileDown} title="Download / Export Intelligence" badge="Tools" open={isWidgetOpen("export")} onToggle={() => toggleWidget("export")}>
        <div className="sidebar-export-grid">
          <button type="button" onClick={onPrintReport ?? (() => window.print())}><Printer size={14} /> PDF / Print</button>
          <button type="button" onClick={onExportImage} disabled={!onExportImage || isExportingImage}><Download size={14} /> {isExportingImage ? "Building image" : "Full page image"}</button>
          <a href="#infographic"><Download size={14} /> ZIP snapshot</a>
          <button type="button" onClick={copySummary}><Clipboard size={14} /> Quick summary</button>
          <button type="button" disabled title="Comparison saving is coming soon."><Save size={14} /> Save comparison <span>Beta</span></button>
        </div>
        <div className="beta-note">{pinnedCount} pinned tiles print in the executive PDF; full page image captures the whole browser-style dashboard.</div>
      </SidebarWidget>

      <SidebarWidget icon={HelpCircle} title="Ask AI About This ZIP" badge="Preview" open={isWidgetOpen("ask")} onToggle={() => toggleWidget("ask")}>
        <div className="ask-ai-chip-grid">
          {["Why does this ZIP matter?", "Is this ZIP growing?", "Is this ZIP expensive?", "Good for families?", "Good for sports demand?", "Strongest signals?"].map((question) => (
            <button className={selectedQuestion === question ? "active" : ""} type="button" key={question} onClick={() => setSelectedQuestion(question)}>{question}</button>
          ))}
        </div>
        <p className="ask-ai-answer">{questionAnswer}</p>
      </SidebarWidget>

      <div className="xai-panel">
        <div className="xai-title"><Binary size={15} /> Explainability Matrix</div>
        <label>{confidence.label}<span><i style={{ width: `${confidence.score}%` }} /></span></label>
        <label>Source agreement<span><i style={{ width: "76%" }} /></span></label>
        <label>Sports context isolation<span><i style={{ width: "100%" }} /></span></label>
      </div>

      <div className="sidebar-signal-pair">
        <div>
          <TrendingUp size={16} />
          <span>Growth / stability</span>
          <strong>{growthSignal?.value ?? "Beta estimate"}</strong>
        </div>
        <div>
          <TrendingDown size={16} />
          <span>Cost pressure</span>
          <strong>{pressureSignal?.value ?? "Beta estimate"}</strong>
        </div>
      </div>

      <div className="correlation-panel">
        <div className="xai-title"><Activity size={15} /> Signal Balance</div>
        <div className="signal-balance-list">
          {[
            ["Growth", growthSignal?.score ?? 0],
            ["Employment", employmentSignal?.score ?? 0],
            ["Cost pressure", pressureSignal?.score ?? 0],
          ].map(([label, value]) => (
            <label key={label}>
              <span>{label}</span>
              <b>{value}/100</b>
              <i><em style={{ width: `${Math.max(6, Number(value))}%` }} /></i>
            </label>
          ))}
        </div>
      </div>
      <div className="alert-panel">
        <div className="xai-title"><AlertTriangle size={15} /> Source Confidence</div>
        <p>{confidence.note} Missing fields remain unavailable instead of being filled with exact synthetic values.</p>
      </div>
      <SidebarWidget icon={ShieldCheck} title="Confidence / Data Quality" badge={`${confidence.score}%`} open={isWidgetOpen("quality")} onToggle={() => toggleWidget("quality")}>
        <div className="quality-ledger">
          <span><b>Real data</b>{profile.sourceName}</span>
          <span><b>Estimated data</b>Modeled tiles are labeled Estimated</span>
          <span><b>Beta data</b>Similarity, sports, and AI shortcuts</span>
          <span><b>Last updated</b>{new Date(profile.lastUpdated).toLocaleDateString()}</span>
        </div>
      </SidebarWidget>
      <div className="sidebar-action-grid">
        <a href="#similar-areas"><ArrowRightLeft size={15} /> Compare</a>
        <a href="#infographic"><Download size={15} /> Infographic</a>
        <a href="#sources"><Database size={15} /> Sources</a>
        <a href="#ai-tools"><ShieldCheck size={15} /> AI Tools</a>
      </div>
      <div className="mock-banner">Provider trace: {profile.providersUsed.join(", ")}</div>
    </aside>
  );
}

function SidebarWidget({
  icon: Icon,
  title,
  badge,
  open,
  onToggle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  badge: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className={`sidebar-widget ${open ? "open" : ""}`}>
      <button className="sidebar-widget-title" type="button" onClick={onToggle}>
        <Icon size={16} />
        {title}
        <span>{badge}</span>
      </button>
      {open && <div className="sidebar-widget-body">{children}</div>}
    </section>
  );
}

function InsightChips({ items, tone = "opportunity" }: { items: string[]; tone?: "opportunity" | "risk" }) {
  return (
    <div className={`insight-chip-stack ${tone}`}>
      {items.map((item) => <button key={item} type="button" title="Click interaction preview">{item}</button>)}
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

type FutureIntelWidget = {
  icon: LucideIcon;
  id: string;
  insight: string;
  label: string;
  metrics: Array<{ label: string; value: string }>;
  title: string;
  value: string;
};

function build2040IntelWidgets(profile: DemographicProfile, score: number): FutureIntelWidget[] {
  const income = profile.medianHouseholdIncome ?? 56000;
  const home = profile.medianHomeValue ?? income * 3.2;
  const poverty = profile.povertyRate ?? 0.12;
  const owner = profile.ownerOccupiedRate ?? 0.58;
  const vacancy = profile.vacancyRate ?? 0.08;
  const commute = profile.averageCommuteMinutes ?? 24;
  const bachelors = profile.bachelorsOrHigherRate ?? 0.24;
  const age = profile.medianAge ?? 40;
  const highSchool = profile.highSchoolGradRate ?? 0.84;
  const population = profile.population;
  const affordabilityRatio = home / Math.max(income, 1);
  const densityProxy = Math.round(clamp(population / Math.max((profile.housingUnits ?? 15000) / 520, 8), 120, 5200));
  const digital = Math.round(clamp(50 + income / 2600 + bachelors * 38 - poverty * 35, 30, 98));
  const mobility = Math.round(clamp(88 - commute * 1.4 + densityProxy / 90 + owner * 12, 18, 96));
  const family = Math.round(clamp(owner * 34 + highSchool * 24 + (100 - poverty * 100) * 0.22 + Math.max(0, 42 - age) * 0.4, 16, 96));
  const senior = Math.round(clamp(12 + Math.max(0, age - 38) * 1.05 + owner * 9, 8, 38));
  const climate = Math.round(clamp((["FL", "LA", "TX", "MS", "AL", "SC", "NC"].includes(profile.place?.stateCode ?? "") ? 62 : 42) + vacancy * 90, 18, 92));
  const sports = Math.round(clamp(score + population / 1700 + digital * 0.12 - Math.abs(age - 38) * 0.7, 18, 98));
  const costPressure = Math.round(clamp(affordabilityRatio * 12 + poverty * 52 + vacancy * 45, 12, 96));
  const resilience = Math.round(clamp(score * 0.42 + owner * 28 + highSchool * 18 + (1 - vacancy) * 16, 12, 98));
  const localCommerce = Math.round(clamp(population / 1000 + income / 2600 + mobility * 0.22 + digital * 0.16, 12, 98));
  const talent = Math.round(clamp(bachelors * 58 + digital * 0.24 + Math.max(0, 44 - age) * 0.5, 12, 96));
  const visitor = Math.round(clamp(sports * 0.34 + localCommerce * 0.22 + mobility * 0.2 + population / 2200, 10, 96));
  const housing = Math.round(clamp((100 - costPressure) * 0.28 + owner * 38 + resilience * 0.24 + (1 - vacancy) * 16, 12, 96));
  const automation = Math.round(clamp(digital * 0.36 + talent * 0.28 + localCommerce * 0.18, 12, 96));
  const health = Math.round(clamp(senior * 1.1 + poverty * 44 + population / 2100 + resilience * 0.16, 12, 96));
  const youthSports = Math.round(clamp(family * 0.46 + sports * 0.24 + mobility * 0.18, 12, 96));
  const energy = Math.round(clamp(localCommerce * 0.28 + resilience * 0.24 + climate * -0.12 + digital * 0.2 + score * 0.18, 12, 96));
  const compare = Math.round(clamp(resilience * 0.32 + digital * 0.24 + housing * 0.2 + sports * 0.14, 12, 96));
  const report = Math.round(clamp((resilience + localCommerce + sports + compare) / 4, 12, 96));

  const scoreText = (value: number) => `${Math.round(clamp(value, 0, 100))}/100`;
  const band = (value: number, high = "High", mid = "Medium", low = "Low") => value >= 70 ? high : value >= 45 ? mid : low;

  return [
    futureWidget("future-market-shape", Sparkles, "2040 Market Shape", band(localCommerce, "Expanding", "Selective", "Niche"), "Scenario posture", "How the ZIP could read as a 2040 local market if today’s population, income, mobility, and digital signals persist.", [["Commerce", scoreText(localCommerce)], ["Resilience", scoreText(resilience)]]),
    futureWidget("future-population-gravity", Users, "Population Gravity", scoreText(clamp(population / 850 + family * 0.28, 10, 98)), "Resident pull", "Estimates whether the ZIP has enough resident gravity to support future services without depending only on visitors.", [["Population", formatNumber(population)], ["Family", scoreText(family)]]),
    futureWidget("future-income-ceiling", Banknote, "Income Ceiling", scoreText(clamp(income / 1200 + talent * 0.22 - costPressure * 0.12, 10, 96)), "Upside capacity", "A 2040-style read on whether local incomes and talent depth could support higher-value offers.", [["Income", formatOptionalCurrency(income)], ["Talent", scoreText(talent)]]),
    futureWidget("future-cost-drag", AlertTriangle, "Cost Drag", scoreText(costPressure), "Affordability drag", "Estimates how much housing and poverty pressure could limit future consumer flexibility.", [["Home/income", `${affordabilityRatio.toFixed(1)}x`], ["Poverty", formatOptionalPercent(profile.povertyRate)]]),
    futureWidget("future-housing-adaptability", HomeIconFallback, "Housing Adaptability", scoreText(housing), "Housing flexibility", "Scenario signal for whether the housing base can adapt to family, rental, ownership, and workforce changes.", [["Owner", formatOptionalPercent(profile.ownerOccupiedRate)], ["Vacancy", formatOptionalPercent(profile.vacancyRate)]]),
    futureWidget("future-mobility-layer", RadioTower, "Mobility Layer", scoreText(mobility), "Access evolution", "Future-read on whether commute and density patterns can support smoother mobility, delivery, and service access.", [["Commute", `${commute.toFixed(1)} min`], ["Density", `${densityProxy}/mi2`]]),
    futureWidget("future-digital-twin", Binary, "Digital Twin Fit", scoreText(digital), "Digital readiness", "Estimates readiness for app-based services, remote work, online ordering, and AI-powered local tools.", [["Broadband proxy", scoreText(digital)], ["College+", formatOptionalPercent(profile.bachelorsOrHigherRate)]]),
    futureWidget("future-ai-commerce", WandSparkles, "AI Commerce Fit", scoreText(automation), "Automated commerce", "A 2040 scenario score for AI-assisted retail, booking, customer support, and local service automation.", [["Digital", scoreText(digital)], ["Commerce", scoreText(localCommerce)]]),
    futureWidget("future-workforce-pivot", BriefcaseIconFallback, "Workforce Pivot", scoreText(talent), "Talent adaptability", "Reads whether the education and digital base can support future workforce shifts.", [["College+", formatOptionalPercent(profile.bachelorsOrHigherRate)], ["Digital", scoreText(digital)]]),
    futureWidget("future-family-engine", Target, "Family Engine", scoreText(family), "Family demand", "Estimates future family-serving demand across schools, youth activity, healthcare, food, and local services.", [["Owner", formatOptionalPercent(profile.ownerOccupiedRate)], ["School", `${Math.round(highSchool * 100)}%`]]),
    futureWidget("future-aging-demand", ShieldCheck, "Aging Demand", scoreText(health), "Care economy", "A 2040-style care signal for healthcare, accessibility, pharmacy, mobility, and senior services.", [["Senior proxy", `${senior}%`], ["Health demand", scoreText(health)]]),
    futureWidget("future-climate-friction", UmbrellaIconFallback, "Climate Friction", scoreText(climate), "Weather exposure", "Estimated climate and weather friction for future operations, outdoor demand, and resilience planning.", [["Weather risk", scoreText(climate)], ["Vacancy", formatOptionalPercent(profile.vacancyRate)]]),
    futureWidget("future-sports-economy", Trophy, "Sports Economy", scoreText(sports), "Sports demand", "Scenario read on future sports viewing, participation, event demand, and local fan energy.", [["Sports", scoreText(sports)], ["Digital", scoreText(digital)]]),
    futureWidget("future-youth-sports", Trophy, "Youth Sports 2040", scoreText(youthSports), "Youth activity", "Estimates future youth sports, camps, clinics, and family weekend activity potential.", [["Family", scoreText(family)], ["Mobility", scoreText(mobility)]]),
    futureWidget("future-visitor-layer", MapIconFallback, "Visitor Layer", scoreText(visitor), "Event/visitor pull", "Future-facing estimate of visitor, event, and pass-through demand.", [["Visitor", scoreText(visitor)], ["Mobility", scoreText(mobility)]]),
    futureWidget("future-local-energy", Activity, "Local Energy", scoreText(energy), "Momentum feel", "Blends commerce, resilience, digital readiness, and climate friction into a future local energy score.", [["Energy", scoreText(energy)], ["Resilience", scoreText(resilience)]]),
    futureWidget("future-risk-stack", AlertTriangle, "2040 Risk Stack", band((costPressure + climate + (100 - resilience)) / 3, "Watch closely", "Manageable", "Low"), "Composite risk", "Top future risks compressed into one planning label.", [["Cost", scoreText(costPressure)], ["Climate", scoreText(climate)]]),
    futureWidget("future-opportunity-stack", Lightbulb, "2040 Opportunity", scoreText((localCommerce + sports + digital + housing) / 4), "Composite upside", "Future opportunity blend across commerce, sports, digital readiness, and housing adaptability.", [["Commerce", scoreText(localCommerce)], ["Sports", scoreText(sports)]]),
    futureWidget("future-comparison-readiness", ArrowRightLeft, "Peer Readiness", scoreText(compare), "Compare quality", "Estimates how useful this ZIP will be in future peer matching workflows.", [["Coverage", scoreText(compare)], ["Report", scoreText(report)]]),
    futureWidget("future-investor-brief", ClipboardList, "Investor Brief", scoreText(report), "2040 report grade", "One compact score for whether this ZIP deserves a future-facing investor-style summary.", [["Brief grade", scoreText(report)], ["Market", scoreText(score)]]),
  ];
}

const HomeIconFallback = Target;
const BriefcaseIconFallback = Activity;
const UmbrellaIconFallback = AlertTriangle;
const MapIconFallback = RadioTower;
const defaultSidebarWidgetIds = [
  "summary",
  "future-market-shape",
  "future-population-gravity",
  "future-income-ceiling",
  "future-cost-drag",
  "future-housing-adaptability",
  "future-mobility-layer",
  "future-digital-twin",
  "future-ai-commerce",
  "future-workforce-pivot",
  "future-family-engine",
  "future-aging-demand",
  "future-climate-friction",
  "future-sports-economy",
  "future-youth-sports",
  "future-visitor-layer",
  "future-local-energy",
  "future-risk-stack",
  "future-opportunity-stack",
  "future-comparison-readiness",
  "future-investor-brief",
  "similar",
  "opportunity",
  "risk",
  "compare",
  "tiles",
  "sports",
  "export",
  "ask",
  "quality",
];

function futureWidget(id: string, icon: LucideIcon, title: string, value: string, label: string, insight: string, metrics: Array<[string, string]>): FutureIntelWidget {
  return {
    icon,
    id,
    insight,
    label,
    metrics: metrics.map(([metricLabel, metricValue]) => ({ label: metricLabel, value: metricValue })),
    title,
    value,
  };
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function buildAiSummary(profile: DemographicProfile, score: number, insights: string[]) {
  const income = profile.medianHouseholdIncome;
  const home = profile.medianHomeValue;
  const affordability = income && home ? home / income : null;
  return {
    oneSentence: `${profile.displayName} is a ${score >= 70 ? "high-signal" : score >= 45 ? "balanced" : "focused"} ZIP profile with ${formatNumber(profile.population)} residents and ${formatOptionalCurrency(income)} median household income.`,
    standsOut: insights[0] ?? `${profile.displayName} has a readable ZIP/ZCTA profile.`,
    strength: score >= 60 ? "Market scale and source coverage are strong enough for comparison workflows." : "The ZIP is useful for focused local analysis with careful source labels.",
    weakness: affordability && affordability > 4 ? `Housing pressure is elevated at ${affordability.toFixed(1)}x income.` : "Some advanced sidebar signals are beta estimates until direct fields are connected.",
    bestUse: profile.population > 40000 ? "Regional market screening and sports/event demand planning." : "Neighborhood-level scouting and comparable ZIP discovery.",
  };
}

function buildTileRecommendations(profile: DemographicProfile) {
  const recommendations = ["Start with Income + Housing", "Review commute and growth next"];
  if ((profile.medianHomeValue ?? 0) > (profile.medianHouseholdIncome ?? 1) * 4) recommendations.push("Housing affordability is the key signal");
  if ((profile.bachelorsOrHigherRate ?? 0) > 0.38) recommendations.push("Education + remote work deserve attention");
  if (profile.population > 45000) recommendations.push("Sports demand may depend on event proximity");
  return recommendations.slice(0, 4);
}

function answerSidebarQuestion(question: string, profile: DemographicProfile, score: number) {
  if (question.includes("growing")) return `Growth is best read through stability, vacancy, education, and market score. Current score: ${score}/100.`;
  if (question.includes("expensive")) return `Cost pressure depends on ${formatOptionalCurrency(profile.medianHomeValue)} home value versus ${formatOptionalCurrency(profile.medianHouseholdIncome)} income.`;
  if (question.includes("families")) return `Family fit depends on owner occupancy (${formatOptionalPercent(profile.ownerOccupiedRate)}), age (${profile.medianAge?.toFixed(1) ?? "unavailable"}), and school/household signals.`;
  if (question.includes("sports")) return `Sports demand is estimated from population scale, income, mobility, weekend demand, and event proximity previews.`;
  if (question.includes("Strongest")) return buildTopInsights(profile)[0] ?? "The strongest signal is source-backed local context.";
  return `${profile.displayName} matters because it combines sourced Census context, place labeling, and sports-market intelligence in one ZIP-level workflow.`;
}
