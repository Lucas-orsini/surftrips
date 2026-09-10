import { SEASON_LABELS, type SeasonMonth } from "@/lib/surf/season";
export function SeasonTimeline({
  timeline,
  detailed = false,
}: {
  timeline: SeasonMonth[];
  detailed?: boolean;
}) {
  return (
    <div className={`season-timeline ${detailed ? "timeline-detailed" : ""}`}>
      <div className="timeline-heading">
        <span>LE BON MOMENT</span>
        <span>
          <i />
          Mois favorables
        </span>
      </div>
      <ol className="month-list" aria-label="Saisonnalité indicative du surf">
        {timeline.map(({ month, label, status }) => (
          <li
            key={month}
            className={
              status === "optimale"
                ? "month-good"
                : status === "epaule"
                  ? "month-variable"
                  : ""
            }
            title={`${label} : ${status ? SEASON_LABELS[status] : "Saison non renseignée"}`}
          >
            <span aria-hidden="true">{label[0]}</span>
            <span className="sr-only">
              {label} :{" "}
              {status ? SEASON_LABELS[status] : "Saison non renseignée"}
            </span>
            <i />
          </li>
        ))}
      </ol>
    </div>
  );
}
