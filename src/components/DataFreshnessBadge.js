export function DataFreshnessBadge(state) {
  const tone = state === "Fresh" ? "fresh" : state === "Stale" ? "stale" : "verify";
  return `<span class="freshness ${tone}">${state}</span>`;
}
