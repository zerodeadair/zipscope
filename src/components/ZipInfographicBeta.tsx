import { Download, FileImage, Printer } from "lucide-react";
import type { DemographicProfile } from "../types/demographics";
import { buildInfographicRows, buildSimilarAreas, buildSourceConfidence, buildTopInsights } from "../utils/demographicIntelligence";

type Props = {
  isExportingImage?: boolean;
  onExportReportImage?: () => void;
  onPrintReport?: () => void;
  profile: DemographicProfile;
};

export default function ZipInfographicBeta({ isExportingImage = false, onExportReportImage, onPrintReport, profile }: Props) {
  const similarAreas = buildSimilarAreas(profile);
  const rows = buildInfographicRows(profile, similarAreas);
  const confidence = buildSourceConfidence(profile);
  const insights = buildTopInsights(profile).slice(0, 3);

  function handleDownload() {
    const svg = buildInfographicSvg(profile, rows.facts, rows.similarPreview, insights, rows.sourceNote, confidence.score);
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1400;
      canvas.height = 1800;
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(url);
        return;
      }
      context.fillStyle = "#f8fcff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `zipscope-${profile.zip}-infographic.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    image.src = url;
  }

  return (
    <section className="zip-infographic-section" id="infographic" aria-label="ZIP Code Infographic Beta">
      <div className="zip-infographic-heading">
        <div>
          <span className="beta-chip"><FileImage size={14} /> ZIP Code Infographic Beta</span>
          <h2>Printable ZIP intelligence sheet</h2>
        </div>
        <div className="infographic-actions">
          <button type="button" onClick={onPrintReport ?? (() => window.print())}>
            <Printer size={16} />
            PDF / Print
          </button>
          <button className="primary" type="button" onClick={onExportReportImage ?? handleDownload} disabled={isExportingImage}>
            <Download size={16} />
            {isExportingImage ? "Building Image" : "Full Dashboard Image"}
          </button>
          <button type="button" onClick={handleDownload}>
            <FileImage size={16} />
            Classic Sheet
          </button>
        </div>
      </div>

      <div className="infographic-preview">
        <div className="infographic-preview-header">
          <span>ZipScope Sports Intel</span>
          <strong>ZIP {profile.zip}</strong>
          <h3>{profile.displayName}</h3>
          <p>{rows.insight}</p>
        </div>
        <div className="infographic-facts">
          {rows.facts.map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="infographic-bottom-grid">
          <div>
            <h4>Top insight summary</h4>
            {insights.map((insight) => <p key={insight}>{insight}</p>)}
          </div>
          <div>
            <h4>Similar Areas Beta preview</h4>
            {rows.similarPreview.map((item) => <p key={item}>{item}</p>)}
          </div>
          <div>
            <h4>Data freshness / source note</h4>
            <p>{rows.sourceNote}</p>
            <p>{confidence.label}: {confidence.score}% field coverage.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function buildInfographicSvg(
  profile: DemographicProfile,
  facts: string[][],
  similar: string[],
  insights: string[],
  sourceNote: string,
  confidence: number,
) {
  const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char] ?? char));
  const factCards = facts.map(([label, value], index) => {
    const x = 80 + (index % 2) * 620;
    const y = 420 + Math.floor(index / 2) * 145;
    return `<rect x="${x}" y="${y}" width="560" height="112" rx="18" fill="#ffffff" stroke="#c7e9f6"/><text x="${x + 28}" y="${y + 42}" fill="#668096" font-size="24" font-weight="720">${escape(label)}</text><text x="${x + 28}" y="${y + 82}" fill="#39566d" font-size="34" font-weight="760">${escape(value)}</text>`;
  }).join("");
  const insightLines = insights.map((item, index) => `<text x="108" y="${1098 + index * 48}" fill="#20364d" font-size="26" font-weight="750">${escape(item.slice(0, 92))}</text>`).join("");
  const similarLines = similar.map((item, index) => `<text x="108" y="${1340 + index * 48}" fill="#20364d" font-size="26" font-weight="750">${escape(item)}</text>`).join("");

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1800" viewBox="0 0 1400 1800">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="#f8fcff"/>
      <stop offset="0.54" stop-color="#e9f7ff"/>
      <stop offset="1" stop-color="#f5fbff"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" x2="1">
      <stop offset="0" stop-color="#21d4fd"/>
      <stop offset="1" stop-color="#5eead4"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="1800" fill="url(#bg)"/>
  <circle cx="1180" cy="160" r="230" fill="#a855f7" opacity="0.10"/>
  <circle cx="150" cy="210" r="210" fill="#21d4fd" opacity="0.13"/>
  <rect x="60" y="60" width="1280" height="1680" rx="34" fill="#ffffff" opacity="0.78" stroke="#bdeaf8"/>
  <text x="100" y="148" fill="#2f86a7" font-size="28" font-weight="760">ZipScope Sports Intel</text>
  <text x="100" y="226" fill="#38566d" font-size="84" font-weight="780">ZIP ${escape(profile.zip)}</text>
  <text x="100" y="288" fill="#557087" font-size="38" font-weight="720">${escape(profile.displayName)}</text>
  <rect x="1040" y="122" width="230" height="72" rx="20" fill="url(#accent)"/>
  <text x="1078" y="168" fill="#31596d" font-size="28" font-weight="760">${confidence}% coverage</text>
  <text x="100" y="360" fill="#526681" font-size="26" font-weight="750">Printable demographic, housing, cost, education, and comparable-area summary.</text>
  ${factCards}
  <rect x="80" y="1030" width="1240" height="210" rx="22" fill="#effaff" stroke="#c7e9f6"/>
  <text x="108" y="1072" fill="#2f86a7" font-size="26" font-weight="760">Top Insight Summary</text>
  ${insightLines}
  <rect x="80" y="1272" width="1240" height="230" rx="22" fill="#f7f2ff" stroke="#ddd6fe"/>
  <text x="108" y="1316" fill="#6d28d9" font-size="26" font-weight="950">Similar Areas Beta Preview</text>
  ${similarLines}
  <rect x="80" y="1536" width="1240" height="116" rx="22" fill="#ffffff" stroke="#c7e9f6"/>
  <text x="108" y="1582" fill="#2f86a7" font-size="24" font-weight="760">Data Freshness / Source Note</text>
  <text x="108" y="1624" fill="#526681" font-size="23" font-weight="760">${escape(sourceNote.slice(0, 112))}</text>
  <text x="100" y="1698" fill="#7890a8" font-size="22" font-weight="760">Beta overlays are directional planning signals. Unavailable fields are left unavailable rather than replaced with exact fabricated values.</text>
</svg>`;
}
