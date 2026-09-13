# Publication des images manquantes — 12 septembre 2026

Les **57 zones initialement sans image** ont toutes été examinées. **50 nouvelles photographies Unsplash ont été publiées**, soit **70 destinations illustrées sur 77**. Sept zones conservent volontairement leur fallback faute de photographie suffisamment fiable et adaptée dans la sélection effectuée : Chicama, Lobitos, Lagundri/Nias, Pavones, Pohnpei, Punaauia et Santa Rosa.

Les **20 photographies précédentes sont inchangées** : chemins PostgreSQL et SHA-256 des fichiers publics contrôlés. Les 54 lignes des tableaux historiques de sources et de candidates sont conservées à l’identique.

## Registre et exceptions

Le [registre central des sources](destination-image-sources.md#complétion-des-57-zones-restantes--12-septembre-2026) contient les 50 publications : `zone_id`, destination, pays, photographe et profil, URL Unsplash, date, chemin et poids exact. Il explique individuellement les sept exceptions et les limites géographiques des vues régionales.

Le [manifeste versionné](destination-image-completion.json) contient également le périmètre initial des 57 identifiants réels, les URL des fichiers sources, les indices de localisation, les empreintes SHA-256, les positions de cadrage et les recherches des exceptions. Les vues de côtes voisines ou d’une même région ne sont pas décrites comme une photographie du break exact.

- Bucket existant : `destinations`, aucune modification de sa configuration.
- Fichiers : `<zone_id>/hero.webp`, WebP **1600 × 1000**.
- Poids des nouveaux fichiers : **33848 à 491902 octets**, tous sous 500000 octets ; **12684848 octets** au total.
- **50 nouvelles photos, 50 photographes différents** ; 70 identifiants Unsplash et 70 empreintes distincts avec les anciennes photos.
- Publication réelle : upload sans écrasement, vérification HTTP/empreinte, puis mise à jour conditionnelle de `zones.hero_image_path` avec le chemin relatif.
- Audit final : **70 objets publics HTTP 200**, empreintes et dimensions conformes ; **77 zones / 70 images / 7 fallbacks**.

Les localisations reposent sur les légendes ou indications des pages Unsplash, sans prétendre à une vérification GPS indépendante. Navigation web normale et téléchargement des fichiers publics sélectionnés ; aucun scraping, API privée, image générée ou contournement des protections.

## Contrôle visuel

- [Planche des 77 destinations](../.local/destination-completion/contact-77.jpg).
- [Planche du périmètre des 57 zones, avec les sept exceptions signalées](../.local/destination-completion/contact-57-scope.jpg).
- [Planche des 50 nouvelles photographies uniquement](../.local/destination-completion/contact-50-new.jpg).
- Captures des 50 nouvelles bannières et des 50 nouvelles cartes aux quatre largeurs : **400 captures**, conservées sous `.local/destination-completion/browser-captures/`.
- Planches des captures navigateur : [1440 px, 1–25](../.local/destination-completion/browser-1440-0.jpg), [1440 px, 26–50](../.local/destination-completion/browser-1440-25.jpg), [1280 px, 1–25](../.local/destination-completion/browser-1280-0.jpg), [1280 px, 26–50](../.local/destination-completion/browser-1280-25.jpg), [768 px, 1–25](../.local/destination-completion/browser-768-0.jpg), [768 px, 26–50](../.local/destination-completion/browser-768-25.jpg), [390 px, 1–25](../.local/destination-completion/browser-390-0.jpg), [390 px, 26–50](../.local/destination-completion/browser-390-25.jpg).

Les planches ont été inspectées : variété de plages, vagues, côtes et reliefs, aucun doublon, aucun gros logo ou portrait rapproché repéré. Quelques couchers de soleil restent volontairement plus sombres ; aucune correction artificielle de couleur n’a été appliquée. Les crops problématiques ont été corrigés avant publication ou via la configuration centrale des nouvelles photos.

Les hauteurs restent **340 px à 1440/1280**, **280 px à 768**, **220 px à 390**. Les tests vérifient le titre et les informations avant la bannière, l’image réelle servie par Next/Image, l’absence de débordement horizontal et l’ordre DOM Surf → Vol → Logement. Le fallback absent/HTTP 404 conserve les dimensions.

## Vérifications techniques

| Contrôle | Résultat |
| --- | --- |
| TypeScript (`npm run typecheck`) | Réussi |
| Lint (`npm run lint`) | Réussi |
| Tests unitaires (`npm test`) | 31 réussis |
| Nouvelle couverture navigateur | 9 tests réussis : 4 bannières, 4 catalogues, recherches par pays/navigation |
| Non-régression images, landing, bannières, mesures locales | 7 réussis ; 1 répétition mobile ignorée car les quatre largeurs sont déjà explicites |
| Application isolée : photo, absence, HTTP 404, navigation et anciens assets | 4 réussis |
| Total navigateur | **20 tests réussis**, 1 répétition ignorée |
| Build Next.js (`npm run build`) | Réussi |
| Secrets | Aucun credential local retrouvé dans les sources versionnables ou les 18 bundles client ; aucun marqueur de connexion PostgreSQL dans ces bundles |

Le test des recherches a d’abord capturé les skeletons pendant le streaming serveur ; il attend maintenant le titre des résultats et leur disparition avant d’énumérer les cartes. Le test corrigé retrouve les 50 nouvelles images via les recherches réelles par pays et valide navigation Next.js, paramètres de voyage et refresh. Aucun comportement applicatif n’a été modifié pour faire passer ce test.

Mesure locale sur Ericeira, serveur de développement et scripts partenaires bloqués : LCP **424 ms desktop / 732 ms mobile**, CLS **0 / 0**, latence maximale des interactions **48 / 40 ms**. Ce sont des mesures de laboratoire, pas un INP terrain ni une mesure de production.

## Périmètre des fichiers

Créés : ce compte rendu, `docs/destination-image-completion.json`, `tests/e2e/destination-image-completion.spec.ts`.

Modifiés : registre central des sources, inventaire `docs/destination-images.md`, `lib/images/banner.ts` pour les nouvelles positions uniquement, script de publication pour accepter le manifeste complet et protéger les 20 anciennes photos, deux tests qui utilisaient auparavant Aguadilla comme destination sans photo (désormais Chicama), configuration ESLint pour exclure `.local/**`, répertoire d’audits générés déjà ignoré par Git.

La comparaison de 77 fichiers applicatifs/manifestes préexistants ne relève que `lib/images/banner.ts` comme modification. **DestinationHero, DestinationImage, hauteurs, CSS, moteur de recherche, scoring, niveaux, saisons, accès Supabase de l’application, Travelpayouts et Hotels.com sont inchangés.** Aucune migration, aucun changement de bucket ou de politique d’accès.

**Aucun déploiement Vercel effectué.** Les objets Storage et associations PostgreSQL sont déjà publiés ; les nouvelles configurations de cadrage sont prêtes pour le déploiement manuel du code.

Les fichiers sources, preuves de navigation et captures volumineuses sont conservés dans `.local/destination-completion/`, hors Git. L’[audit public](../.local/destination-completion/publication-audit.json), le [contrôle d’intégrité du code](../.local/destination-completion/code-integrity.json) et le [contrôle des secrets](../.local/destination-completion/security-audit.json) y sont également disponibles.

## Positions spécifiques des nouvelles bannières

Les autres nouvelles photos conservent `center`. Les dix positions des anciennes photos sont inchangées.

| Zone | object-position |
| --- | --- |
| `coolangatta` | `center 100%` |
| `fernando-de-noronha` | `center 18%` |
| `half-moon-bay` | `center 35%` |
| `rapa-nui` | `center 75%` |
| `pantin` | `center 35%` |
| `santa-catalina-pa` | `center 75%` |
| `tamarin` | `center 40%` |
| `tofo` | `center 60%` |
| `bocas-del-toro` | `center 70%` |
| `sumba-ouest` | `center 95%` |
| `moorea` | `center 90%` |
| `north-shore-oahu` | `center 40%` |
| `g-land` | `center 35%` |
| `teahupoo` | `center 95%` |
| `san-cristobal-galapagos` | `center 100%` |
| `unstad` | `center 25%` |
| `thurso` | `center 90%` |
| `carrapateira` | `center 35%` |
| `bali-cote-est` | `center 65%` |
| `putzu-idu` | `center 40%` |
