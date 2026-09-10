import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function NotFound() {
  return (
    <main id="main-content" className="container not-found">
      <p className="eyebrow">404 · UN PETIT DÉTOUR</p>
      <Icon name="wave" size={56} />
      <h1>
        Cette vague
        <br />
        nous a échappé.
      </h1>
      <p>La page n’existe pas, mais ton prochain surf trip est toujours là.</p>
      <Link href="/" className="button">
        Revenir au départ
        <Icon name="arrow" size={18} />
      </Link>
    </main>
  );
}
