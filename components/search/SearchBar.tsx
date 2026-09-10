"use client";

import { useState, useTransition, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AIRPORTS } from "@/lib/data";
import type { SearchCriteria } from "@/lib/types";
import { isValidDate } from "@/lib/search";
import { SearchField } from "./SearchField";
import { SurfLevelSelector } from "./SurfLevelSelector";
import { AirportSelector } from "./AirportSelector";
import { DateSelector } from "./DateSelector";
import { RegionSelector } from "./RegionSelector";
import { Icon } from "@/components/ui/Icon";

type Field = "level" | "airport" | "dates" | "destination";
const defaults: SearchCriteria = {
  level: "Intermédiaire",
  airport: "PAR",
  departure: "",
  returnDate: "",
  destination: "Monde entier",
};

export function SearchBar({
  initialValues,
}: {
  initialValues?: Partial<SearchCriteria>;
}) {
  const [values, setValues] = useState<SearchCriteria>({
    ...defaults,
    ...initialValues,
  });
  const [open, setOpen] = useState<Field | null>(null);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const close = useCallback(() => {
    const field = document.activeElement?.closest(".search-field");
    field
      ?.querySelector<HTMLButtonElement>(".field-trigger")
      ?.focus({ preventScroll: true });
    setOpen(null);
  }, []);
  const fieldProps = (field: Field) => ({
    open: open === field,
    onToggle: () => setOpen(open === field ? null : field),
    onClose: close,
  });
  const airport =
    AIRPORTS.find((item) => item.code === values.airport) || AIRPORTS[0];
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !isValidDate(values.departure) ||
      !isValidDate(values.returnDate) ||
      values.returnDate <= values.departure
    ) {
      setError("Choisis une date de départ et une date de retour postérieure.");
      setOpen("dates");
      return;
    }
    setError("");
    setOpen(null);
    startTransition(() =>
      router.push(
        `/recherche?${new URLSearchParams({ ...values }).toString()}`,
      ),
    );
  }
  return (
    <div className="search-wrapper" id="recherche">
      <form
        className="search-panel"
        onSubmit={submit}
        aria-label="Trouver une destination de surf"
        aria-busy={pending}
      >
        <SearchField
          label="Niveau"
          value={values.level}
          icon="wave"
          {...fieldProps("level")}
        >
          <SurfLevelSelector
            value={values.level}
            onChange={(level) => {
              setValues({ ...values, level });
              close();
            }}
          />
        </SearchField>
        <SearchField
          label="Départ"
          value={`${airport.city} — ${airport.code}`}
          icon="plane"
          {...fieldProps("airport")}
        >
          <AirportSelector
            value={values.airport}
            onChange={(code) => {
              setValues({ ...values, airport: code });
              close();
            }}
          />
        </SearchField>
        <SearchField
          label="Dates"
          value={
            isValidDate(values.departure) && isValidDate(values.returnDate)
              ? `${formatDate(values.departure)} – ${formatDate(values.returnDate)}`
              : "Choisir mes dates"
          }
          icon="calendar"
          className="dates-field"
          {...fieldProps("dates")}
        >
          <DateSelector
            departure={values.departure}
            returnDate={values.returnDate}
            onChange={(departure, returnDate) => {
              setValues({ ...values, departure, returnDate });
              setError("");
            }}
            onDone={close}
          />
        </SearchField>
        <SearchField
          label="Destination"
          value={values.destination}
          icon="globe"
          {...fieldProps("destination")}
        >
          <RegionSelector
            value={values.destination}
            onChange={(destination) => {
              setValues({ ...values, destination });
              close();
            }}
          />
        </SearchField>
        <button
          className="button search-submit"
          type="submit"
          disabled={pending}
        >
          {pending ? (
            <>
              <span className="spinner" />
              Recherche en cours
            </>
          ) : (
            <>
              Trouver où surfer
              <Icon name="arrow" size={20} />
            </>
          )}
        </button>
      </form>
      <div className="search-under">
        <p>
          <Icon name="check" size={13} />
          Recherche gratuite<span>·</span>aucune inscription nécessaire
        </p>
        <span className="search-aside">L’océan t’attend.</span>
      </div>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
