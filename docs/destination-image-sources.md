# Sources des images destinations

## État au 12 septembre 2026

**20 photographies publiées dans Supabase, en deux lots de dix, le 12 septembre 2026.** Les 57 autres zones conservent leur fallback ; le catalogue contient toujours 77 zones. Les dix photos du premier lot sont inchangées.

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

Ajouter `--publish` uniquement pour publier/reprendre un lot préparé et autorisé. Le script accepte au maximum quinze destinations, conserve par défaut le premier manifeste et refuse d’écraser une image différente. Les fichiers locaux restent sous `.local/destination-images/<zone_id>/hero.webp`.

[Planche des recadrages du deuxième lot](../.local/destination-banners/batch-02-crops.jpg). [Compte rendu de la bannière et vérifications navigateur](destination-banners.md).
