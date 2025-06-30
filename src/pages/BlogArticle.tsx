
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useBlogArticle } from "@/hooks/useBlogArticles";
import MarkdownContent from "@/components/ui/MarkdownContent";

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

  const readingTime = Math.ceil(article.content_md.length / 1000);
  const publishDate = new Date(article.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
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
        
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              {article.h1}
            </h1>
            
            {article.meta_desc && (
              <p className="text-xl text-white/70 mb-6 leading-relaxed">
                {article.meta_desc}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <time dateTime={article.created_at}>{publishDate}</time>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min de lecture</span>
              </div>
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
          
          <div className="prose prose-invert prose-lg max-w-none">
            <MarkdownContent content={article.content_md} />
          </div>
        </article>
        
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
  );
}
