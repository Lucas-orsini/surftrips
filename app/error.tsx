"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="container not-found">
      <p className="eyebrow">PETIT CONTRETEMPS</p>
      <h1>
        On reprend
        <br />
        la prochaine vague.
      </h1>
      <p>La page n’a pas pu se charger. Tu peux réessayer.</p>
      <button className="button" onClick={reset}>
        Réessayer
      </button>
    </main>
  );
}
