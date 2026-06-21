import { BrainCircuit, ChevronRight, FileText, GitCompareArrows, Lightbulb, LineChart, ListChecks, Radar, ScanSearch, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { useMemo, useState } from "react";
import type { OddsQuote } from "../providers/oddsProvider";
import type { SportsEvent } from "../providers/sportsEventsProvider";
import { AiSourceTrace, buildAiInsightModel } from "../services/aiInsights";
import type { DemographicProfile } from "../types/demographics";
import { formatCurrency, formatNumber, localMarketScore } from "../utils/formatters";

const smartQuestions = [
  "What stands out here?",
  "Where is the biggest opportunity?",
  "What should I compare this against?",
  "What changed recently?",
  "Explain this like I'm a beginner.",
];

export default function AIToolsPanel({
  profile,
  zip,
  events,
  odds,
  sourceTrace,
}: {
  profile: DemographicProfile | null;
  zip: string;
  events: SportsEvent[];
  odds: OddsQuote[];
  sourceTrace: AiSourceTrace;
}) {
  const model = useMemo(() => profile
    ? buildAiInsightModel(profile, events, odds, sourceTrace)
    : buildCurrentScreenModel(zip, events, odds, sourceTrace), [events, odds, profile, sourceTrace, zip]);
  const [selectedQuestion, setSelectedQuestion] = useState(smartQuestions[0]);
  const [comparisonIndex, setComparisonIndex] = useState(0);
  const [briefOpen, setBriefOpen] = useState(false);
  const peer = model.comparisonPeers[comparisonIndex];
  const activeScore = profile ? localMarketScore(profile) : Math.min(92, 42 + events.length * 5 + odds.length);
  const displayName = profile?.displayName ?? `ZIP ${zip}`;

  return (
    <section className="ai-tools-panel" id="ai-tools" aria-label="AI tools">
      <div className="ai-tools-header">
        <div>
          <span className="mono-label"><BrainCircuit size={15} /> AI Tools / {profile ? "Sourced Intelligence" : "Demo Intelligence"}</span>
          <h2>Predictive command layer</h2>
          <p>{model.summary}</p>
        </div>
        <div className="ai-confidence-card">
        <span>Confidence</span>
          <strong>{model.confidence}%</strong>
          <small>{model.confidenceLabel} confidence from available {profile ? "public sources" : "public/demo sources"}</small>
          <div><i style={{ width: `${model.confidence}%` }} /></div>
        </div>
      </div>

      <div className="ai-tools-grid">
        <article className="ai-tool-card ai-summary-card">
          <div className="ai-card-title"><Sparkles size={17} /> AI Insight Summary</div>
          <p>{model.summary}</p>
          <div className="ai-signal-row">
            <span>{profile ? "Market Score" : "Screen Score"} <b>{activeScore}</b></span>
            <span>Events <b>{events.length}</b></span>
            <span>Odds <b>{odds.length}</b></span>
          </div>
        </article>

        <article className="ai-tool-card" id="ai-scanner">
          <div className="ai-card-title"><ScanSearch size={17} /> Risk / Opportunity Scanner</div>
          <div className="ai-scan-columns">
            <div>
              <strong>Risk Signals</strong>
              {model.riskSignals.slice(0, 2).map((signal) => <p key={signal}>{signal}</p>)}
            </div>
            <div>
              <strong>Opportunity Signals</strong>
              {model.opportunitySignals.slice(0, 2).map((signal) => <p key={signal}>{signal}</p>)}
            </div>
          </div>
        </article>

        <article className="ai-tool-card" id="ai-compare">
          <div className="ai-card-title"><GitCompareArrows size={17} /> AI Comparison Tool</div>
          <label className="ai-select-label">
            Compare {displayName} with
            <select value={comparisonIndex} onChange={(event) => setComparisonIndex(Number(event.target.value))}>
              {model.comparisonPeers.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}
            </select>
          </label>
          <div className="comparison-grid">
            <ComparisonMetric label={profile ? "Population" : "Event Coverage"} left={profile ? formatNumber(profile.population) : `${events.length} events`} right={profile ? formatNumber(peer.population) : "Benchmark slate"} />
            <ComparisonMetric label={profile ? "Median Income" : "Odds Coverage"} left={profile?.medianHouseholdIncome === null ? "Unavailable" : profile ? formatCurrency(profile.medianHouseholdIncome) : `${odds.length} quotes`} right={profile ? formatCurrency(peer.income) : "Peer provider set"} />
            <ComparisonMetric label={profile ? "Market Score" : "Screen Score"} left={`${activeScore}`} right={`${peer.marketScore}`} />
            <ComparisonMetric label="Sports Index" left={`${Math.min(98, events.length * 9 + 34)}`} right={`${peer.sportsIndex}`} />
          </div>
        </article>

        <article className="ai-tool-card forecast-card">
          <div className="ai-card-title"><LineChart size={17} /> AI Prediction / Forecast</div>
          <small>Demo estimates, not guarantees.</small>
          <div className="forecast-list">
            {model.forecast.map((item) => (
              <div className={`forecast-pill ${item.tone}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </article>

        <article className="ai-tool-card smart-questions-card">
          <div className="ai-card-title"><Lightbulb size={17} /> AI Smart Questions</div>
          <div className="smart-question-row">
            {smartQuestions.map((question) => (
              <button className={selectedQuestion === question ? "selected" : ""} key={question} type="button" onClick={() => setSelectedQuestion(question)}>
                {question}
              </button>
            ))}
          </div>
          <p><ChevronRight size={15} /> {answerQuestion(selectedQuestion, profile, activeScore, peer.label)}</p>
        </article>

        <article className="ai-tool-card source-transparency-card">
          <div className="ai-card-title"><ShieldCheck size={17} /> Source Transparency</div>
          <div className="source-token-grid">
            {model.sourceCategories.map((source) => <span key={source}>{source}</span>)}
          </div>
        </article>

        <article className="ai-tool-card anomaly-radar-card">
          <div className="ai-card-title"><Radar size={17} /> Beta Anomaly Radar</div>
          <div className="anomaly-radar-grid">
            {model.anomalyRadar.map((item) => (
              <div className={`anomaly-radar-item ${item.tone}`} key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="ai-tool-card">
          <div className="ai-card-title"><ListChecks size={17} /> AI Action Queue</div>
          <div className="ai-action-list">
            {model.actionQueue.map((item, index) => (
              <div key={item.label}>
                <b>{String(index + 1).padStart(2, "0")}</b>
                <span>{item.label}</span>
                <p>{item.detail}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="ai-tool-card">
          <div className="ai-card-title"><Workflow size={17} /> Confidence Stack</div>
          <div className="confidence-factor-list">
            {model.confidenceFactors.map((factor) => (
              <label key={factor.label}>
                {factor.label}
                <span><i style={{ width: `${factor.score}%` }} /></span>
                <b>{factor.score}%</b>
              </label>
            ))}
          </div>
        </article>

        <article className="ai-tool-card strategic-question-card">
          <div className="ai-card-title"><BrainCircuit size={17} /> Strategic Question Engine</div>
          {model.strategicQuestions.map((question) => (
            <p key={question}><ChevronRight size={15} /> {question}</p>
          ))}
        </article>
      </div>

      <div className="executive-brief">
        <button type="button" onClick={() => setBriefOpen((current) => !current)}>
          <FileText size={17} />
          {briefOpen ? "Hide Executive Brief" : "Generate Executive Brief"}
        </button>
        {briefOpen && (
          <div>
            <strong>Executive Brief: {displayName}</strong>
            {model.executiveBrief.map((line) => <p key={line}>{line}</p>)}
          </div>
        )}
      </div>
    </section>
  );
}

function ComparisonMetric({ label, left, right }: { label: string; left: string; right: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{left}</strong>
      <b>{right}</b>
    </div>
  );
}

function answerQuestion(question: string, profile: DemographicProfile | null, score: number, peerLabel: string) {
  const displayName = profile?.displayName ?? "the current screen";
  if (question === "Where is the biggest opportunity?") {
    return `The clearest opportunity is matching ${displayName}'s score of ${score} with segments that value sourced local context.`;
  }
  if (question === "What should I compare this against?") {
    return `Start with ${peerLabel}, then add a nearby ZIP with similar population but different income or education signals.`;
  }
  if (question === "What changed recently?") {
    return "This demo layer is not connected to a live change feed yet; recent-change detection can be wired to ACS releases, sports schedules, and odds deltas later.";
  }
  if (question === "Explain this like I'm a beginner.") {
    return "ZipScope combines public demographic facts with sports-market context, then turns them into readable signals without treating estimates as certainty.";
  }
  return `${displayName} stands out because the available source status, screen score, and current sports slate can be read together in one operational view.`;
}

function buildCurrentScreenModel(zip: string, events: SportsEvent[], odds: OddsQuote[], sourceTrace: AiSourceTrace) {
  const confidence = Math.min(74, 42 + events.length * 4 + odds.length);
  return {
    summary: `ZIP ${zip} is in current-screen AI mode. Census demographics are not being mocked; the assistant is reading the visible sports slate, odds adapter status, and source transparency until official ZIP/ZCTA demographics are available.`,
    confidence,
    confidenceLabel: "Directional" as const,
    riskSignals: [
      "Official demographic profile is unavailable, so demographic inference is intentionally locked.",
      `${odds.length} odds quotes are demo-normalized and should be treated as product behavior samples, not betting advice.`,
      "Forecast strength is limited until Census ACS and live provider keys are connected.",
    ],
    opportunitySignals: [
      `${events.length} upcoming events can still support interface testing, comparison workflows, and executive briefing behavior.`,
      "The AI layer is structured so live public data and model APIs can replace demo adapters later.",
      "Source transparency is already visible, which helps civic, enterprise, and investor users trust the workflow.",
    ],
    forecast: [
      { label: "AI Readiness", value: "Live UI", tone: "up" as const },
      { label: "Data Reliability", value: `${confidence}%`, tone: "watch" as const },
      { label: "Provider Depth", value: odds.length ? "Demo" : "Pending", tone: "steady" as const },
    ],
    anomalyRadar: [
      { label: "Demographic lock", value: "Safe", detail: "No fake demographic facts are generated when Census is unavailable.", tone: "stable" as const },
      { label: "Sports surface", value: `${events.length}`, detail: "Events are available for interface testing and context display.", tone: events.length ? "stable" as const : "watch" as const },
      { label: "Odds surface", value: `${odds.length}`, detail: "Odds are demo-normalized unless a live provider is configured.", tone: odds.length ? "watch" as const : "alert" as const },
      { label: "Provider status", value: "Beta", detail: "Adapters remain safe to run locally without paid APIs.", tone: "watch" as const },
    ],
    actionQueue: [
      { label: "Add Census key", detail: "Connect official ACS profile data for the requested ZIP/ZCTA." },
      { label: "Verify place label", detail: "Use Zippopotam.us and local seeds only for city/state/county labels." },
      { label: "Connect sports provider", detail: "Add an event or odds key when ready; demo adapters keep the UI running until then." },
      { label: "Keep demo labels visible", detail: "Never present mock or modeled fields as official public data." },
    ],
    confidenceFactors: [
      { label: "Demographic facts", score: 36 },
      { label: "Sports events", score: Math.min(86, 42 + events.length * 8) },
      { label: "Odds adapters", score: Math.min(82, 38 + odds.length * 6) },
      { label: "Source transparency", score: 94 },
      { label: "Forecast strength", score: confidence },
    ],
    strategicQuestions: [
      `What official Census fields are missing for ZIP ${zip}?`,
      "Which provider key would unlock the most value next?",
      "How should demo sports intelligence be separated from sourced civic facts?",
      "What should the executive brief say when demographics are unavailable?",
    ],
    executiveBrief: [
      `ZIP ${zip} is ready for AI-assisted review, but demographic facts remain locked until official Census data is available.`,
      `The current screen includes ${events.length} sports events and ${odds.length} normalized odds quotes from demo adapters.`,
      "Forecasts and summaries are clearly labeled as demo estimates and are not guarantees, recommendations, or betting advice.",
    ],
    comparisonPeers: [
      { label: "Benchmark event slate", population: 0, income: 0, marketScore: 68, sportsIndex: 62 },
      { label: "High-volume sports screen", population: 0, income: 0, marketScore: 78, sportsIndex: 84 },
      { label: "Low-coverage screen", population: 0, income: 0, marketScore: 52, sportsIndex: 38 },
      { label: "Provider-ready screen", population: 0, income: 0, marketScore: 72, sportsIndex: 70 },
    ],
    sourceCategories: [
      sourceTrace.demographics,
      sourceTrace.sports,
      sourceTrace.odds,
      "ZIP/ZCTA profile locked when Census is unavailable",
      "Demo AI screen scoring",
    ],
  };
}
