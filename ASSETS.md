# Références des visuels

Les images sont téléchargées dans `public/images/` et servies via `next/image`, avec formats AVIF/WebP et tailles adaptées au viewport. Elles ne dépendent pas de l’accès à Unsplash en production.

| Fichier           | Référence                                                                                                                                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `hero.jpg`        | [Photographie de surf](https://images.unsplash.com/photo-1455729552865-3658a5d39692) — image d’ambiance, sans attribution à un spot précis                                                                      |
| `ericeira.jpg`    | [Surfers walk along a peaceful beach at sunset](https://unsplash.com/photos/surfers-walk-along-a-peaceful-beach-at-sunset-LPTQ4ZZnUSA) — Ericeira, Portugal                                                     |
| `taghazout.jpg`   | [Aerial photography of white and brown concrete buildings near ocean](https://unsplash.com/photos/aerial-photography-of-white-and-brown-concrete-buildings-near-ocean-VBCYuZ1ttpI) — Ludomił Sawicki, Taghazout |
| `canggu.jpg`      | [Person surfing on body of water during golden hour](https://unsplash.com/photos/person-surfing-on-body-of-water-during-golden-hour--TA-2O1XIQo) — Kaspars Upmanis, Canggu                                      |
| `inspiration.jpg` | [Man holding surfing board during sunset](https://unsplash.com/photos/man-holding-surfing-board-during-sunset-fOc_9zcDaP0) — Canggu, Bali                                                                       |

Ces références sont proposées sous la [licence Unsplash](https://unsplash.com/license). Les photographies des lieux sont distinctes des données surf illustratives du projet.

## Carte et éléments graphiques

`world-map.svg` est une projection simplifiée de [ces contours GeoJSON](https://github.com/holtzy/D3-graph-gallery/blob/master/DATA/world.geojson), fondés sur les contours Natural Earth. Elle est destinée à un aperçu de voyage, sans fonction de navigation. Projection équirectangulaire, latitude 80° N à 60° S. La géométrie et les points sont indépendants pour faciliter le remplacement par une carte interactive.

Logo typographique, favicon, icônes linéaires, courbes de houle, courbes bathymétriques et tracés d’itinéraires sont des SVG créés pour le projet. Syne et DM Sans sont chargées via `next/font/google`.
