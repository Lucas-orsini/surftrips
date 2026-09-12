export default function DestinationLoading() {
  return (
    <main id="main-content" className="destination-page" aria-busy="true">
      <div className="container skeleton">
        <p role="status">Ta destination se prépare…</p>
        <div className="detail-heading" aria-hidden="true">
          <div className="skeleton-line" />
        </div>
        <div
          className="detail-photo destination-hero-skeleton"
          aria-hidden="true"
        />
        <div className="destination-body-skeleton" aria-hidden="true">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    </main>
  );
}
