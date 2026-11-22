# Surf forecast — stratégie et implémentation SEO

Audit et réalisation : **22 novembre 2026**. Travail local dans le dépôt existant ; **aucun déploiement Vercel**, achat, abonnement, scraping ou écriture Supabase. Les chiffres de résultat ci-dessous décrivent les contrôles locaux, pas du trafic ou un classement acquis.

## A. Opportunité SEO et audit initial

### Capacités réelles de Surftrips

Le dépôt était propre au départ. Les rapports [phase 1](seo-technical-audit.md), [phase 2](seo-destinations-phase2.md), [phase 3 et refonte éditoriale](seo-thematic-pages-phase3.md) et [Vercel Analytics](vercel-web-analytics.md) ont été consultés, puis confrontés au code actuel.

- Next.js installé : **16.3.4**, App Router, TypeScript. Documentation embarquée Metadata API, sitemap et JSON-LD lue avant modification.
- Routes : `/`, `/destinations`, `/destination/[slug]`, `/recherche`, alias `/search`, pages légales, quatre guides (`/ou-surfer-en/novembre`, `/ou-surfer-en/decembre`, `/surf/portugal`, `/comparer/ericeira-vs-peniche`), handlers Booking/CJ, sitemap, robots, images sociales. Aucune route `/surf-forecast` ni service de prévisions dans le code. La route candidate publique répondait **404** lors de la vérification HTTP.
- Le sitemap public consulté pendant la mission contient bien **83 URL**, dont les quatre guides ; le build local terminé en contient **84**. Aucun déploiement n’a changé l’état public.
- Inspection PostgreSQL réelle, via les transactions `READ ONLY` existantes : **77 zones et 94 spots**. Les seules tables du schéma applicatif `public` sont `zones`, `spots`, `accommodations`. Les colonnes de spots décrivent identité, coordonnées, vague/fond, niveaux, mois, notes et signalements. Aucune série météo-marine, hauteur/période/direction de houle, vent, date de calcul ou de validité de prévision. Les notes documentaires ne constituent pas des observations météo.
- Aucun fournisseur de prévisions intégré dans les routes, composants ou bibliothèques. Aucune preuve d’autorisation commerciale d’une source météo. Cette conclusion concerne le dépôt et la base accessibles, pas d’éventuels contrats privés du propriétaire.
- **41 niveaux idéaux historiques `tous_niveaux`** toujours présents. RLS active sur `zones`/`spots`, politiques SELECT publiques existantes. Aucun changement de données, niveaux, saisons, classifications, moteur ou RLS.
- Composants éditoriaux : `ThemePage`, `ArticleDestination`, `ArticlePhoto`, styles `surf-article`, `article-header`, `article-prose`, `article-planning`. Prose limitée à 720 px, design magazine, sources et photographies existantes.
- SEO : origine canonique `https://www.surftrips.fr`, helper `pageMetadata`, sitemap issu du catalogue et des guides autorisés, sérialisation JSON-LD sécurisée. HTML serveur et protection `noindex` des environnements non productifs déjà en place. Les résultats personnalisés restent `noindex, follow` ; robots et règles des crawlers sont conservés.
- Le maillage des phases précédentes comprend notamment 107 relations entre destinations et 102 liens de fiches vers les guides. Pas de guide pédagogique de prévisions préexistant : les fiches et les mois rappellent seulement qu’une saison n’est pas une prévision.
- Analytics : **une instance** de `WebAnalytics` dans le layout, SDK officiel `@vercel/analytics/next`, `beforeSend` limité aux pages vues et retirant paramètres/fragments. Aucun événement de clic ni suivi de tunnel existant. Les accès aux comptes Vercel Analytics et Search Console ne sont pas fournis.

Inspection brute locale : `/tmp/surftrips-forecast-schema.txt`. Empreintes des lignes complètes de `zones`/`spots` dans `.local/surf-forecast/source-before.json` ; contrôle après travaux dans `source-after.json`. Aucun secret n’est reproduit dans ce rapport.

### Méthode de recherche et limites

Requêtes publiques exécutées : `surf forecast` (exacte, sans ajout), `surf forecast france prévisions surf`, `comprendre surf forecast lire prévisions houle`, variantes de guide, puis recherches ciblées de sources primaires. Les accès directs aux résultats Google avec `hl=en&gl=us` et `hl=fr&gl=fr` ont échoué dans l’outil Web.

