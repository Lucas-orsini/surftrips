# Sources des images destinations

## État au 12 septembre 2026

**76 photographies publiées dans Supabase pour 77 zones, le 12 septembre 2026.** La dernière passe sur les sept exceptions a ajouté six photos : seul Pavones conserve le fallback. Les 70 photos antérieures sont inchangées, chemins et empreintes publiques vérifiés. Les bilans des lots précédents restent conservés ci-dessous comme historique.

L’inspection initiale ne trouvait ni colonne image ni bucket. Après autorisation explicite de l’utilisateur et configuration de la clé serveur, la migration `20260912_destination_hero_image.sql` a été appliquée et le bucket public `destinations` créé via l’API officielle Storage. Il accepte uniquement WebP/AVIF, au maximum 500000 octets. Les dix uploads et associations ont été vérifiés ; RLS reste active sur `zones`, `spots` et `storage.objects`. Aucune politique d’écriture publique n’a été ajoutée.

`date_added` indique l’entrée au registre local ; `date_published` vaut désormais `2026-09-12` dans le [manifeste](destination-image-batch.json). Les noms et pays ci-dessous reprennent les données réelles, y compris leur orthographe actuelle. Canggu n’existe pas dans ce catalogue ; la photo d’Uluwatu est réservée à `bukit-bali`.

## Premier lot — registre des photographies retenues

