# Section Vol compacte — 2 novembre 2026

Modification locale de l’affichage uniquement. Travelpayouts **Specific Route Widget**, `campaign_id=111`, `promo_id=4484`, conservé. Aucun déploiement Vercel.

## Mesures et cause du blanc

L’ancien composant commençait à **430 px**, puis appliquait `min(1400, max(300, hauteur + 16))`. Il réservait donc au moins 300 px, même pour un contenu plus petit. L’iframe partenaire était inline, ajoutant également environ 3 px de ligne de base. Le lien de parrainage officiel occupait environ 26 px. Notre `#booking-root` était vide : le script partenaire et son contenu étaient placés à côté.

Après le widget, le paragraphe de secours permanent, les boutons, la mention d’affiliation, le padding et les marges des sections augmentaient encore la distance jusqu’au logement. Avant le widget, le formulaire Surftrips occupait 143,5 px sur desktop et 418 px à 390 px, bien que les critères soient déjà renseignés.

Comparaison avec **exactement le même contenu tiers simulé de 200 px** et les scripts officiels Travelpayouts/Kiwi réels. Ce contenu est explicitement identifié dans les captures ; il ne représente pas des offres disponibles.

| Largeur | Section Vol avant | Section Vol après | Iframe avant → après | Fin iframe → logement avant → après |
| --- | ---: | ---: | ---: | ---: |
| 1440 px | 993 px | 390 px | 300 → 200 px | 268 → 32 px |
| 1280 px | 993 px | 390 px | 300 → 200 px | 268 → 32 px |
| 768 px | 1012 px | 384 px | 300 → 200 px | 315 → 32 px |
| 390 px | 1363 px | 376 px | 300 → 200 px | 408 → 32 px |

Le blanc ajouté par Surftrips est corrigé. Le blanc éventuel **à l’intérieur du document cross-origin Kiwi** n’a pas pu être mesuré sur un résultat réel pendant cette session : son endpoint `/single` répond HTTP 403 dans Chrome, avant comme après la modification. Il serait incorrect d’attribuer tout le problème observé en production à nos seuls wrappers.

## Redimensionnement et chargement

Le script s’exécute toujours dans une iframe `srcDoc`, après hydratation. Le wrapper `#booking-root` contient désormais effectivement le script et ses éléments injectés. `html` et `body` ont `margin:0;padding:0`, sans hauteur ni hauteur minimale dépendant du viewport. Le wrapper utilise `display:flow-root` ; l’iframe enfant est `display:block`, sans recadrage.

Un `ResizeObserver` mesure `Math.ceil(root.getBoundingClientRect().height)` et transmet `ready`/`resize` au parent. Les valeurs sont validées, la source, l’origine et la clé du voyage sont vérifiées. Le parent applique la hauteur exacte, bornée entre **64 et 2 400 px**, sans les anciens 16 px supplémentaires. La hauteur initiale de chargement est 120 px ; elle n’est pas conservée après chargement. La borne supérieure laisse le document défilable, sans recadrage artificiel. Les tests couvrent une variation **200 → 680 → 180 px**.

Kiwi continue à dimensionner lui-même son iframe avec son protocole officiel. Aucun accès au DOM cross-origin, suppression d’élément tiers, déplacement négatif ou overlay n’est ajouté. Le `MutationObserver` existant sert seulement à détecter l’insertion du contenu. Les observateurs/timers du document sont nettoyés à sa fermeture ; l’event listener React, son timer et son observateur d’intersection sont retirés au démontage.

Le skeleton est démonté en état `ready` ou `fallback`. Le fallback conserve le délai existant de cinq secondes à l’approche de la section et le traitement des erreurs. L’iframe masquée avec `display:none` ne réserve plus de place ; aucun `visibility:hidden` n’est employé. Le fallback mesuré occupe environ 120 px sur desktop et 203 px sur mobile, textes et liens compris.

Le formulaire Surftrips est retiré lorsque le voyage est valide et déjà renseigné. Il reste disponible en arrivée directe sans critères, en cas d’erreur et lorsque départ et arrivée sont identiques. Les liens de secours et la mention d’affiliation restent accessibles dans **Autres options de réservation**, au-dessus du widget chargé, et directement dans le fallback. Le logement suit à 32 px de l’iframe : 16 px de padding puis 16 px de marge.

## Powered by et choix du widget

