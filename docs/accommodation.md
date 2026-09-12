# Hébergements éditoriaux et Hotels.com

La section `/destination/[zoneId]#hebergement` se situe après les spots et le vol. Son contenu et les cartes sont rendus côté serveur. Expedia ne fournit aucune donnée aux recommandations Surftrips : aucun prix, disponibilité, note, chambre ou photo n’est extrait du widget ou d’Hotels.com.

## Schéma et migration

Inspection en lecture seule le **12 septembre 2026** : `public.zones` et `public.spots` sont les seules tables métier. Aucune table de logements équivalente n’existe ; `zones.zone_id` est une clé de type `text`.

La migration [20260912_accommodations.sql](../migrations/20260912_accommodations.sql) est préparée, **non appliquée automatiquement**. Elle crée uniquement `public.accommodations`, son index et son déclencheur de mise à jour de `updated_at`. Elle ne modifie pas `zones`, `spots` ni leurs politiques. Elle n’insère aucune donnée et échoue si la table existe déjà, afin d’éviter toute adaptation silencieuse d’un schéma différent.

Après revue, l’administrateur peut exécuter le fichier dans le SQL Editor Supabase. Aucun script de démarrage, build ou déploiement ne l’exécute. L’application continue à fonctionner avant son application : seul le moteur Hotels.com s’affiche, sans message « aucun hôtel disponible ».

RLS est activée. Aucun droit n’est accordé à `anon` ou `authenticated`. `service_role` reçoit uniquement SELECT ; l’administrateur propriétaire maintient les recommandations. Si `DATABASE_URL` utilise un autre rôle dédié, l’administrateur doit lui donner SELECT et une politique de lecture adaptée. Aucune politique d’écriture publique. Les accès Next.js réutilisent le pool PostgreSQL TLS et les transactions READ ONLY existants.

Lecture des recommandations : `zone_id=$1 AND active=true`, puis `featured DESC, display_order ASC, id ASC`, limite paramétrée de 1 à 3, trois par défaut. Cache de 60 secondes, également pour la détection du schéma. Attendre jusqu’à une minute après une modification éditoriale. Les erreurs de connexion ou de schéma restent côté serveur ; la fiche et le widget restent utilisables.

## Données à saisir manuellement

Pour chaque recommandation validée :

- `zone_id` : identifiant d’une zone existante.
- `name`, `slug`, `type` : nom réel, slug unique pour cette zone et l’un de `hotel`, `hostel`, `surf_house`, `apartment`, `guesthouse`, `surf_camp`.
- `affiliate_url` : **URL HTTPS complète fournie par Expedia Creator Toolbox**, collée telle quelle. Le code n’ajoute ni Pubref ni paramètre aux liens des établissements.
- `location_label`, `description` (150 caractères maximum), `distance_label` : uniquement des informations vérifiées par Surftrips.
- `image_url` : URL HTTPS d’une photo dont Surftrips a les droits. Facultative ; sans photo, la carte reste éditoriale. Aucune image ne sera récupérée depuis Hotels.com. Les photos fournies sont chargées directement par le navigateur, sans ouvrir un proxy Next Image à des hôtes arbitraires.
- `price_category` : éventuellement `budget`, `mid`, `premium`. Affichage € / €€ / €€€, explicitement présenté comme une gamme indicative, jamais comme un tarif actuel.
- `featured`, `display_order` : priorité éditoriale. `active` vaut **false** par défaut ; l’activer seulement après vérification de la propriété, des liens, des droits photo et de la pertinence surf.

Les URLs invalides ou à credentials intégrés ne sont pas rendues. Un type inconnu ou un lien principal invalide isole la recommandation, avec son identifiant dans le diagnostic serveur. Les champs facultatifs absents ne sont pas inventés.

## Widget officiel et navigation Next.js

Attributs inchangés : `data-widget="search"`, `data-program="fr-hcom"`, `data-lobs="stays"`, `data-network="pz"`, `data-camref="1011l5QTXG"`. Seul `data-pubref="surftrips-[zoneId]"` varie. Aucune date, adresse IP, identité ou autre donnée sensible n’y est incluse.

