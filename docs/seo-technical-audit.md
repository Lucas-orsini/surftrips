# Audit SEO technique — phase 1

Audit commencé le 3 novembre 2026. Aucun déploiement autorisé ou effectué.

## Inventaire initial (avant modifications)

- Arbre Git propre. Next.js **16.3.4**, React 19, TypeScript, App Router exclusivement ; documentation embarquée Next.js lue avant écriture.
- `app/layout.tsx` : langue française, Metadata API, template de titre, description générique, OG, carte Twitter ; origine par défaut sans `www`. Icône SVG et image OG générée 1200 × 630 existantes.
- `/` et `/destinations` : Server Components dynamiques, catalogue réel, liens HTML. `/destination/[slug]` : page serveur, métadonnées spécifiques, canonical sans paramètres, sections spots/saisons/niveaux, liens de destinations partageant un aéroport.
- `app/destination/[slug]/loading.tsx` enveloppe toute la fiche dans Suspense : la réponse brute place le contenu dans un bloc `hidden` révélé par JavaScript. `/destination/seo-inexistante-20261103` renvoie **200**, y compris en production, avec `noindex` après le début du stream.
- `/recherche` et `/search` (alias) : résultats personnalisés serveur, `noindex, follow`, loading. Paramètres réels : `niveau`, `origine`, `dateDepart`, `dateRetour`, `region`. Aucun endpoint API de recherche.
- `/mentions-legales` et `/confidentialite` : pages publiques statiques volontairement `noindex, follow`. Informations légales en partie conditionnées par les variables `LEGAL_*`. Pas de blog ni de pages thématiques.
- `/go/booking/accommodation/[id]`, `/go/booking/destination/[zoneId]` : handlers avec redirection temporaire 302, `no-store`, `X-Robots-Tag: noindex, nofollow`, validation et erreurs 400/404/503. Pas de changement nécessaire de l’affiliation.
- `app/sitemap.ts` : source réelle, 79 URLs (77 destinations + accueil + catalogue), pas de dates artificielles ; propage déjà les erreurs Supabase. Domaine sans `www` à corriger. Catalogue en cache 60 secondes ; sitemap dynamique.
- `app/robots.ts` : autorise `*`, bloque `/recherche` et `/go/`. Le blocage de la recherche empêche la lecture du `noindex` ; `/search` n’est pas bloquée. Aucune politique GPTBot spécifique.
- JSON-LD, tokens Search Console/Bing et protection d’indexation preview applicative absents.
- `lib/db/` : PostgreSQL via `pg`, TLS vérifié, transactions READ ONLY, colonnes explicites, paramètres SQL, imports `server-only`. `getZone` mémoïsé par requête React ; catalogue via `unstable_cache` 60 s. RLS active sur `zones` et `spots`, politiques SELECT `anon`/`authenticated` inchangées. Connexion directe serveur, pas de SDK Supabase navigateur.
- Inspection réelle : **77 zones, 94 spots**, aucun champ de publication ni date de modification dans zones/spots. Toutes les zones sont actuellement publiques. Uluwatu = `bukit-bali`. Aucune saison mensuelle manquante.
- Composants client réservés à la recherche, navigation, animations, carte, gestion des erreurs d’images et widget Travelpayouts. Sections éditoriales et hébergements rendus serveur ; Suspense limité aux hébergements à l’intérieur de la fiche.
- Images : Next Image, AVIF/WebP, `sizes`, bannière préchargée, images secondaires lazy, tailles réservées, fallback graphique. Polices `next/font` auto-hébergées. Widget dans iframe après voyage valide, Booking sans script externe.
- `next.config.ts` : images et Turbopack, pas de redirect/rewrite/header SEO. `proxy.ts` ne cible que les deux routes de recherche, limite 30/min ; conservé. Pas de `vercel.json`, pas de projet `.vercel` lié. `.vercelignore` exclut secrets et diagnostics.
- Production vérifiée : HTTPS apex → **308 www** ; HTTP apex → 308 HTTPS apex ; HTTP www → 308 HTTPS www ; slash final destination → 308 sans slash. Production servie par Vercel. Canonical et sitemap initiaux utilisent pourtant l’apex.
- Scripts existants : typecheck, lint, tests unitaires Node, tests Playwright desktop/mobile, build, inspection DB ; documentation dans `docs/`. Les anciens rapports ne sont pas assimilés aux résultats de cette mission.

