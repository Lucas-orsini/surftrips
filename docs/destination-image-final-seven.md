# Dernière passe images — 12 septembre 2026

**Six destinations ajoutées ; 76 photos sur 77 zones. Seul Pavones conserve le fallback.**

| Destination | Source / photographe | Licence | Chemin dans le bucket `destinations` | Poids |
|---|---|---|---|---|
| Chicama | [Pexels — Viajero Cool](https://www.pexels.com/photo/birds-flying-over-the-sea-with-silhouette-of-person-standing-on-a-cliff-4109127/) | Pexels License | `chicama/hero.webp` | 156 174 octets |
| Lobitos | [Wikimedia Commons — German Ato Zavala](https://commons.wikimedia.org/wiki/File:Vista_del_balneario_de_Lobitos,_Talara_-_Piura.jpg) | CC BY-SA 4.0 | `lobitos/hero.webp` | 269 156 octets |
| Lagundri / Nias | [Wikimedia Commons — Edison Zega A.Lewi](https://commons.wikimedia.org/wiki/File:Singa_nasi_Sorake.jpg) | CC0 1.0 | `nias-lagundri/hero.webp` | 241 914 octets |
| Pohnpei | [Wikimedia Commons — Zykasaa](https://commons.wikimedia.org/wiki/File:Pohnpei_lagoon_from_plane.jpg) | CC BY-SA 4.0 | `pohnpei/hero.webp` | 329 290 octets |
| Punaauia | [Wikimedia Commons — Rioga98](https://commons.wikimedia.org/wiki/File:Coucher_de_soleil_sur_Moorea.jpg) | Public Domain (PD-self) | `punaauia/hero.webp` | 57 176 octets |
| Santa Rosa | [Wikimedia Commons — dog4aday](https://commons.wikimedia.org/wiki/File:Roca_Bruja_-_Guanacaste_-_Costa_Rica.jpg) | CC BY 2.0 | `santa-rosa-cr/hero.webp` | 99 428 octets |

Tous les fichiers sont des WebP 1600 × 1000, sous 500 Ko. La base contient les chemins relatifs ci-dessus. Les 76 images publiques répondent HTTP 200 et correspondent exactement aux empreintes des manifestes. Les 70 images précédentes n’ont été ni remplacées ni recadrées ; leurs chemins et SHA-256 sont inchangés.

## Cadrages et captures

Les overrides ajoutés dans `lib/images/banner.ts` sont : Lobitos `center 40%`, Nias `center 40%`, Pohnpei `center 35%`, Punaauia `center 95%`, Santa Rosa `center 55%`. Chicama conserve `center`. Les cadrages des 70 photos précédentes n’ont pas changé.

[Planche des six bannières desktop](../.local/destination-final-seven/contact-1440.png) · [Planche mobile](../.local/destination-final-seven/contact-390.png).

[Page Santa Rosa mobile avec crédit visible](../.local/destination-final-seven/captures/page-santa-rosa-cr-390.png) · [Page Pohnpei desktop](../.local/destination-final-seven/captures/page-pohnpei-1440.png) · [Carte Lobitos mobile](../.local/destination-final-seven/captures/card-lobitos-390.png).

Les captures détaillées des six zones sont conservées dans `.local/destination-final-seven/captures/`. La planche confirme des lieux distincts, l’absence de doublons et de gros logos, et des cadrages adaptés aux bannières. La photo de Punaauia montre son lagon et Moorea à l’horizon, depuis Punaauia ; celle de Pohnpei représente le lagon nord et les îlots de Sokehs, sans prétendre montrer P-Pass en action.

## Pavones reste sans photo

La [source originale Playa Pavones de Wha’ppen](https://www.flickr.com/photos/whappen/1337575712/sizes/o/) est bien localisée et sous CC BY-SA 2.0, mais ne mesure que **800 × 600**. La [vue de Punta Banco](https://commons.wikimedia.org/wiki/File:Beachview_in_Punta_Banco,_Costa_Rica.jpg), à proximité immédiate et sous CC BY-SA 4.0, est limitée à **640 × 480**. Aucune n’a été agrandie artificiellement.

Les autres recherches sur Unsplash, Pexels, Pixabay et Commons n’ont pas fourni une alternative suffisamment fiable. Une candidate annoncée sur Hippopx n’a pas été retenue, faute de provenance/auteur vérifiables et d’accès à la source ; aucun contournement du HTTP 403. Les recherches, URL examinées et motifs précis sont détaillés dans [la documentation centrale](destination-image-sources.md#pavones--recherches-et-rejets-précis).

## Licences et attribution

Lobitos, Pohnpei et Santa Rosa ont un crédit visible : auteur, titre et source originale, licence, modifications. Les deux dérivés BY-SA conservent la licence CC BY-SA 4.0. Les crédits sont rendus côté serveur dans les cartes, près des bannières, pour les suggestions concernées, et dans les mentions légales. Les images sans obligation de crédit n’en reçoivent pas. Les métadonnées XMP des six fichiers conservent aussi la provenance et les droits.

Les 70 images précédentes restent inchangées, sans crédit ajouté. `DestinationHero`, `DestinationImage`, les hauteurs 340 / 280 / 220 px, le moteur métier et les widgets ne sont pas modifiés. Les seules modifications d’affichage servent aux obligations d’attribution des trois nouvelles photos concernées.

## Fichiers de cette passe

- Créés : `docs/destination-image-final-seven.json`, ce compte rendu, `lib/images/credits.ts`, `components/destination/DestinationPhotoCredit.tsx`, `tests/destination-photo-credits.test.ts`, `tests/e2e/destination-final-seven.spec.ts`.
- Complétés : `docs/destination-image-sources.md`, `docs/destination-images.md`, `lib/images/banner.ts`, `scripts/publish-destination-images.ts`.
- Attribution uniquement : `app/destination/[slug]/page.tsx`, `components/destination/DestinationCard.tsx`, `components/landing/Hero.tsx`, `app/mentions-legales/page.tsx`, `app/globals.css`.
- Tests existants adaptés au nouvel inventaire : `tests/e2e/destination-image-completion.spec.ts`, `tests/e2e/destination-images-live.spec.ts`, `tests/e2e/destination-banner.spec.ts`. Les tests de fallback utilisent désormais Pavones.
- Originaux, images préparées, preuves, audit et captures : `.local/destination-final-seven/` et `.local/destination-images/`, ignorés par Git. Les fichiers déjà modifiés avant cette passe sont conservés.

## Point de données à vérifier séparément

La latitude de `zones.zone_id = nias-lagundri` et celle de `spots.spot_id = lagundri-bay` sont enregistrées à **−0.573000**. Les photographies de Sorake géolocalisées par leurs auteurs situent le lieu vers **+0.570520 / 97.731969**. Le signe nécessite une vérification éditoriale ; ces données n’ont pas été modifiées.

## Validation

- PostgreSQL / Storage : **77 zones, 76 images, 1 fallback**, 76 réponses HTTP 200, 70 empreintes précédentes inchangées.
- Six nouvelles photos : cartes, recherches réelles par pays, liens vers les destinations, refresh, attribution et absence d’overflow contrôlés à **1440 et 390 px** ; **5 tests E2E réussis**.
- Non-régression de la bannière existante et du fallback : **1440, 1280, 768, 390 px**, hauteurs inchangées, CLS mesuré ≤ 0,01 ; **1 test E2E réussi**.
- TypeScript, lint, **33 tests unitaires** et build Next.js réussis.
- Le premier lancement des E2E a rencontré la protection d’origine du serveur de développement déjà ouvert (`localhost` contre `127.0.0.1`). La validation a été effectuée sur un build de production local séparé au port 3002, sans arrêter le serveur utilisateur ni modifier sa configuration. Une attente de visibilité a été ajoutée au test du fallback pour respecter le rendu progressif de Next.js.
- Les partenaires ont été bloqués dans les tests d’images pour isoler leur rendu. Travelpayouts et Hotels.com n’ont pas été modifiés ; leur disponibilité externe n’est pas réévaluée par cette tâche.
- Avertissement serveur préexistant observé : la table de recommandations d’hébergement n’est pas encore disponible. Aucune migration hébergement n’a été appliquée dans cette tâche d’images.

**Aucun déploiement Vercel.** Les crédits ajoutés doivent impérativement accompagner le prochain déploiement du code affichant ces nouvelles images. La production publique inspectée lors de cette passe ne consommait pas encore les images Supabase ; aucun code ancien dépourvu des crédits n’a été déployé.
