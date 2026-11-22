import { LucideIcon } from "lucide-react";

type Props = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  active?: boolean;
  category?: string;
  confidence?: string;
  basis?: string;
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
  basis,
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
      aria-label={`Show AI insight for ${label}. ${basis ?? confidence ?? status ?? ""}`}
      title={`${label}: ${detail}. ${basis ?? confidence ?? status ?? ""}`}
    >
      <div className="stat-card-topline">
        <div className="stat-icon"><Icon size={20} /></div>
      </div>
      <span>{label}</span>
      <div className="stat-card-value">
        <strong>{value}</strong>
      </div>
      <small>{detail}</small>
      <div className="stat-card-meta" aria-label="Tile metadata">
        {category && <b>{category}</b>}
        {trend && <b>{trend}</b>}
      </div>
      {typeof percentile === "number" && (
        <div className="stat-meter" aria-label={`${label} display index ${percentile}`}>
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
