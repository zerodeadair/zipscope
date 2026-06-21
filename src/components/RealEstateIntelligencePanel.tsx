import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Building2, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Home, Landmark, LineChart, Loader2, PieChart as PieChartIcon, ShieldAlert, UserRoundCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DemographicProfile } from "../types/demographics";
import { formatCurrency, formatNumber, formatOptionalCurrency, formatOptionalPercent, formatPercent } from "../utils/formatters";
import { ComparableProperty, PropertyTransaction, fetchPropertyTransactions, getRealEstateIntelligence } from "../services/realEstateIntelligence";

const chartColors = ["#2f9fbd", "#63c7b2", "#8b7cf6", "#d9827c", "#d4a72c", "#5f8bd7", "#7ba66b", "#bf72a6"];
const pageSize = 5;

type HistoryState = {
  loading: boolean;
  transactions: PropertyTransaction[] | null;
};

export default function RealEstateIntelligencePanel({ profile }: { profile: DemographicProfile }) {
  const intelligence = useMemo(() => getRealEstateIntelligence(profile), [profile]);
  const [page, setPage] = useState(0);
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);
  const [histories, setHistories] = useState<Record<string, HistoryState>>({});
  const totalPages = Math.ceil(intelligence.comparableProperties.length / pageSize);
  const visibleProperties = intelligence.comparableProperties.slice(page * pageSize, page * pageSize + pageSize);

  async function togglePropertyHistory(property: ComparableProperty) {
    const nextExpanded = expandedPropertyId === property.id ? null : property.id;
    setExpandedPropertyId(nextExpanded);
    if (!nextExpanded || histories[property.id]?.transactions || histories[property.id]?.loading) return;

    setHistories((current) => ({ ...current, [property.id]: { loading: true, transactions: null } }));
    const transactions = await fetchPropertyTransactions(property, profile.zip);
    setHistories((current) => ({ ...current, [property.id]: { loading: false, transactions } }));
  }

  return (
    <section className="real-estate-intel" aria-label="Median home value and ownership intelligence">
      <div className="section-heading real-estate-heading">
        <div>
          <span>Home Value Intelligence</span>
          <h2>Median home value, comparable properties, and ownership transparency</h2>
        </div>
        <div className="real-estate-source-pills" aria-label="Real estate data sources">
          <span>ACS anchor</span>
          <span>County records ready</span>
          <span>ATTOM/Zillow adapter ready</span>
        </div>
      </div>

      <div className="home-value-hero">
        <div className="home-value-primary">
          <span className="mono-label">Median Home Value Anchor</span>
          <strong>{formatOptionalCurrency(intelligence.medianHomeValue)}</strong>
          <p>{intelligence.aiObservation}</p>
          <div className="real-estate-kpi-strip">
            <MetricPill icon={Landmark} label="Median tax" value={formatOptionalCurrency(intelligence.medianPropertyTaxAmount)} />
            <MetricPill icon={CircleDollarSign} label="Effective tax rate" value={formatOptionalPercent(intelligence.estimatedEffectiveTaxRate)} />
            <MetricPill icon={Home} label="Owner occupied" value={intelligence.ownerOccupiedProperties === null ? "-" : formatNumber(intelligence.ownerOccupiedProperties)} />
            <MetricPill icon={Building2} label="Renter occupied" value={intelligence.renterOccupiedProperties === null ? "-" : formatNumber(intelligence.renterOccupiedProperties)} />
          </div>
        </div>
        <GaugeCard
          label="Median Value Percentile"
          value={intelligence.medianHomeValuePercentile ?? 0}
          detail={`Compared with ${intelligence.surroundingZips.length} surrounding ZIP value estimates`}
        />
        <GaugeCard
          label="Neighborhood Investment Score"
          value={intelligence.neighborhoodInvestmentScore}
          detail={intelligence.neighborhoodInvestmentLabel}
        />
        <GaugeCard
          label="Private Equity Concentration"
          value={intelligence.privateEquityOwnershipPercent}
          detail={`${intelligence.institutionalOwnershipPercent}% institutional ownership among median comps`}
        />
        <GaugeCard
          label="Owner Occupancy"
          value={Math.round((profile.ownerOccupiedRate ?? 0) * 100)}
          detail={`${formatOptionalPercent(profile.ownerOccupiedRate)} ACS owner-occupied share`}
        />
      </div>

      <div className="real-estate-chart-grid">
        <ChartFrame icon={LineChart} title="Appreciation Trend">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={intelligence.historicalTrends}>
              <defs>
                <linearGradient id="homeValueTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2f9fbd" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#2f9fbd" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(126,170,192,0.2)" vertical={false} />
              <XAxis dataKey="year" tick={{ fill: "#6f8798", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} tick={{ fill: "#6f8798", fontSize: 11 }} axisLine={false} tickLine={false} width={54} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="value" stroke="#2f9fbd" strokeWidth={2} fill="url(#homeValueTrend)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartFrame>
        <ChartFrame icon={PieChartIcon} title="Ownership Distribution">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={intelligence.ownershipDistribution.filter((entry) => !["Institutional", "Known PE"].includes(entry.label))} dataKey="count" nameKey="label" innerRadius={42} outerRadius={76} paddingAngle={2}>
                {intelligence.ownershipDistribution.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} properties`, name]} contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartFrame>
        <ChartFrame icon={Landmark} title="Property Tax Heat Map">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={intelligence.taxHeatMap}>
              <CartesianGrid stroke="rgba(126,170,192,0.18)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: "#6f8798", fontSize: 10 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis tickFormatter={(value) => `$${Math.round(Number(value) / 1000)}k`} tick={{ fill: "#6f8798", fontSize: 11 }} axisLine={false} tickLine={false} width={46} />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} contentStyle={tooltipStyle} />
              <Bar dataKey="taxBurden" radius={[4, 4, 0, 0]}>
                {intelligence.taxHeatMap.map((_, index) => <Cell key={index} fill={chartColors[index % chartColors.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartFrame>
        <ChartFrame icon={ShieldAlert} title="Institutional Ownership Ranking">
          <div className="institutional-ranking">
            {intelligence.comparableProperties.filter((property) => property.institutionalOwner).slice(0, 6).map((property, index) => (
              <div key={property.id}>
                <span>{index + 1}</span>
                <strong>{property.institutionalBrand ?? property.ownerName}</strong>
                <em>{formatCurrency(property.estimatedMarketValue)}</em>
              </div>
            ))}
            {!intelligence.comparableProperties.some((property) => property.institutionalOwner) && <p>No known institutional owners in the top 25 modeled comparables.</p>}
          </div>
        </ChartFrame>
      </div>

      <div className="ownership-intel-grid" aria-label="Ownership intelligence metrics">
        <OwnershipMetric label="Individuals" value={intelligence.individualOwnershipPercent} />
        <OwnershipMetric label="LLCs" value={intelligence.llcOwnershipPercent} />
        <OwnershipMetric label="Corporations / REITs" value={intelligence.corporationOwnershipPercent} />
        <OwnershipMetric label="Trusts" value={intelligence.trustOwnershipPercent} />
        <OwnershipMetric label="Institutional" value={intelligence.institutionalOwnershipPercent} />
        <OwnershipMetric label="Known private equity" value={intelligence.privateEquityOwnershipPercent} />
      </div>

      <section className="comparable-property-section" aria-label="Comparable properties nearest the median home value">
        <div className="property-section-heading">
          <div>
            <span className="mono-label">Top 25 Median Comparables</span>
            <h3>Properties nearest ZIP {profile.zip} median home value</h3>
          </div>
          <div className="pagination-controls" aria-label="Comparable property pagination">
            <button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} aria-label="Previous comparable property page">
              <ChevronLeft size={16} />
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button type="button" onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))} disabled={page >= totalPages - 1} aria-label="Next comparable property page">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="property-table-wrap">
          <table className="property-table">
            <thead>
              <tr>
                <th>Property</th>
                <th>Value / Tax</th>
                <th>Physical</th>
                <th>Ownership</th>
                <th>History</th>
              </tr>
            </thead>
            <tbody>
              {visibleProperties.map((property) => {
                const history = histories[property.id];
                const isExpanded = expandedPropertyId === property.id;
                return (
                  <PropertyRows
                    key={property.id}
                    property={property}
                    history={history}
                    isExpanded={isExpanded}
                    onToggleHistory={() => void togglePropertyHistory(property)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="real-estate-sources">
        <strong>Real estate source stack</strong>
        <span>County Assessor</span>
        <span>County Tax</span>
        <span>Recorder of Deeds</span>
        <span>Public parcel records</span>
        <span>Zillow</span>
        <span>Census / ACS</span>
        <span>FHFA</span>
        <span>ATTOM</span>
        <span>Realtor.com</span>
        <span>Redfin</span>
        <p>{intelligence.dataCoverageNote}</p>
      </div>
    </section>
  );
}

function PropertyRows({
  property,
  history,
  isExpanded,
  onToggleHistory,
}: {
  property: ComparableProperty;
  history?: HistoryState;
  isExpanded: boolean;
  onToggleHistory: () => void;
}) {
  return (
    <>
      <tr>
        <td>
          <strong>{property.streetAddress}</strong>
          <span>Built {property.yearBuilt}</span>
        </td>
        <td>
          <strong>{formatCurrency(property.estimatedMarketValue)}</strong>
          <span>Assessed {formatCurrency(property.assessedValue)}</span>
          <span>{formatCurrency(property.annualPropertyTaxes)} taxes / ${property.taxPerSquareFoot.toFixed(2)} psf</span>
        </td>
        <td>
          <strong>{formatNumber(property.squareFeet)} sf</strong>
          <span>{property.bedrooms} bd / {property.bathrooms} ba</span>
          <span>{formatNumber(property.lotSizeSqFt)} sf lot</span>
        </td>
        <td>
          <strong>{property.ownerName}</strong>
          <span>{property.ownerMailingAddress}</span>
          <div className="owner-badge-row">
            <em>{property.entityType}</em>
            {property.institutionalOwner && <em className="institutional">Institutional</em>}
            {property.privateEquityOwner && <em className="private-equity" title={property.institutionalTooltip}>PRIVATE EQUITY OWNER</em>}
            {property.ownerOccupied && <em className="owner-occupied-badge">Owner occupied</em>}
          </div>
        </td>
        <td>
          <button className="history-button" type="button" onClick={onToggleHistory}>
            {history?.loading ? <Loader2 size={15} className="spin-icon" /> : <Clock3 size={15} />}
            {isExpanded ? "Hide timeline" : "Timeline"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="transaction-row">
          <td colSpan={5}>
            {history?.loading && <div className="transaction-loading">Fetching ownership history...</div>}
            {history?.transactions && <TransactionTimeline transactions={history.transactions} />}
          </td>
        </tr>
      )}
    </>
  );
}

function TransactionTimeline({ transactions }: { transactions: PropertyTransaction[] }) {
  return (
    <div className="transaction-timeline" aria-label="Last five ownership transactions">
      {transactions.map((transaction) => (
        <article key={transaction.id}>
          <div>
            <strong>{new Date(transaction.saleDate).getFullYear()} - Purchased for {formatCurrency(transaction.salePrice)}</strong>
            <span>Buyer: {transaction.buyerName}</span>
            <span>Seller: {transaction.sellerName}</span>
          </div>
          <div>
            <em>{transaction.deedType}</em>
            <span>Transfer {formatCurrency(transaction.transferAmount)}</span>
            <span>{transaction.appreciationSincePreviousSale === null ? "Prior sale baseline" : `${formatPercent(transaction.appreciationSincePreviousSale)} appreciation`}</span>
            <span>{transaction.yearsHeld === null ? "Hold period unavailable" : `${transaction.yearsHeld} years held`}</span>
          </div>
        </article>
      ))}
    </div>
  );
}

function GaugeCard({ label, value, detail }: { label: string; value: number; detail: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <article className="real-estate-gauge">
      <div className="gauge-ring" style={{ background: `conic-gradient(#2f9fbd 0 ${safeValue}%, rgba(126,170,192,0.16) ${safeValue}% 100%)` }}>
        <span>{safeValue}</span>
      </div>
      <strong>{label}</strong>
      <p>{detail}</p>
    </article>
  );
}

function MetricPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div>
      <Icon size={16} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function OwnershipMetric({ label, value }: { label: string; value: number }) {
  return (
    <article>
      <div>
        <UserRoundCheck size={16} />
        <span>{label}</span>
      </div>
      <strong>{value}%</strong>
      <i><b style={{ width: `${Math.max(4, Math.min(100, value))}%` }} /></i>
    </article>
  );
}

function ChartFrame({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <article className="real-estate-chart-card">
      <div>
        <Icon size={17} />
        <h3>{title}</h3>
      </div>
      <div className="real-estate-chart-box">{children}</div>
    </article>
  );
}

const tooltipStyle = {
  background: "#f7fbfd",
  border: "1px solid rgba(126,170,192,0.34)",
  borderRadius: 8,
  color: "#3f6478",
  boxShadow: "0 16px 38px rgba(80,122,148,0.16)",
};
