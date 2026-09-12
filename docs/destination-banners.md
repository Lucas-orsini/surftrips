# Bannières destination et deuxième lot — 12 septembre 2026

## Rendu final

`DestinationHero` conserve son nom et devient un en-tête compact suivi d’une bannière. Le pays, le nom, le statut saisonnier quand il est disponible, le niveau et le nombre de spots sont du texte HTML placé avant la photo. Ces informations utilisent les données déjà préparées côté serveur.

| Viewport contrôlé | Ancienne hauteur de la photo | Nouvelle hauteur |
| ----------------- | ---------------------------- | ---------------- |
| Desktop 1440 px   | 640 px                       | 340 px           |
| Laptop 1280 px    | 640 px                       | 340 px           |
| Tablette 768 px   | 435 px                       | 280 px           |
| Mobile 390 px     | 218,75 px                    | 220 px           |

L’ancien conteneur utilisait `aspect-ratio: 16/10` et `max-height: 640px`. Sur mobile, la photo était déjà proche de 220 px : le gain de place vient surtout du titre, de l’en-tête et des espacements réduits. Le H1 mobile passe de 61 à 42 px ; sur desktop, son maximum passe de 95 à 64 px. La typographie, les couleurs, les marges générales et les composants existants sont conservés.

Les nouvelles hauteurs sont fixes : 340 px au-dessus de 1100 px, 280 px jusqu’à 1100 px et 220 px jusqu’à 760 px. Aucune hauteur viewport n’est utilisée pour la bannière. Largeur du container existant, maximum 1280 px, radius 12 px, `object-fit: cover`. Aucun texte ni overlay sombre sur la photographie. Les fichiers restent des WebP 1600 × 1000.

Next/Image utilise toujours `fill`, des `sizes` adaptés au container et `preload` sur cette image immédiatement visible. `preload` est l’API recommandée par les docs de Next.js 16.3.4 installé, où `priority` est déprécié. Les cartes et autres photos restent différées.

## Fichiers de cette évolution

| Fichier                                                                                            | Modification                                                                                                   |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `components/destination/DestinationHero.tsx`                                                       | En-tête compact, résumé surf et cadrage de la bannière ; ancres existantes conservées.                         |
| `components/destination/DestinationImage.tsx`                                                      | Prop facultative `objectPosition`, centrée par défaut ; comportement existant conservé pour les autres usages. |
| `app/globals.css`                                                                                  | Hauteurs responsive, H1 et espacements propres à la fiche destination, résumé lisible.                         |
| `app/destination/[slug]/loading.tsx`                                                               | Même conteneur photo dans le skeleton et réservation de l’espace du contenu suivant.                           |
| `lib/images/banner.ts`                                                                             | Recadrages éditoriaux par chemin exact de fichier ; aucun champ ni changement de schéma.                       |
| `scripts/publish-destination-images.ts`                                                            | Option `--manifest` pour les lots suivants, maximum quinze images ; mode sans écriture conservé par défaut.    |
| `tests/e2e/destination-banner.spec.ts`                                                             | Contrôle des quatre largeurs, résumé visible, CLS, dimensions du fallback et absence de débordement.           |
| `tests/e2e/destination-images-live.spec.ts`                                                        | Vérifie les vingt photos des deux manifestes avec le vrai Storage.                                             |
| `docs/destination-image-batch-02.json`                                                             | Deuxième manifeste : sources, photographes, dates, chemins, poids, empreintes et statut publié.                |
| `docs/destination-image-sources.md`, `docs/destination-images.md`, `docs/database.md`, `README.md` | Registre, inventaire réel et mode d’emploi actualisés.                                                         |

Le contenu réservé sous le skeleton évite de montrer momentanément le footer, puis de le déplacer lorsque le serveur livre les spots et modules de réservation. Cette réservation concerne le corps de page ; la bannière reste strictement à 340/280/220 px. Le fallback sans photo et le fallback sur erreur HTTP utilisent les mêmes dimensions.

`object-position` reste centré sans réglage éditorial. Les quelques exceptions sont centralisées par chemin de fichier afin de conserver un surfeur, l’horizon ou un repère côtier. Une future valeur issue de la base pourra être passée à `DestinationHero` sans changer `DestinationImage`. Aucune migration `hero_image_position` n’a été créée.

## Captures du build local connecté à Supabase

