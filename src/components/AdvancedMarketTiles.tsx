import { Building2, Clock3, GraduationCap, Home, Landmark, LineChart, MapPinned, ShieldAlert, TrendingUp, WalletCards } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { DemographicProfile } from "../types/demographics";
import { formatCurrency, formatNumber, formatPercent } from "../utils/formatters";

type MarketTile = {
  label: string;
  value: string;
  detail: string;
  score: number;
  tone: "cool" | "warm" | "hot";
  icon: LucideIcon;
};

export default function AdvancedMarketTiles({ profile }: { profile: DemographicProfile }) {
  const tiles = buildMarketTiles(profile);

  return (
    <section className="market-terminal" aria-label="Advanced demographic intelligence tiles">
      <div className="terminal-heading">
        <span>Socio-Economic Intelligence</span>
        <h2>Market intelligence terminal</h2>
      </div>
      <div className="market-tile-grid">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          return (
            <article className={`market-tile ${tile.tone}`} key={tile.label}>
              <div className="market-tile-top">
                <Icon size={18} />
                <span>{tile.label}</span>
              </div>
              <strong>{tile.value}</strong>
              <p>{tile.detail}</p>
              <div className="market-meter">
                <i style={{ width: `${Math.max(6, Math.min(tile.score, 100))}%` }} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function buildMarketTiles(profile: DemographicProfile): MarketTile[] {
  const income = profile.medianHouseholdIncome ?? 62000;
  const homeValue = profile.medianHomeValue ?? 280000;
  const poverty = profile.povertyRate ?? 0.12;
  const bachelors = profile.bachelorsOrHigherRate ?? 0.28;
  const highSchool = profile.highSchoolGradRate ?? 0.86;
  const ownerRate = profile.ownerOccupiedRate ?? 0.62;
  const vacancy = profile.vacancyRate ?? 0.08;
  const commute = profile.averageCommuteMinutes ?? 26;
  const population = profile.population;
  const medianAge = profile.medianAge ?? 39;
  const housingUnits = profile.housingUnits ?? Math.max(1, Math.round(population / 2.35));
  const costIndex = Math.round(((homeValue / 285000) * 52 + (income / 74500) * 18 + (1 + poverty) * 30));
  const housingHeat = Math.round(Math.min(100, (homeValue / Math.max(income, 1)) * 9 + (1 - vacancy) * 30));
  const growthSignal = Math.round(Math.min(100, bachelors * 45 + (1 - poverty) * 22 + Math.min(population / 75000, 1) * 33));
  const affordability = Math.round(Math.min(100, (homeValue / Math.max(income, 1)) * 16 + poverty * 120));
  const accessFriction = Math.round(Math.min(100, commute * 2.2 + vacancy * 90));
  const educationDepth = Math.round(Math.min(100, bachelors * 72 + highSchool * 28));
  const wealthStability = Math.round(Math.min(100, (income / 90000) * 42 + ownerRate * 34 + (1 - poverty) * 24));
  const civicLoad = Math.round(Math.min(100, poverty * 150 + vacancy * 80 + Math.max(0, commute - 20) * 1.5));
  const householdGravity = Math.round(Math.min(100, (housingUnits / Math.max(population / 2.1, 1)) * 50 + ownerRate * 35 + (1 - vacancy) * 15));
  const sportsMarketFit = Math.round(Math.min(100, Math.min(population / 65000, 1) * 34 + (income / 95000) * 26 + (1 - Math.abs(medianAge - 38) / 32) * 24 + educationDepth * 0.16));

  return [
    {
      label: "Cost of Living Index",
      value: `${costIndex}`,
      detail: `${costIndex >= 100 ? "Above" : "Below"} national baseline 100; weighted from housing, income, and poverty signals.`,
      score: costIndex,
      tone: costIndex > 112 ? "hot" : costIndex > 94 ? "warm" : "cool",
      icon: WalletCards,
    },
    {
      label: "Housing Market Heat",
      value: `${housingHeat}/100`,
      detail: `${formatCurrency(homeValue)} median value against ${formatCurrency(income)} median income.`,
      score: housingHeat,
      tone: housingHeat > 72 ? "hot" : housingHeat > 48 ? "warm" : "cool",
      icon: Home,
    },
    {
      label: "Predictive Growth",
      value: `${growthSignal}/100`,
      detail: `Modeled from ${formatNumber(population)} residents, ${formatPercent(bachelors)} bachelor's+, and poverty pressure.`,
      score: growthSignal,
      tone: growthSignal > 70 ? "hot" : growthSignal > 45 ? "warm" : "cool",
      icon: TrendingUp,
    },
    {
      label: "Affordability Pressure",
      value: `${affordability}/100`,
      detail: "Higher values suggest housing costs are heavier relative to income and poverty context.",
      score: affordability,
      tone: affordability > 70 ? "hot" : affordability > 44 ? "warm" : "cool",
      icon: MapPinned,
    },
    {
      label: "Access Friction",
      value: `${accessFriction}/100`,
      detail: `${commute.toFixed(1)} minute commute and ${formatPercent(vacancy)} vacancy are blended into a mobility signal.`,
      score: accessFriction,
      tone: accessFriction > 68 ? "hot" : accessFriction > 42 ? "warm" : "cool",
      icon: LineChart,
    },
    {
      label: "Education Depth",
      value: `${educationDepth}/100`,
      detail: `${formatPercent(highSchool)} high-school+ and ${formatPercent(bachelors)} bachelor's+ are combined into a workforce-readiness signal.`,
      score: educationDepth,
      tone: educationDepth > 72 ? "hot" : educationDepth > 52 ? "warm" : "cool",
      icon: GraduationCap,
    },
    {
      label: "Wealth Stability",
      value: `${wealthStability}/100`,
      detail: `${formatCurrency(income)} income, ${formatPercent(ownerRate)} owner occupancy, and poverty pressure are blended.`,
      score: wealthStability,
      tone: wealthStability > 74 ? "hot" : wealthStability > 50 ? "warm" : "cool",
      icon: Landmark,
    },
    {
      label: "Civic Load",
      value: `${civicLoad}/100`,
      detail: "Higher values flag heavier planning pressure from poverty, vacancy, and mobility friction.",
      score: civicLoad,
      tone: civicLoad > 66 ? "hot" : civicLoad > 42 ? "warm" : "cool",
      icon: ShieldAlert,
    },
    {
      label: "Household Gravity",
      value: `${householdGravity}/100`,
      detail: `${formatNumber(housingUnits)} housing units, ownership, and vacancy describe residential anchoring power.`,
      score: householdGravity,
      tone: householdGravity > 72 ? "hot" : householdGravity > 48 ? "warm" : "cool",
      icon: Building2,
    },
    {
      label: "Sports Market Fit",
      value: `${sportsMarketFit}/100`,
      detail: `${formatNumber(population)} residents, ${medianAge.toFixed(1)} median age, income, and education shape local event fit.`,
      score: sportsMarketFit,
      tone: sportsMarketFit > 72 ? "hot" : sportsMarketFit > 48 ? "warm" : "cool",
      icon: Clock3,
    },
  ];
}
