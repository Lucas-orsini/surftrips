# surftrips.fr

Application de recherche de surf en français : Next.js 16 / React 19, TypeScript, App Router, Tailwind CSS 4 et Framer Motion. Le design de la landing est conservé.

## Démarrage

Node.js 22.18+ recommandé.

```sh
npm ci
# Copier .env.example vers .env.local et renseigner les variables.
npm run dev
```

`.env` et `.env.local` sont ignorés par Git. Les quatre variables métier nécessaires sont `DATABASE_URL`, `DIRECT_URL`, `TRAVELPAYOUTS_MARKER`, `TRAVELPAYOUTS_SHMARKER`. La connexion utilise `DATABASE_URL`, ou `DIRECT_URL` si elle est absente. Le widget nécessite les deux marqueurs. Aucun token d’API de prix n’est utilisé. Les deux URLs PostgreSQL et les éventuels credentials Supabase restent exclusivement côté serveur ; les marqueurs d’affiliation sont les identifiants publics nécessaires au script partenaire.

Le serveur lit **uniquement la base Supabase existante**. Aucun seed, migration automatique, écriture applicative ou secours avec données fictives. La migration image a été appliquée après autorisation explicite le 12 septembre 2026 ; la migration hébergement reste préparée pour application manuelle après revue. Aucune migration n’est exécutée par le site ou le build. Sans base disponible, les pages affichent un état d’indisponibilité. Aucun accès à la base n’est requis au build ; les pages qui en dépendent sont dynamiques.

`NEXT_PUBLIC_SITE_URL` est facultative et vaut par défaut `https://surftrips.fr`. Les variables `LEGAL_*` existantes restent à renseigner avant publication. Le premier build télécharge les polices Syne et DM Sans pour les servir localement.

## Parcours

- `/` : formulaire existant, sélection de zones réelles et carte basée sur les coordonnées de la base.
- `/recherche` : résultats ; `/search` propose aussi ce parcours. Paramètres : `niveau`, `origine`, `dateDepart`, `dateRetour`, `region` facultative.
- `/destination/[zoneId]` : contenu serveur, metadata et canonical sans paramètres. Avec un voyage valide, seuls les spots accessibles sont proposés et le module vol apparaît. Sans paramètres, toute la fiche reste indexable et un mini formulaire permet de préparer le vol sur place.
- `/destinations` : catalogue réel ; sitemap dynamique contenant uniquement les zones existantes.

Exemple : `/recherche?niveau=intermediaire&origine=PAR&dateDepart=2026-10-10&dateRetour=2026-10-20`. Les dates sont validées par rapport au jour courant en Europe/Paris et doivent rester dans les douze prochains mois, retour compris.

## Architecture

| Fichiers                                                     | Responsabilité                                                                                                        |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `lib/db/index.ts`, `zones.ts`, `search.ts`                   | Pool PostgreSQL TLS, transactions READ ONLY, requêtes paramétrées, cache catalogue de 60 secondes, diagnostic serveur |
| `lib/db/rows.ts`                                             | Adaptation explicite des colonnes inspectées, isolement des valeurs inconnues                                         |
| `lib/surf/levels.ts`, `season.ts`, `score.ts`, `matching.ts` | Métier pur, aucun import PostgreSQL ni React                                                                          |
| `lib/validation/`                                            | Validation partagée et obligatoirement appliquée sur le serveur                                                       |
| `lib/airports.ts`                                            | Liste blanche indépendante des départs, volontairement non exhaustive                                                 |
| `lib/travel/` et `components/travel/`                        | Paramètres Specific Route, iframe, mini formulaire et secours                                                         |
| `proxy.ts`, `lib/security/rate-limit.ts`                     | Protection des deux routes de recherche                                                                               |

Les composants reçoivent des saisons, niveaux compatibles et timelines préparés côté serveur. Les pays sont chargés depuis `zones.pays`. Il n’existe pas de colonne continent. Les photos destinations proviennent exclusivement du chemin Supabase `hero_image_path` ; la migration est appliquée et le bucket public `destinations` existe. Vingt zones ont une photo publiée ; les 57 autres utilisent le fallback graphique Surftrips. Voir [le guide des images](docs/destination-images.md) pour les prochaines sélections. `NEXT_PUBLIC_SUPABASE_URL` fournit l’origine publique du Storage, sans clé.

