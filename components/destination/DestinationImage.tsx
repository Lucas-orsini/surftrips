"use client";
import Image from "next/image";
import { useState, type CSSProperties } from "react";
import { Icon } from "@/components/ui/Icon";
import { destinationImageAlt } from "@/lib/images/destination";

interface Props {
  src?: string | null;
  name: string;
  country: string;
  sizes: string;
  hero?: boolean;
  compact?: boolean;
  objectPosition?: CSSProperties["objectPosition"];
}

export function DestinationImage(props: Props) {
  // A new URL starts a fresh load, including during client-side navigation.
  return <ImageContent key={props.src || "no-photo"} {...props} />;
}

function ImageContent({
  src,
  name,
  country,
  sizes,
  hero = false,
  compact = false,
  objectPosition = "center",
}: Props) {
  const [state, setState] = useState<"loading" | "ready" | "fallback">(
    src ? "loading" : "fallback",
  );
  const alt = destinationImageAlt(name, country);
  return (
    <div
      className={`destination-visual${compact ? " destination-visual-compact" : ""}`}
      data-image-state={state}
    >
      {state === "fallback" || !src ? (
        <div className="destination-image-fallback" role="img" aria-label={alt}>
          <svg
            className="destination-contours"
            viewBox="0 0 800 500"
            fill="none"
            aria-hidden="true"
            preserveAspectRatio="xMidYMid slice"
          >
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <ellipse
                key={index}
                cx="670"
                cy="420"
                rx={120 + index * 60}
                ry={70 + index * 45}
                transform="rotate(-25 670 420)"
              />
            ))}
          </svg>
          <div className="destination-fallback-label">
            <Icon name="wave" size={compact ? 24 : 42} />
            {!compact && (
              <>
                <strong>{name}</strong>
                <span>{country}</span>
              </>
            )}
          </div>
        </div>
      ) : (
        <Image
          src={src}
          alt={alt}
          fill
          style={{ objectPosition }}
          sizes={sizes}
          quality={hero ? 85 : 75}
          // Next.js 16 replaces deprecated priority with preload for the LCP hero.
          preload={hero}
          loading={hero ? undefined : "lazy"}
          onLoad={() => setState("ready")}
          onError={() => setState("fallback")}
        />
      )}
    </div>
  );
}
