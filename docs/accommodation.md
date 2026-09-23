# Hébergements éditoriaux et Booking.com / CJ

La section `/destination/[zoneId]#hebergement` conserve l’ordre **surf → vol → logement** et les cartes Surftrips. Les recommandations sont rendues côté serveur. Booking.com gère la disponibilité, les chambres et la réservation : aucune API de prix, extraction de photos/notes, récupération de données depuis un widget ou conversion automatique d’un lien Hotels.com.

## État du schéma et migrations manuelles

Inspection PostgreSQL en lecture seule le **23 septembre 2026** : aucune table `public.accommodations` ni table de logements équivalente ; `zones.booking_destination_url` est absent. Le code s’adapte à cet état sans casser les destinations et sans afficher de bouton fictif.

À appliquer dans cet ordre, après revue par l’administrateur :

1. [20260912_accommodations.sql](../migrations/20260912_accommodations.sql), déjà présente : crée la table éditoriale si elle est absente. Ne pas rejouer si elle existe.
2. [20260923_booking_cj.sql](../migrations/20260923_booking_cj.sql) : ajoute `accommodations.booking_url` et `zones.booking_destination_url`, rend l’ancien `affiliate_url` facultatif et le marque déprécié. Aucune suppression de données, conversion d’URL ou modification de RLS/politiques.

Ces migrations ne sont exécutées ni au démarrage, ni au build, ni automatiquement par la tâche. La seconde dépend de la première. Aucune donnée initiale n’est insérée. `affiliate_url` est conservé pour compatibilité mais n’est plus lu ni affiché.

RLS reste activée sur les hébergements, sans accès public en écriture. Les requêtes réutilisent le pool PostgreSQL serveur avec TLS vérifié et les transactions READ ONLY existantes. Un rôle serveur dédié doit disposer du droit SELECT approprié.

## Configuration serveur

```env
BOOKING_CJ_EVERGREEN_URL=
```

Renseigner le **Click URL Evergreen Booking.com** du compte CJ et du PID Surftrips. Aucun domaine CJ d’exemple n’est utilisé par l’application. Ne pas utiliser le générateur de deeplinks CJ générique pour ce programme. La variable est déjà présente localement et n’est jamais exposée dans le HTML de la destination ou dans un bundle client. Le lien de tracking résultant est nécessairement visible lors de la redirection HTTP du clic.

Le helper `lib/booking/buildBookingAffiliateUrl.ts` porte `server-only`. Il ajoute `url` et `sid` via `URLSearchParams`, conserve les paramètres existants de l’Evergreen et remplace un ancien `url`/`sid` sans doublons. La destination est encodée une seule fois. Aucune URL fournie par un visiteur n’est utilisée.

L’ancienne variable `HOTELS_COM_FALLBACK_URL` peut être retirée de l’environnement : le code ne la lit plus. Aucun widget Booking n’est inventé. Si un widget est souhaité plus tard, fournir d’abord le code officiel CJ.

## Données éditoriales à renseigner

Pour chaque hébergement réel sélectionné :

- `zone_id` : identifiant existant ; `name`, `slug`, `type` : identité vérifiée et catégorie éditoriale.
- `booking_url` : URL Booking.com **normale, non affiliée**, vérifiée sur la fiche exacte. HTTPS, hostname exactement `booking.com` ou `www.booking.com`, sans credentials ni port inhabituel. Les variantes non vérifiées restent refusées.
- `location_label`, `description` (150 caractères maximum), `distance_label` : uniquement des informations connues de Surftrips.
- `image_url` : photo facultative avec droits d’utilisation ; jamais récupérée automatiquement sur Booking.com.
- `price_category` : éventuellement `budget`, `mid`, `premium` ; € / €€ / €€€ signifie une gamme générale Surftrips, explicitement distincte d’un tarif actuel.
- `featured`, `display_order`, `active` : tri manuel et activation après vérification.

Pour chaque zone, `booking_destination_url` reçoit une page destination Booking.com ou une Search URL réellement vérifiée. Aucune URL n’est déduite du nom de zone. Les paramètres déjà présents sont conservés ; Surftrips n’ajoute aucun paramètre de dates non documenté. Le voyage est rappelé dans l’interface, et l’utilisateur vérifie dates et occupation sur Booking.com.

La lecture des recommandations utilise `active=true`, puis `featured DESC, display_order ASC, id ASC`, avec trois cartes maximum (cache 60 s). Une adresse éditoriale sans URL Booking valide reste visible **sans CTA** ; aucun ancien lien Expedia n’est réutilisé. Le CTA général est masqué si la zone n’a pas de lien valide. Sans recommandations et sans URL de destination, une courte présentation indique que les adresses sont en préparation. Sans Evergreen valide, tous les CTA affiliés sont masqués.

## Parcours de clic et sécurité

- Carte : `/go/booking/accommodation/[UUID]` → lecture fraîche de l’hébergement actif → URL Booking validée → CJ, avec `sid=surftrips-[zoneId]-hotel-card`.
- Destination : `/go/booking/destination/[zoneId]` → lecture fraîche de la zone → URL Booking validée → CJ, avec `sid=surftrips-[zoneId]-all`.

Les routes ne lisent **aucun** `url`, `sid`, date ou autre paramètre de query du visiteur. Elles valident les identifiants avant la base, paramètrent les requêtes et refusent les domaines trompeurs (`booking.com.example.org`, etc.). Le SID ne contient que la zone interne et la source fixe.

