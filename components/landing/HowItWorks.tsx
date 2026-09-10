import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";

const steps = [
  {
    number: "01",
    title: "Dis-nous comment\ntu surfes",
    text: "Débutant, Intermédiaire ou Expert. On part de là où tu en es.",
    icon: "wave" as const,
    annotation: "TON NIVEAU, TON TERRAIN DE JEU",
  },
  {
    number: "02",
    title: "Dis-nous quand\ntu pars",
    text: "Tes dates, ton départ, tes envies. Les saisons sont comparées à ton voyage.",
    icon: "calendar" as const,
    annotation: "LE BON TIMING CHANGE TOUT",
  },
  {
    number: "03",
    title: "Choisis ton\nprochain spot",
    text: "Découvre les destinations pertinentes. Comprends pourquoi. Et prépare ta planche.",
    icon: "pin" as const,
    annotation: "IL N’Y A PLUS QU’À PARTIR",
  },
];

export function HowItWorks() {
  return (
    <section
      className="how-section"
      id="comment-ca-marche"
      aria-labelledby="how-title"
    >
      <div className="container">
        <Reveal>
          <div className="section-heading">
            <div>
              <p className="eyebrow">UNE ENVIE. TROIS ÉTAPES. UN DÉPART.</p>
              <h2 id="how-title">
                L’océan est grand.
                <br />
                On t’aide à choisir.
              </h2>
            </div>
            <p className="section-heading-note">
              Tu connais tes envies.
              <br />
              On connaît le chemin.
            </p>
          </div>
          <div className="how-steps">
            <svg
              className="how-route"
              viewBox="0 0 1000 70"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path d="M15 35C150 35 175 5 333 35S520 65 666 35s190-20 318 0" />
            </svg>
            {steps.map((step) => (
              <div className="how-step" key={step.number}>
                <div className="step-number">
                  {step.number}
                  <span>
                    <Icon name={step.icon} size={22} />
                  </span>
                </div>
                <h3>
                  {step.title.split("\n").map((line, index) => (
                    <span key={line}>
                      {index > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </h3>
                <p>{step.text}</p>
                <span className="step-annotation">{step.annotation}</span>
              </div>
            ))}
          </div>
          <p className="how-reassurance">
            <Icon name="compass" size={18} />
            Pas de destination choisie au hasard. La même recherche produit
            toujours les mêmes résultats.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
