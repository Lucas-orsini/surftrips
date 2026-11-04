import type {
  DestinationEditorial,
  EditorialText,
} from "@/lib/editorial/destinations";

/** Text nodes only: editorial content can never inject HTML or scripts. */
export function EditorialParagraph({
  block,
  editorial,
}: {
  block: EditorialText;
  editorial?: DestinationEditorial;
}) {
  return (
    <p className="body-copy">
      {block.text}
      {!!block.sourceIds?.length && editorial && (
        <span className="editorial-sources">
          {block.sourceIds.map((id) => (
            <a key={id} href={editorial.sources[id].url}>
              {editorial.sources[id].label}
            </a>
          ))}
        </span>
      )}
    </p>
  );
}
