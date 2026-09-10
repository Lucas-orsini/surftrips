import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";

export function EditorialSection() {
  return (
    <section
      className="section container editorial-section"
      id="les-spots"
      aria-labelledby="editorial-title"
    >
      <Reveal className="editorial-image-wrap" image>
        <div className="editorial-photo">
          <Image
            src="/images/canggu.jpg"
            alt="Des surfeurs glissent sur une vague à Canggu dans la lumière du soir"
            fill
            sizes="(max-width: 760px) 90vw, 42vw"
          />
          <span className="vertical-caption">
            FIELD NOTES — BALI, INDONÉSIE
          </span>
        </div>
        <div className="spot-note">
          <span className="eyebrow">LE DÉTAIL QUI CHANGE TOUT</span>
          <div>
            <Icon name="pin" size={20} />
            <strong>Batu Bolong</strong>
            <span>Canggu, Bali</span>
          </div>
          <p>Le bon spot commence là où le guide s’arrête.</p>
        </div>
      </Reveal>
      <Reveal className="editorial-copy">
        <p className="eyebrow">PAS JUSTE UNE LISTE DE DESTINATIONS</p>
        <h2 id="editorial-title">
          Bali est une destination.
          <br />
          <span className="text-ocean">
            Canggu est
            <br className="desktop-break" /> une réponse.
          </span>
        </h2>
        <p className="body-copy">
          Un guide peut te dire que Bali est une destination de surf. Surftrips
          regarde ton niveau, la période de ton voyage et les spots réellement
          accessibles pour t’orienter vers la bonne zone.
        </p>
        <div className="editorial-criteria">
          <span>
            <i>01</i>Niveau
          </span>
          <span>
            <i>02</i>Saison
          </span>
          <span>
            <i>03</i>Type de vague
          </span>
          <span>
            <i>04</i>Fond
          </span>
          <span>
            <i>05</i>Transfert
          </span>
          <span>
            <i>06</i>Spots accessibles
          </span>
        </div>
        <Link href="/#recherche" className="text-link">
          Trouver ce qui me correspond
          <Icon name="arrow" size={18} />
        </Link>
      </Reveal>
    </section>
  );
}