## Corrections et résultats

### Synthèse et priorités

Les fondations existaient : Server Components, métadonnées spécifiques, canonical sans paramètres, sitemap alimenté par Supabase, images optimisées, séparation serveur/client. Les corrections portent sur leur cohérence et le moment où le serveur commence à transmettre le HTML. Aucun algorithme, niveau, saison, formulaire, score, tracking, SID, schéma SQL ou politique RLS n’a été modifié.

| Priorité | Problème confirmé | Traitement |
|---|---|---|
| P0 pour les lecteurs sans JS | La fiche entière arrivait dans un fragment HTML masqué, révélé par React | Suppression du `loading.tsx` couvrant toute la fiche ; contenu essentiel hors Suspense. Le chargement indépendant des hébergements est conservé. Cela ne signifie pas que Google ne pouvait jamais indexer l’ancienne version. |
| P1 | Destinations inexistantes HTTP 200 | Attente des métadonnées avant transmission (`htmlLimitedBots: /.*/`) et suppression de la frontière de loading ; vrai 404 et `noindex` natif Next. |
| P1 | Production sur www, canonical/sitemap sur apex | Origine centralisée `https://www.surftrips.fr`, utilisée par Metadata API, sitemap, robots et JSON-LD. Anciennes variables apex normalisées. |
| P1 | `/recherche` interdite au crawl malgré `noindex` | Retrait de cette interdiction ; les deux variantes de recherche restent `noindex, follow`. |
| P1 préventif | Pas de garde applicative preview | `X-Robots-Tag: noindex` et meta robots pour Vercel non-production et `next dev`, sans blocage robots empêchant leur lecture. |
| P2 | Partage générique et héritage OG incomplet | OG/Twitter explicites pour accueil, catalogue et chaque fiche, photo réelle Storage ou image générique existante de secours. |
| P2 | Pas de données structurées | `WebSite` sur l’accueil ; `BreadcrumbList` sur les fiches, sérialisation protégée contre `</script>`. |
| P2 | Pas de contrôle global maintenable | Commande `npm run audit:seo`, tests unitaires SEO et navigateur sans JS, mesures de laboratoire réexécutables. |

Le titre et la description dynamiques existants ont été conservés dans leur substance, car ils identifient déjà la destination, le pays, le nombre de spots et l’aéroport réel. Aucune rédaction de 77 nouveaux textes. Les titres de partage sont distincts, et les schémas ne contiennent ni avis, prix, offre, FAQ, SearchAction, adresse d’entreprise ou identité juridique inventés. `Organization` est différé faute d’identité d’éditeur suffisamment renseignée ; `WebPage` n’apporte ici pas de complément nécessaire.

**Points ouverts :** les corrections restent locales jusqu’au déploiement décidé par le propriétaire (P1 opérationnel). Les accès Search Console/Bing/Vercel et les métriques terrain ne sont pas disponibles pour conclure sur l’indexation réelle. L’écran 404 sans JS peut rester minimal sur cette version Next (P2, statut/noindex conformes). L’enrichissement des fiches et la validation des données historiques sont réservés à la phase 2. Aucun autre blocage P0/P1 corrigeable dans le périmètre du dépôt n’a été identifié par les contrôles exécutés.

### Matrice des routes après correction

Les statuts ci-dessous sont ceux du build local, hors panne de données. Toutes les canonical éditoriales utilisent `https://www.surftrips.fr`.

