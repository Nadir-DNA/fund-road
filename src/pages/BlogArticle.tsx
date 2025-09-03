
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBlogArticle } from "@/hooks/useBlogArticles";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { InternalLinks } from '@/components/seo/InternalLinks';
import { createArticleSchema } from '@/components/seo/StructuredData';

export default function BlogArticle() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading, error } = useBlogArticle(slug || '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-4"></div>
            <div className="h-4 bg-white/10 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded"></div>
              <div className="h-4 bg-white/10 rounded w-3/4"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <p className="text-white/70 mb-8">Cet article n'existe pas ou n'est plus disponible.</p>
          <Button asChild variant="outline">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au blog
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const readingTime = Math.ceil(article.body_md.length / 1000);
  const publishDate = new Date(article.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const articleSchema = createArticleSchema(
    article.title,
    article.meta_description || article.title,
    article.created_at,
    article.updated_at,
    `https://fundroad.com/og-blog-${article.slug}.jpg`,
    `https://fundroad.com/blog/${article.slug}`
  );

  return (
    <>
      <Helmet>
        <title>{article.title} | Blog Fund Road</title>
        <meta name="description" content={article.meta_description || `${article.title} - Conseils et guides pour entrepreneurs sur Fund Road`} />
        <meta name="keywords" content={article.keywords?.join(', ') || 'entrepreneur, startup, conseil'} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.meta_description || article.title} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://fundroad.com/blog/${article.slug}`} />
        <meta property="og:image" content={`https://fundroad.com/og-blog-${article.slug}.jpg`} />
        <meta property="article:published_time" content={article.created_at} />
        {article.updated_at && <meta property="article:modified_time" content={article.updated_at} />}
        <meta property="article:author" content="Fund Road" />
        <meta property="article:section" content="Entrepreneuriat" />
        {article.keywords?.map((keyword, index) => (
          <meta key={index} property="article:tag" content={keyword} />
        ))}
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.meta_description || article.title} />
        <meta name="twitter:image" content={`https://fundroad.com/og-blog-${article.slug}.jpg`} />
        
        {/* Canonical */}
        <link rel="canonical" href={`https://fundroad.com/blog/${article.slug}`} />
        
        {/* Article Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <Button variant="ghost" asChild className="mb-6" aria-label="Retourner à la liste des articles">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au blog
          </Link>
        </Button>
        
        <article className="max-w-4xl mx-auto" itemScope itemType="https://schema.org/Article">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" itemProp="headline">
              {article.title}
            </h1>
            
            {article.meta_description && (
              <p className="text-xl text-white/70 mb-6 leading-relaxed" itemProp="description">
                {article.meta_description}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.created_at} itemProp="datePublished">{publishDate}</time>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min de lecture</span>
              </div>
              <span itemProp="author" itemScope itemType="https://schema.org/Organization" className="hidden">
                <span itemProp="name">Fund Road</span>
              </span>
            </div>
            
            {article.keywords && article.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {article.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs bg-white/10 text-white/80 border-white/20">
                    <Tag className="h-3 w-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </header>
          
          <div className="prose prose-invert prose-lg max-w-none" itemProp="articleBody">
            <MarkdownContent content={article.body_md} />
          </div>
        </article>
        
        <InternalLinks currentPage="/blog" />
        
        <div className="mt-12 text-center">
          <Button asChild aria-label="Voir plus d'articles sur le blog">
            <Link to="/blog">
              Voir plus d'articles
            </Link>
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
    </>
  );
}
