# Production Surftrips — préparation du 12 septembre 2026

## Statut

**Déploiement non effectué : accès au compte Vercel de production manquant.** Aucun token Vercel ni session CLI n’était disponible au dernier contrôle. La configuration locale n’est pas encore liée à un projet Vercel. Une demande de connexion a été transmise à l’utilisateur, sans demande de secret dans la conversation.

URL publique identifiée : **https://www.surftrips.fr**. Le domaine `https://surftrips.fr` redirige vers `www` en HTTP 308. Les réponses indiquent Vercel. Le dépôt distant `Lucas-orsini/surftrips`, branche `main`, est encore au commit `cc94f236baa7abe2ee785ae80bb5d254cfb6f6f7` ; les évolutions images/bannières sont dans le workspace local.

## Contrôles réalisés avant déploiement

- Landing, `/destination/ericeira` et `/destination/aguadilla` : HTTP 200 sur le site public.
- La production utilise encore les anciennes images locales, sans le nouveau composant `DestinationImage`.
- Mesure de laboratoire desktop 1440 px de l’ancienne version : landing LCP 1860 ms / CLS 0 ; Ericeira LCP 2976 ms / CLS 0,201 ; Aguadilla LCP 796 ms / CLS 0,146. Ces mesures uniques servent de repère, pas de statistiques terrain.
- Scan des 14 bundles JavaScript publics chargés sur ces pages : aucun credential local ou référence aux connexions PostgreSQL détecté. Les secrets propres à la configuration Vercel ne peuvent pas encore être comparés, faute d’accès.
- Empreintes de 89 fichiers applicatifs contrôlées : aucun changement de fonctionnalité, design, intégration ou base pendant cette préparation.
- TypeScript et lint passent après ajout de la configuration des tests de production.

Les captures et rapports sont conservés dans `.local/production-deployment/`, ignoré par Git et explicitement exclu de l’upload Vercel.

## Variables

Présence **locale seulement** confirmée, sans afficher les valeurs : `NEXT_PUBLIC_SUPABASE_URL`, `DATABASE_URL`, `DIRECT_URL`, `TRAVELPAYOUTS_MARKER`, `TRAVELPAYOUTS_SHMARKER`. Leur présence, leur validité et leur cible en **production** restent à vérifier dans le projet Vercel existant avant le déploiement.

Autres paramètres applicatifs à examiner sans remplacer une configuration existante : `NEXT_PUBLIC_SITE_URL`, `HOTELS_COM_FALLBACK_URL`, `LEGAL_PUBLISHER_NAME`, `LEGAL_PUBLISHER_ADDRESS`, `LEGAL_CONTACT_EMAIL`, `LEGAL_HOST_NAME`, `LEGAL_HOST_ADDRESS`. Ces variables sont facultatives pour l’exécution actuelle ; les données légales et un éventuel lien affilié de secours ne doivent pas être inventés.

`SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` servent aux opérations administratives locales de publication d’images. L’application ne les utilise pas : ne pas les copier dans la production pour cette mise en ligne. `TRAVELPAYOUTS_TOKEN` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ne sont pas utilisés par le code applicatif actuel non plus.

`.vercelignore` a été ajouté pour exclure les fichiers d’environnement, credentials locaux, caches et diagnostics de l’upload. Les variables applicatives devront provenir du projet Vercel, conformément à la [documentation des exclusions Vercel](https://vercel.com/docs/deployments/vercel-ignore).

## Reprise une fois l’accès disponible

1. Utiliser la [connexion CLI Vercel](https://vercel.com/docs/cli/login) ou un `VERCEL_TOKEN` configuré localement, jamais copié dans la conversation.
2. Identifier le projet existant par son domaine `www.surftrips.fr` et son dépôt, puis y lier le dossier. Ne créer aucun projet, domaine ou base.
3. Vérifier les variables de l’environnement production, en stockant toute exportation uniquement dans un fichier local ignoré, sans en afficher les valeurs. Vérifier que le Storage et PostgreSQL correspondent au projet Supabase prévu.
4. Déployer la version actuelle avec la configuration de ce projet. Enregistrer l’identifiant et l’URL du déploiement précédent pour pouvoir revenir dessus si nécessaire. Aucune migration à exécuter.
5. Contrôler la nouvelle version sur le domaine public après affectation du déploiement : données réelles, bannières, images, fallback et intégrations.

La suite de production se lance avec :

```sh
npm run test:e2e -- --config tests/production/playwright.config.ts
```

Elle cible exclusivement `https://www.surftrips.fr`, n’exécute aucun serveur local, ne déclenche aucun déploiement et n’écrit pas en base. Elle réutilise les contrôles de landing, recherche réelle, vingt images Storage, bannières aux quatre largeurs, navigation, widgets réels et blocage/repli. Le test de saturation du rate limiting est exclu. Les tests de photos bloquent les scripts partenaires pour isoler leurs mesures ; les contrôles partenaires séparés utilisent les vrais widgets.

**Les validations après déploiement n’ont pas encore été effectuées.** Elles ne doivent pas être confondues avec les tests locaux réussis ni avec l’inspection de l’ancienne version publique.