Toutes les pages retenues indiquaient la [licence Unsplash standard](https://unsplash.com/license), avec téléchargement gratuit, lors de la sélection le 2026-09-12. Navigation web manuelle et téléchargement des fichiers image publics liés aux pages choisies, sans scraping, API privée ou collecte automatisée de résultats. Aucun fichier Unsplash+ n’est utilisé. La localisation est celle déclarée sur la page ou dans la légende du photographe ; elle n’est pas une géolocalisation indépendante.

Bucket utilisé : **destinations**. Chaque chemin ci-dessous est maintenant enregistré dans `zones.hero_image_path`. Fichiers locaux conservés : `.local/destination-images/<zone_id>/hero.webp` (ignorés par Git).

[Archive prête pour upload manuel](../.local/destination-images/surftrips-unsplash-2026-09-12.zip) : dix dossiers contenant uniquement les WebP validés, avec les chemins du tableau. Décompresser puis uploader les dossiers dans le bucket `destinations` ; ne pas uploader le ZIP lui-même.

| zone_id      | Destination                         | source_url                                             | photographer / photographer_url                        | date_added | Chemin Storage         | Poids exact               |
| ------------ | ----------------------------------- | ------------------------------------------------------ | ------------------------------------------------------ | ---------- | ---------------------- | ------------------------- |
| `ericeira`   | Ericeira, Portugal                  | [LPTQ4ZZnUSA](https://unsplash.com/photos/LPTQ4ZZnUSA) | [Djordje Djordjevic](https://unsplash.com/@oddgraphy)  | 2026-09-12 | `ericeira/hero.webp`   | 461 796 octets (461,8 Ko) |
| `biarritz`   | Biarritz, France                    | [0c3XSAMOBk4](https://unsplash.com/photos/0c3XSAMOBk4) | [Andreas Felske](https://unsplash.com/@andreasfelske)  | 2026-09-12 | `biarritz/hero.webp`   | 250 086 octets (250,1 Ko) |
| `hossegor`   | Hossegor / Seignosse, France        | [9aShb0YueiA](https://unsplash.com/photos/9aShb0YueiA) | [Jarno Colijn](https://unsplash.com/@jarnocolijn)      | 2026-09-12 | `hossegor/hero.webp`   | 89 108 octets (89,1 Ko)   |
| `peniche`    | Peniche / Baleal, Portugal          | [-WFd3V_xxdM](https://unsplash.com/photos/-WFd3V_xxdM) | [Timur Seyfelmlyukov](https://unsplash.com/@timurse)   | 2026-09-12 | `peniche/hero.webp`    | 262 996 octets (263 Ko)   |
| `nazare`     | Nazare, Portugal                    | [9auEku-d2E8](https://unsplash.com/photos/9auEku-d2E8) | [Andrés Rodríguez](https://unsplash.com/@nesnautica)   | 2026-09-12 | `nazare/hero.webp`     | 123 716 octets (123,7 Ko) |
| `taghazout`  | Taghazout, Maroc                    | [TYHyrF56Gys](https://unsplash.com/photos/TYHyrF56Gys) | [Philipp Klausner](https://unsplash.com/@philkl)       | 2026-09-12 | `taghazout/hero.webp`  | 172 408 octets (172,4 Ko) |
| `imsouane`   | Imsouane, Maroc                     | [NJzr828hh-4](https://unsplash.com/photos/NJzr828hh-4) | [Louis Hansel](https://unsplash.com/@louishansel)      | 2026-09-12 | `imsouane/hero.webp`   | 345 696 octets (345,7 Ko) |
| `bukit-bali` | Bukit / Uluwatu (Bali), Indonesie   | [vqdT2QPBGjs](https://unsplash.com/photos/vqdT2QPBGjs) | [Niklas Weiss](https://unsplash.com/@treesoftheplanet) | 2026-09-12 | `bukit-bali/hero.webp` | 401 130 octets (401,1 Ko) |
| `arugam-bay` | Arugam Bay, Sri Lanka               | [J7LiHL7jAgU](https://unsplash.com/photos/J7LiHL7jAgU) | [Etienne Boulanger](https://unsplash.com/@etienneblg)  | 2026-09-12 | `arugam-bay/hero.webp` | 373 034 octets (373 Ko)   |
| `siargao`    | Siargao (General Luna), Philippines | [Z3U2trGyhkQ](https://unsplash.com/photos/Z3U2trGyhkQ) | [Mario Man](https://unsplash.com/@mariomanlupig)       | 2026-09-12 | `siargao/hero.webp`    | 321 490 octets (321,5 Ko) |

## Localisation et choix éditorial

- **Ericeira** — Localisation indiquée : « Ericeira, Portugal ». Plage d’Ericeira, deux surfeurs à distance au bord de l’Atlantique.
- **Biarritz** — Localisation indiquée : « Biarritz, France ». Front de mer de Biarritz et vagues atlantiques, vue large.
- **Hossegor / Seignosse** — Localisation indiquée : « Hossegor, France ». Vague et line-up à Hossegor ; surfeurs vus à distance.
- **Peniche / Baleal** — Localisation indiquée : « Baleal Beach, Baleal Island, Peniche, Portugal ». Îlot rocheux de Baleal et côte de Peniche.
- **Nazare** — Localisation indiquée : « Nazaré, Portugal ». Océan et vagues depuis la côte de Nazaré, lumière naturelle.
- **Taghazout** — Localisation indiquée : « Taghazout Beach, Morocco ». Village côtier de Taghazout, plage et barques de pêche au crépuscule.
- **Imsouane** — Localisation indiquée : « Imsouane, Morocco ». Baie d’Imsouane, lignes de vagues et surfeurs dans leur environnement.
- **Bukit / Uluwatu (Bali)** — Localisation indiquée : « Uluwatu, Pecatu, Badung, Bali, Indonesia ». Rochers et accès à l’océan à Uluwatu ; aucune association avec Canggu.
- **Arugam Bay** — Localisation indiquée : « Arugam Bay, Sri Lanka (légende du photographe) ». Vue aérienne de la plage et des bateaux d’Arugam Bay.
- **Siargao (General Luna)** — Localisation indiquée : « Tuazon Point, Siargao (légende du photographe) ». Palmiers, rivage et récif de Tuazon Point, près de General Luna.

Aucun gros visage identifiable, logo important ou texte incrusté n’a été repéré à l’inspection des fichiers retenus. Les photos de plage peuvent comporter des personnes très éloignées. Dix sources distinctes : aucune photographie n’est partagée entre plusieurs destinations. Les photos historiques décrivent l’environnement, pas les conditions de surf ou l’état exact du rivage aujourd’hui.

## Autres candidates examinées

Deux candidates par destination, trois pour Imsouane et Uluwatu. Les deux alternatives d’Uluwatu ont seulement été repérées dans les résultats : leurs pages étaient inaccessibles, elles n’ont pas été téléchargées ni validées visuellement. La photo retenue d’Uluwatu a, elle, été ouverte, localisée, téléchargée et inspectée.

| zone_id      | Candidate Unsplash                                     | Photographe indiqué | Motif de non-sélection                                                                                                                                                                 |
| ------------ | ------------------------------------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ericeira`   | [mb7g73wchlg](https://unsplash.com/photos/mb7g73wchlg) | Johannes Kopf       | Cadrage très vertical, ciel et soleil dominants ; moins adapté au recadrage du hero.                                                                                                   |
| `biarritz`   | [cGgUMXLU_xw](https://unsplash.com/photos/cGgUMXLU_xw) | Eric TERRADE        | Vue très verticale et bâtiment dominant ; la photo retenue donne plus de place au front de mer.                                                                                        |
| `hossegor`   | [AL5PbUsO-aM](https://unsplash.com/photos/AL5PbUsO-aM) | Kévin JINER         | Surfeur plus rapproché, lumière dorée ; le line-up large retenu s’accorde mieux au lot.                                                                                                |
| `peniche`    | [_RIZu9pPMO8](https://unsplash.com/photos/_RIZu9pPMO8) | Ivo Sousa Martins   | Localisation Peniche/Baleal cohérente, mais portrait ; le paysage de Baleal est mieux conservé dans la photo retenue.                                                                  |
| `nazare`     | [SMT099HqlhI](https://unsplash.com/photos/SMT099HqlhI) | HighZone            | Turquoise très saturé et cadrage vertical ; préférence pour les tons naturels de la photo retenue.                                                                                     |
| `taghazout`  | [VBCYuZ1ttpI](https://unsplash.com/photos/VBCYuZ1ttpI) | Ludomił Sawicki     | Architecture dominante, peu d’océan ; la vue de plage et du village retenue donne plus de contexte côtier.                                                                             |
| `imsouane`   | [r8eR_R_t46I](https://unsplash.com/photos/r8eR_R_t46I) | Michiel Annaert     | Photo verticale, falaise sombre et ciel important ; la vue large de la baie a été préférée.                                                                                            |
| `imsouane`   | [r30YzrKJLMk](https://unsplash.com/photos/r30YzrKJLMk) | Michiel Annaert     | Photo verticale en noir et blanc, moins cohérente avec les paysages en couleur du lot.                                                                                                 |
| `bukit-bali` | [r2QzXmIeMio](https://unsplash.com/photos/r2QzXmIeMio) | Nathan Boadle       | Candidate repérée dans les résultats de recherche, non retenue : page inaccessible (HTTP 429), localisation/licence non confirmées sur la page. Aucun téléchargement ni contournement. |
| `bukit-bali` | [C60ox6W5FBg](https://unsplash.com/photos/C60ox6W5FBg) | Jernej Graj         | Candidate repérée, non retenue : page inaccessible (HTTP 403). Aucun téléchargement ni contournement.                                                                                  |
| `arugam-bay` | [xiv45ieF41A](https://unsplash.com/photos/xiv45ieF41A) | Philipp Kämmerer    | Lumière très faible et personnes plus présentes ; la vue aérienne situe mieux plage et activité locale.                                                                                |
| `siargao`    | [c-E8XPBZvRQ](https://unsplash.com/photos/c-E8XPBZvRQ) | Alice Kotlyarenko   | Cloud 9 explicitement localisé ; lumière plus sombre et contraste faible. La côte de Tuazon Point est plus lisible au format carte.                                                    |

## Préparation et intégrité

Conversion par `scripts/prepare-destination-image.mjs` : **WebP, 1600 × 1000, recadrage central 16:10, aucune génération d’image**, orientation corrigée et métadonnées supprimées. Les originaux ne sont pas modifiés. La qualité est réduite seulement si nécessaire pour rester sous 500000 octets. Poids total du lot : **2 801 460 octets**.

Les chemins source CDN, dimensions, octets et empreintes SHA-256 sont conservés dans [destination-image-batch.json](destination-image-batch.json). Les URL Unsplash de ce registre permettent de retrouver la page et l’auteur indépendamment du CDN. Les fichiers finaux sont stockés dans Supabase Storage avec copie locale, jamais dans PostgreSQL ou dans le bundle Next.js. Les dix réponses publiques ont été comparées aux empreintes locales avant association en base ; leurs métadonnées Storage correspondent aussi aux tailles et types attendus.

## Procédure de publication et de reprise

Le premier lot est publié. Ne pas réappliquer la migration ni recréer le bucket dans ce projet. Les étapes 1 et 2 ci-dessous décrivent la mise en service initiale ; les commandes suivantes permettent une vérification ou une reprise contrôlée du lot.

1. Relire puis appliquer [la migration déjà préparée](../migrations/20260912_destination_hero_image.sql) selon [le workflow existant](destination-images.md#mise-en-service-manuelle). Le script ci-dessous n’applique aucune migration.
2. Créer via le Dashboard ou l’API officielle Storage le bucket public `destinations`, MIME `image/webp` / `image/avif`, limite 500000 octets. Ne jamais écrire directement dans les tables internes Storage ni ouvrir l’écriture publique.
3. Pour la publication assistée, ajouter **une seule** clé administrative serveur dans `.env.local` : `SUPABASE_SECRET_KEY` (clé actuelle) ou `SUPABASE_SERVICE_ROLE_KEY` (ancienne clé). Ne pas la transmettre dans le chat, ni lui donner un préfixe `NEXT_PUBLIC_`. Elle sert uniquement au script opérateur ; l’application ne la lit pas. `NEXT_PUBLIC_SUPABASE_URL` et `DATABASE_URL` sont déjà configurés localement.
4. Vérifier les fichiers et leur correspondance avec les vraies zones, sans écriture :

   ```sh
   node --experimental-strip-types scripts/publish-destination-images.ts
   ```

5. Une fois le lot relu et les prérequis configurés, publier :

   ```sh
   node --experimental-strip-types scripts/publish-destination-images.ts --publish
   ```

Le script vérifie les empreintes locales, les noms/pays et les chemins existants. Il uploade sans écraser, vérifie les octets via l’URL publique, puis met à jour uniquement le chemin de la zone correspondante. Une reprise accepte un objet strictement identique ; une image différente ou une modification concurrente de la zone bloque l’opération. Une interruption peut laisser un lot partiellement publié : chaque ligne réussie est annoncée, relancer termine les lignes restantes. Aucun téléchargement Unsplash, migration ou création de bucket n’est déclenché par ce script. Aucune tâche automatique n’est ajoutée au démarrage/build de Next.js.

L’autre possibilité est l’upload manuel des dix dossiers via le Dashboard, puis l’association des chemins exacts de ce tableau. Après publication, contrôler les dix URL publiques, renseigner `date_published` et le statut du manifeste, puis vérifier le site après expiration du cache catalogue (60 s). Ne marquer le lot publié qu’une fois ces contrôles effectués.

## Vérifications du premier lot

- Les dix WebP respectent 1600 × 1000 et moins de 500000 octets ; empreintes et correspondance des dix zones contrôlées en lecture seule dans Supabase.
- Une prévisualisation isolée utilise le vrai catalogue lu depuis Supabase et les composants `Hero`, `DestinationsSection`, `DestinationHero` et `DestinationCard`. Les associations aux fichiers locaux n’existent que dans cette application de test. Aucun remplacement fictif n’est injecté dans l’application principale.
- TypeScript, lint, les 31 tests unitaires et le build Next.js de production passent.
- Vérification finale de 132 fichiers versionnables et 18 bundles JavaScript client, après configuration de la clé serveur et nouveau build : aucun credential local détecté ; aucune variable de connexion ou bibliothèque PostgreSQL dans les bundles client. Le script de publication reste un outil opérateur séparé.
- Les 4 tests navigateur images passent sur desktop (1440 px) et mobile (390 px) : les dix heroes, les dix cartes, les composants de landing, navigation Next.js entre destinations, refresh, absence d’image et HTTP 404. Aucun débordement horizontal détecté. Inspection visuelle des recadrages desktop/mobile effectuée : les sujets principaux restent lisibles. Le hero est préchargé, les cartes utilisent le chargement différé et les conteneurs gardent leurs dimensions dans les états d’erreur.
- Planches locales : [sélection 16:10](../.local/destination-images/contact-sheet.jpg), [recadrages hero desktop/mobile](../.local/destination-images/hero-crops-review.png), [recadrages des cartes desktop/mobile](../.local/destination-images/card-crops-review.jpg). Captures détaillées dans `test-results/images/`. La commande `npm run test:e2e -- --config tests/images/playwright.config.ts` régénère les captures si les fichiers et l’instantané réel `.local/destination-images/catalog.json` sont présents. Les tests du lot sont ignorés sur une machine sans cet instantané ; les tests image/fallback génériques restent exécutés.
- **12 tests navigateur après publication réussis**, sur le build de production local connecté à la vraie base et au vrai Storage : les dix heroes répondent via Next/Image, avec leurs bonnes sources et leurs alt, sur desktop/mobile. Les cartes de la landing, les résultats, recherche → destination, retour aux résultats, refresh et destination sans image fonctionnent. Aucun mock d’image ni de données Supabase dans `tests/e2e/destination-images-live.spec.ts`. La vignette décorative de la landing reste masquée sur mobile conformément au design existant ; son chargement différé n’est pas forcé. [Recadrages vérifiés après publication](../.local/destination-images/published-crops-review.jpg).
- Le parcours réel Intermédiaire / Paris / 10–20 octobre 2026 / Monde entier fonctionne. L’ordre DOM surf → vol → logement est vérifié sur les dix fiches. Travelpayouts réel conserve PAR → LIS et les dates jusque dans la recherche Kiwi ; Hotels.com réel s’affiche, y compris à 575, 375 et 320 px.
- Dernière mesure locale sur Ericeira avec sa photo Storage, caches chauds et scripts tiers bloqués : LCP 376 ms desktop / 392 ms mobile, CLS 0, latence maximale d’interaction 48 / 48 ms. Ce sont des mesures de laboratoire, pas un INP terrain ni une garantie de Core Web Vitals sur le site déployé.
- Les vérifications navigateur utilisent le build Next.js local ; aucun déploiement de l’application n’a été effectué dans cette opération. Les photos et les chemins sont bien publiés dans Supabase.

À la fin du premier lot, 67 zones restaient sans photo. Le deuxième lot ci-dessous en traite dix supplémentaires ; les 57 autres conservent le fallback. Leur [inventaire actuel](destination-images.md#zones-sans-image-associée) est conservé. Aucun chemin hors lot n’est modifié.

## Deuxième lot — bannières, publié le 12 septembre 2026

Dix nouvelles zones, sélectionnées après consultation des pages Unsplash et contrôle visuel des fichiers. Licence standard gratuite confirmée sur chaque page retenue ; aucun fichier Unsplash+ utilisé. Les destinations et pays correspondent aux lignes Supabase existantes. L’autorisation de publication couvre les uploads et leurs associations ; aucune nouvelle migration, aucun nouveau bucket ni changement de politique.

| zone_id             | Destination                        | source_url                                             | photographer / photographer_url                              | date_added | Chemin Storage                | Poids exact              |
| ------------------- | ---------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------ | ---------- | ----------------------------- | ------------------------ |
| `saint-jean-de-luz` | Saint-Jean-de-Luz, France          | [FRHbuTH_KDA](https://unsplash.com/photos/FRHbuTH_KDA) | [Jeffrey Brandjes](https://unsplash.com/@jeffreyfotografie)  | 2026-09-12 | `saint-jean-de-luz/hero.webp` | 261850 octets (261,9 Ko) |
| `mundaka`           | Mundaka, Espagne                   | [Nv2oS9zs6e4](https://unsplash.com/photos/Nv2oS9zs6e4) | [Petr Slováček](https://unsplash.com/@grwood)                | 2026-09-12 | `mundaka/hero.webp`           | 441170 octets (441,2 Ko) |
| `bundoran`          | Bundoran, Irlande                  | [3siNJVKxUTo](https://unsplash.com/photos/3siNJVKxUTo) | [Surfing Croyde Bay](https://unsplash.com/@surfingcroydebay) | 2026-09-12 | `bundoran/hero.webp`          | 168762 octets (168,8 Ko) |
| `byron-bay`         | Byron Bay / Lennox Head, Australie | [XV5CiYOqV44](https://unsplash.com/photos/XV5CiYOqV44) | [Sven Piek](https://unsplash.com/@sven_piek)                 | 2026-09-12 | `byron-bay/hero.webp`         | 377092 octets (377,1 Ko) |
| `noosa`             | Noosa, Australie                   | [5OdbfNZGXug](https://unsplash.com/photos/5OdbfNZGXug) | [Hugo Bailey](https://unsplash.com/@aussiebyhugo)            | 2026-09-12 | `noosa/hero.webp`             | 197358 octets (197,4 Ko) |
| `raglan`            | Raglan, Nouvelle-Zelande           | [llLrcoy59BA](https://unsplash.com/photos/llLrcoy59BA) | [Petra Reid](https://unsplash.com/@createinme_nz)            | 2026-09-12 | `raglan/hero.webp`            | 87962 octets (88,0 Ko)   |
| `jeffreys-bay`      | Jeffreys Bay, Afrique du Sud       | [_4mVdfh8uzA](https://unsplash.com/photos/_4mVdfh8uzA) | [Zahava Rostenne](https://unsplash.com/@bssem)               | 2026-09-12 | `jeffreys-bay/hero.webp`      | 477656 octets (477,7 Ko) |
| `margaret-river`    | Margaret River, Australie          | [bs5K-HkvxTA](https://unsplash.com/photos/bs5K-HkvxTA) | [Corey Serravite](https://unsplash.com/@cozza)               | 2026-09-12 | `margaret-river/hero.webp`    | 281620 octets (281,6 Ko) |
| `torquay`           | Torquay / Bells, Australie         | [w1x09RurbwA](https://unsplash.com/photos/w1x09RurbwA) | [Oliver Herrmann](https://unsplash.com/@monoxane)            | 2026-09-12 | `torquay/hero.webp`           | 151950 octets (151,9 Ko) |
| `santa-cruz`        | Santa Cruz, Etats-Unis             | [zSlbO-DPVxM](https://unsplash.com/photos/zSlbO-DPVxM) | [Lex Brogan](https://unsplash.com/@lexbrogan)                | 2026-09-12 | `santa-cruz/hero.webp`        | 405666 octets (405,7 Ko) |

### Localisation et choix du deuxième lot

- **Saint-Jean-de-Luz** — Localisation déclarée : Plage de Lafitenia, Saint-Jean-de-Luz, Frankrijk. Lafitenia : lignes de vagues et côte basque, cadrage large conservant l’océan. Cadrage bannière : `center`.
- **Mundaka** — Localisation déclarée : Hermitage of Saint Catherine, Mundaka, Spain. Ermitage de Santa Katalina et côte de Mundaka, repère géographique identifiable ; cadrage haut pour conserver l’édifice. Cadrage bannière : `center 25%`.
- **Bundoran** — Localisation déclarée : Bundoran, County Donegal, Ireland. Vague surfée à Bundoran avec le relief côtier en arrière-plan ; surfeur à distance. Cadrage bannière : `center 65%`.
- **Byron Bay / Lennox Head** — Localisation déclarée : Byron Bay New South Wales, Australien. Vue aérienne des lignes de vagues sur la côte de Byron Bay ; composition horizontale sans visage ni marque. Cadrage bannière : `center`.
- **Noosa** — Localisation déclarée : Noosa Heads QLD, Australia. Vague et surfeurs à Noosa Heads, avec la végétation du littoral en arrière-plan. Cadrage bannière : `center 70%`.
- **Raglan** — Localisation déclarée : Raglan, New Zealand. Grande plage et relief de Raglan ; malgré une source verticale, la bande côtière reste lisible dans les deux crops validés. Cadrage bannière : `center 75%`.
- **Jeffreys Bay** — Localisation déclarée : Jeffreys Bay, South Africa. Vue du récif et de l’océan à Jeffreys Bay ; retenue plutôt que le portrait sportif de compétition. Cadrage bannière : `center`.
- **Margaret River** — Localisation déclarée : Margaret River, Margaret River, Australia. Vagues et plage de Margaret River vues du ciel ; diagonale du rivage compatible avec le crop panoramique. Cadrage bannière : `center`.
- **Torquay / Bells** — Localisation déclarée : Bells Beach VIC 3228, Australia. Vue d’ensemble de Bells Beach, ses vagues et son promontoire ; cadrage légèrement haut pour conserver l’horizon. Cadrage bannière : `center 35%`.
- **Santa Cruz** — Localisation déclarée : Shark Fin Cove, California (légende) ; Santa Cruz, California, United States (localisation Unsplash). Côte du comté de Santa Cruz à Shark Fin Cove, près de Davenport. Illustration régionale explicitement documentée, et non une photographie de Steamer Lane. Cadrage bannière : `center 40%`.

Santa Cruz est illustrée par **Shark Fin Cove, près de Davenport, sur la côte du comté de Santa Cruz**. Cette vue régionale n’est pas présentée comme le spot Steamer Lane. Les autres localisations sont celles des pages ou légendes Unsplash, sans prétendre à une vérification GPS indépendante. Les sources de Raglan et Margaret River sont verticales, mais leur bande côtière supporte les recadrages 16:10 puis panoramique contrôlés. Aucun gros visage, logo important ou texte incrusté n’a été repéré dans les fichiers retenus. Les dix identifiants et empreintes diffèrent entre eux et du premier lot.

### Alternatives du deuxième lot

| Zone              | Candidate / auteur                                                       | Décision                                                                                                       |
| ----------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Saint-Jean-de-Luz | [SpJEkpAiU-A](https://unsplash.com/photos/SpJEkpAiU-A), Anthony Choren   | Vue de baie et poste de secours ; la photo de Lafitenia montre mieux les vagues.                               |
| Mundaka           | [R41mO82U_LY](https://unsplash.com/photos/R41mO82U_LY), Miguel A Amutio  | Personne au premier plan ; le recadrage coupe le corps.                                                        |
| Mundaka           | [Q6Ta57B92cw](https://unsplash.com/photos/Q6Ta57B92cw), Maxime Cros      | Source très verticale et brume, moins de côte lisible après recadrage.                                         |
| Bundoran          | [w-EutbMDvhw](https://unsplash.com/photos/w-EutbMDvhw), Ben Wicks        | Tullan Strand repéré dans les résultats ; page inaccessible (403), aucun téléchargement ni contournement.      |
| Byron Bay         | [KewEcpApGjU](https://unsplash.com/photos/KewEcpApGjU), Leo Perkins      | Tallow Beach cohérente, mais ciel dominant ; la vue aérienne conserve davantage d’océan.                       |
| Noosa             | [APvr_MDHXww](https://unsplash.com/photos/APvr_MDHXww), wes lewis        | Coastal Walk près de Hell’s Gates, validé ; la vague surfée retenue évite une vue aérienne supplémentaire.     |
| Raglan            | [pI2BcDA6Hsw](https://unsplash.com/photos/pI2BcDA6Hsw), Tim Marshall     | Ngarunui Beach explicite, mais gros plan de tube ; la plage montre mieux l’environnement.                      |
| Jeffreys Bay      | [oC32cy4x-ZA](https://unsplash.com/photos/oC32cy4x-ZA), Sincerely Media  | Athlète de compétition rapproché, marques sur le matériel ; écarté.                                            |
| Jeffreys Bay      | [x319Cr8urqQ](https://unsplash.com/photos/x319Cr8urqQ), janilson furtado | Vue urbaine de Dolphin Beach avec tour, peu d’océan visible.                                                   |
| Margaret River    | [kTNGdlvcF9U](https://unsplash.com/photos/kTNGdlvcF9U), Joshua Leong     | Embouchure repérée dans les résultats ; page inaccessible (403), pas de téléchargement ni validation visuelle. |
| Torquay / Bells   | [K14ern9JHoA](https://unsplash.com/photos/K14ern9JHoA), Aleksandar Jason | Drone au-dessus du rivage ; préférence pour la baie et son promontoire identifiables.                          |
| Santa Cruz        | [BwSUpqBEXlU](https://unsplash.com/photos/BwSUpqBEXlU), Zetong Li        | Phare vertical coupé au recadrage, couleurs de coucher de soleil très dominantes.                              |
| Santa Cruz        | [AXhRG1p3bRI](https://unsplash.com/photos/AXhRG1p3bRI), Nadia Valko      | Page inaccessible (403), aucun téléchargement ni contournement.                                                |
| Santa Cruz        | [ePbI4n96S6A](https://unsplash.com/photos/ePbI4n96S6A), Y S              | Page inaccessible (429), aucun téléchargement ni contournement.                                                |

### Fichiers, intégrité et reprise du deuxième lot

Tous les fichiers finaux sont des WebP **1600 × 1000**, inférieurs à **500000 octets**, préparés avec le script existant. Poids total : **2851086 octets**. Aucun pixel généré, aucune modification de couleur ni interpolation pour agrandir les sources. Les images sont enregistrées dans le bucket public `destinations` et les chemins relatifs dans `zones.hero_image_path`.

Le [manifeste du deuxième lot](destination-image-batch-02.json) conserve les sources CDN, dates, chemins, poids et SHA-256. Vérification publique finale : **2026-09-12T16:48:19.547Z**. Les vingt photos des deux lots correspondent aux empreintes locales. Les dix chemins nouvellement renseignés sont les seules associations modifiées. Le [contrôle local de publication](../.local/destination-banners/publication-audit-02.json) contient les réponses vérifiées, métadonnées Storage, RLS et l’inventaire des 57 fallbacks.

Commande de vérification sans écriture :

```sh
node --experimental-strip-types scripts/publish-destination-images.ts --manifest docs/destination-image-batch-02.json
```

Ajouter `--publish` uniquement pour publier/reprendre un lot préparé et autorisé. Le script accepte désormais au maximum 77 destinations, conserve par défaut le premier manifeste et refuse d’écraser une image différente. Les fichiers locaux restent sous `.local/destination-images/<zone_id>/hero.webp`.

[Planche des recadrages du deuxième lot](../.local/destination-banners/batch-02-crops.jpg). [Compte rendu de la bannière et vérifications navigateur](destination-banners.md).


## Complétion des 57 zones restantes — 12 septembre 2026

**50 publications, 7 exceptions ; total final : 70 images sur 77 zones.** Aucun déploiement Vercel. Aucune modification de schéma, bucket, politique Storage, recherche, composants ou widgets. Seuls les nouveaux cadrages spécifiques sont ajoutés dans `lib/images/banner.ts`.

Sélection par navigation web normale sur Unsplash, lecture de la localisation/légende et de la licence standard, puis téléchargement des fichiers publics des photos explicitement choisies. Pas de scraping, API privée, source Unsplash+ ou image générée. Les erreurs 403/429 et pages indisponibles n’ont pas été contournées. La localisation déclarée reste une indication du photographe, pas une preuve GPS indépendante. Les photos sont éditoriales : elles ne promettent pas les conditions de surf actuelles.

### Registre des 50 nouvelles photographies

Bucket public : **destinations**. Les chemins sont relatifs au bucket. Chaque fichier est un WebP 1600 × 1000, inférieur à 500000 octets. Date d’ajout et de publication : 2026-09-12. Le [manifeste complet](destination-image-completion.json) contient aussi les URL des fichiers sources, preuves de localisation, SHA-256 et recherches des sept exceptions.

| zone_id | Destination | Pays | source_url | photographer / photographer_url | date_added | storage_path | poids_final |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `aguadilla` | Aguadilla / Rincon | Porto Rico | [Unsplash](https://unsplash.com/photos/ocean-waves-crashing-on-shore-during-daytime-UnEc30IJ81E) | [Harry Gillen](https://unsplash.com/@gillenha) | 2026-09-12 | `aguadilla/hero.webp` | 239408 octets |
| `arica` | Arica | Chili | [Unsplash](https://unsplash.com/photos/aerial-view-of-city-buildings-near-sea-during-daytime-ReighfSNSc8) | [Jorge Montesinos](https://unsplash.com/@montecom) | 2026-09-12 | `arica/hero.webp` | 225224 octets |
| `bali-cote-est` | Bali cote est (Keramas) | Indonesie | [Unsplash](https://unsplash.com/photos/a-group-of-boats-floating-on-top-of-a-body-of-water-2vGnl_OgMLs) | [Simerpreet Cheema](https://unsplash.com/@sscheema) | 2026-09-12 | `bali-cote-est/hero.webp` | 176080 octets |
| `bathsheba` | Bathsheba | Barbade | [Unsplash](https://unsplash.com/photos/brown-rock-formation-on-sea-shore-during-daytime-BRcVfkqEvg8) | [JR Harris](https://unsplash.com/@orrell_mount) | 2026-09-12 | `bathsheba/hero.webp` | 254630 octets |
| `bocas-del-toro` | Bocas del Toro | Panama | [Unsplash](https://unsplash.com/photos/a-tropical-beach-with-palm-trees-and-clear-water-BOVBjxW743U) | [Jorge Mendez](https://unsplash.com/@memoska) | 2026-09-12 | `bocas-del-toro/hero.webp` | 433850 octets |
| `carrapateira` | Carrapateira (Algarve ouest) | Portugal | [Unsplash](https://unsplash.com/photos/photography-of-seashore-during-daytime-cmYjQ30PbWk) | [Diego Gennaro](https://unsplash.com/@_nnaro_) | 2026-09-12 | `carrapateira/hero.webp` | 371190 octets |
| `coolangatta` | Coolangatta (Gold Coast sud) | Australie | [Unsplash](https://unsplash.com/photos/person-surfing-on-sea-waves-under-blue-sky-during-daytime-FdR7rZZCdt0) | [Tahlia Doyle](https://unsplash.com/@tahliaclaire) | 2026-09-12 | `coolangatta/hero.webp` | 138076 octets |
| `dakar` | Dakar (Ouakam/Ngor) | Senegal | [Unsplash](https://unsplash.com/photos/turquoise-ocean-water-with-a-distant-coastline-and-buildings-auX5lm71cQk) | [Dodji ABAH-DAKOU](https://unsplash.com/@mawss) | 2026-09-12 | `dakar/hero.webp` | 143880 octets |
| `desert-point-lombok` | Desert Point (Lombok sud-ouest) | Indonesie | [Unsplash](https://unsplash.com/photos/aerial-view-of-beach-during-daytime-vFTT3mSWi6s) | [Süleyman Coskun](https://unsplash.com/@sulox32) | 2026-09-12 | `desert-point-lombok/hero.webp` | 365438 octets |
| `fernando-de-noronha` | Fernando de Noronha | Bresil | [Unsplash](https://unsplash.com/photos/cliff-near-ocean-during-daytime-LLXhVppSMeA) | [Jaime Spaniol](https://unsplash.com/@jaimespaniol) | 2026-09-12 | `fernando-de-noronha/hero.webp` | 353546 octets |
| `g-land` | G-Land (Alas Purwo, Java) | Indonesie | [Unsplash](https://unsplash.com/photos/a-view-of-the-ocean-from-a-high-viewpoint-SXfxVAj9mcE) | [fajar raihan](https://unsplash.com/@harithdamncutecat) | 2026-09-12 | `g-land/hero.webp` | 259368 octets |
| `guethary` | Guethary / Bidart | France | [Unsplash](https://unsplash.com/photos/a-person-standing-on-a-rocky-beach-y8MkdXB3WRI) | [Laura V.](https://unsplash.com/@lauravsn_) | 2026-09-12 | `guethary/hero.webp` | 205816 octets |
| `half-moon-bay` | Half Moon Bay | Etats-Unis | [Unsplash](https://unsplash.com/photos/a-view-of-the-ocean-from-a-hill-DaNeSbU3kz4) | [Ben Moreland](https://unsplash.com/@relentlessjpg) | 2026-09-12 | `half-moon-bay/hero.webp` | 232000 octets |
| `huntington-newport` | Huntington / Newport Beach | Etats-Unis | [Unsplash](https://unsplash.com/photos/a-red-and-white-building-sitting-on-top-of-a-pier-next-to-the-ocean-X91bwWokll4) | [Jenn Bible](https://unsplash.com/@jennbible) | 2026-09-12 | `huntington-newport/hero.webp` | 182212 octets |
| `jardim-do-mar` | Jardim do Mar (Madere) | Portugal | [Unsplash](https://unsplash.com/photos/water-waves-0zgYFRzaDTE) | [Colin Watts](https://unsplash.com/@colinwatts) | 2026-09-12 | `jardim-do-mar/hero.webp` | 231110 octets |
| `kenting` | Kenting / Jialeshui (Taiwan) | Taiwan | [Unsplash](https://unsplash.com/photos/grass-field-near-seashore-sJHhk6bUaxY) | [Timo Volz](https://unsplash.com/@magict1911) | 2026-09-12 | `kenting/hero.webp` | 313238 octets |
| `la-libertad` | La Libertad / El Tunco | Salvador | [Unsplash](https://unsplash.com/photos/man-surfing-on-sea-during-daytime-DnQ6DhHvcU4) | [Michael Vilorio](https://unsplash.com/@oreovilorio) | 2026-09-12 | `la-libertad/hero.webp` | 208452 octets |
| `la-santa` | La Santa (Lanzarote) | Espagne | [Unsplash](https://unsplash.com/photos/ocean-waves-crashing-on-shore-during-daytime-oYR1694u9Lo) | [John Oswald](https://unsplash.com/@johnoswald) | 2026-09-12 | `la-santa/hero.webp` | 172330 octets |
| `malibu` | Malibu | Etats-Unis | [Unsplash](https://unsplash.com/photos/green-trees-on-mountain-beside-blue-sea-under-blue-sky-during-daytime-SDtCt-EQ0HU) | [Carl Newton](https://unsplash.com/@carl_newton) | 2026-09-12 | `malibu/hero.webp` | 232044 octets |
| `martinique-nord` | Nord Martinique (Le Precheur) | Martinique (FR) | [Unsplash](https://unsplash.com/photos/a-beach-with-boats-in-the-water-and-a-hill-in-the-background-78FvFHdU9Ss) | [Katie Heath](https://unsplash.com/@kklod) | 2026-09-12 | `martinique-nord/hero.webp` | 433008 octets |
| `maui-nord-ouest` | Maui nord-ouest (Kapalua) | Etats-Unis (Hawaii) | [Unsplash](https://unsplash.com/photos/a-rocky-beach-with-a-body-of-water-in-the-background-zk4T-pkyl38) | [Justin Busa](https://unsplash.com/@justinbusa) | 2026-09-12 | `maui-nord-ouest/hero.webp` | 211862 octets |
| `mentawai` | Iles Mentawai | Indonesie | [Unsplash](https://unsplash.com/photos/a-man-riding-a-wave-on-top-of-a-surfboard-RfpPINBADTw) | [Keaton Dickinson](https://unsplash.com/@samewayco) | 2026-09-12 | `mentawai/hero.webp` | 184264 octets |
| `mompiche` | Mompiche | Equateur | [Unsplash](https://unsplash.com/photos/palm-trees-on-brown-sand-under-white-cloudy-sky-during-daytime-9oYcyaC_NdM) | [Andrés Salgado](https://unsplash.com/@rodans_01) | 2026-09-12 | `mompiche/hero.webp` | 101166 octets |
| `moorea` | Moorea (Haapiti) | Polynesie francaise (FR) | [Unsplash](https://unsplash.com/photos/a-tropical-beach-with-palm-trees-and-blue-water-GfqLxp1JY8c) | [Roméo A.](https://unsplash.com/@gronemo) | 2026-09-12 | `moorea/hero.webp` | 262604 octets |
| `nord-fuerteventura` | Nord Fuerteventura (Corralejo/Majanicho) | Espagne | [Unsplash](https://unsplash.com/photos/a-view-of-the-ocean-from-the-shore-of-a-beach-wi8N-SrUzA4) | [Markus Wagner](https://unsplash.com/@omena_kolme) | 2026-09-12 | `nord-fuerteventura/hero.webp` | 173602 octets |
| `north-male` | Atoll Nord Male | Maldives | [Unsplash](https://unsplash.com/photos/aerial-view-of-a-lush-green-island-paradise-NH5aICDhTyQ) | [hampu](https://unsplash.com/@hampu) | 2026-09-12 | `north-male/hero.webp` | 491902 octets |
| `north-shore-oahu` | North Shore Oahu (Haleiwa/Pupukea) | Etats-Unis (Hawaii) | [Unsplash](https://unsplash.com/photos/surfer-surfing-on-tidal-wave-v5gGwubKzEA) | [Johannes Andersson](https://unsplash.com/@thejoltjoker) | 2026-09-12 | `north-shore-oahu/hero.webp` | 251210 octets |
| `pantin` | Pantin (Galice) | Espagne | [Unsplash](https://unsplash.com/photos/an-aerial-view-of-a-beach-with-waves-crashing-on-the-shore-CCLSap1AO3A) | [Jack Swords](https://unsplash.com/@jswords) | 2026-09-12 | `pantin/hero.webp` | 352774 octets |
| `pichilemu` | Pichilemu | Chili | [Unsplash](https://unsplash.com/photos/a-group-of-surfers-riding-a-wave-RmoZo0N11O4) | [Paul Berthelon Bravo](https://unsplash.com/@paulberthelon) | 2026-09-12 | `pichilemu/hero.webp` | 255728 octets |
| `popoyo` | Popoyo / Tola | Nicaragua | [Unsplash](https://unsplash.com/photos/waves-crashing-through-shore-KCJKsJPe9pQ) | [Sam Hull](https://unsplash.com/@hamsull) | 2026-09-12 | `popoyo/hero.webp` | 273820 octets |
| `puerto-escondido` | Puerto Escondido | Mexique | [Unsplash](https://unsplash.com/photos/a-large-wave-crashing-into-the-shore-of-the-ocean-uMY0W-gp1tw) | [Crisoforo Gaspar Hernandez](https://unsplash.com/@mitogh) | 2026-09-12 | `puerto-escondido/hero.webp` | 125806 octets |
| `puerto-viejo` | Puerto Viejo de Talamanca | Costa Rica | [Unsplash](https://unsplash.com/photos/olas-del-mar-rompiendo-en-la-costa-durante-la-puesta-de-sol-4YsJ1egituc) | [Milada Vigerova](https://unsplash.com/@milada_vigerova) | 2026-09-12 | `puerto-viejo/hero.webp` | 71076 octets |
| `putzu-idu` | Putzu Idu / Capo Mannu (Sardaigne) | Italie | [Unsplash](https://unsplash.com/photos/high-angle-photo-of-ocean-P45bsq-O_L8) | [Léonard Cotte](https://unsplash.com/@ettocl) | 2026-09-12 | `putzu-idu/hero.webp` | 368182 octets |
| `rapa-nui` | Hanga Roa (Ile de Paques) | Chili | [Unsplash](https://unsplash.com/photos/ocean-waves-crashing-on-rocks-during-sunset-CbqIqEgqJbw) | [Franz Nawrath](https://unsplash.com/@franz_nawrath) | 2026-09-12 | `rapa-nui/hero.webp` | 155914 octets |
| `safi` | Safi | Maroc | [Unsplash](https://unsplash.com/photos/ocean-waves-under-blue-sky-during-daytime-JqoRzl4F6xg) | [Abdelhamid Azoui](https://unsplash.com/@abdelhamid_az) | 2026-09-12 | `safi/hero.webp` | 189372 octets |
| `saint-leu` | Saint-Leu | La Reunion (FR) | [Unsplash](https://unsplash.com/photos/a-beach-with-a-body-of-water-8NHLGyaSWAk) | [Kristy An](https://unsplash.com/@kanamo25) | 2026-09-12 | `saint-leu/hero.webp` | 361888 octets |
| `sal` | Santa Maria (Sal) | Cap-Vert | [Unsplash](https://unsplash.com/photos/blue-ocean-4BNLArlwQZA) | [Martin Widenka](https://unsplash.com/@widenka) | 2026-09-12 | `sal/hero.webp` | 231318 octets |
| `san-clemente` | San Clemente | Etats-Unis | [Unsplash](https://unsplash.com/photos/a-surfer-riding-a-wave-zxwmgDtkCjE) | [Slav Romanov](https://unsplash.com/@slavromanov) | 2026-09-12 | `san-clemente/hero.webp` | 304818 octets |
| `san-cristobal-galapagos` | San Cristobal (Galapagos) | Equateur | [Unsplash](https://unsplash.com/photos/a-large-rock-outcropping-next-to-a-body-of-water-2rWejl1BABE) | [Nicolas Martin](https://unsplash.com/@red_dot_nick) | 2026-09-12 | `san-cristobal-galapagos/hero.webp` | 485680 octets |
| `san-diego` | San Diego (La Jolla) | Etats-Unis | [Unsplash](https://unsplash.com/photos/people-on-beach-during-daytime-eJBUPEHnvFY) | [Johanna Zender](https://unsplash.com/@johannavzender) | 2026-09-12 | `san-diego/hero.webp` | 459336 octets |
| `santa-barbara` | Santa Barbara / Carpinteria | Etats-Unis | [Unsplash](https://unsplash.com/photos/the-sun-is-setting-over-the-ocean-on-the-beach-cbic7pLDzJ0) | [Keara Turner](https://unsplash.com/@kmcturner) | 2026-09-12 | `santa-barbara/hero.webp` | 436530 octets |
| `santa-catalina-pa` | Santa Catalina | Panama | [Unsplash](https://unsplash.com/photos/silhouette-of-people-on-beach-during-sunset-FHRQf5psG-Q) | [Marien Raat](https://unsplash.com/@raatmarien) | 2026-09-12 | `santa-catalina-pa/hero.webp` | 98056 octets |
| `sumba-ouest` | Sumba ouest | Indonesie | [Unsplash](https://unsplash.com/photos/palm-trees-frame-a-beach-and-ocean-view-N38BCz8EY1I) | [Fadhil Abhimantra](https://unsplash.com/@fabhimantra) | 2026-09-12 | `sumba-ouest/hero.webp` | 404548 octets |
| `tamarin` | Tamarin | Ile Maurice | [Unsplash](https://unsplash.com/photos/a-beach-with-a-mountain-in-the-background-I_NtbGeuVFM) | [Daren Inshape](https://unsplash.com/@clickedbydaren) | 2026-09-12 | `tamarin/hero.webp` | 165906 octets |
| `tavarua` | Tavarua / Namotu | Fidji | [Unsplash](https://unsplash.com/photos/aerial-view-of-a-tropical-island-resort-and-turquoise-sea-A2xmF0o3-pE) | [Irvin Liang](https://unsplash.com/@il07) | 2026-09-12 | `tavarua/hero.webp` | 302342 octets |
| `teahupoo` | Teahupo'o (presqu'ile de Tahiti) | Polynesie francaise (FR) | [Unsplash](https://unsplash.com/photos/sea-wave-beside-rainbow-Z4arn7dEJCU) | [Lucie Dawson](https://unsplash.com/@luciedawson_) | 2026-09-12 | `teahupoo/hero.webp` | 33848 octets |
| `thurso` | Thurso (Ecosse) | Royaume-Uni | [Unsplash](https://unsplash.com/photos/person-riding-on-horse-running-in-seashore-1nPPNXTMcjk) | [Annie Spratt](https://unsplash.com/@anniespratt) | 2026-09-12 | `thurso/hero.webp` | 100050 octets |
| `tofo` | Tofo | Mozambique | [Unsplash](https://unsplash.com/photos/a-person-walking-on-a-beach-with-a-surfboard-_zfsjBFxpzE) | [Omoniyi David](https://unsplash.com/@mocream_coffee) | 2026-09-12 | `tofo/hero.webp` | 228770 octets |
| `unstad` | Unstad (Lofoten) | Norvege | [Unsplash](https://unsplash.com/photos/rocky-coastline-with-ocean-waves-and-mountains-at-twilight-jKVA2F-5QWA) | [David Becker](https://unsplash.com/@beckerworks) | 2026-09-12 | `unstad/hero.webp` | 299198 octets |
| `walvis-bay` | Walvis Bay / Skeleton Bay | Namibie | [Unsplash](https://unsplash.com/photos/sand-dunes-meet-the-ocean-under-a-clear-blue-sky-hJKRf9_KbhU) | [NIR HIMI](https://unsplash.com/@nirhimi) | 2026-09-12 | `walvis-bay/hero.webp` | 132378 octets |

### Localisation déclarée et périmètre géographique

Les vues voisines/régionales ci-dessous illustrent l’environnement de la zone ; elles ne sont pas présentées comme une photographie du break précis. Cette distinction est notamment importante pour Bali côte est, Desert Point, Moorea, G-Land, Tavarua/Namotu, le nord de la Martinique, Putzu Idu, Unstad et Walvis Bay.

- **aguadilla** — Rincon, Rincón, Puerto Rico.
- **arica** — Arica, Arica y Parinacota, Chile.
- **bathsheba** — Bathsheba, Barbados.
- **coolangatta** — Coolangatta, Australia.
- **fernando-de-noronha** — Fernando de Noronha, Pernambuco, Brasil.
- **half-moon-bay** — Half Moon Bay, CA, USA.
- **jardim-do-mar** — Jardim do Mar, Madeira, Portugal.
- **kenting** — Kenting, southern Taiwan (caption).
- **la-libertad** — El Tunco, El Salvador.
- **la-santa** — Calle el Quemao, La Santa, Lanzarote, Spain.
- **mentawai** — Mentawai Islands Regency, West Sumatra, Indonesia.
- **mompiche** — Mompiche, Ecuador (caption); Muisne municipality (location).
- **nord-fuerteventura** — Corralejo, Spain; view towards Isla Los Lobos.
- **rapa-nui** — Hanga Roa, Isla de Pascua, Chile.
- **safi** — Safi, Maroc.
- **sal** — Santa Maria, Cape Verde.
- **pantin** — Pantín beach, Spain.
- **maui-nord-ouest** — Point between Kapalua Bay and Namalu Bay, Maui (caption).
- **malibu** — Point Dume, Malibu, California (caption).
- **santa-catalina-pa** — Santa Catalina, Panama.
- **tamarin** — Tamarin, Mauritius.
- **tofo** — Tofo Beach, Mozambique.
- **bocas-del-toro** — Playa Drago, Bocas del Toro, Panamá (caption).
- **guethary** — Guéthary, France.
- **sumba-ouest** — Sumba Barat Daya, East Nusa Tenggara, Indonesia.
- **saint-leu** — Plage des Alizées, Saint-Leu, Réunion.
- **pichilemu** — Punta de Lobos, Pichilemu, Chile.
- **north-male** — Thulusdhoo, North Malé Atoll (caption).
- **moorea** — Moorea, Moorea-Maiao, Polynésie française — île représentative; Haapiti non attesté.
- **huntington-newport** — Huntington Beach pier, CA, USA.
- **san-clemente** — San Clemente, CA, USA.
- **puerto-escondido** — Zicatela, Oaxaca, Mexico.
- **santa-barbara** — Carpinteria, CA, USA.
- **martinique-nord** — Saint-Pierre, Martinique — côte voisine du Prêcheur.
- **desert-point-lombok** — Gili Kedis, Sekotong Barat, West Lombok — région du sud-ouest; ne représente pas le break de Desert Point.
- **north-shore-oahu** — Banzai Pipeline, Haleiwa, United States.
- **g-land** — Parc Alas Purwo selon la légende; plage précise non nommée, géotag du siège du parc.
- **teahupoo** — Teahupo'o, French Polynesia.
- **dakar** — Ile de Ngor, Dakar, Sénégal.
- **tavarua** — Mamanuca Islands, Fiji — archipel; Tavarua / Namotu non attestées.
- **san-cristobal-galapagos** — Kicker Rock / León Dormido, au large de San Cristóbal, Ecuador.
- **unstad** — La page source indique Uttakleiv Beach, Leknes, Norvège. Côte immédiatement voisine sur Vestvågøy, au sud-ouest d’Unstad ; ce paysage ne représente pas la plage d’Unstad elle-même. Recadrage de la source sur les montagnes et les vagues..
- **thurso** — Dunnet Beach, Thurso, United Kingdom.
- **san-diego** — La Jolla, San Diego, CA, USA.
- **walvis-bay** — Sandwich Harbour, Anichab, Namibia — côte régionale au sud de Walvis Bay; pas le break de Skeleton Bay.
- **puerto-viejo** — Puerto Viejo de Talamanca, Costa Rica.
- **carrapateira** — Praia da Bordeira, Carrapateira, Algarve, Portugal.
- **popoyo** — Rancho Santana, Tola, Nicaragua — côte voisine de Popoyo.
- **bali-cote-est** — La page source indique Sanur, Bali, Indonesia. Côte orientale de Bali, au sud-ouest de Keramas : visuel régional, pas une photographie du spot de Keramas..
- **putzu-idu** — Tharros, San Giovanni di Sinis, Cabras, Italy — péninsule du Sinis; pas le break de Capo Mannu.

### Sept destinations en fallback à la fin de la passe Unsplash

Ces exceptions décrivent les limites de la sélection effectuée, sans prétendre qu’aucune photo appropriée n’existe sur Internet. Aucune association ni fichier n’a été créé pour ces zones.

| zone_id | Destination | Pourquoi le fallback est conservé |
| --- | --- | --- |
| `chicama` | Puerto Malabrigo / Chicama, Perou | Aucune photographie côtière Unsplash localisée de façon suffisamment fiable à Chicama ou Puerto Malabrigo n’a été retenue. Résultats hors sujet ou pages indisponibles ; aucune image générique du Pérou substituée. |
| `lobitos` | Lobitos, Perou | Trois candidates examinées : bateau sur cadrage vertical sans littoral exploitable, puis portraits/personnes. Le double recadrage détruit le sujet ; aucune candidate de paysage suffisamment adaptée. Candidates : [YQud06QkMdI](https://unsplash.com/photos/YQud06QkMdI), [K0j5P6bKqGA](https://unsplash.com/photos/K0j5P6bKqGA), [JpT8Tsajxto](https://unsplash.com/photos/JpT8Tsajxto). |
| `nias-lagundri` | Lagundri Bay (Nias), Indonesie | Les photos trouvées pour Nias montrent notamment Gunungsitoli, un aéroport ou des personnes ; elles n’attestent pas le littoral de Lagundri/Sorake. Une autre partie de l’île n’a pas été utilisée pour remplir artificiellement cette zone. |
| `pavones` | Pavones, Costa Rica | Aucun paysage côtier Unsplash dont la localisation à Pavones ou Punta Banco soit assez fiable n’a été retenu. La page de recherche directe n’était pas accessible ; pas de contournement. |
| `pohnpei` | Pohnpei, Micronesie | Une source côtière identifiée répondait 403 et n’a pas été contournée. Alternative de cascade inadaptée ; les photos de Nate Cheney n’indiquent pas leur lieu de prise de vue, et le lieu du profil du photographe ne constitue pas une preuve. Candidates : [d779xu7rxQs](https://unsplash.com/photos/d779xu7rxQs), [OeJxnpH_AYw](https://unsplash.com/photos/OeJxnpH_AYw), [Nv53bdnHyMI](https://unsplash.com/photos/Nv53bdnHyMI), [iPrYNHEBieE](https://unsplash.com/photos/iPrYNHEBieE). |
| `punaauia` | Punaauia (Tahiti ouest), Polynesie francaise (FR) | Aucune photo côtière Unsplash suffisamment attribuable à Punaauia/Vaiava n’a été retenue. Les visuels génériques de Tahiti et les images promotionnelles de complexes de Papeete ne vérifient pas cette destination. |
| `santa-rosa-cr` | Parc Santa Rosa (Guanacaste), Costa Rica | Les résultats Playa Naranjo repérés concernent notamment le ferry du golfe de Nicoya, pas la plage du parc Santa Rosa. Les images Junquillal trouvées concernent la côte de Santa Cruz, pas la baie voisine du parc. Homonymes écartés. Candidates : [CuH8YkpQ57g](https://unsplash.com/photos/CuH8YkpQ57g). |

### Optimisation et contrôle

Préparation avec `scripts/prepare-destination-image.mjs`. Deux sources ont été recadrées avant conversion pour conserver leur sujet : Unstad/Uttakleiv (montagnes et vagues) et Teahupo’o (vague et arc-en-ciel). Atoll Nord Malé utilise WebP qualité 60, effort 6 : la végétation détaillée dépassait la limite du bucket avec le réglage habituel ; fichier final de 491902 octets, inspecté visuellement. Aucune retouche de couleur ni agrandissement artificiel.

Les 70 objets publics répondent HTTP 200 et correspondent aux empreintes des manifestes ; les 20 précédents sont inchangés. Les 70 identifiants de photos sont distincts. Aucun gros logo, portrait rapproché ou texte incrusté important repéré dans les images retenues. Les légendes/alt de l’application restent issus du nom et du pays réels.

[Planche des 77 zones](../.local/destination-completion/contact-77.jpg) · [Périmètre des 57 zones examinées, exceptions visibles](../.local/destination-completion/contact-57-scope.jpg) · [Les 50 nouvelles photos uniquement](../.local/destination-completion/contact-50-new.jpg) · [Audit public et inventaire final](../.local/destination-completion/publication-audit.json).


## Dernière passe sur les sept exceptions — 12 septembre 2026

**Six nouvelles publications, total : 76 images / 77 zones. Pavones reste en fallback.** Les 70 images existantes sont préservées octet pour octet et leurs chemins sont inchangés. Aucun déploiement Vercel. Aucune modification du schéma ou du bucket, des coordonnées, du moteur surf ou des widgets.

Toutes les nouvelles images font **1600 × 1000, WebP, moins de 500 000 octets**. Originaux sélectionnés manuellement sur des pages publiques ; métadonnées des fichiers Commons confirmées avec l’API publique officielle MediaWiki. Aucun scraping Unsplash, aucune API privée, aucune image générée.

### Sources et droits des six photos publiées

| zone_id | Destination | Pays | Source originale | Photographe | Licence | Attribution visible requise | Chemin dans destinations | Poids final | Date |
|---|---|---|---|---|---|---|---|---|---|
| `chicama` | Puerto Malabrigo / Chicama | Perou | [Pexels](https://www.pexels.com/photo/birds-flying-over-the-sea-with-silhouette-of-person-standing-on-a-cliff-4109127/) | [Viajero Cool](https://www.pexels.com/@viajerocool/) | [Pexels License](https://www.pexels.com/license/) | Non | `chicama/hero.webp` | 156174 octets | 2026-09-12 |
| `lobitos` | Lobitos | Perou | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Vista_del_balneario_de_Lobitos,_Talara_-_Piura.jpg) | [German Ato Zavala](https://commons.wikimedia.org/wiki/Special:Contributions/Germanato.zava94) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Oui — ajoutée dans l’application | `lobitos/hero.webp` | 269156 octets | 2026-09-12 |
| `nias-lagundri` | Lagundri Bay (Nias) | Indonesie | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Singa_nasi_Sorake.jpg) | [Edison Zega A.Lewi](https://commons.wikimedia.org/wiki/User:Edison_Zega_A.Lewi) | [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) | Non | `nias-lagundri/hero.webp` | 241914 octets | 2026-09-12 |
| `pohnpei` | Pohnpei | Micronesie | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Pohnpei_lagoon_from_plane.jpg) | [Zykasaa](https://commons.wikimedia.org/wiki/Special:Contributions/Zykasaa) | [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) | Oui — ajoutée dans l’application | `pohnpei/hero.webp` | 329290 octets | 2026-09-12 |
| `punaauia` | Punaauia (Tahiti ouest) | Polynesie francaise (FR) | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Coucher_de_soleil_sur_Moorea.jpg) | [Rioga98](https://commons.wikimedia.org/wiki/User:Rioga98~commonswiki) | [Public Domain (PD-self)](https://commons.wikimedia.org/wiki/File:Coucher_de_soleil_sur_Moorea.jpg#Licensing) | Non | `punaauia/hero.webp` | 57176 octets | 2026-09-12 |
| `santa-rosa-cr` | Parc Santa Rosa (Guanacaste) | Costa Rica | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Roca_Bruja_-_Guanacaste_-_Costa_Rica.jpg) | [dog4aday](https://www.flickr.com/people/dog4aday/) | [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) | Oui — ajoutée dans l’application | `santa-rosa-cr/hero.webp` | 99428 octets | 2026-09-12 |

Les sources CDN, dimensions originales, SHA-256, modifications et positions sont conservés dans [le manifeste de cette passe](destination-image-final-seven.json). Le fichier est stocké dans le bucket public `destinations` ; PostgreSQL contient seulement le chemin relatif.

- **Puerto Malabrigo / Chicama** — La page du photographe indique Puerto Malabrigo, La Libertad, Peru, le lieu de la zone Chicama. Côte et vagues, silhouette lointaine. Cadrage : `center`.
- **Lobitos** — Description de l’auteur : balneario de Lobitos, province de Talara, Piura, nord du Pérou. Jetée et côte de Lobitos. La longitude positive de la fiche Commons est incohérente avec son lieu explicite ; ne pas la reprendre. Supabase indique correctement -81.282. Cadrage : `center 40%`.
- **Lagundri Bay (Nias)** — Œuvre personnelle légendée Sorake Beach Side. Même côte et récif que les vues géolocalisées Pantai Sorake et Ndulu pantai sorake (0.570520 N, 97.731969 E). Sorake borde Lagundri Bay. Anomalie distincte en base : latitude de la zone et du spot négative ; aucune correction effectuée. Cadrage : `center 40%`.
- **Pohnpei** — Œuvre personnelle : vue aérienne du lagon de Pohnpei, îlots Sapwtik et Deke Sokehs explicitement nommés par l’auteur. Côte nord de Pohnpei ; image représentative de la zone, sans prétendre montrer la vague P-Pass. Cadrage : `center 35%`.
- **Punaauia (Tahiti ouest)** — L’auteur précise que la vue de Moorea est prise depuis la commune de Punaauia à Tahiti. Le premier plan est la côte et le lagon de Punaauia ; ne pas présenter Moorea à l’horizon comme Tahiti. Cadrage : `center 95%`.
- **Parc Santa Rosa (Guanacaste)** — Roca Bruja / Witch’s Rock, plage du parc national Santa Rosa au Guanacaste. Correspond au spot Playa Naranjo (Witch’s Rock) associé à santa-rosa-cr, et non aux lieux homonymes. Cadrage : `center 55%`.

### Attribution et adaptations

Les licences [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/) et [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) autorisent l’usage commercial et le recadrage sous leurs conditions. Les trois crédits nécessaires sont centralisés dans `lib/images/credits.ts` et rendus côté serveur : auteur, titre lié à la source, licence liée à son texte, mention du recadrage et de la conversion WebP. Les adaptations BY-SA restent diffusées sous **CC BY-SA 4.0** ; aucune restriction supplémentaire n’est appliquée à ces images. Les crédits sont placés près de la bannière, sous les photos des cartes, après les suggestions concernées et dans les mentions légales. `DestinationHero` et `DestinationImage` restent inchangés.

Les trois autres photos sont sous [licence Pexels](https://www.pexels.com/license/), [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) ou cession explicite au domaine public par l’auteur (PD-self, avec autorisation mondiale sans conditions). Leur attribution n’est pas obligatoire ; leurs auteurs restent systématiquement documentés ici. Les dérivés Storage contiennent aussi auteur, source, licence et modifications dans leurs métadonnées XMP, sans reprendre les données EXIF personnelles de la prise de vue.

**Déploiement :** la version publique inspectée lors de cette passe ne consommait pas encore les images Supabase (page Lobitos sans aucune image). Le code d’attribution fait partie du travail local et doit impérativement accompagner le prochain déploiement des bannières. Ne pas déployer une ancienne version dépourvue de ces crédits avec les nouvelles associations Storage. Aucun déploiement effectué ici.

### Pavones : recherches et rejets précis

Lieu vérifié en base : **Pavones, Costa Rica, 8.391 N / 83.133 W**, spot `pavones`. Ne pas confondre avec Pavones en Espagne ou le district intérieur de Turrialba.

Recherches effectuées : Pavones Costa Rica, Playa Pavones, Pavones surf/beach/coast, Punta Banco Costa Rica ; recherches exactes sur Unsplash, Pexels, Wikimedia Commons et Pixabay, puis vérification des originaux identifiables.

| Candidate ou source examinée | Localisation / droits | Motif de rejet |
|---|---|---|
| [Playa Pavones — Arturo Sotillo / Wha’ppen](https://www.flickr.com/photos/whappen/1337575712/) ; [taille originale](https://www.flickr.com/photos/whappen/1337575712/sizes/o/) | L’auteur décrit bien la plage de Pavones ; CC BY-SA 2.0 | Original **800 × 600** seulement, confirmé par la page de téléchargement publique. Impossible d’obtenir 1600 × 1000 sans agrandissement artificiel. |
| [Beachview in Punta Banco, Costa Rica — Froukjevd](https://commons.wikimedia.org/wiki/File:Beachview_in_Punta_Banco,_Costa_Rica.jpg) | Côte immédiatement voisine ; GPS 8.347419 N / 83.126228 W ; CC BY-SA 4.0 | **640 × 480**, aucune résolution supérieure sur la fiche de l’auteur. |
| [Pavones sur Pexels](https://www.pexels.com/search/pavones/) et recherches exactes | Résultats surtout consacrés aux paons ou à d’autres côtes du Costa Rica | Aucun fichier suffisamment bien localisé retenu ; pas de substitution par une plage éloignée. |
| Unsplash et Pixabay | Variantes Pavones / Playa Pavones / Punta Banco, recherches géographiques exactes | Aucune nouvelle candidate à la fois localisable et appropriée au format requis. |
| [Candidate Hippopx annoncée Pavones](https://www.hippopx.com/en/free-photo-amkri) | L’index annonce une image 6000 × 4000 et un usage commercial | Auteur et provenance originale non vérifiables ; accès HTTP 403, aucun contournement. Un libellé « public domain » non traçable ne suffit pas. |

Les candidates annoncées sous **CC BY-NC**, **CC BY-NC-ND** ou **CC BY-ND** n’ont pas été publiées : ces restrictions ne conviennent pas à l’usage commercial et/ou au recadrage prévu. La mention de licence d’un site agrégateur n’a jamais été traitée comme une preuve suffisante sans vérification de l’original.

### Anomalie de coordonnées signalée, sans modification

`zones.zone_id = nias-lagundri` : `lat_centre = -0.573000`.
`spots.spot_id = lagundri-bay` : `lat = -0.573000`.

Les vues de Sorake géolocalisées par leurs auteurs, notamment [Pantai Sorake](https://commons.wikimedia.org/wiki/File:Pantai_Sorake.jpg) et [Ndulu pantai sorake](https://commons.wikimedia.org/wiki/File:Ndulu_pantai_sorake.jpg), situent la côte vers **+0.570520 / 97.731969**, donc au nord de l’équateur. Le signe de latitude en base nécessite une vérification éditoriale. Aucune valeur n’a été corrigée hors `hero_image_path`.

### Vérifications de publication

Audit Supabase final : **77 zones, 76 chemins associés, 1 fallback (Pavones)**. Les 76 fichiers publics répondent HTTP 200, ont des SHA-256 distincts et correspondent aux manifestes ; les 70 précédents sont inchangés. [Audit détaillé local](../.local/destination-final-seven/publication-audit.json). Les captures et résultats de validation sont récapitulés dans [le compte rendu de cette passe](destination-image-final-seven.md).
