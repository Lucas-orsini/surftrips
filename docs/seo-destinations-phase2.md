# Destinations — SEO et GEO, phase 2

Phase 2 réalisée et validée localement le 4 novembre 2026. Aucun déploiement ni écriture en base.

## État initial vérifié avant modification

Le rapport `seo-technical-audit.md` a été lu intégralement. Next.js installé : 16.3.4, App Router. Les guides locaux de Server Components et JSON-LD ont été consultés. Le dépôt était propre au début de cette phase.

- Route existante : `app/destination/[slug]/page.tsx`, Server Component dynamique ; composants interactifs et hébergement secondaire conservés.
- Source : `lib/db/zones.ts` et `lib/db/rows.ts`, requêtes PostgreSQL en lecture seule, catalogue en cache 60 secondes. RLS activé ; aucune migration nécessaire.
- `zones` fournit identité, pays, aéroports, transfert, coordonnées, `notes` et image. `spots` fournit identifiant, rattachement, niveaux minimum/idéal, mois, libellé de saison, vague, fond, notes et signalements.
- Recensement réel à 16:33 UTC : **77 zones, 94 spots, 14 notes de zone renseignées et 63 absentes**. Les 14 notes ne sont pas toutes de véritables présentations.
- **41 valeurs `spots.niveau_ideal = tous_niveaux`, réparties sur 38 zones** : l’adaptateur existant les signale « À vérifier ». Aucune correspondance validée avec Débutant, Intermédiaire ou Expert ; aucune conversion prévue. Les niveaux minimum restent utilisables par le moteur existant.
- HTML existant : H1 unique, informations et spots côté serveur, mais titres peu explicites et noms de spots en H4. Saisons et accès déjà présents dans le carnet. Liens vers le catalogue et les destinations partageant un aéroport déjà présents.
- Métadonnées, canonical `https://www.surftrips.fr`, sitemap, robots, JSON-LD, previews et 404 de phase 1 conservés. `npm run audit:seo` sera étendu, sans second système SEO.
- Photos existantes : les cinq fichiers WebP et leurs manifestes de provenance ont été examinés visuellement ; aucune photo remplacée. Composant Next/Image avec tailles réservées, `sizes`, preload de la bannière et lazy loading des autres images déjà en place.
- Les notes des cinq destinations comportent des superlatifs et assertions non étayées (vagues garanties, absence de risque, hauteur/fréquence chiffrée). Les remplacements éditoriaux concernent ces textes affichés, jamais les niveaux de sécurité, périodes ou scores.

## Architecture retenue

Contenus TypeScript versionnés par véritable `zone_id`, séparés des données structurées. Sections facultatives et provenance explicite, validation des rattachements avec le catalogue réel. Pas de migration, de MDX, de bibliothèque SEO ni d’administration supplémentaire. Les 72 autres destinations conservent leurs notes et données sans génération de présentations.

Les relations ajoutées seront uniquement fondées sur le même pays, sans allégation de proximité : les centres des 77 zones portent un signalement de recentrage. Les liens partageant un aéroport et leurs paramètres métier seront conservés.

## Mise en œuvre

`lib/editorial/destinations.ts` contient cinq entrées, leurs références de spots, des blocs de texte et leurs sources datées. Les introductions, repères pratiques et notes de spots sont facultatifs. Les chaînes sont rendues comme texte React, jamais comme HTML arbitraire. Les sources acceptent uniquement des URL HTTPS sans identifiants.

La validation confronte `zoneId`, pays et références de spots aux données réellement chargées. Une entrée périmée n’est pas publiée ; la fiche continue avec les données existantes et `audit:seo` signale l’erreur. L’audit repère aussi les entrées dont la zone a disparu. Pour enrichir une autre fiche : consulter ses données et ses sources, ajouter une entrée avec son vrai identifiant, puis lancer les tests et l’audit. Ne pas recopier les niveaux, dates ou accès dans un second jeu de données éditoriales.

`EditorialParagraph` est un composant serveur. Les liens de provenance sont visibles à proximité des faits concernés. La présentation utilise le contenu validé ou, à défaut, les notes existantes de la zone. Sans l’un ni l’autre, aucune section de présentation n’est rendue. Seule Biarritz reçoit des repères pratiques spécifiques. Aucune FAQ ni aucun schéma `FAQPage` n’a été ajouté.

La structure commune reste dans la page existante : H1 unique avec le nom réel, H2 de présentation lorsque renseignée, H2 des spots, H3 par spot ; H2 de niveau, saison et accès dans le carnet. Le niveau minimum est maintenant explicite **par spot** dans le carnet, au lieu d’un résumé global ambigu. Le résumé du produit, le filtre des spots, les scores et la frise conservent leur logique. La saison est présentée comme un calendrier, pas une prévision ni une garantie. Les mois qui traversent le changement d’année restent traités par le code existant.

Les notes anciennes des huit spots prioritaires sont revues à l’affichage : sept sont omises car leurs assertions ne sont pas suffisamment étayées ; la note de La Gravière est remplacée par une formulation sourcée. Leurs informations structurées restent visibles. Aucun `flag_verif` n’est supprimé et aucun niveau minimum ou idéal n’est réinterprété. Les notes des 86 autres spots restent inchangées ; elles nécessitent encore une revue de fond.