| Route | Indexation / crawl | Paramètres | Rendu et HTTP | Canonical |
|---|---|---|---|---|
| `/` | Oui / oui | Aucun paramètre éditorial | Dynamique serveur, H1, présentation et liens, 200 | Origine sans slash, sérialisation Next |
| `/destinations` | Oui / oui | Aucun paramètre éditorial | Dynamique serveur, 77 fiches liées, 200 | `/destinations` |
| `/destination/[slug]` valide | Oui / oui | `origine`, `dateDepart`, `dateRetour`, `niveau`, `region` | Dynamique serveur, contenu essentiel visible sans JS, 200 | Chemin stable sans paramètres |
| Destination inconnue / slug invalide | Non / oui | Sans effet | 404 natif, `noindex` | Aucune canonical de destination |
| `/recherche`, `/search` | Non / oui | Critères du voyage | Serveur avec loading, 200 ou 429 au-delà du quota | Aucune : résultats personnalisés volontairement non indexés |
| `/mentions-legales`, `/confidentialite` | Non / oui | Aucun | Statique, 200, `noindex, follow` conservé | Aucune nécessaire pour ces pages non indexées |
| `/go/booking/accommodation/[id]`, `/go/booking/destination/[zoneId]` | Non / crawl déconseillé par robots existant | Entrées de tracking internes conservées | Handler 302 temporaire, ou 400/404/503 ; no-store/noindex | Aucune |
| `/sitemap.xml` | Document de découverte | Aucun | Handler dynamique, 200 XML ; 500 si source inaccessible à froid | Contient exclusivement les URLs canoniques |
| `/robots.txt` | Directives de crawl | Aucun | Route Metadata statique, 200 texte | Référence le sitemap www |
| `/opengraph-image`, `/icon.svg`, `/_next/*`, images | Ressources accessibles | Paramètres techniques possibles | Images/JS/CSS ; hors sitemap | Sans objet |
| Autres routes inexistantes | Non | Sans effet | 404 | Aucune |

Le blocage historique `/go/` réduit l’exploration des redirections commerciales ; il ne garantit pas à lui seul leur disparition d’un index. Les headers `noindex, nofollow` restent en place pour les clients qui consultent ces routes, et les liens sont `rel="sponsored noopener noreferrer"`. Aucune redirection permanente ajoutée aux flux affiliés.

### Tableau avant/après

| Élément | État avant | Correction | État après |
|---|---|---|---|
| HTML serveur | Contenu réel serveur, mais fiche dans fragment masqué après loading | Frontière de streaming déplacée, métadonnées bloquantes | 77 fiches avec contenu HTML hors scripts/éléments masqués ; cinq destinations et accueil/catalogue testés sans JS |
| Métadonnées | Titres/descriptions spécifiques déjà présents ; héritage social incomplet | Helper partagé, OG/Twitter explicites | 77 titres/descriptions non vides, aucun doublon détecté |
| Canonical | Paramètres déjà ignorés correctement ; domaine apex en conflit avec www | Origine centralisée, normalisation de la variable | www sans paramètres ; personnalisation conservée |
| Sitemap | 79 URLs réelles, sans dates inventées, domaine incorrect | Même source/cache, origine corrigée, validation et déduplication, erreur sur catalogue vide | 79 URLs dont 77 destinations éligibles ; XML valide, aucune manquante/en trop |
| Robots | `*` autorisé, `/recherche` et `/go/` interdits | Recherche explorable pour lire noindex | Googlebot, Bingbot et OAI-SearchBot autorisés sur les pages publiques |
| JSON-LD | Absent | WebSite/BreadcrumbList, échappement de `<` | JSON valide, URL et nom concordants, tests d’injection |
| Images | Next Image, tailles réservées, formats et fallback déjà adaptés | Réutilisation pour OG/Twitter ; aucune photo remplacée | 77 images sociales publiques HTTP 200 et secours PNG HTTP 200 |
| Core Web Vitals | Rapports historiques non repris comme mesures actuelles | Mesures locales après correction, sans changement visuel injustifié | Laboratoire détaillé ci-dessous ; terrain/INP p75 **non mesurés** |
| HTTP / 404 | Slug inconnu HTTP 200 | Contrôle avant début de transmission | 404 pour navigateur et agents testés ; panne de source → 500, pas de faux sitemap 200 |
| Search Console | Aucun token/fichier trouvé ; compte **non vérifiable** | Procédure manuelle documentée | Aucune connexion ni propriété créée |
| Bing Webmaster | Aucun token/fichier trouvé ; compte **non vérifiable** | Procédure manuelle documentée | Aucune connexion ni propriété créée |
| Crawlers IA | Politique générique permissive, HTML dépendant du démasquage React | HTML accessible, métadonnées stables, règles conservées sauf recherche | OAI-SearchBot autorisé ; GPTBot sans règle spécifique comme avant ; firewall réel **non vérifiable** |

### Validation des données et des erreurs

Inspection PostgreSQL en lecture seule : **77 zones**, **94 spots**, RLS active, politiques publiques SELECT. Aucun champ `published` ni `updated_at` exploitable dans les tables de destination/spot : les 77 zones publiques constituent l’ensemble éligible. Une nouvelle politique de publication n’a pas été inventée. Pas de `lastModified` artificiel.

