import "server-only";
import { getCatalog } from "./zones";
import { matchDestinations } from "../surf/matching";
import { validateSearch, type SearchParams } from "../validation/search";
import { withPhoto } from "../destinations";
export async function searchDestinations(params: SearchParams) {
  const { zones, issues } = await getCatalog();
  const countries = [...new Set(zones.map((z) => z.country))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );
  const validation = validateSearch(params, countries);
  if (!validation.success)
    return { success: false as const, error: validation.error, countries };
  const { destinations, exclusions } = matchDestinations(
    zones,
    validation.data,
  );
  // Diagnostics remain server-side. Never serialize issues or exclusions into client props.
  return {
    success: true as const,
    criteria: validation.data,
    countries,
    destinations: destinations.map(withPhoto),
    diagnostics: { issues, exclusions },
  };
}
