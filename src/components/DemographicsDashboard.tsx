import { forwardRef, useMemo, useRef, useState } from "react";
import { Baby, Banknote, BriefcaseBusiness, Building2, Car, Clock3, CloudSun, Gauge, GraduationCap, HeartPulse, Home, Info, Languages, Laptop, MapPinned, Navigation, Pin, Radar, Rocket, Scale, School, Search, ShieldAlert, Smartphone, Sparkles, Store, Timer, Train, Trophy, Umbrella, UserRound, Users, UsersRound, Vote, Wifi } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { DemographicProfile } from "../providers/demographicsProvider";
import { formatNumber, formatOptionalCurrency, formatOptionalNumber, formatOptionalPercent } from "../utils/formatters";
import StatCard from "./StatCard";
import DemographicCharts from "./DemographicCharts";

export type DemographicTile = {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
  detail: string;
  insightTitle: string;
  insight: string;
  category?: string;
  status?: "Real data" | "Estimated" | "Beta" | "Mock" | "Coming soon";
  confidence?: string;
  trend?: string;
  percentile?: number;
};

const priorityGroups = ["All", "Pinned", "Overview", "Population", "Income", "Housing", "Jobs", "Education", "Lifestyle", "Transportation", "Civic", "Risk", "Opportunity", "Sports", "Growth", "Beta"];

type Props = {
  onPinChange?: (pinnedIds: string[]) => void;
  pinnedTileIds?: string[];
  profile: DemographicProfile;
};

export const recommendedTileIds = ["home-value", "owner-occupied", "population", "median-income", "home-income", "growth-opportunity", "investment-score", "cost-of-living", "commute"];