Le maillage complémentaire sélectionne au maximum trois destinations du même pays, par ordre alphabétique, en excluant la destination courante, les doublons et les destinations déjà liées par aéroport. Les relations sont issues du catalogue réel déjà mis en cache. Il ne s’agit ni d’un classement ni d’une recommandation de proximité. Ces liens sont en HTML et sans paramètres. Les liens existants par aéroport gardent les paramètres du voyage. Une section vide n’apparaît pas : Biarritz et Hossegor ont déjà les autres destinations françaises liées via BIQ.

Les textes alternatifs des cinq bannières décrivent les images inspectées, avec une correspondance au chemin exact du fichier. La photo de Biarritz n’est pas appelée « Côte des Basques », faute de localisation aussi précise. Les tailles, recadrages, preload, lazy loading, fallbacks, crédits et fichiers restent inchangés. Les petits H2 du carnet ont un espacement de lettres adapté à leur taille, dans la typographie existante.

## Les cinq destinations prioritaires

Les sources externes ci-dessous ont été consultées le **4 novembre 2026**. Elles étayent les faits indiqués, pas tous les autres champs de la fiche. Les périodes, niveaux, fonds, types de vagues et transferts proviennent du projet ; ce travail ne les certifie pas comme observations terrain.

| Destination / `zone_id` | Enrichissement publié | Données du projet conservées | À faire valider |
|---|---|---|---|
| Ericeira / `ericeira` | Présentation de la réserve et de ses deux spots, source visible ; alt descriptif | `coxos` : Intermédiaire / Expert, octobre–mars, point break, roche. `ribeira-ilhas` : Débutant / idéal à vérifier, janvier–décembre, reef break, roche. LIS, Lisbonne, « 50min de route ». | Idéal de Ribeira d’Ilhas ; conditions locales, oursins et assertions de marées des notes anciennes. |
| Biarritz / `biarritz` | Présentation centrée sur la Côte des Basques, repère pratique sur l’accès au sable et la marée ; alt sans nom de plage supposé | `cote-des-basques` : Débutant / idéal à vérifier, avril–octobre, beach break, sable. BIQ, Biarritz Pays Basque, « 15min ». | Idéal ; distinction entre période enregistrée et ancienne note « toute l’année » ; temps de transfert sans mode renseigné. |
| Imsouane / `imsouane` | Contexte de village de pêcheurs et longue droite, périmètre limité à The Bay ; alt descriptif | `im-bay` : Débutant / idéal à vérifier, octobre–avril, point break, sable. AGA, Agadir-Al Massira, alternative ESU en base ; « 1h30 de route ». | Idéal ; autres spots non répertoriés ; accès alternatif ESU non développé faute d’itinéraire documenté. |
| Uluwatu / **`bukit-bali`** | Présentation distinguant la zone, ses trois spots et les sections d’Uluwatu ; source et alt | `bingin` : mai–septembre ; `padang-padang` et `uluwatu` : mai–octobre. Les trois : Intermédiaire / Expert, reef break, corail. DPS, Denpasar Ngurah Rai, « 45min-1h taxi/scooter ». | Les niveaux minimums doivent être vérifiés localement, notamment selon section/conditions. L’ancienne assertion « 25 jours par an », la sécurité de Baby Padang et les consignes d’accès ne sont pas republiées. |
| Hossegor / `hossegor` | Présentation précisant que seule La Gravière est documentée ; note de spot sourcée, alt | `la-graviere` : Expert / Expert, septembre–novembre, beach break, sable. BIQ, « 45min de route ». | Ne pas généraliser La Gravière à Seignosse ; autres spots à documenter ; ancienne hauteur « 4m » non republiée. |

Provenance précise des ajouts :

