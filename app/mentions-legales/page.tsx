import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false, follow: true },
};

export default function LegalPage() {
  const publisher = process.env.LEGAL_PUBLISHER_NAME;
  const address = process.env.LEGAL_PUBLISHER_ADDRESS;
  const contact = process.env.LEGAL_CONTACT_EMAIL;
  const host = process.env.LEGAL_HOST_NAME;
  return (
    <main id="main-content" className="container legal-page">
      <p className="eyebrow">SURFTRIPS.FR</p>
      <h1>Mentions légales</h1>
      {(!publisher || !host) && (
        <p className="demo-notice">
          Les informations de l’éditeur et de l’hébergeur seront complétées
          avant l’ouverture publique du service.
        </p>
      )}
      <h2>Éditeur du site</h2>
      <p>
        {publisher || "Informations de l’éditeur en cours de configuration."}
        {address && (
          <>
            <br />
            {address}
          </>
        )}
        {contact && (
          <>
            <br />
            <a className="text-link" href={`mailto:${contact}`}>
              {contact}
            </a>
          </>
        )}
      </p>
      <h2>Hébergement</h2>
      <p>
        {host || "L’hébergeur définitif sera indiqué lors de la mise en ligne."}
        {process.env.LEGAL_HOST_ADDRESS && (
          <>
            <br />
            {process.env.LEGAL_HOST_ADDRESS}
          </>
        )}
      </p>
      <h2>Contenu de cette version</h2>
      <p>
        Surftrips aide à explorer les destinations de surf à partir d’un niveau,
        de dates et d’un point de départ. Les spots et saisons proviennent de
        notre base documentaire. Les conditions de surf ne sont pas des
        prévisions en temps réel. Les recherches et réservations de vols sont
        proposées par des partenaires sur les pages destination.
      </p>
      <h2>Photographies et cartographie</h2>
      <p>
        Les photographies sont issues d’Unsplash. Les références des visuels et
        de la carte sont conservées dans le fichier ASSETS.md du projet. Les
        visuels d’ambiance illustrent le surf et le voyage ; seules les
        photographies explicitement localisées représentent une destination
        précise.
      </p>
    </main>
  );
}
