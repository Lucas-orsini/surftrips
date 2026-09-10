"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/ui/Brand";
import { Icon } from "@/components/ui/Icon";

const links = [
  { label: "Destinations", href: "/destinations" },
  { label: "Comment ça marche", href: "/#comment-ca-marche" },
  { label: "Les spots", href: "/#les-spots" },
  { label: "À propos", href: "/#a-propos" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const menuButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const update = () =>
      setScrolled(window.scrollY > Math.min(window.innerHeight * 0.8, 650));
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  useEffect(() => {
    if (!menuOpen) return;
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [menuOpen]);
  return (
    <header
      className={`navbar ${scrolled ? "navbar-scrolled" : ""} ${menuOpen ? "navbar-open" : ""}`}
    >
      <div className="container navbar-inner">
        <Brand />
        <nav className="desktop-nav" aria-label="Navigation principale">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          className="button nav-cta"
          href="/#recherche"
          aria-label="Trouver mon surf trip"
        >
          <span className="nav-label-desktop">Trouver mon surf trip</span>
          <span className="nav-label-mobile">Mon surf trip</span>
          <Icon name="arrow" size={17} />
        </Link>
        <button
          className="mobile-menu-toggle icon-button"
          type="button"
          ref={menuButton}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? "close" : "menu"} size={25} />
        </button>
      </div>
      {menuOpen && (
        <nav
          id="mobile-navigation"
          className="mobile-nav"
          aria-label="Navigation mobile"
        >
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
              <Icon name="diagonal" size={18} />
            </Link>
          ))}
          <Link
            className="button"
            href="/#recherche"
            onClick={() => setMenuOpen(false)}
          >
            Trouver mon surf trip
            <Icon name="arrow" size={18} />
          </Link>
        </nav>
      )}
    </header>
  );
}