- [Save The Waves — Ericeira](https://www.savethewaves.org/ericeira/) : reconnaissance World Surfing Reserve en 2011, Coxos et Ribeira d’Ilhas dans la réserve. Aucun calendrier de compétition ni saison globale provenant de cette page n’a été repris.
- [Ville de Biarritz — Côte des Basques](https://www.biarritz.fr/cadre-de-vie-bizi-ingurunea/plages/cote-des-basques) : sable, falaises, histoire du surf et accès dépendant de la marée. Les horaires de surveillance ne sont pas copiés ; le lecteur dispose du lien officiel à jour.
- [ONMT — Maroc Ocean Wave, page imprimée 7 / quatrième page du PDF](https://www.visitmorocco.com/sites/default/files/atoms/files/def_maroc_ocean_wave_20250804_ok_1.pdf#page=4) : Imsouane, village de pêcheurs au nord de Taghazout et longue droite. Les promesses d’apprentissage facile ne sont pas reprises.
- [Indonesia Travel — Uluwatu](https://www.indonesia.travel/gb/en/destination/bali-nusa-tenggara/bali/uluwatu) : distinction des sections The Peak, Racetracks et Outside Corner. Les tailles de houle, marées recommandées et consignes de pratique ne sont pas reprises.
- [Office de tourisme d’Hossegor — La Gravière](https://www.hossegor.fr/activites/plage-de-la-graviere-ocean/) : localisation près de la place des Landais ; vague rapide près du bord, peu d’eau et déconseillée aux débutants. Cette description ne modifie pas le niveau Expert du projet.
- Photos : `docs/destination-image-batch.json`, chemins `ericeira/hero.webp`, `biarritz/hero.webp`, `imsouane/hero.webp`, `bukit-bali/hero.webp`, `hossegor/hero.webp`. Vérification visuelle des cinq fichiers 1600 × 1000 ; provenance et localisation des manifestes conservées.

## Couverture et invariants

| Indicateur | Avant | Après |
|---|---:|---:|
| Destinations publiques existantes | 77 | 77, HTTP 200 |
| Spots associés | 94 | 94 |
| Notes de présentation renseignées en base | 14 | 14, inchangées |
| Présentations éditoriales rédigées dans le dépôt | 0 | 5 |
| Présentations ajoutées sur une zone auparavant vide | 0 | 4 |
| Zones disposant d’un texte de présentation, notes historiques comprises | 14 | 18 |
| Zones sans présentation effective | 63 | 59 |
| Niveaux idéaux historiques à valider | 41 dans 38 zones | 41 dans 38 zones |
| Liens supplémentaires vers des destinations du même pays | 0 | 107 occurrences, vers des pages HTTP 200 |
| Fiches avec H1 unique, hiérarchie sans saut et noms de spots en H3 | non mesuré automatiquement avant | 77/77 |
| Destinations dans le sitemap | 77 | 77 ; 79 URL avec accueil et catalogue |

Les 72 destinations hors priorité conservent leurs présentations disponibles et leurs données réelles. Les 13 notes de zone historiques hors Ericeira sont très courtes : les compter comme textes disponibles ne revient pas à les considérer comme des présentations complètes ou validées.

Les champs sélectionnés de `zones` et `spots` ont été comparés en lecture seule avant/après, par contenu indépendamment du tri : **aucune différence**. Empreinte SHA-256 commune : `2f3c669c6649f4e30c595216881c074c9107edf8c9dc90b63d39cb914ee355ec`. Le premier calcul sensible à l’ordre des lignes a été rectifié avant cette conclusion. Les fonctions métier, les routes de redirection, les SID, les données d’accès, les politiques RLS et les migrations n’ont pas été modifiés.

## Validation exécutée

Contrôles réalisés sur un **build de production local**, `http://127.0.0.1:3002`, avec PostgreSQL réel en lecture seule. Les rapports bruts sont dans `.local/seo-phase2/` (ignoré par Git). Les premiers lancements isolés par le bac à sable ne pouvaient pas joindre la base ou le serveur ; ils ont été relancés avec les permissions nécessaires. Aucun résultat bloqué n’a été compté comme réussi.

| Contrôle | Résultat |
|---|---|
| `npm run audit:seo` final | **Réussi**, 4 novembre 2026, 16:51 UTC ; zéro échec. |
| Comparaison sitemap/base | 77 destinations éligibles / 77 pages HTTP 200 / 77 URL destination ; 79 URL au total, aucun manque, doublon ou surplus. |
| HTML serveur | 77 H1 uniques ; hiérarchie sans saut ; 94 spots correctement associés ; titres, pays, saisons et niveaux présents hors scripts/RSC. Les cinq présentations apparaissent dans le HTML reçu sans JavaScript. |
| Métadonnées | Aucun titre ou descriptif vide/dupliqué ; canonical et Open Graph cohérents ; 77 images sociales répondent HTTP 200 avec type image. |
| Maillage | 107 liens propres ajoutés sur 48 fiches ; toutes les cibles font partie des 77 réponses HTTP 200 contrôlées. |
| Données métier | Tous les niveaux minimum/idéal, saisons, vagues et fonds rendus sont comparés aux données du spot correspondant. 41 valeurs historiques restent « À vérifier ». Comparaison avant/après des données identique. |
| `npm test` | **58/58 tests unitaires réussis**, dont 6 nouveaux ; niveaux, saison traversant l’année, scores et affiliation couverts par les tests existants. |
| `npm run typecheck` | **Réussi**. |
| `npm run lint` | **Réussi**. |
| `npm run build` | **Réussi**, y compris après le dernier ajustement des petits titres ; mêmes routes. |
| Playwright | **75 cas distincts réussis**, projets desktop/mobile compris. Deux campagnes : 65 réussites + 9 exclusions volontaires, puis 16 réussites + 4 exclusions. Cela représente 81 exécutions réussies, dont 6 répétitions justifiées après l’ajustement CSS. Aucun échec. |
| Responsive | Cinq destinations × 1440, 1280, 768 et 390 px ; absence de débordement, images chargées, navigation Surf / Vol / Logement opérationnelle. Captures complètes dans `.local/seo-phase2/screenshots/`, examinées notamment sur mobile et desktop. |
| Photos | 20 photos des deux premiers lots vérifiées dans le navigateur sur desktop et mobile, chargement optimisé, alt, refresh et fallback simulé ; les 77 URL sociales contrôlées en HTTP. |
| Hydratation | Aucune erreur `pageerror` dans les nouveaux parcours et les mesures laboratoire. |
| Fonctionnalités | Recherche réelle, filtres, dates, liens paramétrés, navigation retour, vol Kiwi, rendu Booking et erreurs des routes de redirection vérifiés. Aucune transaction ni réservation. |

Les neuf exclusions de la première campagne et les quatre de la seconde sont les copies mobiles de tests qui parcourent déjà explicitement plusieurs largeurs ; elles ne représentent pas des contrôles manquants. Les suites exécutées : `seo`, `editorial`, `landing`, `travel`, `travel-live`, `travel-layout`, `accommodation`, `accommodation-render`, `destination-banner`, `destination-images-live`, `seo-performance`. Les autres anciennes suites d’images n’ont pas été relancées intégralement : il ne s’agit pas d’une affirmation de réussite de toute la suite sans sélection.

URL contrôlées : `/`, `/destinations`, les **77** `/destination/{zone_id}` (liste complète dans `audit.json`), en particulier `/destination/ericeira`, `/destination/biarritz`, `/destination/imsouane`, `/destination/bukit-bali`, `/destination/hossegor` ; `/destination/seo-inexistante-20261103` (404 sous plusieurs user-agents), `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/recherche`, `/search`, les routes légales et les erreurs de redirection Booking. Les variantes origine seule, dates seules, niveau seul et voyage complet conservent leur URL et la canonical propre. Le voyage Débutant à Ericeira conserve Ribeira d’Ilhas et exclut Coxos, conformément au moteur existant.

Travelpayouts/Kiwi : le test réel a reçu HTTP 200 de `widgets.kiwi.com`, vérifié les paramètres et suivi le lien affilié de secours jusqu’aux résultats Kiwi avec origine et dates. Le widget était `fallback` dans ce test, puis `ready` sur les six visites avec voyage des mesures laboratoire. Cette variation partenaire est documentée ; aucune disponibilité d’offre n’est garantie. Le rendu Booking, les liens CJ/SID et les erreurs HTTP sont couverts par les tests existants ; une requête locale supplémentaire a vérifié la redirection configurée d’Ericeira : **HTTP 302 vers CJ, cible `www.booking.com`, SID présent, `no-store` et `noindex, nofollow`**, sans suivre une réservation.

### Mesures locales de performance

Six tests, **18 observations** (trois visites par scénario et profil), sans limitation CPU/réseau. Les ressources sont locales ou en cache ; ces chiffres ne prédisent pas l’expérience mobile réelle et ne constituent pas un avant/après contrôlé.

| Scénario | Profil | LCP observé | CLS observé | Plus longue interaction mesurée |
|---|---|---|---|---|
| Accueil | Desktop | 56–104 ms | 0 | 48 ms |
| Accueil | Mobile émulé | 44–104 ms | 0 | 56 ms |
| Ericeira directe | Desktop | 244–260 ms | 0 | 48 ms |
| Ericeira directe | Mobile émulé | 244–260 ms | 0 | 48 ms |
| Ericeira avec voyage | Desktop | 240–272 ms | 0 | 48 ms |
| Ericeira avec voyage | Mobile émulé | 232–248 ms | 0 | 64 ms |

TTFB des destinations observées : environ 196–212 ms. JavaScript décodé recensé par Resource Timing : environ 482 ko sur les destinations et 579 ko sur l’accueil ; cela ne couvre pas exhaustivement les ressources des iframes tierces. **INP terrain et percentiles terrain : non mesurés.** La colonne d’interaction est une observation de laboratoire, pas un INP. Les seuils CWV de référence et leur interprétation terrain restent ceux documentés en phase 1.

## Fichiers livrés

| Statut | Fichier | Raison |
|---|---|---|
| Créé | `lib/editorial/destinations.ts` | Cinq contenus sourcés, validation de rattachement, notes facultatives et sélection de liens par pays. |
| Créé | `components/destination/EditorialParagraph.tsx` | Rendu serveur de texte sûr avec liens de provenance. |
| Créé | `tests/editorial.test.ts` | Validation des contenus, sources, références, absence de mutation et sélection des liens. |
| Créé | `tests/e2e/editorial.spec.ts` | Cinq fiches × quatre largeurs, liens HTML, paramètres et filtrage Débutant. |
| Créé | `docs/seo-destinations-phase2.md` | Ce rapport, inventaire des lacunes et validation humaine. |
| Modifié | `app/destination/[slug]/page.tsx` | Sections conditionnelles, niveaux par spot, hiérarchie, contenus et maillage. |
| Modifié | `app/globals.css` | Titres H2/H3, provenance et espacement local, tokens existants. |
| Modifié | `components/destination/DestinationHero.tsx` | Transmission de l’alt spécifique au fichier. |
| Modifié | `components/destination/DestinationImage.tsx` | Alt photographique facultatif ; fallback générique conservé. |
| Modifié | `lib/images/banner.ts` | Descriptions des cinq images inspectées. |
| Modifié | `scripts/audit-seo.ts` | Étend l’audit existant : contenu, hiérarchie, associations, faits des spots, liens, lacunes et 41 identifiants. |
| Modifié | `tests/e2e/seo.spec.ts` | Vérifie aussi l’enrichissement serveur et les H3 sans JavaScript. |
| Modifié | `tests/e2e/destination-images-live.spec.ts` | Alts vérifiés et panne photo simulée : Pavones possède désormais une photo réelle. |
| Modifié | `tests/e2e/destination-banner.spec.ts` | Test de fallback indépendant de l’ancienne absence de photo de Pavones. |

Aucun fichier supprimé, aucune dépendance ajoutée, aucune migration, aucune nouvelle route. `lib/seo.ts`, sitemap, robots, JSON-LD, configuration Vercel et protection des previews sont conservés.

## Actions manuelles

**Bloquants techniques constatés : aucun après les contrôles exécutés.** L’affichage des offres du widget Travelpayouts reste dépendant du partenaire ; le lien Kiwi de secours demeure disponible. La réservation effective et l’attribution d’une commission ne sont pas vérifiables sans transaction et n’ont pas été testées.

**Validation éditoriale avant de nouvelles publications :**

1. Valider les cinq textes et leurs sources, notamment les formulations liées aux accès et à la pratique. Compléter les données locales lorsqu’une information manque, sans déduire un niveau à partir d’un texte promotionnel.
2. Décider de la signification des 41 valeurs `tous_niveaux` listées ci-dessous. Le niveau minimum n’a pas été déduit du niveau idéal ; aucune proposition de remplacement n’est présentée comme certaine. Le filtre utilise toujours uniquement les trois niveaux validés.
3. Revoir les 59 présentations absentes et les 13 notes courtes restantes individuellement. Donner des sources et une date de vérification pour les contraintes d’accès, taxes, restrictions, prestations privées ou consignes de pratique.
4. Arbitrer les contradictions de saison signalées et valider les coordonnées avant d’ajouter des relations de proximité, distances ou itinéraires.
5. Après votre futur déploiement, relancer `audit:seo` contre `https://www.surftrips.fr` et inspecter les cinq fiches dans Search Console selon la procédure de phase 1. Aucun changement DNS ou Vercel n’est nécessaire pour ce modèle.

**Améliorations futures, hors intervention :** enrichissement progressif des autres destinations, sources locales pour chaque spot, validation des accès, FAQ seulement si de nouvelles réponses spécifiques sont disponibles. Aucune page thématique, promesse de classement ou de citation IA, ni phase 3 engagée.

## Inventaire des validations éditoriales restantes

### 41 niveaux idéaux historiques — aucune conversion

Recensement complet des spots concernés. Champ SQL : `spots.niveau_ideal`. La valeur brute `tous_niveaux` est isolée par l’adaptateur existant et affichée « À vérifier ». Aucun niveau utilisateur supplémentaire n’a été créé.

| spot_id | Destination / zone_id | Champ | Valeur actuelle | Motif |
|---|---|---|---|---|
| `arugam-bay` | Arugam Bay (`arugam-bay`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `keramas` | Bali cote est (Keramas) (`bali-cote-est`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `cote-des-basques` | Biarritz (`biarritz`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `bundoran` | Bundoran (`bundoran`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `lennox-head` | Byron Bay / Lennox Head (`byron-bay`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `the-pass` | Byron Bay / Lennox Head (`byron-bay`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `praia-da-bordeira` | Carrapateira (Algarve ouest) (`carrapateira`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `chicama` | Puerto Malabrigo / Chicama (`chicama`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `kirra` | Coolangatta (Gold Coast sud) (`coolangatta`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `snapper-rocks` | Coolangatta (Gold Coast sud) (`coolangatta`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `ngor` | Dakar (Ouakam/Ngor) (`dakar`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `ribeira-ilhas` | Ericeira (`ericeira`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `parlementia` | Guethary / Bidart (`guethary`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `huntington` | Huntington / Newport Beach (`huntington-newport`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `im-bay` | Imsouane (`imsouane`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `jialeshui` | Kenting / Jialeshui (Taiwan) (`kenting`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `el-sunzal` | La Libertad / El Tunco (`la-libertad`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `punta-roca` | La Libertad / El Tunco (`la-libertad`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `lobitos` | Lobitos (`lobitos`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `malibu` | Malibu (`malibu`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `anse-couleuvre` | Nord Martinique (Le Precheur) (`martinique-nord`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `ha-apiti` | Moorea (Haapiti) (`moorea`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `noosa` | Noosa (`noosa`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `pantin` | Pantin (Galice) (`pantin`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `pavones` | Pavones (`pavones`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `capo-mannu` | Putzu Idu / Capo Mannu (Sardaigne) (`putzu-idu`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `raglan` | Raglan (`raglan`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `saint-leu` | Saint-Leu (`saint-leu`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `trestles` | San Clemente (`san-clemente`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `black-s-beach` | San Diego (La Jolla) (`san-diego`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `rincon` | Santa Barbara / Carpinteria (`santa-barbara`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `santa-catalina` | Santa Catalina (`santa-catalina-pa`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `streamer-lane` | Santa Cruz (`santa-cruz`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `playa-naranjo` | Parc Santa Rosa (Guanacaste) (`santa-rosa-cr`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `cloud9` | Siargao (General Luna) (`siargao`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `occys-left` | Sumba ouest (`sumba-ouest`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `anchor-point` | Taghazout (`taghazout`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `tam-bay` | Tamarin (`tamarin`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `thurso-east` | Thurso (Ecosse) (`thurso`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `bells-beach` | Torquay / Bells (`torquay`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |
| `unstad` | Unstad (Lofoten) (`unstad`) | `niveau_ideal` | `tous_niveaux` | Hors référentiel ; correspondance métier non validée. |

### 59 zones sans présentation effective

Ces zones restent indexables et continuent de rendre leurs données. Les quatre nouvelles présentations qui comblent un champ vide sont Biarritz, Imsouane, Bukit / Uluwatu et Hossegor / Seignosse. Ericeira possédait déjà une note, remplacée par une introduction développée.

| zone_id | Destination | Pays | Spots documentés |
|---|---|---|---|
| `aguadilla` | Aguadilla / Rincon | Porto Rico | 1 |
| `arica` | Arica | Chili | 1 |
| `arugam-bay` | Arugam Bay | Sri Lanka | 1 |
| `bali-cote-est` | Bali cote est (Keramas) | Indonesie | 1 |
| `bathsheba` | Bathsheba | Barbade | 1 |
| `bocas-del-toro` | Bocas del Toro | Panama | 2 |
| `bundoran` | Bundoran | Irlande | 1 |
| `byron-bay` | Byron Bay / Lennox Head | Australie | 2 |
| `carrapateira` | Carrapateira (Algarve ouest) | Portugal | 1 |
| `chicama` | Puerto Malabrigo / Chicama | Perou | 1 |
| `coolangatta` | Coolangatta (Gold Coast sud) | Australie | 2 |
| `dakar` | Dakar (Ouakam/Ngor) | Senegal | 2 |
| `guethary` | Guethary / Bidart | France | 1 |
| `half-moon-bay` | Half Moon Bay | Etats-Unis | 1 |
| `huntington-newport` | Huntington / Newport Beach | Etats-Unis | 2 |
| `jardim-do-mar` | Jardim do Mar (Madere) | Portugal | 1 |
| `jeffreys-bay` | Jeffreys Bay | Afrique du Sud | 1 |
| `kenting` | Kenting / Jialeshui (Taiwan) | Taiwan | 1 |
| `la-libertad` | La Libertad / El Tunco | Salvador | 2 |
| `la-santa` | La Santa (Lanzarote) | Espagne | 1 |
| `lobitos` | Lobitos | Perou | 1 |
| `malibu` | Malibu | Etats-Unis | 1 |
| `margaret-river` | Margaret River | Australie | 1 |
| `martinique-nord` | Nord Martinique (Le Precheur) | Martinique (FR) | 1 |
| `maui-nord-ouest` | Maui nord-ouest (Kapalua) | Etats-Unis (Hawaii) | 1 |
| `mompiche` | Mompiche | Equateur | 1 |
| `moorea` | Moorea (Haapiti) | Polynesie francaise (FR) | 1 |
| `mundaka` | Mundaka | Espagne | 1 |
| `nazare` | Nazare | Portugal | 1 |
| `nias-lagundri` | Lagundri Bay (Nias) | Indonesie | 1 |
| `noosa` | Noosa | Australie | 1 |
| `nord-fuerteventura` | Nord Fuerteventura (Corralejo/Majanicho) | Espagne | 1 |
| `north-shore-oahu` | North Shore Oahu (Haleiwa/Pupukea) | Etats-Unis (Hawaii) | 4 |
| `pantin` | Pantin (Galice) | Espagne | 1 |
| `pavones` | Pavones | Costa Rica | 1 |
| `peniche` | Peniche / Baleal | Portugal | 1 |
| `pichilemu` | Pichilemu | Chili | 1 |
| `pohnpei` | Pohnpei | Micronesie | 1 |
| `popoyo` | Popoyo / Tola | Nicaragua | 1 |
| `puerto-escondido` | Puerto Escondido | Mexique | 1 |
| `puerto-viejo` | Puerto Viejo de Talamanca | Costa Rica | 1 |
| `punaauia` | Punaauia (Tahiti ouest) | Polynesie francaise (FR) | 1 |
| `putzu-idu` | Putzu Idu / Capo Mannu (Sardaigne) | Italie | 1 |
| `raglan` | Raglan | Nouvelle-Zelande | 1 |
| `safi` | Safi | Maroc | 1 |
| `saint-jean-de-luz` | Saint-Jean-de-Luz | France | 1 |
| `sal` | Santa Maria (Sal) | Cap-Vert | 1 |
| `san-clemente` | San Clemente | Etats-Unis | 1 |
| `san-diego` | San Diego (La Jolla) | Etats-Unis | 1 |
| `santa-barbara` | Santa Barbara / Carpinteria | Etats-Unis | 1 |
| `santa-catalina-pa` | Santa Catalina | Panama | 1 |
| `santa-cruz` | Santa Cruz | Etats-Unis | 1 |
| `santa-rosa-cr` | Parc Santa Rosa (Guanacaste) | Costa Rica | 1 |
| `siargao` | Siargao (General Luna) | Philippines | 1 |
| `tamarin` | Tamarin | Ile Maurice | 1 |
| `teahupoo` | Teahupo'o (presqu'ile de Tahiti) | Polynesie francaise (FR) | 1 |
| `thurso` | Thurso (Ecosse) | Royaume-Uni | 1 |
| `tofo` | Tofo | Mozambique | 1 |
| `torquay` | Torquay / Bells | Australie | 1 |

### 13 notes historiques courtes à développer et vérifier

Toutes contiennent moins de 160 caractères ; ce seuil sert au tri de travail, pas de critère de qualité SEO. Les assertions ci-dessous sont des données existantes du projet, **pas des faits nouvellement vérifiés**.

| zone_id | Note actuelle à examiner |
|---|---|
| `desert-point-lombok` | Tres isole - hebergement basique |
| `fernando-de-noronha` | Taxe environnementale + quota visiteurs |
| `g-land` | Camps de surf sur place (saisonniers) |
| `mentawai` | Acces bateau - la plupart des trips = charter ou camp |
| `north-male` | Vagues reparties par ile/resort - certaines privees |
| `rapa-nui` | Vol uniquement depuis Santiago |
| `saint-leu` | Reglementation surf/requins a verifier |
| `san-cristobal-galapagos` | Reglementation parc national |
| `sumba-ouest` | Occy s Left = vague privatisee (Nihi) |
| `taghazout` | Enorme offre de surf camps |
| `tavarua` | Acces resorts + bateau uniquement |
| `unstad` | Surf arctique - combi 6mm |
| `walvis-bay` | Vague isolee - 4x4 conseille |

### Saisons et couverture des spots

- Les 94 spots ont deux mois entiers compris entre 1 et 12. Aucune période n’a été créée ou modifiée. Les scénarios octobre → mars et les mois voisins restent couverts par les tests métier existants.
- `popoyo`, zone `popoyo` (nom public « Popoyo / Tola ») : mars–avril en données structurées ; `flag_verif` qualifie explicitement cette plage de très restrictive et évoque une autre saison. Arbitrage humain nécessaire, sans substitution automatique.
- `praia-da-bordeira`, zone `carrapateira` : septembre–septembre, donc un seul mois. À confirmer ; cela n’est pas intrinsèquement une erreur de calcul.
- `ribeira-ilhas` et `pantin` : janvier–décembre. Cela décrit le calendrier enregistré, pas une garantie quotidienne de vagues.
- Biarritz et Imsouane : les anciennes notes évoquent des vagues toute l’année alors que les plages de mois décrivent des périodes idéales. Les formulations absolues ne sont plus publiées sur ces deux fiches ; aucune saison n’a été étendue.

65 zones ne possèdent qu’un seul spot dans la base. Ce n’est pas une preuve qu’elles n’en comptent qu’un dans la réalité. Leur priorité d’enrichissement concerne la couverture documentée, sans inventer de nouveaux spots :

`aguadilla`, `arica`, `arugam-bay`, `bali-cote-est`, `bathsheba`, `biarritz`, `bundoran`, `carrapateira`, `chicama`, `desert-point-lombok`, `fernando-de-noronha`, `g-land`, `guethary`, `half-moon-bay`, `hossegor`, `imsouane`, `jardim-do-mar`, `jeffreys-bay`, `kenting`, `la-santa`, `lobitos`, `malibu`, `margaret-river`, `martinique-nord`, `maui-nord-ouest`, `mompiche`, `moorea`, `mundaka`, `nazare`, `nias-lagundri`, `noosa`, `nord-fuerteventura`, `pantin`, `pavones`, `peniche`, `pichilemu`, `pohnpei`, `popoyo`, `puerto-escondido`, `puerto-viejo`, `punaauia`, `putzu-idu`, `raglan`, `rapa-nui`, `safi`, `saint-jean-de-luz`, `saint-leu`, `sal`, `san-clemente`, `san-cristobal-galapagos`, `san-diego`, `santa-barbara`, `santa-catalina-pa`, `santa-cruz`, `santa-rosa-cr`, `siargao`, `sumba-ouest`, `tamarin`, `tavarua`, `teahupoo`, `thurso`, `tofo`, `torquay`, `unstad`, `walvis-bay`.

### Géographie à valider

Les **77 centres de zone** portent `centre_statut = moyenne des spots - a recentrer sur le village/zone hotels`. Ils ne justifient pas des liens fondés sur une distance, ni une estimation nouvelle de transfert. Aucun centre n’a été modifié. Les **17 spots** suivants portent `coord_statut = a_verifier` :

| spot_id | zone_id | Destination | Champ / valeur |
|---|---|---|---|
| `el-gringo` | `arica` | Arica | `coord_statut = a_verifier` |
| `silverbacks` | `bocas-del-toro` | Bocas del Toro | `coord_statut = a_verifier` |
| `the-box` | `margaret-river` | Margaret River | `coord_statut = a_verifier` |
| `anse-couleuvre` | `martinique-nord` | Nord Martinique (Le Precheur) | `coord_statut = a_verifier` |
| `green-bush` | `mentawai` | Iles Mentawai | `coord_statut = a_verifier` |
| `lances-right` | `mentawai` | Iles Mentawai | `coord_statut = a_verifier` |
| `macaronis` | `mentawai` | Iles Mentawai | `coord_statut = a_verifier` |
| `ha-apiti` | `moorea` | Moorea (Haapiti) | `coord_statut = a_verifier` |
| `pasta-point` | `north-male` | Atoll Nord Male | `coord_statut = a_verifier` |
| `sultans` | `north-male` | Atoll Nord Male | `coord_statut = a_verifier` |
| `pavones` | `pavones` | Pavones | `coord_statut = a_verifier` |
| `p-pass` | `pohnpei` | Pohnpei | `coord_statut = a_verifier` |
| `ta-apuna` | `punaauia` | Punaauia (Tahiti ouest) | `coord_statut = a_verifier` |
| `mataveri` | `rapa-nui` | Hanga Roa (Ile de Paques) | `coord_statut = a_verifier` |
| `safi` | `safi` | Safi | `coord_statut = a_verifier` |
| `occys-left` | `sumba-ouest` | Sumba ouest | `coord_statut = a_verifier` |
| `cloudbreak` | `tavarua` | Tavarua / Namotu | `coord_statut = a_verifier` |

### 24 signalements déjà présents dans les données

À relire avant tout nouvel enrichissement. Certains décrivent des corrections antérieures, d’autres une incertitude géographique, un accès ou une restriction. Leur présence ne signifie pas qu’une vérification indépendante a été effectuée pendant cette phase. Ils restent affichés par le composant existant, sans modification.

| spot_id | zone_id | `flag_verif` actuel |
|---|---|---|
| `gas-chambers` | `aguadilla` | Zone corrigee: Gas Chambers est a Aguadilla (pres de Crash Boat), pas a Rincon |
| `silverbacks` | `bocas-del-toro` | Recif au large d'Isla Bastimentos - acces bateau |
| `ngor` | `dakar` | Rattache a la zone Dakar (ile de Ngor accessible en pirogue depuis Dakar) |
| `calimba-do-padre` | `fernando-de-noronha` | Nom corrige: Cacimba do Padre |
| `the-box` | `margaret-river` | Recif exact a confirmer (proche Main Break) |
| `green-bush` | `mentawai` | Mentawai = acces bateau/charter, coordonnees a confirmer |
| `lances-right` | `mentawai` | Katiet, Sipora - coordonnees a confirmer |
| `macaronis` | `mentawai` | Mentawai = acces bateau/charter, coordonnees a confirmer |
| `monpiche` | `mompiche` | Nom corrige: Mompiche |
| `ha-apiti` | `moorea` | Fond = corail (passe recifale), pas sable |
| `el-hierro` | `nord-fuerteventura` | Longitude corrigee: -13.951 (etait +13.951 = Libye). Spot cote nord Fuerteventura |
| `pasta-point` | `north-male` | Vague privee du resort Cinnamon Dhonveli (acces reserve aux clients) |
| `backdoor` | `north-shore-oahu` | Meme pic que Pipeline (Backdoor = la droite du meme peak) |
| `p-pass` | `pohnpei` | Passe recifale au large - coordonnees a confirmer |
| `popoyo` | `popoyo` | Zone corrigee: Popoyo/Tola (le lac Cocibolca est la source du vent offshore, pas la localisation). Saison mars-avril tres restrictive: fonctionne toute l'annee (avril-oct = plus de houle) |
| `salsa-brava` | `puerto-viejo` | Fond = corail (recif), pas roche |
| `ta-apuna` | `punaauia` | Fond = corail (passe recifale), pas sable |
| `safi` | `safi` | Pointe exacte (Ras Lafaa) a confirmer - spot d'acces reglemente/localisme fort |
| `saint-leu` | `saint-leu` | Fond = corail (recif), pas sable. ATTENTION: risque requin a La Reunion, reglementation prefectorale sur la pratique - a verifier avant tout trip |
| `streamer-lane` | `santa-cruz` | Nom corrige: Steamer Lane (pas Streamer) |
| `playa-naranjo` | `santa-rosa-cr` | Acces 4x4/bateau via parc national Santa Rosa |
| `occys-left` | `sumba-ouest` | Vague du resort Nihi Sumba - acces tres restreint (quota surfeurs payant) |
| `cloudbreak` | `tavarua` | Recif au large - acces bateau uniquement |
| `sk-bay` | `walvis-bay` | La vague dite Skeleton Bay est a Donkey Bay (sud de Pelican Point) |

### Reproduire le contrôle

Utiliser les variables existantes de connexion PostgreSQL en lecture seule et `NEXT_PUBLIC_SUPABASE_URL`, sans publier leurs valeurs. Chrome doit être installé pour le parseur HTML Playwright.

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run start -- --hostname 127.0.0.1 --port 3002
# Dans un autre terminal :
SEO_REPORT_PATH=.local/seo-phase2/audit.json npm run audit:seo
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3002 npm run test:e2e -- tests/e2e/seo.spec.ts tests/e2e/editorial.spec.ts
```

`audit:seo` conserve ses validations de phase 1 et produit aussi `phase2.detailedLevelReview` (identifiant, destination, champ, valeur, motif), `noEffectivePresentation`, les compteurs de couverture, la géographie et les signalements. Il échoue si les métadonnées, le contenu serveur, les liens, les faits structurés ou les associations deviennent incohérents. Les requêtes HTTP de toutes les destinations vérifient aussi les cibles des liens ajoutés.

Pour un futur déploiement de production : `SEO_BASE_URL=https://www.surftrips.fr npm run audit:seo`. Pour une preview volontairement accessible aux tests, ajouter `SEO_EXPECT_NOINDEX=1` ; ne pas modifier la protection d’accès pour les besoins du contrôle.