Les [deux lots Unsplash](docs/destination-image-sources.md) contiennent vingt photographies réelles publiées, leurs crédits, les candidates comparées et leur statut de publication. Les fiches utilisent une bannière de 340/280/220 px selon l’écran ; cartes et landing gardent leur composition. Voir [les captures et contrôles](docs/destination-banners.md). Le script opérateur `scripts/publish-destination-images.ts` accepte `--manifest docs/destination-image-batch-02.json` pour le deuxième lot et vérifie le lot sans écrire par défaut ; `--publish` permet ensuite l’upload et l’association des chemins, après création manuelle du bucket et application de la migration. Il nécessite une clé serveur `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`, uniquement pour cette opération ; aucune de ces clés n’est utilisée par le site.

## Règles du moteur

Trois niveaux centralisés : `debutant`, `intermediaire`, `expert`. Un spot dont le minimum est inconnu reste exclu du matching. Un idéal inconnu est signalé et ne reçoit pas de bonus ; son minimum valide reste appliqué sans conversion. Le [rapport de base](docs/database.md) liste les 41 lignes historiques à corriger.

La saison ne supprime jamais une destination accessible. Le statut retient le meilleur statut parmi les spots accessibles et les mois traversés par le voyage. Une période manquante reste inconnue, jamais présentée comme une saison certaine. La timeline utilise exactement les intervalles `mois_debut` / `mois_fin`, avec passage circulaire de décembre à janvier.

Score sur 100, déterministe : niveau 45 %, saison 30 %, nombre de spots 15 %, transfert 10 %. Après le filtre strict de sécurité, l’idéal correspondant vaut 1, l’accessibilité seule 0,8. Saison optimale 1, épaule 0,6, hors saison 0,2, inconnue 0. Nombre de spots saturé à cinq. Transfert : décroissance linéaire jusqu’à six heures ; les durées composites ou ambiguës ne reçoivent aucun bonus et leur texte original reste affiché. Égalités départagées par identifiant de zone.

En Monde entier : deux zones maximum par valeur de pays existante, puis douze au total. Avec un pays : toutes les zones admissibles de ce pays. Les exclusions de niveau et de région sont conservées dans le résultat serveur, jamais exposées dans l’URL ou un endpoint public.

## Travelpayouts

Le script `https://tpemd.com/content` est chargé exclusivement dans la fiche destination avec un voyage validé. `campaign_id=111`, `promo_id=4484`, EUR, français. Les paramètres exacts sont `from_name`, `to_name`, `departure`, `return`, dates ISO conservées. Le script réel a été inspecté : il valide bien `AAAA-MM-JJ` et crée lui-même `widget-holder`.

Une seule iframe `srcDoc`, remontée par clé composée des quatre paramètres de vol. Un observateur de DOM et les messages vérifiés depuis cette iframe pilotent l’état de chargement et la hauteur. Le script ne monte qu’après hydratation pour éviter un double chargement. Le message `loaded`, dont la source et l’origine sont vérifiées, confirme seulement l’affichage du partenaire : il peut aussi afficher un écran sans offre. Après cinq secondes sans affichage lorsque la section approche de l’écran, le secours apparaît. Aucun prix n’est calculé ou stocké sur les résultats.

