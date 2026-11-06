# Vercel Web Analytics — intégration du 6 novembre 2026

## État et audit initial

Intégration locale terminée. **Aucun déploiement ni activation dans Vercel effectué ; aucune statistique réelle reçue ou vérifiée.**

Le dépôt était propre. Next.js installé : **16.3.4**, App Router, layout racine `app/layout.tsx`. Gestionnaire : npm, `package-lock.json`. Aucun package `@vercel/analytics`, composant Analytics, Google Analytics, GTM ou autre outil de statistiques présent avant intervention. Les scripts Travelpayouts et les données structurées sont distincts de la mesure d’audience et restent inchangés.

Aucun gestionnaire de consentement, cookie applicatif ou stockage local des critères n’a été trouvé. La page `/confidentialite` décrit déjà les critères de recherche et les partenaires commerciaux. Les paramètres fonctionnels sont `niveau`, `origine`, `dateDepart`, `dateRetour`, `region`. Ils sont utiles au produit, mais pas à la mesure de fréquentation demandée. Les chemins des destinations contiennent des identifiants publics de zones ; il n’existe pas de route de compte personnel.

Les guides embarqués de Next.js sur la séparation serveur/client ont été consultés, ainsi que les documentations officielles Vercel référencées ci-dessous.

## Implémentation

- Installation par `npm i @vercel/analytics` : **version 2.0.1**, dépendance `^2.0.1`, version résolue verrouillée dans le lockfile. Un seul package ajouté ; aucune autre version de dépendance changée.
- `app/layout.tsx` monte **une seule instance de `WebAnalytics` après `Footer`**, dans `body`. Le layout reste un Server Component ; polices, navigation, footer, métadonnées et enfants sont conservés.
- `components/analytics/WebAnalytics.tsx` est la petite frontière client nécessaire pour transmettre une fonction `beforeSend`. Elle importe exactement `Analytics` depuis **`@vercel/analytics/next`**, sans injecter de script à la main.
- Le SDK Next.js suit automatiquement les chargements et les changements de route. Aucun appel applicatif à `pageview`, `track`, `identify` ni événement sur les clics affiliés.
- Le composant officiel retourne `null`, utilise sa propre frontière Suspense et insère le script avec `defer` après montage. Le contenu serveur ne l’attend pas. Aucun élément visuel ajouté.

## Confidentialité et environnements

`lib/analytics.ts` fournit `sanitizeAnalyticsEvent`, utilisé par le mécanisme officiel `beforeSend` :

1. Seuls les événements `pageview` sont acceptés ; les événements personnalisés sont refusés.
2. L’URL de l’événement conserve son origine réelle et son chemin. **Toute query string et tout fragment sont retirés**, sans modifier l’adresse dans le navigateur ni les paramètres métier.
3. Les URL invalides, les protocoles autres que HTTP/HTTPS et les URL contenant des identifiants dans leur autorité sont refusés.

Exemple : `/destination/ericeira?niveau=expert&origine=PAR&dateDepart=…#vol` est mesuré comme `/destination/ericeira`. La règle retire aussi les paramètres inconnus, emails, tokens et UTM éventuels. Les referrers natifs restent disponibles ; **l’attribution UTM est volontairement abandonnée**. Les sources de trafic ne sont pas des identifiants ajoutés par Surftrips : elles dépendent du referrer autorisé par le navigateur et le site d’origine. Le SDK ne fournit pas de champ referrer modifiable dans son type `BeforeSendEvent` ; nous n’inventons pas de propriété pour le faire.

Le code n’envoie aucun identifiant utilisateur, secret d’environnement, critère de voyage ou donnée Supabase à Analytics. Il ne crée pas de cookie, stockage ou identifiant personnalisé. Le script officiel de debug a été inspecté : il ne collecte pas de visites et omet les referrers internes dans ses événements de page ; le traitement du collecteur effectivement servi par Vercel restera à vérifier après déploiement.

**Aucun `mode` forcé, aucune URL de collecte ou DSN configurée.** En `next dev`, le SDK choisit `development`. `debug={false}` évite de journaliser les URL brutes dans les messages avant/après nettoyage. React Strict Mode peut rejouer les effets de montage en développement : les deux entrées observées dans la file du SDK n’envoient pas deux visites en production. Le build local utilise le comportement natif de production, avec des endpoints relatifs au serveur local, sans redirection vers le domaine de production. Le script de collecte Vercel n’est pas fourni par `next start` seul : une 404 locale sur cet endpoint est attendue sans l’infrastructure Vercel.

Sur Vercel, les déploiements preview restent identifiables comme tels par la plateforme. Le tableau de bord distingue **Production / Preview / All Environments**. Sélectionner Production pour analyser le site public ; aucun remplacement de hostname par `www.surftrips.fr` n’est effectué dans les événements de preview.

La documentation Vercel décrit une mesure agrégée sans cookies tiers, avec un identifiant calculé à partir de la requête et renouvelé après 24 heures. Cela ne constitue pas une déclaration générale d’exemption de consentement pour tous les usages. Aucune bannière n’a été ajoutée. Pour la qualification juridique de la configuration retenue, la CNIL demande d’examiner les conditions et justificatifs du prestataire. Les traitements des partenaires affiliés restent séparés et inchangés.

