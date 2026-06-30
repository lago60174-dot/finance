# Caisse — suivi financier (V1, sans IA)

App perso de suivi de dépenses/revenus, avec séparation Personnel / Habynex.
Next.js 14 (App Router) + Supabase + Tailwind + Recharts.

## 1. Créer le projet Supabase

1. Va sur https://supabase.com → New project.
2. Une fois créé, ouvre **SQL Editor** → New query.
3. Colle le contenu de `supabase/schema.sql` et exécute (Run). Ça crée la table
   `transactions` + les policies RLS (chaque utilisateur ne voit que ses
   propres données).
3bis. Fais de même, **dans l'ordre**, avec :
   - `supabase/002_recurring.sql` (transactions récurrentes)
   - `supabase/003_debts.sql` (dettes + paiements)
   - `supabase/004_subscriptions.sql` (extension abonnements)
   - `supabase/005_goals.sql` (objectifs d'épargne / achats planifiés)
4. Va dans **Project Settings → API**, récupère :
   - `Project URL`
   - `anon public` key

## 2. Configurer le projet local

```bash
cp .env.local.example .env.local
```

Remplis `.env.local` avec les deux valeurs récupérées à l'étape 1.

## 3. Installer et lancer

```bash
npm install
npm run dev
```

Ouvre http://localhost:3000 — tu seras redirigé vers `/login`.
Inscris-toi avec un email + mot de passe (la confirmation email est activée
par défaut sur Supabase ; tu peux la désactiver dans **Authentication →
Providers → Email → "Confirm email"** pour aller plus vite en dev).

## 4. Utilisation

- **+ Ajouter** (bouton flottant au centre de la navbar) → formulaire
  dépense/revenu, avec choix du compte (Personnel / Habynex).
- **✎ sur une ligne de l'historique** → modifier une transaction existante.
- **Récurrentes** → règles qui s'enregistrent automatiquement chaque mois
  (loyer, salaire). Génération au prochain chargement du dashboard après le
  jour prévu — pas de cron, c'est volontairement simple.
- **Abonnements** → vue spécialisée des récurrentes (Netflix, Canva...),
  avec coût total mensuel affiché en un coup d'œil.
- **Dettes** → plan de remboursement, % remboursé, courbe d'évolution du
  solde, projection de date de fin, et conseil de priorisation
  (avalanche/boule de neige) selon tes dettes actives.
- **Objectifs & achats planifiés** → épargne ciblée avec date, calcul
  automatique du montant mensuel à mettre de côté pour l'atteindre à temps.
- **Conseils** → page d'analyse basée sur des règles (pas d'IA) : catégorie
  dominante, projection de découvert, jour de la semaine où tu dépenses le
  plus, comparaison au mois précédent, priorisation des dettes, poids des
  abonnements. Un teaser du conseil le plus pertinent apparaît sur le
  dashboard.
- **Gamification** → badges (régularité du suivi, épargne, dettes
  effacées...), niveau global, et un message d'encouragement contextuel sur
  le dashboard quand ta dynamique est positive.
- **Historique** → filtres par type / catégorie / période, export CSV ou PDF
  de la liste filtrée.
- **Tableau de bord** → solde disponible, revenus/dépenses du mois, taux
  d'épargne, graphique de répartition par catégorie, graphique hebdomadaire.
- Le **toggle Personnel / Habynex** en haut filtre tout (dashboard,
  historique, récurrentes, dettes, objectifs, conseils) — les deux comptes
  sont totalement séparés.
- Le bouton **Plus** dans la navbar regroupe Récurrentes, Abonnements,
  Dettes, Objectifs et Conseils.

## 5. Installer comme app mobile (PWA)

L'app est installable sur téléphone, avec icône, navbar mobile en bas, et
un minimum de fonctionnement hors-ligne :

- **Android (Chrome)** : ouvre le site → menu ⋮ → "Installer l'application"
  (ou un bandeau d'installation apparaît automatiquement).
- **iPhone (Safari)** : ouvre le site → bouton Partager → "Sur l'écran
  d'accueil".

⚠️ L'installation et le service worker nécessitent **HTTPS** (Vercel le
fournit automatiquement) ou `localhost` en dev — ça ne fonctionnera pas sur
une IP locale en `http://`.

Ce qui est géré pour les connexions faibles :
- Un service worker (`public/sw.js`) mémorise les pages déjà visitées et les
  icônes, pour un chargement quasi instantané au retour sur l'app.
- Une page hors-ligne de secours s'affiche si une page jamais visitée est
  ouverte sans connexion.
- Une bannière discrète prévient quand le téléphone est hors-ligne.
- Les données (Supabase) ne sont **jamais** servies depuis le cache — tu as
  toujours des montants à jour quand tu as du réseau, jamais de chiffres
  périmés silencieusement.

## 6. Déploiement (Vercel)

```bash
npm i -g vercel
vercel
```

Ajoute les deux variables d'environnement (`NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`) dans les Project Settings de Vercel, puis
redeploy.

## 7. Pistes d'évolution (plus tard, pas maintenant)

- Saisie en langage naturel ("J'ai payé 2500 FCFA pour un taxi") → un seul
  appel à l'API Claude qui retourne du JSON structuré, branché sur le même
  formulaire d'insertion.
- Conseiller IA conversationnel (en plus du moteur de règles déjà en place)
  pour répondre à des questions ouvertes type "Puis-je me permettre
  d'acheter un ordinateur à 600 000 FCFA ?".
- Import automatique de relevés bancaires (CSV).
- Rappels de factures / notifications avant échéance d'un abonnement ou
  d'une récurrente.

Ne touche à rien de tout ça avant d'avoir utilisé la V1 toi-même pendant au
moins 2-3 semaines.
