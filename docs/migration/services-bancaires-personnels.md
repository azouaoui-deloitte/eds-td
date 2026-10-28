# Analyse de migration — TD « Services bancaires personnels » vers AEM Edge Delivery Services

- **Source** : https://www.td.com/ca/fr/services-bancaires-personnels
- **Cible** : https://main--eds-td--azouaoui-deloitte.aem.live/ (et `/ca/fr/services-bancaires-personnels`)
- **Content source** : Document Authoring (DA) — `https://da.live/#/azouaoui-deloitte/eds-td`
- **Méthode** : workflow Adobe `page-import` (scrape → identify-page-structure → authoring-analysis → generate-import-html → preview-import) puis `content-driven-development` / `building-blocks` pour le code, selon le *David's Model* (minimiser les blocs, privilégier le contenu par défaut).

Toutes les preuves (captures, DOM, styles calculés) sont dans `import-work/` (non versionné) :
`shots/` (pleine page + états interactifs par viewport), `styles-{desktop,tablet,mobile}.txt`, `nav.json`, `header.html`, `footer.html`, `metadata.json`.

## 1. Système de design source

| Élément | Valeur relevée |
|---|---|
| Breakpoints | 768 px (tablette), 1024 px (desktop), 1200 px (large) |
| Grille | conteneur 1200 px, gouttière 15 px → contenu 1170 px |
| Police texte | `TD Graphik SemiLight` 15 px / 23 px, `#1c1c1c` |
| Police emphase | `TD Graphik Medium` (titres, liens, boutons) |
| Police affichage | `TD Display Bold` (bandeau « Axé sur le numérique ») |
| Titres | H1 26/34 `#1a5336`, H2 22/31 `#1a5336` (−0.5 px), H3 18/28 `#1c1c1c` |
| Verts | `#008a00` (fond bouton, barre segment), `#038203` (liens), `#1a5336` (titres), `#2fbf00` (marque) |
| Fonds de section | `#f6faf0` (vert pâle), `#f9fcf4` (vert très pâle), `#f9f9f9` (gris) |
| Bouton principal | fond `#008a00`, bordure 2 px, TD Graphik Medium 16/24, padding 7 px |
| Bouton secondaire | contour 2 px `#008a00`, texte `#038203` |
| Lien d'action | TD Graphik Medium, `#038203`, chevron `›` à droite |
| Icônes | police d'icônes TD (`td-icon-*`, ~60 glyphes) → convertie en SVG dans `/icons` |

Décision : polices TD Graphik / TD Display et police d'icônes copiées dans le repo (choix validé par le client : POC interne).

## 2. Structure de la page (21 sections → 18 sections EDS)

| # | Section source | Décision d'authoring | Bloc / contenu |
|---|---|---|---|
| 0 | Bannière « Un coup de pouce… » (image fond + carré vert + texte + CTA) + panneau de connexion BanqueNet / CourtierWeb | Bloc (layout complexe + panneau masqué < 1024 px) | `hero (td)` + `login` dans une section `hero-login` |
| 1 | H1 « Bienvenue aux services bancaires personnels TD » | Contenu par défaut | — |
| 2 | H2 + 9 liens produits avec icône ronde + description | Bloc (grille répétée) | `cards (icons)` |
| 3 | Bandeau vert « Axé sur le numérique » (4 images responsive, TD Display) | Bloc | `banner` |
| 4 | Filet épais + teaser « Besoin d'aide… » (texte + illustration) | Bloc | `columns (teaser)` + style section `thick-divider` |
| 5 | Section vert pâle : H2 + image + texte + CTA | Contenu par défaut + bloc | style `light-green` + `columns (media)` |
| 6 | « Conseils TD… » H2 + texte + CTA centrés | Contenu par défaut | style `centered` |
| 7–8 | H2 + 3 cartes (image, titre, texte, bouton contour) — carrousel en mobile | Bloc | `cards (teaser)` |
| 9–10 | Filet + « Protégez-vous… » H2 + texte + 2 cartes grises | Contenu par défaut + bloc | style `divider` + `cards (grey)` |
| 11 | Teaser « Planification successorale » | Bloc | `columns (teaser)` |
| 12–13 | Filet + « Vérifiez votre santé financière » centré | Contenu par défaut | styles `divider centered` |
| 14–15 | Filet + H2 + 2 cartes illustration centrées | Bloc | `cards (illustration)` |
| 16 | Section vert très pâle « Nos dernières nouvelles » : 3 cartes blanches texte + 2 cartes horizontales image | Contenu par défaut + 2 blocs | style `pale-green` + `cards (white)` + `cards (horizontal)` |
| 17 | Teaser « Pourquoi faire affaire avec la TD » | Bloc | `columns (teaser)` |
| 18–19 | Filet + « Découvrez comment la TD enrichit la vie » : 4 tuiles image + titre lien + texte (carrousel mobile) | Bloc | style `divider` + `cards (tiles)` |
| 20 | « Une question? Trouvez la réponse » : champ + bouton + lien | Bloc (formulaire) | `faq-search` |

