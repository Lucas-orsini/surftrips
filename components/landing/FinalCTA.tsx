import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";

export function FinalCTA() {
  return (
    <section className="final-cta" aria-labelledby="final-title">
      <svg
        className="bathymetry"
        viewBox="0 0 1200 460"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        {Array.from({ length: 9 }, (_, i) => (
          <path
            key={i}
            d={`M${-190 + i * 24} -40C${430 + i * 21} -100 ${-240 + i * 33} 520 ${420 + i * 35} 530S${580 + i * 50} 130 1320 ${260 + i * 21}`}
          />
        ))}
      </svg>
      <Reveal className="container final-content">
        <Icon name="wave" size={38} />
        <p className="eyebrow">LE PROCHAIN DÉPART, C’EST LE TIEN.</p>
        <h2 id="final-title">
          Où est-ce que tu vas
          <br />
          surfer ensuite ?
        </h2>
        <p>Entre ton niveau, tes dates et ton départ. On s’occupe du reste.</p>
        <Link href="/#recherche" className="button">
          Trouver mon surf trip
          <Icon name="arrow" size={20} />
        </Link>
        <span className="final-microcopy">
          Gratuit. Sans inscription. Juste l’envie de partir.
        </span>
      </Reveal>
    </section>
  );
}
