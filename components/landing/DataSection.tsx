import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";

export function DataSection() {
  return (
    <section
      className="data-section"
      id="a-propos"
      aria-labelledby="data-title"
    >
      <div className="container">
        <Reveal className="data-grid">
          <div>
            <p className="eyebrow">DU TERRAIN À TON PROCHAIN TRIP</p>
            <h2 id="data-title">
              Des données faites
              <br />
              pour les surfeurs.
            </h2>
            <p className="body-copy">
              La sélection ne repose pas sur des recommandations génériques.
              Chaque spot est décrit selon ce qui compte dans l’eau : niveau
              minimum, saison, type de vague, fond, accès et points de
              vigilance.
            </p>
            <p className="data-footnote">
              <Icon name="shield" size={19} />
              La vocation de Surftrips : une base enrichie progressivement par
              des données vérifiées manuellement.
            </p>
          </div>
          <div className="data-stats">
            <div>
              <span className="stat-number">
                06<span>↗</span>
              </span>
              <span className="stat-label">
                critères qui font la différence
              </span>
              <p>
                De la première mousse
                <br />à la dernière session.
              </p>
            </div>
            <div>
              <span className="stat-number">03</span>
              <span className="stat-label">niveaux, une même envie</span>
              <p>
                Débutant. Intermédiaire. Expert.
                <br />À chacun son océan.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
