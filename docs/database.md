# Inspection de la base existante — 10 septembre 2026

Connexion PostgreSQL au pooler Supabase, TLS vérifié avec le certificat CA public officiel. Toutes les inspections et requêtes applicatives utilisent des transactions `READ ONLY`. L’inspection initiale du 10 septembre ne modifiait aucune table, donnée ou politique. La publication image autorisée du 12 septembre est décrite ci-dessous.

77 zones, 94 spots et 39 pays présents lors du contrôle. Les colonnes demandées existent. Les budgets existants ne sont pas utilisés. Aucune colonne continent n’existe : les pays proposés viennent de `zones.pays`. La colonne photo était absente au contrôle initial ; après autorisation explicite, `20260912_destination_hero_image.sql` a été appliquée le 12 septembre 2026. Vingt zones ont maintenant un `hero_image_path` relié à une photo vérifiée du bucket public `destinations` ; 57 conservent le fallback. Voir [le guide et l’inventaire des images](destination-images.md).

`lat_centre` et `lon_centre` sont des `numeric`, `transfert` est du texte, les saisons sont deux entiers, les niveaux sont des enums PostgreSQL. La jointure est `spots.zone_id = zones.zone_id`. Tous les mois inspectés sont entre 1 et 12.

RLS active sur les deux tables. Les politiques publiques constatées autorisent uniquement SELECT pour `anon` et `authenticated`. Une connexion PostgreSQL privilégiée peut contourner la RLS ; les transactions applicatives sont donc explicitement en lecture seule et aucun point d’entrée ne permet d’écrire. Utiliser un rôle de connexion doté seulement de SELECT sur ces tables pour le déploiement, si un tel rôle est disponible.

## Niveaux idéaux à corriger dans les données

41 lignes portent `niveau_ideal = tous_niveaux`. Aucun niveau minimum n’est inconnu. Le minimum `debutant` reste utilisé tel qu’enregistré pour la comparaison de sécurité. Le niveau idéal historique est isolé, affiché « À vérifier » et ne reçoit aucun bonus de correspondance idéale. Aucune conversion ni correction automatique. Les niveaux minimums restent des données documentaires à valider par le responsable de la base.

| spot_id           | zone_id            | niveau_min | niveau_ideal actuel |
| ----------------- | ------------------ | ---------- | ------------------- |
| anchor-point      | taghazout          | debutant   | tous_niveaux        |
| anse-couleuvre    | martinique-nord    | debutant   | tous_niveaux        |
| arugam-bay        | arugam-bay         | debutant   | tous_niveaux        |
| bells-beach       | torquay            | debutant   | tous_niveaux        |
| black-s-beach     | san-diego          | debutant   | tous_niveaux        |
| bundoran          | bundoran           | debutant   | tous_niveaux        |
| capo-mannu        | putzu-idu          | debutant   | tous_niveaux        |
| chicama           | chicama            | debutant   | tous_niveaux        |
| cloud9            | siargao            | debutant   | tous_niveaux        |
| cote-des-basques  | biarritz           | debutant   | tous_niveaux        |
| el-sunzal         | la-libertad        | debutant   | tous_niveaux        |
| ha-apiti          | moorea             | debutant   | tous_niveaux        |
| huntington        | huntington-newport | debutant   | tous_niveaux        |
| im-bay            | imsouane           | debutant   | tous_niveaux        |
| jialeshui         | kenting            | debutant   | tous_niveaux        |
| keramas           | bali-cote-est      | debutant   | tous_niveaux        |
| kirra             | coolangatta        | debutant   | tous_niveaux        |
| lennox-head       | byron-bay          | debutant   | tous_niveaux        |
| lobitos           | lobitos            | debutant   | tous_niveaux        |
| malibu            | malibu             | debutant   | tous_niveaux        |
| ngor              | dakar              | debutant   | tous_niveaux        |
| noosa             | noosa              | debutant   | tous_niveaux        |
| occys-left        | sumba-ouest        | debutant   | tous_niveaux        |
| pantin            | pantin             | debutant   | tous_niveaux        |
| parlementia       | guethary           | debutant   | tous_niveaux        |
| pavones           | pavones            | debutant   | tous_niveaux        |
| playa-naranjo     | santa-rosa-cr      | debutant   | tous_niveaux        |
| praia-da-bordeira | carrapateira       | debutant   | tous_niveaux        |
| punta-roca        | la-libertad        | debutant   | tous_niveaux        |
| raglan            | raglan             | debutant   | tous_niveaux        |
| ribeira-ilhas     | ericeira           | debutant   | tous_niveaux        |
| rincon            | santa-barbara      | debutant   | tous_niveaux        |
| saint-leu         | saint-leu          | debutant   | tous_niveaux        |
| santa-catalina    | santa-catalina-pa  | debutant   | tous_niveaux        |
| snapper-rocks     | coolangatta        | debutant   | tous_niveaux        |
| streamer-lane     | santa-cruz         | debutant   | tous_niveaux        |
| tam-bay           | tamarin            | debutant   | tous_niveaux        |
| the-pass          | byron-bay          | debutant   | tous_niveaux        |
| thurso-east       | thurso             | debutant   | tous_niveaux        |
| trestles          | san-clemente       | debutant   | tous_niveaux        |
| unstad            | unstad             | debutant   | tous_niveaux        |

## Refaire le diagnostic

`npm run db:inspect` affiche le schéma, les comptes, les niveaux, les identifiants à corriger, les saisons manquantes et les politiques de lecture. Aucun credential n’est imprimé. Le code des anomalies et les exclusions du matching sont conservés côté serveur ; aucune URL publique n’expose le diagnostic.

Les champs SQL projetés sont explicites dans `lib/db/zones.ts`. Si le schéma change, mettre l’adaptateur à jour après inspection ; une erreur de colonne produit un état utilisateur générique, jamais une création automatique.

## Certificat public

Source : https://supabase-downloads.s3-ap-southeast-1.amazonaws.com/prod/ssl/prod-ca-2021.crt

Guide officiel : https://supabase.com/docs/guides/platform/ssl-enforcement

Le certificat CA est conservé dans `lib/db/supabase-ca.ts`. Il est public, sans clé privée. Renouveler depuis Supabase si leur chaîne de certification change ; ne pas désactiver `rejectUnauthorized`.
