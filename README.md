# Vwè Sa — site d'actualité caribéenne mis à jour chaque jour

Chaque matin à 6 h (heure des Antilles), un robot :

1. lit les **flux RSS** de médias et d'institutions de la Caraïbe (titres et courts résumés publics) ;
2. demande à **Claude** de choisir les sujets du jour et d'écrire, pour chacun, un **résumé original** qui renvoie vers la source ;
3. reconstruit le site (illustrations originales, filtres par île, pages d'articles) ;
4. vous **propose l'édition à relire** : vous validez en un clic, et le site est mis en ligne.

Tout tourne gratuitement sur **GitHub** (hébergement et robot). Seule l'utilisation de Claude (API d'Anthropic) est payante, à l'usage.

---

## ⚠️ Le site ne s'affiche pas ?

Vérifiez ces trois points, dans l'ordre :
1. **Sur la page d'accueil de votre dépôt, vous devez voir directement** `config.yaml`, `docs`, `scripts`, `templates`, `index.html`… S'il n'y a qu'un dossier `vwesa`, supprimez le dépôt (*Settings → General*, tout en bas → *Delete this repository*) et recommencez en déposant le **contenu** du zip.
2. **Le dépôt doit être public** (*Settings → General*, tout en bas → *Change visibility*).
3. ***Settings → Pages*** : *Deploy from a branch*, branche **main**. Le dossier peut être **/docs** ou **/ (root)** : les deux fonctionnent. Attendez 2 à 5 minutes, puis rechargez l'adresse affichée en haut de cette page.

## 1. Ce qu'il vous faut

- Un **compte GitHub** gratuit : <https://github.com/signup>
- Une **clé API Anthropic** : créez un compte sur <https://console.anthropic.com>, ajoutez un moyen de paiement, puis *API Keys → Create Key*. Gardez la clé secrète. Les tarifs sont sur <https://www.anthropic.com/pricing>. Conseil : fixez une limite de dépense mensuelle dans la console.

## 2. Installation (une seule fois, environ 15 minutes)

