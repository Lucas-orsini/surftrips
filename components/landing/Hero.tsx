import Image from "next/image";
import { SearchBar } from "@/components/search/SearchBar";
import { Icon } from "@/components/ui/Icon";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-line" />
            LE MOTEUR DE RECHERCHE POUR SURFEURS
          </p>
          <h1 id="hero-title">
            Le bon spot.
            <br />
            Au{" "}
            <span className="hero-blue">
              bon moment.
              <svg viewBox="0 0 490 18" fill="none" aria-hidden="true">
                <path
                  d="M3 12C115 2 312 1 486 9"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>
          <p className="hero-description">
            Trouve les destinations qui correspondent vraiment à ton niveau, tes
            dates et ton point de départ.
          </p>
          <p className="hero-note">
            <Icon name="wave" size={22} />
            <span>
              Des spots documentés par des surfeurs.
              <br />
              Pas des recommandations génériques.
            </span>
          </p>
          <div className="hero-bottom-note">
            <span>MOINS DE RECHERCHE. PLUS D’OCÉAN.</span>
            <a href="#destinations" aria-label="Découvrir les destinations">
              <Icon name="arrow" size={18} />
            </a>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-photo">
            <Image
              src="/images/hero.jpg"
              alt="Un surfeur suit la face d’une vague atlantique aux reflets turquoise"
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 760px) 100vw, 54vw"
              quality={85}
              className="hero-image"
            />
            <div className="photo-grain" />
            <span className="hero-image-top">TAKE THE LONG WAY HOME.</span>
            <div className="hero-location">
              <span className="location-cross">+</span>
              <span>
                À l’heure de l’Atlantique
                <small>UNE VAGUE. UN DÉPART. TON PROCHAIN TRIP.</small>
              </span>
            </div>
            <span className="hero-photo-number">01 / 03</span>
          </div>
          <div className="hero-postcard">
            <div className="postcard-photo">
              <Image
                src="/images/ericeira.jpg"
                alt="La côte portugaise, une invitation au prochain surf trip"
                fill
                sizes="220px"
              />
            </div>
            <div className="postcard-caption">
              <span>Ericeira, Portugal</span>
              <Icon name="diagonal" size={15} />
            </div>
            <span className="postcard-coordinates">38.963° N · 9.417° W</span>
          </div>
          <svg
            className="hero-route"
            viewBox="0 0 240 160"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5 145C75 155 157 107 155 54 153 7 91 22 116 52c23 28 82-3 109-43"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="4 5"
            />
            <path d="m216 10 11-3-3 12" stroke="currentColor" />
          </svg>
          <div className="ocean-stamp">
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <defs>
                <path
                  id="stamp-circle"
                  d="M50 50m-36 0a36 36 0 1 1 72 0a36 36 0 1 1-72 0"
                />
              </defs>
              <text>
                <textPath href="#stamp-circle">
                  SOMEWHERE · THERE’S A WAVE FOR YOU ·{" "}
                </textPath>
              </text>
            </svg>
            <Icon name="wave" size={28} />
          </div>
        </div>
      </div>
      <div className="container hero-search">
        <SearchBar />
      </div>
    </section>
  );
}
