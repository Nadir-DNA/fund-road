
-- Create articles table for blog functionality
CREATE TABLE public.articles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL UNIQUE,
  h1 text NOT NULL,
  meta_title text NOT NULL,
  meta_desc text,
  keywords text[],
  content_md text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to published articles
CREATE POLICY "Anyone can view published articles" 
  ON public.articles 
  FOR SELECT 
  USING (published = true);

-- Create policy for admin write access (assuming is_admin function exists)
CREATE POLICY "Admins can manage articles" 
  ON public.articles 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Insert the example article
INSERT INTO public.articles (slug, h1, meta_title, meta_desc, keywords, content_md)
VALUES (
  'levee-de-fonds-startup-guide-2025',
  'Levée de fonds startup : guide 2025',
  'Levée de fonds startup : guide 2025',
  'Découvrez toutes les étapes pour réussir une levée de fonds en 2025 : préparation, investisseurs, documents et calendrier.',
  ARRAY[
    'levée de fonds startup',
    'guide levée de fonds',
    'investisseurs seed',
    'roadshow startup',
    'Fund Road'
  ],
  $$
  ### Pourquoi lever des fonds en 2025 ?

  Le contexte macroéconomique post‑2024 a rebattu les cartes : les investisseurs recherchent désormais des dossiers solides, orientés rentabilité et impact. Lever des fonds en 2025, c'est avant tout prouver que votre startup peut atteindre le **break‑even en moins de 24 mois** et générer un effet réseau défendable.

  #### 1. Préparer son dossier

  - **Business plan** avec prévisions trimestrielles sur 36 mois  
  - **KPIs** : CAC, LTV, MRR, burn rate  
  - **Cap‑table** clair et pacte d'actionnaires à jour  
  - **Data‑room** structurée (pitch deck, états financiers, contrats, IP)

  #### 2. Cibler les investisseurs

  | Phase | Ticket moyen | Interlocuteurs |
  |-------|--------------|----------------|
  | Pre‑seed | 50‑300 k€ | Business angels, fonds régionaux |
  | Seed | 300 k‑1,5 M€ | Micro‑VC, family offices |
  | Série A | 1,5‑5 M€ | VC sectoriels |

  #### 3. Construire son roadshow

  1. Liste courte (30‑40 noms)
  2. Warm intros via LinkedIn & portfolio founders
  3. One‑pager 👉 call 15 min 👉 full deck

  #### 4. Négocier la term sheet

  - Valorisation pre‑money vs. post‑money  
  - Clauses de liquidation préférentielle  
  - Ratchets & anti‑dilution

  > **Astuce** : anticipez les closing costs (avocats, audits) ≈ 3‑5 % du montant levé.

  ---

  ### FAQ express

  **Combien de temps dure une levée ?** Comptez 4‑6 mois du premier contact à la signature.  
  **Quels documents sont indispensables ?** Pitch deck, BP, cap‑table, KPIs, prévisions.

  ---

  **Prêt à passer à l'action ? [Fund Road](https://fund-road.com) accompagne plus de 300 startups : diagnostic gratuit en 30 min.**
  $$
);

-- Create additional sample articles
INSERT INTO public.articles (slug, h1, meta_title, meta_desc, keywords, content_md)
VALUES 
(
  'comment-valider-idee-startup-mvp',
  'Comment valider son idée de startup avec un MVP',
  'Valider son idée de startup avec un MVP - Guide complet',
  'Découvrez les stratégies essentielles pour tester rapidement votre concept et recueillir des retours utilisateurs précieux.',
  ARRAY['MVP', 'validation', 'startup', 'idéation', 'Fund Road'],
  $$
  ### L'importance de la validation précoce

  Valider son idée avant de se lancer dans le développement complet est crucial pour éviter les échecs coûteux.

  #### Qu'est-ce qu'un MVP ?

  Un **Minimum Viable Product** (MVP) est la version la plus simple de votre produit qui permet de :
  - Tester votre hypothèse principale
  - Recueillir des retours utilisateurs
  - Valider le marché avec un minimum d'investissement

  #### Les étapes de validation

  1. **Définir vos hypothèses** : Quels sont vos paris sur le marché ?
  2. **Créer votre MVP** : Focus sur la fonctionnalité core
  3. **Tester avec de vrais utilisateurs** : 20-30 utilisateurs suffisent
  4. **Mesurer et ajuster** : Utilisez les métriques qui comptent

  #### Méthodes de validation

  - **Landing page** : Testez l'intérêt avant de développer
  - **Prototype** : Mockups cliquables avec Figma
  - **Concierge MVP** : Service manuel avant l'automatisation
  - **Version bêta** : Produit fonctionnel mais limité

  ---

  **Besoin d'accompagnement pour valider votre idée ? [Fund Road](https://fund-road.com) vous guide étape par étape.**
  $$
),
(
  'erreurs-business-plan-startup',
  'Les erreurs à éviter dans votre Business Plan',
  'Business Plan startup : éviter les erreurs fatales',
  'Analysez les pièges les plus courants qui peuvent compromettre votre Business Plan aux yeux des investisseurs.',
  ARRAY['business plan', 'erreurs', 'investisseurs', 'startup', 'Fund Road'],
  $$
  ### Les erreurs qui tuent votre Business Plan

  Un Business Plan mal construit peut ruiner vos chances de lever des fonds, même avec une excellente idée.

  #### Erreur n°1 : Marché trop optimiste

  - **Problème** : "Le marché fait 10 milliards, on va prendre 1%"
  - **Solution** : Segmentez votre marché (TAM, SAM, SOM)

  #### Erreur n°2 : Concurrence inexistante

  - **Problème** : "Nous n'avons pas de concurrents"
  - **Solution** : Analysez les concurrents directs ET indirects

  #### Erreur n°3 : Projections financières irréalistes

  - **Problème** : Croissance exponentielle sans justification
  - **Solution** : Basez vos prévisions sur des benchmarks sectoriels

  #### Erreur n°4 : Équipe incomplète

  - **Problème** : Présenter une équipe sans compétences techniques/commerciales
  - **Solution** : Identifiez vos gaps et votre plan de recrutement

  #### La structure gagnante

  1. **Executive Summary** (1 page max)
  2. **Problème & Solution**
  3. **Marché & Concurrence**
  4. **Modèle économique**
  5. **Plan marketing & commercial**
  6. **Équipe**
  7. **Projections financières**
  8. **Besoins de financement**

  ---

  **Votre Business Plan est-il prêt ? [Fund Road](https://fund-road.com) vous aide à le peaufiner.**
  $$
);
