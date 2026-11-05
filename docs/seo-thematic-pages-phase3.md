# Pages thématiques SEO — phase 3

**État actuel : refonte éditoriale et visuelle terminée localement le 5 novembre 2026.** Le compte rendu de cette nouvelle mission, les mesures avant/après, les captures et les validations figurent dans la [section J](#refonte-editoriale). Les sections précédentes conservent l’historique de la création des pages ; leurs grands tableaux ont depuis été remplacés dans l’interface. Aucun déploiement effectué.

## A. Audit initial, avant modification

Audit et tests du 4 novembre 2026, rapport finalisé le 5 novembre. Dépôt propre au départ ; phases 1 et 2 présentes et leurs deux rapports consultés. Next.js installé : **16.3.4**, App Router. Guides embarqués Metadata API, routes dynamiques, notFound, sitemap et JSON-LD consultés avant écriture.

Routes publiques recensées : `/`, `/destinations`, `/destination/[slug]`, `/recherche` et son alias `/search`, pages légales, sitemap, robots et ressources sociales. Les deux handlers Booking/CJ restent techniques et non indexables. Aucune route thématique ou comparative équivalente. La section d’inspiration de l’accueil renvoie au catalogue, sans article distinct.

Le sitemap de production répond HTTP 200, contient **79 URL sur `https://www.surftrips.fr`**, dont 77 destinations. Les cinq chemins envisagés répondent actuellement 404 en production. Cela vérifie leur absence publique, pas leur historique dans Search Console, inaccessible ici. Aucun domaine ni déploiement modifié.

Recensement PostgreSQL en lecture seule : **77 zones, 94 spots, 59 présentations effectives manquantes, 41 idéaux historiques `tous_niveaux`, 107 liens de pays de phase 2**. Source conservée dans `.local/seo-phase3/source-before.json`. Les cinq contenus de phase 2 restent intacts.

Architecture réutilisée : `getCatalog` (une lecture agrégée, cache 60 s), adaptateur `adaptZone`, helpers de saison `monthStatus` et `bestSeasonStatus`, Metadata API via `pageMetadata`, `catalogSitemap`, origine et sérialisation JSON-LD de `lib/seo.ts`. Le moteur trie les recommandations personnalisées par score et niveau ; les guides ne modifieront pas ce moteur.

`SearchBar` accepte des valeurs initiales partielles mais les routes de résultats attendent un voyage complet validé. Aucun paramètre mois isolé n’existe. Les CTA mensuels ouvriront donc le formulaire existant, sans dates fabriquées. Le guide Portugal pourra réutiliser le même `SearchBar` avec seulement le pays initialisé ; les dates resteront à saisir et les valeurs par défaut seront celles du composant actuel.

`DestinationCard` a été examiné : son résumé agrégé des niveaux et sa frise annuelle ne suffisent pas à expliquer la sélection d’un mois. Les nouveaux tableaux expliciteront les faits **par spot**, avec les styles, liens, images et composants existants lorsqu’ils conviennent. Les blocs éditoriaux restent dans `lib/editorial/`, distincts des données surf.

## Décision de publication

| Intention | Décision issue de l’audit |
|---|---|
| Novembre | Publiable : 35 zones avec au moins un spot en bonne période, 20 en épaule, 22 hors saison selon les fonctions métier. |
| Décembre | Publiable : 35 zones en bonne période, 5 en épaule, 37 hors saison ; les ensembles diffèrent de novembre. |
| Débutant | **Différée** : les 41 spots au minimum `debutant` ont tous un idéal historique à vérifier. Pas de preuve de validation humaine supplémentaire dans le schéma. Aucune liste de recommandations débutant publiée, aucun lien ni URL sitemap pour cette intention. Le moteur existant conserve son traitement distinct du minimum et de l’idéal. |
| Portugal | Publiable : cinq zones réelles, trois aéroports d’arrivée et six spots documentés. |
| Comparatif Ericeira / Peniche | Publiable dans les limites de la base : même aéroport LIS, transferts renseignés, types de vagues/fonds et saisons comparables. L’idéal incertain de Ribeira d’Ilhas reste explicite ; le comparatif ne recommande pas une destination comme sûre pour débutants. |

Le report de la page débutant est une précaution éditoriale propre à cette nouvelle publication, pas une conversion ni une nouvelle règle du moteur. Le seul fait de remplacer `tous_niveaux` par un enum reconnu ne constituerait pas à lui seul une validation humaine de sécurité.

Les routes retenues seront `/ou-surfer-en/novembre`, `/ou-surfer-en/decembre`, `/surf/portugal`, `/comparer/ericeira-vs-peniche`. Pas de route générique de pays/niveau/comparaison et seulement deux mois autorisés. Les inconnus et `/surf-debutant` resteront en 404. Aucun développement d’une quatrième phase.

## B. Pages réalisées

**Trois intentions prioritaires et un comparatif pilote sont implémentés et indexables sur le build local.** La quatrième intention prioritaire, débutant, reste différée pour la raison documentée ci-dessus. « Publiée » dans le code désigne une route autorisée par le registre éditorial, pas un déploiement effectué. Les nouvelles pages ne sont pas encore en production.

Les canonical utilisent toutes `https://www.surftrips.fr`. Les titles ci-dessous reçoivent le suffixe existant ` | Surftrips.fr`. Chaque page dispose d’une description propre, d’Open Graph et de Twitter Card, avec l’image sociale existante `/opengraph-image`. Un H1 unique, un fil d’Ariane HTML et des tableaux sémantiques sont rendus côté serveur. JSON-LD : `BreadcrumbList` et `ItemList` correspondant exactement aux destinations visibles, sans notes, offres, auteurs ou FAQ inventés.

### `/ou-surfer-en/novembre`

- **Intention :** choisir parmi les destinations du catalogue selon les périodes renseignées pour novembre, puis son niveau.
- **Title :** Où surfer en novembre ? Destinations, spots et saisons
- **Description :** Compare les destinations de Surftrips en novembre : périodes favorables ou d’épaule, niveaux par spot et saisons qui changent à l’approche de décembre.
- **Sélection :** 35 zones en bonne période et 20 en épaule, soit 55 destinations distinctes. Les 22 hors saison ne sont pas proposées dans les tableaux.
- **Contenu spécifique :** lecture d’un voyage qui se prolonge en décembre ; Hossegor, Bundoran et Thurso quittent la catégorie bonne période entre les deux mois. Deux tableaux séparent bonne période et épaule, avec noms des spots, mois, statut par spot, minimum/idéal, vague et fond. Explication du passage d’un critère saisonnier au choix d’un spot.
- **CTA :** « Trouver ma destination surf en novembre » → `/destinations#recherche`. Aucune date ni origine inventée.

### `/ou-surfer-en/decembre`

- **Intention :** préparer un voyage de décembre en lisant correctement les saisons qui traversent l’année.
- **Title :** Où surfer en décembre ? Préparer son surf trip
- **Description :** Prépare un surf trip en décembre avec les saisons documentées de Surftrips : spots, niveaux, différences avec novembre et périodes qui traversent la fin d’année.
- **Sélection :** 35 zones en bonne période et 5 en épaule, soit 40 destinations distinctes. Les 37 hors saison ne figurent pas dans les tableaux.
- **Contenu spécifique :** 33 des 35 zones en bonne période possèdent un spot dont la saison traverse le changement d’année. Fernando de Noronha, Mompiche et Puerto Viejo entrent en bonne période par rapport à novembre. Les ensembles et le contexte éditorial diffèrent de novembre ; mêmes composants de faits, sans copier son introduction.
- **CTA :** « Trouver ma destination surf en décembre » → `/destinations#recherche`, sans préremplissage mensuel approximatif.

### `/surf/portugal`

- **Intention :** comparer les zones portugaises documentées, leurs spots et leurs accès.
- **Title :** Surf trip au Portugal : quelles destinations choisir ?
- **Description :** Compare les zones portugaises de Surftrips par spots, niveaux, périodes et aéroports d’arrivée, puis personnalise ton surf trip au Portugal.
- **Sélection dynamique :** `country === "Portugal"`, soit `carrapateira`, `ericeira`, `jardim-do-mar`, `nazare`, `peniche` ; six spots. Aucun tableau de spots recopié dans le contenu éditorial.
- **Contenu :** tableau illustré des spots ; regroupement des accès par Faro/FAO, Funchal/FNC et Lisbonne/LIS ; méthode de choix par spot, saison puis arrivée. Les calendriers sur un seul mois ou toute l’année restent présentés sans extrapolation.
- **CTA :** « Organiser mon surf trip au Portugal » → `#recherche`. Le `SearchBar` existant est réutilisé avec uniquement `region: "Portugal"`. Les valeurs par défaut du composant sont conservées ; dates libres. Le test choisit ensuite Genève et Expert, saisit des dates, vérifie les cinq résultats portugais et la conservation des critères jusqu’à la fiche.

### `/comparer/ericeira-vs-peniche`

- **Intention :** comparer deux zones avec des informations réellement comparables, sans classement global.
- **Title :** Ericeira ou Peniche : comparer les spots et les accès
- **Description :** Ericeira ou Peniche pour ton surf trip ? Compare les spots documentés, niveaux, saisons et transferts depuis Lisbonne, sans score ni gagnant arbitraire.
- **Identifiants :** `ericeira` et `peniche` (nom public « Peniche / Baleal »).
- **Critères :** Coxos et Ribeira d’Ilhas à Ericeira, Supertubos à Peniche ; minimum/idéal par spot, saisons, vagues/fonds, arrivée LIS et transferts renseignés. La présence de deux fiches contre une n’est pas présentée comme le nombre réel de spots de ces zones.
- **Limites visibles :** idéal de Ribeira d’Ilhas « À vérifier » ; couverture de Peniche limitée à Supertubos ; aucun gagnant, prix, météo, foule ou garantie de sécurité.
- **CTA :** « Personnaliser mon surf trip au Portugal » → `/surf/portugal#recherche`.

### Architecture et critères de publication

`lib/editorial/themes.ts` est le registre explicite des quatre publications ; seuls novembre et décembre sont admis par la route mensuelle. Portugal et le comparatif ont des routes statiques nommées. `/surf-debutant`, janvier, pays non publié, combinaison mois/niveau et comparatif inversé renvoient 404 avec noindex. Il n’existe aucune génération de toutes les combinaisons.

Les sélections pures se trouvent dans `lib/surf/thematic.ts`. Elles réutilisent `bestSeasonStatus` et `monthStatus`, sans modifier les fonctions métier. Les destinations sont groupées par meilleur statut, puis triées par pays, nom et identifiant ; chaque ligne précise le statut propre à son spot. Aucun score SEO ni classement « meilleur spot ».

Le chargement `getThemePage`, réservé au serveur et mémorisé dans la requête, utilise une seule lecture de catalogue déjà agrégée et mise en cache pendant 60 secondes. Métadonnées et page partagent ce chargement. Pas de requête par carte ou spot. Les erreurs Supabase ne deviennent pas un catalogue vide présenté comme valide. L’absence des données indispensables retire une publication du sitemap et de ses liens ; sa route répond 404. Le comparatif exige les deux zones, pays/aéroport attendus, transferts, niveaux minimum reconnus, mois valides, vagues et fonds.

Les pages utilisent le même rendu serveur à la demande que les pages publiques existantes. Seuls les composants déjà interactifs, notamment le formulaire et l’image avec fallback, ont besoin de code client. Aucune dépendance ni migration ajoutée. Les nouveaux tableaux restent légers : aucune image dans les guides mensuels, cinq miniatures existantes chargées paresseusement pour le Portugal.

**Sources des faits :** données structurées de Surftrips lues le 4 novembre, et uniquement elles. Les noms, saisons, niveaux et transferts restent ceux du projet ; ils n’ont pas fait l’objet d’une nouvelle certification sur le terrain. Aucune nouvelle affirmation de surf issue d’une source externe. Les sources éditoriales de phase 2 restent attachées aux fiches et ne sont pas présentées comme des validations des autres zones.

## C. Maillage interne

| Sens | Liens HTML ajoutés | Couverture |
|---|---:|---|
| Novembre → destinations | 58 | 55 destinations distinctes, dont 3 rappelées dans l’explication du changement de mois |
| Décembre → destinations | 43 | 40 distinctes, dont 3 rappelées dans l’explication |
| Portugal → destinations | 10 | 5 zones, tableau et accès |
| Comparatif → destinations | 4 | 2 zones, colonnes et liens détaillés |
| Destinations → guides | 102 | 58 fiches concernées ; seulement les guides dont la sélection contient la zone |
| Guide → guide | 4 | Novembre ↔ décembre ; Portugal ↔ comparatif |
| Catalogue → guides | 4 | Section compacte après le formulaire |
| **Total des nouvelles occurrences éditoriales** | **225** | Hors CTA, fil d’Ariane et navigation globale |

Les **107 liens entre destinations de phase 2 sont conservés**. Le nombre d’occurrences n’est pas une cible SEO : les répétitions servent la lecture des tableaux et l’accès aux détails. Toutes les cibles destination sont vérifiées HTTP 200 par l’audit des 77 fiches. Aucun paramètre de personnalisation n’est ajouté aux liens éditoriaux. Les destinations non sélectionnées ne reçoivent pas de section vide. Les liens retour sont ajoutés après le contenu et le maillage existants ; Surf → Vol → Logement reste en place.

L’inventaire exact des destinations présentées et des fiches recevant un lien retour figure à la fin du rapport. Il est aussi recalculé dans `phase3.rows` et `phase3.destinationBacklinks` par `npm run audit:seo`.

## D. Sitemap et SEO technique

| Contrôle | Avant | Après, build local |
|---|---:|---:|
| Total d’URL canoniques | 79 | 83 |
| Destinations | 77 | 77 |
| Accueil et catalogue | 2 | 2 |
| Guides publiés | 0 | 4 |
| Doublons, URL inconnues ou personnalisées | 0 | 0 |

Les quatre chemins de la section B sont ajoutés par le registre, pas par un total codé en dur. Le sitemap demeure HTTP 200, XML valide, sans routes affiliées, sans page débutant et sans `lastModified` artificiel. Les canonical et OG restent sur le domaine `www`. Aucun changement de robots.txt, politique GPTBot, protections de preview ou règles de domaine. L’audit et les tests de non-régression des robots existants passent. Aucun compte de moteur de recherche n’a été modifié.

## E. Données et points à vérifier

| Source | Champs exploités |
|---|---|
| `zones` | `zone_id`, `nom`, `pays`, `code_aeroport`, `aeroport`, `transfert`, `hero_image_path` |
| `spots` | `spot_id`, `zone_id`, `nom`, `niveau_min`, `niveau_ideal`, `mois_debut`, `mois_fin`, `saison_ideale`, `type_vague`, `fond` |
| Adaptateur existant | Validation des identifiants/images/niveaux/mois ; `minimumNeedsReview`, `idealNeedsReview` ; `flag_verif` conservé comme `caution` |

Les autres champs du catalogue restent disponibles au produit, sans nouvelles déductions géographiques. `hasUnambiguousBeginnerLevel` sert uniquement au diagnostic de la future intention débutant, pas au moteur de recherche ni à une publication automatique. Il écarte les idéaux inconnus et signalements ; même un résultat reconnu par les enums ne remplacerait pas une validation humaine de sécurité.

Les **41 niveaux idéaux `tous_niveaux` dans 38 zones sont inchangés**. Leur inventaire avec spot, zone, champ et valeur reste dans [le rapport de phase 2](seo-destinations-phase2.md#41-niveaux-idéaux-historiques--aucune-conversion) et dans `phase2.detailedLevelReview` de l’audit réexécuté. Tous les minimums `debutant` de la source actuelle sont concernés : aucune sélection dépourvue d’ambiguïté à publier comme recommandations pour débutants.

Les **59 présentations effectives manquantes** restent absentes ; aucune présentation n’a été ajoutée pendant cette phase. Les cinq enrichissements précédents sont conservés. Les mois sont tous valides au sens technique, ce qui ne valide pas leur exactitude éditoriale. Points déjà identifiés : septembre seul pour Praia da Bordeira ; calendrier annuel de Ribeira d’Ilhas et Pantin ; contradiction du signalement de Popoyo avec sa plage mars–avril. Popoyo n’est pas dans les guides novembre/décembre. Les signalements d’accès et de géographie restent à consulter dans les fiches et dans l’inventaire de phase 2 avant de nouvelles recommandations.

Une comparaison SHA-256 des projections complètes lues avant et après confirme l’identité des **77 zones et 94 spots** : niveaux, mois, notes, transferts, coordonnées, images et signalements compris. Artefact : `.local/seo-phase3/source-integrity.json`. Les requêtes passent par les transactions `READ ONLY` existantes ; aucune écriture Supabase, aucun changement de RLS ni de migration.

## F. Fichiers livrés

| État | Fichier | Rôle |
|---|---|---|
| Créé | `lib/surf/thematic.ts` | Sélections déterministes, transitions mensuelles, diagnostic débutant ; réutilisation de la saison métier |
| Créé | `lib/editorial/themes.ts` | Registre éditorial explicite, garde de publication et relations pertinentes |
| Créé | `lib/editorial/theme-data.ts` | Chargement serveur partagé avec les métadonnées |
| Créé | `components/editorial/ThemePage.tsx` | Explications spécifiques, comparatif, accès, CTA et formulaire existant |
| Créé | `components/editorial/ThemeSpotTable.tsx` | Tableau sémantique de faits par spot et images existantes |
| Créé | `app/ou-surfer-en/[mois]/page.tsx` | Deux mois autorisés, métadonnées, vraie 404 |
| Créé | `app/surf/portugal/page.tsx` | Guide Portugal |
| Créé | `app/comparer/ericeira-vs-peniche/page.tsx` | Unique comparatif pilote |
| Créé | `scripts/seo-theme-audit.ts` | Contrôles des guides appelés par la commande SEO existante |
| Créé | `tests/thematic.test.ts` | 10 tests unitaires de sélection, niveaux, sitemap et JSON-LD |
| Créé | `tests/e2e/themes.spec.ts` | HTML sans JS, HTTP, responsive, accessibilité, maillage, parcours Portugal |
| Créé | `docs/seo-thematic-pages-phase3.md` | Présent rapport et inventaire |
| Modifié | `lib/seo.ts` | Extension du sitemap et JSON-LD des listes, avec les helpers existants |
| Modifié | `app/sitemap.ts` | Injection des seules publications disponibles |
| Modifié | `app/destination/[slug]/page.tsx` | Liens retour conditionnels, même catalogue déjà chargé |
| Modifié | `app/destinations/page.tsx` | Quatre liens de découverte sous le moteur |
| Modifié | `app/globals.css` | Styles limités aux guides/tableaux et réutilisation des tokens |
| Modifié | `scripts/audit-seo.ts` | Réutilise le recensement réel, vérifie sitemap, guides et liens retour |

Aucun fichier supprimé. Aucun fichier de dépendances modifié. Composants réutilisés : `SearchBar`, `DestinationImage`, `DestinationPhotoCredit`, `Icon`, layout et navigation globale. `DestinationCard` reste utilisé dans le produit ; pas de changement de son comportement. Les captures et mesures temporaires sont sous `.local/seo-phase3/`, ignoré par Git ; ils ne constituent pas une seconde source de données pour le site.

## G. Validation réellement exécutée

Serveur de production local : `http://127.0.0.1:3004`, construit par `npm run build`. Validation sur données Supabase réelles, sans écriture.

| Vérification | Résultat |
|---|---|
| `npm run audit:seo` | **Aucune erreur**, 77 destinations source/éligibles/indexables et HTTP 200 ; 83 URL sitemap, aucune manquante ou supplémentaire ; quatre guides conformes |
| HTML reçu hors scripts/RSC | Titres, descriptions, H1, faits, liens et hiérarchie vérifiés ; les quatre guides et cinq destinations prioritaires également parcourus avec JavaScript désactivé |
| Métadonnées et JSON-LD | Une canonical par page, OG/Twitter cohérents, liste JSON-LD égale aux destinations visibles, sérialisation échappée ; aucune duplication de title/description signalée |
| Images sociales | 77 URL d’image distinctes vérifiées par l’audit, fallback social compris ; miniatures du Portugal conservées |
| `npm test` | **68/68 réussis**, dont 10 nouveaux ; aucun test unitaire ignoré |
| `npm run typecheck` | Réussi |
| `npm run lint` | Réussi |
| `npm run build` | Réussi, Next.js 16.3.4 ; routes attendues uniquement |
| Navigateur, campagne de régression | 82 cas planifiés : 72 réussis, 2 erreurs du nouveau test de formulaire, 8 doublons de largeurs ignorés intentionnellement |
| Reprise ciblée après correction du test | **2/2 réussis** sur ordinateur et mobile ; bilan des cas distincts : **74 validés, 8 ignorés**, aucun échec restant non résolu |
| Responsive | Quatre guides à **1440, 1280, 768 et 390 px** ; cinq destinations prioritaires aux mêmes largeurs ; pas de débordement global, CTA accessibles, défilement des tableaux au clavier quand nécessaire |
| Accessibilité | Axe WCAG 2 A/AA et 2.1 AA : aucune violation détectée sur les quatre guides aux deux profils ; H1 unique, légendes et en-têtes de tableaux, liens et focus contrôlés |
| Recherche | Formulaire Portugal → résultats réels → Ericeira ; pays, Expert, GVA et dates conservés ; moteur et filtres existants également couverts par les tests antérieurs |
| Affiliation | Parcours Surf → Vol → Logement conservé ; routes Booking/CJ, redirections temporaires, SID et validations couverts par les tests unitaires/navigateur |
| Travelpayouts/Kiwi réel | Préremplissage et redirection réelle vers la recherche Kiwi réussis sur les deux profils ; endpoint widget HTTP 200, état final observé **fallback** sur les deux profils |
| Charge des guides | Aucun appel Kiwi/Travelpayouts/Booking dans les quatre guides ; aucune erreur JavaScript détectée dans les parcours responsive ; pas de nouvelle dépendance ni N+1 |

Les premiers tests utilisaient un sélecteur `button` pour le niveau, puis `check()` sur un radio immédiatement démonté après sélection. Le test final clique le radio et vérifie le bouton « Niveau Expert ». Un autre test exigeait un défilement même lorsque le comparatif tenait à 768 px ; il teste maintenant le défilement uniquement si la largeur du tableau l’exige. Aucun comportement produit n’a été modifié pour faire passer ces contrôles. La campagne complète n’a pas été relancée après cette dernière correction du test : seuls les deux cas concernés ont été réexécutés, avec succès.

Les contrôles Booking ne constituent pas une réservation réelle ni une preuve d’attribution d’une commission par CJ. Le fallback Kiwi fonctionnel ne prouve pas que le partenaire affiche des offres dans toutes les conditions. Aucun achat ou paiement effectué. Les **Core Web Vitals terrain, le p75, INP et un score Lighthouse ne sont pas mesurés dans cette phase** ; les observations locales de responsive et d’absence de widgets ne sont pas des mesures terrain. Les tests automatisés d’accessibilité ne remplacent pas une validation exhaustive avec toutes les technologies d’assistance.

URL contrôlées : les 77 `/destination/{zone_id}` ; `/`, `/destinations`, `/sitemap.xml`, `/robots.txt`, `/opengraph-image` ; les quatre chemins de la section B ; recherche et liens d’affiliation existants ; `/destination/ericeira` avec origine, dates et niveau ; `/destination/biarritz`, `/destination/imsouane`, `/destination/bukit-bali` (Uluwatu), `/destination/hossegor` en navigateur. Les routes inexistantes/non publiées testées incluent `/surf-debutant`, `/ou-surfer-en/janvier`, `/ou-surfer-en/__proto__`, `/ou-surfer-en/novembre/debutant`, `/surf/espagne`, `/comparer/peniche-vs-ericeira` : HTTP 404 avec noindex. Une URL novembre paramétrée conserve la canonical propre.

Artefacts locaux : `audit-final.json`, `source-before.json`, `source-integrity.json`, captures `screenshots/`, campagne `e2e-final/`, reprise ciblée `e2e-form/`. Les rapports de phases 1 et 2 restent inchangés.

Commandes de reproduction, après lancement du build local :

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run start -- --hostname 127.0.0.1 --port 3004
```

Dans un autre terminal :

```sh
SEO_BASE_URL=http://127.0.0.1:3004 SEO_REPORT_PATH=.local/seo-phase3/audit-final.json npm run audit:seo
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3004 npm run test:e2e -- tests/e2e/themes.spec.ts tests/e2e/seo.spec.ts tests/e2e/editorial.spec.ts tests/e2e/landing.spec.ts tests/e2e/travel.spec.ts tests/e2e/travel-live.spec.ts tests/e2e/accommodation.spec.ts
```

`audit:seo` requiert les variables de connexion existantes et Chrome disponible pour analyser le HTML reçu. Les tests réels de partenaires nécessitent le réseau et les paramètres d’affiliation existants. Aucun secret n’est inclus dans le rapport.

## H. Actions manuelles

1. **Validation avant votre futur déploiement :** relire les quatre guides et le comparatif, notamment les limites visibles des saisons et niveaux. Les examiner localement via les chemins ci-dessus. Aucun déploiement effectué par cette mission.
2. **Bloquant pour la seule page débutant :** faire valider l’adéquation réelle des spots et la signification des 41 idéaux historiques. L’inventaire de phase 2 fournit les identifiants. Ne pas convertir les niveaux en masse ; une simple normalisation d’enum n’est pas une validation de sécurité. La page reste absente jusqu’à une décision éditoriale explicite.
3. **Données éditoriales à confirmer :** période de Praia da Bordeira, signalement de Popoyo, calendriers annuels, accès restreints et géographie signalés en phase 2. Confirmer les transferts si l’on souhaite aller au-delà des indications actuelles du catalogue. Les 59 présentations manquantes sont hors de cette mission.
4. **Après votre déploiement :** réexécuter `audit:seo` avec `SEO_BASE_URL=https://www.surftrips.fr` et un nouveau chemin de rapport. Vérifier les canonical, l’absence de noindex sur le domaine public, les 404 des routes non publiées et la présence des quatre guides dans le sitemap. Le total dépendra du catalogue à cette date, pas d’une constante 83.
5. **Search Console/Bing :** avec vos comptes existants, soumettre ou resoumettre `https://www.surftrips.fr/sitemap.xml`, inspecter les quatre pages, suivre exploration, canonical retenue et indexation. Ces actions n’ont pas été effectuées. Aucun token, changement DNS ou configuration Vercel supplémentaire requis par cette implémentation.
6. **Après disponibilité publique :** vérifier le parcours partenaire et suivre les performances réelles. L’indexabilité technique ne garantit ni indexation, ni classement, ni citation par un assistant IA.

## I. Prochaines opportunités — non implémentées

| Sujet potentiel | Données disponibles | Condition avant publication |
|---|---|---|
| Surf trip en France | 4 zones, 4 spots, arrivée BIQ commune ; saisons différentes | Réalisable avec les données actuelles, après rédaction propre au choix des spots et mêmes limites de niveaux |
| Surf trip en Espagne | 4 zones et quatre aéroports distincts (ACE, BIO, FUE, LCG) | Réalisable à partir des accès documentés ; vérifier les regroupements géographiques avant de nommer des régions |
| Où surfer en janvier ? | 36 zones en bonne période selon la fonction existante | Matière disponible ; exiger une différence utile avec décembre avant de publier, pas une simple variation de mois |
| Destinations pour débutants | 41 minimums débutant, tous associés à un idéal historique | Validation humaine préalable indispensable, page différée |
| Imsouane ou Taghazout | Deux zones, arrivée AGA, 1 contre 2 spots documentés | Revoir les niveaux idéaux et la couverture avant un comparatif ; aucun « meilleur spot » ni gagnant sans critères |

Aucune de ces pages n’a été créée. Pas de quatrième phase commencée.

## Références techniques consultées

- [Google — Contenus utiles](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) et [politiques antispam](https://developers.google.com/search/docs/essentials/spam-policies) : contenu utile et spécifique, aucune production massive de variantes.
- [Google — Liens explorables](https://developers.google.com/search/docs/crawling-indexing/links-crawlable) : véritables ancres avec `href` et libellés descriptifs.
- [Google — Canonicalisation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) et [navigation à facettes](https://developers.google.com/crawling/docs/faceted-navigation) : URL éditoriales stables et absence de combinaison automatique des filtres.
- [Next.js — Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) et [sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap), avec priorité aux guides embarqués de la version **16.3.4** dans `node_modules/next/dist/docs/` ; `notFound` et JSON-LD également consultés localement.

## Inventaire des sélections et des liens retour

Instantané vérifié sur les données du 4 novembre : **58 destinations** concernées. Une cellule mensuelle « Bonne période » ou « Épaule » signifie que la destination était présente dans le tableau initial et possède un lien retour vers ce guide. **Après la refonte éditoriale, ces associations et liens retour sont conservés, mais les articles présentent une sélection plus courte décrite en section J.** « — » signifie qu’elle n’est pas éligible à ce guide ; aucun lien retour n’est ajouté. Les deux dernières colonnes suivent la même règle. Chaque identifiant correspond à la route canonique `/destination/{zone_id}`. Les 19 autres destinations restent accessibles, sans association thématique artificielle.

| Destination et identifiant réel | Novembre | Décembre | Portugal | Comparatif |
|---|---|---|---|---|
| Aguadilla / Rincon (Porto Rico) — `aguadilla` | Bonne période | Bonne période | — | — |
| Arugam Bay (Sri Lanka) — `arugam-bay` | Épaule | — | — | — |
| Bali cote est (Keramas) (Indonesie) — `bali-cote-est` | Bonne période | Bonne période | — | — |
| Bathsheba (Barbade) — `bathsheba` | Bonne période | Bonne période | — | — |
| Biarritz (France) — `biarritz` | Épaule | — | — | — |
| Bocas del Toro (Panama) — `bocas-del-toro` | — | Épaule | — | — |
| Bukit / Uluwatu (Bali) (Indonesie) — `bukit-bali` | Épaule | — | — | — |
| Bundoran (Irlande) — `bundoran` | Bonne période | Épaule | — | — |
| Carrapateira (Algarve ouest) (Portugal) — `carrapateira` | — | — | Oui | — |
| Dakar (Ouakam/Ngor) (Senegal) — `dakar` | Bonne période | Bonne période | — | — |
| Desert Point (Lombok sud-ouest) (Indonesie) — `desert-point-lombok` | Épaule | — | — | — |
| Ericeira (Portugal) — `ericeira` | Bonne période | Bonne période | Oui | Oui |
| Fernando de Noronha (Bresil) — `fernando-de-noronha` | Épaule | Bonne période | — | — |
| G-Land (Alas Purwo, Java) (Indonesie) — `g-land` | Épaule | — | — | — |
| Guethary / Bidart (France) — `guethary` | Bonne période | Bonne période | — | — |
| Half Moon Bay (Etats-Unis) — `half-moon-bay` | Bonne période | Bonne période | — | — |
| Hossegor / Seignosse (France) — `hossegor` | Bonne période | Épaule | — | — |
| Huntington / Newport Beach (Etats-Unis) — `huntington-newport` | Bonne période | Bonne période | — | — |
| Imsouane (Maroc) — `imsouane` | Bonne période | Bonne période | — | — |
| Jardim do Mar (Madere) (Portugal) — `jardim-do-mar` | Bonne période | Bonne période | Oui | — |
| Kenting / Jialeshui (Taiwan) (Taiwan) — `kenting` | Bonne période | Bonne période | — | — |
| La Libertad / El Tunco (Salvador) — `la-libertad` | Épaule | — | — | — |
| La Santa (Lanzarote) (Espagne) — `la-santa` | Bonne période | Bonne période | — | — |
| Malibu (Etats-Unis) — `malibu` | Bonne période | Bonne période | — | — |
| Nord Martinique (Le Precheur) (Martinique (FR)) — `martinique-nord` | Bonne période | Bonne période | — | — |
| Maui nord-ouest (Kapalua) (Etats-Unis (Hawaii)) — `maui-nord-ouest` | Bonne période | Bonne période | — | — |
| Iles Mentawai (Indonesie) — `mentawai` | Épaule | — | — | — |
| Mompiche (Equateur) — `mompiche` | Épaule | Bonne période | — | — |
| Moorea (Haapiti) (Polynesie francaise (FR)) — `moorea` | Épaule | — | — | — |
| Mundaka (Espagne) — `mundaka` | Bonne période | Bonne période | — | — |
| Nazare (Portugal) — `nazare` | Bonne période | Bonne période | Oui | — |
| Lagundri Bay (Nias) (Indonesie) — `nias-lagundri` | Épaule | — | — | — |
| Nord Fuerteventura (Corralejo/Majanicho) (Espagne) — `nord-fuerteventura` | Bonne période | Bonne période | — | — |
| Atoll Nord Male (Maldives) — `north-male` | Épaule | — | — | — |
| North Shore Oahu (Haleiwa/Pupukea) (Etats-Unis (Hawaii)) — `north-shore-oahu` | Bonne période | Bonne période | — | — |
| Pantin (Galice) (Espagne) — `pantin` | Bonne période | Bonne période | — | — |
| Peniche / Baleal (Portugal) — `peniche` | Bonne période | Bonne période | Oui | Oui |
| Pohnpei (Micronesie) — `pohnpei` | Bonne période | Bonne période | — | — |
| Puerto Escondido (Mexique) — `puerto-escondido` | Épaule | — | — | — |
| Puerto Viejo de Talamanca (Costa Rica) — `puerto-viejo` | Épaule | Bonne période | — | — |
| Punaauia (Tahiti ouest) (Polynesie francaise (FR)) — `punaauia` | Épaule | — | — | — |
| Putzu Idu / Capo Mannu (Sardaigne) (Italie) — `putzu-idu` | Bonne période | Bonne période | — | — |
| Safi (Maroc) — `safi` | Bonne période | Bonne période | — | — |
| Saint-Jean-de-Luz (France) — `saint-jean-de-luz` | Bonne période | Bonne période | — | — |
| Santa Maria (Sal) (Cap-Vert) — `sal` | Bonne période | Bonne période | — | — |
| San Clemente (Etats-Unis) — `san-clemente` | Épaule | — | — | — |
| San Cristobal (Galapagos) (Equateur) — `san-cristobal-galapagos` | Bonne période | Bonne période | — | — |
| San Diego (La Jolla) (Etats-Unis) — `san-diego` | Bonne période | Bonne période | — | — |
| Santa Barbara / Carpinteria (Etats-Unis) — `santa-barbara` | Bonne période | Bonne période | — | — |
| Santa Catalina (Panama) — `santa-catalina-pa` | Épaule | — | — | — |
| Santa Cruz (Etats-Unis) — `santa-cruz` | Bonne période | Bonne période | — | — |
| Parc Santa Rosa (Guanacaste) (Costa Rica) — `santa-rosa-cr` | — | Épaule | — | — |
| Siargao (General Luna) (Philippines) — `siargao` | Bonne période | Bonne période | — | — |
| Taghazout (Maroc) — `taghazout` | Bonne période | Bonne période | — | — |
| Tavarua / Namotu (Fidji) — `tavarua` | Épaule | — | — | — |
| Teahupo'o (presqu'ile de Tahiti) (Polynesie francaise (FR)) — `teahupoo` | Épaule | — | — | — |
| Thurso (Ecosse) (Royaume-Uni) — `thurso` | Bonne période | Épaule | — | — |
| Torquay / Bells (Australie) — `torquay` | Épaule | — | — | — |

<a id="refonte-editoriale"></a>

## J. Refonte éditoriale et UX — 5 novembre 2026

### Audit préalable et périmètre

Les trois rapports SEO ont été lus avant modification, ainsi que les quatre routes, les composants `ThemePage` et `ThemeSpotTable`, le registre `themes`, la récupération agrégée du catalogue, les fonctions de saison, les styles, les images et les tests. Les guides locaux de **Next.js 16.3.4** sur les composants serveur/client et les images ont été consultés. Les polices **Syne / DM Sans**, couleurs et composants du produit sont conservés.

Les pages fonctionnaient techniquement mais présentaient trop de données simultanément : deux grands tableaux par mois, un tableau Portugal, un comparatif à six critères répétés par spot, trois blocs d’aéroport dans le guide Portugal. Novembre comportait 55 destinations et 69 lignes de spots ; décembre, 40 destinations et 48 lignes. Les articles mensuels et le comparatif n’avaient aucune photographie. Le Portugal utilisait cinq petites images de 88 px dans son tableau.

Un nouvel instantané Supabase en lecture seule confirme **77 zones, 94 spots, 59 présentations effectives encore manquantes et 41 idéaux historiques à vérifier**. L’éligibilité mensuelle reste 55 zones pour novembre et 40 pour décembre. Les cinq zones portugaises sont toujours présentes. Aucun changement de données, migration, niveau, saison, score, fiche destination ou affiliation n’a été nécessaire.

L’état initial de cette mission est distingué des travaux antérieurs non encore commités : empreintes de 180 fichiers et copie des composants avant modification dans `.local/seo-editorial-ux/`. Les modifications de phases précédentes visibles dans `git status` ne doivent pas être attribuées à cette refonte.

### Composition visuelle et densité

Le modèle commun est maintenant un véritable `<article>` : catégorie discrète, H1, chapô, lien de recherche, photographie légendée, courte introduction, quelques escales expliquées, conseils de choix, CTA final et une lecture connexe. Aucun accordéon ou bloc caché ne conserve les anciennes listes.

La prose est centrée sur **720 px maximum**, avec un corps de **17 px sur ordinateur / 16 px sur mobile**, un interligne de 1,9 et des paragraphes courts. Les images occupent jusqu’à 1120 px en introduction et 960 px dans le corps. Les marges mobiles sont de 20 px ; les titres, légendes et espacements s’adaptent sans débordement. Les boutons, icônes et couleurs restent ceux de Surftrips. Le lien initial reste discret ; un seul emplacement de conversion principal clôt l’article. Le Portugal conserve son formulaire existant avec le pays prérempli.

| Article | Destinations avant → après | Spots détaillés avant → après | Tableaux avant → après | Photographies avant → après |
|---|---|---|---|---|
| Novembre | 55 → **4** | 69 lignes → **0** ; 4 spots seulement cités dans la prose | 2 → 0 | 0 → 4 grandes images |
| Décembre | 40 → **4** | 48 lignes → **0** ; 4 spots seulement cités | 2 → 0 | 0 → 4 grandes images |
| Portugal | 5 au même niveau → **3 développées + 2 brèves** | 6 lignes → **0** ; un repère par destination | 1 → 0 | 5 miniatures → 3 grandes images |
| Ericeira / Peniche | 2 → **2** | 3 spots détaillés dans une matrice → **0** ; Coxos et Supertubos cités | 1 → 0 | 0 → 2 grandes images |

**Six tableaux et trois blocs répétitifs d’aéroport supprimés de la présentation.** Les 123 lignes techniques des trois premiers guides disparaissent ; le comparatif perd sa matrice. Les détails restent sur les fiches existantes, reliées par de vraies ancres HTML. Rien n’a été déplacé ou supprimé dans Supabase.

Les mots visibles dans `main` passent de **2 428 à 661** pour novembre et de **1 805 à 652** pour décembre. Le Portugal passe de 548 à 628 mots et le comparatif de 391 à 472 : les données compactes en cellules sont remplacées par des explications lisibles. Leur hauteur augmente avec les grandes photographies et les espaces, ce qui est un choix de lecture, pas une multiplication des informations techniques.

### Choix éditoriaux des quatre articles

**Novembre — `/ou-surfer-en/novembre`.** Quatre situations documentées, sans classement : Ericeira / Coxos (`ericeira`, `coxos`, octobre–mars), Imsouane / The Bay (`imsouane`, `im-bay`, octobre–avril), Hossegor / La Gravière (`hossegor`, `la-graviere`, septembre–novembre), Uluwatu (`bukit-bali`, `uluwatu`, mai–octobre). Le dernier est explicitement une option de **mois d’épaule**, issue de la fonction existante ; il n’est pas présenté comme étant en pleine saison. Le texte explique une fin de période, des saisons qui continuent et une transition. L’idéal non validé de The Bay reste signalé, sans recommandation débutant. Les listes exhaustives, fonds et autres spots sont laissés aux fiches. Conclusion : choisir selon sa pratique et refaire la recherche si le séjour déborde sur décembre.

**Décembre — `/ou-surfer-en/decembre`.** Fernando de Noronha / Cacimba do Padre (`fernando-de-noronha`, identifiant réel `calimba-do-padre`) et Mompiche (`mompiche`, identifiant réel du spot `monpiche`) ouvrent leur période décembre–mars. Jardim do Mar (`jardim-do-mar`, novembre–février) et Ericeira / Coxos illustrent des saisons déjà engagées qui traversent l’année. La comparaison point break / beach break vient des champs réels. L’article explique le passage vers janvier sans inventer de date de séjour. Il conserve un lien vers novembre. Il partage Ericeira avec le premier article, sans fabriquer une différence saisonnière artificielle.

**Portugal — `/surf/portugal`.** Ericeira, Peniche et Jardim do Mar reçoivent chacun une présentation. Le choix se construit autour des spots, de leurs périodes et des arrivées LIS / FNC. Carrapateira et Nazaré restent accessibles en deux paragraphes courts sans photo supplémentaire. Le mois unique de septembre à Carrapateira est présenté comme une donnée à confirmer, sans l’étendre arbitrairement. Le minimum expert de Nazaré est conservé. Les trois blocs techniques d’accès sont remplacés par des repères rédigés et un renvoi vers les transferts des fiches. Le formulaire Surftrips reste en fin d’article, sans nouveau formulaire ni règle de validation.

**Comparatif — `/comparer/ericeira-vs-peniche`.** Deux présentations illustrées puis trois paragraphes pour choisir : type de vague et minimum documenté, calendrier, accès. Coxos est un point break au minimum intermédiaire ; Supertubos un beach break au minimum expert. Leur période actuelle octobre–mars est commune. Les indications de transfert depuis Lisbonne sont reprises telles que renseignées, sans garantie ni trajet inventé. Les autres spots d’Ericeira et leur niveau idéal à vérifier restent sur la fiche ; le comparatif signale cette limite. Aucun gagnant, score, prix ou argument de sécurité ajouté.

Les introductions et quelques H1 ont été condensés. Les **titles et descriptions SEO existants restent inchangés** et correspondent encore au contenu. Les faits viennent exclusivement du catalogue du projet et des contenus validés déjà disponibles ; aucune affirmation touristique, météorologique ou géographique supplémentaire n’a été ajoutée depuis une source externe.

### Architecture et photographies

`theme-articles.ts` est une couche de choix éditoriaux liée aux véritables identifiants, au-dessus de `themeDestinations`. Elle ne remplace pas la sélection métier. Les phrases utilisent les champs actuels des spots et des zones ; les périodes affichées viennent des mois numériques avec des libellés français. La présence et l’association zone/spot, le pays, les mois, le minimum et les critères de l’angle éditorial sont vérifiés. Une sélection devenue incohérente est omise et signalée par `audit:seo`, pour intervention éditoriale. Les valeurs historiques ne sont jamais converties.

`ArticleDestination` est un composant serveur simple : photo éventuelle, titre, un ou deux paragraphes, lien de fiche. `ArticlePhoto` réutilise `DestinationImage`, l’URL Storage et le crédit de licence existants. **Huit fichiers image déjà validés sont réutilisés**, pour 13 occurrences dans les quatre articles. Aucun fichier image importé, remplacé ou généré. Les photographies originales ont été inspectées avant rédaction des `alt`.

Le registre `theme-photos.ts` associe chaque légende, description et crédit au **chemin exact du fichier**, pas seulement au nom de la destination. Un fichier inconnu n’hérite pas de la légende d’une ancienne photo. Les preuves de lieu et de provenance restent dans `docs/destination-image-batch.json` et `docs/destination-image-completion.json` ; un test confronte les auteurs et identifiants Unsplash à ces manifestes.

| Photo réutilisée | Crédit affiché | Usage |
|---|---|---|
| `ericeira/hero.webp` | Djordje Djordjevic | Introduction novembre ; Ericeira dans les trois autres articles |
| `imsouane/hero.webp` | Louis Hansel | Novembre |
| `hossegor/hero.webp` | Jarno Colijn | Novembre |
| `bukit-bali/hero.webp` | Niklas Weiss | Novembre, Uluwatu |
| `fernando-de-noronha/hero.webp` | Jaime Spaniol | Introduction décembre |
| `mompiche/hero.webp` | Andrés Salgado | Décembre |
| `jardim-do-mar/hero.webp` | Colin Watts | Décembre et Portugal |
| `peniche/hero.webp` | Timur Seyfelmlyukov | Introduction Portugal et comparatif, légende précisant Baleal |

Chaque photographie est localisée dans sa légende ; une photo d’Ericeira n’est jamais présentée comme représentant le mois de novembre partout. Le pied d’article précise que les photos illustrent les lieux, pas les conditions d’un mois. Les liens de crédit sont conservés. Les ratios réservent l’espace avant chargement : 2:1 pour la photo principale, 16:9 pour les autres, 8:5 sur mobile. Les `sizes` suivent les largeurs réelles. Le composant existant précharge seulement la photo principale et charge les secondaires à la demande. Son fallback et ses qualités d’optimisation sont préservés.

### SEO et maillage conservés

Les quatre URL et leurs canonical sur **`https://www.surftrips.fr`** sont inchangées. Aucun fichier de route, sitemap, robots, métadonnées partagées ou fiche destination n’a été modifié pendant cette mission. Open Graph et Twitter conservent le fallback existant. Chaque article a un seul H1, des sections H2 et, pour les deux brèves portugaises, des H3. La prose, les photos et les liens sont présents dans le HTML serveur, confirmé sans JavaScript.

Le `BreadcrumbList` existant est conservé. L’`ItemList` reflète désormais exactement les **4 / 4 / 5 / 2 destinations visibles**, au lieu de conserver les grandes listes retirées de l’interface. Sérialisation sécurisée inchangée. Pas de faux auteur, FAQ ou nouveau schéma.

Le sitemap reste à **83 URL**, dont **77 destinations et les quatre guides**, sans manquant, doublon ou ajout. Les guides contiennent désormais **15 liens de fiches**, contre 115 auparavant ; les 100 liens retirés correspondent aux sélections exhaustives supprimées. Les **102 liens depuis 58 fiches vers les guides**, les quatre liens depuis le catalogue, les quatre liens entre articles et les **107 liens de pays de phase 2** sont conservés. Les relations mensuelles larges restent pertinentes pour découvrir un guide puis utiliser le moteur ; elles n’impliquent plus que toutes les destinations liées soient citées dans le corps de l’article.

Les CTA mensuels renvoient à `/destinations#recherche`, sans date ni aéroport fabriqués. Le Portugal utilise son formulaire existant ; le comparatif renvoie vers `/surf/portugal#recherche`. Le test du parcours Portugal vérifie le changement d’origine, de niveau et de dates, les résultats portugais puis l’arrivée sur une fiche avec ces paramètres conservés.

### Validations réellement exécutées

Tests sur **build de production local**, `http://127.0.0.1:3004`, le 5 novembre 2026 :

| Vérification | Résultat |
|---|---|
| `npm run build` | Réussi, Next.js 16.3.4, compilation et génération terminées |
| `npm run typecheck` | Réussi, code de sortie 0 |
| `npm run lint` | Réussi, aucune erreur ni avertissement remonté |
| `npm test` | **72 tests réussis**, aucun échec ni test ignoré |
| `npm run audit:seo` | **77/77 destinations**, 83 URL sitemap, 4 guides HTTP 200 ; zéro anomalie |
| Playwright, 7 fichiers ciblés | **74 réussis / 8 ignorés / 0 échec**, 82 cas déclarés, 1,9 minute |
| HTML sans JavaScript | Quatre guides, accueil, catalogue et Ericeira, Biarritz, Imsouane, Bukit/Uluwatu, Hossegor vérifiés |
| Responsive articles | Quatre pages × **1440, 1280, 768, 390 px** : pas de débordement, images chargées, prose ≤720 px, texte ≥16 px |
| Accessibilité | Navigation clavier, liens et CTA ; axe WCAG A/AA : aucune violation détectée sur les quatre articles, ordinateur et mobile |
| JSON-LD et métadonnées | Canonical unique, OG/Twitter, title/description, liste structurée conforme au contenu, sections non vides |
| Pages non publiées | Débutant, janvier, pays/comparatifs inconnus : vraie 404 et noindex |
| Intégrité des données | Empreintes avant/après identiques sur les colonnes auditées des **77 zones / 94 spots** |

Les sept fichiers navigateur exécutés sont `themes.spec.ts`, `seo.spec.ts`, `editorial.spec.ts`, `landing.spec.ts`, `travel.spec.ts`, `travel-live.spec.ts`, `accommodation.spec.ts`. Les huit cas ignorés sont les doublons mobiles des boucles de largeurs exécutées dans le projet desktop ; les quatre largeurs ont bien été testées. Il ne s’agit pas de l’exécution intégrale de tous les fichiers E2E du dépôt.

Le parcours Surf → Vol → Logement, la recherche réelle Supabase et le préremplissage du Portugal passent. Le test Travelpayouts réel observe **HTTP 200 côté Kiwi et l’état de secours `fallback`**, sur ordinateur et mobile ; il ne prouve pas qu’une offre de vol est disponible. Les tests Booking/CJ contrôlent les liens, SID et routes de redirection ; aucun achat ni réservation externe n’a été effectué. Aucune erreur JavaScript/hydratation détectée pendant les parcours contrôlés. Les articles eux-mêmes ne chargent aucun widget Kiwi/Booking.

Les premières tentatives d’audit et de navigateur ont été bloquées par les restrictions réseau/Chrome du sandbox ; elles n’ont pas été comptées comme des validations réussies. Leur relance avec les permissions nécessaires a abouti aux résultats ci-dessus. Le rapport machine est `.local/seo-editorial-ux/audit.json` ; l’intégrité des sources est dans `source-integrity.json` du même dossier.

### Mesures locales et limites

Observations avant/après sur la même machine, avec Chrome, build de production et serveur local, sans limitation réseau/CPU, une visite par page et largeur. Les ressources serveur étaient déjà sollicitées par les tests et peuvent être en cache. LCP et décalages sont observés au chargement initial pendant environ deux secondes, avant le parcours des images secondaires : **ce ne sont ni des mesures terrain, ni un 75e percentile, ni un audit Lighthouse**.

| Article | HTML reçu avant → après | Mots visibles avant → après (desktop) | LCP desktop avant → après | LCP 390 px avant → après |
|---|---|---|---|---|
| Novembre | 154 299 → **58 505 octets** | 2 428 → **661** | 212 → 112 ms | 72 → 56 ms |
| Décembre | 117 994 → **59 056 octets** | 1 805 → **652** | 76 → 36 ms | 44 → 32 ms |
| Portugal | 60 111 → **59 807 octets** | 548 → **628** | 60 → 40 ms | 44 → 68 ms |
| Comparatif | 33 298 → **43 832 octets** | 391 → **472** | 36 → 40 ms | 44 → 32 ms |

Le JavaScript décodé observé reste **489 451 octets par page avant et après**. Aucun décalage de mise en page observé dans cette fenêtre (0 sur les huit visites après, comme avant). Les grands visuels ajoutent des ressources image ; le HTML du comparatif augmente d’environ 10,5 ko, tandis que celui des deux mois diminue fortement. Aucune dégradation importante observée localement, sans conclusion sur les connexions mobiles lentes ou le cache froid. **INP terrain, CrUX, mesures au 75e percentile et performances après déploiement : non mesurés, non disponibles pour cette version locale.** Les métriques détaillées sont dans `before/metrics.json` et `after/metrics.json`.

### Revue visuelle et captures

Les quatre articles ont été revus visuellement sur les captures finales, avec examen des introductions, photographies, paragraphes, liens, comparatif et formulaire Portugal. Les captures à 1280 et 768 px complètent les vues desktop/mobile. Les images sont légendées, les sections ne contiennent plus de liste technique, les CTA sont visibles sans se répéter dans chaque destination. L’article Portugal garde deux brèves réellement plus compactes. Aucun débordement horizontal constaté.

Captures locales non versionnées, produites avant/après sur le build de production :

| Article | Avant desktop | Après desktop | Après mobile |
|---|---|---|---|
| Novembre | [Vue complète](../.local/seo-editorial-ux/before/novembre-1440-full.png) | [Vue complète](../.local/seo-editorial-ux/after/novembre-1440-full.png) | [390 px](../.local/seo-editorial-ux/after/novembre-390-full.png) |
| Décembre | [Vue complète](../.local/seo-editorial-ux/before/decembre-1440-full.png) | [Vue complète](../.local/seo-editorial-ux/after/decembre-1440-full.png) | [390 px](../.local/seo-editorial-ux/after/decembre-390-full.png) |
| Portugal | [Vue complète](../.local/seo-editorial-ux/before/portugal-1440-full.png) | [Vue complète](../.local/seo-editorial-ux/after/portugal-1440-full.png) | [390 px](../.local/seo-editorial-ux/after/portugal-390-full.png) |
| Comparatif | [Vue complète](../.local/seo-editorial-ux/before/ericeira-vs-peniche-1440-full.png) | [Vue complète](../.local/seo-editorial-ux/after/ericeira-vs-peniche-1440-full.png) | [390 px](../.local/seo-editorial-ux/after/ericeira-vs-peniche-390-full.png) |

Les dossiers `before` et `after` contiennent également les vues d’introduction des quatre pages à 1440 et 390 px, ainsi que les captures avant sur mobile. `responsive/` contient les vues d’introduction, de présentation de destination et de page complète des 16 combinaisons page/largeur. Les captures Playwright de navigation peuvent montrer le focus clavier ou l’en-tête fixe à la position de défilement ; les captures `after/` sont revenues en haut de page pour la comparaison visuelle finale.

### Inventaire exact de cette refonte

| Statut par rapport au début de cette mission | Fichier | Raison |
|---|---|---|
| Créé | `components/editorial/ArticleDestination.tsx` | Présentation éditoriale serveur et photographie légendée, composants d’image existants réutilisés |
| Créé | `lib/editorial/theme-articles.ts` | Sélections courtes, prose liée aux données réelles et validation des associations/angles |
| Créé | `lib/editorial/theme-photos.ts` | Alt, légendes et crédits des huit fichiers photographiques vérifiés |
| Modifié | `components/editorial/ThemePage.tsx` | Modèle d’article, rythme propre aux quatre sujets, CTA et JSON-LD des seules destinations visibles |
| Modifié | `lib/editorial/themes.ts` | Chapôs et titres visibles condensés ; URL, title SEO, description et relations conservés |
| Modifié | `app/globals.css` | Styles limités aux articles, prose étroite, grandes images, espacements et responsive |
| Modifié | `scripts/seo-theme-audit.ts` | Contrôle des faits des sélections, absence de tableaux, HTML, liens et liste structurée |
| Modifié | `tests/thematic.test.ts` | Tests des sélections, données périmées, périodes et provenance des crédits |
| Modifié | `tests/e2e/themes.spec.ts` | Assertions adaptées aux articles, photos, clavier, quatre largeurs et accessibilité |
| Modifié | `docs/seo-thematic-pages-phase3.md` | Présent rapport intégré à la documentation existante |
| Supprimé | `components/editorial/ThemeSpotTable.tsx` | Composant de tableaux devenu inutilisé après la simplification |

Les scripts ponctuels de mesure, les instantanés et les captures restent dans `.local/seo-editorial-ux/` (ignoré par Git), sans ajouter de commande ni dépendance au projet. Le contrôle par empreintes confirme que les autres fichiers applicatifs présents au début, notamment les routes, le moteur, les affiliations et les fiches destinations, sont inchangés dans cette mission. Aucune migration et aucune nouvelle page.

### Intervention du propriétaire après revue

Aucun blocage technique restant identifié pour cette refonte. La page débutant n’a pas été créée. Les 59 présentations manquantes et 41 idéaux historiques restent à traiter dans un chantier distinct, sans correction automatique ici. La plage réduite à septembre pour Carrapateira reste un point de validation humaine déjà signalé.

Le propriétaire peut maintenant examiner les quatre articles et les captures. Après un éventuel déploiement décidé séparément, recontrôler les photographies, canonical et HTML publics, puis les performances terrain dans Search Console/CrUX lorsque des données sont disponibles. Le sitemap n’a pas changé de contenu pendant cette refonte ; les actions de soumission liées au premier déploiement de la phase 3 restent celles du rapport initial. **Aucun déploiement Vercel, changement DNS, action Search Console/Bing ou nouvelle phase n’a été effectué.**
