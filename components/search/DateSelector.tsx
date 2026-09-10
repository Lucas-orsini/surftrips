"use client";
import { dateBounds } from "@/lib/validation/dates";

export function DateSelector({
  departure,
  returnDate,
  onChange,
  onDone,
}: {
  departure: string;
  returnDate: string;
  onChange: (departure: string, returnDate: string) => void;
  onDone: () => void;
}) {
  const { today, maximum } = dateBounds();
  return (
    <div className="date-selector">
      <p>Quelques jours ou quelques semaines. À toi de voir.</p>
      <label>
        Départ
        <input
          type="date"
          max={maximum}
          aria-label="Date de départ"
          value={departure}
          min={today}
          onChange={(event) =>
            onChange(
              event.target.value,
              returnDate && returnDate <= event.target.value ? "" : returnDate,
            )
          }
        />
      </label>
      <label>
        Retour
        <input
          type="date"
          max={maximum}
          aria-label="Date de retour"
          value={returnDate}
          min={departure || today}
          onChange={(event) => onChange(departure, event.target.value)}
        />
      </label>
      <button
        type="button"
        className="button button-small"
        disabled={!departure || !returnDate || returnDate <= departure}
        onClick={onDone}
      >
        Valider mes dates
      </button>
    </div>
  );
}
