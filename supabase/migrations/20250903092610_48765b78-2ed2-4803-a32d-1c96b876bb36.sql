-- Migration pour blog bilingue FR/EN

-- Sauvegarder les articles existants
CREATE TABLE articles_backup AS SELECT * FROM articles;

-- Supprimer l'ancienne table articles (après sauvegarde)
DROP TABLE IF EXISTS articles CASCADE;

-- Créer la nouvelle table articles (base)
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug_base TEXT UNIQUE NOT NULL,
  is_published BOOLEAN DEFAULT false,
  og_image_url TEXT,
  priority NUMERIC DEFAULT 0.5,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Créer la table des traductions
CREATE TABLE public.article_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  lang TEXT NOT NULL CHECK (lang IN ('fr', 'en')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  meta_description TEXT,
  keywords TEXT[],
  body_md TEXT NOT NULL,
  json_ld JSONB,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(article_id, lang),
  UNIQUE(lang, slug)
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_article_translations_lang_status ON article_translations(lang, status);
CREATE INDEX idx_article_translations_published ON article_translations(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_article_translations_keywords ON article_translations USING GIN(keywords);

-- Vue pour le sitemap
CREATE OR REPLACE VIEW public.v_blog_sitemap AS
SELECT 
  t.lang,
  CASE 
    WHEN t.lang = 'fr' THEN 'https://fund-road.com/fr/blog/' || t.slug
    ELSE 'https://fund-road.com/en/blog/' || t.slug
  END as loc,
  GREATEST(a.updated_at, t.updated_at) as lastmod,
  a.priority,
  t.slug,
  t.title
FROM public.articles a
JOIN public.article_translations t ON a.id = t.article_id
WHERE a.is_published = true 
AND t.status = 'published';

-- Fonction pour auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour auto-update
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_article_translations_updated_at BEFORE UPDATE ON article_translations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_translations ENABLE ROW LEVEL SECURITY;

-- Policies pour articles
CREATE POLICY "Anyone can view published articles" ON public.articles
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage articles" ON public.articles
  FOR ALL USING (is_admin(auth.uid()));

-- Policies pour article_translations  
CREATE POLICY "Anyone can view published translations" ON public.article_translations
  FOR SELECT USING (
    status = 'published' AND 
    EXISTS (SELECT 1 FROM public.articles WHERE id = article_id AND is_published = true)
  );

CREATE POLICY "Admins can manage translations" ON public.article_translations
  FOR ALL USING (is_admin(auth.uid()));

-- Migrer les données existantes (si elles existent)
INSERT INTO public.articles (id, slug_base, is_published, created_at, updated_at)
SELECT 
  id,
  slug as slug_base,
  published as is_published,
  created_at,
  updated_at
FROM articles_backup;

INSERT INTO public.article_translations (article_id, lang, title, slug, meta_description, keywords, body_md, status, published_at, created_at, updated_at)
SELECT 
  id as article_id,
  'fr' as lang,
  h1 as title,
  slug,
  meta_desc as meta_description,
  keywords,
  content_md as body_md,
  CASE WHEN published THEN 'published' ELSE 'draft' END as status,
  CASE WHEN published THEN created_at ELSE NULL END as published_at,
  created_at,
  updated_at
FROM articles_backup;