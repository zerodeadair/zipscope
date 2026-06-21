import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DemographicProfile } from "../providers/demographicsProvider";

const colors = ["#21d4fd", "#5eead4", "#a855f7", "#f472b6", "#facc15", "#60a5fa"];

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

  return (
    <section className="dashboard-section">
      <div className="section-heading">
        <span>Demographic Deep Dive</span>
        <h2>Public Census ACS 2024 fields for ZIP {profile.zip}</h2>
      </div>
      <div className="chart-grid">
        <ChartFrame title="Education Rates">
          <BarViz data={educationData} />
        </ChartFrame>
        <ChartFrame title="Economic Indicators">
          <BarViz data={economicsData} />
        </ChartFrame>
        <ChartFrame title="Population and Housing">
          <BarViz data={profileData} />
        </ChartFrame>
        <ChartFrame title="Male / Female Composition">
          <DonutViz data={sexData} />
        </ChartFrame>
        <ChartFrame title="Race / Ethnicity">
          <DonutViz data={profile.raceEthnicity} />
        </ChartFrame>
        <ChartFrame title="Poverty Indicator">
          <DonutViz data={[{ label: "Below poverty", value: percent(profile.povertyRate) ?? 0 }, { label: "Other", value: 100 - (percent(profile.povertyRate) ?? 0) }]} />
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

function BarViz({ data }: { data: { label: string; value: number }[] }) {
  if (!data.length) return <div className="chart-empty">Field unavailable from Census response.</div>;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: "#a7b4d8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#a7b4d8", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: "#f7fbfd", border: "1px solid rgba(126,170,192,0.34)", borderRadius: 12, color: "#3f6478", boxShadow: "0 16px 38px rgba(80,122,148,0.16)" }} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DonutViz({ data }: { data: { label: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="label" innerRadius={46} outerRadius={78} paddingAngle={2}>
          {data.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
        </Pie>
        <Tooltip contentStyle={{ background: "#f7fbfd", border: "1px solid rgba(126,170,192,0.34)", borderRadius: 12, color: "#3f6478", boxShadow: "0 16px 38px rgba(80,122,148,0.16)" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function percent(value: number | null) {
  return value === null ? null : Number((value * 100).toFixed(1));
}
