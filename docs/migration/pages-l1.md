# Migration des pages L1 du méga-menu TD vers EDS

- **Site** : https://main--eds-td--azouaoui-deloitte.aem.live/ (`/` redirige vers l'accueil Particuliers)
- **Contenu** : Document Authoring (`https://da.live/#/azouaoui-deloitte/eds-td`), arborescence miroir de td.com
  (voir [structure-contenu.md](structure-contenu.md))
- **Méthode** : skills Adobe `page-import` (scrape → structure → authoring analysis → HTML DA → preview) et
  `content-driven-development` / `building-blocks`, David's Model (contenu par défaut d'abord, blocs réutilisés).

## Pages migrées (chemins TD conservés)

| Onglet du méga-menu | Page | Chemin |
|---|---|---|
| Comptes | Comptes bancaires personnels | `/ca/fr/services-bancaires-personnels/produits/comptes-bancaires` |
| Cartes de crédit | Cartes de crédit canadiennes | `/ca/fr/services-bancaires-personnels/produits/cartes-de-credit` |
| Prêts hypothécaires | Obtenez-en plus de votre nouveau prêt hypothécaire | `/ca/fr/services-bancaires-personnels/produits/prets-hypothecaires` |
| Prêts et lignes de crédit TD | Prêts et lignes de crédit TD | `/ca/fr/services-bancaires-personnels/produits/prets-et-lignes-de-credit` |
| Placements personnels | Nous vous aiderons à épargner et investir | `/ca/fr/services-bancaires-personnels/placements-personnels` |
| Assurance | Plans de protection TD et assurance voyage (L1) | `/ca/fr/services-bancaires-personnels/produits/assurance` |
| Assurance (lien « Explorez tous les plans de protection ») | Plans de protection TD | `/ca/fr/services-bancaires-personnels/produits/assurance/plans-de-protection` |
| Conseils | Conseils TD | `/ca/fr/services-bancaires-personnels/conseils` |

Documents annexes : modales `/ca/fr/modals/mentions-juridiques/{comptes-bancaires,cartes-de-credit,prets-hypothecaires,plans-de-protection}`,
`/ca/fr/modals/info-bulles/prets-hypothecaires-{taux-special,tac}`, `/ca/fr/modals/province/cartes-de-credit`.
Médias sous `media/td/<page>/` (bannières en 4 rendus art-dirigés, illustrations SVG TD rastérisées en PNG).

## Blocs créés

| Bloc | Composant TD | Pages |
|---|---|---|
| `promo-banner` (variantes `narrow`, `wide`, `stacked`, `image-right`, `white`, `pale-green`, `title-tight`) | `cmp-banner-container` | comptes, prêts hyp., prêts et lignes, placements, conseils |
| `notification` | `cmp-notification` | comptes |
| `circle-links` (`link-labels`) | `cmp-circle-slider` | comptes, cartes, prêts hyp. |
| `compare-cards` (`credit` + cases « Comparer » et tiroir collant `compare-drawer.js`) | `cmp-compare-product` | comptes, cartes |
| `accordion` (`compact`) | `cmp-accordion` (FAQ) | comptes, placements |
| `tabs` (panneau en cellule ou sections `Tab`) | `cmp-tabs` | prêts et lignes |
| `banner-triple` | `cmp-banner-triple` (onglets desktop / carrousel mobile) | cartes |
| `simplified-compare`, `simplified-banner` | `cmp-simplified-compare-product`, `cmp-simplified-banner-product` | prêts et lignes |
| `geo-location` | sélecteur de province | cartes |
| `table` | tableaux de données (mentions juridiques) | cartes |
| `rates-table` | `cmp-table-11-3` (taux hypothécaires) | prêts hyp. |
| `big-number` | `cmp-big-number` | placements |
| `breadcrumb` (`compact`) | fil d'Ariane | prêts hyp., cartes, prêts et lignes |
| `item-list` | `cmp-item-list` (« Tout voir ») | conseils |
| `floating-cta` (`half`, `wide`, `offset`) | `cmp-floating-container` (barre fixe sous le header) | conseils, placements, prêts hyp., prêts et lignes |

Variantes ajoutées aux blocs existants : `cards` (`features` [+ `lines`, `stacked`, `cta`, `left`], `feature`, `divided`
[+ `inset`, `text-left`, `tight`], `link-tiles`, `pale`, `illustration stacked/ruled/phone`, `icons even`), `columns`
(`link-right`, `callout`, `aside`, `media roomy`, `media pad-mobile`), `banner fade`. Bouton orange « VIP » TD = lien gras +
italique (`button accent`). La modale gère les renvois (`#renvoi-N`, `#renvoi-u<code>` pour les symboles) avec défilement,
surlignage et focus. Modèles de contenu détaillés : `import-work/SHARED-BLOCKS.md`, `SHARED-BLOCKS-W2.md`,
`SHARED-BLOCKS-ORCH.md` (non versionnés).

## Résultats (mesurés sur aem.live contre td.com)

`import-work/tools/measure-page.mjs` : sondes = premier texte de chaque titre, paragraphe, élément de liste, lien, bouton
et cellule du `<main>` TD, retrouvés par texte dans EDS ; position x / y de la première ligne, tolérance ±3 px.

| Page | Desktop 1440 | Tablette 768 | Mobile 375 |
|---|---|---|---|
| Accueil Particuliers | 105/105 | 96/97 | 97/97 |
| Comptes bancaires | 80/80 | 80/80 | 80/80 |
| Cartes de crédit | 73/80 | 76/83 | 87/92 |
| Prêts hypothécaires | 60/60 | 60/60 | 59/59 |
| Prêts et lignes de crédit | 53/53 | 53/53 | 52/52 |
| Placements personnels | 75/75 | 75/75 | 75/75 |
| Assurance | 9/9 | 9/9 | 9/9 |
| Plans de protection | 39/39 | 39/39 | 39/39 |
| Conseils | 65/65 | 65/65 | 65/65 |

Écarts restants : Cartes de crédit — artefact de mesure de −4 px en x sur « Intérêts sur les achats / avances de fonds »
(l'espace après le `<strong>` est dans le nœud texte mesuré, rendu identique), retour à la ligne 16 px plus tôt chez TD
dans la description de la 1re carte, centrage sous-pixel des icônes « Affaires / Étudiants » (−4/−5 px) ; Accueil tablette —
un paragraphe de carte décalé de 11 px. Aucune erreur console, aucune ressource 404 ; header, méga-menu, footer, modales
« Index du site » et « Mentions juridiques » vérifiés sur chaque page.

## Écarts fonctionnels assumés

| Fonction TD | Comportement EDS |
|---|---|
| Taux hypothécaires dynamiques (`POST psservice.td.com/.../getRates`, CORS limité à www.td.com) | valeurs du 28/10/2026 saisies en dur dans le bloc `rates-table` |
| Cartes produits générées par le catalogue TD (comptes, cartes) | contenu statique authorable |
| Comparateur de cartes : sélection transmise à `comparer-les-cartes` (stockage TD) | tiroir EDS fonctionnel, le bouton ouvre la page TD sans la sélection |
| Contenu par province (cookie TD) | modale de choix de province : Québec → page EDS, autres provinces → td.com |
| Liens « Ouvrir un compte » en superposition TD, `target="_blank"` | liens simples (`target` non authorable dans DA) |
| Recherche / FAQ IntelliResponse | redirection vers la recherche TD (comme l'accueil) |
| Parallaxe de la bannière Conseils | image statique |