Le sitemap utilise directement `getCatalog()` plutôt que de préparer tous les modèles d’affichage, scores de présentation et images. Il conserve le cache existant de 60 secondes et le comportement de propagation des erreurs. Un catalogue vide déclenche désormais une erreur explicite ; des lignes sans identifiant valide, nom ou pays ne sont pas déclarées indexables. Les mêmes critères gouvernent la meta robots correspondante. Aucune exclusion effective aujourd’hui.

Simulation locale, cache froid, variables de connexion vides : `/sitemap.xml`, `/destinations` et `/destination/ericeira` → **500** ; aucun `<urlset>` partiel. L’accueil conserve son **200** et son contenu générique utilisable, conformément au fallback produit existant. Un cache de catalogue précédemment réussi peut servir les dernières données lors d’une revalidation en échec ; ce n’est pas un sitemap partiel fabriqué.

Les transactions READ ONLY et imports `server-only` sont conservés. Scan des **18 bundles JavaScript client** du build final : aucune occurrence des valeurs locales PostgreSQL, clés serveur Supabase ou configuration serveur CJ recherchées. Cela vérifie les secrets locaux connus, pas des variables distantes auxquelles l’audit n’a pas accès. La présence de RLS ne signifie pas qu’une connexion PostgreSQL privilégiée ne peut pas la contourner : les droits du rôle de déploiement et les paramètres du compte Vercel restent à contrôler par le propriétaire, sans changement de permissions dans cette mission.

Les paramètres ne sont ni supprimés de l’adresse ni réécrits : tests sans critères, origine seule, dates seules, niveau seul et voyage complet. Les valeurs partielles déclenchent toujours les validations produit ; un voyage complet conserve le trajet, les dates et le niveau dans les composants et liens de retour. Les contrôles métier unitaires restent inchangés.

### Résultats automatisés

- **TypeScript, lint, build production : réussis.** Le premier typecheck a rencontré des types Next générés en cours de renouvellement et deux erreurs de typage du nouvel outillage, corrigées. Un build sandbox a ensuite échoué sur l’ouverture d’un port par PostCSS/Turbopack ; un build propre autorisé, après isolation du cache de compilation contenant cette erreur, a réussi. Aucun contournement des vérifications TypeScript/lint.
- **52 tests unitaires réussis**, dont cinq nouveaux tests SEO : origine, environnements, sitemap, métadonnées et sécurité JSON-LD.
- Suite navigateur : **68 cas sélectionnés**, dont **5 variantes mobile déjà ignorées par les tests existants** (largeurs couvertes dans le scénario desktop). Premier passage : 60 succès, 3 échecs. Les trois cas passent après correction du test : attendre l’hébergement réellement visible avant de mesurer son espacement ; isoler les recherches Booking du quota partagé. Relance ciblée : **4/4**. Les assertions de géométrie et les limites de requêtes de l’application n’ont pas été assouplies.
- Les **18 cas SEO desktop/mobile** passent : cinq fiches sans JS, accueil/catalogue sans JS, statuts/robots, variantes de paramètres, sitemap et secours social. La normalisation du slash racine par Next a été prise en compte, sans créer une redirection inutile.
- Dernier build après revue : réussi ; les **18/18 cas SEO ont été rejoués et réussis sur ce build final** (`.local/seo/final-browser/`). Au total, 63 scénarios navigateur distincts validés après corrections/recontrôles, plus 6 scénarios de mesure ; les nombres de relances ne sont pas comptés comme de nouveaux tests distincts.
- Audit exhaustif : **77/77 HTTP 200 et indexables** sur le serveur de production local ; **79 URLs sitemap = 2 pages + 77 destinations** ; aucune URL manquante, supplémentaire, dupliquée ou avec paramètres ; aucune description/titre vide ou dupliqué ; aucun slug invalide ; **77/77 images sociales HTTP 200**.
- Tests métier : recherche réelle 12 résultats mondiaux et maximum deux par pays, filtres et validation, navigation entre destinations, images Storage/fallback, responsive et accessibilité axe, widget chargé/sans offre/bloqué/silencieux, préremplissage, remontage et protection des messages iframe.
- Test Travelpayouts réel desktop/mobile : script réel et lien de secours suivi jusqu’aux résultats Kiwi avec Paris/Lisbonne et les dates correctes. Sur desktop, l’iframe Kiwi répondait HTTP 200 mais l’état Surftrips observé était `fallback` ; lors des mesures de laboratoire ultérieures, les six voyages atteignaient `ready`. L’état du fournisseur peut varier ; aucune offre ou disponibilité n’est garantie.
- Booking : contenu serveur, routes et états d’erreur vérifiés ; construction CJ/SID et 302 testées. Contrôle HTTP réel de `/go/booking/destination/ericeira` : **302 vers `www.kqzyfj.com`**, paramètre SID présent, `noindex, nofollow`, `private, no-store, max-age=0`. Cette redirection CJ n’a pas été suivie pour effectuer une réservation. Les comptes fournisseurs et la comptabilisation effective des commissions ne sont pas accessibles à cet audit.