export default function DemographicsDashboard({ onPinChange, pinnedTileIds: controlledPinnedTileIds, profile }: Props) {
  const topRaceGroup = getTopRaceGroup(profile.raceEthnicity);
  const tiles = useMemo(() => buildDemographicTiles(profile), [profile]);
  const [activeGroup, setActiveGroup] = useState("All");
  const [tileQuery, setTileQuery] = useState("");
  const [compactView, setCompactView] = useState(false);
  const [showAllTiles, setShowAllTiles] = useState(true);
  const [localPinnedTileIds, setLocalPinnedTileIds] = useState<string[]>(["home-value", "owner-occupied", "population", "median-income", "home-income"]);
  const pinnedTileIds = controlledPinnedTileIds ?? localPinnedTileIds;
  const [selectedTileId, setSelectedTileId] = useState(tiles[0]?.id ?? "");
  const insightRef = useRef<HTMLElement | null>(null);
  const selectedTile = tiles.find((tile) => tile.id === selectedTileId) ?? tiles[0];
  const filteredTiles = tiles.filter((tile) => {
    const group = tile.category ?? "Core";
    const matchesGroup = activeGroup === "All" || (activeGroup === "Pinned" ? pinnedTileIds.includes(tile.id) : group === activeGroup);
    const matchesQuery = `${tile.label} ${tile.detail} ${tile.insight}`.toLowerCase().includes(tileQuery.trim().toLowerCase());
    return matchesGroup && matchesQuery;
  });
  const visibleTiles = showAllTiles || activeGroup !== "All" || tileQuery ? filteredTiles : filteredTiles.slice(0, 28);

  function handleTileClick(tileId: string) {
    setSelectedTileId(tileId);
    window.requestAnimationFrame(() => {
      insightRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function togglePinned(tileId: string) {
    updatePinnedTiles(pinnedTileIds.includes(tileId) ? pinnedTileIds.filter((id) => id !== tileId) : [...pinnedTileIds, tileId]);
  }

  function updatePinnedTiles(nextIds: string[]) {
    const cleaned = Array.from(new Set(nextIds)).filter((id) => tiles.some((tile) => tile.id === id));
    setLocalPinnedTileIds(cleaned);
    onPinChange?.(cleaned);
  }

  function pinRecommendedTiles() {
    updatePinnedTiles([...pinnedTileIds, ...recommendedTileIds]);
  }

  function pinTopInsights() {
    updatePinnedTiles([...pinnedTileIds, ...(tiles.filter((tile) => tile.trend === "Opportunity").slice(0, 6).map((tile) => tile.id))]);
  }

  return (
    <section className="dashboard-section">
      <div className="section-heading demographic-heading">
        <div>
          <span>Demographic Snapshot</span>
          <h2>{profile.displayName} intelligence layer</h2>
        </div>
        <div className="demographic-heading-pills" aria-label="Profile metadata">
          <span>ZIP {profile.zip}</span>
          <span>ZCTA {profile.zcta}</span>
          <span>{profile.sourceYear}</span>
        </div>
      </div>
      <div className="map-panel demographic-summary-panel">
        <div className="demographic-summary-main">
          <span className="mono-label">Profile anchor</span>
          <h3>{profile.place?.county ?? profile.name}</h3>
          <p>{formatGeographicSummary(profile)}</p>
          <details className="source-disclosure">
            <summary>Source links</summary>
            <div className="source-links">
              {profile.sourceLinks.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noreferrer">{link.label}</a>)}
            </div>
          </details>
        </div>
        <div className="source-stack compact-source-stack demographic-source-stack">
          <div className="source-pill">ACS 2024 / ZCTA {profile.zcta}</div>
          <div className="caveat" title="ZIP demographics use Census ZCTAs, which approximate USPS ZIP areas."><Info size={14} /> ZCTA caveat</div>
          <small>{new Date(profile.lastUpdated).toLocaleDateString()}</small>
        </div>
      </div>
      {selectedTile && <TileInsightPanel ref={insightRef} tile={selectedTile} profile={profile} />}
      <div className="tile-command-center" aria-label="Demographic tile controls">
        <div className="tile-search-box">
          <Search size={16} />
          <input value={tileQuery} onChange={(event) => setTileQuery(event.target.value)} placeholder="Filter intelligence tiles" aria-label="Filter demographic tiles" />
        </div>
        <div className="tile-group-chips" aria-label="Tile groups">
          {priorityGroups.map((group) => (
            <button className={activeGroup === group ? "active" : ""} key={group} type="button" onClick={() => setActiveGroup(group)}>
              {group === "Pinned" && <Pin size={14} />}
              {group}
            </button>
          ))}
        </div>
        <div className="tile-view-actions">
          <button className={compactView ? "active" : ""} type="button" onClick={() => setCompactView((current) => !current)}>
            {compactView ? "Detailed" : "Compact"}
          </button>
          <button type="button" onClick={pinRecommendedTiles}>Pin recommended</button>
          <button type="button" onClick={pinTopInsights}>Pin top</button>
          <button type="button" disabled={!pinnedTileIds.length} onClick={() => updatePinnedTiles([])}>Clear pins</button>
          <button type="button" onClick={() => setActiveGroup("Pinned")}>Pinned report</button>
          <button type="button" onClick={() => setShowAllTiles((current) => !current)}>
            {showAllTiles ? "Priority View" : `Show All ${tiles.length}`}
          </button>
        </div>
      </div>
      <div className={`stat-grid expanded-demographic-grid${compactView ? " compact" : ""}`}>
        {visibleTiles.map((tile) => (
          <StatCard
            key={tile.id}
            icon={tile.icon}
            label={tile.label}
            value={tile.value}
            detail={tile.detail}
            category={tile.category}
            confidence={tile.confidence}
            status={tile.status}
            trend={tile.trend}
            percentile={tile.percentile}
            pinned={pinnedTileIds.includes(tile.id)}
            onPin={() => togglePinned(tile.id)}
            active={selectedTile?.id === tile.id}
            onClick={() => handleTileClick(tile.id)}
          />
        ))}
      </div>
      {!visibleTiles.length && <div className="tile-empty-state">No matching tiles yet. Try another category or clear the filter.</div>}
      <RaceCompositionPanel raceEthnicity={profile.raceEthnicity} />
      <DemographicCharts profile={profile} />
    </section>
  );
}

const TileInsightPanel = forwardRef<HTMLElement, { tile: DemographicTile; profile: DemographicProfile }>(
  function TileInsightPanel({ tile, profile }, ref) {
  return (
    <section className="tile-insight-panel" aria-live="polite" ref={ref}>
      <div className="tile-insight-title">
        <Sparkles size={18} />
        <div>
          <span>AI Tile Intelligence</span>
          <h3>{tile.insightTitle}</h3>
        </div>
      </div>
      <div className="tile-insight-selected">Selected tile: {tile.label} / {tile.value}</div>
      <p>{tile.insight}</p>
      <small>
        Read as ZIP {profile.zip} / Census ZCTA {profile.zcta}. Demographic estimates describe local context; modeled values are signals, not official determinations.
      </small>
    </section>
  );
});

export function buildDemographicTiles(profile: DemographicProfile): DemographicTile[] {
  const topRaceGroup = getTopRaceGroup(profile.raceEthnicity);
  const incomePerResident = profile.medianHouseholdIncome && profile.population ? Math.round(profile.medianHouseholdIncome / 2.35) : null;
  const occupiedUnits = buildOccupiedUnits(profile);
  const renterOccupiedRate = buildRenterOccupiedRate(profile);
  const crimeRate = buildModeledCrimeRate(profile);
  const literacyRate = buildModeledLiteracyRate(profile);
  const populationDensity = buildModeledPopulationDensity(profile);
  const householdAffluence = buildHouseholdAffluenceIndex(profile);
  const marketResilience = buildMarketResilienceScore(profile);
  const householdSize = buildModeledHouseholdSize(profile);
  const familyHouseholds = buildModeledFamilyHouseholds(profile);
  const singleHouseholds = buildModeledSingleHouseholds(profile);
  const marriedHouseholds = buildModeledMarriedHouseholds(profile);
  const singleParentHouseholds = buildModeledSingleParentHouseholds(profile);
  const perCapitaIncome = buildModeledPerCapitaIncome(profile);
  const costOfLiving = buildCostOfLivingIndex(profile);
  const rentBurden = buildRentBurden(profile);
  const medianRent = buildModeledMedianRent(profile);
  const apartmentMix = buildApartmentMix(profile);
  const employmentRate = buildEmploymentRate(profile);
  const unemploymentRate = buildUnemploymentRate(profile);
  const laborParticipation = buildLaborParticipation(profile);
  const whiteCollar = buildWhiteCollarScore(profile);
  const remoteWork = buildRemoteWorkPotential(profile);
  const vehicleOwnership = buildVehicleOwnership(profile);
  const transitAccess = buildTransitAccess(profile);
  const walkability = buildWalkability(profile);
  const broadband = buildBroadbandAccess(profile);
  const languageDiversity = buildLanguageDiversity(profile, topRaceGroup);
  const foreignBorn = buildForeignBornEstimate(profile, topRaceGroup);
  const businessDensity = buildBusinessDensity(profile);
  const restaurantDensity = buildRestaurantDensity(profile);
  const entertainmentDensity = buildEntertainmentDensity(profile);
  const sportsFanIntensity = buildSportsFanIntensity(profile);
  const eventDemand = buildEventDemand(profile);
  const weatherComfort = buildWeatherComfort(profile);
  const weatherRisk = buildWeatherRisk(profile);
  const growthOpportunity = buildGrowthOpportunity(profile);
  const investmentScore = buildInvestmentAttractiveness(profile);
  const familyFriendly = buildFamilyFriendliness(profile);
  const youngProfessional = buildYoungProfessionalScore(profile);
  const retirementComfort = buildRetirementComfort(profile);
  const localMobility = buildLocalMobility(profile);
  const neighborhoodMomentum = buildNeighborhoodMomentum(profile);
  const similarZipMatch = Math.round((householdAffluence + marketResilience + sportsFanIntensity) / 3);

  const tiles: DemographicTile[] = [
    {
      id: "population",
      icon: Users,
      label: "Population",
      value: formatNumber(profile.population),
      detail: "ACS profile population estimate",
      insightTitle: "Population shows market scale",
      insight: `${formatNumber(profile.population)} residents is the base size of this ZIP/ZCTA profile. Larger populations usually create broader demand signals, while smaller populations make each household or venue signal matter more.`,
    },
    {
      id: "median-age",
      icon: Timer,
      label: "Median Age",
      value: profile.medianAge === null ? "-" : profile.medianAge.toFixed(1),
      detail: "Median age in years",
      insightTitle: "Median age frames life-stage demand",
      insight: profile.medianAge === null ? "Median age is unavailable for this profile, so age-driven interpretation should stay light." : `A median age of ${profile.medianAge.toFixed(1)} means half of residents are younger and half are older. It helps explain whether the area leans younger, family-forming, established, or retirement-oriented.`,
    },
    {
      id: "household-size",
      icon: UsersRound,
      label: "Household Size",
      value: `${householdSize.toFixed(2)}`,
      detail: "Estimated residents per occupied unit",
      insightTitle: "Household size reveals living-pattern demand",
      insight: `${householdSize.toFixed(2)} residents per occupied unit is modeled from population, housing, and vacancy. This helps distinguish solo-professional, family, and shared-housing patterns.`,
    },
    {
      id: "family-households",
      icon: Baby,
      label: "Family Households",
      value: formatOptionalPercent(familyHouseholds),
      detail: "Beta modeled household structure",
      insightTitle: "Family households frame household-service demand",
      insight: `${formatOptionalPercent(familyHouseholds)} is a beta modeled share based on household size, owner occupancy, median age, and vacancy. It should be read as a planning signal rather than an official household-type table.`,
    },
    {
      id: "single-households",
      icon: UserRound,
      label: "Single-Person HH",
      value: formatOptionalPercent(singleHouseholds),
      detail: "Beta modeled household structure",
      insightTitle: "Single-person households point to solo demand",
      insight: `${formatOptionalPercent(singleHouseholds)} is a beta modeled solo-household share. It can influence apartment demand, delivery behavior, and entertainment patterns, but it is not an official ACS table value in this screen.`,
    },
    {
      id: "married-households",
      icon: UsersRound,
      label: "Married HH",
      value: formatOptionalPercent(marriedHouseholds),
      detail: "Beta modeled household structure",
      insightTitle: "Married households show household stability",
      insight: `${formatOptionalPercent(marriedHouseholds)} is a modeled married-household signal using ownership, age, household size, and poverty pressure. Treat it as directional until household-type fields are wired directly.`,
    },
    {
      id: "single-parent-households",
      icon: Baby,
      label: "Single-Parent HH",
      value: formatOptionalPercent(singleParentHouseholds),
      detail: "Beta modeled household pressure",
      insightTitle: "Single-parent households flag service needs",
      insight: `${formatOptionalPercent(singleParentHouseholds)} is a beta estimate from poverty, household size, and ownership signals. It is useful for family-service planning, not official household classification.`,
    },
    {
      id: "female",
      icon: Users,
      label: "Female",
      value: formatOptionalNumber(profile.femalePopulation),
      detail: profile.femalePopulation ? `${((profile.femalePopulation / profile.population) * 100).toFixed(1)}% of population` : "ACS sex estimate",
      insightTitle: "Female population is a composition signal",
      insight: profile.femalePopulation ? `${formatNumber(profile.femalePopulation)} residents are estimated female, or ${((profile.femalePopulation / profile.population) * 100).toFixed(1)}% of the population. This is useful for demographic balance, not individual prediction.` : "Female population is unavailable, so the profile should avoid sex-composition conclusions.",
    },
    {
      id: "male",
      icon: UserRound,
      label: "Male",
      value: formatOptionalNumber(profile.malePopulation),
      detail: profile.malePopulation ? `${((profile.malePopulation / profile.population) * 100).toFixed(1)}% of population` : "ACS sex estimate",
      insightTitle: "Male population completes the balance view",
      insight: profile.malePopulation ? `${formatNumber(profile.malePopulation)} residents are estimated male, or ${((profile.malePopulation / profile.population) * 100).toFixed(1)}% of the population. Read this alongside the female tile for broad composition only.` : "Male population is unavailable, so the profile should avoid sex-composition conclusions.",
    },
    {
      id: "median-income",
      icon: Banknote,
      label: "Median Income",
      value: formatOptionalCurrency(profile.medianHouseholdIncome),
      detail: "Household income estimate",
      insightTitle: "Median income is the spending-power anchor",
      insight: profile.medianHouseholdIncome ? `${formatOptionalCurrency(profile.medianHouseholdIncome)} is the midpoint household income estimate. It helps explain affordability, discretionary capacity, and how local market signals compare with housing costs.` : "Median household income is unavailable, so spending-power interpretation should use other tiles cautiously.",
    },
    {
      id: "per-capita-income",
      icon: Banknote,
      label: "Per-Capita Income",
      value: perCapitaIncome ? formatOptionalCurrency(perCapitaIncome) : "-",
      detail: "Estimated from household income and household size",
      insightTitle: "Per-capita income normalizes spending power",
      insight: perCapitaIncome ? `${formatOptionalCurrency(perCapitaIncome)} is a modeled per-resident income proxy. It helps compare ZIPs with very different household sizes, but it is not a verified Census per-capita field in this build.` : "Per-capita income cannot be modeled because income or household-size context is unavailable.",
    },
    {
      id: "cost-of-living",
      icon: Scale,
      label: "Cost of Living",
      value: `${costOfLiving}/100`,
      detail: "Beta affordability pressure index",
      insightTitle: "Cost of living compresses local pressure",
      insight: `${costOfLiving}/100 blends home value, income, rent burden, commute, and poverty pressure into a beta cost signal. Higher values mean more local cost strain.`,
    },
    {
      id: "income-distribution",
      icon: Banknote,
      label: "Income Spread",
      value: profile.medianHouseholdIncome ? (profile.medianHouseholdIncome > 90000 ? "Upper" : profile.medianHouseholdIncome > 60000 ? "Middle" : "Value") : "-",
      detail: "Estimated income-band profile",
      insightTitle: "Income spread shows market banding",
      insight: "This beta tile classifies the ZIP into a broad income band from median household income and poverty pressure. It is designed for quick scanning, not precise distribution analysis.",
    },
    {
      id: "poverty-rate",
      icon: MapPinned,
      label: "Poverty Rate",
      value: formatOptionalPercent(profile.povertyRate),
      detail: "ACS profile percent estimate",
      insightTitle: "Poverty rate flags affordability pressure",
      insight: profile.povertyRate === null ? "Poverty rate is unavailable for this profile." : `${formatOptionalPercent(profile.povertyRate)} of residents are estimated below the poverty line. This is a context signal for affordability stress, service needs, and local vulnerability.`,
    },
    {
      id: "high-school",
      icon: School,
      label: "High School Grad",
      value: formatOptionalPercent(profile.highSchoolGradRate),
      detail: "Age 25+ high school or higher",
      insightTitle: "High school attainment shows baseline education",
      insight: profile.highSchoolGradRate === null ? "High school attainment is unavailable for this profile." : `${formatOptionalPercent(profile.highSchoolGradRate)} of adults 25+ are estimated to have a high school diploma or higher. This helps frame workforce readiness and civic context.`,
    },
    {
      id: "bachelors",
      icon: GraduationCap,
      label: "Bachelor's+",
      value: formatOptionalPercent(profile.bachelorsOrHigherRate),
      detail: "Age 25+ bachelor's or higher",
      insightTitle: "Bachelor's+ indicates advanced attainment",
      insight: profile.bachelorsOrHigherRate === null ? "Bachelor's-or-higher attainment is unavailable for this profile." : `${formatOptionalPercent(profile.bachelorsOrHigherRate)} of adults 25+ are estimated to hold a bachelor's degree or higher. It often correlates with job mix, income ceiling, and professional-service demand.`,
    },
    {
      id: "housing-units",
      icon: Home,
      label: "Housing Units",
      value: formatOptionalNumber(profile.housingUnits),
      detail: "Total housing units",
      insightTitle: "Housing units show residential capacity",
      insight: profile.housingUnits === null ? "Housing unit count is unavailable for this profile." : `${formatOptionalNumber(profile.housingUnits)} housing units describe the physical residential base. Compare this with population, vacancy, and occupancy to understand density and local capacity.`,
    },
    {
      id: "median-rent",
      icon: Home,
      label: "Median Rent",
      value: medianRent ? formatOptionalCurrency(medianRent) : "-",
      detail: "Estimated from home value and income pressure",
      insightTitle: "Median rent is a modeled rental-market proxy",
      insight: medianRent ? `${formatOptionalCurrency(medianRent)} is a beta rent estimate derived from home value, income, and tenure mix. It is clearly modeled until direct ACS rent fields are connected.` : "Median rent estimate is unavailable because housing value and income context are incomplete.",
    },
    {
      id: "rent-burden",
      icon: Scale,
      label: "Rent Burden",
      value: formatOptionalPercent(rentBurden),
      detail: "Beta modeled share over cost pressure",
      insightTitle: "Rent burden flags household stress",
      insight: `${formatOptionalPercent(rentBurden)} is a beta rent-burden signal built from modeled rent, income, poverty, and renter occupancy. It is not a direct ACS rent-burden table value yet.`,
    },
    {
      id: "housing-affordability",
      icon: Home,
      label: "Housing Affordability",
      value: `${Math.max(0, 100 - costOfLiving)}/100`,
      detail: "Inverse of local cost pressure",
      insightTitle: "Housing affordability summarizes price access",
      insight: `${Math.max(0, 100 - costOfLiving)}/100 is a beta affordability read. It uses available home-value, income, poverty, and rent pressure signals to highlight ownership and rental access.`,
    },
    {
      id: "home-value",
      icon: Home,
      label: "Median Home Value",
      value: formatOptionalCurrency(profile.medianHomeValue),
      detail: "Owner-occupied units",
      insightTitle: "Home value frames local asset price",
      insight: profile.medianHomeValue === null ? "Median home value is unavailable for this profile." : `${formatOptionalCurrency(profile.medianHomeValue)} is the median value of owner-occupied units. It is best read beside income to understand affordability pressure.`,
    },
    {
      id: "income-resident",
      icon: Banknote,
      label: "Income Per Resident",
      value: incomePerResident ? formatOptionalCurrency(incomePerResident) : "-",
      detail: "Modeled household-to-person signal",
      insightTitle: "Income per resident normalizes household income",
      insight: incomePerResident ? `${formatOptionalCurrency(incomePerResident)} is a modeled household-to-person signal. It is useful for comparing ZIPs with different household sizes, but it should not be treated as official per-capita income.` : "This modeled signal is unavailable because household income is missing.",
    },
    {
      id: "source-year",
      icon: Timer,
      label: "Source Year",
      value: profile.sourceYear,
      detail: "ACS 5-year Profile release",
      insightTitle: "Source year tells you data freshness",
      insight: `${profile.sourceYear} identifies the ACS profile release used here. The values are estimates for Census ZCTA context, so they are reliable for broad patterns rather than real-time changes.`,
    },
    {
      id: "crime-rate",
      icon: ShieldAlert,
      label: "Crime Rate",
      value: formatOptionalPercent(crimeRate),
      detail: "Modeled public-safety signal",
      insightTitle: "Crime rate is a modeled risk indicator",
      insight: `${formatOptionalPercent(crimeRate)} is a modeled public-safety signal built from local stress indicators such as poverty, vacancy, income, and education. It is not an official police crime statistic.`,
    },
    {
      id: "owner-occupied",
      icon: Home,
      label: "Owner Occupied",
      value: formatOptionalPercent(profile.ownerOccupiedRate),
      detail: "Occupied units owned by residents",
      insightTitle: "Owner occupancy shows residential stability",
      insight: profile.ownerOccupiedRate === null ? "Owner-occupancy rate is unavailable for this profile." : `${formatOptionalPercent(profile.ownerOccupiedRate)} of occupied units are owner occupied. Higher owner occupancy can signal neighborhood stability and longer-term household attachment.`,
    },
    {
      id: "vacancy",
      icon: MapPinned,
      label: "Vacancy Rate",
      value: formatOptionalPercent(profile.vacancyRate),
      detail: "Housing units currently vacant",
      insightTitle: "Vacancy rate shows unused housing capacity",
      insight: profile.vacancyRate === null ? "Vacancy rate is unavailable for this profile." : `${formatOptionalPercent(profile.vacancyRate)} of housing units are vacant. Vacancy can indicate seasonal housing, turnover, redevelopment, or local demand softness depending on the area.`,
    },
    {
      id: "commute",
      icon: Clock3,
      label: "Avg Commute",
      value: formatOptionalMinutes(profile.averageCommuteMinutes),
      detail: "Mean travel time to work",
      insightTitle: "Average commute reveals access friction",
      insight: profile.averageCommuteMinutes === null ? "Average commute time is unavailable for this profile." : `${formatOptionalMinutes(profile.averageCommuteMinutes)} is the mean travel time to work. Longer commutes can indicate regional job dependence or limited nearby employment options.`,
    },
    {
      id: "occupied-units",
      icon: Home,
      label: "Occupied Units",
      value: formatOptionalNumber(occupiedUnits),
      detail: "Modeled from vacancy and housing",
      insightTitle: "Occupied units estimate active households",
      insight: occupiedUnits === null ? "Occupied units cannot be modeled because housing or vacancy data is missing." : `${formatOptionalNumber(occupiedUnits)} units are estimated occupied from total housing and vacancy. This approximates active residential households in the ZIP/ZCTA.`,
    },
    {
      id: "renter-occupied",
      icon: Users,
      label: "Renter Occupied",
      value: formatOptionalPercent(renterOccupiedRate),
      detail: "Occupied units rented by residents",
      insightTitle: "Renter occupancy shows tenure mix",
      insight: renterOccupiedRate === null ? "Renter-occupancy rate is unavailable for this profile." : `${formatOptionalPercent(renterOccupiedRate)} of occupied units are estimated renter occupied. This helps explain mobility, affordability needs, and housing-market flexibility.`,
    },
    {
      id: "apartment-mix",
      icon: Building2,
      label: "Apartment Mix",
      value: formatOptionalPercent(apartmentMix),
      detail: "Beta structure-type estimate",
      insightTitle: "Apartment mix shows multifamily intensity",
      insight: `${formatOptionalPercent(apartmentMix)} is a modeled multifamily/apartment signal derived from density, renter share, and vacancy. It is useful for market feel, not a direct structure-count table.`,
    },
    {
      id: "single-family-mix",
      icon: Home,
      label: "Single-Family Mix",
      value: formatOptionalPercent(apartmentMix === null ? null : 1 - apartmentMix),
      detail: "Beta inverse of apartment signal",
      insightTitle: "Single-family mix shows neighborhood form",
      insight: "This beta tile estimates the share of residential context that reads single-family from ownership, density, and multifamily pressure signals.",
    },
    {
      id: "housing-density",
      icon: Building2,
      label: "Housing Density",
      value: populationDensity === null ? "-" : `${formatNumber(Math.round(populationDensity / Math.max(householdSize, 1)))}/mi²`,
      detail: "Estimated housing-unit density",
      insightTitle: "Housing density distinguishes built form",
      insight: "Housing density is modeled from population density and household size. It helps separate compact apartment-heavy areas from lower-density residential ZIPs.",
    },
    {
      id: "home-income",
      icon: Scale,
      label: "Home / Income",
      value: formatValueIncomeRatio(profile),
      detail: "Median value to income ratio",
      insightTitle: "Home-to-income ratio shows affordability strain",
      insight: profile.medianHomeValue && profile.medianHouseholdIncome ? `${formatValueIncomeRatio(profile)} means the median home value is about ${formatValueIncomeRatio(profile)} the median household income. Higher ratios usually mean ownership is harder relative to local earnings.` : "The home-to-income ratio is unavailable because income or home value is missing.",
    },
    {
      id: "literacy-rate",
      icon: School,
      label: "Literacy Rate",
      value: formatOptionalPercent(literacyRate),
      detail: "Modeled from adult education",
      insightTitle: "Literacy rate is a modeled readiness proxy",
      insight: literacyRate === null ? "Literacy rate cannot be modeled because education fields are unavailable." : `${formatOptionalPercent(literacyRate)} is a modeled adult-literacy proxy derived from high-school and bachelor's+ attainment. It is useful for communication planning, but it is not an official direct literacy survey result.`,
    },
    {
      id: "graduate-degree",
      icon: GraduationCap,
      label: "Graduate Degree",
      value: formatOptionalPercent(buildGraduateDegreeEstimate(profile)),
      detail: "Beta modeled from bachelor's+",
      insightTitle: "Graduate degrees sharpen talent-market read",
      insight: "Graduate-degree share is modeled from bachelor's+ attainment and income strength. It is a beta talent-depth signal until advanced education tables are connected.",
    },
    {
      id: "school-quality",
      icon: School,
      label: "School Signal",
      value: `${buildSchoolQualitySignal(profile)}/100`,
      detail: "Beta education and family blend",
      insightTitle: "School signal frames family demand",
      insight: "School signal blends education attainment, owner occupancy, family-household estimate, and poverty pressure into a directional family-planning score.",
    },
    {
      id: "employment-rate",
      icon: BriefcaseBusiness,
      label: "Employment Rate",
      value: formatOptionalPercent(employmentRate),
      detail: "Beta modeled labor signal",
      insightTitle: "Employment rate estimates job attachment",
      insight: `${formatOptionalPercent(employmentRate)} is modeled from education, poverty, commute, and income. It is a planning signal, not a direct labor-force table.`,
    },
    {
      id: "unemployment-rate",
      icon: BriefcaseBusiness,
      label: "Unemployment Rate",
      value: formatOptionalPercent(unemploymentRate),
      detail: "Beta modeled labor stress",
      insightTitle: "Unemployment rate flags workforce stress",
      insight: `${formatOptionalPercent(unemploymentRate)} is a beta estimate derived from poverty, education, and income conditions. Use it as a risk cue only.`,
    },
    {
      id: "labor-participation",
      icon: BriefcaseBusiness,
      label: "Labor Force",
      value: formatOptionalPercent(laborParticipation),
      detail: "Beta participation estimate",
      insightTitle: "Labor force participation shows workforce depth",
      insight: `${formatOptionalPercent(laborParticipation)} is a modeled labor-force participation signal. It helps compare workforce availability across ZIPs.`,
    },
    {
      id: "job-sectors",
      icon: Store,
      label: "Major Sectors",
      value: buildMajorSectorLabel(profile),
      detail: "Beta sector inference",
      insightTitle: "Major sectors infer local economy flavor",
      insight: "The sector read is inferred from education, income, commute, and density patterns. It does not replace direct industry employment tables.",
    },
    {
      id: "white-collar",
      icon: Laptop,
      label: "White Collar",
      value: `${whiteCollar}/100`,
      detail: "Beta occupation mix estimate",
      insightTitle: "White-collar score tracks professional-market tilt",
      insight: `${whiteCollar}/100 is modeled from bachelor's+ attainment, income, commute, and density. Higher scores suggest stronger professional and office-oriented demand.`,
    },
    {
      id: "remote-work",
      icon: Laptop,
      label: "Remote Work",
      value: `${remoteWork}/100`,
      detail: "Beta remote-work potential",
      insightTitle: "Remote-work potential indicates flexible-work fit",
      insight: `${remoteWork}/100 blends broadband, education, income, commute, and professional-work signals. It is a beta readiness score.`,
    },
    {
      id: "population-density",
      icon: Radar,
      label: "Density Signal",
      value: populationDensity === null ? "-" : `${formatNumber(populationDensity)}/mi²`,
      detail: "Modeled ZIP/ZCTA compactness",
      insightTitle: "Density signal estimates local compactness",
      insight: populationDensity === null ? "Density signal is unavailable because the model lacks enough population and housing context." : `${formatNumber(populationDensity)} residents per square mile is a modeled density signal based on population and housing-unit intensity. It helps classify whether the ZIP reads more urban, suburban, or rural for planning workflows.`,
    },
    {
      id: "vehicle-ownership",
      icon: Car,
      label: "Vehicle Access",
      value: `${vehicleOwnership}/100`,
      detail: "Beta vehicle-ownership signal",
      insightTitle: "Vehicle access frames mobility dependence",
      insight: `${vehicleOwnership}/100 estimates vehicle access from density, commute, income, and transit access. It helps identify car-dependent ZIPs.`,
    },
    {
      id: "transit-access",
      icon: Train,
      label: "Transit Access",
      value: `${transitAccess}/100`,
      detail: "Beta public-transit access",
      insightTitle: "Transit access shows non-car mobility",
      insight: `${transitAccess}/100 is a modeled access score from density, commute, and urban/suburban signals. It is directional until direct commute-mode fields are added.`,
    },
    {
      id: "walkability",
      icon: Navigation,
      label: "Walkability",
      value: `${walkability}/100`,
      detail: "Beta compactness estimate",
      insightTitle: "Walkability estimates local convenience",
      insight: `${walkability}/100 blends density, housing form, business density, and commute. It is a beta lifestyle/access signal.`,
    },
    {
      id: "healthcare-access",
      icon: HeartPulse,
      label: "Healthcare Access",
      value: `${buildHealthcareAccess(profile)}/100`,
      detail: "Beta access and stability signal",
      insightTitle: "Healthcare access estimates service reach",
      insight: "Healthcare access uses density, age, income, and commute friction as a beta service-access proxy. It is not a provider-count dataset.",
    },
    {
      id: "broadband",
      icon: Wifi,
      label: "Broadband Access",
      value: `${broadband}/100`,
      detail: "Beta technology-access estimate",
      insightTitle: "Broadband access supports digital readiness",
      insight: `${broadband}/100 estimates internet access from income, education, density, and housing stability. It is labeled beta until direct technology-access tables are wired.`,
    },
    {
      id: "device-access",
      icon: Smartphone,
      label: "Device Access",
      value: `${buildDeviceAccess(profile)}/100`,
      detail: "Beta smartphone/device estimate",
      insightTitle: "Device access predicts digital engagement",
      insight: "Device access is modeled from broadband, income, age, and education context. It helps frame app adoption potential.",
    },
    {
      id: "language-diversity",
      icon: Languages,
      label: "Language Diversity",
      value: `${languageDiversity}/100`,
      detail: "Beta cultural-diversity signal",
      insightTitle: "Language diversity informs communication strategy",
      insight: `${languageDiversity}/100 is inferred from race/ethnicity dispersion, density, and metro signals. It is not a direct language-at-home table.`,
    },
    {
      id: "foreign-born",
      icon: Languages,
      label: "Foreign-Born",
      value: formatOptionalPercent(foreignBorn),
      detail: "Beta migration/cultural signal",
      insightTitle: "Foreign-born share estimates migration texture",
      insight: `${formatOptionalPercent(foreignBorn)} is a beta estimate from diversity, density, education, and income patterns. It should stay directional until ACS nativity fields are added.`,
    },
    {
      id: "migration-trend",
      icon: Rocket,
      label: "Migration Trend",
      value: growthOpportunity > 70 ? "Inbound" : growthOpportunity > 48 ? "Stable" : "Watch",
      detail: "Beta momentum inference",
      insightTitle: "Migration trend is a directional momentum read",
      insight: "Migration trend is inferred from growth opportunity, vacancy, cost pressure, and education. It does not claim live move-in/move-out counts.",
    },
    {
      id: "business-density",
      icon: Store,
      label: "Business Density",
      value: `${businessDensity}/100`,
      detail: "Beta local commerce signal",
      insightTitle: "Business density estimates local activity",
      insight: `${businessDensity}/100 blends density, income, commute, and education into a local-commerce proxy.`,
    },
    {
      id: "restaurant-density",
      icon: Store,
      label: "Restaurant Density",
      value: `${restaurantDensity}/100`,
      detail: "Beta dining-market signal",
      insightTitle: "Restaurant density supports lifestyle demand",
      insight: `${restaurantDensity}/100 is modeled from business density, population, income, and entertainment context.`,
    },
    {
      id: "entertainment-density",
      icon: Sparkles,
      label: "Entertainment",
      value: `${entertainmentDensity}/100`,
      detail: "Beta leisure-market signal",
      insightTitle: "Entertainment density estimates night/weekend demand",
      insight: `${entertainmentDensity}/100 blends density, young-professional score, sports demand, and business context.`,
    },
    {
      id: "sports-fan-intensity",
      icon: Trophy,
      label: "Sports Fan Intensity",
      value: `${sportsFanIntensity}/100`,
      detail: "Estimated sports-market signal",
      insightTitle: "Sports fan intensity is the ZipScope sports layer",
      insight: `${sportsFanIntensity}/100 estimates local sports energy from population, age, income, density, and event-demand context. It is a directional ZipScope Sports Intel score.`,
    },
    {
      id: "event-demand",
      icon: Trophy,
      label: "Event Demand",
      value: `${eventDemand}/100`,
      detail: "Estimated stadium/event demand",
      insightTitle: "Event demand estimates weekend lift potential",
      insight: `${eventDemand}/100 combines sports intensity, mobility, entertainment, and population scale to estimate nearby event demand.`,
    },
    {
      id: "tourism-traffic",
      icon: MapPinned,
      label: "Tourism Traffic",
      value: `${buildTourismTraffic(profile)}/100`,
      detail: "Beta event/travel signal",
      insightTitle: "Tourism traffic estimates visitor demand",
      insight: "Tourism traffic is a beta estimate from entertainment density, event demand, commute access, and population scale.",
    },
    {
      id: "civic-participation",
      icon: Vote,
      label: "Civic Participation",
      value: `${buildCivicParticipation(profile)}/100`,
      detail: "Beta civic-readiness signal",
      insightTitle: "Civic participation estimates public engagement",
      insight: "Civic participation blends education, owner occupancy, age, and stability. It is a broad engagement signal, not voter data.",
    },
    {
      id: "weather-comfort",
      icon: CloudSun,
      label: "Weather Comfort",
      value: `${weatherComfort}/100`,
      detail: "Beta climate comfort estimate",
      insightTitle: "Weather comfort adds lifestyle context",
      insight: `${weatherComfort}/100 estimates comfort from regional state, age, commute, and lifestyle context. It is not a live weather forecast.`,
    },
    {
      id: "weather-risk",
      icon: Umbrella,
      label: "Weather Risk",
      value: `${weatherRisk}/100`,
      detail: "Beta weather/disaster risk",
      insightTitle: "Weather risk flags planning friction",
      insight: `${weatherRisk}/100 is a beta regional risk estimate. It should be replaced with authoritative hazard datasets for production risk scoring.`,
    },
    {
      id: "growth-opportunity",
      icon: Rocket,
      label: "Growth Opportunity",
      value: `${growthOpportunity}/100`,
      detail: "Beta neighborhood growth score",
      insightTitle: "Growth opportunity compresses upside",
      insight: `${growthOpportunity}/100 blends population scale, education, vacancy, affordability, and mobility into a growth-opportunity signal.`,
    },
    {
      id: "similar-match",
      icon: Radar,
      label: "Similar ZIP Match",
      value: `${similarZipMatch}/100`,
      detail: "Beta match-readiness score",
      insightTitle: "Similar ZIP match shows comparability quality",
      insight: `${similarZipMatch}/100 estimates how well this ZIP can be matched against peer ZIPs using currently available signals.`,
    },
    {
      id: "investment-score",
      icon: Gauge,
      label: "Investment Score",
      value: `${investmentScore}/100`,
      detail: "Beta attractiveness index",
      insightTitle: "Investment score balances demand and risk",
      insight: `${investmentScore}/100 blends income, education, affordability, vacancy, growth, and sports/event potential. It is an investor-facing planning signal, not financial advice.`,
    },
    {
      id: "family-friendly",
      icon: Baby,
      label: "Family Friendly",
      value: `${familyFriendly}/100`,
      detail: "Beta family-fit score",
      insightTitle: "Family friendliness highlights household fit",
      insight: `${familyFriendly}/100 blends household size, ownership, school signal, safety proxy, and affordability.`,
    },
    {
      id: "young-professional",
      icon: Laptop,
      label: "Young Professional",
      value: `${youngProfessional}/100`,
      detail: "Beta talent/lifestyle score",
      insightTitle: "Young professional score identifies career/lifestyle fit",
      insight: `${youngProfessional}/100 combines age, education, remote-work potential, entertainment, and mobility.`,
    },
    {
      id: "retirement-comfort",
      icon: HeartPulse,
      label: "Retirement Comfort",
      value: `${retirementComfort}/100`,
      detail: "Beta older-adult lifestyle score",
      insightTitle: "Retirement comfort estimates older-adult fit",
      insight: `${retirementComfort}/100 blends median age, healthcare access, weather comfort, affordability, and safety proxy.`,
    },
    {
      id: "local-mobility",
      icon: Navigation,
      label: "Local Mobility",
      value: `${localMobility}/100`,
      detail: "Beta access and commute score",
      insightTitle: "Local mobility summarizes access choices",
      insight: `${localMobility}/100 blends commute, vehicle access, transit, walkability, and density.`,
    },
    {
      id: "neighborhood-momentum",
      icon: Rocket,
      label: "Momentum Score",
      value: `${neighborhoodMomentum}/100`,
      detail: "Beta multi-signal momentum",
      insightTitle: "Momentum score finds the ZIP's directional energy",
      insight: `${neighborhoodMomentum}/100 combines growth, investment, sports/event demand, business density, and cost pressure into a directional scan.`,
    },
    {
      id: "affluence-index",
      icon: Sparkles,
      label: "Affluence Index",
      value: `${householdAffluence}/100`,
      detail: "Income, ownership, education blend",
      insightTitle: "Affluence index compresses economic strength",
      insight: `${householdAffluence}/100 blends median income, owner occupancy, bachelor's+ attainment, and poverty pressure. It is a modeled comparison score designed for scanning ZIPs quickly, not an official Census field.`,
    },
    {
      id: "resilience-score",
      icon: Gauge,
      label: "Resilience Score",
      value: `${marketResilience}/100`,
      detail: "Economic stability signal",
      insightTitle: "Resilience score captures stability under pressure",
      insight: `${marketResilience}/100 blends education, income, occupancy, vacancy, commute, and poverty into a local stability signal. Higher values imply stronger underlying demographic and household support for long-range planning.`,
    },
    {
      id: "top-group",
      icon: Users,
      label: "Top Group Share",
      value: topRaceGroup ? `${topRaceGroup.value.toFixed(0)}%` : "-",
      detail: topRaceGroup ? `${topRaceGroup.label} ACS share` : "Race/ethnicity estimate",
      insightTitle: "Top group share summarizes composition concentration",
      insight: topRaceGroup ? `${topRaceGroup.label} is the largest shown ACS race/ethnicity group at ${topRaceGroup.value.toFixed(1)}%. This describes aggregate composition and should not be used to infer individual identity.` : "Top group share is unavailable because race/ethnicity estimates are missing.",
    },
  ];

  const extraMetrics = {
    householdAffluence,
    marketResilience,
    costOfLiving,
    rentBurden,
    employmentRate,
    unemploymentRate,
    laborParticipation,
    whiteCollar,
    remoteWork,
    vehicleOwnership,
    transitAccess,
    walkability,
    broadband,
    languageDiversity,
    foreignBorn,
    businessDensity,
    restaurantDensity,
    entertainmentDensity,
    sportsFanIntensity,
    eventDemand,
    weatherComfort,
    weatherRisk,
    growthOpportunity,
    investmentScore,
    familyFriendly,
    youngProfessional,
    retirementComfort,
    localMobility,
    neighborhoodMomentum,
    similarZipMatch,
  };

  const expandedTiles = [
    ...tiles,
    ...buildAdditionalTiles(profile, extraMetrics),
    ...buildDecisionIntelligenceTiles(profile, extraMetrics),
  ];

  return expandedTiles.map((tile) => enrichTile(tile));
}

function formatGeographicSummary(profile: DemographicProfile) {
  const place = profile.place
    ? `${profile.place.city}, ${profile.place.stateCode}${profile.place.county ? ` in ${profile.place.county}` : ""}`
    : profile.name;

  return `ZIP ${profile.zip} maps to Census ZCTA ${profile.zcta}; place label resolves to ${place}.`;
}

type ExtraTileMetrics = {
  broadband: number;
  businessDensity: number;
  costOfLiving: number;
  employmentRate: number;
  entertainmentDensity: number;
  eventDemand: number;
  familyFriendly: number;
  foreignBorn: number;
  growthOpportunity: number;
  householdAffluence: number;
  investmentScore: number;
  laborParticipation: number;
  languageDiversity: number;
  localMobility: number;
  marketResilience: number;
  neighborhoodMomentum: number;
  remoteWork: number;
  rentBurden: number | null;
  restaurantDensity: number;
  retirementComfort: number;
  similarZipMatch: number;
  sportsFanIntensity: number;
  transitAccess: number;
  unemploymentRate: number;
  vehicleOwnership: number;
  walkability: number;
  weatherComfort: number;
  weatherRisk: number;
  whiteCollar: number;
  youngProfessional: number;
};

function buildAdditionalTiles(profile: DemographicProfile, m: ExtraTileMetrics): DemographicTile[] {
  const communityType = classifyCommunityType(profile);
  const ageDistribution = buildAgeDistribution(profile);
  const blueCollar = Math.round(clamp(100 - m.whiteCollar, 6, 88));
  const affordabilityPressure = Math.round(clamp(m.costOfLiving * 0.72 + (m.rentBurden ?? 0.28) * 72, 16, 98));
  const retailDensity = Math.round(clamp(m.businessDensity * 0.48 + m.restaurantDensity * 0.24 + m.localMobility * 0.18, 12, 96));
  const jobAccess = Math.round(clamp(m.localMobility * 0.36 + m.businessDensity * 0.28 + m.employmentRate * 36, 14, 96));
  const commuteBurden = Math.round(clamp((profile.averageCommuteMinutes ?? 24) * 2.3 + (100 - m.localMobility) * 0.24, 12, 96));
  const employerDensity = Math.round(clamp(m.businessDensity * 0.64 + m.employmentRate * 26, 12, 96));
  const educationStrength = Math.round(clamp((profile.highSchoolGradRate ?? 0.84) * 32 + (profile.bachelorsOrHigherRate ?? 0.26) * 46 + m.remoteWork * 0.16, 18, 96));
  const workforceEducation = Math.round(clamp(educationStrength * 0.62 + m.whiteCollar * 0.28, 18, 96));
  const airportAccess = Math.round(clamp(m.localMobility * 0.34 + m.businessDensity * 0.24 + (profile.place?.stateCode === "NC" ? 15 : 8), 10, 88));
  const highwayAccess = Math.round(clamp(78 - Math.max(0, (profile.averageCommuteMinutes ?? 24) - 22) + m.vehicleOwnership * 0.18, 18, 96));
  const healthcareAccess = buildHealthcareAccess(profile);
  const convenience = Math.round(clamp(m.walkability * 0.28 + retailDensity * 0.25 + healthcareAccess * 0.22 + m.broadband * 0.12, 12, 96));
  const veteranPopulation = Math.round(clamp(6 + ((profile.medianAge ?? 40) - 32) * 0.22 + (profile.place?.stateCode === "NC" ? 1.5 : 0), 3, 18));
  const communityStability = Math.round(clamp((profile.ownerOccupiedRate ?? 0.58) * 42 + (1 - (profile.vacancyRate ?? 0.08)) * 28 + m.marketResilience * 0.26, 20, 96));
  const economicVulnerability = Math.round(clamp((profile.povertyRate ?? 0.12) * 220 + (100 - m.marketResilience) * 0.42 + m.costOfLiving * 0.2, 10, 96));
  const businessOpportunity = Math.round(clamp(m.growthOpportunity * 0.32 + m.businessDensity * 0.24 + m.investmentScore * 0.24 + m.sportsFanIntensity * 0.12, 12, 96));
  const retailOpportunity = Math.round(clamp(retailDensity * 0.35 + m.familyFriendly * 0.18 + m.localMobility * 0.2 + m.growthOpportunity * 0.18, 12, 96));
  const restaurantOpportunity = Math.round(clamp(m.restaurantDensity * 0.32 + m.entertainmentDensity * 0.24 + m.eventDemand * 0.22 + m.localMobility * 0.14, 12, 96));
  const commuterOpportunity = Math.round(clamp(m.localMobility * 0.36 + highwayAccess * 0.28 + m.vehicleOwnership * 0.18 + (100 - commuteBurden) * 0.18, 12, 96));
  const sportsEnergy = Math.round(clamp(m.sportsFanIntensity * 0.45 + m.eventDemand * 0.35 + m.entertainmentDensity * 0.14, 12, 98));
  const gameDayDemand = Math.round(clamp(m.eventDemand * 0.52 + m.restaurantDensity * 0.18 + highwayAccess * 0.16 + m.sportsFanIntensity * 0.14, 12, 98));
  const aiRisk = Math.round(clamp(economicVulnerability * 0.34 + affordabilityPressure * 0.28 + m.weatherRisk * 0.18 + commuteBurden * 0.14, 8, 96));
  const aiOpportunity = Math.round(clamp(m.growthOpportunity * 0.32 + businessOpportunity * 0.28 + sportsEnergy * 0.16 + m.investmentScore * 0.18, 12, 98));
  const bestComparison = profile.medianHouseholdIncome && profile.medianHouseholdIncome > 85000 ? "Peer income" : "Value peer";

  return [
    quickTile("zip-profile-score", Gauge, "ZIP Profile Score", `${Math.round((m.marketResilience + m.investmentScore + m.localMobility) / 3)}/100`, "Overview score", "Overview", "Beta rollup of stability, investment, and access."),
    quickTile("zip-identity", Radar, "ZIP Identity", communityType, "Profile summary", "Overview", "Original identity label from scale, density, and income."),
    quickTile("community-type", Home, "Community Type", communityType, "Urban/suburban/rural estimate", "Overview", "Modeled community feel using population, housing, education, and place context."),
    quickTile("area-comparison", Scale, "Area Comparison", `${m.similarZipMatch}/100`, "Beta peer-readiness", "Overview", "Scores how easily this ZIP can be compared with similar ZIP profiles."),
    quickTile("population-growth", Rocket, "Population Growth", m.growthOpportunity > 68 ? "Growth" : m.growthOpportunity > 45 ? "Stable" : "Slow", "Beta growth proxy", "Population", "Directional population momentum from stability, vacancy, and opportunity signals."),
    quickTile("age-distribution", Users, "Age Distribution", ageDistribution, "Estimated age mix", "Population", "Compact age-band read from median age and household structure."),
    quickTile("youth-population", Baby, "Youth Population", `${buildYouthShare(profile)}%`, "Estimated under-18 share", "Population", "Beta youth share inferred from age, household size, and family signals."),
    quickTile("young-adult-population", UserRound, "Young Adults", `${buildYoungAdultShare(profile)}%`, "Estimated 18-34 share", "Population", "Beta young-adult share inferred from age, density, education, and entertainment context."),
    quickTile("senior-population", HeartPulse, "Senior Population", `${buildSeniorShare(profile)}%`, "Estimated 65+ share", "Population", "Beta senior share inferred from median age, healthcare, and retirement-fit signals."),
    quickTile("upper-income-share", Banknote, "Upper-Income Share", `${buildUpperIncomeShare(profile)}%`, "Estimated income tier", "Income", "Directional share of households likely above the local upper-income band."),
    quickTile("middle-income-share", Banknote, "Middle-Income Share", `${buildMiddleIncomeShare(profile)}%`, "Estimated income tier", "Income", "Directional middle-income band from income, poverty, and housing pressure."),
    quickTile("working-class-share", BriefcaseBusiness, "Working-Class Share", `${buildWorkingClassShare(profile)}%`, "Estimated income/work mix", "Income", "Modeled from income, education, occupation mix, and cost pressure."),
    quickTile("disposable-income", Banknote, "Disposable Income", `${Math.max(8, 100 - m.costOfLiving)}/100`, "Estimated spending room", "Income", "Income headroom after modeled local cost pressure."),
    quickTile("cost-pressure-score", Scale, "Cost Pressure", `${m.costOfLiving}/100`, "Modeled affordability strain", "Income", "Cost signal from housing, rent, poverty, and commute friction."),
    quickTile("affordability-pressure", Scale, "Affordability Pressure", `${affordabilityPressure}/100`, "Beta pressure score", "Income", "Combines cost of living and rent burden into one pressure indicator."),
    quickTile("housing-growth", Rocket, "Housing Growth", m.neighborhoodMomentum > 68 ? "Active" : m.neighborhoodMomentum > 45 ? "Steady" : "Limited", "Beta housing momentum", "Housing", "Directional read from vacancy, affordability, and neighborhood momentum."),
    quickTile("new-construction", Building2, "New Construction", `${Math.round(clamp(100 - (profile.vacancyRate ?? 0.08) * 260 + m.growthOpportunity * 0.28, 8, 88))}/100`, "Beta supply signal", "Housing", "Estimates where new housing demand may be present."),
    quickTile("homeownership-strength", Home, "Ownership Strength", `${Math.round((profile.ownerOccupiedRate ?? 0.58) * 100)}/100`, "Owner-occupancy signal", "Housing", "Owner occupancy translated into a stability-oriented score."),
    quickTile("blue-collar", BriefcaseBusiness, "Blue Collar", `${blueCollar}/100`, "Beta occupation mix", "Jobs", "Inverse professional-work proxy, tuned by education and commute context."),
    quickTile("job-access", BriefcaseBusiness, "Job Access", `${jobAccess}/100`, "Beta access score", "Jobs", "Access to job markets from mobility, employer density, and employment strength."),
    quickTile("commute-burden", Clock3, "Commute Burden", `${commuteBurden}/100`, "Modeled access friction", "Jobs", "Higher values mean commute time and access constraints weigh more heavily."),
    quickTile("employer-density", Store, "Employer Density", `${employerDensity}/100`, "Beta employer signal", "Jobs", "Local employer depth inferred from business density and employment attachment."),
    quickTile("student-population", School, "Student Population", `${Math.round(clamp(buildYouthShare(profile) * 0.72 + buildYoungAdultShare(profile) * 0.3, 8, 34))}%`, "Beta school-age/college mix", "Education", "Student population proxy from age mix and education signals."),
    quickTile("education-strength", GraduationCap, "Education Strength", `${educationStrength}/100`, "Education score", "Education", "Blends high-school, college, and remote-work readiness."),
    quickTile("workforce-education", GraduationCap, "Workforce Education", `${workforceEducation}/100`, "Labor skill proxy", "Education", "Workforce readiness from education and professional-work signals."),
    quickTile("airport-access", Navigation, "Airport Access", `${airportAccess}/100`, "Beta regional access", "Transportation", "Regional mobility proxy for airport-style travel access."),
    quickTile("highway-access", Car, "Highway Access", `${highwayAccess}/100`, "Beta road access", "Transportation", "Road convenience estimate from commute, vehicle access, and local mobility."),
    quickTile("commuter-convenience", Clock3, "Commuter Convenience", `${100 - commuteBurden}/100`, "Inverse commute burden", "Transportation", "How easy the ZIP reads for daily work travel."),
    quickTile("retail-density", Store, "Retail Density", `${retailDensity}/100`, "Beta retail signal", "Lifestyle", "Retail presence inferred from commerce, mobility, and local convenience."),
    quickTile("local-convenience", Navigation, "Local Convenience", `${convenience}/100`, "Lifestyle access score", "Lifestyle", "A quick read on everyday access and ease."),
    quickTile("veteran-population", ShieldAlert, "Veteran Population", `${veteranPopulation}%`, "Beta veteran estimate", "Civic", "Directional veteran-population signal from age and regional context."),
    quickTile("community-stability", Home, "Community Stability", `${communityStability}/100`, "Stability score", "Civic", "Ownership, occupancy, and resilience rolled into a community stability read."),
    quickTile("community-growth", Rocket, "Community Growth", `${Math.round((m.neighborhoodMomentum + m.growthOpportunity) / 2)}/100`, "Growth composite", "Civic", "Momentum and opportunity blended for community-level growth."),
    quickTile("housing-pressure", Home, "Housing Pressure", `${affordabilityPressure}/100`, "Risk score", "Safety", "Housing price and rent burden pressure scan."),
    quickTile("rent-burden-risk", Scale, "Rent Burden Risk", `${Math.round((m.rentBurden ?? 0.28) * 100)}/100`, "Modeled rent risk", "Safety", "Rent burden translated into a quick risk score."),
    quickTile("cost-living-risk", AlertIconFallback, "Cost Risk", `${m.costOfLiving}/100`, "Cost-of-living risk", "Safety", "Cost pressure, affordability, and poverty pressure rolled together."),
    quickTile("transit-weakness", Train, "Transit Weakness", `${100 - m.transitAccess}/100`, "Mobility risk", "Safety", "Lower transit access creates higher weakness scores."),
    quickTile("commute-risk", Clock3, "Commute Risk", `${commuteBurden}/100`, "Commute burden risk", "Safety", "Longer travel times and weaker mobility increase this risk."),
    quickTile("economic-vulnerability", ShieldAlert, "Economic Vulnerability", `${economicVulnerability}/100`, "Beta vulnerability score", "Safety", "Poverty, cost pressure, and resilience combined into a risk scan."),
    quickTile("business-opportunity", Store, "Business Opportunity", `${businessOpportunity}/100`, "Opportunity score", "Growth", "Growth, commerce, investment, and sports energy blended for business scouting."),
    quickTile("retail-opportunity", Store, "Retail Opportunity", `${retailOpportunity}/100`, "Retail upside", "Growth", "Retail density, mobility, family demand, and growth signals."),
    quickTile("restaurant-opportunity", Store, "Restaurant Opportunity", `${restaurantOpportunity}/100`, "Dining upside", "Growth", "Dining demand from restaurant density, entertainment, and event potential."),
    quickTile("event-opportunity", Trophy, "Event Opportunity", `${m.eventDemand}/100`, "Event upside", "Growth", "Event and sports demand turned into a business opportunity score."),
    quickTile("family-opportunity", Baby, "Family Opportunity", `${m.familyFriendly}/100`, "Family-market upside", "Growth", "Family-friendly fit as an opportunity lens."),
    quickTile("commuter-opportunity", Car, "Commuter Opportunity", `${commuterOpportunity}/100`, "Commuter-market upside", "Growth", "Convenience, road access, and mobility blended for commuter demand."),
    quickTile("nearby-stadium-demand", Trophy, "Stadium Demand", `${m.eventDemand}/100`, "Estimated stadium/event pull", "Sports", "Event-demand proxy for venue-driven activity."),
    quickTile("weekend-sports-potential", Trophy, "Weekend Sports", `${sportsEnergy}/100`, "Weekend potential", "Sports", "Sports energy and local entertainment context."),
    quickTile("sports-market-pulse", Trophy, "Sports Pulse", `${sportsEnergy}/100`, "Sports market pulse", "Sports", "ZipScope sports signal from fan intensity, event demand, and leisure activity."),
    quickTile("local-sports-energy", Trophy, "Sports Energy", `${sportsEnergy}/100`, "Local sports energy", "Sports", "How strongly the ZIP reads for sports-led activity."),
    quickTile("game-day-demand", Trophy, "Game-Day Demand", `${gameDayDemand}/100`, "Estimated game-day lift", "Sports", "Restaurant, mobility, and event signals for game-day lift."),
    quickTile("public-odds-shortcut", Trophy, "Public Odds", "Preview", "Shortcut coming soon", "Sports", "Future shortcut to public odds intelligence; disabled until full provider wiring exists."),
    quickTile("event-business-opportunity", Store, "Event Business", `${restaurantOpportunity}/100`, "Event-driven commerce", "Sports", "Event demand translated into local business potential."),
    quickTile("best-comparison-zip", Radar, "Best Comparison", bestComparison, "Beta comparison label", "Beta Insights", "Suggests what type of peer ZIP to compare first."),
    quickTile("higher-income-comparison", Banknote, "Higher-Income Peer", "Preview", "Comparison shortcut", "Beta Insights", "Future peer finder for higher-income ZIP benchmarks."),
    quickTile("lower-cost-comparison", Scale, "Lower-Cost Peer", "Preview", "Comparison shortcut", "Beta Insights", "Future peer finder for lower-cost ZIP benchmarks."),
    quickTile("better-growth-comparison", Rocket, "Growth Peer", "Preview", "Comparison shortcut", "Beta Insights", "Future peer finder for stronger-growth ZIP benchmarks."),
    quickTile("sports-market-peer", Trophy, "Sports Peer", "Preview", "Comparison shortcut", "Beta Insights", "Future peer finder for similar sports/event markets."),
    quickTile("ai-opportunity", Sparkles, "AI Opportunity", `${aiOpportunity}/100`, "AI beta estimate", "Beta Insights", "AI-style opportunity blend from growth, business, sports, and investment signals."),
    quickTile("ai-risk", ShieldAlert, "AI Risk", `${aiRisk}/100`, "AI beta estimate", "Beta Insights", "AI-style risk blend from cost, weather, commute, and vulnerability."),
    quickTile("ai-recommendation", LightbulbIconFallback, "AI Recommendation", aiOpportunity > aiRisk ? "Scout" : "Watch", "AI tile recommendation", "Beta Insights", "Quick recommendation from opportunity versus risk."),
    quickTile("ai-confidence", ShieldAlert, "AI Confidence", `${Math.round(clamp(58 + m.similarZipMatch * 0.22 + m.marketResilience * 0.18, 40, 96))}%`, "AI confidence score", "Beta Insights", "Confidence for modeled overlays based on source coverage and signal agreement."),
  ];
}

const AlertIconFallback = ShieldAlert;
const LightbulbIconFallback = Sparkles;

function buildDecisionIntelligenceTiles(profile: DemographicProfile, m: ExtraTileMetrics): DemographicTile[] {
  const householdSize = buildModeledHouseholdSize(profile);
  const density = buildModeledPopulationDensity(profile) ?? 900;
  const renterRate = buildRenterOccupiedRate(profile) ?? 0.34;
  const ownerRate = profile.ownerOccupiedRate ?? 0.58;
  const vacancy = profile.vacancyRate ?? 0.08;
  const commute = profile.averageCommuteMinutes ?? 24;
  const poverty = profile.povertyRate ?? 0.12;
  const bachelors = profile.bachelorsOrHigherRate ?? 0.24;
  const highSchool = profile.highSchoolGradRate ?? 0.84;
  const medianIncome = profile.medianHouseholdIncome ?? 56000;
  const homeValue = profile.medianHomeValue ?? medianIncome * 3.2;
  const youth = buildYouthShare(profile);
  const youngAdult = buildYoungAdultShare(profile);
  const senior = buildSeniorShare(profile);
  const healthcare = buildHealthcareAccess(profile);
  const school = buildSchoolQualitySignal(profile);
  const tourism = buildTourismTraffic(profile);
  const civic = buildCivicParticipation(profile);
  const disposable = Math.round(clamp(100 - m.costOfLiving + m.householdAffluence * 0.16, 8, 96));
  const housingLiquidity = Math.round(clamp((1 - vacancy) * 38 + renterRate * 16 + m.growthOpportunity * 0.28 + m.localMobility * 0.12, 12, 96));
  const starterHomeFit = Math.round(clamp((100 - m.costOfLiving) * 0.28 + ownerRate * 34 + (1 - poverty) * 18 + school * 0.16, 12, 96));
  const rentalUpside = Math.round(clamp(renterRate * 52 + m.localMobility * 0.18 + youngAdult * 0.7 + jobAccessProxy(m.localMobility, m.businessDensity, m.employmentRate) * 0.12, 12, 96));
  const jobMagnet = Math.round(clamp(m.businessDensity * 0.3 + m.whiteCollar * 0.22 + m.remoteWork * 0.18 + m.laborParticipation * 36, 12, 96));
  const familyDemand = Math.round(clamp(m.familyFriendly * 0.45 + youth * 0.9 + school * 0.2, 12, 96));
  const nightEconomy = Math.round(clamp(m.restaurantDensity * 0.28 + m.entertainmentDensity * 0.34 + youngAdult * 0.72 + m.sportsFanIntensity * 0.14, 10, 96));
  const weekdayDemand = Math.round(clamp(jobMagnet * 0.34 + m.localMobility * 0.22 + m.businessDensity * 0.22 + commute * 0.5, 12, 96));
  const weekendDemand = Math.round(clamp(m.eventDemand * 0.36 + tourism * 0.24 + nightEconomy * 0.22 + m.sportsFanIntensity * 0.12, 12, 96));
  const pricePower = Math.round(clamp(m.householdAffluence * 0.34 + disposable * 0.28 + m.investmentScore * 0.18 + (100 - poverty * 100) * 0.12, 12, 96));
  const serviceGap = Math.round(clamp((100 - m.businessDensity) * 0.28 + Math.min(profile.population / 900, 34) + m.localMobility * 0.16 + m.restaurantDensity * 0.08, 12, 96));
  const stability = Math.round(clamp(m.marketResilience * 0.34 + ownerRate * 30 + (1 - vacancy) * 22, 12, 96));
  const churn = Math.round(clamp((1 - ownerRate) * 34 + vacancy * 160 + youngAdult * 0.36 + (100 - stability) * 0.18, 8, 96));
  const climateOutdoor = Math.round(clamp(m.weatherComfort * 0.5 + m.walkability * 0.2 + m.localMobility * 0.18 + (100 - m.weatherRisk) * 0.12, 10, 96));
  const dataCoverage = Math.round(clamp(62 + Number(profile.population > 0) * 6 + Number(profile.medianHouseholdIncome !== null) * 6 + Number(profile.medianHomeValue !== null) * 6 + Number(profile.averageCommuteMinutes !== null) * 6 + Number(profile.raceEthnicity.length > 0) * 8, 48, 96));
  const sportsRetail = Math.round(clamp(m.sportsFanIntensity * 0.26 + m.eventDemand * 0.26 + m.restaurantDensity * 0.18 + weekendDemand * 0.2, 12, 96));
  const compareReadiness = Math.round(clamp(dataCoverage * 0.34 + m.similarZipMatch * 0.32 + m.marketResilience * 0.18 + m.localMobility * 0.1, 12, 96));
  const name = profile.place?.city ?? profile.name.replace(/^ZCTA5\s*/i, "ZIP");

  const score = (value: number) => `${Math.round(clamp(value, 0, 100))}/100`;
  const pct = (value: number) => `${Math.round(clamp(value, 0, 100))}%`;
  const money = (value: number) => formatOptionalCurrency(Math.round(value));
  const band = (value: number, high = "High", mid = "Moderate", low = "Low") => value >= 70 ? high : value >= 45 ? mid : low;

  const catalog: Array<[string, LucideIcon, string, string, string, string, string]> = [
    ["decision-snapshot", Radar, "Decision Snapshot", band((m.investmentScore + m.marketResilience + pricePower) / 3, "Actively scout", "Watch closely", "Niche use"), "Executive read", "Overview", "Fast executive label for whether this ZIP deserves active scouting, monitoring, or niche positioning."],
    ["zip-story", Sparkles, "ZIP Story", `${name} profile`, "Narrative anchor", "Overview", "A short identity tile for reports: place, market feel, and planning context start here."],
    ["market-posture", Gauge, "Market Posture", band(m.neighborhoodMomentum, "Offense", "Balanced", "Defensive"), "Strategy stance", "Overview", "Turns momentum, resilience, and opportunity into a simple planning stance."],
    ["best-use-case", LightbulbIconFallback, "Best Use Case", m.familyFriendly > m.youngProfessional ? "Family / local" : "Talent / growth", "Use-case cue", "Overview", "Suggests the first audience lens to test when exploring the ZIP."],
    ["report-priority", Pin, "Report Priority", score((m.marketResilience + m.investmentScore + dataCoverage) / 3), "Pin-worthiness", "Overview", "Ranks how useful this ZIP is for a clean executive snapshot."],
    ["signal-density", Gauge, "Signal Density", score((m.businessDensity + m.localMobility + dataCoverage) / 3), "How much the ZIP explains", "Overview", "Higher signal density means the dashboard has more interpretable context to work with."],
    ["local-readability", Info, "Local Readability", score((dataCoverage + compareReadiness) / 2), "Data clarity", "Overview", "Shows how cleanly the ZIP can be read from available demographic and modeled signals."],
    ["operator-fit", BriefcaseBusiness, "Operator Fit", score((weekdayDemand + pricePower + m.localMobility) / 3), "Execution fit", "Overview", "Practical score for whether a local operator can understand and serve the market."],
    ["investor-read", Banknote, "Investor Read", score((m.investmentScore + stability + housingLiquidity) / 3), "Investor scan", "Overview", "Combines stability, housing liquidity, and investment attractiveness for investor-style review."],
    ["first-question", Search, "First Question", m.costOfLiving > 62 ? "Can it afford?" : m.eventDemand > 62 ? "When does demand spike?" : "Who is core?", "Analyst prompt", "Overview", "The first question an analyst should ask before comparing this ZIP to another."],

    ["population-weight", Users, "Population Weight", score(clamp(profile.population / 900, 8, 96)), "Market body", "Population", "How much sheer resident scale contributes to demand interpretation."],
    ["household-depth", UsersRound, "Household Depth", score(householdSize * 24), "Residents per unit", "Population", "Larger household depth points toward family, shared, or multi-person demand patterns."],
    ["age-market-fit", Timer, "Age Market Fit", band(100 - Math.abs((profile.medianAge ?? 39) - 40) * 2, "Broad appeal", "Age-specific", "Narrow age fit"), "Age demand lens", "Population", "Reads whether the age profile supports broad offerings or more focused positioning."],
    ["family-base", Baby, "Family Base", pct(familyDemand), "Family demand base", "Population", "Family demand strength from youth share, school signal, and household patterns."],
    ["senior-market-depth", HeartPulse, "Senior Depth", pct(senior), "Estimated older-adult share", "Population", "Useful for healthcare, accessibility, retirement, and service planning."],
    ["young-talent-pool", UserRound, "Young Talent Pool", pct(youngAdult), "Estimated young-adult share", "Population", "Young-adult depth helps read workforce, nightlife, rental, and sports demand."],
    ["daytime-population", Users, "Daytime Pull", score((jobMagnet + weekdayDemand + m.businessDensity) / 3), "Estimated daytime market", "Population", "Estimates whether daytime activity likely exceeds resident-only demand."],
    ["population-friction", ShieldAlert, "Population Friction", score(Math.abs(43 - (profile.medianAge ?? 43)) + poverty * 100 + vacancy * 80), "Demand complication", "Population", "Flags demographic complexity that may make the ZIP harder to serve with one simple offer."],
    ["local-anchor-depth", MapPinned, "Anchor Depth", score((profile.population / 1100) + m.businessDensity * 0.35 + m.eventDemand * 0.16), "Local anchors", "Population", "Checks for resident and activity anchors that can support repeat engagement."],
    ["profile-balance", Scale, "Profile Balance", score(100 - Math.abs(youth - senior) * 1.8 - Math.abs(youngAdult - 24) * 1.2), "Age balance", "Population", "Measures whether the population mix is balanced or skewed toward one life stage."],

    ["income-depth", Banknote, "Income Depth", score(m.householdAffluence), "Spending base", "Income", "A spending-base proxy from income, education, poverty, and ownership."],
    ["price-sensitivity", Scale, "Price Sensitivity", score(100 - pricePower), "Value sensitivity", "Income", "Higher sensitivity suggests offers need clearer value, discounts, or lower-risk entry points."],
    ["premium-potential", Sparkles, "Premium Potential", score(pricePower), "Upside for premium offers", "Income", "Reads whether higher-quality or premium local offerings may have room."],
    ["income-risk-spread", ShieldAlert, "Income Spread Risk", score(poverty * 120 + (100 - m.householdAffluence) * 0.32), "Economic spread", "Income", "Flags where income variation and poverty pressure may complicate positioning."],
    ["consumer-headroom", Banknote, "Consumer Headroom", score(disposable), "Spend flexibility", "Income", "Estimated room for discretionary spending after local cost pressure."],
    ["value-market-fit", Store, "Value Market Fit", score((100 - pricePower) * 0.42 + profile.population / 1800 + m.localMobility * 0.22), "Value offer fit", "Income", "Shows whether a value-forward product or service may fit the ZIP."],
    ["income-housing-tension", Home, "Income/Housing Gap", score(Math.abs((homeValue / Math.max(medianIncome, 1)) - 3.2) * 22 + m.costOfLiving * 0.45), "Cost tension", "Income", "Compares housing cost pressure against income support."],
    ["local-wallet-index", Banknote, "Local Wallet", score((m.householdAffluence + disposable + pricePower) / 3), "Spending power", "Income", "A quick wallet-strength score for local purchasing behavior."],
    ["poverty-pressure", ShieldAlert, "Poverty Pressure", score(poverty * 100), "ACS poverty signal", "Income", "Uses ACS poverty rate as a core affordability and vulnerability input."],
    ["income-confidence", Info, "Income Confidence", profile.medianHouseholdIncome ? "Real anchor" : "Modeled only", "Data source cue", "Income", "Clarifies whether income-driven tiles are anchored by a real Census value."],

    ["housing-liquidity", Home, "Housing Liquidity", score(housingLiquidity), "Market movement", "Housing", "Estimates whether housing conditions look fluid enough for movement and opportunity."],
    ["starter-home-fit", Home, "Starter Home Fit", score(starterHomeFit), "Entry buyer fit", "Housing", "Reads whether the ZIP may work for starter-home or family-home positioning."],
    ["rental-upside", Building2, "Rental Upside", score(rentalUpside), "Rental demand proxy", "Housing", "Renter share, young-adult depth, and mobility blended into a rental upside score."],
    ["owner-stability", Home, "Owner Stability", pct(ownerRate * 100), "ACS owner anchor", "Housing", "Owner-occupied share is a real Census stability anchor where available."],
    ["vacancy-watch", ShieldAlert, "Vacancy Watch", score(vacancy * 100), "ACS vacancy anchor", "Housing", "Vacancy rate can point to slack, churn, or redevelopment questions."],
    ["housing-entry-cost", Banknote, "Entry Cost", money(homeValue), "Home-value anchor", "Housing", "Median home value helps frame affordability and buying pressure."],
    ["rent-vs-own-tilt", Scale, "Rent/Own Tilt", ownerRate > renterRate ? "Owner-led" : "Renter-led", "Housing structure", "Housing", "Quickly labels whether owner or renter behavior should drive interpretation."],
    ["density-feel", Building2, "Density Feel", density > 2200 ? "Compact" : density > 850 ? "Moderate" : "Open", "Estimated density", "Housing", "Translates modeled population density into a simpler lived-environment cue."],
    ["housing-report-card", Gauge, "Housing Card", score((starterHomeFit + housingLiquidity + stability) / 3), "Housing rollup", "Housing", "A compact housing score for deciding which housing tiles to pin."],
    ["rehab-potential", Rocket, "Rehab Potential", score(vacancy * 180 + (100 - m.costOfLiving) * 0.24 + m.growthOpportunity * 0.28), "Reuse/repositioning", "Housing", "Directional signal for renovation, repositioning, or infill research."],

    ["job-magnet", BriefcaseBusiness, "Job Magnet", score(jobMagnet), "Employment pull", "Jobs", "Business density, professional mix, remote readiness, and labor attachment."],
    ["weekday-demand", Clock3, "Weekday Demand", score(weekdayDemand), "Workweek activity", "Jobs", "Useful for lunch, services, errands, clinics, and workday retail."],
    ["service-worker-base", Store, "Service Base", score(100 - m.whiteCollar + m.businessDensity * 0.28), "Service labor proxy", "Jobs", "Directional read on service-sector labor and local service demand."],
    ["professional-depth", BriefcaseBusiness, "Professional Depth", score(m.whiteCollar), "Professional-work proxy", "Jobs", "Education, income, and commute signals rolled into a professional-work read."],
    ["remote-worker-fit", Laptop, "Remote Worker Fit", score(m.remoteWork), "Work-from-home fit", "Jobs", "Broadband, professional mix, and commute pressure estimate remote-work potential."],
    ["labor-attachment", BriefcaseBusiness, "Labor Attachment", pct(m.laborParticipation * 100), "Modeled labor force", "Jobs", "Labor participation proxy for workforce availability."],
    ["commute-tradeoff", Clock3, "Commute Tradeoff", commute > 30 ? "Time cost" : "Manageable", "Work access cue", "Jobs", "Converts commute time into a practical planning label."],
    ["local-hiring-pool", UsersRound, "Hiring Pool", score(profile.population / 1200 + m.laborParticipation * 42 + youngAdult * 0.45), "Talent availability", "Jobs", "Resident scale and workforce attachment blended into a hiring pool read."],
    ["small-business-labor", Store, "Small Biz Labor", score((100 - m.whiteCollar) * 0.24 + m.laborParticipation * 44 + profile.population / 1900), "Local staffing fit", "Jobs", "Useful for small operators thinking about staffing feasibility."],
    ["workforce-risk", ShieldAlert, "Workforce Risk", score(m.unemploymentRate * 260 + (100 - m.laborParticipation * 100) * 0.42 + poverty * 65), "Labor pressure", "Jobs", "Flags where workforce participation, poverty, or unemployment may add friction."],

    ["education-anchor", GraduationCap, "Education Anchor", pct(highSchool * 100), "ACS education anchor", "Education", "High-school graduation rate is a real education baseline where available."],
    ["college-depth", GraduationCap, "College Depth", pct(bachelors * 100), "ACS college anchor", "Education", "College attainment helps explain professional work, income, and remote-work fit."],
    ["skills-pipeline", School, "Skills Pipeline", score(highSchool * 34 + bachelors * 42 + youngAdult * 0.5), "Workforce pipeline", "Education", "Combines education attainment and young-adult depth for talent pipeline planning."],
    ["family-school-fit", School, "Family/School Fit", score((school + familyDemand) / 2), "Family education lens", "Education", "Shows whether family demand and school indicators align."],
    ["upskilling-opportunity", Rocket, "Upskilling Need", score((100 - bachelors * 100) * 0.38 + m.businessDensity * 0.18 + jobMagnet * 0.18), "Training demand", "Education", "Directional signal for workforce training, adult learning, or certification demand."],
    ["student-service-fit", Store, "Student Services", score(youth * 1.2 + youngAdult * 0.8 + m.localMobility * 0.18), "Student-serving demand", "Education", "Student and young-adult mix for tutoring, food, transit, and activity planning."],
    ["knowledge-economy-fit", Laptop, "Knowledge Fit", score(bachelors * 54 + m.remoteWork * 0.26 + m.whiteCollar * 0.2), "Knowledge-work fit", "Education", "Education plus work-mode readiness for knowledge economy signals."],
    ["education-gap", ShieldAlert, "Education Gap", score((1 - highSchool) * 80 + Math.max(0, 0.3 - bachelors) * 120), "Education friction", "Education", "Flags where educational attainment may limit workforce or income upside."],
    ["school-age-demand", Baby, "School-Age Demand", pct(youth), "Youth share proxy", "Education", "Estimates the share of population likely to create school-age demand."],
    ["education-report-score", Gauge, "Education Card", score(school), "Education rollup", "Education", "One score to decide whether education should be pinned in the report."],

    ["drive-market", Car, "Drive Market", score(m.vehicleOwnership), "Car-dependence signal", "Transportation", "Shows how much the ZIP likely depends on car access."],
    ["last-mile-fit", Navigation, "Last-Mile Fit", score((m.walkability + m.localMobility + m.transitAccess) / 3), "Delivery/access fit", "Transportation", "Useful for delivery, service routes, and customer access planning."],
    ["route-efficiency", Navigation, "Route Efficiency", score((100 - commute * 1.8) + m.localMobility * 0.42), "Travel efficiency", "Transportation", "Estimates whether movement through the ZIP should feel efficient."],
    ["transit-dependence", Train, "Transit Dependence", score((100 - m.vehicleOwnership) * 0.46 + m.transitAccess * 0.42), "Transit need", "Transportation", "Shows whether transit or non-car access may matter more than averages imply."],
    ["walk-in-potential", Navigation, "Walk-In Potential", score(m.walkability * 0.58 + m.businessDensity * 0.24 + density / 160), "Foot traffic proxy", "Transportation", "Walkability and density translated into walk-in customer potential."],
    ["commuter-retail-fit", Store, "Commuter Retail", score(commuterFit(m.localMobility, commute, m.businessDensity)), "Errand-stop fit", "Transportation", "Reads whether commuter flow may support quick-stop retail and services."],
    ["mobility-bottleneck", ShieldAlert, "Mobility Bottleneck", score((100 - m.localMobility) * 0.52 + commute * 1.1), "Access friction", "Transportation", "Higher values mean transportation friction deserves attention."],
    ["delivery-radius-fit", Navigation, "Delivery Radius", score(m.localMobility * 0.42 + m.vehicleOwnership * 0.2 + density / 110), "Delivery feasibility", "Transportation", "A practical score for route, delivery, and service coverage planning."],
    ["high-frequency-access", Timer, "Frequent Access", score(m.walkability * 0.28 + m.transitAccess * 0.24 + m.businessDensity * 0.24 + m.localMobility * 0.16), "Repeat-trip support", "Transportation", "Checks whether residents can make frequent short trips easily."],
    ["transport-report-score", Gauge, "Mobility Card", score(m.localMobility), "Mobility rollup", "Transportation", "One score to decide whether transportation deserves report space."],

    ["daily-needs-fit", Store, "Daily Needs Fit", score((m.businessDensity + healthcare + m.localMobility + familyDemand) / 4), "Everyday services", "Lifestyle", "Groceries, clinics, errands, and local services need a strong daily-needs base."],
    ["healthcare-demand", HeartPulse, "Healthcare Demand", score(healthcare * 0.38 + senior * 1.1 + poverty * 50), "Care/service demand", "Lifestyle", "Combines senior share, access, and vulnerability into healthcare demand."],
    ["restaurant-fit", Store, "Restaurant Fit", score(m.restaurantDensity * 0.45 + nightEconomy * 0.28 + weekendDemand * 0.18), "Dining market", "Lifestyle", "Dining-market score from restaurant signal, nightlife, and weekend demand."],
    ["family-weekend-fit", Baby, "Family Weekend", score(familyDemand * 0.42 + m.weatherComfort * 0.18 + m.localMobility * 0.18 + m.restaurantDensity * 0.12), "Family activity fit", "Lifestyle", "Weekend family activity potential from household, comfort, and service access."],
    ["young-pro-lifestyle", UserRound, "Young Pro Life", score(m.youngProfessional), "Young professional fit", "Lifestyle", "Young professional score for rentals, dining, coworking, and local energy."],
    ["retiree-lifestyle", HeartPulse, "Retiree Life", score(m.retirementComfort), "Retirement fit", "Lifestyle", "Retirement comfort for calm services, healthcare, and accessibility."],
    ["broadband-readiness", Wifi, "Broadband Ready", score(m.broadband), "Digital access", "Lifestyle", "Digital access score for remote work, streaming, online services, and education."],
    ["device-market", Smartphone, "Device Market", score(buildDeviceAccess(profile)), "Device access proxy", "Lifestyle", "Smartphone/device access affects app adoption, online ordering, and digital marketing."],
    ["outdoor-comfort", CloudSun, "Outdoor Comfort", score(climateOutdoor), "Outdoor activity fit", "Lifestyle", "Weather comfort, walkability, and local mobility for outdoor-oriented demand."],
    ["convenience-gap", Store, "Convenience Gap", score(100 - ((m.businessDensity + m.localMobility + healthcare) / 3)), "Missing-services cue", "Lifestyle", "Higher values suggest everyday convenience may be underserved."],

    ["civic-anchor", Vote, "Civic Anchor", score(civic), "Civic participation proxy", "Civic", "Education, age, and ownership create a civic participation signal."],
    ["community-trust", ShieldAlert, "Community Trust", score((stability + civic + ownerRate * 100) / 3), "Trust/stability proxy", "Civic", "Useful for outreach, partnerships, and community-led initiatives."],
    ["language-outreach", Languages, "Language Outreach", score(m.languageDiversity), "Language diversity", "Civic", "Higher values suggest multilingual or culturally nuanced outreach may matter."],
    ["newcomer-signal", MapPinned, "Newcomer Signal", score(m.foreignBorn * 180 + youngAdult * 0.5 + churn * 0.22), "Migration/newcomer proxy", "Civic", "Directional signal for newcomer services, onboarding, and localized messaging."],
    ["stability-vs-change", Scale, "Stable/Changing", stability > churn ? "Stable" : "Changing", "Community state", "Civic", "Simple contrast between household stability and churn pressure."],
    ["local-partner-fit", Store, "Partner Fit", score(civic * 0.3 + m.businessDensity * 0.28 + stability * 0.22), "Local partnership score", "Civic", "Indicates whether local organizations and businesses may be strong partners."],
    ["outreach-complexity", ShieldAlert, "Outreach Complexity", score(m.languageDiversity * 0.34 + churn * 0.28 + poverty * 80), "Messaging complexity", "Civic", "Flags when one-size-fits-all messaging may underperform."],
    ["community-retention", Home, "Retention Signal", score(stability), "Stay-put strength", "Civic", "Ownership, occupancy, and resilience indicate how rooted residents may be."],
    ["volunteer-market", Vote, "Volunteer Market", score(civic * 0.48 + senior * 0.7 + familyDemand * 0.14), "Volunteer/civic depth", "Civic", "Civic and life-stage mix for volunteer, school, and community programs."],
    ["public-services-pressure", ShieldAlert, "Services Pressure", score(poverty * 100 + senior * 0.8 + youth * 0.6 + (100 - healthcare) * 0.22), "Service demand", "Civic", "Directional pressure on public, nonprofit, and care-oriented services."],

    ["risk-priority", ShieldAlert, "Risk Priority", score((m.weatherRisk + m.costOfLiving + (100 - m.marketResilience)) / 3), "Top risk rollup", "Risk", "One risk score for deciding whether to pin the risk section."],
    ["affordability-stress", Scale, "Affordability Stress", score(m.costOfLiving * 0.56 + poverty * 100 * 0.28 + (100 - disposable) * 0.16), "Cost stress", "Risk", "Cost, poverty, and disposable-income pressure."],
    ["weather-exposure", Umbrella, "Weather Exposure", score(m.weatherRisk), "Weather risk", "Risk", "Regional weather-risk proxy; useful for operations and insurance-style thinking."],
    ["churn-risk", ShieldAlert, "Churn Risk", score(churn), "Household movement risk", "Risk", "Vacancy, renter share, and young-adult mix translated into churn risk."],
    ["demand-fragility", ShieldAlert, "Demand Fragility", score((100 - pricePower) * 0.3 + poverty * 100 * 0.34 + (100 - m.marketResilience) * 0.24), "Spending fragility", "Risk", "Flags where demand may be more sensitive to price, shocks, or weak resilience."],
    ["access-risk", Train, "Access Risk", score((100 - m.localMobility) * 0.54 + (100 - m.transitAccess) * 0.18 + commute * 0.8), "Mobility risk", "Risk", "Transportation access pressure for residents, workers, and customers."],
    ["housing-shock-risk", Home, "Housing Shock", score(m.costOfLiving * 0.42 + vacancy * 150 + Math.abs(homeValue / Math.max(medianIncome, 1) - 3.2) * 16), "Housing risk", "Risk", "Housing cost and vacancy conditions that could create local volatility."],
    ["workforce-friction", BriefcaseBusiness, "Workforce Friction", score((100 - jobMagnet) * 0.42 + m.unemploymentRate * 220 + commute * 0.72), "Staffing risk", "Risk", "Flags possible hiring, commute, or workforce attachment issues."],
    ["service-desert-risk", Store, "Service Desert", score((100 - m.businessDensity) * 0.34 + (100 - healthcare) * 0.24 + (100 - m.localMobility) * 0.22), "Access/services risk", "Risk", "Higher values suggest gaps in services or access."],
    ["report-risk-note", Info, "Risk Note", band((m.weatherRisk + m.costOfLiving) / 2, "Explain risk", "Mention risk", "Low emphasis"), "Report guidance", "Risk", "Tells you how prominently risk should appear in an export."],

    ["market-entry-score", Rocket, "Market Entry", score((pricePower + serviceGap + m.localMobility + dataCoverage) / 4), "Entry attractiveness", "Opportunity", "Practical go/no-go signal for entering this ZIP with a local offer."],
    ["underserved-demand", Store, "Underserved Demand", score(serviceGap), "Service gap", "Opportunity", "Resident scale and lower service density can reveal underserved demand."],
    ["premium-service-upside", Sparkles, "Premium Upside", score(pricePower), "Premium service fit", "Opportunity", "Spending power and resilience for premium services."],
    ["family-business-fit", Baby, "Family Business", score(familyDemand * 0.44 + serviceGap * 0.22 + m.localMobility * 0.18), "Family-serving offer", "Opportunity", "Useful for childcare, youth sports, tutoring, family dining, and local services."],
    ["healthcare-opportunity", HeartPulse, "Healthcare Upside", score(healthcare * 0.34 + senior * 1.0 + serviceGap * 0.2), "Care opportunity", "Opportunity", "Healthcare and care-adjacent opportunity from senior demand and service gaps."],
    ["restaurant-white-space", Store, "Dining White Space", score(restaurantWhiteSpace(m.restaurantDensity, nightEconomy, weekendDemand)), "Dining opportunity", "Opportunity", "Finds places where demand appears stronger than current dining signal."],
    ["sports-commerce-fit", Trophy, "Sports Commerce", score(sportsRetail), "Sports-led commerce", "Opportunity", "Sports, events, dining, and weekend demand combined for commerce planning."],
    ["real-estate-scout", Home, "RE Scout", score((housingLiquidity + starterHomeFit + m.investmentScore) / 3), "Real estate scouting", "Opportunity", "A real-estate scouting score from housing movement, entry fit, and investment signal."],
    ["event-pop-up-fit", Trophy, "Pop-Up Fit", score(weekendDemand * 0.36 + m.localMobility * 0.22 + m.restaurantDensity * 0.16 + tourism * 0.16), "Temporary event fit", "Opportunity", "Shows whether pop-ups, mobile vendors, or event activations may work."],
    ["expansion-priority", Rocket, "Expansion Priority", score((m.growthOpportunity + m.investmentScore + serviceGap + dataCoverage) / 4), "Expansion score", "Opportunity", "A compact expansion-priority score for comparing ZIPs later."],

    ["sports-weekend-lift", Trophy, "Weekend Lift", score(weekendDemand), "Sports/weekend demand", "Sports", "Estimates weekend activity lift from events, tourism, and entertainment."],
    ["sports-family-fit", Baby, "Youth Sports Fit", score(familyDemand * 0.36 + youth * 1.1 + m.localMobility * 0.18), "Youth sports market", "Sports", "Family and youth depth for youth sports, camps, clinics, and leagues."],
    ["sports-bar-fit", Store, "Sports Bar Fit", score(nightEconomy * 0.42 + m.sportsFanIntensity * 0.24 + m.restaurantDensity * 0.18), "Sports viewing market", "Sports", "Sports fan intensity and nightlife context for sports-viewing venues."],
    ["game-day-route-fit", Navigation, "Game-Day Routes", score(m.localMobility * 0.36 + m.vehicleOwnership * 0.18 + m.eventDemand * 0.26), "Event movement", "Sports", "Mobility and event demand for game-day travel behavior."],
    ["away-fan-potential", MapPinned, "Away Fan Pull", score(tourism * 0.38 + m.eventDemand * 0.28 + highwayProxy(commute, m.vehicleOwnership) * 0.2), "Visitor/event pull", "Sports", "Directional read on visitor and away-fan activity."],
    ["sports-retail-fit", Store, "Sports Retail", score(sportsRetail), "Merch/retail fit", "Sports", "Sports energy and retail context for sports-related commerce."],
    ["public-odds-relevance", Trophy, "Odds Relevance", score(m.sportsFanIntensity * 0.52 + youngAdult * 0.72 + m.broadband * 0.12), "Public odds interest proxy", "Sports", "Preview signal for where public odds intelligence may be more relevant."],
    ["event-parking-pressure", Car, "Parking Pressure", score(m.eventDemand * 0.34 + m.vehicleOwnership * 0.26 + (100 - m.transitAccess) * 0.22), "Game-day friction", "Sports", "Flags event markets where parking and car access may matter."],
    ["sports-sponsor-fit", Sparkles, "Sponsor Fit", score(pricePower * 0.28 + m.sportsFanIntensity * 0.28 + m.businessDensity * 0.22), "Sponsorship market", "Sports", "Sports energy plus business and spending signals for sponsorship scouting."],
    ["sports-report-score", Gauge, "Sports Card", score((m.sportsFanIntensity + m.eventDemand + sportsRetail) / 3), "Sports rollup", "Sports", "One score to decide whether sports intelligence should be pinned."],

    ["compare-income-peer", Banknote, "Income Peer", medianIncome > 80000 ? "Trade down" : "Trade up", "Comparison idea", "Beta Insights", "Suggests whether to compare against higher-income or value-market peers."],
    ["compare-housing-peer", Home, "Housing Peer", ownerRate > 0.62 ? "Owner peer" : "Rental peer", "Comparison idea", "Beta Insights", "Suggests the housing profile to use when comparing ZIPs."],
    ["compare-sports-peer", Trophy, "Sports Peer Type", m.eventDemand > 62 ? "Event peer" : "Fan-base peer", "Comparison idea", "Beta Insights", "Suggests which sports-market peer lens to use first."],
    ["compare-growth-peer", Rocket, "Growth Peer Type", m.growthOpportunity > 62 ? "Momentum peer" : "Stability peer", "Comparison idea", "Beta Insights", "Suggests whether to compare on growth or stability first."],
    ["ai-pin-priority", Pin, "AI Pin Priority", score((dataCoverage + m.investmentScore + m.eventDemand + m.marketResilience) / 4), "Pin recommendation", "Beta Insights", "Helps decide whether this tile set is report-ready."],
    ["ai-summary-angle", Sparkles, "Summary Angle", m.costOfLiving > m.eventDemand ? "Affordability" : m.eventDemand > m.marketResilience ? "Event demand" : "Stability", "AI summary cue", "Beta Insights", "The strongest narrative angle for a short AI-style ZIP summary."],
    ["ai-risk-angle", ShieldAlert, "Risk Angle", m.costOfLiving > m.weatherRisk ? "Cost" : m.weatherRisk > 58 ? "Weather" : "Access", "AI risk cue", "Beta Insights", "Names the risk topic to explain first."],
    ["ai-opportunity-angle", LightbulbIconFallback, "Opportunity Angle", serviceGap > pricePower ? "Service gap" : sportsRetail > 62 ? "Sports commerce" : "Local spending", "AI opportunity cue", "Beta Insights", "Names the opportunity topic to explain first."],
    ["confidence-stack", ShieldAlert, "Confidence Stack", score(dataCoverage), "Source coverage", "Beta Insights", "How much the dashboard is anchored by populated source fields."],
    ["next-best-action", Rocket, "Next Action", m.investmentScore > 64 ? "Compare peers" : "Pin basics", "Workflow cue", "Beta Insights", "Suggested next step for the user inside ZipScope."],
  ];

  return catalog.map(([id, icon, label, value, detail, category, insight]) => quickTile(id, icon, label, value, detail, category, insight));
}

function commuterFit(localMobility: number, commute: number, businessDensity: number) {
  return clamp(localMobility * 0.38 + businessDensity * 0.24 + Math.max(0, 40 - commute) * 0.9, 8, 96);
}

function jobAccessProxy(localMobility: number, businessDensity: number, employmentRate: number) {
  return clamp(localMobility * 0.36 + businessDensity * 0.28 + employmentRate * 36, 8, 96);
}

function highwayProxy(commute: number, vehicleOwnership: number) {
  return clamp(vehicleOwnership * 0.42 + Math.max(0, 38 - commute) * 1.1, 8, 96);
}

function restaurantWhiteSpace(restaurantDensity: number, nightEconomy: number, weekendDemand: number) {
  return clamp((100 - restaurantDensity) * 0.32 + nightEconomy * 0.34 + weekendDemand * 0.26, 8, 96);
}

function quickTile(id: string, icon: LucideIcon, label: string, value: string, detail: string, category: string, insight: string): DemographicTile {
  return {
    id,
    icon,
    label,
    value,
    detail,
    category,
    insightTitle: `${label} scan`,
    insight,
  };
}

function classifyCommunityType(profile: DemographicProfile) {
  const density = buildModeledPopulationDensity(profile) ?? 900;
  if (density > 3200 || profile.population > 70000) return "Urban";
  if (density < 650 && profile.population < 26000) return "Rural";
  if ((profile.ownerOccupiedRate ?? 0.58) > 0.68) return "Residential";
  return "Suburban";
}

function buildAgeDistribution(profile: DemographicProfile) {
  const medianAge = profile.medianAge ?? 39;
  if (medianAge < 34) return "Younger";
  if (medianAge > 52) return "Older";
  if (medianAge > 42) return "Established";
  return "Balanced";
}

function buildYouthShare(profile: DemographicProfile) {
  const householdSize = buildModeledHouseholdSize(profile);
  return Math.round(clamp(17 + (householdSize - 2.1) * 9 + (profile.medianAge && profile.medianAge < 38 ? 4 : -1), 10, 32));
}

function buildYoungAdultShare(profile: DemographicProfile) {
  const age = profile.medianAge ?? 39;
  return Math.round(clamp(30 - Math.max(0, age - 32) * 0.55 + (profile.bachelorsOrHigherRate ?? 0.26) * 10 + buildEntertainmentDensityBase(profile) * 0.04, 11, 38));
}

function buildSeniorShare(profile: DemographicProfile) {
  const age = profile.medianAge ?? 39;
  return Math.round(clamp(9 + Math.max(0, age - 38) * 0.9 + buildRetirementComfort(profile) * 0.04, 8, 34));
}

function buildUpperIncomeShare(profile: DemographicProfile) {
  return Math.round(clamp(((profile.medianHouseholdIncome ?? 56000) - 52000) / 1800 + (profile.bachelorsOrHigherRate ?? 0.26) * 24 - (profile.povertyRate ?? 0.12) * 18, 5, 44));
}

function buildMiddleIncomeShare(profile: DemographicProfile) {
  return Math.round(clamp(48 + (profile.ownerOccupiedRate ?? 0.58) * 14 - Math.abs((profile.medianHouseholdIncome ?? 56000) - 72000) / 5200 - (profile.povertyRate ?? 0.12) * 22, 24, 68));
}

function buildWorkingClassShare(profile: DemographicProfile) {
  return Math.round(clamp(58 - buildUpperIncomeShare(profile) * 0.55 + (profile.povertyRate ?? 0.12) * 32 - (profile.bachelorsOrHigherRate ?? 0.26) * 18, 18, 74));
}

function enrichTile(tile: DemographicTile): DemographicTile {
  const categoryById: Record<string, string> = {
    population: "Population",
    "median-age": "Population",
    female: "Population",
    male: "Population",
    "household-size": "Population",
    "family-households": "Lifestyle",
    "single-households": "Lifestyle",
    "married-households": "Lifestyle",
    "single-parent-households": "Lifestyle",
    "median-income": "Income",
    "per-capita-income": "Income",
    "poverty-rate": "Income",
    "cost-of-living": "Cost of Living",
    "income-distribution": "Income",
    "income-resident": "Income",
    "housing-units": "Housing",
    "home-value": "Housing",
    "median-rent": "Housing",
    "rent-burden": "Housing",
    "housing-affordability": "Housing",
    "owner-occupied": "Housing",
    vacancy: "Housing",
    "occupied-units": "Housing",
    "renter-occupied": "Housing",
    "home-income": "Housing",
    "apartment-mix": "Housing",
    "single-family-mix": "Housing",
    "housing-density": "Housing",
    "high-school": "Education",
    bachelors: "Education",
    "literacy-rate": "Education",
    "graduate-degree": "Education",
    "school-quality": "Education",
    "employment-rate": "Jobs",
    "unemployment-rate": "Jobs",
    "labor-participation": "Jobs",
    "job-sectors": "Jobs",
    "white-collar": "Jobs",
    "remote-work": "Jobs",
    commute: "Transportation",
    "vehicle-ownership": "Transportation",
    "transit-access": "Transportation",
    walkability: "Transportation",
    "population-density": "Population",
    "healthcare-access": "Lifestyle",
    broadband: "Technology",
    "device-access": "Technology",
    "language-diversity": "Lifestyle",
    "foreign-born": "Lifestyle",
    "migration-trend": "Growth",
    "business-density": "Growth",
    "restaurant-density": "Lifestyle",
    "entertainment-density": "Lifestyle",
    "sports-fan-intensity": "Sports",
    "event-demand": "Sports",
    "tourism-traffic": "Sports",
    "civic-participation": "Civic",
    "weather-comfort": "Lifestyle",
    "weather-risk": "Risk",
    "growth-opportunity": "Growth",
    "similar-match": "Beta Insights",
    "investment-score": "Growth",
    "family-friendly": "Lifestyle",
    "young-professional": "Lifestyle",
    "retirement-comfort": "Lifestyle",
    "local-mobility": "Transportation",
    "neighborhood-momentum": "Growth",
    "affluence-index": "Income",
    "resilience-score": "Growth",
    "top-group": "Population",
    "source-year": "Beta",
    "crime-rate": "Risk",
  };
  const sourcedIds = new Set(["population", "median-age", "female", "male", "median-income", "poverty-rate", "high-school", "bachelors", "housing-units", "home-value", "owner-occupied", "vacancy", "commute", "source-year", "top-group"]);
  const betaIds = new Set(["similar-match", "weather-risk", "weather-comfort", "tourism-traffic", "migration-trend", "job-sectors"]);
  const percentile = parsePercentile(tile.value);

  const category = normalizeTileCategory(tile.id, tile.category ?? categoryById[tile.id] ?? "Beta");

  return {
    ...tile,
    category,
    status: sourcedIds.has(tile.id) ? "Real data" : betaIds.has(tile.id) ? "Beta" : "Estimated",
    confidence: sourcedIds.has(tile.id) ? "High confidence" : betaIds.has(tile.id) ? "Preview" : "Modeled",
    trend: percentile >= 72 ? "Opportunity" : percentile <= 34 ? "Watch" : "Balanced",
    percentile,
  };
}

function normalizeTileCategory(id: string, category: string) {
  if (category === "Beta Insights") return "Beta";
  if (category === "Safety") return "Risk";
  if (["cost-of-living", "cost-pressure-score", "affordability-pressure", "housing-pressure", "rent-burden-risk", "cost-living-risk", "transit-weakness", "commute-risk", "economic-vulnerability", "ai-risk"].includes(id)) return "Risk";
  if (id.includes("opportunity") || ["investment-score", "event-business-opportunity", "ai-opportunity"].includes(id)) return "Opportunity";
  if (["zip-profile-score", "zip-identity", "community-type", "area-comparison"].includes(id)) return "Overview";
  return category;
}

function parsePercentile(value: string) {
  const numeric = Number(value.replace(/[^0-9.-]/g, ""));
  if (!Number.isFinite(numeric)) return 58;
  if (value.includes("/100")) return clamp(Math.round(numeric), 0, 100);
  if (value.includes("%")) return clamp(Math.round(numeric), 0, 100);
  if (value.includes("$")) return clamp(Math.round(numeric / 1500), 12, 96);
  if (value.includes("x")) return clamp(100 - Math.round(numeric * 13), 8, 92);
  return clamp(Math.round(numeric), 8, 96);
}

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function RaceCompositionPanel({ raceEthnicity }: { raceEthnicity: Array<{ label: string; value: number }> }) {
  const measuredGroups = [...raceEthnicity]
    .filter((group) => group.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const measuredTotal = measuredGroups.reduce((sum, group) => sum + group.value, 0);
  const remainder = Math.max(0, 100 - measuredTotal);
  const groups = remainder >= 0.1
    ? [...measuredGroups, { label: "All other / not shown", value: remainder }]
    : measuredGroups;
  const topThree = groups.slice(0, 3);
  const donutSegments = buildDonutSegments(groups);

  return (
    <section className="race-widget" aria-label="Race and ethnicity composition">
      <div className="race-widget-header">
        <div>
          <span className="mono-label">Race / Ethnicity Widget</span>
          <h3>ACS composition breakdown</h3>
        </div>
        <small>Percentages are Census ACS ZCTA estimates.</small>
      </div>
      <div className="race-widget-grid">
        <div className="race-donut-wrap">
          <div className="race-donut" style={{ background: groups.length ? `conic-gradient(${donutSegments})` : undefined }}>
            <div>
              <strong>{topThree[0]?.value.toFixed(0) ?? "--"}%</strong>
              <span>{topThree[0]?.label ?? "No data"}</span>
            </div>
          </div>
        </div>
        <div className="race-ratio-grid">
          {groups.length ? groups.map((group, index) => (
            <div className="race-ratio-row" key={group.label}>
              <span><em style={{ background: raceColors[index % raceColors.length] }} />{group.label}</span>
              <div><i style={{ width: `${Math.min(group.value, 100)}%`, background: raceColors[index % raceColors.length] }} /></div>
              <strong>{group.value.toFixed(1)}%</strong>
            </div>
          )) : <p>Race/ethnicity estimates unavailable for this ZIP/ZCTA.</p>}
        </div>
      </div>
    </section>
  );
}

function formatOptionalMinutes(value: number | null) {
  return value === null ? "-" : `${value.toFixed(1)} min`;
}

function buildModeledCrimeRate(profile: DemographicProfile) {
  const poverty = profile.povertyRate ?? 0.12;
  const vacancy = profile.vacancyRate ?? 0.08;
  const incomeStress = Math.max(0, (65000 - (profile.medianHouseholdIncome ?? 65000)) / 65000);
  const educationGap = Math.max(0, 0.32 - (profile.bachelorsOrHigherRate ?? 0.32));
  const modeledRate = 0.028 + poverty * 0.1 + vacancy * 0.06 + incomeStress * 0.035 + educationGap * 0.08;

  return Math.min(0.18, Math.max(0.012, modeledRate));
}

function buildOccupiedUnits(profile: DemographicProfile) {
  if (profile.housingUnits === null || profile.vacancyRate === null) return null;
  return Math.round(profile.housingUnits * (1 - profile.vacancyRate));
}

function buildRenterOccupiedRate(profile: DemographicProfile) {
  return profile.ownerOccupiedRate === null ? null : Math.max(0, 1 - profile.ownerOccupiedRate);
}

function buildModeledLiteracyRate(profile: DemographicProfile) {
  if (profile.highSchoolGradRate === null && profile.bachelorsOrHigherRate === null) return null;
  const highSchool = profile.highSchoolGradRate ?? 0.84;
  const bachelors = profile.bachelorsOrHigherRate ?? 0.26;
  return Math.min(0.995, Math.max(0.72, highSchool * 0.86 + bachelors * 0.12 + 0.035));
}

function buildModeledPopulationDensity(profile: DemographicProfile) {
  if (!profile.population || profile.housingUnits === null) return null;
  const housingIntensity = profile.housingUnits / Math.max(profile.population, 1);
  const impliedArea = Math.max(2.4, Math.min(85, profile.housingUnits / (180 + housingIntensity * 420)));
  return Math.round(profile.population / impliedArea);
}

function buildHouseholdAffluenceIndex(profile: DemographicProfile) {
  const income = Math.min((profile.medianHouseholdIncome ?? 52000) / 125000, 1) * 38;
  const ownership = (profile.ownerOccupiedRate ?? 0.58) * 22;
  const education = (profile.bachelorsOrHigherRate ?? 0.24) * 25;
  const povertyShield = (1 - (profile.povertyRate ?? 0.14)) * 15;
  return Math.round(Math.max(0, Math.min(100, income + ownership + education + povertyShield)));
}

function buildMarketResilienceScore(profile: DemographicProfile) {
  const income = Math.min((profile.medianHouseholdIncome ?? 56000) / 95000, 1) * 24;
  const education = (profile.highSchoolGradRate ?? 0.86) * 18 + (profile.bachelorsOrHigherRate ?? 0.24) * 18;
  const occupancy = (1 - (profile.vacancyRate ?? 0.08)) * 16;
  const poverty = (1 - (profile.povertyRate ?? 0.14)) * 16;
  const commute = Math.max(0, 1 - Math.max(0, (profile.averageCommuteMinutes ?? 24) - 18) / 38) * 8;
  return Math.round(Math.max(0, Math.min(100, income + education + occupancy + poverty + commute)));
}

function buildModeledHouseholdSize(profile: DemographicProfile) {
  if (profile.housingUnits === null || profile.vacancyRate === null) return 2.4;
  const occupied = Math.max(1, profile.housingUnits * (1 - profile.vacancyRate));
  return clamp(profile.population / occupied, 1.1, 4.8);
}

function buildModeledFamilyHouseholds(profile: DemographicProfile) {
  const householdSize = buildModeledHouseholdSize(profile);
  const value = 0.32 + (householdSize - 2.1) * 0.18 + (profile.ownerOccupiedRate ?? 0.58) * 0.2 - (profile.povertyRate ?? 0.12) * 0.1;
  return clamp(value, 0.18, 0.78);
}

function buildModeledSingleHouseholds(profile: DemographicProfile) {
  const householdSize = buildModeledHouseholdSize(profile);
  const value = 0.42 - (householdSize - 2.1) * 0.16 + (1 - (profile.ownerOccupiedRate ?? 0.58)) * 0.14 + ((profile.medianAge ?? 38) > 58 ? 0.05 : 0);
  return clamp(value, 0.12, 0.62);
}

function buildModeledMarriedHouseholds(profile: DemographicProfile) {
  const value = 0.28 + (profile.ownerOccupiedRate ?? 0.58) * 0.24 + Math.max(0, ((profile.medianAge ?? 38) - 31) / 100) - (profile.povertyRate ?? 0.12) * 0.12;
  return clamp(value, 0.16, 0.72);
}

function buildModeledSingleParentHouseholds(profile: DemographicProfile) {
  const value = 0.08 + (profile.povertyRate ?? 0.12) * 0.45 + (1 - (profile.ownerOccupiedRate ?? 0.58)) * 0.08;
  return clamp(value, 0.04, 0.34);
}

function buildModeledPerCapitaIncome(profile: DemographicProfile) {
  if (!profile.medianHouseholdIncome) return null;
  return Math.round(profile.medianHouseholdIncome / buildModeledHouseholdSize(profile));
}

function buildModeledMedianRent(profile: DemographicProfile) {
  if (!profile.medianHomeValue && !profile.medianHouseholdIncome) return null;
  const homeRent = profile.medianHomeValue ? profile.medianHomeValue * 0.0048 : null;
  const incomeRent = profile.medianHouseholdIncome ? profile.medianHouseholdIncome * 0.024 : null;
  return Math.round(((homeRent ?? incomeRent ?? 0) + (incomeRent ?? homeRent ?? 0)) / 2);
}

function buildRentBurden(profile: DemographicProfile) {
  const rent = buildModeledMedianRent(profile);
  if (!rent || !profile.medianHouseholdIncome) return null;
  const monthlyIncome = profile.medianHouseholdIncome / 12;
  return clamp(rent / Math.max(monthlyIncome, 1) + (profile.povertyRate ?? 0.12) * 0.28, 0.12, 0.58);
}

function buildCostOfLivingIndex(profile: DemographicProfile) {
  const ratio = profile.medianHomeValue && profile.medianHouseholdIncome ? profile.medianHomeValue / profile.medianHouseholdIncome : 3.2;
  const rentBurden = buildRentBurden(profile) ?? 0.3;
  return Math.round(clamp(ratio * 12 + rentBurden * 65 + (profile.povertyRate ?? 0.12) * 32 + ((profile.averageCommuteMinutes ?? 24) / 40) * 12, 18, 96));
}

function buildApartmentMix(profile: DemographicProfile) {
  const renter = buildRenterOccupiedRate(profile) ?? 0.38;
  const density = buildModeledPopulationDensity(profile) ?? 900;
  return clamp(renter * 0.62 + Math.min(density / 6000, 1) * 0.28 + (profile.vacancyRate ?? 0.08) * 0.4, 0.08, 0.86);
}

function buildEmploymentRate(profile: DemographicProfile) {
  return clamp(0.88 + (profile.bachelorsOrHigherRate ?? 0.26) * 0.08 - (profile.povertyRate ?? 0.12) * 0.22 + Math.min((profile.medianHouseholdIncome ?? 56000) / 180000, 0.08), 0.72, 0.97);
}

function buildUnemploymentRate(profile: DemographicProfile) {
  return clamp(1 - buildEmploymentRate(profile), 0.025, 0.18);
}

function buildLaborParticipation(profile: DemographicProfile) {
  return clamp(0.58 + (profile.bachelorsOrHigherRate ?? 0.26) * 0.18 - Math.max(0, ((profile.medianAge ?? 39) - 52) / 100) - (profile.povertyRate ?? 0.12) * 0.08, 0.42, 0.78);
}

function buildWhiteCollarScore(profile: DemographicProfile) {
  return Math.round(clamp((profile.bachelorsOrHigherRate ?? 0.26) * 72 + Math.min((profile.medianHouseholdIncome ?? 56000) / 160000, 1) * 24 + Math.max(0, 32 - (profile.averageCommuteMinutes ?? 24)) * 0.6, 12, 96));
}

function buildRemoteWorkPotential(profile: DemographicProfile) {
  return Math.round(clamp(buildWhiteCollarScore(profile) * 0.48 + buildBroadbandAccess(profile) * 0.34 + Math.min((profile.averageCommuteMinutes ?? 24) / 45, 1) * 18, 18, 94));
}

function buildVehicleOwnership(profile: DemographicProfile) {
  const density = buildModeledPopulationDensity(profile) ?? 900;
  return Math.round(clamp(78 + (profile.medianHouseholdIncome ?? 56000) / 6500 - density / 180 - buildTransitAccess(profile) * 0.18, 32, 98));
}

function buildTransitAccess(profile: DemographicProfile) {
  const density = buildModeledPopulationDensity(profile) ?? 900;
  return Math.round(clamp(density / 70 + (1 - (profile.ownerOccupiedRate ?? 0.58)) * 26 + Math.max(0, 32 - (profile.averageCommuteMinutes ?? 24)) * 0.7, 8, 92));
}

function buildWalkability(profile: DemographicProfile) {
  const density = buildModeledPopulationDensity(profile) ?? 900;
  return Math.round(clamp(density / 85 + buildBusinessDensity(profile) * 0.28 + buildTransitAccess(profile) * 0.22, 10, 94));
}

function buildBroadbandAccess(profile: DemographicProfile) {
  return Math.round(clamp(54 + (profile.medianHouseholdIncome ?? 56000) / 2500 + (profile.bachelorsOrHigherRate ?? 0.26) * 28 - (profile.povertyRate ?? 0.12) * 42, 30, 98));
}

function buildDeviceAccess(profile: DemographicProfile) {
  return Math.round(clamp(buildBroadbandAccess(profile) * 0.62 + Math.min((profile.medianHouseholdIncome ?? 56000) / 140000, 1) * 20 + (1 - Math.max(0, ((profile.medianAge ?? 39) - 58) / 80)) * 18, 34, 98));
}

function buildLanguageDiversity(profile: DemographicProfile, topRaceGroup: ReturnType<typeof getTopRaceGroup>) {
  const topShare = topRaceGroup?.value ?? 62;
  const density = buildModeledPopulationDensity(profile) ?? 900;
  return Math.round(clamp((100 - topShare) * 1.05 + Math.min(density / 140, 24) + (profile.bachelorsOrHigherRate ?? 0.26) * 16, 8, 92));
}

function buildForeignBornEstimate(profile: DemographicProfile, topRaceGroup: ReturnType<typeof getTopRaceGroup>) {
  return clamp(buildLanguageDiversity(profile, topRaceGroup) / 180 + Math.min((profile.bachelorsOrHigherRate ?? 0.26) * 0.16, 0.12), 0.03, 0.42);
}

function buildBusinessDensity(profile: DemographicProfile) {
  const density = buildModeledPopulationDensity(profile) ?? 900;
  return Math.round(clamp(density / 95 + Math.min((profile.medianHouseholdIncome ?? 56000) / 2200, 38) + (profile.bachelorsOrHigherRate ?? 0.26) * 24, 14, 96));
}

function buildRestaurantDensity(profile: DemographicProfile) {
  return Math.round(clamp(buildBusinessDensity(profile) * 0.56 + Math.min(profile.population / 1800, 24) + buildWalkability(profile) * 0.18, 12, 94));
}

function buildEntertainmentDensity(profile: DemographicProfile) {
  return Math.round(clamp(buildBusinessDensity(profile) * 0.36 + buildYoungProfessionalScore(profile) * 0.28 + buildSportsFanIntensity(profile) * 0.2 + Math.min(profile.population / 2500, 18), 10, 94));
}

function buildSportsFanIntensity(profile: DemographicProfile) {
  const ageFit = 100 - Math.abs((profile.medianAge ?? 39) - 38) * 1.6;
  return Math.round(clamp(Math.min(profile.population / 900, 42) + Math.min((profile.medianHouseholdIncome ?? 56000) / 3500, 28) + ageFit * 0.16 + buildEntertainmentDensityBase(profile) * 0.14, 18, 96));
}

function buildEntertainmentDensityBase(profile: DemographicProfile) {
  return clamp(buildBusinessDensity(profile) * 0.46 + buildWalkability(profile) * 0.28 + Math.min(profile.population / 2800, 18), 10, 94);
}

function buildEventDemand(profile: DemographicProfile) {
  return Math.round(clamp(buildSportsFanIntensity(profile) * 0.42 + buildLocalMobility(profile) * 0.28 + buildRestaurantDensity(profile) * 0.18 + Math.min(profile.population / 1600, 18), 16, 96));
}

function buildTourismTraffic(profile: DemographicProfile) {
  return Math.round(clamp(buildEventDemand(profile) * 0.42 + buildEntertainmentDensity(profile) * 0.3 + buildTransitAccess(profile) * 0.16 + Math.min(profile.population / 2500, 16), 10, 94));
}

function buildCivicParticipation(profile: DemographicProfile) {
  return Math.round(clamp((profile.highSchoolGradRate ?? 0.84) * 28 + (profile.bachelorsOrHigherRate ?? 0.26) * 34 + (profile.ownerOccupiedRate ?? 0.58) * 22 + Math.min((profile.medianAge ?? 39) / 70, 1) * 16, 20, 96));
}

function buildWeatherComfort(profile: DemographicProfile) {
  const state = profile.place?.stateCode ?? "";
  const regional = ["CA", "NC", "SC", "GA", "TN", "VA", "AZ", "CO"].includes(state) ? 72 : ["FL", "TX", "LA", "MS"].includes(state) ? 62 : 58;
  return Math.round(clamp(regional + Math.max(0, 28 - (profile.averageCommuteMinutes ?? 24)) * 0.35 - buildWeatherRisk(profile) * 0.12, 28, 92));
}

function buildWeatherRisk(profile: DemographicProfile) {
  const state = profile.place?.stateCode ?? "";
  const base = ["FL", "LA", "TX", "MS", "AL", "SC", "NC"].includes(state) ? 62 : ["CA", "CO", "AZ"].includes(state) ? 54 : 38;
  return Math.round(clamp(base + (profile.vacancyRate ?? 0.08) * 60, 18, 90));
}

function buildGrowthOpportunity(profile: DemographicProfile) {
  return Math.round(clamp(buildMarketResilienceScore(profile) * 0.34 + (100 - buildCostOfLivingIndex(profile)) * 0.18 + buildBusinessDensity(profile) * 0.18 + Math.min(profile.population / 1200, 24), 16, 96));
}

function buildInvestmentAttractiveness(profile: DemographicProfile) {
  return Math.round(clamp(buildGrowthOpportunity(profile) * 0.34 + buildHouseholdAffluenceIndex(profile) * 0.24 + buildEventDemand(profile) * 0.16 + (100 - buildCostOfLivingIndex(profile)) * 0.14 + (1 - (profile.vacancyRate ?? 0.08)) * 12, 14, 96));
}

function buildFamilyFriendliness(profile: DemographicProfile) {
  return Math.round(clamp(buildModeledFamilyHouseholds(profile) * 32 + (profile.ownerOccupiedRate ?? 0.58) * 24 + buildSchoolQualitySignal(profile) * 0.24 + (100 - buildModeledCrimeRate(profile) * 500) * 0.2, 16, 96));
}

function buildYoungProfessionalScore(profile: DemographicProfile) {
  const ageFit = 100 - Math.abs((profile.medianAge ?? 38) - 34) * 2.1;
  return Math.round(clamp(ageFit * 0.22 + (profile.bachelorsOrHigherRate ?? 0.26) * 34 + buildRemoteWorkPotential(profile) * 0.22 + buildEntertainmentDensityBase(profile) * 0.18, 12, 96));
}

function buildRetirementComfort(profile: DemographicProfile) {
  const ageFit = clamp(((profile.medianAge ?? 39) - 35) * 2.2, 0, 42);
  return Math.round(clamp(ageFit + buildHealthcareAccess(profile) * 0.24 + buildWeatherComfort(profile) * 0.22 + (100 - buildCostOfLivingIndex(profile)) * 0.16 + (1 - buildModeledCrimeRate(profile)) * 16, 12, 96));
}

function buildLocalMobility(profile: DemographicProfile) {
  return Math.round(clamp((100 - Math.min((profile.averageCommuteMinutes ?? 24) * 2, 88)) * 0.28 + buildVehicleOwnership(profile) * 0.22 + buildTransitAccess(profile) * 0.24 + buildWalkability(profile) * 0.26, 12, 96));
}

function buildNeighborhoodMomentum(profile: DemographicProfile) {
  return Math.round(clamp(buildGrowthOpportunity(profile) * 0.3 + buildInvestmentAttractiveness(profile) * 0.22 + buildEventDemand(profile) * 0.18 + buildBusinessDensity(profile) * 0.16 + (100 - buildCostOfLivingIndex(profile)) * 0.14, 12, 97));
}

function buildGraduateDegreeEstimate(profile: DemographicProfile) {
  if (profile.bachelorsOrHigherRate === null) return null;
  return clamp(profile.bachelorsOrHigherRate * (0.36 + Math.min((profile.medianHouseholdIncome ?? 56000) / 250000, 0.2)), 0.04, 0.42);
}

function buildSchoolQualitySignal(profile: DemographicProfile) {
  return Math.round(clamp((profile.highSchoolGradRate ?? 0.84) * 30 + (profile.bachelorsOrHigherRate ?? 0.26) * 32 + (1 - (profile.povertyRate ?? 0.12)) * 22 + (profile.ownerOccupiedRate ?? 0.58) * 16, 24, 96));
}

function buildHealthcareAccess(profile: DemographicProfile) {
  const density = buildModeledPopulationDensity(profile) ?? 900;
  return Math.round(clamp(42 + Math.min(density / 160, 24) + Math.min((profile.medianHouseholdIncome ?? 56000) / 4000, 22) + Math.max(0, 32 - (profile.averageCommuteMinutes ?? 24)) * 0.5, 22, 94));
}

function buildMajorSectorLabel(profile: DemographicProfile) {
  if ((profile.bachelorsOrHigherRate ?? 0) > 0.48) return "Professional";
  if ((profile.averageCommuteMinutes ?? 24) > 34) return "Commuter";
  if ((profile.population ?? 0) > 55000) return "Service Mix";
  if ((profile.ownerOccupiedRate ?? 0.58) > 0.68) return "Residential";
  return "Mixed Local";
}

function formatValueIncomeRatio(profile: DemographicProfile) {
  if (!profile.medianHomeValue || !profile.medianHouseholdIncome) return "-";
  return `${(profile.medianHomeValue / profile.medianHouseholdIncome).toFixed(1)}x`;
}

function getTopRaceGroup(raceEthnicity: DemographicProfile["raceEthnicity"]) {
  return [...raceEthnicity].filter((group) => group.value > 0).sort((a, b) => b.value - a.value)[0] ?? null;
}

const raceColors = ["#21d4fd", "#a855f7", "#5eead4", "#60a5fa", "#f472b6", "#facc15"];

function buildDonutSegments(groups: Array<{ label: string; value: number }>) {
  let cursor = 0;
  const segments = groups.map((group, index) => {
    const start = cursor;
    const end = Math.min(100, cursor + group.value);
    cursor = end;
    const color = raceColors[index % raceColors.length];
    return `${color} ${start}% ${end}%`;
  });

  if (cursor < 100) {
    segments.push(`rgba(14, 116, 144, 0.12) ${cursor}% 100%`);
  }

  return segments.join(", ");
}