### Information à ajouter à la politique de confidentialité lors de l’activation

La page publique n’a pas été modifiée pour ne pas annoncer une collecte déjà active. Proposition de paragraphe à intégrer lorsque le service est effectivement activé et déployé :

> Surftrips utilise Vercel Web Analytics pour mesurer la fréquentation du site : pages consultées, nombre de visites et de visiteurs, sources de trafic, pays et caractéristiques générales des appareils. Les statistiques sont agrégées et le service n’utilise pas de cookies de suivi tiers. Surftrips retire les paramètres de recherche et les fragments des URL de pages transmis à cet outil ; les dates, l’aéroport et le niveau saisis ne sont pas ajoutés aux statistiques. Aucun compte personnel ni événement de clic affilié n’est envoyé à cet outil.

Compléter avec l’identité et le contact du responsable, la base juridique retenue, les modalités d’exercice des droits, les durées de conservation et les conditions de sous-traitance/transferts correspondant au contrat Vercel réel. Ne pas confondre le renouvellement d’un identifiant de visite avec la durée de conservation des statistiques. Les détails contractuels et le plan Vercel ne sont pas accessibles dans cette mission.

## Réseau, performances et SEO

Aucune CSP dans `next.config.ts` ni dans le proxy. Une requête publique du 6 novembre à `https://www.surftrips.fr` répond **HTTP 200, serveur Vercel**, sans header `Content-Security-Policy` ni `Content-Security-Policy-Report-Only`. Le proxy ne concerne que `/recherche` et `/search` : il n’intercepte pas les endpoints Analytics. Aucun header ou contrôle de sécurité n’a été relâché.

Le SDK conserve les endpoints et la configuration dynamique fournis par Vercel 2.x. Le chemin de repli est `/_vercel/insights/script.js` ; la plateforme peut fournir des chemins de collecte variables. Si une CSP est ajoutée ultérieurement, vérifier les requêtes réellement émises et leurs origines plutôt que d’autoriser globalement tous les scripts. En développement, le script de debug utilise `https://va.vercel-scripts.com`.

L’HTML essentiel est toujours rendu côté serveur. Les 77 fiches, les quatre articles, les métadonnées, canonical, JSON-LD, robots et sitemap sont inchangés. Les tests vérifient le chargement différé du script et l’absence d’erreurs React/Next.js sur les navigations. **L’impact du collecteur réel sur LCP/INP/CLS en production n’est pas mesuré** : il nécessite le futur déploiement. Aucune requête Supabase supplémentaire ni bibliothèque de tracking complémentaire n’a été ajoutée.

## Validations exécutées

| Contrôle | Résultat |
|---|---|
| `npm ls @vercel/analytics --depth=0` | `@vercel/analytics@2.0.1`, installation valide |
| Recherche d’instances | Un `<Analytics />`, un `<WebAnalytics />` dans le layout |
| `npm run typecheck` | Réussi |
| `npm run lint` | Réussi |
| `npm test` | **75 tests réussis**, dont 3 nouveaux tests de minimisation |
| `npm run build` | Réussi, Next.js 16.3.4 ; aucune route ajoutée |
| `npm run audit:seo` | **77/77 destinations indexables, 83 URL sitemap, zéro anomalie** |
| Tests navigateur sur build local | **70 cas distincts validés après correction du test**, 4 doublons responsive ignorés |
| Tests Analytics en développement | **4 réussis**, ordinateur et mobile |

Six fichiers navigateur ont été exécutés sur le build local : `analytics.spec.ts`, `seo.spec.ts`, `themes.spec.ts`, `landing.spec.ts`, `travel.spec.ts`, `accommodation.spec.ts`. Le premier passage a donné 68 réussites, 2 échecs dans le nouveau test Analytics et 4 ignorés. Le test supposait à tort que le lien du catalogue vers un guide était un `Link` Next.js : c’est une ancre HTML qui recharge le document. Après prise en compte de cette navigation réelle, les **4 cas Analytics ont repassé**, sans changement du produit. Les 70 cas distincts actifs ont donc tous été validés ; la suite complète n’a pas été relancée inutilement.

En développement, les assertions ont également été adaptées au rejeu des effets de React Strict Mode, en conservant strictement un événement par visite sur le build de production. Les quatre tests passent dans les deux environnements. La version finale des tests a été recontrôlée par TypeScript et lint.

Les tests Analytics observent **la file du véritable SDK officiel**, son hook de nettoyage et son script unique. Le collecteur distant est remplacé par une réponse vide uniquement dans Playwright : **aucune statistique de test n’est envoyée à Vercel**. Cela prouve le fonctionnement de l’intégration dans l’application, pas l’activation du compte ou la réception par Vercel.

