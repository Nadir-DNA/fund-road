import BlogArticle from '@/pages/BlogArticle';
import { GetServerSideProps } from 'next';

export default BlogArticle;

// For now, we'll use SSR to get the slug. In Phase 2, we'll implement proper SSG
export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  return {
    props: {
      slug: params?.slug || null,
    },
  };
};