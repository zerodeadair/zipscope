import type { ReactNode } from "react";

export default function MetricProvenance({ children = "Modeled" }: { children?: ReactNode }) {
  return <small className="metric-provenance">{children}</small>;
}