- [Desktop 1440 px](../.local/destination-banners/banner-1440.png)
- [Laptop 1280 px](../.local/destination-banners/banner-1280.png)
- [Tablette 768 px](../.local/destination-banners/banner-768.png)
- [Mobile 390 px](../.local/destination-banners/banner-390.png)
- [Fallback mobile](../.local/destination-banners/banner-fallback-390.png)
- [Planche responsive](../.local/destination-banners/banner-responsive-review.jpg)
- [Deuxième lot : dix bannières desktop/mobile, captures des images réellement publiées](../.local/destination-banners/batch-02-crops.jpg)
- [Carte de résultat desktop conservée](../.local/destination-banners/published/published-result-desktop.png)
- [Landing desktop conservée](../.local/destination-banners/published/published-landing-desktop.png)

Les captures sont locales et ignorées par Git. Le test de bannière régénère les quatre largeurs dans `test-results/` ; les copies ci-dessus restent disponibles après un autre lancement de tests.

## Publication des images

Dix nouvelles destinations : Saint-Jean-de-Luz, Mundaka, Bundoran, Byron Bay / Lennox Head, Noosa, Raglan, Jeffreys Bay, Margaret River, Torquay / Bells et Santa Cruz. Sources et crédits complets dans le [registre du deuxième lot](destination-image-sources.md#deuxième-lot--bannières-publié-le-12-septembre-2026).

Le bucket public existant est **destinations**. Chemins : `<zone_id>/hero.webp`, enregistrés tels quels dans `zones.hero_image_path`. Les vingt URL publiques ont été vérifiées par taille et SHA-256. Les dix nouvelles images pèsent entre **87962 et 477656 octets**, toutes en **1600 × 1000**. Le catalogue contient désormais **20 photos et 57 fallbacks sur 77 zones**. Aucun chemin hors lot n’a changé ; aucun fichier du premier lot n’a été remplacé. RLS reste active et aucune politique publique d’écriture n’a été ajoutée.

**Aucune migration SQL et aucun nouveau bucket** dans cette évolution. Les photos sont publiées sur Supabase ; l’application n’a pas été redéployée par cette opération.

## Validation

- TypeScript, lint, les 31 tests unitaires et le build Next.js de production réussis.
- 25 tests navigateur validés : 23 sur l’application réelle et 2 tests isolés de photo/fallback, dont erreur HTTP 404 et retour après navigation Next.js. Le contrôle des quatre largeurs n’est exécuté qu’une fois, depuis le projet desktop.
- Vingt fiches réelles contrôlées sur desktop/mobile : bonne URL Storage, alt, réponse Next/Image, préchargement unique du hero, refresh et absence de débordement.
- Landing, résultats partageables, recherche → destination et retour aux résultats contrôlés sans mock d’image ou de données Supabase. Les quatre nouvelles photos australiennes sont également vérifiées dans les cartes de résultats, puis lors d’une navigation vers Byron Bay avec les dates et l’origine conservées.
- Quatre largeurs de bannière contrôlées : 1440, 1280, 768 et 390 px. Résumé avant la photo, début du contenu surf visible dans le premier écran, ratio non déformé, fallback de même hauteur et CLS inférieur ou égal à 0,01 dans ces contrôles.
- Travelpayouts réel conserve le trajet et les dates jusqu’à la recherche Kiwi. Hotels.com réel fonctionne, notamment à 575 et 375 px. Navigation entre destinations, affiliation/Pubref, ordre DOM, blocage et repli ont été vérifiés.
- Mesures de laboratoire sur Ericeira, caches chauds et scripts tiers bloqués : LCP 408 ms desktop/mobile, CLS 0, latence maximale des interactions 48 ms. Ces mesures locales ne sont pas un INP terrain ni une garantie de Core Web Vitals sur le site déployé.
- Comparaison des empreintes de 18 modules avant/après : moteur, niveau/saison/score, couche database, composants Travelpayouts/Hotels.com, Hero de landing et DestinationCard inchangés.
- Scan des sources versionnables et des 18 bundles JavaScript client : aucun credential local détecté, aucune variable de connexion ou bibliothèque PostgreSQL dans les bundles client.

Les tests de capture bloquent les scripts de réservation pour isoler le contrôle visuel. Les tests partenaires séparés utilisent les vrais widgets. Un test de bannière sélectionnait initialement à la fois le skeleton et le contenu pendant le streaming Next.js ; il attend maintenant explicitement la fin du chargement avant la mesure. Aucun changement des widgets n’a été nécessaire.