Les preuves détaillées locales sont dans `.local/seo/` (ignoré par Git), notamment `audit.json`, `regressions/`, `recheck/`, `performance/` et `environment-http.json`. Le rapport présent conserve les résultats utiles même si ces artefacts sont supprimés.

### URLs réellement contrôlées

- Production existante : quatre variantes HTTP/HTTPS apex/www, slash final, `/`, `/destinations`, `/destination/ericeira`, `/destination/biarritz`, `/destination/imsouane`, `/destination/hossegor`, `/destination/uluwatu` (inexistant), `/destination/seo-inexistante-20261103`, `/search`, `/recherche`, `/robots.txt`, `/sitemap.xml`.
- Build local sur `http://127.0.0.1:3002` : accueil, catalogue, **tous les slugs de la base**, routes légales et techniques, recherche et redirections Booking. Le vrai slug Uluwatu utilisé par les tests d’acceptation est **`/destination/bukit-bali`**. Les 77 chemins et résultats exacts sont répertoriés par la commande d’audit.
- Les dates des voyages automatisés sont calculées dans le mois suivant l’exécution (ici 10–20 décembre 2026), plutôt que figées dans le passé.
- Requêtes publiques avec `Googlebot`, `bingbot`, `OAI-SearchBot`, `ChatGPT-User` : Ericeira HTTP 200 avec H1 dans la réponse. Ce sont des tests depuis l’IP de l’auditeur, **pas une preuve d’accès depuis les plages IP officielles des robots**.
- Simulation preview sur `127.0.0.1:3003`, `VERCEL_ENV=preview` : accueil, destination, mentions, robots et sitemap portent `X-Robots-Tag: noindex`. Les pages portent aussi `noindex, follow`, les canonical restent www. Les mêmes URLs sur le build production n’ont pas de header noindex ; les pages légales conservent volontairement leur meta noindex.

### Performances et limites

Mesures après correction sur `next build` + `next start`, Chrome local, profils desktop 1440 × 1000 et iPhone 13 émulé, un worker, trois navigations par scénario. Pas de limitation CPU/réseau ; caches locaux et navigateur chauds après première navigation, Supabase réelle. Les scripts partenaires sont réels pour le scénario voyage. Les latences sont donc celles du laboratoire, **pas celles d’un mobile sur réseau cellulaire ni d’un déploiement Vercel**.

**6 tests de mesure réussis, 18 navigations au total**, aucune erreur JavaScript capturée dans ces scénarios. Résultats en millisecondes, sous forme médiane [minimum–maximum] pour le LCP ; les maxima d’interaction sont ceux des trois visites.

| Profil / scénario | LCP médian [min–max] | CLS maximum | Interaction maximum observée | TTFB [min–max] |
|---|---:|---:|---:|---:|
| Desktop accueil | 60 [56–148] ms | 0 | 48 ms | 11–22 ms |
| Mobile accueil | 56 [56–120] ms | 0 | 40 ms | 7–16 ms |
| Desktop Ericeira directe | 256 [244–260] ms | 0 | 40 ms | 200–222 ms |
| Mobile Ericeira directe | 256 [248–256] ms | 0 | 48 ms | 202–211 ms |
| Desktop Ericeira avec voyage | 272 [260–284] ms | 0 | 48 ms | 209–227 ms |
| Mobile Ericeira avec voyage | 236 [236–256] ms | 0 | 56 ms | 199–208 ms |

JavaScript décodé observé dans le document parent : 579 313 octets sur l’accueil, 482 067 sur les destinations. Ce n’est ni le transfert compressé total ni la taille cumulée des iframes tierces. Le widget réel était `ready` à la fin des six visites avec voyage.