[Travelpayouts documente la désactivation de « Add my referral link »](https://support.travelpayouts.com/hc/en-us/articles/19882052278930-Powered-by-Travelpayouts-on-widgets). Le script actuel servi par `tpemd.com` lit bien `powered_by`, le transmet à `settings.show`, et n’active le lien que pour la valeur `true`. Le code utilise désormais **`powered_by=false`**. Le test réel vérifie la valeur de l’URL et `display:none` sur le wrapper créé **par le script officiel**. Aucun CSS Surftrips ne cible ce lien.

La [liste officielle](https://support.travelpayouts.com/hc/en-us/articles/25597177785618-Clicks-on-which-widgets-are-not-shown-in-statistics) recense les quatre widgets Kiwi. La comparaison des scripts servis avec les marqueurs actuels donne :

| Widget | Constat | Décision |
| --- | --- | --- |
| Specific Route, `4484` | Transmet origine, destination, aller, retour, affiliation ; charge `widget-single-iframe.js`. Pas d’option de suppression du formulaire dans ce contrat. | Conservé. |
| Search Results, `3411` | Transmet également les critères et l’affiliation, mais le script Travelpayouts inspecté ne transmet aucun `data-results-only`. | Pas de migration sans code officiel adapté. |
| Popular Routes / Popular Destinations | Widgets de découverte de trajets/destinations, sans configuration vérifiée répondant au voyage exact demandé. | Non retenus. |

Nuance : le [script officiel Kiwi Search Results](https://widgets.kiwi.com/scripts/widget-search-iframe.js) **connaît** `data-results-only` et le transmet comme `resultsOnly`. Toutefois, le script Travelpayouts `3411` actuellement servi ne transmet pas cet attribut. Ajouter arbitrairement `results_only` à son URL ne constitue donc pas une solution vérifiée. Le [script Specific Route](https://widgets.kiwi.com/scripts/widget-single-iframe.js) ne propose pas cet attribut.

Le configurateur du compte Travelpayouts connecté n’était pas accessible dans cette session. La vérification porte sur la documentation publique et les deux scripts officiels réellement servis avec les marqueurs du projet, pas sur une session authentifiée du dashboard. **Aucune suppression officielle de la barre de recherche n’est donc livrée dans l’intégration actuelle.** Elle reste sous le contrôle de Kiwi. Un futur code généré par Travelpayouts relayant `resultsOnly` permettrait de réévaluer le changement.

## Vérifications

- TypeScript, ESLint, 47 tests unitaires et build Next.js : réussis.
- Playwright : quatre largeurs, croissance/réduction, bornes, rejet des messages étrangers/hauteurs invalides, skeleton démonté, bloqueur, script silencieux, iframe vide, absence d’offres, changement de voyage et arrivée directe.
- Tests existants du parcours Surftrips et Booking : réussis. Les fixtures de script ont été adaptées pour insérer leur contenu à côté du script, comme le fait réellement Travelpayouts dans le wrapper.
- Recherche réelle **PAR → LIS, 10–20 décembre 2026** : script Travelpayouts HTTP 200, bons `data-from`, `data-to`, `data-departure`, `data-return`, français/EUR, `data-affilid=travelpayoutswidget`, `data-sub1` contenant le marqueur. Les deux variables `TRAVELPAYOUTS_MARKER` et `TRAVELPAYOUTS_SHMARKER` et leur logique sont inchangées.
- Le lien `c111.travelpayouts.com/click` conserve le même `shmarker` ; sa redirection réelle atteint `/search/results/` sur Kiwi avec Paris, Lisbonne et les deux dates, sur desktop et mobile. Aucune réservation ni attribution de commission finale n’est testée.
- **Offres dans l’iframe : non vérifiées**, car Kiwi `/single` répond HTTP 403 dans le navigateur local. Le fallback réel est vérifié. Le succès du test de redirection ne signifie pas que l’iframe a affiché des vols.
- Booking.com / CJ, composants hébergement, URLs, logique de recherche, règles métier et Supabase : inchangés. Seul l’espacement adjacent entre Vol et logement est réduit.

## Captures

Comparaison de hauteur contrôlée, réponse tierce simulée explicitement signalée :

- Desktop : [avant](flight-widget/before-controlled-1440.png) · [après](flight-widget/after-controlled-1440.png).
- Mobile : [avant](flight-widget/before-controlled-390.png) · [après](flight-widget/after-controlled-390.png).

Captures réelles, sans réponse simulée, montrant le fallback après le HTTP 403 Kiwi :

- Desktop : [avant](flight-widget/before-1440.png) · [après](flight-widget/after-1440.png).
- Mobile : [avant](flight-widget/before-390.png) · [après](flight-widget/after-390.png).

[Mesures brutes des quatre largeurs](flight-widget/measurements.json). Les scripts de diagnostic et les captures intermédiaires sont conservés localement dans `.local/flight-compact/`.
