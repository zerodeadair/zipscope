import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Building2, ChevronLeft, ChevronRight, CircleDollarSign, Clock3, Home, Landmark, LineChart, Loader2, PieChart as PieChartIcon, ShieldAlert, UserRoundCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DemographicProfile } from "../types/demographics";
import { formatCurrency, formatNumber, formatOptionalCurrency, formatOptionalPercent, formatPercent } from "../utils/formatters";
import { ComparableProperty, PropertyTransaction, fetchPropertyTransactions, getRealEstateIntelligence } from "../services/realEstateIntelligence";
import { PublicPropertyRecord, PublicPropertyRecordsResult, fetchPublicPropertyRecords } from "../services/publicPropertyRecords";

const chartColors = ["#2f9fbd", "#63c7b2", "#8b7cf6", "#d9827c", "#d4a72c", "#5f8bd7", "#7ba66b", "#bf72a6"];
const pageSize = 5;

type HistoryState = {
  loading: boolean;
  transactions: PropertyTransaction[] | null;
};

type DisplayTransaction = PropertyTransaction & {
  documentNumber?: string;
  qualified?: string;
  vacantOrImproved?: string;
};

type PublicRecordsState = {
  loading: boolean;
  result: PublicPropertyRecordsResult | null;
  error: string;
};

