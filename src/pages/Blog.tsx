
import { useState } from "react";
import { Search, Filter, Calendar, Clock, Tag } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useBlogArticles } from "@/hooks/useBlogArticles";
import { InternalLinks } from '@/components/seo/InternalLinks';

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { data: articles, isLoading, error } = useBlogArticles();

  // Extract unique categories from articles
  const categories = articles ? [...new Set(articles.flatMap(article => article.keywords || []))] : [];

  // Filter articles based on search and category
  const filteredArticles = articles?.filter(article => {
    const matchesSearch = article.h1.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.meta_desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.keywords?.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           article.keywords?.includes(selectedCategory);
    
    return matchesSearch && matchesCategory;
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-20">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-white/10 rounded mb-8"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-white/10 rounded-xl"></div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="container mx-auto px-4 pt-32 pb-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Erreur de chargement</h1>
          <p className="text-white/70">Impossible de charger les articles du blog.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Blog Fund Road - Conseils entrepreneurs</title>
        <meta name="description" content="Découvrez nos articles exclusifs sur l'entrepreneuriat, la levée de fonds et la création de startup. Conseils d'experts et stratégies gagnantes pour réussir votre projet." />
        <meta name="keywords" content="blog entrepreneur, conseils startup, guides levée de fonds, stratégie entrepreneuriale, business plan, pitch deck, financement" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Blog Fund Road - Conseils pour entrepreneurs" />
        <meta property="og:description" content="Articles exclusifs sur l'entrepreneuriat et la levée de fonds" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fundroad.com/blog" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://fundroad.com/blog" />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
        
        <Navbar />
        
        <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gradient">
            Blog Fund Road
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Découvrez nos conseils, guides et analyses pour réussir votre parcours entrepreneurial
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-4 w-4" />
            <Input
              type="text"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
              aria-label="Rechercher dans les articles"
            />
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className="text-sm"
              aria-label="Afficher toutes les catégories"
            >
              <Filter className="h-4 w-4 mr-1" />
              Toutes Catégories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="text-sm border-white/20 hover:bg-white/10"
                aria-label={`Filtrer par ${category}`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/70 text-lg">Aucun article trouvé pour votre recherche.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => {
              const readingTime = Math.ceil(article.content_md.length / 1000);
              const publishDate = new Date(article.created_at).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });

              return (
                <Card 
                  key={article.id} 
                  className="glass-card overflow-hidden group hover:scale-105 transition-all duration-300"
                >
                  <Link to={`/blog/${article.slug}`}>
                    <div className="p-6">
                      <div className="flex items-center text-sm text-white/60 mb-3">
                        <Calendar className="h-4 w-4 mr-1" />
                        {publishDate}
                        <Clock className="h-4 w-4 ml-3 mr-1" />
                        {readingTime} min
                      </div>
                      
                      <h2 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {article.h1}
                      </h2>
                      
                      {article.meta_desc && (
                        <p className="text-white/70 mb-4 line-clamp-3">
                          {article.meta_desc}
                        </p>
                      )}
                      
                      {article.keywords && article.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {article.keywords.slice(0, 3).map((keyword, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs bg-white/10 text-white/80 border-white/20"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {keyword}
                            </Badge>
                          ))}
                          {article.keywords.length > 3 && (
                            <Badge variant="secondary" className="text-xs bg-white/10 text-white/80 border-white/20">
                              +{article.keywords.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
        </main>
        
        <InternalLinks currentPage="/blog" />
        
        <Footer />
      </div>
    </>
  );
}
