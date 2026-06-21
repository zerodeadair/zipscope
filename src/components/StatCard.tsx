import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  active?: boolean;
  category?: string;
  confidence?: string;
  status?: "Real data" | "Estimated" | "Beta" | "Mock" | "Coming soon";
  trend?: string;
  percentile?: number;
  pinned?: boolean;
  onPin?: () => void;
  onClick?: () => void;
};

export default function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  active = false,
  category,
  confidence,
  status,
  trend,
  percentile,
  pinned = false,
  onPin,
  onClick,
}: Props) {
  return (
    <button
      type="button"
      className={`stat-card premium-stat-card${active ? " active" : ""}${pinned ? " pinned" : ""}`}
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Show AI insight for ${label}`}
      title={`${label}: ${detail}${status ? ` (${status})` : ""}`}
    >
      <div className="stat-card-topline">
        <div className="stat-icon"><Icon size={20} /></div>
        {status && <em className={`stat-status ${status.toLowerCase().replace(/\s+/g, "-")}`}>{status}</em>}
      </div>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
      <div className="stat-card-meta" aria-label="Tile metadata">
        {category && <b>{category}</b>}
        {confidence && <b>{confidence}</b>}
        {trend && <b>{trend}</b>}
      </div>
      {typeof percentile === "number" && (
        <div className="stat-meter" aria-label={`${label} percentile ${percentile}`}>
          <i style={{ width: `${Math.max(4, Math.min(100, percentile))}%` }} />
        </div>
      )}
      {onPin && (
        <span
          className={`stat-pin ${pinned ? "active" : ""}`}
          role="button"
          tabIndex={0}
          aria-label={pinned ? `Unpin ${label}` : `Pin ${label}`}
          title={pinned ? "Pinned tile" : "Pin tile"}
          onClick={(event) => {
            event.stopPropagation();
            onPin();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              event.stopPropagation();
              onPin();
            }
          }}
        >
          {pinned ? "Pinned" : "Pin"}
        </span>
      )}
    </button>
  );
}
