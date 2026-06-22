import { BarChart3, BrainCircuit, DatabaseZap, Download, FileText, GitCompareArrows, Home, LineChart, Moon, Orbit, Pin, Printer, RefreshCw, ScanSearch, Shield, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import AdvancedControlDeck from "./components/AdvancedControlDeck";
import AdvancedMarketTiles from "./components/AdvancedMarketTiles";
import AIToolsPanel from "./components/AIToolsPanel";
import DemographicsDashboard, { recommendedTileIds } from "./components/DemographicsDashboard";
import ErrorState from "./components/ErrorState";
import InsightPanel from "./components/InsightPanel";
import LoadingState from "./components/LoadingState";
import LocalPulseMatrix from "./components/LocalPulseMatrix";
import PremiumIntelSection from "./components/PremiumIntelSection";
import PrintableZipReport from "./components/PrintableZipReport";
import RealEstateIntelligencePanel from "./components/RealEstateIntelligencePanel";
import SimilarAreasBeta from "./components/SimilarAreasBeta";
import SportsDashboard from "./components/SportsDashboard";
import SmartInfoCarousel from "./components/SmartInfoCarousel";
import ZipInfographicBeta from "./components/ZipInfographicBeta";
import ZipSourceStack from "./components/ZipSourceStack";
import ZipSearch from "./components/ZipSearch";
import { OddsQuote, fetchOdds } from "./providers/oddsProvider";
import { SportsEvent, fetchSportsEvents } from "./providers/sportsEventsProvider";
import type { AiSourceTrace } from "./services/aiInsights";
import { getDemographics } from "./services/demographics";
import { runDevelopmentValidationChecks } from "./services/validationChecks";
import type { DemographicProfile, DemographicsResult } from "./types/demographics";
import { downloadPngResult, generateFullAppPng, type PngExportResult } from "./utils/exportReportImage";
import { printElementReport } from "./utils/printReport";
import { isValidZip } from "./utils/zipValidation";

export default function App() {
  const [zip, setZip] = useState("33558");
  const [profile, setProfile] = useState<DemographicProfile | null>(null);
  const [demographicError, setDemographicError] = useState<Extract<DemographicsResult, { ok: false }> | null>(null);
  const [events, setEvents] = useState<SportsEvent[]>([]);
  const [odds, setOdds] = useState<OddsQuote[]>([]);
  const [sourceTrace, setSourceTrace] = useState<AiSourceTrace>({
    demographics: "Census ACS 2024 ZCTA profile",
    sports: "Sports event adapter pending sync",
    odds: "Odds adapter pending sync",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pinnedTileIds, setPinnedTileIds] = useState<string[]>(() => {
    const stored = localStorage.getItem("zipscope-pinned-tiles");
    return stored ? JSON.parse(stored) as string[] : ["home-value", "owner-occupied", "population", "median-income", "home-income", "growth-opportunity"];
  });
  const [toast, setToast] = useState("");
  const [exportingImage, setExportingImage] = useState(false);
  const [exportedImage, setExportedImage] = useState<PngExportResult | null>(null);
  const [hasAutoFocusedDemographics, setHasAutoFocusedDemographics] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    const explicitTheme = localStorage.getItem("zipscope-theme-explicit") === "true";
    return explicitTheme && localStorage.getItem("zipscope-theme") === "dark";
  });

  useEffect(() => {
    runDevelopmentValidationChecks();
    void runSearch(zip);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? "dark" : "light";
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("zipscope-pinned-tiles", JSON.stringify(pinnedTileIds));
  }, [pinnedTileIds]);

  useEffect(() => {
    if (!loading && profile && !hasAutoFocusedDemographics && !window.location.hash) {
      setHasAutoFocusedDemographics(true);
      window.history.replaceState(null, "", "#demographics");
      requestAnimationFrame(() => document.getElementById("demographics")?.scrollIntoView({ block: "start" }));
    }
  }, [hasAutoFocusedDemographics, loading, profile]);

  async function runSearch(nextZip: string) {
    if (!isValidZip(nextZip)) {
      setError("Enter a valid 5-digit U.S. ZIP code.");
      setDemographicError(null);
      return;
    }
    setError("");
    setDemographicError(null);
    setLoading(true);
    try {
      const [demographicsResult, sportsResult, oddsResult] = await Promise.all([
        getDemographics(nextZip),
        fetchSportsEvents(),
        fetchOdds(),
      ]);
      setZip(nextZip);
      setSourceTrace({
        demographics: demographicsResult.ok ? demographicsResult.profile.sourceName : "Census ACS 2024 ZCTA profile",
        sports: sportsResult.source,
        odds: oddsResult.source,
      });
      if (demographicsResult.ok) {
        setProfile(demographicsResult.profile);
        setDemographicError(null);
      } else {
        setProfile(null);
        setDemographicError(demographicsResult);
      }
      setEvents(sportsResult.events);
      setOdds(oddsResult.odds);
    } catch {
      setProfile(null);
      setError("ZipScope could not load this profile. Census data was not replaced with mock demographic values.");
    } finally {
      setLoading(false);
    }
  }

  function toggleTheme() {
    setIsDark((current) => {
      const next = !current;
      localStorage.setItem("zipscope-theme-explicit", "true");
      localStorage.setItem("zipscope-theme", next ? "dark" : "light");
      return next;
    });
  }

  function printZipReport() {
    if (!profile || loading) return;
    printElementReport("zipscope-export-report", `ZipScope ZIP ${profile.zip} Report`);
  }

  async function exportZipReportImage() {
    if (!profile || loading || exportingImage) return;
    setExportingImage(true);
    setExportedImage(null);
    notify("Building full dashboard image...");
    try {
      const result = await generateFullAppPng(`zipscope-${profile.zip}-full-dashboard.png`);
      setExportedImage(result);
      notify("Full dashboard image is ready");
    } catch (exportError) {
      console.error(exportError);
      notify("Image export could not be generated");
    } finally {
      setExportingImage(false);
    }
  }

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  function updatePinnedTiles(nextIds: string[]) {
    setPinnedTileIds(nextIds);
    notify(`${nextIds.length} pinned tiles ready`);
  }

  function pinRecommendedTiles() {
    updatePinnedTiles(Array.from(new Set([...pinnedTileIds, ...recommendedTileIds])));
  }

  function copyZipSummary() {
    if (!profile) return;
    const summary = `ZIP ${profile.zip} ${profile.displayName}: ${profile.population.toLocaleString()} residents, ${profile.medianHouseholdIncome ? `$${profile.medianHouseholdIncome.toLocaleString()}` : "income unavailable"} median household income, ${profile.medianHomeValue ? `$${profile.medianHomeValue.toLocaleString()}` : "home value unavailable"} median home value, source ${profile.sourceName}.`;
    void navigator.clipboard?.writeText(summary);
    notify("ZIP summary copied");
  }

  function scrollToSearch() {
    document.getElementById("search")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className={`app-shell ${isDark ? "dark-theme" : "day-theme"}`}>
      <aside className="sidebar">
        <div className="logo-orb"><Orbit size={24} /></div>
        <nav>
          <a href="#search"><DatabaseZap size={18} /> Search</a>
          <a href="#demographics"><BarChart3 size={18} /> Demographics</a>
          <a href="#real-estate"><Home size={18} /> Homes</a>
          <a href="#similar-areas"><GitCompareArrows size={18} /> Similar</a>
          <a href="#infographic"><FileText size={18} /> Infographic</a>
          <a href="#ai-tools"><BrainCircuit size={18} /> AI Tools</a>
          <a href="#ai-scanner"><ScanSearch size={18} /> Scanner</a>
          <a href="#sources"><FileText size={18} /> Sources</a>
          <a href="#sports"><LineChart size={18} /> Sports</a>
          <button className="sidebar-print-button" type="button" onClick={printZipReport} disabled={!profile || loading}>
            <Printer size={18} /> Print ZIP
          </button>
          <button className="sidebar-print-button" type="button" onClick={exportZipReportImage} disabled={!profile || loading || exportingImage}>
            <Download size={18} /> {exportingImage ? "Building" : "Full Image"}
          </button>
          <a href="#notice"><Shield size={18} /> Responsible Use</a>
        </nav>
      </aside>
      <main>
        <header className="topbar">
          <strong>ZipScope</strong>
          <span>Housing. Demographics. Regional intelligence. One ZIP at a time.</span>
          <button className="theme-toggle" type="button" onClick={toggleTheme} aria-label="Toggle daytime and night mode">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
            {isDark ? "Day mode" : "Night mode"}
          </button>
        </header>
        <div id="search">
          <ZipSearch
            initialZip={zip}
            onSubmit={runSearch}
            isLoading={loading}
            weatherPlace={profile?.place ?? demographicError?.place ?? null}
          />
        </div>
        <div className="compact-command-strip"><AdvancedControlDeck profile={profile} zip={zip} loading={loading} /></div>
        {error && <ErrorState message={error} />}
        {loading && <LoadingState message="Pulling Census profile..." />}
        {!loading && demographicError && <ErrorState message={demographicError.message} fix={demographicError.fix} place={demographicError.place} zip={demographicError.zip} />}
        {!loading && demographicError && (
          <div id="sources">
            <ZipSourceStack
              zip={demographicError.zip}
              place={demographicError.place}
              sourceStack={demographicError.sourceStack}
              sourceLinks={demographicError.sourceLinks}
            />
          </div>
        )}
        {!loading && profile && (
          <div className="content-grid">
            <div className="primary-column">
              <div id="demographics" className="demographics-priority"><DemographicsDashboard profile={profile} pinnedTileIds={pinnedTileIds} onPinChange={updatePinnedTiles} /></div>
              <div id="real-estate"><RealEstateIntelligencePanel profile={profile} /></div>
              <AdvancedMarketTiles profile={profile} />
              <PremiumIntelSection profile={profile} />
              <SimilarAreasBeta profile={profile} />
              <SmartInfoCarousel profile={profile} />
              <LocalPulseMatrix profile={profile} />
              <AIToolsPanel profile={profile} zip={zip} events={events} odds={odds} sourceTrace={sourceTrace} />
              <div id="sports"><SportsDashboard events={events} odds={odds} /></div>
              <ZipInfographicBeta
                profile={profile}
                onExportReportImage={exportZipReportImage}
                onPrintReport={printZipReport}
                isExportingImage={exportingImage}
              />
              <div id="notice" className="responsible-note wide">Public odds are shown for informational analysis only. ZipScope does not provide betting advice.</div>
            </div>
            <InsightPanel
              profile={profile}
              onCopySummary={copyZipSummary}
              onExportImage={exportZipReportImage}
              onPinRecommended={pinRecommendedTiles}
              onPrintReport={printZipReport}
              isExportingImage={exportingImage}
              pinnedCount={pinnedTileIds.length}
            />
          </div>
        )}
        {!loading && !profile && (
          <div className="primary-column standalone-sports">
            <AIToolsPanel profile={null} zip={zip} events={events} odds={odds} sourceTrace={sourceTrace} />
            <div id="sports"><SportsDashboard events={events} odds={odds} /></div>
            <div id="notice" className="responsible-note wide">Public odds are shown for informational analysis only. ZipScope does not provide betting advice.</div>
          </div>
        )}
        {profile && <PrintableZipReport profile={profile} events={events} odds={odds} pinnedTileIds={pinnedTileIds} />}
        {exportedImage && (
          <section className="image-export-preview" aria-label="Full dashboard image export preview">
            <div className="image-export-preview-header">
              <div>
                <span>Full dashboard image ready</span>
                <strong>{exportedImage.fileName}</strong>
                <p>{exportedImage.width.toLocaleString()} x {exportedImage.height.toLocaleString()} PNG. Open it below, scroll the preview, or download it.</p>
              </div>
              <div className="image-export-preview-actions">
                <button type="button" onClick={() => downloadPngResult(exportedImage)}>
                  <Download size={16} />
                  Download PNG
                </button>
                <button type="button" onClick={() => setExportedImage(null)}>Close</button>
              </div>
            </div>
            <div className="image-export-preview-frame">
              <img src={exportedImage.dataUrl} alt={`Full ZipScope dashboard export for ZIP ${profile?.zip ?? zip}`} />
            </div>
          </section>
        )}
        <div className="mobile-action-bar" aria-label="Mobile ZIP actions">
          <button type="button" onClick={scrollToSearch}><ScanSearch size={17} /> Search</button>
          <button type="button" onClick={pinRecommendedTiles} disabled={!profile}><Pin size={17} /> Pin</button>
          <button type="button" onClick={() => void runSearch(zip)} disabled={loading}><RefreshCw size={17} /> Refresh</button>
          <button type="button" onClick={exportZipReportImage} disabled={!profile || loading || exportingImage}><Download size={17} /> {exportingImage ? "Exporting" : "Export"}</button>
        </div>
        {toast && <div className="zipscope-toast" role="status">{toast}</div>}
      </main>
    </div>
  );
}