Le script officiel public [eg-widgets.js](https://creator.expediagroup.com/products/widgets/assets/eg-widgets.js), inspecté uniquement pour son intégration, attend `DOMContentLoaded` et conserve un état global d’initialisation. `next/script` avec `afterInteractive` / `lazyOnload` s’exécuterait après cet événement et ne réinitialiserait pas les nouvelles destinations.

Pour conserver le cycle de chargement officiel, `HotelsSearchWidget` monte **une iframe vers `/widgets/hotels?pubref=…`** à l’approche du viewport. Ce Route Handler produit un document JSX avec le rendu en flux React compatible Next.js ; ses scripts natifs `defer` s’exécutent avant `DOMContentLoaded`. Chaque nouvelle zone reçoit un document neuf. Le script n’est présent qu’une fois dans ce document et bénéficie du cache navigateur. Aucun chargement global, aucune remise à zéro des variables Expedia, aucun appel à une API privée et aucun événement artificiel sur la page Surftrips.

Le document d’intégration est `noindex, nofollow` et ne peut être intégré que par le même site. La passerelle observe **uniquement la taille de notre conteneur extérieur** et transmet la hauteur au parent, qui vérifie origine, fenêtre source et canal. Elle ne lit ni ne modifie le contenu produit par Expedia. Ce contrôle confirme l’affichage du module, pas une disponibilité hôtelière. React ne gère pas les enfants injectés par Expedia.

La largeur reste limitée à 575 px. Les noms de zone et pays, ainsi que les dates validées du voyage, sont rappelés au-dessus. L’utilisateur renseigne lui-même ces informations dans Hotels.com : aucun attribut de préremplissage non documenté.

## Échec et lien de secours

Un chargement échoué ou silencieux pendant huit secondes affiche un message lisible et permet de réessayer. Les cartes, les spots et le vol continuent à fonctionner.

Configuration optionnelle, exclusivement lue côté serveur :

```env
HOTELS_COM_FALLBACK_URL=
```

Y coller un **lien affilié général Hotels.com fourni par Creator Toolbox**. Tant qu’il est absent ou invalide, aucun lien de secours n’est inventé. La nouvelle tentative reste proposée. Tous les liens de réservation utilisent `target="_blank"` et `rel="sponsored noopener noreferrer"`. La mention de commission est affichée dans la section.

## Validation

Validation du 12 septembre 2026 : TypeScript, lint et build Next.js réussis ; 27 tests unitaires et 32 tests navigateur validés. Les contrôles d’accessibilité et de largeur ont été relancés après correction du contraste, avec succès. Widget réel testé sur ordinateur et aux largeurs 575, 375 et 320 px. Aucun secret trouvé dans les sources versionnables ou les bundles client, aucun driver PostgreSQL dans ces bundles. Aucun changement appliqué au schéma ni aux données Supabase.

- Tests unitaires : adaptation sans invention, URLs, champs absents, types, gammes et attributs d’affiliation/Pubref.
- Navigateur avec Supabase réelle : fiche sans recommandations, navigation depuis `/search` et entre destinations, ordre surf → vol → logement, exclusion SEO du document d’intégration, blocage et nouvelle tentative.
- Rendu des cartes avec trois fixtures techniques **isolées dans les tests**, sans hôtel réel ou fictif inséré en base ; URLs example.com, aucun prix, photo ou tracking Expedia inventé. Vérification des liens et des dispositions 3 / 2 / 1 colonnes.
- Widget Expedia réel : contrôle de chargement et de géométrie sur ordinateur et mobile, sans extraction des données du widget.

La vérification de recommandations réelles de bout en bout dans Supabase attend l’application de la migration et les premières données éditoriales validées. Les liens individuels et le lien général ne peuvent être vérifiés auprès d’Hotels.com avant leur fourniture.

## Fichiers de cette évolution

Créés :

- `components/accommodation/AccommodationSection.tsx`, `AccommodationCard.tsx`, `HotelsSearchWidget.tsx` : section serveur, cartes éditoriales et cycle de vie du widget.
- `lib/accommodation/types.ts`, `validation.ts`, `widget.ts`, `config.ts` : types, validation des liens, contrat public Expedia, lien de secours facultatif.
- `lib/db/accommodations.ts` : lecture PostgreSQL, cache et détection d’un schéma absent ou incomplet.
- `app/widgets/hotels/route.tsx`, `public/hotels-widget-bridge.js` : document JSX isolé et synchronisation de sa hauteur.
- `migrations/20260912_accommodations.sql` : migration manuelle, sans données initiales.
- `tests/accommodation.test.ts`, `tests/e2e/accommodation.spec.ts`, `accommodation-render.spec.ts`, `accommodation-live.spec.ts` : contrôles unitaires, serveur, navigation et widget réel.
- `docs/accommodation.md` : guide de configuration et de saisie.

Modifiés :

- `app/destination/[slug]/page.tsx`, `app/globals.css` : placement logement après vol, lien d’accès et styles du design existant.
- `.env.example`, `README.md` : configuration facultative et instructions.
- `scripts/inspect-database.ts` : inspection des tables et colonnes existantes.
- `components/ui/Icon.tsx` : source JSX React explicite, pour tester le rendu serveur sans le transformateur de composants Playwright ; aucun changement visuel.
- `tests/e2e/landing.spec.ts` : isolation du script Expedia, testé dans sa propre suite.
