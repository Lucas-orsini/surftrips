import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, extname, resolve } from "node:path";

// Local optimization only. No network, upload or database connection.
const [source, output] = process.argv.slice(2);
if (
  !source ||
  !output ||
  ![".webp", ".avif"].includes(extname(output).toLowerCase()) ||
  resolve(source) === resolve(output)
) {
  console.error(
    "Usage : node scripts/prepare-destination-image.mjs source.jpg sortie/hero.webp (ou .avif)",
  );
  process.exit(1);
}
try {
  const format = extname(output).toLowerCase().slice(1);
  let bytes;
  for (const quality of [85, 80, 75, 70, 65]) {
    bytes = await sharp(source)
      .rotate()
      .resize({
        width: 1600,
        height: 1000,
        fit: "cover",
        withoutEnlargement: true,
      })
      .toFormat(format, { quality })
      .toBuffer();
    if (bytes.length <= 500_000) break;
  }
  if (!bytes || bytes.length > 500_000) throw new Error("TOO_LARGE");
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, bytes, { flag: "wx" });
  const metadata = await sharp(bytes).metadata();
  console.log(
    `${metadata.width} × ${metadata.height} · ${Math.ceil(bytes.length / 1000)} Ko · ${format.toUpperCase()}. Vérifie le cadrage avant l’upload manuel.`,
  );
} catch {
  console.error(
    "Préparation impossible : vérifie le fichier source et un chemin de sortie neuf. Aucun original n’est remplacé.",
  );
  process.exitCode = 1;
}
