import type { Airport } from "./types.ts";

// Departure whitelist, intentionally non-exhaustive; independent of arrival airports.
export const AIRPORTS: Airport[] = [
  {
    code: "PAR",
    city: "Paris",
    name: "Tous les aéroports",
    latitude: 48.8566,
    longitude: 2.3522,
  },
  {
    code: "CDG",
    city: "Paris",
    name: "Charles de Gaulle",
    latitude: 49.0097,
    longitude: 2.5479,
  },
  {
    code: "ORY",
    city: "Paris",
    name: "Orly",
    latitude: 48.7262,
    longitude: 2.3652,
  },
  {
    code: "BOD",
    city: "Bordeaux",
    name: "Mérignac",
    latitude: 44.8283,
    longitude: -0.7156,
  },
  {
    code: "LYS",
    city: "Lyon",
    name: "Saint-Exupéry",
    latitude: 45.7256,
    longitude: 5.0811,
  },
  {
    code: "MRS",
    city: "Marseille",
    name: "Provence",
    latitude: 43.4393,
    longitude: 5.2214,
  },
  {
    code: "NTE",
    city: "Nantes",
    name: "Atlantique",
    latitude: 47.1532,
    longitude: -1.6107,
  },
  {
    code: "NCE",
    city: "Nice",
    name: "Côte d’Azur",
    latitude: 43.6584,
    longitude: 7.2159,
  },
  {
    code: "TLS",
    city: "Toulouse",
    name: "Blagnac",
    latitude: 43.6291,
    longitude: 1.3638,
  },
  {
    code: "BIQ",
    city: "Biarritz",
    name: "Pays Basque",
    latitude: 43.4684,
    longitude: -1.5233,
  },
  {
    code: "GVA",
    city: "Genève",
    name: "Genève Aéroport",
    latitude: 46.2381,
    longitude: 6.1089,
  },
  {
    code: "BRU",
    city: "Bruxelles",
    name: "Brussels Airport",
    latitude: 50.901,
    longitude: 4.4856,
  },
];
