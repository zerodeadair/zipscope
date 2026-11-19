import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DemographicProfile } from "../providers/demographicsProvider";
import { formatCurrency, formatNumber } from "../utils/formatters";

const colors = ["#21d4fd", "#5eead4", "#a855f7", "#f472b6", "#facc15", "#60a5fa"];
const share = (value: number) => `${value.toFixed(1)}%`;
const compactCount = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });
const tick = { fill: "#657c92", fontSize: 11 };
type ChartDatum = { label: string; value: number };

export default function DemographicCharts({ profile }: { profile: DemographicProfile }) {
  const educationData = [
    { label: "High school+", value: percent(profile.highSchoolGradRate) },
    { label: "Bachelor's+", value: percent(profile.bachelorsOrHigherRate) },
  ].filter((item) => item.value !== null) as { label: string; value: number }[];
  const economicsData = [
    { label: "Median income", value: profile.medianHouseholdIncome },
    { label: "Median home", value: profile.medianHomeValue },
  ].filter((item) => item.value !== null) as { label: string; value: number }[];
  const profileData = [
    { label: "Population", value: profile.population },
    { label: "Housing units", value: profile.housingUnits },
  ].filter((item) => item.value !== null) as { label: string; value: number }[];
  const sexData = [
    { label: "Female", value: profile.femalePopulation },
    { label: "Male", value: profile.malePopulation },
  ].filter((item) => item.value !== null) as { label: string; value: number }[];
  const povertyShare = percent(profile.povertyRate);
  const povertyData = povertyShare === null ? [] : [
    { label: "Below poverty line", value: povertyShare },
    { label: "At or above poverty line", value: 100 - povertyShare },
  ];

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <span>Demographic Deep Dive</span>
        <h2>Census ACS 5-year estimates for ZIP {profile.zip} · {profile.sourceYear}</h2>
      </div>
      <div className="chart-grid">
        <ChartFrame title="Education Rates">
          <BarViz data={educationData} formatValue={share} formatTick={(value) => `${value}%`} />
        </ChartFrame>
        <ChartFrame title="Economic Indicators">
          <BarViz data={economicsData} formatValue={formatCurrency} formatTick={(value) => `$${compactCount.format(value)}`} />
        </ChartFrame>
        <ChartFrame title="Population and Housing">
          <BarViz data={profileData} formatTick={(value) => compactCount.format(value)} />
        </ChartFrame>
        <ChartFrame title="Male / Female Composition">
          <DonutViz data={sexData} />
        </ChartFrame>
        <ChartFrame title="Reported race and ethnicity shares">
          <BarViz data={profile.raceEthnicity} formatValue={share} formatTick={(value) => `${value}%`} horizontal />
        </ChartFrame>
        <ChartFrame title="Poverty Indicator">
          <DonutViz data={povertyData} formatValue={share} />
        </ChartFrame>
      </div>
    </section>
  );
}

function ChartFrame({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="chart-card">
      <h3>{title}</h3>
      <div className="chart-box">{children}</div>
    </article>
  );
}

function BarViz({ data, formatValue = formatNumber, formatTick = formatNumber, horizontal = false }: {
  data: ChartDatum[];
  formatValue?: (value: number) => string;
  formatTick?: (value: number) => string;
  horizontal?: boolean;
}) {
  if (!data.length) return <div className="chart-empty">Field unavailable from Census response.</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        {horizontal ? (
          <XAxis type="number" domain={[0, 100]} tickFormatter={formatTick} tick={tick} axisLine={false} tickLine={false} />
        ) : (
          <XAxis dataKey="label" tick={tick} axisLine={false} tickLine={false} />
        )}
        {horizontal ? (
          <YAxis dataKey="label" type="category" width={96} tick={tick} axisLine={false} tickLine={false} />
        ) : (
          <YAxis tickFormatter={formatTick} width={48} tick={tick} axisLine={false} tickLine={false} />
        )}
        <Tooltip formatter={(value) => [formatValue(Number(value)), "ACS estimate"]} contentStyle={tooltipStyle} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DonutViz({ data, formatValue = formatNumber }: { data: ChartDatum[]; formatValue?: (value: number) => string }) {
  if (!data.length) return <div className="chart-empty">Field unavailable from Census response.</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={46} outerRadius={78} paddingAngle={2}>
          {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
        </Pie>
        <Tooltip formatter={(value, name) => [formatValue(Number(value)), name]} contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function percent(value: number | null) {
  return value === null ? null : Number((value * 100).toFixed(1));
}

const tooltipStyle = {
  background: "#f7fbfd",
  border: "1px solid rgba(126,170,192,0.34)",
  borderRadius: 12,
  color: "#3f6478",
  boxShadow: "0 16px 38px rgba(80,122,148,0.16)",
};