Métadonnées : `title` et `description` source conservés (diffèrent du H1 / premier paragraphe), `og:image` = vignette sociale TD, `template` source noté pour info.

## 3. Header (fragment `/nav`) — états interactifs relevés

**Desktop ≥ 1024 px** (`shots/desktop-header.png`, `desktop-nav-0..6.png`, `desktop-util-*.png`)
- Barre segments verte 25 px : Particuliers (actif, Medium), Petite entreprise, Commercial, Placements, Gestion de Placements TD, À propos de la TD.
- Barre principale 70 px : logo TD → utilitaires icônes (Rechercher, Nous trouver, Aide), dropdown **Canada** (drapeaux CA / US + coche), dropdown **Français** (English / Français ✓), dropdown **Démarrez** sur fond `#f6faf0` (BanqueNet, CourtierWeb, Services bancaires (États-Unis), Mes comptes).
- Recherche : clic loupe → champ pleine largeur dans la barre (+ bouton fermer ✕), Entrée → page résultats TD.
- Méga-menu 7 onglets (icône dans la version mobile, chevron ↓/↑, soulignement vert 6 px de l'onglet actif) : Comptes, Cartes de crédit, Prêts hypothécaires, Prêts et lignes de crédit TD, Placements personnels, Assurance, Conseils. Chaque panneau : bouton « Fermer ✕ », 3–4 colonnes (titre H3 + liens, certains avec icône ou en lien d'action ›), bandeau gris de 2–3 promos (image 90 px + titre + texte + lien ›). Voile gris sur la page, fermeture par Échap / clic extérieur / re-clic.

**Tablette / mobile < 1024 px** (`*-menu-open.png`, `*-menu-level2.png`, `*-login-open.png`)
- Barre 56 px : hamburger, logo, « Démarrez » (icône profil) à droite.
- Tiroir plein écran : ✕ + logo, champ Rechercher, accordéon « TD: Particuliers » (segments), 7 onglets avec icône + chevron › → niveau 2 avec « ‹ Retour », libellé, colonnes en accordéons (première ouverte), puis Nous trouver / Aide, accordéons « pays: Canada » et « Langue: Français ».
- « Démarrez » ouvre un tiroir avec les 4 liens de connexion.

Modèle d'authoring : document `/nav` (sections : segments, logo, utilitaires avec sous-listes, onglets) ; chaque panneau du méga-menu est un fragment `/fragments/nav/<onglet>` (colonnes = H3 + liste, promos = bloc `cards (promo)`), éditable indépendamment.

## 4. Footer (fragment `/footer`)

- Liens rapides Nous trouver / Aide (icônes) + bouton contour « Haut de page ».
- « Contactez-nous » (Appelez-nous, Prendre rendez-vous, Donnez des commentaires, avec icônes) + 4 colonnes (Produits, Services bancaires, Conseils bancaires, À propos de la TD) — **accordéons < 768 px**.
- Liens légaux verts (8), adresse Tour TD, image fauteuil.
- Réseaux sociaux (X, Facebook, Instagram, YouTube, LinkedIn), badges SADC et OCRI (liens).
- Mentions SADC / OCRI avec liens d'action.
- « Index du site » → **modale** (fragment `/fragments/index-du-site`, 6 groupes, 89 liens).

