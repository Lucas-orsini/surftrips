import type { SurfLevel } from "./surf/levels.ts";
import type { SeasonStatus, SeasonMonth } from "./surf/season.ts";
export type { SurfLevel } from "./surf/levels.ts";
export interface Airport {
  code: string;
  city: string;
  name: string;
  latitude: number;
  longitude: number;
}
export interface SearchCriteria {
  niveau: SurfLevel;
  origine: string;
  dateDepart: string;
  dateRetour: string;
  region?: string;
}
export interface SurfSpot {
  spotId: string;
  name: string;
  zoneId: string;
  minimumLevel: SurfLevel | null;
  idealLevel: SurfLevel | null;
  minimumNeedsReview: boolean;
  idealNeedsReview: boolean;
  startMonth: number | null;
  endMonth: number | null;
  season: string | null;
  wave: string | null;
  bottom: string | null;
  notes: string | null;
  caution: string | null;
}
export interface Zone {
  zoneId: string;
  name: string;
  country: string;
  airportCode: string | null;
  airportAlternative: string | null;
  airportName: string | null;
  transfer: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  spots: SurfSpot[];
}
export interface Destination extends Zone {
  image?: string;
  imageAlt?: string;
  coordinates?: string;
  timeline: SeasonMonth[];
  seasonStatus: SeasonStatus | null;
  levelLabel: string;
  compatibleSpots: number;
}
export interface SearchDestination extends Destination {
  score: number;
}
export interface DataIssue {
  entity: "spots" | "zones";
  id: string;
  field: string;
  value: unknown;
}
export interface MapPoint {
  zoneId: string;
  name: string;
  country: string;
  airport: string | null;
  iata: string | null;
  transfer: string | null;
  x: number;
  y: number;
}
