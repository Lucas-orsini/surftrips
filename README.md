# surftrips.fr

Landing éditoriale et parcours de recherche en français. Next.js 16, React 19, TypeScript, App Router, Tailwind CSS 4 et Framer Motion.

## Démarrage

Node.js 22.18 ou supérieur recommandé (Node.js 24 utilisé pour la validation).

```sh
npm ci
npm run dev
```

Ouvrir http://localhost:3000.

```sh
npm run build
npm run start
```

Le premier build nécessite un accès à Google Fonts. `next/font` télécharge Syne et DM Sans puis les sert localement : aucune requête du navigateur vers Google Fonts. Les photographies sont également locales et optimisées par `next/image`.

## Ce qui fonctionne

- Landing complète, navigation mobile, ancres et navbar sticky.
- Trois niveaux exclusifs : Débutant, Intermédiaire et Expert.
- Sélecteur d’aéroport filtrable par ville, nom ou IATA ; recherche insensible aux accents.
- Dates de départ/retour, validation, sélection de pays ou de région.
- Recherche serveur avec critères partageables dans l’URL, classement déterministe et explications.
- États d’erreur, attente, boutons désactivés, recherche sans résultat.
- Pages `/destinations`, `/destination/ericeira`, `/destination/taghazout`, `/destination/canggu`.
- Carte SVG avec itinéraire animé, survol, boutons tactiles et navigation clavier.
- Saisonnalité sur douze mois avec libellés accessibles et alternative aux couleurs.
- Métadonnées, canonicals, Open Graph, favicon, sitemap, robots et page 404.
- Prise en compte de `prefers-reduced-motion` et lien d’évitement.

## Architecture et connexion des données

```text
app/                         Pages, métadonnées et styles
components/landing/          Sections de la landing
components/search/           Formulaire et sélecteurs interactifs
components/destination/      Carte destination et calendrier de saison
components/ui/               Identité, icônes et animation partagée
lib/types.ts                 Contrats de données
lib/data.ts                  Collection illustrative et aéroports
lib/destinations.ts          Interface DestinationRepository
lib/search.ts                Calculs purs : dates, saisons, distance, classement
tests/                       Tests de logique et parcours navigateur
public/images/               Photographies et carte servies localement
```

Les pages et les sections éditoriales sont des Server Components. Les frontières client sont limitées au formulaire, à la navigation interactive, à la carte et à l’animation `Reveal`. `LazyMotion` limite les fonctionnalités d’animation chargées.

Pour connecter la base existante, remplacer les méthodes `list()` et `findBySlug()` de `destinationRepository` par l’adaptateur de la base/API, en conservant le contrat `Destination`. Les composants n’accèdent pas directement à la base. Conserver les clés et secrets dans cet adaptateur serveur, jamais dans les propriétés des composants client.

La collection contient **trois destinations de démonstration**. Les périodes, niveaux par spot, durées et nombres de spots sont illustratifs, pas des prévisions ni des données validées. Cette distinction apparaît sur la landing, les résultats et les fiches. Les valeurs 06 et 03 de la section de confiance désignent six critères et trois niveaux, sans prétendre à une taille de base fictive.

La recherche compare tous les mois traversés par le séjour. La saison détermine le classement ; la distance à vol d’oiseau depuis l’aéroport de départ départage les scores. Les pays et régions filtrent la collection, et le niveau détermine les exemples de spots adaptés. Aucun vol, prix ou horaire n’est simulé. Pour exploiter la vraie base, remplacer le classement illustratif par les règles métier de Surftrips et calculer les fenêtres saisonnières par spot et niveau.

Les badges de la landing illustrent explicitement **septembre** ; ceux des résultats se basent sur les dates choisies. Les fiches sont préconstruites avec `generateStaticParams` et `dynamicParams = false`. Lors de l’ajout de destinations, reconstruire le site ou adapter ce réglage et la politique de cache à la base de données.

## Vérification

```sh
npm run typecheck
npm run lint
npm run test
npm run test:e2e
```

Les tests navigateur utilisent Google Chrome installé localement, deux profils desktop/mobile et axe pour les règles WCAG A/AA. Pour un environnement CI sans Chrome, installer le navigateur avec `npx playwright install chrome` avant les tests. Les captures sont écrites dans `test-results/` (ignoré).

Validation locale : build de production, TypeScript, ESLint, six tests métier et huit parcours navigateur. Les contrôles de largeur couvrent 320, 390, 768, 1024 et 1440 pixels.

Audit Lighthouse mobile sur le serveur de production local : **92 performance, 100 accessibilité, 100 bonnes pratiques, 100 SEO**. FCP 0,9 s, LCP 3,4 s, TBT 10 ms, CLS 0. Ce sont des mesures de laboratoire : le LCP reste à surveiller après déploiement sur l’hébergement final, avec son cache d’images et ses conditions réseau. Aucun résultat de Core Web Vitals terrain n’est supposé.

## Configuration de publication

Les variables sont documentées dans `.env.example`. Renseigner l’identité réelle de l’éditeur, l’hébergeur et le contact avant publication ; aucun renseignement juridique n’a été inventé. Les pages de confidentialité décrivent le comportement actuel sans analytics, compte ou stockage local.

Définir `NEXT_PUBLIC_SITE_URL` pour les URLs canoniques et le sitemap. Renseigner les variables au build, les pages publiques étant préconstruites. Les références des médias sont dans [ASSETS.md](./ASSETS.md).
