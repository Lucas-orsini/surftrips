export default function SearchLoading() {
  return (
    <main id="main-content" className="container inner-page" aria-busy="true">
      <p role="status">Ton prochain horizon se prépare…</p>
      <div className="destinations-grid listing-grid">
        {[0, 1, 2].map((i) => (
          <div className="destination-card skeleton" key={i} aria-hidden="true">
            <div className="destination-photo" />
            <div className="skeleton-line" />
            <div className="skeleton-line" />
          </div>
        ))}
      </div>
    </main>
  );
}
