import Link from "next/link";

export function Brand() {
  return (
    <Link href="/" className="brand" aria-label="surftrips.fr — accueil">
      surftrips<span>.fr</span>
      <svg viewBox="0 0 36 8" fill="none" aria-hidden="true">
        <path
          d="M1 5C7 5 7 1 13 1s6 4 12 4 6-4 10-4"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </Link>
  );
}
