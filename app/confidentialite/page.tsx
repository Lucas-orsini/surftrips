import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Confidentialité",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" className="container legal-page">
      <p className="eyebrow">SURFTRIPS.FR</p>
      <h1>Confidentialité</h1>
      <p>
        La recherche fonctionne sans compte. Aucun nom, numéro de téléphone ou
        adresse e-mail n’est demandé pour consulter les destinations.
      </p>
      <h2>Tes critères de recherche</h2>
      <p>
        Ton niveau, l’aéroport sélectionné, tes dates et la destination
        souhaitée sont transmis au serveur pour afficher les résultats. Ils
        apparaissent dans l’adresse de la page : tu peux ainsi retrouver ou
        partager une recherche. Ils peuvent aussi apparaître dans l’historique
        de ton navigateur.
      </p>
      <h2>Cookies et suivi</h2>
      <p>
        Cette version n’intègre aucun outil publicitaire, service d’analyse
        d’audience ou cookie de suivi. Les images et les polices sont servies
        par le site. Le formulaire ne conserve pas de recherche dans le stockage
        local de ton navigateur.
      </p>
      <h2>Infrastructure</h2>
      <p>
        L’infrastructure d’hébergement peut traiter les informations techniques
        nécessaires à la transmission des pages, comme l’adresse IP et les
        journaux de requêtes. Les modalités et durées de conservation seront
        précisées avec le choix de l’hébergeur, avant la mise en ligne publique.
      </p>
      <h2>Nous contacter</h2>
      <p>
        {process.env.LEGAL_CONTACT_EMAIL ? (
          <a
            className="text-link"
            href={`mailto:${process.env.LEGAL_CONTACT_EMAIL}`}
          >
            {process.env.LEGAL_CONTACT_EMAIL}
          </a>
        ) : (
          "Les coordonnées du responsable du site seront ajoutées avant l’ouverture publique du service."
        )}
      </p>
    </main>
  );
}
