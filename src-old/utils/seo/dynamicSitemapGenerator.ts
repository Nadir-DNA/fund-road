import { supabase } from "@/integrations/supabase/client";
import { generateSitemap } from "./sitemapGenerator";

interface BlogPost {
  slug: string;
  created_at: string;
  updated_at?: string;
}

// Fonction pour récupérer tous les articles de blog et générer le sitemap
export const generateDynamicSitemap = async (): Promise<string> => {
  try {
    // Récupérer les articles de blog depuis Supabase
    const { data: articles, error } = await supabase
      .from('articles')
      .select('slug, created_at, updated_at')
      .eq('published', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des articles:', error);
      // Générer le sitemap sans les articles si erreur
      return await generateSitemap();
    }

    // Générer le sitemap complet avec les articles
    return await generateSitemap(articles || []);
  } catch (error) {
    console.error('Erreur lors de la génération du sitemap dynamique:', error);
    // Fallback: générer le sitemap de base
    return await generateSitemap();
  }
};

// Fonction pour mettre à jour le sitemap (à appeler lors de la publication d'articles)
export const updateSitemap = async (): Promise<boolean> => {
  try {
    const sitemapContent = await generateDynamicSitemap();
    
    // Dans un environnement de production, vous pourriez vouloir :
    // 1. Sauvegarder le sitemap dans un fichier statique
    // 2. L'envoyer à un CDN
    // 3. Notifier les moteurs de recherche de la mise à jour
    
    console.log('Sitemap généré avec succès');
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du sitemap:', error);
    return false;
  }
};

// Hook React pour générer et exposer le sitemap
export const useSitemap = () => {
  const generateAndExposeSitemap = async () => {
    const sitemapContent = await generateDynamicSitemap();
    
    // Créer un blob et une URL pour télécharger le sitemap
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement temporaire
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer l'URL temporaire
    URL.revokeObjectURL(url);
  };

  return { generateAndExposeSitemap };
};