import { AIRPORTS } from "@/lib/airports";
import { SURF_LEVELS, LEVEL_LABELS } from "@/lib/surf/levels";
import { dateBounds } from "@/lib/validation/dates";
import type { SearchCriteria } from "@/lib/types";
export function BookingForm({
  zoneId,
  criteria,
}: {
  zoneId: string;
  criteria?: SearchCriteria;
}) {
  const { today, maximum } = dateBounds();
  return (
    <form
      action={`/destination/${encodeURIComponent(zoneId)}#reservation`}
      method="get"
      className="booking-form"
      aria-label="Préparer le vol pour cette destination"
    >
      <label>
        Aéroport de départ
        <select
          name="origine"
          defaultValue={criteria?.origine || "PAR"}
          required
        >
          {AIRPORTS.map((a) => (
            <option value={a.code} key={a.code}>
              {a.city} — {a.code}
            </option>
          ))}
        </select>
      </label>
      <label>
        Date aller
        <input
          name="dateDepart"
          type="date"
          min={today}
          max={maximum}
          defaultValue={criteria?.dateDepart}
          required
        />
      </label>
      <label>
        Date retour
        <input
          name="dateRetour"
          type="date"
          min={today}
          max={maximum}
          defaultValue={criteria?.dateRetour}
          required
        />
      </label>
      <label>
        Niveau de surf
        <select
          name="niveau"
          defaultValue={criteria?.niveau || "intermediaire"}
          required
        >
          {SURF_LEVELS.map((level) => (
            <option value={level} key={level}>
              {LEVEL_LABELS[level]}
            </option>
          ))}
        </select>
      </label>
      <button className="button" type="submit">
        {criteria ? "Actualiser mon vol" : "Voir les vols"}
      </button>
    </form>
  );
}
