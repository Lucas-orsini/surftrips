import Link from "next/link";
import type { Zone } from "@/lib/types";
import type { Theme } from "@/lib/editorial/themes";
import { contextualThemes } from "@/lib/editorial/themes";
import {
  articleHighlights,
  articlePeriod,
} from "@/lib/editorial/theme-articles";
import { serializeJsonLd, thematicStructuredData } from "@/lib/seo";
import { SearchBar } from "@/components/search/SearchBar";
import { Icon } from "@/components/ui/Icon";
import { ArticleDestination, ArticlePhoto } from "./ArticleDestination";

export function ThemePage({
  theme,
  catalog,
}: {
  theme: Theme;
  catalog: Zone[];
  destinations: Zone[];
}) {
  const related = contextualThemes(theme, catalog);
  const highlights = articleHighlights(theme, catalog);
  const primary = highlights.filter((h) => !h.compact);
  const secondary = highlights.filter((h) => h.compact);
  const hero =
    theme.kind === "country" || theme.kind === "comparison"
      ? primary.find((h) => h.zone.zoneId === "peniche")
      : primary[0];
  const ctaHref =
    theme.kind === "country"
      ? "#recherche"
      : theme.kind === "comparison" && related.length
        ? `${related[0].path}#recherche`
        : "/destinations#recherche";
  const compare =
    theme.kind === "comparison" && primary.length === 2 ? primary : null;
  return (
    <main id="main-content" className="theme-page">
      <article className="surf-article" aria-labelledby="article-title">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              thematicStructuredData(
                theme,
                highlights.map((h) => h.zone),
              ),
            ),
          }}
        />
        <nav aria-label="Fil d’Ariane" className="article-breadcrumb">
          <Link href="/">Accueil</Link>
          <span aria-hidden="true">/</span>
          <Link href="/destinations">Destinations</Link>
        </nav>
        <header className="article-header">
          <p className="eyebrow">
            {theme.kind === "comparison" ? "LE CHOIX DU VOYAGE" : "GUIDE SURF"}
          </p>
          <h1 id="article-title">{theme.heading}</h1>
          <p className="article-deck">{theme.introduction}</p>
          <Link href={ctaHref} className="text-link article-intro-cta">
            {theme.cta}
            <Icon name="arrow" size={18} />
          </Link>
        </header>
        {hero && <ArticlePhoto zone={hero.zone} hero />}
        <div className="article-prose article-introduction">
          <p>
            {theme.id === "novembre"
              ? "Novembre ne raconte pas la même histoire sur toutes les côtes. Cette sélection met en regard une période qui se termine, d’autres qui continuent et une option de transition. L’idée : choisir quelques pistes à approfondir, puis vérifier leur correspondance avec ta pratique."
              : theme.id === "decembre"
                ? "Un départ en décembre peut coïncider avec le début d’une saison ou s’inscrire dans une période déjà engagée. Fernando de Noronha et Mompiche illustrent le premier cas ; Jardim do Mar et Ericeira, le second. Le changement d’année ne coupe pas leur calendrier en deux."
                : theme.kind === "country"
                  ? "Pour dessiner ton voyage, pars d’un spot puis regarde l’arrivée. Ericeira et Peniche partagent Lisbonne comme aéroport de référence ; Jardim do Mar renvoie vers Funchal. Ces accès, les périodes et les niveaux des spots aident à choisir une escale sans décider d’un itinéraire à ta place."
                  : "Comparer Ericeira et Peniche a du sens lorsqu’on regarde des spots précis. Les fiches Surftrips donnent ici deux points d’entrée : Coxos et Supertubos. Leur différence compte davantage qu’un classement entre les destinations."}
          </p>
          {theme.kind === "month" && (
            <p className="article-method">
              Une sélection éditoriale parmi les destinations de Surftrips,
              fondée sur les saisons des spots cités. Les périodes renseignées
              sont des repères, jamais une prévision ni une garantie de vagues.
            </p>
          )}
        </div>
        <div id="destinations">
          {primary.map((highlight) => (
            <ArticleDestination
              key={highlight.zone.zoneId}
              highlight={highlight}
              photographedAbove={highlight === hero}
            />
          ))}
          {!!secondary.length && (
            <section
              className="article-other-ideas"
              aria-labelledby="other-ideas-title"
            >
              <div className="article-prose">
                <h2 id="other-ideas-title">Deux autres pistes au Portugal</h2>
              </div>
              {secondary.map((highlight) => (
                <ArticleDestination
                  key={highlight.zone.zoneId}
                  highlight={highlight}
                />
              ))}
            </section>
          )}
        </div>
        <section
          className="article-prose article-choice"
          aria-labelledby="article-choice-title"
        >
          <h2 id="article-choice-title">
            {theme.kind === "month"
              ? "Le bon départ commence par ton niveau"
              : theme.kind === "country"
                ? "Préparer l’arrivée, garder le choix ouvert"
                : "Ce qui peut faire pencher ton choix"}
          </h2>
          {compare ? (
            <>
              <p>
                Pour le surf, commence par le type de vague et le niveau du
                spot. Les autres spots d’Ericeira restent à découvrir sur sa
                fiche.
                {compare[0].zone.spots.some((s) => s.idealNeedsReview) &&
                  " Un niveau idéal y est encore à vérifier."}{" "}
                Aucune des deux zones ne peut être qualifiée globalement de
                facile.
              </p>
              <p>
                {articlePeriod(compare[0].spot) ===
                articlePeriod(compare[1].spot)
                  ? `Pour la saison, les deux spots comparés partagent la période ${articlePeriod(compare[0].spot)}. Tes dates seules ne suffisent donc pas à les départager.`
                  : `Pour la saison, la période renseignée est ${articlePeriod(compare[0].spot)} pour ${compare[0].spot.name} et ${articlePeriod(compare[1].spot)} pour ${compare[1].spot.name}. Compare ces repères avec tes dates de voyage.`}
              </p>
              <p>
                Pour l’accès, les deux fiches indiquent{" "}
                {compare[0].zone.airportName} ({compare[0].zone.airportCode}).
                Le transfert renseigné est « {compare[0].zone.transfer} » pour
                Ericeira et « {compare[1].zone.transfer} » pour Peniche. Ces
                indications aident à préparer l’arrivée ; elles ne sont ni des
                horaires ni des temps garantis.
              </p>
            </>
          ) : theme.kind === "country" ? (
            <>
              <p>
                Les fiches détaillées rassemblent les transferts indiqués pour
                chaque zone. Consulte-les avant de retenir un aéroport :
                partager une arrivée ne signifie pas partager le même trajet.
              </p>
              <p>
                Un calendrier de surf reste propre au spot concerné. Croise-le
                avec ton niveau et tes dates, puis garde la possibilité
                d’ajuster ton programme aux conditions réelles.
              </p>
            </>
          ) : (
            <>
              <p>
                Une période favorable ne rend pas un spot adapté à tous les
                surfeurs. Lis le niveau minimum et les éventuels points à
                vérifier sur la fiche, puis confronte ces informations aux
                conditions sur place. Un idéal historique non validé ne devient
                pas une recommandation pour débutants.
              </p>
              <p>
                {theme.id === "novembre"
                  ? "Si ton voyage déborde sur décembre, refais la recherche avec les dates complètes : La Gravière et Uluwatu n’ont pas le même calendrier que Coxos ou The Bay. Les autres destinations du catalogue restent accessibles dans le moteur."
                  : "Pour un séjour qui se poursuit en janvier, saisis tout le voyage dans le moteur. Les saisons qui traversent l’année restent prises en compte ; tu pourras aussi explorer d’autres destinations que ces quatre escales."}
              </p>
            </>
          )}
        </section>
        <section
          className="article-planning"
          aria-labelledby="personalize-title"
        >
          <div className="article-prose">
            <p className="eyebrow">À TOI DE CHOISIR</p>
            <h2 id="personalize-title">De l’inspiration au départ.</h2>
            <p>
              {theme.kind === "country"
                ? "Le Portugal est déjà sélectionné. Ajoute ton aéroport de départ, ton niveau et tes dates pour trouver les destinations qui correspondent à ton voyage."
                : "Garde les escales qui te parlent, puis ajoute tes dates, ton aéroport et ton niveau. Surftrips t’aide à passer de ces premières pistes à un voyage qui te correspond."}
            </p>
            {theme.kind !== "country" && (
              <Link href={ctaHref} className="button theme-cta">
                {theme.cta}
                <Icon name="arrow" size={18} />
              </Link>
            )}
          </div>
          {theme.kind === "country" && (
            <SearchBar
              countries={[...new Set(catalog.map((zone) => zone.country))].sort(
                (a, b) => a.localeCompare(b, "fr"),
              )}
              initialValues={{ region: theme.country }}
            />
          )}
        </section>
        <footer className="article-prose article-footer">
          <p className="article-source">
            Sources : données de destinations, de spots et d’accès du catalogue
            Surftrips. Les fiches liées conservent les détails et les points à
            vérifier. Les photos illustrent les lieux, pas les conditions d’un
            mois donné.
          </p>
          {!!related.length && (
            <aside
              className="theme-contextual"
              aria-label="Poursuivre la lecture"
            >
              <p className="eyebrow">POUR POURSUIVRE LA LECTURE</p>
              {related.map((other) => (
                <Link className="text-link" key={other.id} href={other.path}>
                  {other.linkLabel}
                  <Icon name="arrow" size={18} />
                </Link>
              ))}
            </aside>
          )}
        </footer>
      </article>
    </main>
  );
}