Parcours vérifié : accueil → catalogue → article novembre → Ericeira → retour arrière. Chargements directs vérifiés aussi pour les résultats, Imsouane, décembre, Portugal, comparatif et confidentialité. Les URL synthétiques contenant email/token sont nettoyées pour Analytics mais restent inchangées dans le navigateur. Les tests existants contrôlent les cinq destinations SEO de référence, les quatre guides, les paramètres de recherche, les 404, l’accessibilité, le responsive et le parcours Surf → Vol → Logement. Les liens Booking/CJ et la gestion du widget/du lien Kiwi sont testés ; aucune réservation ni nouvelle mesure de clic affilié.

Les rapports et traces locaux sont dans `.local/vercel-analytics/`, notamment `seo-audit.json`, `npm-audit.json`, `analytics-production-final/` et `analytics-development-final/`. Les premières tentatives bloquées par les permissions réseau du sandbox ne sont pas comptées comme des validations.

### Alertes npm constatées

`npm audit` signale **13 paquets avec alertes : 8 modérées, 4 élevées, 1 critique**. `next` porte l’alerte critique ; les autres concernent l’outillage ESLint/TypeScript et notamment `sharp`, `source-map-js`, `zod`, `brace-expansion`. **`@vercel/analytics` n’est pas signalé.** La comparaison des lockfiles confirme qu’aucune version préexistante n’a changé et que le seul paquet ajouté est Analytics.

Ces alertes ne sont pas corrigées par cette intégration. Leur analyse d’applicabilité et la mise à jour des dépendances concernées constituent un travail séparé à traiter avant le prochain déploiement. Aucun `npm audit fix`, downgrade ou changement Next.js n’a été appliqué automatiquement.

## Activation manuelle dans Vercel

1. Ouvrir le dashboard Vercel, sélectionner **le projet Surftrips**, puis **Analytics / Web Analytics**. Cliquer sur **Enable** si le service n’est pas encore activé. Vérifier le plan et les limites affichés, sans activer d’option payante inutile.
2. Déployer personnellement la version contenant cette intégration, **après l’activation**. Aucun token ni variable Analytics personnalisée n’est nécessaire dans l’application. Ne pas copier de secrets serveur dans une variable `NEXT_PUBLIC_*`.
3. Sur le domaine public, ouvrir quelques pages puis suivre des liens internes. Dans les outils réseau du navigateur, vérifier le chargement du script et les requêtes de collecte Vercel. Contrôler que l’URL de page envoyée ne contient ni paramètres ni fragment. Les chemins de collecte peuvent être fournis dynamiquement par Vercel.
4. Revenir dans Web Analytics, choisir **Production** et la période appropriée. Consulter visiteurs, pages vues, Pages, Referrers et Countries. Utiliser **Pages** pour distinguer `/destination/ericeira` et les autres fiches ; **Route** peut les regrouper sous `/destination/[slug]`.
5. Pour les articles, filtrer leurs quatre chemins existants. Faire varier la période pour suivre l’évolution du trafic. Les premières données ne seront disponibles qu’après de vraies visites, sans garantie de délai instantané.
6. Si rien n’apparaît : vérifier le bon projet, l’environnement et la période, l’activation **avant** le déploiement et l’absence de blocage réseau/CSP. Une 404 du script en production après activation nécessite de redéployer. Les visites bloquées par les protections du navigateur ne doivent pas être interprétées comme un comptage exhaustif.

Mettre également à jour l’information de confidentialité ci-dessus et examiner les alertes npm. Aucune action Google Search Console/Bing n’est nécessaire pour cette seule intégration ; le sitemap n’a pas changé.

## Fichiers

| Statut | Fichier | Objet |
|---|---|---|
| Modifié | `package.json` | Seule dépendance officielle Analytics ajoutée |
| Modifié | `package-lock.json` | Version 2.0.1 résolue, aucune autre dépendance modifiée |
| Modifié | `app/layout.tsx` | Import et montage unique après le footer |
| Créé | `components/analytics/WebAnalytics.tsx` | Frontière client minimale, SDK Next.js officiel |
| Créé | `lib/analytics.ts` | Nettoyage des URL avec `beforeSend` |
| Créé | `tests/analytics.test.ts` | Confidentialité et absence de mutation des données |
| Créé | `tests/e2e/analytics.spec.ts` | Navigation, instance unique, hooks et environnements |
| Créé | `docs/vercel-web-analytics.md` | Présent audit, validations et activation manuelle |

Aucun fichier supprimé, aucun changement visuel, aucune migration, aucune modification des affiliations, données métier ou pages SEO.

## Références consultées

- [Vercel — Installation et activation](https://vercel.com/docs/analytics/quickstart)
- [Vercel — Configuration du package et mode automatique](https://vercel.com/docs/analytics/package)
- [Vercel — Nettoyage des données avec beforeSend](https://vercel.com/docs/analytics/redacting-sensitive-data)
- [Vercel — Données collectées et confidentialité](https://vercel.com/docs/analytics/privacy-policy)
- [Vercel — Dimensions, referrers et environnements du dashboard](https://vercel.com/docs/analytics/using-web-analytics)
- [Vercel — Diagnostic des scripts absents](https://vercel.com/docs/analytics/troubleshooting)
- [CNIL — Conditions et justificatifs des solutions de mesure d’audience](https://www.cnil.fr/fr/cookies-solutions-pour-les-outils-de-mesure-daudience)
