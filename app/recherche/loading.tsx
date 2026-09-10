export default function SearchLoading() {
  return (
    <main id="main-content" className="container loading-page" aria-busy="true">
      <span className="spinner" />
      <p role="status">Ton prochain horizon se prépare…</p>
    </main>
  );
}
