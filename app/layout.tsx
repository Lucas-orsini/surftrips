import type { Metadata, Viewport } from "next";
import { Syne, DM_Sans } from "next/font/google";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://surftrips.fr",
  ),
  title: {
    default: "Surftrips.fr — Le bon spot. Au bon moment.",
    template: "%s | Surftrips.fr",
  },
  description:
    "Trouve ta prochaine destination de surf selon ton niveau, tes dates et ton aéroport de départ. Compare les saisons et les spots. Gratuit, sans inscription.",
  applicationName: "Surftrips.fr",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Surftrips.fr",
    title: "Le bon spot. Au bon moment.",
    description: "Ton niveau, tes dates, ton prochain surf trip.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Surftrips.fr — Le bon spot. Au bon moment.",
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};
export const viewport: Viewport = {
  themeColor: "#FCFEFF",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${dmSans.variable}`}
    >
      <body>
        <a href="#main-content" className="skip-link">
          Aller au contenu
        </a>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