Réponses 302 temporaires avec `Cache-Control: private, no-store` et `X-Robots-Tag: noindex, nofollow`. La désactivation d’un hébergement prend effet dès le clic suivant, indépendamment du cache des cartes. Identifiant mal formé : 400 ; lien/hébergement absent ou inactif : 404 ; configuration ou base indisponible : 503. Les erreurs sont génériques et ne révèlent ni SQL, ni stack, ni configuration. `/go/` est exclu dans robots.txt.

Les CTA restent de simples ancres, sans préchargement Next, avec `target="_blank"` et `rel="sponsored noopener noreferrer"`. La mention de commission est affichée à proximité lorsqu’un lien est disponible.

## Retrait Expedia

Supprimés après retrait des imports actifs : `HotelsSearchWidget.tsx`, `app/widgets/hotels/route.tsx`, `public/hotels-widget-bridge.js`, `lib/accommodation/widget.ts`, `lib/accommodation/config.ts` et l’ancien test du widget réel. Les styles du cadre sont conservés sous des noms `accommodation-*` ; les styles exclusivement liés à l’iframe sont retirés. Aucun script Expedia, Pubref ou iframe Hotels.com ne reste dans l’application. Travelpayouts, les bannières, images et règles de recherche restent inchangés.

## Vérification réelle CJ — 23 septembre 2026

Le vrai Evergreen configuré localement a été testé par navigation Chrome, avec un clic vers chaque URL produite par **le helper serveur de l’application** :

- [You and the sea, Ericeira](https://www.booking.com/hotel/pt/you-amp-the-sea.html) : fiche exacte atteinte, HTTP 200 final.
- [Ericeira — page destination](https://www.booking.com/city/pt/ericeira.fr.html) : page exacte atteinte, HTTP 200 final.

Pour les deux : passage CJ en HTTP 302, arrivée chez Booking.com avec `aid`, `label` et le SID Surftrips attendu dans le tracking ; aucune boucle. Booking.com normalise ensuite l’URL et retire ces paramètres visibles. Ce test vérifie le transport des marqueurs jusqu’au partenaire, pas l’enregistrement d’une commission dans le compte CJ.

Ces deux liens publics ont été retrouvés sur les pages officielles Booking.com. Ils **ne sont pas insérés en base** : l’administrateur doit valider la sélection éditoriale et renseigner les données après migration. Le clic complet depuis une recommandation Supabase réelle via `/go/booking/...` reste donc à revalider après cette saisie. Ne pas confondre cette limite avec les tests automatisés des redirections utilisant des fixtures isolées.

## Tests

- Unitaires : encodage, query existante, SID, HTTPS et hostnames exacts, UUID, hôtel inexistant/inactif/sans URL, destination sans URL, panne générique et lecture fraîche après désactivation.
- Navigateur : ordre du DOM, navigation depuis les résultats, dates conservées, absence d’Expedia, anciennes URLs 404, routes refusant une URL externe, états éditoriaux sans lien, cards 3/2/1 colonnes et largeurs 1440/1280/768/390 px.
- Les fixtures de recommandations sont rendues uniquement dans le navigateur de test ; aucune propriété fictive, URL ou tarif n’est ajouté à Supabase.

Commandes : `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`, puis les suites `tests/e2e/accommodation.spec.ts` et `tests/e2e/accommodation-render.spec.ts` sur le serveur local.

## Résultat technique de cette livraison

- `npm run typecheck` : réussi après régénération des types Next par le build (l’ancien type de route supprimée était encore présent dans `.next`).
- `npm run lint` : réussi, aucune erreur ni warning ESLint.
- `npm test` : **47 tests réussis**.
- `npm run build` : réussi ; les deux routes `/go/booking/...` sont dynamiques et `/widgets/hotels` n’existe plus.
- Playwright sur le build local : **12 tests réussis**, desktop et mobile ; contrôles aux largeurs 1440, 1280, 768 et 390 px. Cartes testées séparément en trois, deux et une colonne.
- Scan des 151 fichiers source et des 25 fichiers statiques client du build : aucun secret configuré, nom de variable privée, driver PostgreSQL ou script Expedia trouvé dans les bundles client ; aucune valeur secrète copiée dans le code source.
- Comparaison avec l’état initial : aucun changement aux composants de vol, helpers voyage, images, bannières, recherche, niveaux, scores ou saisons. Ordre du DOM confirmé par navigateur.
- Aucun déploiement Vercel et aucune écriture Supabase effectués.

Fichiers créés :

- `lib/booking/buildBookingAffiliateUrl.ts`, `urls.ts`, `redirect.ts`.
- `lib/db/booking.ts`.
- `app/go/booking/accommodation/[id]/route.ts`, `app/go/booking/destination/[zoneId]/route.ts`.
- `components/accommodation/AccommodationContent.tsx`.
- `migrations/20260923_booking_cj.sql`.
- `tests/booking.test.ts`.

Fichiers modifiés :

- `components/accommodation/AccommodationSection.tsx`, `AccommodationCard.tsx`.
- `lib/accommodation/types.ts`, `validation.ts`, `lib/db/accommodations.ts`.
- `app/globals.css` (cadre logement existant, styles du widget retirés), `app/robots.ts`.
- `.env.example`, `README.md`, `docs/accommodation.md`.
- `tests/accommodation.test.ts`, `tests/e2e/accommodation.spec.ts`, `accommodation-render.spec.ts`, `tests/production/playwright.config.ts`.
- Suppression des anciennes interceptions réseau Expedia dans les tests `landing`, `destination-banner`, `destination-images-live`, `destination-image-completion`, `destination-final-seven` et `destination-performance`. Aucun changement de leur logique produit.

Les six fichiers supprimés sont détaillés dans « Retrait Expedia ». Les captures et contrôles locaux sont dans `test-results/` et `.local/booking-cj/`, ignorés par Git.