**Il ne s’agit donc pas d’un top 10 Google confirmé, ni d’une comparaison géolocalisée contrôlée France/États-Unis.** Le tableau suivant conserve les dix premiers liens de pages de services renvoyés pour la requête exacte par l’outil public disponible. Leur ordre d’observation n’est pas une position Google. L’outil ne signale pas ces liens comme sponsorisés ; il ne permet pas d’inventorier ou d’exclure avec certitude toutes les annonces d’une SERP Google. Actualités, vidéos et PDF secondaires ne sont pas mélangés à cet échantillon.

Les titres sont ceux exposés par la recherche ou la page consultable, sans prétendre avoir extrait chaque balise HTML `title`. « Actualisé » ci-dessous décrit l’affichage ou la promesse du site ; ni précision des modèles ni fraîcheur réelle de chaque spot n’ont été certifiées. Aucune donnée concurrente n’a été extraite pour alimenter Surftrips.

### Dix résultats de services observés pour la requête exacte

| Domaine et URL | Titre observé | Type / intention | Fonctions et actualisation | Structure et différenciation observables |
|---|---|---|---|---|
| [surfbase.org/surf-conditions/best-today](https://surfbase.org/surf-conditions/best-today/) | Best Surf Conditions Today | Sélection de conditions, A/B | Scores, prévisions, créneaux, liens de spots | Liste de comparaison et date de snapshot ; extrait de recherche daté du jour, page ouverte avec snapshot plus ancien : fraîcheur non certifiée. |
| [surfbase.org](https://surfbase.org/) | Surf Forecasts by Spot: Waves, Wind & Swell | Annuaire mondial, A/B | Recherche, hauteur, période, vent, score et horodatages | Entrées par pays, conditions et spots ; navigation très orientée consultation. Même domaine que la ligne précédente, pas deux concurrents distincts. |
| [currentsurf.com](https://currentsurf.com/) | Current Surf Forecast: Free 10-Day Forecasts, No AI | Outil de prévisions américain, A/B | Prévisions annoncées sur dix jours, vent, marées, recherche ; heure d’actualisation affichée | Regroupement par États/régions, valeurs en pieds, sélection des conditions du moment ; méthode physique mise en avant. |
| [kiwisurf.app/spots/world](https://kiwisurf.app/spots/world/) | Surf forecasts worldwide · 500 breaks in 20 countries | Annuaire mondial, A/B | Notes sur les prévisions du jour annoncées dans l’extrait | Page détaillée inaccessible à l’ouverture ; structure/horodatage non vérifiés au-delà de l’extrait. Sans lien avec l’intégration de vols Kiwi de Surftrips. |
| [trueforecast.surf](https://trueforecast.surf/) | TrueForecast — Surf Forecast, Spot by Spot \| Waves, Wind & Swell | Outil mondial, A/B | Vagues, houle, vent, marée heure par heure et horizon de seize jours annoncés | Accueil lisible : listes de spots et pays. Prévisions annoncées, valeurs et horodatage des pages de spots non vérifiés. |
| [swellion.com](https://swellion.com/) | Swellion — Global Surf Forecast · 5 Ocean Models & NDBC Buoys | Outil de prévisions, A/B | Modèles océaniques et bouées annoncés dans l’extrait | Aucun corps lisible à l’ouverture ; titre retourné alors « Surf Forecast ». Qualité et fraîcheur non vérifiables. |
| [surfline.com](https://www.surfline.com/) | SURFLINE.COM \| Global Surf Reports, Surf Forecasts, Live Surf Cams and Coastal Weather | Service de spots, A/B | Reports, modèles et webcams visibles dans les extraits ; documentation officielle consultée | Accueil refusé HTTP 403. La documentation distingue observations et prévisions, graphiques de houle/vent/marée ; aucune revendication de position ou de trafic. |
| [surfingen.com/en](https://surfingen.com/en) | Surf forecast for enclosed seas | Outil spécialisé, A/B | Hauteur déferlante, période, vent et fenêtres après tempête, quatorze jours annoncés | Navigation par mers fermées, recherche de spot, dates visibles dont certaines antérieures au jour de consultation ; intérêt de niche, fraîcheur non généralisable. |
| [glass-report.com](https://glass-report.com/) | Free Surf Cams & Surf Reports \| The Glass Report | Portail de conditions, A/B | Webcams, prévisions, créneaux et heure UTC affichée | Sélections gauches/droites, régions, actualités ; fournisseurs cités en pied de page. Leurs choix de licence ne valent pas autorisation pour Surftrips. |
| [surfspot.it](https://www.surfspot.it/index.php?lang=en) | Surf forecast worldwide: waves, wind and webcams for 2048 spots | Outil international, A/B | Sept jours, 48 h, comparaisons et alertes annoncés par l’extrait | Page inaccessible à l’ouverture ; seule la description du système de scores est observable dans la recherche. |

### Complément France / francophonie

Ces pages ont été trouvées par la recherche française complémentaire ou ouvertes directement pour compléter le panorama. **Elles ne sont pas ajoutées artificiellement au top dix de la requête exacte.**

| Page et titre observé | Intentions et fonctionnalités | Contenu, actualisation et différence |
|---|---|---|
| [fr.surf-forecast.com — Prévisions de Surf et Bulletins de Surf Mondiaux](https://fr.surf-forecast.com/) | A/B ; recherche pays/région/spot, cartes, bulletins | Interface française, couverture mondiale ; le nom de marque peut aussi expliquer une part d’intention navigationnelle. Pas de vérification de chaque bulletin. |
| [surf-forecast.com/countries/France/breaks — Surf Forecast & Surf Reports for FRANCE](https://www.surf-forecast.com/countries/France/breaks) | A/B ; annuaire de spots français, Wave Finder | Pays puis régions ; page anglaise visant des spots en France, pas nécessairement des internautes francophones. |
| [surfline.com — France Surf Report & Forecast](https://www.surfline.com/surf-reports-forecasts-cams/france/3017382) | A/B ; carte, spots, webcams, valeurs de prévision dans l’extrait | Destination géographique France, interface anglaise. Horodatage complet non vérifié. |
| [surf-report.com — Météo surf, Océan surf report…](https://www.surf-report.com/) | A/B et pédagogie ; photos du jour, webcams, prévisions, bouées, marées | Navigation française séparant reports, prévisions et guides ; service quotidien plutôt qu’une simple définition. |
| [allosurf.net — Météo surf report…](https://www.allosurf.net/) | A/B ; cartes de houle et vent, recherche de spot, reports | Modèles, résolution et horizons affichés dans la navigation (96 h, dix/seize jours selon produit), annuaire et contributions. |
| [gotosurf.fr/surf — Spots de surf en France : prévisions houle et vent](https://gotosurf.fr/surf) | A/B ; houle, vent, note du jour, sept jours annoncés | Répertoire régional français, saison ajoutée aux prévisions ; actualisation déclarée, précision non contrôlée. |

L’échantillon anglophone est dominé par la consultation opérationnelle des spots, avec recherche, modèles, horaires et parfois webcams. Le complément français présente la même attente sous « prévisions surf », « météo surf » ou « surf report ». Les pages pédagogiques trouvées en ajoutant « guide » ou « comprendre » répondent à une intention différente ; leur présence ne valide aucun volume.

### Intention et faisabilité

- **A — Prévisions à court/moyen terme : dominante dans l’échantillon.** « En temps réel » doit distinguer une observation d’un calcul prévisionnel.
- **B — Vérifier un spot : dominante également**, souvent indissociable de A.
- **C — Comprendre les prévisions : cible réalisable** avec un guide original et des termes explicites. Les guides d’aide officiels de [Surfline](https://support.surfline.com/hc/en-us/articles/13749782983579-Understanding-the-Spot-Forecast-Page-on-the-Surfline-Website) illustrent ce besoin.
- **D — Choisir une destination selon une période : proposition de valeur de Surftrips**, mais pas l’intention principale démontrée de la requête générique. C’est la continuité du parcours après l’apprentissage, pas une substitution aux prévisions.

**Un guide seul ne sert pas suffisamment A/B pour revendiquer la conquête de « surf forecast ».** L’opportunité accessible est informationnelle : « comprendre surf forecast », « comment lire les prévisions surf », « période de houle surf », « différence houle et vagues », « prévisions surf et saison ». « Surf forecast guide » reste un terme d’observation ; sa langue anglaise ne justifie pas une page anglophone isolée.

Langue choisie : **français intégral**, terme « surf forecast » expliqué comme vocabulaire courant des bulletins. Marché prioritaire : internautes francophones en France ; Belgique/Suisse et autres pays francophones à observer si des impressions apparaissent. Il ne s’agit pas d’une estimation chiffrée de leur demande. Aucun `hreflang`, faute de versions linguistiques équivalentes ; aucune traduction du produit.

### Ahrefs

Recherche dans le dépôt et ses fichiers locaux accessibles : aucun export Ahrefs identifié (nom, CSV, XLSX). Aucun compte connecté. Le pays, la période de mesure, le volume mensuel, la valeur précise de Keyword Difficulty, Traffic Potential, l’intention classée et les pages concurrentes Ahrefs sont **non vérifiés**.

La valeur « environ 10 000 » reste **l’indicateur rapporté par le propriétaire, de nature non confirmée** ; elle n’est pas assimilée à dix mille recherches mensuelles, encore moins à dix mille visites potentielles. « Difficulté faible » reste également non vérifiée. Demander ultérieurement un export avec pays, date, métrique exacte et pages concurrentes pour réviser la stratégie, sans bloquer le guide utile.

## B. Stratégie retenue et conditions d’une évolution météo

**Option B : guide éditorial uniquement.** Aucune prévision n’est fournie. La page annonce cette limite dès son introduction, distingue saisons et prévisions, et renvoie vers des bulletins externes pour l’utilisateur qui cherche des conditions actuelles. Pas de page satellite, score météo, dashboard, faux service ou nouvelle API.

### Open-Meteo Marine : étude documentaire, intégration inactive

Sources officielles consultées le 22 novembre : [documentation Marine](https://open-meteo.com/en/docs/marine-weather-api), [tarification](https://open-meteo.com/en/pricing), [conditions](https://open-meteo.com/en/terms), [licences](https://open-meteo.com/en/licence).

| Point | Constat et conséquence |
|---|---|
| Usage commercial | L’API hébergée gratuite est réservée au non-commercial. Surftrips utilise l’affiliation : ne pas la brancher sur cette offre. Un abonnement autorise l’usage commercial ; aucune souscription effectuée. |
| Coût et quotas | Standard : 1 M d’appels/mois ; Professional : 5 M ; Enterprise : plus de 50 M annoncés. Le montant en euros n’est pas exposé dans le texte de tarification consultable : **prix non vérifié**, devis/checkout à examiner par le propriétaire. Offre gratuite : 600/min, 5 000/h, 10 000/jour, 300 000/mois, sans droit de production commerciale. |
| Comptage | Certaines requêtes comptent plusieurs appels selon variables et horizon. Dimensionner le budget avec la grille et les requêtes finales ; pas un appel par visiteur. |
| Couverture | Modèles mondiaux et régionaux. Exemple MFWAM : environ 8 km, pas natif 3 h, horizon dix jours, renouvellement 12 h. DWD EWAM : Europe, environ 5 km, horaire, 78 h, renouvellement 12 h. Ces résolutions ne décrivent pas individuellement un banc de sable. |
| Limites | Hauteur de vague modélisée au large ≠ hauteur déferlante garantie. La documentation signale une précision côtière limitée pour marées/courants à environ 8 km. Un pas de sortie horaire ne signifie pas un nouveau calcul chaque heure. Vent atmosphérique à traiter séparément. |
| Attribution et redistribution | Données API sous CC BY 4.0 : crédit, lien de licence, indication des changements. La page Marine demande aussi l’attribution des producteurs des modèles. Distinguer ces droits sur les données des conditions d’accès au service ; vérifier les licences amont retenues avant redistribution. |
| Fiabilité | Aucun service ne garantit la précision du spot. Valider coordonnées marines et modèle, comparer à des observations autorisées et tester l’exploitation avant publication. Les coordonnées du catalogue comportent déjà des signalements historiques. |

L’intégration reste **absente du code**, donc désactivée sans clé, requête réseau, dépendance ou abonnement latent. Pour aller plus loin : accord explicite du propriétaire sur fournisseur, coût et licence ; pilote limité avec coordonnées validées ; cache serveur partagé ; fournisseur/modèle, unités, date de calcul, dernière récupération et période de validité visibles ; règles d’expiration ; état indisponible en cas de panne ; aucun ancien bulletin présenté comme actuel. Tester données manquantes, retard/panne, fuseaux/changement d’heure, unités, attribution et expiration avant de rendre cette fonctionnalité publique. Aucune garantie de classement ne découlerait de cette intégration.

## C. Implémentation

- **URL :** `/surf-forecast`, route statique explicite, sans paramètres métier ni route dynamique.
- **Langue :** `fr`, héritée du layout.
- **Title rendu :** `Surf forecast : comprendre les prévisions de surf | Surftrips.fr`.
- **H1 :** `Surf forecast : comprendre les prévisions de surf`.
- **Description :** `Apprends à lire la houle, la période, le vent et les marées. Un exemple expliqué pour préparer tes sessions et distinguer prévisions et saisons de surf.`
- **Sections :** cinq paramètres (hauteur, période, direction, vent, marées), méthode en quatre étapes, exemple de deux plages, prévisions/saisons, préparation du voyage, conclusion et sources.
- **Valeur propre :** même bulletin fictif appliqué à deux expositions opposées ; raisonnement explicite sans calcul de hauteur au bord ni jugement de sécurité ; distinction entre choix du voyage et adaptation de la session ; exemple réel d’accès dépendant de la marée à Biarritz, sourcé auprès de la Ville.
- **Illustration :** SVG original rendu serveur, onde au même point au fil du temps, hauteur creux/crête et intervalle entre deux crêtes. Sans échelle ni données météo ; titre, description et légende accessibles. Pas de bibliothèque, image générée, animation ni script pédagogique client.
- **Données :** texte éditorial versionné, sources primaires publiques ; aucun chargement de prévisions, aucune conversion des saisons. La page est indépendante de Supabase à l’exécution. Ses destinations ont été vérifiées dans le catalogue et leurs liens sont contrôlés en HTTP.
- **Composants :** classes éditoriales existantes, `Link`, helpers `pageMetadata`, `canonicalUrl`, `serializeJsonLd` ; styles propres dans un CSS Module. Layout, navigation, footer et Analytics existants réutilisés.
- **CTA :** « Trouver ma destination surf » → `/destinations#recherche`. Le formulaire actuel recueille niveau, dates, origine et région, sans valeurs de voyage inventées.

### Maillage retenu

Un lien contextuel dans chacun des **quatre articles existants**, placé entre le choix de destination et la préparation du départ. Le texte d’introduction du lien varie selon guide mensuel, pays ou comparatif. Leurs liens connexes antérieurs restent présents.

Le nouveau guide relie **Biarritz** (marée et accès), **Ericeira et Peniche** (lire les caractéristiques par spot et comparer un voyage), les quatre guides et le moteur. Liens externes de consultation vers Surf-Forecast et Surf Report, sans intégration ni affiliation ajoutée, et liens primaires de sources explicatives.

Les fiches destination ont été examinées : elles disposent déjà d’une note distinguant saison et prévision. Aucun lien automatique dans les 77 fiches, aucune nouvelle entrée globale de navigation. Le guide est découvert par les articles et le sitemap ; cette implantation évite d’ajouter une promesse météo au parcours principal.

### Fichiers

| Fichier | Rôle |
|---|---|
| `app/surf-forecast/page.tsx` | Guide serveur, schéma, liens et CTA |
| `app/surf-forecast/surf-forecast.module.css` | Schéma et styles pédagogiques limités à cette page |
| `lib/editorial/surf-forecast.ts` | Métadonnées, introduction et références |
| `components/editorial/ThemePage.tsx` | Quatre liens entrants contextuels |
| `app/sitemap.ts` | Ajout explicite du chemin au sitemap existant |
| `scripts/seo-forecast-audit.ts` | Contrôles du guide et de ses liens entrants |
| `scripts/audit-seo.ts`, `scripts/seo-theme-audit.ts` | Extension de la commande existante, sans perdre les contrôles antérieurs |
| `tests/e2e/surf-forecast.spec.ts` | HTML, liens, CTA, quatre largeurs et axe |
| `tests/e2e/analytics.spec.ts` | Nouvelle page incluse dans la vérification du SDK existant |
| `docs/seo-surf-forecast.md` | Présent rapport |

## D. SEO technique et performances

Canonical unique : **`https://www.surftrips.fr/surf-forecast`**, y compris avec des paramètres d’URL. Open Graph français et Twitter `summary_large_image` utilisent l’image sociale existante. Un H1, H2/H3 hiérarchisés, sommaire à ancres et contenu initial complet côté serveur. Next pré-génère cette page en HTML statique ; aucune dépendance de rendu à un fournisseur de données.

JSON-LD **`WebPage`** : URL, titre, description, langue et rattachement au site. C’est un schéma descriptif pertinent pour un guide sans auteur individuel attesté. Aucun faux auteur, date de publication commerciale, `WeatherForecast`, note, avis ou FAQ ; aucun résultat enrichi garanti.

Le sitemap ajoute le chemin au registre existant par son identifiant, sans total codé en dur, date artificielle ou multiplication des URL. La déduplication et les erreurs de catalogue demeurent celles des phases précédentes. Les routes de recherche/affiliation restent exclues. Pas de changement de robots, DNS, configuration Next/Vercel ou protections preview.

Réutilisation des polices et CSS éditoriaux ; CSS Module limité à la nouvelle route ; SVG natif sans ressource externe. Aucun nouveau composant client ni dépendance. Les relevés de laboratoire et vérifications finales figurent ci-dessous ; ils ne représentent pas les Core Web Vitals terrain, l’INP ou un percentile d’utilisateurs réels.

## E. Contrôles exécutés

Validation terminée sur build de production local, `http://127.0.0.1:3004`, le 22 novembre 2026.

| Contrôle | Résultat |
|---|---|
| `npm run typecheck` | Réussi |
| `npm run lint` | Réussi |
| `npm test` | **75/75**, aucun échec ni test ignoré |
| `npm run build` | Réussi ; `/surf-forecast` pré-générée statiquement |
| Navigateur, sept fichiers ciblés | **78 réussis, 8 ignorés, 0 échec** sur 86 cas déclarés, 1,4 minute |
| `npm run audit:seo` | **Zéro anomalie** ; 77/77 destinations HTTP 200 et indexables, quatre guides conservés, nouvelle page HTTP 200 ; **84 URL** sitemap, aucun manque, surplus ou doublon |
| Nouvelle page, sans JavaScript | H1, contenu visible, title/description, canonical même avec paramètres, OG/Twitter, SVG accessible, JSON-LD `WebPage`, CTA vers le formulaire : conformes |
| Liens | Liens internes/ancres vérifiés, quatre liens entrants présents ; chemins satellites inexistants en 404 |
| Responsive / accessibilité | **1440, 1280, 768 et 390 px** ; aucune largeur débordante, prose ≤720 px, corps ≥16 px ; axe WCAG A/AA sans violation détectée ; ancres et CTA au clavier opérationnels |
| Analytics | Une instance et nettoyage des URL vérifiés sur ordinateur/mobile, nouvelle page incluse ; collecteur neutralisé dans ces tests, aucune preuve de réception distante revendiquée |
| Intégrité Supabase | Empreintes SHA-256 avant/après **identiques sur les lignes complètes des 77 zones et 94 spots** ; 41 idéaux historiques conservés |
| Diff | `git diff --check` sans erreur ; moteur, affiliations, données, RLS, configuration, dépendances et design global inchangés |

Les huit exclusions sont les doublons mobiles des quatre largeurs du guide et des quatre largeurs des articles, déjà exécutées dans le projet desktop. L’échantillon existant comprend accueil, catalogue, les quatre articles et cinq fiches SEO (Ericeira, Biarritz, Imsouane, Bukit/Uluwatu, Hossegor), plus recherche réelle, préremplissage Portugal, étapes Surf → Vol → Logement, erreurs Booking et comportement du widget de vols. Les assertions antérieures restent en place. Cette campagne n’est pas l’ensemble de tous les fichiers E2E du dépôt ; aucun achat, réservation ou test de disponibilité réelle d’offres n’a été effectué.

Revue visuelle réalisée sur les captures de la page, de son introduction au pied d’article, notamment les vues 1440 et 390 px. Le schéma, l’exemple fictif, le texte et le CTA sont lisibles ; pas de tableau météo ou collection de cartes. Captures des quatre largeurs sous `.local/surf-forecast/e2e/`, dont [introduction 1440 px](../.local/surf-forecast/e2e/surf-forecast-lecture-clavier-et-accessibilité-à-1440px-desktop/forecast-1440-top.png), [page complète 1440 px](../.local/surf-forecast/e2e/surf-forecast-lecture-clavier-et-accessibilité-à-1440px-desktop/forecast-1440-full.png) et [introduction 390 px](../.local/surf-forecast/e2e/surf-forecast-lecture-clavier-et-accessibilité-à-390px-desktop/forecast-390-top.png).

### Relevés de performance locaux

Chrome sans limitation CPU/réseau, serveur local déjà sollicité, trois navigations par page et largeur, fenêtre d’observation de deux secondes après chargement des polices. Le script Analytics distant est neutralisé pour éviter la télémétrie de test. **Douze observations de laboratoire, pas un avant/après contrôlé, un audit Lighthouse ou des mesures terrain.** L’article novembre sert de repère contemporain, pas de baseline avant modification.

| Page / largeur | HTML reçu | LCP observé | TTFB observé | CLS | JS décodé observé |
|---|---:|---:|---:|---:|---:|
| Guide / 1440 px | 52 526 octets | 64–96 ms | 3,5–25,1 ms | 0 | 467 019 octets |
| Guide / 390 px | 52 526 octets | 44–64 ms | 2,6–5,0 ms | 0 | 467 019 octets |
| Novembre / 1440 px | 59 131 octets | 60–88 ms | 11,9–21,8 ms | 0 | 493 418 octets |
| Novembre / 390 px | 59 131 octets | 64–80 ms | 11,1–13,7 ms | 0 | 493 418 octets |

Le JavaScript recensé inclut le layout et les mécanismes existants ; aucun JS pédagogique spécifique n’a été ajouté. Ces temps rapides dépendent du serveur local et du cache. Ils ne prédisent pas le chargement mobile réel. INP terrain, CrUX, percentiles et performances après déploiement : **non mesurés**.

Artefacts locaux non versionnés : `.local/surf-forecast/audit.json`, `metrics.json`, `source-integrity.json`, captures et résultats `e2e/`. Les empreintes comparées sont `be4d995a64e49d423579476485b0688902187ff3d4ddd2cfb9e4b24318c29e41` (zones) et `061b97bbc9abffbee86b09aef19d07dd1697949b246ad56877db1049c21c23e6` (spots).

Les tentatives initiales bloquées par le sandbox (DNS Supabase, accès local/Chrome) ont été relancées avec les permissions nécessaires. Elles ne comptent pas comme validations réussies. Aucun test fournisseur météo n’est requis ici : aucune intégration n’existe. La future matrice nécessaire est décrite en B.

Reproduction :

```sh
npm run typecheck
npm run lint
npm test
npm run build
npm run start -- --hostname 127.0.0.1 --port 3004
SEO_BASE_URL=http://127.0.0.1:3004 SEO_REPORT_PATH=.local/surf-forecast/audit.json npm run audit:seo
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3004 npm run test:e2e -- tests/e2e/surf-forecast.spec.ts tests/e2e/seo.spec.ts tests/e2e/themes.spec.ts tests/e2e/analytics.spec.ts tests/e2e/landing.spec.ts tests/e2e/travel.spec.ts tests/e2e/accommodation.spec.ts --output .local/surf-forecast/e2e
```

## F. Mesure après publication

**Aucune métrique d’audience, impression, position, indexation Google ou conversion n’a été inventée.** Accès aux comptes non disponibles. L’état technique indexable local ne prouve pas une indexation Google.

### Search Console

Sur la propriété existante du domaine canonique, inspecter l’URL après publication : accès, dernière exploration, canonical déclarée/choisie, indexation et sitemap. Dans Performance / Résultats Web, filtrer exactement cette page, puis observer requêtes, pays, appareils, impressions, clics, CTR et position moyenne. Ces métriques sont définies dans [l’aide Search Console](https://support.google.com/webmasters/answer/7576553).

| Groupe | Expressions hypothétiques | Usage |
|---|---|---|
| Informationnel prioritaire | comprendre surf forecast ; comment lire les prévisions surf ; prévisions houle surf ; période de houle surf | Examiner les requêtes réellement affichées, puis regrouper leurs variantes. Aucun volume validé. |
| Informationnel à surveiller | surf forecast guide | Mesurer la langue des requêtes et leur adéquation au contenu français ; ne pas déduire une stratégie anglaise sans données. |
| Générique diagnostic | surf forecast ; prévisions surf | Observer sans en faire la promesse de la page. Faible CTR possible si le lecteur attend un outil de conditions. |
| Géographique diagnostic | surf forecast france ; surf forecast portugal | Intention probablement A/B : pas de pages géographiques de prévisions créées. N’enrichir éditorialement que si les requêtes réelles révèlent un besoin explicatif compatible. |

Point de départ à la date réelle de publication, premier contrôle technique à J+7/J+14, puis comparaison de périodes complètes de 28 jours à J+28, J+56 et J+84. Ce sont des rendez-vous de revue, pas des délais d’indexation ou résultats promis. Conserver filtres et pays, dater les changements et tenir compte de la saisonnalité. Les requêtes masquées par confidentialité peuvent empêcher leur somme de correspondre au total de la page. Une position moyenne n’est pas une position fixe pour tous les internautes.

### Vercel Web Analytics

Réutiliser **l’installation existante**, environnement Production, filtre de page `/surf-forecast` et dates comparables. Relever visiteurs, pages vues et sources/pays disponibles selon le compte ([documentation Vercel](https://vercel.com/docs/analytics/using-web-analytics)). Les visites Vercel sont toutes sources ; les clics Search Console proviennent de Google Search. Les deux nombres n’ont pas à être égaux.

Le SDK actuel ne transmet que les pages vues, sans critères du moteur, événements de clic ou identifiants personnels. Il permet de compter les destinations et le guide séparément, **pas de démontrer un parcours individuel guide → destination ni un taux de conversion de ce CTA**. Ne pas déduire ce tunnel de deux totaux agrégés. Si une analyse de parcours devient nécessaire, examiner d’abord les capacités et données déjà accessibles dans le compte, puis décider séparément d’un besoin de mesure supplémentaire. Aucun événement ajouté dans cette mission.

### Quand enrichir le guide ?

- URL non indexée : diagnostiquer exploration/canonical/qualité avant d’ajouter du contenu ou d’autres pages.
- Impressions sur des questions précises : renforcer l’explication concernée avec une source et un exemple utiles, après revue des requêtes réelles.
- CTR faible sur les requêtes informationnelles, avec suffisamment d’impressions comparables : revoir title/description et adéquation à la question. Aucun seuil universel ou objectif chiffré arbitraire.
- Impressions surtout orientées conditions du jour : conserver une promesse de guide explicite ; une API demanderait le chantier autorisé décrit en B.
- Signal de trafic anglophone : évaluer un véritable parcours anglais cohérent avant toute traduction/hreflang.
- Sur plusieurs périodes, peu d’impressions pertinentes : réexaminer demande, concurrence, liens et utilité avec l’export Ahrefs ; aucune génération automatique de variantes.

## G. Actions manuelles

1. Examiner le guide local et ses captures, en particulier la distinction houle/vague, le schéma temporel et l’exemple fictif. Une relecture métier peut préciser le vocabulaire ; aucune expertise humaine ou mesure de terrain n’est revendiquée dans le contenu.
2. Fournir si possible l’export Ahrefs daté, avec pays, nom de métrique, volume, KD, Traffic Potential et pages concurrentes ; les valeurs annoncées restent non vérifiées en son absence.
3. **Publication future uniquement sur décision séparée du propriétaire.** Cette mission n’a ni déployé ni modifié le projet Vercel. Après publication, refaire le contrôle HTTP/canonical/noindex, tester les liens et relancer `audit:seo` contre le domaine public avec la même source de données.
4. Dans la propriété Search Console existante, vérifier/soumettre le sitemap et inspecter `/surf-forecast`. Si aucun accès n’existe, le propriétaire doit organiser cet accès ; aucun token, DNS ou nouvelle propriété n’a été configuré ici. Une demande d’indexation ne garantit pas l’indexation.
5. Vérifier que Web Analytics est déjà activé et reçoit les pages vues en production ; utiliser la procédure existante, sans seconde installation ni activation d’option payante.
6. Si des prévisions réelles sont envisagées, valider explicitement licence, coût, attribution et pilote technique. Aucun abonnement n’est nécessaire pour publier le guide livré.

Les 41 niveaux historiques et autres points éditoriaux des rapports précédents restent hors périmètre. Aucun classement Google, volume de visiteurs ou citation par une IA n’est garanti.