## 5. Assets

- 27 images de contenu + 13 promos méga-menu + 4 images footer + logos (desktop 90×96, mobile 68×60) + drapeaux.
- Images de fond converties en vraies images authorables (bannière principale, bandeau « Axé sur le numérique » 4 rendus).
- SVG d'illustration TD rasterisés par le scrape → réutilisation des SVG originaux.
- ~60 icônes `td-icon-*` extraites de la police en SVG.

## 6. Liens (hrefs)

- 200+ liens relevés (page, header, footer, modale). Liens relatifs TD (`/ca/fr/...`) réécrits en absolus `https://www.td.com/...` (pages non migrées), sauf la page migrée elle-même et le logo qui pointent vers EDS.
- Liens externes conservés (banquenet.td.com, courtierweb.td.com, discovery.td.com, apps.td.com, card-selector.td.com, réseaux sociaux, sadc.ca, ocri.ca).
- `target="_blank"` conservé pour réseaux sociaux, badges et PDF.

## 7. Écarts fonctionnels assumés (dépendances backend TD)

| Fonction source | Raison | Comportement EDS |
|---|---|---|
| Suggestions de recherche et réponses FAQ inline (IntelliResponse `td.intelliresponse.com`) | API en liste blanche d'origine (HTTP 403 hors td.com) | Recherche et FAQ redirigent vers `https://www.td.com/ca/fr/services-bancaires-personnels/recherche?query=…` |
| « Questions courantes » (popup) | même API | lien vers le Centre d'assistance TD |
| « Gérer l'expérience en ligne » | dépend de OneTrust (non installé) | lien vers la page Confidentialité TD |
| État authentifié (Mes comptes / Fermer la session) | cookie de session TD | non migré (état non connecté uniquement) |
| Bannière d'urgence (`/api/ems-service`) | API TD | non migrée |
| Analytics (Ensighten, Adobe DTM, GTM) | hors périmètre POC | non migrés |

## 8. Résultats (mesurés sur aem.live contre td.com)

Mesure automatisée (`import-work/tools/measure.mjs`) de la position (x, y, largeur, hauteur) de 55 à 59 repères textuels (titres, paragraphes, boutons, liens du header et du footer) :

| Viewport | Repères à ±3 px | Écart max |
|---|---|---|
| Desktop 1440 | 59 / 59 | 0 px |
| Tablette 768 | 51 / 55 | 7 px (bas du footer, formulaire FAQ) |
| Mobile 375 | 55 / 55 | 0 px |

Captures comparatives côte à côte (pleine page et états ouverts) : `import-work/compare/`. Aucune erreur console, aucune ressource en erreur.

Blocs livrés : `hero`, `login`, `cards` (icons, teaser, grey, illustration, white, horizontal, tiles, promo), `columns` (teaser, media), `banner`, `faq-search`, `header`, `footer`, `modal`. Contenu DA : page, `index`, `nav`, `footer`, 7 fragments `/fragments/nav/*`, `/modals/index-du-site`, 40 médias sous `/media/td/`.

## 9. Critères d'acceptation

1. Les 21 sections source sont présentes, dans l'ordre, sans texte tronqué.
2. Header et footer identiques visuellement à 1440, 768 et 375 px, états ouverts compris (méga-menu, dropdowns, tiroir mobile niveaux 1 et 2, accordéons footer, modale index du site).
3. Tous les hrefs pointent vers la même destination que la source.
4. Toutes les images se chargent (aucune 404), responsive.
5. Navigation clavier : Échap ferme les panneaux, focus visible, `aria-expanded` à jour.
6. `npm run lint` passe ; aucune erreur console.
7. Page publiée sur `aem.live`.
