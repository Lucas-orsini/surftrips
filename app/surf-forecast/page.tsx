import Link from "next/link";
import { pageMetadata, canonicalUrl, serializeJsonLd } from "@/lib/seo";
import { FORECAST_SOURCES, SURF_FORECAST } from "@/lib/editorial/surf-forecast";
import styles from "./surf-forecast.module.css";

export const metadata = pageMetadata(
  SURF_FORECAST.title,
  SURF_FORECAST.description,
  SURF_FORECAST.path,
);

const contents = [
  ["les-donnees", "Les cinq repères"],
  ["lire-une-prevision", "La méthode de lecture"],
  ["exemple", "Un exemple expliqué"],
  ["previsions-et-saisons", "Prévisions et saisons"],
  ["preparer-son-voyage", "Préparer son voyage"],
] as const;

export default function SurfForecastPage() {
  return (
    <main id="main-content" className={`theme-page ${styles.page}`}>
      <article className="surf-article" aria-labelledby="article-title">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd({
              "@context": "https://schema.org",
              "@type": "WebPage",
              "@id": canonicalUrl(SURF_FORECAST.path),
              url: canonicalUrl(SURF_FORECAST.path),
              name: SURF_FORECAST.heading,
              description: SURF_FORECAST.description,
              inLanguage: "fr",
              isPartOf: { "@id": canonicalUrl("/#website") },
            }),
          }}
        />
        <nav aria-label="Fil d’Ariane" className="article-breadcrumb">
          <Link href="/">Accueil</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Surf forecast</span>
        </nav>

        <header className="article-header">
          <p className="eyebrow">LE GUIDE DES PRÉVISIONS</p>
          <h1 id="article-title">{SURF_FORECAST.heading}</h1>
          <p className="article-deck">{SURF_FORECAST.introduction}</p>
          <p className={styles.scope}>
            Ce guide t’aide à les interpréter. Surftrips ne fournit pas de
            prévisions actualisées : son moteur compare les destinations selon
            ton voyage et les saisons renseignées.
          </p>
          <a className="text-link article-intro-cta" href="#exemple">
            Voir l’exemple expliqué
          </a>
        </header>

        <figure className={styles.figure} aria-labelledby="wave-caption">
          <div className={styles.waveHeading}>
            <p className="eyebrow">DEUX MESURES, DEUX QUESTIONS</p>
            <p>
              Quelle hauteur ?<br />
              Quel rythme ?
            </p>
          </div>
          <svg
            viewBox="0 0 600 240"
            role="img"
            aria-labelledby="wave-title wave-description"
          >
            <title id="wave-title">
              Hauteur et période d’une onde simplifiée
            </title>
            <desc id="wave-description">
              À un point fixe, la surface monte et descend au fil du temps. La
              hauteur se mesure du creux à la crête. La période sépare le
              passage de deux crêtes successives. Schéma sans échelle.
            </desc>
            <path
              d="M0 130 H600"
              stroke="currentColor"
              strokeOpacity=".3"
              strokeDasharray="5 8"
            />
            <path
              d="M0 130 Q50 10 100 130 T200 130 T300 130 T400 130 T500 130 T600 130"
              fill="none"
              stroke="#80d9d1"
              strokeWidth="4"
            />
            <path
              d="M50 70 V32 H250 V70 M450 70 H485 V190 H350"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle cx="50" cy="70" r="5" fill="currentColor" />
            <circle cx="250" cy="70" r="5" fill="currentColor" />
            <text
              x="150"
              y="23"
              textAnchor="middle"
              fill="currentColor"
              fontSize="24"
            >
              Période
            </text>
            <text x="494" y="138" fill="currentColor" fontSize="24">
              Hauteur
            </text>
          </svg>
          <figcaption id="wave-caption">
            Schéma pédagogique sans échelle : évolution de la surface au même
            endroit, au fil du temps. Ce dessin ne représente aucune prévision.
          </figcaption>
        </figure>

        <nav
          className={`article-prose ${styles.contents}`}
          aria-label="Dans ce guide"
        >
          <p className="eyebrow">DANS CE GUIDE</p>
          <ol>
            {contents.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <section
          id="les-donnees"
          className={`article-prose ${styles.section}`}
          aria-labelledby="data-title"
        >
          <h2 id="data-title">Les données essentielles d’un surf forecast</h2>
          <p>
            Commence par identifier ce que le service affiche : un état de mer
            calculé au large, une estimation des vagues au bord ou une
            observation. Une bouée et un modèle ne racontent pas exactement la
            même chose. Les unités et la légende font partie de la lecture.
          </p>
          <h3>Hauteur : la houle n’est pas la vague surfée</h3>
          <p>
            La hauteur de houle au large ne correspond pas nécessairement à
            celle des vagues qui déferlent sur la plage. En approchant du bord,
            les vagues se transforment selon les fonds, la profondeur et
            l’exposition. Ne convertis pas automatiquement « 1 m de houle » en «
            1 m à surfer ».
          </p>
          <p>
            La hauteur significative résume un ensemble de vagues ; elle
            n’indique pas une hauteur maximale. Certaines séries peuvent être
            plus grandes. Vérifie aussi si la valeur concerne toute la mer ou
            seulement une composante de houle.
          </p>
          <h3>Période : le temps entre les vagues</h3>
          <p>
            Exprimée en secondes, la période décrit le rythme de passage des
            vagues à un point fixe. Les services peuvent afficher une période
            moyenne ou une période de pic, liée à la composante la plus
            énergétique. Deux colonnes portant des définitions différentes ne se
            comparent pas directement.
          </p>
          <p>
            À hauteur comparable, une période plus longue peut modifier
            fortement la façon dont la houle arrive et déferle. Elle ne garantit
            ni de meilleures vagues ni des conditions adaptées à ton niveau :
            l’orientation, le fond et le vent comptent aussi.
          </p>
          <h3>Direction : le spot reçoit-il cette houle ?</h3>
          <p>
            Une houle d’ouest vient de l’ouest. Une plage ouverte dans cette
            direction et une baie masquée par un cap ne la reçoivent pas de la
            même façon. Regarde l’exposition du spot et les obstacles, puis la
            convention des flèches du service : indiquent-elles la provenance ou
            le déplacement ?
          </p>
          <p className={styles.source}>
            Pour les définitions :{" "}
            <a href={FORECAST_SOURCES[0].href}>
              paramètres des vagues, Copernicus Marine
            </a>{" "}
            et <a href={FORECAST_SOURCES[1].href}>houle et surf, Surfline</a>.
          </p>
          <h3>Vent : une direction relative à la côte</h3>
          <dl className={styles.wind}>
            <div>
              <dt>Offshore</dt>
              <dd>
                De la terre vers la mer. Il peut aider la vague à garder sa
                forme ; sa force reste déterminante.
              </dd>
            </div>
            <div>
              <dt>Onshore</dt>
              <dd>
                De la mer vers la terre. Il peut rendre la surface plus agitée
                et désorganiser les vagues.
              </dd>
            </div>
            <div>
              <dt>Cross-shore</dt>
              <dd>
                Le long de la côte. Son effet dépend de l’angle du vent et de la
                configuration du spot.
              </dd>
            </div>
          </dl>
          <p>
            Un vent d’est n’est donc pas offshore partout. Lis sa vitesse, ses
            rafales et son évolution pendant la session. Le relief et les effets
            locaux peuvent créer des écarts avec le modèle, comme l’explique{" "}
            <a href={FORECAST_SOURCES[3].href}>
              Surfline sur le vent prévu et observé
            </a>
            .
          </p>
          <h3>Marée : une question locale</h3>
          <p>
            La marée change la profondeur sur les fonds et peut modifier le
            déferlement, les courants et l’accès à la plage. Il n’existe pas de
            marée universellement idéale pour surfer. Lis l’heure, la hauteur
            d’eau et le sens de variation, puis vérifie les repères propres au
            spot. Une hauteur de marée dépend de sa référence : elle n’est pas
            la profondeur sous ta planche.
          </p>
          <p>
            À{" "}
            <Link href="/destination/biarritz" prefetch={false}>
              Biarritz
            </Link>
            , la Côte des Basques donne un exemple concret : la plage peut
            disparaître à marée haute, comme le précise la{" "}
            <a href={FORECAST_SOURCES[5].href}>Ville de Biarritz</a>. Le
            calendrier saisonnier ne répond pas à cette question d’accès.
          </p>
        </section>

        <section
          id="lire-une-prevision"
          className={`article-prose ${styles.section}`}
          aria-labelledby="method-title"
        >
          <h2 id="method-title">Comment interpréter une prévision de surf ?</h2>
          <p>
            Lis une fenêtre de session complète, plutôt qu’une seule case
            colorée.
          </p>
          <ol className={styles.method}>
            <li>
              <strong>Vérifie le lieu et le temps.</strong> Bon spot, date de
              validité, fuseau horaire local, dernière mise à jour et unités.
              L’heure de consultation n’est pas celle du calcul du modèle.
            </li>
            <li>
              <strong>Croise hauteur, période et direction.</strong> Identifie
              les différentes houles si le service les sépare. Une hausse de
              hauteur ne suffit pas à conclure que le spot fonctionnera.
            </li>
            <li>
              <strong>Lis le vent et la marée sur le même créneau.</strong> Une
              matinée et un après-midi peuvent avoir des configurations
              différentes. Vérifie aussi les possibilités d’accès et de sortie.
            </li>
            <li>
              <strong>Confronte la prévision au terrain.</strong> Reconsulte les
              mises à jour à l’approche de la session, puis les observations
              disponibles et les consignes locales. En cas de doute sur ton
              niveau ou les conditions, demande conseil sur place.
            </li>
          </ol>
          <p>
            Une prévision à plusieurs jours donne une tendance, pas un
            rendez-vous garanti. Si les modèles divergent ou changent d’un
            calcul à l’autre, garde ton programme souple. Une note globale ne
            remplace pas ces vérifications.
          </p>
        </section>

        <section
          id="exemple"
          className={`article-prose ${styles.section}`}
          aria-labelledby="example-title"
        >
          <p className="eyebrow">PASSER DES CHIFFRES AUX QUESTIONS</p>
          <h2 id="example-title">Même houle, deux plages, deux lectures</h2>
          <p id="example-disclaimer">
            <strong>
              Exemple fictif et illustratif, sans lieu ni date réels.
            </strong>{" "}
            Ces valeurs servent uniquement à apprendre ; ce ne sont pas des
            prévisions.
          </p>
          <dl className={styles.example} aria-describedby="example-disclaimer">
            <div>
              <dt>Houle au large</dt>
              <dd>1,2 m</dd>
            </div>
            <div>
              <dt>Période de pic</dt>
              <dd>11 s</dd>
            </div>
            <div>
              <dt>Provenance</dt>
              <dd>Ouest</dd>
            </div>
            <div>
              <dt>Vent</dt>
              <dd>Est · 10 km/h</dd>
            </div>
            <div>
              <dt>Marée</dt>
              <dd>Montante</dd>
            </div>
          </dl>
          <h3>Une plage ouverte vers l’ouest</h3>
          <p>
            La houle vient du côté exposé ; le vent d’est souffle de la terre
            vers la mer, donc offshore dans cette configuration simplifiée. Ce
            sont des indices à examiner. Il manque encore le fond, la hauteur
            d’eau, les rafales et les observations pour apprécier la session.
            Rien ne permet d’annoncer des vagues de 1,2 m au bord.
          </p>
          <h3>Une plage ouverte vers l’est, derrière un cap</h3>
          <p>
            La même houle peut être moins directement reçue, tandis que le même
            vent devient onshore. Le bulletin régional n’a pas changé ;
            l’exposition, oui. Sans connaître les fonds et les effets du cap, on
            ne peut chiffrer les vagues qui atteindront cette plage.
          </p>
          <p className={styles.takeaway}>
            La bonne question : « Comment ces données s’appliquent-elles à ce
            spot et à ma pratique ? »
          </p>
        </section>

        <section
          id="previsions-et-saisons"
          className={`article-prose ${styles.section}`}
          aria-labelledby="season-title"
        >
          <h2 id="season-title">
            Surf forecast et saison de surf : deux horizons
          </h2>
          <dl className={styles.horizons}>
            <div>
              <dt>Choisir quand partir</dt>
              <dd>
                La saisonnalité décrit les périodes habituellement favorables.
                Elle aide à sélectionner des destinations plusieurs semaines ou
                mois avant le départ.
              </dd>
            </div>
            <div>
              <dt>Préparer une session</dt>
              <dd>
                La prévision décrit une évolution attendue à court ou moyen
                terme. Elle aide à réexaminer le spot et le créneau à l’approche
                de la mise à l’eau.
              </dd>
            </div>
          </dl>
          <p>
            Une période favorable à Ericeira n’implique pas de bonnes vagues
            demain. Inversement, une session peut se présenter hors de la
            période habituelle. Les saisons de Surftrips sont des repères
            documentaires ; elles ne sont ni des mesures en direct ni des
            probabilités calculées pour chaque journée de ton séjour.
          </p>
          <p>
            Les guides{" "}
            <Link href="/ou-surfer-en/novembre">où surfer en novembre</Link> et{" "}
            <Link href="/ou-surfer-en/decembre">où surfer en décembre</Link>{" "}
            servent à dessiner une première sélection. Le bulletin du spot se
            consulte ensuite, à l’approche du voyage et sur place.
          </p>
        </section>

        <section
          id="preparer-son-voyage"
          className={`article-prose ${styles.section}`}
          aria-labelledby="trip-title"
        >
          <h2 id="trip-title">
            Comment choisir une destination pour ton surf trip ?
          </h2>
          <p>
            Commence par ton niveau et tes dates. Compare ensuite les spots
            documentés, leurs saisons, l’aéroport d’arrivée et le transfert. Une
            destination peut regrouper des vagues très différentes ; un nom
            connu ne suffit pas à choisir une session.
          </p>
          <p>
            Pour un voyage au Portugal, ouvre les fiches d’
            <Link href="/destination/ericeira" prefetch={false}>
              Ericeira
            </Link>{" "}
            et de{" "}
            <Link href="/destination/peniche" prefetch={false}>
              Peniche / Baleal
            </Link>{" "}
            : les repères y sont détaillés par spot, avec les niveaux restant à
            vérifier. Le{" "}
            <Link href="/comparer/ericeira-vs-peniche">
              comparatif Ericeira ou Peniche
            </Link>{" "}
            et le <Link href="/surf/portugal">guide du Portugal</Link> aident à
            préparer ce choix. Aucun ne prédit les vagues de ton séjour.
          </p>
          <p>
            Garde des possibilités d’ajustement une fois sur place. Pour
            consulter de véritables bulletins, des services comme{" "}
            <a href="https://fr.surf-forecast.com/">Surf-Forecast</a> ou{" "}
            <a href="https://www.surf-report.com/">Surf Report</a> proposent des
            pages de spots. Vérifie leur couverture et l’horodatage des données
            ; leurs prévisions restent distinctes du moteur Surftrips.
          </p>
        </section>

        <section className="article-planning" aria-labelledby="planning-title">
          <div className="article-prose">
            <p className="eyebrow">DU BULLETIN AU VOYAGE</p>
            <h2 id="planning-title">
              La saison pour partir. Les conditions pour s’adapter.
            </h2>
            <p>
              Lis la houle avec sa période et sa direction, puis le vent et la
              marée du spot. Pour préparer le voyage en amont, saisis ton
              niveau, tes dates, ton aéroport de départ et, si tu le souhaites,
              une région dans le moteur Surftrips.
            </p>
            <Link href={SURF_FORECAST.ctaHref} className="button theme-cta">
              Trouver ma destination surf
            </Link>
          </div>
        </section>
        <footer className={`article-prose article-footer ${styles.sources}`}>
          <h2>Sources et repères de lecture</h2>
          <p>
            Définitions et documents consultés le 22 novembre 2026. Les exemples
            chiffrés et le schéma sont pédagogiques. Les liens de destinations
            renvoient au catalogue Surftrips, dont les saisons et les niveaux
            restent à lire spot par spot.
          </p>
          <ul>
            {FORECAST_SOURCES.map((source) => (
              <li key={source.href}>
                <a href={source.href}>{source.label}</a>
              </li>
            ))}
          </ul>
        </footer>
      </article>
    </main>
  );
}
