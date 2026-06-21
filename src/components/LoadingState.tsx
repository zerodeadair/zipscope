export default function LoadingState({ message = "Pulling Census profile..." }: { message?: string }) {
  return (
    <div className="loading-shell" role="status">
      <div className="scanner" />
      <strong>{message}</strong>
      <span>Census ZCTA profile, friendly place labels, events, and odds providers are synchronizing.</span>
    </div>
  );
}
