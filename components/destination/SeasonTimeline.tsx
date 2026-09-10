const MONTHS = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export function SeasonTimeline({
  bestMonths,
  shoulderMonths = [],
  detailed = false,
}: {
  bestMonths: number[];
  shoulderMonths?: number[];
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
        {MONTHS.map((month, index) => (
          <li
            key={month}
            className={
              bestMonths.includes(index + 1)
                ? "month-good"
                : shoulderMonths.includes(index + 1)
                  ? "month-variable"
                  : ""
            }
            title={`${month} : ${bestMonths.includes(index + 1) ? "période favorable" : shoulderMonths.includes(index + 1) ? "conditions variables" : "hors période favorable"}`}
          >
            <span aria-hidden="true">{month[0]}</span>
            <span className="sr-only">
              {month} :{" "}
              {bestMonths.includes(index + 1)
                ? "période favorable"
                : shoulderMonths.includes(index + 1)
                  ? "conditions variables"
                  : "hors période favorable"}
            </span>
            <i />
          </li>
        ))}
      </ol>
    </div>
  );
}