Le bouton **Rechercher sur Kiwi.com** reste toujours disponible en dehors de l’iframe. Il ouvre la recherche complète avec le départ choisi (y compris `PAR`, sans le restreindre à Orly ou CDG), l’aéroport de la zone et les dates exactes. Il utilise [le contrat de liens officiel Travelpayouts](https://support.travelpayouts.com/hc/en-us/articles/360010109719-Kiwi-com-affiliate-links) : `/deep?from=…&to=…&departure=…&return=…`, encodé dans `custom_url` du lien affilié `c111.travelpayouts.com/click` avec `promo_id=3791` et `TRAVELPAYOUTS_SHMARKER`. Ce contrat est distinct de celui du widget `4484`, qui conserve ses paramètres `from_name` / `to_name`. Sans marqueur, le bouton utilise directement le lien Kiwi. Le lien KAYAK indépendant reste disponible si les domaines affiliés sont bloqués. Aucun vol n’est demandé lorsque départ et arrivée désignent le même aéroport.

Diagnostic reproduit le 10 septembre 2026 : Genève → Melbourne, 10–20 août 2027. Le widget annonçait aucun voyage et proposait seulement l’accueil Kiwi sans critères ; la recherche complète avec les mêmes paramètres affichait des vols. Le bouton indépendant évite ce blocage sans modifier le DOM du partenaire. La disponibilité reste déterminée par Kiwi.

L’iframe isole le DOM du partenaire de React. `allow-same-origin` est nécessaire au stockage utilisé par le script réel : cette isolation est fonctionnelle et ne constitue pas une frontière de sécurité entre origines. Les états React restent des frères de l’iframe. Les marqueurs d’affiliation sont publics ; les secrets PostgreSQL et les tokens de services ne lui sont jamais transmis.

## Hébergement et Hotels.com

La section **Où dormir** des fiches destinations associe jusqu’à trois recommandations éditoriales Supabase au widget officiel Hotels.com. Elle apparaît juste après le vol, dans le DOM comme à l’écran : surf → vol → logement. Le widget fonctionne aussi sans recommandations, sans date préremplie ni données Hotels.com extraites. Son chargement est différé à l’approche de la section, avec une instance isolée par destination, le Pubref `surftrips-[zoneId]` et un secours en cas de blocage.

La migration [20260912_accommodations.sql](migrations/20260912_accommodations.sql) reste à appliquer manuellement ; aucun hébergement n’a été ajouté. Les fiches, photos autorisées et liens affiliés exacts doivent être saisis par l’administrateur. `HOTELS_COM_FALLBACK_URL` peut recevoir un lien affilié général fourni par Creator Toolbox ; elle reste facultative et aucun lien n’est inventé si elle est vide. Voir [le guide hébergement](docs/accommodation.md) pour le schéma, la saisie éditoriale, les droits et les tests.

## Limitation des recherches et déploiement

Fenêtre glissante : 30 requêtes de recherche maximum en 60 secondes, réponse HTTP 429 avec `Retry-After`. Les deux routes partagent le compteur. Mémoire bornée et aucune IP brute conservée.

**Contrat d’hébergement :** le proxy d’entrée doit écraser `x-real-ip` avec l’IP du visiteur (ex. Nginx `proxy_set_header X-Real-IP $remote_addr;`) et empêcher l’accès direct au serveur Node. Sur Vercel, le code utilise `x-vercel-forwarded-for`, réservé à la plateforme. Les headers `x-forwarded-for` envoyés par un visiteur ne permettent pas de contourner la protection. Sans IP de confiance, les requêtes partagent un quota conservateur.

Le compteur intégré est **par processus Node**, adapté à une instance. Pour plusieurs instances ou un déploiement serverless, configurer également une limite globale 30/min/IP au niveau de l’ingress/WAF ou fournir un stockage partagé existant. Aucun service externe ni nouvelle table n’a été créé pour cela. Un redémarrage réinitialise le compteur local.

## Vérifications

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run start
npm run test:e2e
npm run db:inspect
npm run test:e2e -- --config tests/images/playwright.config.ts
```

Playwright utilise Chrome local, deux profils desktop/mobile, et les données Supabase réelles. Seules les réponses tierces sont simulées pour tester de façon reproductible le succès, le blocage, l’écran sans offre et le remontage. Deux contrôles supplémentaires utilisent le vrai widget partenaire et suivent le lien affilié jusqu’aux résultats Kiwi pour vérifier le trajet et les dates après redirection. Les tests couvrent aussi les URLs, l’accessibilité axe et les largeurs 320, 390, 768, 1024 et 1440 px. `PLAYWRIGHT_BASE_URL` permet de cibler un serveur de production déjà lancé. Les tests unitaires utilisent des fixtures isolées dans `tests/`, jamais importées dans l’application.

Les tables et politiques existantes sont documentées dans [docs/database.md](docs/database.md). Les crédits des visuels restent dans [ASSETS.md](ASSETS.md).

## Validation réalisée le 10 septembre 2026

- TypeScript, ESLint et build Next.js de production réussis.
- 22 tests unitaires et 20 tests navigateur desktop/mobile validés, dont deux avec le widget réel et redirection affiliée jusqu’aux résultats Kiwi.
- Parcours réel Intermédiaire / Paris / 10–20 octobre 2026 / Monde entier : douze zones Supabase, au plus deux par pays, uniquement des spots accessibles ; paramètres conservés jusqu’au widget.
- Fiche directe, changement d’origine, instance unique, blocage publicitaire, script silencieux, iframe vide, écran partenaire sans offre et aéroports identiques vérifiés ; contrôles axe réussis sur la landing et une fiche avec secours.
- HTTP 429 constaté au-delà de trente requêtes sur les deux routes de recherche.
- Aucun credential local retrouvé dans les sources versionnables ou les bundles JavaScript client ; aucun driver PostgreSQL dans ces bundles. `.env` et `.env.local` sont ignorés par Git.
- 77 zones et 94 spots lus dans la base ; aucun schéma, enregistrement ou politique RLS modifié. Les quatre variables métier sont présentes dans la configuration locale. Les valeurs devront aussi être configurées chez l’hébergeur.
