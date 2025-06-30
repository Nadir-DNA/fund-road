
import { Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBlogArticles } from "@/hooks/useBlogArticles";

export default function Blog() {
  const { data: articles, isLoading } = useBlogArticles();
  const [searchTerm, setSearchTerm] = useState("");

  // Extraire toutes les catégories uniques des mots-clés
  const allCategories = Array.from(
    new Set(
      articles?.flatMap(article => article.keywords || []) || []
    )
  );

  const categories = ["Toutes Catégories", ...allCategories.slice(0, 6)];
  const [selectedCategory, setSelectedCategory] = useState("Toutes Catégories");

  // Filtrer les articles
  const filteredArticles = articles?.filter(article => {
    const matchesSearch = searchTerm === "" || 
      article.h1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.meta_desc?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.keywords?.some(keyword => 
        keyword.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesCategory = selectedCategory === "Toutes Catégories" ||
      article.keywords?.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  }) || [];

  const getReadingTime = (content: string) => {
    return Math.ceil(content.length / 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getCategoryFromKeywords = (keywords: string[] | null) => {
    if (!keywords || keywords.length === 0) return "Général";
    return keywords[0];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
        
        <Navbar />
        
        <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Centre de Ressources Entrepreneurs</h1>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Guides, conseils et stratégies pour vous accompagner à chaque étape de votre parcours entrepreneurial.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden h-96 animate-pulse">
                <div className="h-48 bg-white/10"></div>
                <div className="p-6">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-6 bg-white/10 rounded mb-2"></div>
                  <div className="h-3 bg-white/10 rounded mb-4"></div>
                  <div className="h-3 bg-white/10 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Centre de Ressources Entrepreneurs</h1>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Guides, conseils et stratégies pour vous accompagner à chaque étape de votre parcours entrepreneurial.
          </p>
          
          <div className="max-w-md mx-auto relative">
            <Input
              placeholder="Rechercher un article..."
              className="bg-black/40 border-white/10 pl-10 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={selectedCategory === category ? "default" : "outline"}
              className={selectedCategory === category 
                ? "bg-primary hover:bg-primary/90" 
                : "border-white/10 text-white hover:bg-white/10"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
        
        {filteredArticles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-white/70 text-lg">Aucun article trouvé pour votre recherche.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => (
              <Link to={`/blog/${article.slug}`} key={article.id} className="group">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden h-full transition-all duration-300 group-hover:border-primary/50 group-hover:translate-y-[-5px]">
                  <div className="h-48 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-4xl opacity-50">📄</div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {getCategoryFromKeywords(article.keywords)}
                      </Badge>
                      <div className="text-white/50 text-xs flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getReadingTime(article.content_md)} min
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {article.h1}
                    </h3>
                    {article.meta_desc && (
                      <p className="text-white/70 text-sm mb-4 line-clamp-3">
                        {article.meta_desc}
                      </p>
                    )}
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {article.keywords.slice(0, 3).map((keyword, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            <Tag className="h-2 w-2 mr-1" />
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="text-primary text-sm font-medium group-hover:underline">
                      Lire l'article
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {filteredArticles.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-white/60 text-sm">
              {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''} trouvé{filteredArticles.length > 1 ? 's' : ''}
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