export default function RealEstateIntelligencePanel({ profile }: { profile: DemographicProfile }) {
  const intelligence = useMemo(() => getRealEstateIntelligence(profile), [profile]);
  const [page, setPage] = useState(0);
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null);
  const [expandedPublicRecordId, setExpandedPublicRecordId] = useState<string | null>(null);
  const [histories, setHistories] = useState<Record<string, HistoryState>>({});
  const [publicRecords, setPublicRecords] = useState<PublicRecordsState>({ loading: false, result: null, error: "" });
  const totalPages = Math.ceil(intelligence.comparableProperties.length / pageSize);
  const visibleProperties = intelligence.comparableProperties.slice(page * pageSize, page * pageSize + pageSize);

  useEffect(() => {
    let cancelled = false;
    setExpandedPublicRecordId(null);
    setPublicRecords({ loading: true, result: null, error: "" });

    fetchPublicPropertyRecords(profile.zip, intelligence.medianHomeValue)
      .then((result) => {
        if (!cancelled) setPublicRecords({ loading: false, result, error: result.ok ? "" : result.error ?? "No public records returned." });
      })
      .catch((error) => {
        if (!cancelled) setPublicRecords({ loading: false, result: null, error: error instanceof Error ? error.message : "Unable to fetch public records." });
      });

    return () => {
      cancelled = true;
    };
  }, [intelligence.medianHomeValue, profile.zip]);

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

      <section className="comparable-property-section" aria-label="Verified public property records near the median home value">
        <div className="property-section-heading">
          <div>
            <span className="mono-label">Verified Public Records</span>
            <h3>Tax-record matches near ZIP {profile.zip} median home value</h3>
            <p>
              {publicRecords.result?.records.length
                ? `${publicRecords.result.sourceName}; market-value band ${formatCurrency(publicRecords.result.valueBand?.low ?? 0)} to ${formatCurrency(publicRecords.result.valueBand?.high ?? 0)}.`
                : "ZipScope is checking county public records for parcels in this ZIP near the ACS median home value."}
            </p>
          </div>
          <div className="source-state-pill">
            {publicRecords.loading ? "Searching public records" : publicRecords.result?.records.length ? `${publicRecords.result.records.length} verified records` : "Modeled fallback active"}
          </div>
        </div>

        {publicRecords.loading && <div className="transaction-loading">Searching public tax and parcel records...</div>}
        {!publicRecords.loading && publicRecords.error && <div className="transaction-loading">{publicRecords.error}</div>}
        {!publicRecords.loading && publicRecords.result?.note && <p className="records-note">{publicRecords.result.note}</p>}

        {publicRecords.result?.records.length ? (
          <div className="property-table-wrap">
            <table className="property-table">
              <thead>
                <tr>
                  <th>Verified Property</th>
                  <th>Value / Assessment</th>
                  <th>Physical</th>
                  <th>Ownership</th>
                  <th>Records</th>
                </tr>
              </thead>
              <tbody>
                {publicRecords.result.records.map((record) => (
                  <PublicPropertyRows
                    key={record.id}
                    record={record}
                    isExpanded={expandedPublicRecordId === record.id}
                    onToggleHistory={() => setExpandedPublicRecordId((current) => current === record.id ? null : record.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="comparable-property-section" aria-label="Modeled comparable properties nearest the median home value">
        <div className="property-section-heading">
          <div>
            <span className="mono-label">Top 25 Modeled Median Comparables</span>
            <h3>Modeled property scenarios near ZIP {profile.zip} median home value</h3>
            <p>These rows are ZIP-level comparable scenarios. They are not verified parcel, owner, tax, or deed records for a specific address.</p>
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
                <th>Modeled Property</th>
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
        <strong>Future real estate source stack</strong>
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

function PublicPropertyRows({
  record,
  isExpanded,
  onToggleHistory,
}: {
  record: PublicPropertyRecord;
  isExpanded: boolean;
  onToggleHistory: () => void;
}) {
  return (
    <>
      <tr>
        <td>
          <a className="verified-property-link" href={record.sourceUrl} target="_blank" rel="noreferrer">
            {record.streetAddress}
          </a>
          <span>Folio {record.folio}</span>
          <span>PIN {record.pin}</span>
        </td>
        <td>
          <strong>{formatCurrency(record.marketValue)}</strong>
          <span>Assessed {formatCurrency(record.assessedValue)}</span>
          <span>Taxable {formatCurrency(record.taxableValue)}</span>
        </td>
        <td>
          <strong>{record.squareFeet ? `${formatNumber(record.squareFeet)} sf heated` : "Area unavailable"}</strong>
          <span>{record.bedrooms || "-"} bd / {record.bathrooms || "-"} ba</span>
          <span>{record.yearBuilt ? `Built ${record.yearBuilt}` : "Year built unavailable"}</span>
        </td>
        <td>
          <strong>{record.ownerName}</strong>
          <span>{record.ownerMailingAddress}</span>
          <div className="owner-badge-row">
            <em>{record.entityType}</em>
            {record.institutionalOwner && <em className="institutional">Institutional</em>}
            {record.privateEquityOwner && <em className="private-equity" title={record.institutionalTooltip}>PRIVATE EQUITY OWNER</em>}
            {record.ownerOccupied && <em className="owner-occupied-badge">Homestead</em>}
          </div>
        </td>
        <td>
          <div className="record-link-stack">
            <button className="history-button" type="button" onClick={onToggleHistory}>
              <Clock3 size={15} />
              {isExpanded ? "Hide sales history" : "Sales history"}
            </button>
            <a href={record.sourceUrl} target="_blank" rel="noreferrer">Parcel card</a>
            {record.taxCollectorUrl && <a href={record.taxCollectorUrl} target="_blank" rel="noreferrer">Tax record</a>}
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="transaction-row">
          <td colSpan={5}>
            <TaxRecordContinuation record={record} />
            {record.transactions.length ? (
              <TransactionTimeline transactions={record.transactions} verified />
            ) : (
              <div className="transaction-loading">No sales history rows were returned on the public parcel card.</div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function TaxRecordContinuation({ record }: { record: PublicPropertyRecord }) {
  const effectiveAssessmentRatio = record.marketValue > 0 ? record.assessedValue / record.marketValue : null;
  const taxableRatio = record.marketValue > 0 ? record.taxableValue / record.marketValue : null;
  const taxableDiscount = record.marketValue > record.taxableValue ? record.marketValue - record.taxableValue : null;
  const latestSale = record.transactions[0];

  return (
    <section className="verified-tax-continuation" aria-label={`Tax record continuation for ${record.streetAddress}`}>
      <div className="verified-tax-header">
        <div>
          <span className="mono-label">Official Tax Continuation</span>
          <h4>{record.streetAddress}</h4>
          <p>Public appraiser values are carried forward here so the verified tax record keeps reading after the row opens.</p>
        </div>
        <div className="verified-tax-actions">
          <a href={record.sourceUrl} target="_blank" rel="noreferrer">Parcel card</a>
          {record.taxCollectorUrl && <a href={record.taxCollectorUrl} target="_blank" rel="noreferrer">Tax record</a>}
        </div>
      </div>
      <div className="tax-continuation-grid">
        <TaxMetric label="Market value" value={formatCurrency(record.marketValue)} detail="Property appraiser value" />
        <TaxMetric label="Assessed value" value={formatCurrency(record.assessedValue)} detail={effectiveAssessmentRatio === null ? "Assessment ratio unavailable" : `${formatPercent(effectiveAssessmentRatio)} of market value`} />
        <TaxMetric label="Taxable value" value={formatCurrency(record.taxableValue)} detail={taxableRatio === null ? "Taxable ratio unavailable" : `${formatPercent(taxableRatio)} of market value`} />
        <TaxMetric label="Exemption / cap gap" value={taxableDiscount === null ? "-" : formatCurrency(taxableDiscount)} detail={record.ownerOccupied ? "Homestead flagged on public record" : "No homestead flag on returned row"} />
        <TaxMetric label="Folio" value={record.folio} detail={`PIN ${record.pin}`} />
        <TaxMetric label="Latest sale" value={record.salePrice ? formatCurrency(record.salePrice) : "-"} detail={record.saleDate ? new Date(record.saleDate).toLocaleDateString() : latestSale?.saleDate ? new Date(latestSale.saleDate).toLocaleDateString() : "Sale date unavailable"} />
      </div>
    </section>
  );
}

function TaxMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="tax-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <em>{detail}</em>
    </article>
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
            {isExpanded ? "Hide modeled timeline" : "Modeled timeline"}
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="transaction-row">
          <td colSpan={5}>
            {history?.loading && <div className="transaction-loading">Building modeled transfer timeline...</div>}
            {history?.transactions && <TransactionTimeline transactions={history.transactions} />}
          </td>
        </tr>
      )}
    </>
  );
}

function TransactionTimeline({ transactions, verified = false }: { transactions: DisplayTransaction[]; verified?: boolean }) {
  return (
    <div className="transaction-timeline" aria-label={verified ? "Verified public sales history" : "Modeled ownership transfer timeline"}>
      {transactions.map((transaction) => (
        <article key={transaction.id}>
          <div>
            <strong>{new Date(transaction.saleDate).getFullYear()} - {verified ? "Recorded sale" : "Modeled transfer"} for {formatCurrency(transaction.salePrice)}</strong>
            <span>{verified ? "Buyer source" : "Buyer profile"}: {transaction.buyerName}</span>
            <span>{verified ? "Seller source" : "Seller profile"}: {transaction.sellerName}</span>
          </div>
          <div>
            <em>{verified ? transaction.deedType : `Modeled ${transaction.deedType}`}</em>
            <span>Transfer {formatCurrency(transaction.transferAmount)}</span>
            <span>{transaction.appreciationSincePreviousSale === null ? "Prior sale baseline" : `${formatPercent(transaction.appreciationSincePreviousSale)} appreciation`}</span>
            <span>{transaction.yearsHeld === null ? "Hold period unavailable" : `${transaction.yearsHeld} years held`}</span>
            {"documentNumber" in transaction && transaction.documentNumber && <span>Instrument {transaction.documentNumber}</span>}
            {"qualified" in transaction && transaction.qualified && <span>{transaction.qualified}</span>}
            {"vacantOrImproved" in transaction && transaction.vacantOrImproved && <span>{transaction.vacantOrImproved}</span>}
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
