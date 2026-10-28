# Structure du contenu DA — miroir de l'arborescence TD

Objectif : le contenu Document Authoring (`https://da.live/#/azouaoui-deloitte/eds-td`) reproduit l'arborescence d'URL
de td.com. Aucune page ne vit à la racine : `/` redirige (301) vers la page d'accueil Particuliers.

## Racine du dépôt DA

| Élément | Rôle |
|---|---|
| `redirects` (sheet) | `Source` → `Destination` : `/` → `/ca/fr/services-bancaires-personnels` (meilleure pratique EDS, `/redirects.json`) |
| `metadata` (sheet) | métadonnées en masse : `URL` = `/ca/fr/**` → `nav` = `/ca/fr/nav`, `footer` = `/ca/fr/footer` |
| `media/td/` | images (accueil + méga-menu + footer à la racine de `media/td/`, pages L1 sous `media/td/<page>/`) |
| `ca/fr/` | tout le contenu, comme sur td.com |

## Fragments globaux (équivalents des *experience fragments* TD)

Les fragments globaux sont rangés sous le dossier de langue `/ca/fr/`, comme les experience fragments TD
(`/content/experience-fragments/.../ca/fr/...`), afin qu'un futur site anglais (`/ca/en/...`) ait ses propres fragments.

| Ancien chemin (racine) | Nouveau chemin | Contenu |
|---|---|---|
| `/index` (copie de la page) | supprimé → redirection `/` | — |
| `/nav` | `/ca/fr/nav` | header : segments, logo, utilitaires, onglets du méga-menu |
| `/footer` | `/ca/fr/footer` | footer |
| `/fragments/nav/comptes` | `/ca/fr/fragments/nav/comptes` | panneau méga-menu Comptes |
| `/fragments/nav/cartes-de-credit` | `/ca/fr/fragments/nav/cartes-de-credit` | panneau Cartes de crédit |
| `/fragments/nav/prets-hypothecaires` | `/ca/fr/fragments/nav/prets-hypothecaires` | panneau Prêts hypothécaires |
| `/fragments/nav/prets-et-lignes-de-credit-td` | `/ca/fr/fragments/nav/prets-et-lignes-de-credit-td` | panneau Prêts et lignes de crédit TD |
| `/fragments/nav/placements-personnels` | `/ca/fr/fragments/nav/placements-personnels` | panneau Placements personnels |
| `/fragments/nav/assurance` | `/ca/fr/fragments/nav/assurance` | panneau Assurance |
| `/fragments/nav/conseils` | `/ca/fr/fragments/nav/conseils` | panneau Conseils |
| `/modals/index-du-site` | `/ca/fr/modals/index-du-site` | modale « Index du site » (footer) |
| — | `/ca/fr/modals/mentions-juridiques/<page>` | modales « Mentions juridiques » des pages L1 |
| — | `/ca/fr/modals/info-bulles/<page>-<sujet>` | info-bulles (popovers) de la page Prêts hypothécaires |
| — | `/ca/fr/modals/province/cartes-de-credit` | choix de la province (Cartes de crédit) |

Le header lit la métadonnée `nav`, le footer la métadonnée `footer` (repli codé : `/ca/fr/nav`, `/ca/fr/footer`, utilisé
par la page 404). Les onglets du document nav pointent vers `/ca/fr/fragments/nav/<onglet>` ; tout lien contenant
`/modals/` s'ouvre dans une boîte de dialogue.

## Pages

| Page | Chemin EDS (= chemin TD) |
|---|---|
| Services bancaires personnels (accueil) | `/ca/fr/services-bancaires-personnels` |
| Comptes bancaires | `/ca/fr/services-bancaires-personnels/produits/comptes-bancaires` |
| Cartes de crédit | `/ca/fr/services-bancaires-personnels/produits/cartes-de-credit` |
| Prêts hypothécaires | `/ca/fr/services-bancaires-personnels/produits/prets-hypothecaires` |
| Prêts et lignes de crédit | `/ca/fr/services-bancaires-personnels/produits/prets-et-lignes-de-credit` |
| Placements personnels | `/ca/fr/services-bancaires-personnels/placements-personnels` |
| Assurance | `/ca/fr/services-bancaires-personnels/produits/assurance` |
| Plans de protection | `/ca/fr/services-bancaires-personnels/produits/assurance/plans-de-protection` |
| Conseils | `/ca/fr/services-bancaires-personnels/conseils` |

Dans DA, une page et un dossier de même nom coexistent (`services-bancaires-personnels.html` + dossier
`services-bancaires-personnels/`), ce qui reproduit exactement l'arborescence TD.

## Liens

Les liens vers une page migrée sont relatifs (`/ca/fr/...`) partout : pages, nav, panneaux du méga-menu, footer, index
du site. Les liens vers les pages non migrées restent absolus (`https://www.td.com/...`). Seule exception volontaire :
dans la modale de province de Cartes de crédit, les provinces autres que le Québec pointent vers td.com (contenu
provincial servi par TD).