1. **Créez un dépôt** sur GitHub : bouton **New repository**, nom `vwesa`, visibilité **Public** (nécessaire pour l'hébergement gratuit), puis **Create repository**.
2. **Déposez les fichiers** : sur la page du dépôt, *Add file → Upload files*, glissez **tout le contenu** de ce dossier (y compris le dossier caché `.github`), puis **Commit changes**.
   *Si le dossier `.github` ne passe pas par glisser-déposer, créez le fichier à la main : Add file → Create new file, nommez-le `.github/workflows/mise-a-jour.yml` et collez son contenu. Faites de même pour `regenerer.yml`.*
3. **Remplissez `config.yaml`** (cliquez dessus, puis sur le crayon ✏️) : nom du site, adresse de contact, et **toutes les mentions légales**. Enregistrez avec **Commit changes**.
4. **Ajoutez votre clé API** : *Settings → Secrets and variables → Actions → New repository secret*. Nom : `ANTHROPIC_API_KEY`. Valeur : votre clé. **Add secret**.
5. **Autorisez le robot à écrire** : *Settings → Actions → General → Workflow permissions* : cochez **Read and write permissions** et **Allow GitHub Actions to create and approve pull requests**. **Save**.
6. **Mettez le site en ligne** : *Settings → Pages* : Source **Deploy from a branch**, branche **main**, dossier **/docs**. **Save**. Après une minute, l'adresse du site s'affiche en haut de la page (du type `https://votre-pseudo.github.io/vwesa/`). Reportez-la dans `config.yaml` (champ `url`).
7. **Premier essai** : *Actions → Mise à jour quotidienne de Vwè Sa → Run workflow*. Au bout de quelques minutes, une proposition d'édition apparaît dans l'onglet **Pull requests**.

## 3. Chaque matin : relire et publier (2 minutes)

1. Ouvrez l'onglet **Pull requests** → « 📰 Édition du jour à relire ».
2. Onglet **Files changed** → fichier `data/articles.json` : lisez les nouveaux articles (en haut du fichier).
3. Un article ne vous convient pas ? Cliquez sur **…** → *Edit file*, supprimez son bloc `{ ... }` ou corrigez le texte, puis enregistrez.
4. Cliquez sur **Merge pull request** → **Confirm merge**. Le site est à jour dans la minute.

Si vous ne validez pas, rien n'est publié : l'édition suivante remplacera la proposition.

### Publication sans relecture (déconseillé)
*Settings → Secrets and variables → Actions → onglet Variables → New repository variable* : nom `PUBLICATION_AUTO`, valeur `oui`. Le robot publiera alors directement. Lisez la section « Cadre légal » avant de l'activer : **vous restez responsable de tout ce qui est publié.**

## Photos d'illustration

Le robot cherche pour chaque article une **photo libre de droits** :
- sur **Wikimedia Commons** (aucune inscription nécessaire) : seules les photos sous licence Creative Commons autorisant la réutilisation (CC0, CC BY, CC BY-SA) ou du domaine public sont retenues ;
- sur **Pexels**, si vous ajoutez une clé gratuite : créez un compte sur <https://www.pexels.com/fr-fr/api/>, puis ajoutez le secret `PEXELS_API_KEY` (même méthode que pour la clé Anthropic).

Précautions intégrées :
- la photo montre un **lieu, un paysage ou un objet**, jamais une personne : le robot écarte les images dont la description évoque des personnes, et Claude ne propose que des recherches de lieux ou d'objets ;
- **pas de photo pour les faits divers, la justice ou les accidents** : une photo réelle pourrait laisser croire qu'elle montre les vraies personnes ou les vrais faits. Ces articles gardent une illustration dessinée ;
- chaque photo porte la mention « Photo d'illustration », avec son **auteur, sa licence et un lien vers l'original**, comme l'exigent les licences Creative Commons. Un bloc « Crédits photos » récapitule le tout en bas de l'accueil ;
- les photos sont **copiées sur votre site** : vos lecteurs ne sont jamais connectés à un site tiers (RGPD).

Lors de votre relecture, jetez un œil aux photos (dossier `docs/img` dans la proposition d'édition). Si l'une montre malgré tout une personne reconnaissable, supprimez-la : l'article reprendra son illustration dessinée.

## 4. Personnaliser

Tout se règle dans `config.yaml` :
- **`flux`** : ajoutez ou retirez des sources (nom + adresse du flux RSS). Les adresses marquées « à vérifier » doivent être testées : ouvrez-les dans un navigateur, vous devez voir du texte structuré (XML).
- **`articles_par_jour`**, **`fenetre_heures`**, **`jours_archives`** : volume et fraîcheur de l'édition.
- **`modele`** : le modèle Claude utilisé. La liste à jour est sur <https://docs.claude.com>.

Pour changer l'heure de mise à jour, modifiez la ligne `cron` dans `.github/workflows/mise-a-jour.yml` (heure en UTC : 10 h UTC = 6 h aux Antilles).

## 5. Cadre légal : ce que fait le système pour vous protéger

> Ce guide n'est pas un avis juridique. Avant de monétiser le site (publicité, abonnements) ou de le faire grandir, faites-le relire par un avocat en droit de la presse.

**Droit d'auteur et droit voisin des éditeurs de presse** (Code de la propriété intellectuelle, art. L218-1 et suivants). Reproduire les articles d'un média sans autorisation est interdit, en dehors des liens et de « très courts extraits ». Les *faits*, eux, ne sont protégés par personne. Le système :
- ne lit que le titre et le court résumé que chaque média diffuse lui-même dans son flux RSS ;
- n'en republie jamais le texte : Claude écrit un résumé **avec ses propres mots**, sans longue citation (un contrôle automatique rejette toute citation de plus de 15 mots) ;
- **cite et lie systématiquement la source** de chaque article ;
- n'utilise **aucune photo** des médias : toutes les illustrations sont des créations originales.

**Conditions d'utilisation des médias.** Certains médias interdisent toute réutilisation automatisée de leurs contenus. Avant d'ajouter un flux, lisez les CGU du site. Le robot respecte automatiquement le fichier `robots.txt` de chaque site. Bonne pratique : écrivez aux médias que vous citez pour les informer de votre revue de presse. Si l'un d'eux refuse, retirez-le de `config.yaml`. Les flux institutionnels (préfectures, collectivités) sont les plus sûrs.

**Responsabilité éditoriale** (loi du 29 juillet 1881 sur la liberté de la presse). En tant que directeur de la publication, vous répondez pénalement de ce qui est publié : diffamation, injure, fausses nouvelles, atteinte à la présomption d'innocence. C'est pourquoi :
- **la relecture humaine est activée par défaut** ;
- la charte donnée à Claude lui interdit d'inventer, impose le conditionnel et la présomption d'innocence, interdit de nommer les victimes, témoins ou suspects qui sont de simples particuliers, ainsi que les mineurs, et écarte rumeurs et vie privée ;
- chaque article comporte un lien « Signalez une erreur ». Traitez ces demandes vite : c'est aussi votre protection.

**Mentions légales obligatoires** (loi LCEN du 21 juin 2004, art. 6). Un site doit indiquer son éditeur, son directeur de la publication et son hébergeur. Le défaut de mentions est un délit. La page `mentions-legales.html` est générée à partir de `config.yaml` : remplissez tous les champs. Si vous publiez à titre non professionnel, la loi vous permet de rester anonyme en ne mentionnant que l'hébergeur, à condition que celui-ci dispose de votre identité.

**Transparence sur l'intelligence artificielle** (règlement européen sur l'IA, art. 50). Les textes générés par IA et publiés pour informer le public doivent être signalés, sauf s'ils ont fait l'objet d'une relecture humaine sous responsabilité éditoriale. Le site fait les deux : chaque article porte la mention « rédigé avec l'aide d'une IA », et la relecture est activée par défaut.

**Données personnelles (RGPD).** Le site ne dépose aucun cookie de suivi, n'utilise aucun outil de statistiques et ne charge **aucune police ni script externe** : aucune donnée de vos lecteurs n'est transmise à des tiers. Si vous ajoutez des statistiques ou de la publicité, il faudra un bandeau de consentement.

## 6. En cas de problème

- **Le robot échoue** : onglet *Actions*, cliquez sur l'exécution en rouge pour lire le message. Les causes fréquentes : clé API absente ou sans crédit, permissions de l'étape 5 non cochées.
- **Un flux ne donne rien** : son adresse a peut-être changé. Le journal d'exécution affiche « flux indisponible » ; remplacez l'adresse dans `config.yaml`.
- **Retirer un article déjà publié** : supprimez son bloc dans `data/articles.json` et enregistrez. Le site se régénère tout seul en une minute.
- **Tester sur votre ordinateur** : `pip install -r requirements.txt`, puis `python scripts/update.py --rebuild` pour reconstruire le site sans appeler Claude, ou `ANTHROPIC_API_KEY=... python scripts/update.py` pour une vraie mise à jour. Ouvrez ensuite `docs/index.html`.

## Contenu du dossier

```
config.yaml                  ← vos réglages (à remplir)
scripts/update.py            ← le robot
templates/index.html         ← la mise en page du site
templates/scenes.js          ← les illustrations originales
templates/mentions-legales.html
data/articles.json           ← les articles (édition actuelle + archives)
docs/                        ← le site généré, publié par GitHub Pages
.github/workflows/           ← la planification quotidienne
```
