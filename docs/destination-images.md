# Images des destinations

## État inspecté le 12 septembre 2026

La base réelle contient **77 zones**, dont **76 disposent maintenant d’une image** ; seul Pavones utilise le fallback. Lors de l’inspection initiale, la colonne et le bucket étaient absents. Après autorisation explicite, la migration image a été appliquée et le bucket public `destinations` créé via l’API Storage. Le [registre des sources](destination-image-sources.md) conserve les 70 photos Unsplash intactes, puis six nouvelles publications Pexels / Wikimedia Commons. Voir le [bilan de la dernière passe](destination-image-final-seven.md), notamment les attributions obligatoires à conserver au prochain déploiement.

La migration [20260912_destination_hero_image.sql](../migrations/20260912_destination_hero_image.sql), maintenant appliquée sur cette base, ajoute `zones.hero_image_path`, nullable, avec validation du chemin et du dossier de la zone. Elle ne s’exécute jamais au démarrage ou au build et ne doit pas être rejouée ici. La projection SQL reste compatible avec un environnement non migré. Les chemins invalides sont isolés dans le diagnostic serveur. RLS reste active sur `zones`, `spots` et `storage.objects` ; aucune politique d’écriture publique n’a été ajoutée.

## Mise en service manuelle

Les étapes 1 et 2 sont déjà réalisées sur le projet connecté. Cette procédure reste utile pour un autre environnement ; ne pas recréer les ressources existantes.

1. Relire puis exécuter la migration dans le SQL Editor Supabase, avec un compte administrateur.
2. Dans **Storage → New bucket**, créer **destinations**, public pour la lecture. Restreindre les types MIME à `image/webp` et `image/avif`, taille maximale conseillée **500000 octets**. Ne pas ouvrir de politique publique d’écriture. Les uploads restent administratifs.
3. Renseigner `NEXT_PUBLIC_SUPABASE_URL` avec l’origine HTTPS du projet, sans chemin ni clé. Cette URL publique existe déjà dans la configuration locale ; la configurer aussi chez l’hébergeur puis reconstruire/redémarrer Next.js. Aucune clé Supabase n’est nécessaire pour lire les photos publiques.
4. Préparer une photo dont Surftrips possède les droits d’usage. WebP ou AVIF, cadrage proche de **1600 × 1000 / 16:10**, idéalement **400–500 Ko maximum**. Vérifier visuellement le cadrage et consigner auteur, source et licence dans le registre des médias.
5. Uploader manuellement dans le bucket : `<zone_id>/hero.webp` (ou `hero.avif`). Exemple de dossier pour la zone existante Ericeira : `destinations/ericeira/hero.webp`.
6. Dans le Table Editor, renseigner uniquement `hero_image_path = ericeira/hero.webp` sur la ligne `zone_id = ericeira`, après avoir vérifié le fichier publié. Ne pas inclure le nom du bucket ni une URL complète dans ce champ.
7. Attendre l’expiration du cache catalogue (60 secondes), vérifier recherche, fiche, sélection de la landing et zones associées. Pour remplacer une photo déjà mise en cache par Storage/Next/Image, uploader un nouveau nom, par exemple `ericeira/hero-02.webp`, puis mettre à jour le chemin.

