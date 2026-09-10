"use client";

import { useState, useTransition, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AIRPORTS } from "@/lib/airports";
import type { SearchCriteria } from "@/lib/types";
import { isValidDate } from "@/lib/validation/dates";
import { validateSearch, searchQuery, WORLD } from "@/lib/validation/search";
import { LEVEL_LABELS } from "@/lib/surf/levels";
import { SearchField } from "./SearchField";
import { SurfLevelSelector } from "./SurfLevelSelector";
import { AirportSelector } from "./AirportSelector";
import { DateSelector } from "./DateSelector";
import { RegionSelector } from "./RegionSelector";
import { Icon } from "@/components/ui/Icon";

type Field = "level" | "airport" | "dates" | "destination";
const defaults: SearchCriteria = {
  niveau: "intermediaire",
  origine: "PAR",
  dateDepart: "",
  dateRetour: "",
  region: "Monde entier",
};

export function SearchBar({
  initialValues,
  countries = [],
}: {
  initialValues?: Partial<SearchCriteria>;
  countries?: string[];
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
    AIRPORTS.find((item) => item.code === values.origine) || AIRPORTS[0];
  const formatDate = (date: string) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      timeZone: "UTC",
    }).format(new Date(`${date}T12:00:00Z`));
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !isValidDate(values.dateDepart) ||
      !isValidDate(values.dateRetour) ||
      values.dateRetour <= values.dateDepart
    ) {
      setError("Choisis une date de départ et une date de retour postérieure.");
      setOpen("dates");
      return;
    }
    const validation = validateSearch({ ...values }, countries);
    if (!validation.success) {
      setError(validation.error);
      return;
    }
    setError("");
    setOpen(null);
    startTransition(() =>
      router.push(`/recherche?${searchQuery(validation.data)}`),
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
          value={LEVEL_LABELS[values.niveau]}
          icon="wave"
          {...fieldProps("level")}
        >
          <SurfLevelSelector
            value={values.niveau}
            onChange={(level) => {
              setValues({ ...values, niveau: level });
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
            value={values.origine}
            onChange={(code) => {
              setValues({ ...values, origine: code });
              close();
            }}
          />
        </SearchField>
        <SearchField
          label="Dates"
          value={
            isValidDate(values.dateDepart) && isValidDate(values.dateRetour)
              ? `${formatDate(values.dateDepart)} – ${formatDate(values.dateRetour)}`
              : "Choisir mes dates"
          }
          icon="calendar"
          className="dates-field"
          {...fieldProps("dates")}
        >
          <DateSelector
            departure={values.dateDepart}
            returnDate={values.dateRetour}
            onChange={(departure, returnDate) => {
              setValues({
                ...values,
                dateDepart: departure,
                dateRetour: returnDate,
              });
              setError("");
            }}
            onDone={close}
          />
        </SearchField>
        <SearchField
          label="Destination"
          value={values.region || WORLD}
          icon="globe"
          {...fieldProps("destination")}
        >
          <RegionSelector
            countries={countries}
            value={values.region || WORLD}
            onChange={(destination) => {
              setValues({ ...values, region: destination });
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
