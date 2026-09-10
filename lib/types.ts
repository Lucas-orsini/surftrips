export const SURF_LEVELS = ["Débutant", "Intermédiaire", "Expert"] as const;
export type SurfLevel = (typeof SURF_LEVELS)[number];
export interface Airport {
  code: string;
  city: string;
  name: string;
  latitude: number;
  longitude: number;
}
export interface Destination {
  slug: string;
  name: string;
  country: string;
  countryCode: string;
  region: string;
  coordinates: string;
  latitude: number;
  longitude: number;
  image: string;
  imageAlt: string;
  tagline: string;
  description: string;
  levels: SurfLevel[];
  recommendedLevel: string;
  bestMonths: number[];
  shoulderMonths: number[];
  airport: Airport;
  transferMinutes: number;
  spotCount: number;
  wave: string;
  bottom: string;
  caution: string;
  spots: { name: string; level: SurfLevel; type: string }[];
}
export interface SearchCriteria {
  level: SurfLevel;
  airport: string;
  departure: string;
  returnDate: string;
  destination: string;
}
export interface SearchMatch {
  destination: Destination;
  score: number;
  reasons: string[];
  season: "good" | "variable" | "off";
  distanceKm: number;
}