La métrique `interactionMax` désigne le maximum des événements d’interaction observés au-delà du seuil de 16 ms ; **ce n’est pas l’INP terrain**. Les événements internes à l’iframe cross-origin ne sont pas intégralement observables depuis le parent. Le CLS utilise les fenêtres de session, en excluant les déplacements immédiatement consécutifs à une entrée utilisateur.

Objectifs de référence à vérifier au **75e percentile terrain** : LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1. Aucun accès CrUX/Search Console/RUM dans cette mission : **LCP terrain, INP terrain et CLS terrain non mesurés**. Les seuils ne sont ni des garanties ni un résultat Lighthouse présenté comme INP. [Référence Google Web Vitals](https://web.dev/articles/vitals).

Images déjà conformes : AVIF/WebP via Next, `preload` pour la bannière réellement prioritaire, `sizes` adaptés, lazy secondaire, géométrie réservée, fallback. Polices auto-hébergées. Aucun remplacement d’image ou d’intégration. Le widget charge uniquement après validation du voyage ; son isolation, son redimensionnement et le secours sont conservés. Aucune optimisation lourde n’est justifiée par ces seuls échantillons locaux. Étudier sur données terrain la quantité de JavaScript, les effets des animations et le coût de l’iframe partenaire avant toute décision produit. Le blocage du streaming **des métadonnées** peut augmenter le TTFB face à une base lente ; le lookup de destination est déjà partagé entre page et metadata via React cache. Le streaming secondaire des hébergements reste actif.

### Environnements, sécurité et points non vérifiables

- Aucun accès au projet Vercel lié, aux règles de firewall, à Deployment Protection, aux logs des crawlers ou aux variables distantes. Aucune protection existante n’a été retirée. Vercel pose normalement un header noindex sur ses previews, avec une exception pour certains domaines personnalisés : la garde applicative couvre également ce cas lorsque `VERCEL_ENV` indique preview. [Documentation Vercel](https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines).
- `VERCEL_ENV=production` n’active pas noindex ; preview/development/environnement personnalisé l’activent. Hors Vercel, `NODE_ENV=development`/`test` l’activent ; `next start` local reproduit intentionnellement la politique production pour les tests. Ne pas exposer publiquement un serveur de test lancé comme production. Tester l’environnement cible après un **nouveau build**, car les headers et pages statiques sont construits à cette étape.
- Les canonical n’utilisent jamais `VERCEL_URL`, un Host de requête ou un domaine preview. `NEXT_PUBLIC_SITE_URL` peut être vide ou désigner l’origine Surftrips ; une autre origine, des credentials ou un chemin déclenchent une erreur de configuration plutôt qu’un sitemap incohérent.
- La page inconnue possède un vrai statut 404 et noindex ; l’interface 404 Next apparaît dans le navigateur hydraté. Sur cette version Next, la réponse sans JS de cette erreur peut être un document minimal sans le H1 de l’écran d’erreur ; ce n’est pas une page éligible à l’indexation. Les pages valides n’ont pas cette limitation.
- Aucun accès Search Console/Bing : propriété, soumission passée du sitemap, couverture réelle, canonical choisie par Google et statistiques d’indexation **non vérifiables**.

### Robots IA et GEO

`OAI-SearchBot` sert à la découverte dans les fonctions de recherche ChatGPT. `GPTBot` concerne les contenus susceptibles d’être utilisés pour l’entraînement ; l’autoriser n’est pas nécessaire pour autoriser OAI-SearchBot. `ChatGPT-User` sert à des accès déclenchés par des utilisateurs et n’est pas le robot d’indexation Search. [Documentation officielle OpenAI](https://developers.openai.com/api/docs/bots).

La règle générique initiale reste permissive, sans nouvelle décision concernant GPTBot : aucune règle spécifique d’autorisation ou d’interdiction ajoutée. Le propriétaire peut choisir ultérieurement d’ajouter un groupe `GPTBot` avec `Disallow: /` tout en conservant l’accès Search. Ce choix est distinct des contrôles de sécurité de Vercel et ne vaut pas garantie d’effacement rétroactif ou de citation.

Pas de `llms.txt` ajouté : option expérimentale éventuelle, sans bénéfice de visibilité établi ici et sans remplacer HTML, liens, canonical, sitemap ou robots. Aucun procédé de manipulation ni contenu artificiel destiné aux assistants. Aucun positionnement, trafic, résultat enrichi ou citation automatique promis.

### Fichiers créés, modifiés et supprimés

| Statut | Fichiers | Justification |
|---|---|---|
| Créés | `lib/seo.ts` | Origine, politique d’environnement, génération metadata/sitemap et JSON-LD purs et testables |
| Créés | `scripts/audit-seo.ts`, `tests/seo.test.ts`, `tests/e2e/seo.spec.ts`, `tests/e2e/seo-performance.spec.ts` | Census source/HTTP, invariants et sécurité, HTML sans JS, laboratoire |
| Créé | `docs/seo-technical-audit.md` | Inventaire initial, preuves, limites et procédures |
| Modifiés | `app/layout.tsx`, `app/page.tsx`, `app/destinations/page.tsx`, `app/destination/[slug]/page.tsx` | Metadata cohérente, robots preview, données structurées sans section visuelle ajoutée |
| Modifiés | `app/sitemap.ts`, `app/robots.ts`, `next.config.ts` | Source/cache existants, origine, crawl/noindex, contrôle du streaming metadata |
| Modifiés | `package.json`, `README.md` | Commande d’audit et documentation de l’origine réelle |
| Modifiés | `tests/e2e/landing.spec.ts`, `tests/e2e/destination-images-live.spec.ts`, `tests/e2e/accommodation.spec.ts`, `tests/e2e/travel-layout.spec.ts` | Canonical attendue www ; isolation des recherches et attente du contenu streamé avant mesure |
| Supprimé | `app/destination/[slug]/loading.tsx` | Évite d’envoyer HTTP 200 et une fiche masquée avant contrôle de son existence ; autres loading et composants préservés |

Aucune dépendance ajoutée, aucun lockfile modifié, aucune migration, aucune écriture de données, aucun changement du design system. Les fichiers de test ne sont pas importés par l’application.

### Actions manuelles du propriétaire

1. **Examiner cette phase avant tout futur déploiement.** Le site actuellement en ligne n’a pas reçu ces corrections. Aucun déploiement, commit, push, DNS ou domaine n’a été modifié dans cette mission.
2. **Google Search Console** : ouvrir le compte propriétaire et vérifier s’il existe déjà une propriété Domaine `surftrips.fr`. Sinon, l’ajouter ; relever le TXT exact fourni par Google, puis le poser manuellement chez le fournisseur DNS au nom/hôte indiqué (généralement `@`). La valeur réelle est **inconnue sans accès au compte** : aucun token fictif n’est fourni. Conserver l’enregistrement après validation. [Procédure Google Search Console](https://developers.google.com/search/docs/monitor-debug/search-console-start).
3. **Bing Webmaster Tools** : importer la propriété Google vérifiée ou ajouter `https://www.surftrips.fr` ; suivre la méthode proposée (fichier XML, balise HTML, ou vérification DNS). Copier uniquement le code/nom/valeur exacts donnés par Bing. Pour un fichier, le placer ultérieurement à la racine publique ; pour une balise, utiliser la Metadata API. Aucun token n’a été ajouté ici. [Procédure Microsoft Bing](https://blogs.bing.com/webmaster/2025/6/Start-Using-Bing-Webmaster-Tools-to-Improve-Your-Site-Visibility/).
4. **Vercel avant votre déploiement** : vérifier le projet existant, `VERCEL_ENV=production` sur production et preview sur les previews, et `NEXT_PUBLIC_SITE_URL=https://www.surftrips.fr` ou variable absente. Vérifier les connexions serveur et les marqueurs existants sans copier les clés administratives Supabase dans le navigateur. Ne pas changer les redirections/domaines : leurs comportements actuels sont cohérents.
5. **Vercel sécurité** : contrôler que Deployment Protection concerne bien les environnements voulus ; vérifier dans les logs/firewall l’accès des robots officiels à `/`, `/destinations`, `/destination/*`, `/robots.txt`, `/sitemap.xml` et aux ressources. N’autoriser les plages IP officielles que si un blocage est réellement constaté ; ne pas désactiver globalement le firewall.
6. **Après votre futur déploiement** : contrôler le domaine www, une variante à paramètres, un slug inexistant (404), robots et sitemap ; confirmer l’absence de noindex sur production et sa présence sur une vraie preview, y compris son domaine personnalisé éventuel. Réexécuter l’audit contre production en utilisant la même base que celle du site.
7. **Soumettre le sitemap** `https://www.surftrips.fr/sitemap.xml` dans Search Console et Bing, puis inspecter `/`, `/destinations`, Ericeira, Biarritz, Imsouane, `bukit-bali` et Hossegor. Comparer canonical déclarée et canonical choisie, HTML exploré, accès robots, statut d’indexation et erreurs. Contrôler les rapports Pages/Sitemaps/Core Web Vitals à mesure que les données deviennent disponibles ; les changements ne sont pas immédiats ni garantis.
8. **Choix restant** : décider explicitement de la politique GPTBot si une interdiction d’entraînement est souhaitée. Aucun choix nouveau n’a été pris ici.

### Préparation de la phase 2 — constats, sans rédaction

- **63/77 zones sans présentation `zones.notes`**. Cela ne signifie pas 63 pages vides : toutes possèdent au moins un spot avec notes et une saison.
- **14/77 présentations restantes de moins de 160 caractères** : `desert-point-lombok`, `ericeira`, `fernando-de-noronha`, `g-land`, `mentawai`, `north-male`, `rapa-nui`, `saint-leu`, `san-cristobal-galapagos`, `sumba-ouest`, `taghazout`, `tavarua`, `unstad`, `walvis-bay`. Le seuil sert au tri éditorial interne, pas à une règle Google.
- **41 spots dans 38 zones** portent encore l’idéal historique `tous_niveaux`, correctement affiché « À vérifier ». Minimums et matching inchangés. Validation humaine nécessaire ; pas de conversion automatique.
- Aucun spot sans notes, aucune zone sans spot, aucun mois de saison manquant dans l’inspection actuelle. Ces champs restent documentaires, pas une prévision sportive ou météo.
- Revoir ultérieurement les présentations, leur précision géographique, les informations de transfert incertaines, l’orthographe des pays et les champs signalés par le diagnostic métier. Ne pas inventer de météo, sécurité de spot ou saison.
- Maillage actuel : catalogue exhaustif, navigation globale, liens de destinations partageant un aéroport. En phase 2, étudier des liens éditoriaux contextuels pertinents et des sections utiles à partir de sources vérifiées ; aucune nouvelle section, fiche thématique ou FAQ créée dans cette phase.
- Les informations légales et les coordonnées d’éditeur non renseignées sont à compléter par le propriétaire avant d’enrichir un éventuel schéma Organization. Les photos sont désormais disponibles pour les 77 destinations ; les anciens rapports mentionnant seulement 20 photos ne décrivent plus la base actuelle.

### Réexécuter les vérifications

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run start -- --hostname 127.0.0.1 --port 3002
# Dans un autre terminal :
npm run audit:seo
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3002 npm run test:e2e -- tests/e2e/seo.spec.ts
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3002 npm run test:e2e -- tests/e2e/seo-performance.spec.ts --workers 1
# Après votre futur déploiement seulement, avec la bonne base :
SEO_BASE_URL=https://www.surftrips.fr npm run audit:seo
# Pour contrôler un serveur de dev/preview accessible :
SEO_BASE_URL=http://127.0.0.1:3003 SEO_EXPECT_NOINDEX=1 npm run audit:seo
```

L’audit lit les données, le HTML brut avec un DOMParser inerte, le sitemap et les images publiques. Il retourne un code d’échec si une anomalie technique est détectée, et conserve séparément les points éditoriaux de phase 2. `SEO_REPORT_PATH` permet de choisir le chemin du JSON détaillé. Le compte source doit correspondre à l’environnement HTTP ciblé ; une base différente produira légitimement un écart.

### Références techniques

- Documentation embarquée de **Next.js 16.3.4** : Metadata API (héritage superficiel, priorité des fichiers, streaming), sitemap, robots, notFound et JSON-LD, sous `node_modules/next/dist/docs/`. Documentation publique consultée : [Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata), [sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap), [robots](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots).
- Le contrôle porte sur le HTML réel, pas seulement le RSC/hydratation, conformément aux distinctions d’exploration/rendu de la [documentation JavaScript SEO Google](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics).
- Les URLs de personnalisation conservent leurs paramètres et déclarent leur page éditoriale de référence ; la canonical est un signal, pas une garantie de sélection : [canonicalisation Google](https://developers.google.com/search/docs/crawling-indexing/canonicalization).
- Le JSON-LD reflète les informations réelles sans promesse de résultat enrichi : [données structurées Google](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data).

**Fin de périmètre : phase 2 et phase 3 non commencées ; aucun déploiement effectué.**
