
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BlogArticle {
  id: string;
  slug: string;
  h1: string;
  meta_title: string;
  meta_desc: string | null;
  keywords: string[] | null;
  content_md: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export const useBlogArticles = () => {
  return useQuery({
    queryKey: ['blog-articles'],
    queryFn: async () => {
      console.log('Fetching blog articles...');
      
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching articles:', error);
        throw error;
      }

      console.log('Fetched articles:', data?.length || 0);
      return data as BlogArticle[];
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
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('published', true)
        .single();

      if (error) {
        console.error('Error fetching article:', error);
        throw error;
      }

      console.log('Fetched article:', data?.h1);
      return data as BlogArticle;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!slug,
  });
};
