import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  meta_description: string | null;
  keywords: string[] | null;
  body_md: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  priority: number;
  lang: string;
  og_image_url: string | null;
}

export const useBlogArticles = () => {
  return useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      console.log('Fetching blog articles...');
      
      const { data, error } = await supabase
        .from('article_translations')
        .select(`
          id,
          article_id,
          title,
          slug,
          meta_description,
          keywords,
          body_md,
          lang,
          status,
          created_at,
          updated_at,
          articles!inner (
            is_published,
            priority,
            og_image_url,
            created_at,
            updated_at
          )
        `)
        .eq('articles.is_published', true)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }

      console.log('Fetched articles:', data?.length || 0);
      
      // Transform data to match BlogArticle interface
      const transformedData = data?.map(item => ({
        id: item.article_id,
        slug: item.slug,
        title: item.title,
        meta_description: item.meta_description,
        keywords: item.keywords,
        body_md: item.body_md,
        is_published: (item.articles as any).is_published,
        created_at: (item.articles as any).created_at,
        updated_at: (item.articles as any).updated_at,
        priority: (item.articles as any).priority,
        lang: item.lang,
        og_image_url: (item.articles as any).og_image_url
      })) || [];

      return transformedData as BlogArticle[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useBlogArticle = (slug: string) => {
  return useQuery({
    queryKey: ['blog-article', slug],
    queryFn: async () => {
      console.log('Fetching blog article:', slug);
      
      const { data, error } = await supabase
        .from('article_translations')
        .select(`
          id,
          article_id,
          title,
          slug,
          meta_description,
          keywords,
          body_md,
          lang,
          status,
          created_at,
          updated_at,
          articles!inner (
            is_published,
            priority,
            og_image_url,
            created_at,
            updated_at
          )
        `)
        .eq('slug', slug)
        .eq('articles.is_published', true)
        .eq('status', 'published')
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        throw error;
      }

      console.log('Fetched article:', data?.title);
      
      // Transform data to match BlogArticle interface
      const transformedData = {
        id: data.article_id,
        slug: data.slug,
        title: data.title,
        meta_description: data.meta_description,
        keywords: data.keywords,
        body_md: data.body_md,
        is_published: (data.articles as any).is_published,
        created_at: (data.articles as any).created_at,
        updated_at: (data.articles as any).updated_at,
        priority: (data.articles as any).priority,
        lang: data.lang,
        og_image_url: (data.articles as any).og_image_url
      };

      return transformedData as BlogArticle;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!slug,
  });
};