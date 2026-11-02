# Application Booking.com / CJ — 23 septembre 2026

L’administrateur a fourni une recherche Booking.com Ericeira et autorisé explicitement l’application des migrations. Elles ont été appliquées à la base Supabase connectée le **2026-09-23T09:05:54.877Z**, dans une transaction atomique.

## Schéma appliqué

1. `migrations/20260912_accommodations.sql` : table éditoriale, relation vers les zones, index, horodatage et RLS.
2. `migrations/20260923_booking_cj.sql` : `accommodations.booking_url`, `zones.booking_destination_url`, ancien `affiliate_url` conservé et devenu facultatif.

**Ne pas rejouer ces migrations sur cette base.** Aucun changement des fichiers SQL n’a été nécessaire. Empreintes SHA-256 des fichiers exécutés :

- `migrations/20260912_accommodations.sql` : `3e8c65be5f1dd09b40fe2bf4e05eccdb4032e826a3d1fb0fb7004bdc0432894e`.
- `migrations/20260923_booking_cj.sql` : `84c0714d250c747101619e2628e84da5449b3b556fd0d03ff5c8c273354125c8`.

Les vérifications de sécurité ont été corrigées pour lire les rôles PostgreSQL comme un tableau de texte. Les tentatives précédant la validation finale ont été entièrement annulées, sans état partiellement migré.

## Donnée éditoriale publiée

Seule `zones.booking_destination_url` de **`ericeira`** a été renseignée avec [la recherche Booking.com fournie, nettoyée](https://www.booking.com/searchresults.fr.html?ss=Ericeira%2C+Portugal&efdco=1&lang=fr&sb=1&dest_id=-2164547&dest_type=city&search_selected=true&group_adults=2&no_rooms=1&group_children=0).

- Destination conservée : `Ericeira, Portugal`, `dest_id=-2164547`, `dest_type=city`.
- Critères conservés : deux adultes, une chambre, aucun enfant, langue française.
- Retirés avant stockage : ancien `aid`, `label`, paramètres de provenance `src`/`src_elem`, métadonnées d’autocomplétion `ac_*` et identifiant de navigation `search_pageview_id`.
- Aucune date inventée ou ajoutée. Booking.com redirige cette recherche sans dates vers sa page Ericeira.
- Le constructeur de liens de l’application n’a pas été modifié : cette préparation est une validation ponctuelle du lien éditorial fourni, pas un générateur de Search URLs.

## Contrôles PostgreSQL

- **77 zones**, **94 spots** conservés.
- Comparaison de toutes les données avant/après : aucune modification hors la nouvelle URL Ericeira et les colonnes autorisées.
- **0 hébergement individuel** : aucune propriété fictive, aucune recommandation non validée ajoutée.
- RLS activée sur `accommodations` ; seule politique de lecture `accommodations_server_read`, rôle `service_role`, condition `active=true`.
- Aucun privilège sur cette table pour `PUBLIC`, `anon` ou `authenticated`. `service_role` dispose uniquement de SELECT.

## Test réel depuis Surftrips

Test effectué sur le build local avec la vraie base Supabase le **2026-09-23T09:08:49.100Z** :

1. Ouverture de `/destination/ericeira` et affichage du bouton « Voir tous les logements à Ericeira ».
2. Clic vers `/go/booking/destination/ericeira` : **302**, URL lue en base, `sid=surftrips-ericeira-all`.
3. Passage par le véritable Evergreen CJ configuré : **302**.
4. Arrivée chez Booking.com avec un seul `aid`, le `label` de tracking et le SID Surftrips ; ancien `aid=304142` absent.
5. Page finale : [Ericeira sur Booking.com](https://www.booking.com/city/pt/ericeira.fr.html), **HTTP 200**, titre Ericeira confirmé, aucune boucle.

Booking.com normalise ensuite les paramètres de tracking visibles. Leur transport jusqu’au partenaire est vérifié ; l’enregistrement d’une commission demeure contrôlable uniquement dans le compte CJ.

Le lien comporte `target="_blank"` et `rel="sponsored noopener noreferrer"`. Les paramètres utilisateur `url` et `sid` ajoutés à la route sont ignorés. Un hébergement inexistant et une destination sans URL renvoient 404, sans redirection arbitraire. Aucun chargement Expedia détecté.

## Validation locale

- TypeScript : réussi.
- Lint : réussi, sans warning ESLint.
- Tests unitaires : **47 réussis**.
- Tests navigateur : **12 réussis**, avec le schéma et le lien réels maintenant actifs.
- Build Next.js : réussi.
- CTA et section contrôlés à **1440, 1280, 768 et 390 px**, sans débordement horizontal.
- Ordre Surf → Vol → Logement conservé. Aucun code Travelpayouts, image, bannière, scoring ou règle métier modifié.
- Aucun secret affiché ou ajouté au code. Captures et rapports détaillés locaux : `.local/booking-cj/` (ignoré par Git).

## À compléter

- Les `booking_destination_url` des autres zones, avec des pages vérifiées.
- Les hébergements éditoriaux réels et leur fiche `booking_url` exacte. Le lien fourni est une recherche de destination, pas une fiche d’hôtel.
- Vérification d’un clic sur une véritable card après cette saisie.

**Aucun déploiement Vercel effectué.** La validation concerne le build local relié à Supabase ; la version de code Booking.com devra être déployée séparément pour apparaître sur le site public.
