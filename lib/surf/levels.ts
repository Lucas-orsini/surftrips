export const LEVEL_ORDER = {
  debutant: 0,
  intermediaire: 1,
  expert: 2,
} as const;
export type SurfLevel = keyof typeof LEVEL_ORDER;
export const SURF_LEVELS = Object.keys(LEVEL_ORDER) as SurfLevel[];
export const LEVEL_LABELS: Record<SurfLevel, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  expert: "Expert",
};
export function isSurfLevel(value: unknown): value is SurfLevel {
  return typeof value === "string" && Object.hasOwn(LEVEL_ORDER, value);
}
export function canSurf(user: SurfLevel, minimum: SurfLevel): boolean {
  return (
    isSurfLevel(user) &&
    isSurfLevel(minimum) &&
    LEVEL_ORDER[user] >= LEVEL_ORDER[minimum]
  );
}