La clé administrative Storage a été configurée localement pour l’opération autorisée ; elle n’est utilisée que par le script opérateur, jamais par l’application ni dans le navigateur. Les métadonnées du schéma `storage` restent en lecture seule côté SQL ; les opérations passent par le Dashboard/API Storage. Le bucket est public pour la lecture et restreint les uploads administratifs à WebP/AVIF, 500000 octets maximum. Voir les guides officiels [création d’un bucket](https://supabase.com/docs/guides/storage/buckets/creating-buckets) et [schéma Storage](https://supabase.com/docs/guides/storage/schema/design).

## Préparer une photo localement

Les [76 images](destination-image-sources.md) sont maintenant publiées, avec sources, photographes et licences documentés. Le registre précise les fichiers disponibles et la procédure de publication assistée. Pour les prochains lots, la préparation seule ne crée ni bucket ni association en base. Pour une licence imposant une attribution, préparer aussi le crédit visible et conserver les métadonnées de droits du dérivé avant publication.

```sh
node scripts/prepare-destination-image.mjs chemin/source.jpg chemin/sortie/hero.webp
```

Le script réutilise Sharp installé avec Next.js, corrige l’orientation, recadre au ratio 16:10, réduit à 1600 × 1000 sans agrandissement et supprime les métadonnées par défaut. Il réduit progressivement la qualité et refuse une sortie supérieure à 500 Ko. Il n’écrase jamais un fichier existant, ne télécharge rien, ne fait aucun upload et ne modifie pas la base. Toujours vérifier le résultat avant publication. AVIF est également accepté en extension de sortie.

## Architecture

- `lib/images/destination.ts` : validation du chemin, URL publique et configuration Next/Image limitée au domaine configuré et au bucket. Aucun domaine générique ou paramètre signé autorisé.
- `lib/db/rows.ts`, `zones.ts`, `lib/types.ts` : projection serveur et typage du chemin ; `lib/destinations.ts` prépare la même URL pour tous les usages.
- `DestinationImage` : Next/Image, alt « Surf à {nom}, {pays} », fallback graphique pour absence ou erreur HTTP, réinitialisation lors d’un changement de source.
- `DestinationHero`, `DestinationCard` et zones associées : même source, conteneurs réservés et tailles adaptées. Hero seul préchargé avec `preload` (équivalent de `priority`, déprécié dans cette version de Next.js) ; cartes et vignettes en lazy loading.
- La fiche utilise désormais une bannière de 340 px desktop, 280 px tablette, 220 px mobile, radius 12 px. Le même conteneur est réservé dès le skeleton et conservé par le fallback. Les recadrages éditoriaux de `lib/images/banner.ts` ne concernent que la fiche ; cartes et landing gardent leurs dimensions. Voir [le compte rendu bannière](destination-banners.md). Les photographies locales auparavant associées à deux zones ne constituent plus une seconde source : seules les valeurs Supabase pilotent les photos destinations. Les images d’ambiance générales de la landing restent inchangées.
- Une future galerie peut réutiliser le résolveur et les sous-chemins `zone_id/gallery/...`. Aucune table galerie, photo, prix ou destination fictive n’est créée.

La fiche suit réellement dans son DOM : `#surf` → `#reservation` (FlightSection) → `#hebergement` (AccommodationSection) → autres zones. La navigation interne conserve les ancres existantes. Les paramètres de vol, l’isolation des deux widgets, les recommandations d’hébergement et le Pubref sont conservés.

## Vérification des images sans écriture en base

```sh
npm run test:e2e -- --config tests/images/playwright.config.ts
```

Ce test lance une **application Next.js isolée** sous `tests/fixtures/destination-images`, sur le port 3003. Elle importe les composants réels ; Playwright fournit une photographie locale déjà présente à la place de la réponse image réseau. Aucun appel à Supabase, aucun fichier envoyé au Storage, aucune route de test dans l’application principale. Le test couvre photo chargée, absence, HTTP 404, dimensions stables, alt, preload/lazy, navigation Next.js et refresh, sur desktop et mobile. Les vérifications après publication sont séparées dans `tests/e2e/destination-images-live.spec.ts`, sans mock d’image ou de base.

## Validation effectuée

- TypeScript, lint, 31 tests unitaires et build Next.js de production réussis.
- 34 tests navigateur sur l’application réelle et 2 tests images isolés réussis, sur ordinateur et mobile. Fiche directe, recherche → destination, retour aux résultats, autre destination, refresh et ordre DOM surf → vol → logement contrôlés.
- Travelpayouts réel : paramètres PAR → LIS et dates conservés ; redirection affiliée jusqu’à la recherche Kiwi vérifiée. Hotels.com réel : widget affiché, sans débordement aux largeurs 575, 375 et 320 px. Les tests de blocage, secours et remontage passent également.
- Recommandations d’hébergement : rendu des trois cartes testé séparément ; la base réelle n’a toujours pas de table accommodations appliquée ni de recommandations à vérifier.
- Après publication, contrôle local sur Ericeira avec sa vraie photo Storage, caches chauds et scripts tiers bloqués : LCP 376 ms desktop / 392 ms mobile ; CLS 0 ; latence maximale des interactions 48 ms / 48 ms. Ce sont des mesures de laboratoire, pas un INP terrain ni une garantie de Core Web Vitals sur le site déployé.
- Contrôle des sources versionnables et de 18 bundles JavaScript client : aucun credential local retrouvé, aucun driver PostgreSQL ni variable de connexion dans ces bundles. Fichiers d’environnement ignorés par Git.
- Premier lot : dix WebP 1600 × 1000, de 89108 à 461796 octets. Uploads vérifiés par SHA-256 via leurs URL publiques, chemins et métadonnées Storage contrôlés dans la base. Les dix heroes et les cartes fonctionnent sur les routes réelles du build local, sur desktop/mobile. Le site n’a pas été redéployé dans cette opération.

## Zones sans image associée

**Une seule zone** reste sans image après la dernière passe sur les sept exceptions. Le catalogue réel compte désormais **77 zones, 76 images, 1 fallback**. Les sources et motifs de rejet sont détaillés dans le [compte rendu](destination-image-final-seven.md#pavones-reste-sans-photo).

| zone_id | Zone | Pays |
| --- | --- | --- |
| `pavones` | Pavones | Costa Rica |
