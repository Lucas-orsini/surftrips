import Link from "next/link";
import { Brand } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-main">
          <div>
            <Brand />
            <p>Le moteur de recherche des surf trips.</p>
          </div>
          <nav aria-label="Navigation de pied de page">
            <Link href="/destinations">Destinations</Link>
            <Link href="/#comment-ca-marche">Comment ça marche</Link>
            <Link href="/#a-propos">À propos</Link>
          </nav>
          <span className="footer-signature">
            <Icon name="wave" size={24} />
            Made for surfers.
          </span>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} surftrips.fr</span>
          <span className="footer-ocean">UN PEU PLUS PRÈS DE L’OCÉAN.</span>
          <div>
            <Link href="/mentions-legales">Mentions légales</Link>
            <Link href="/confidentialite">Confidentialité</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
