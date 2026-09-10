import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export function InspirationSection() {
  return (
    <section
      className="inspiration-section"
      aria-labelledby="inspiration-title"
    >
      <Image
        src="/images/inspiration.jpg"
        alt="Un surfeur rejoint l’océan, sa planche sous le bras, dans la lumière du soir"
        fill
        sizes="(max-width: 760px) calc(100vw - 24px), calc(100vw - 48px)"
      />
      <div className="inspiration-shade" />
      <div className="container inspiration-content">
        <p className="eyebrow">QUELQUE PART, UNE VAGUE T’ATTEND.</p>
        <h2 id="inspiration-title">
          Moins de temps
          <br />à chercher.
          <br />
          <span>
            Plus de temps
            <br className="mobile-break" /> à surfer.
          </span>
        </h2>
        <Link className="button button-white" href="/destinations">
          Explorer les destinations
          <Icon name="arrow" size={19} />
        </Link>
        <span className="inspiration-coordinate">
          8.647° S · 115.138° E — CANGGU, BALI
        </span>
      </div>
    </section>
  );
}
