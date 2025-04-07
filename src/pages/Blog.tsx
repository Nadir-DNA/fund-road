
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Blog() {
  const blogPosts = [
    {
      id: 1,
      title: "Comment valider son idée de startup avec un MVP",
      excerpt: "Découvrez les stratégies essentielles pour tester rapidement votre concept et recueillir des retours utilisateurs précieux.",
      category: "Idéation",
      date: "2 Avr 2023",
      readTime: "5 min de lecture",
      image: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Les erreurs à éviter dans votre Business Plan",
      excerpt: "Analysez les pièges les plus courants qui peuvent compromettre votre Business Plan aux yeux des investisseurs.",
      category: "Business Plan",
      date: "28 Mar 2023",
      readTime: "7 min de lecture",
      image: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Structurer un Pitch Deck percutant",
      excerpt: "Les éléments indispensables à inclure dans votre présentation pour convaincre les investisseurs dès les premières minutes.",
      category: "Pitch Deck",
      date: "15 Mar 2023",
      readTime: "6 min de lecture",
      image: "/placeholder.svg"
    },
    {
      id: 4,
      title: "Choisir la structure juridique adaptée à votre startup",
      excerpt: "Comparatif des différentes formes juridiques et leur impact sur votre capacité à lever des fonds.",
      category: "Juridique",
      date: "10 Mar 2023",
      readTime: "8 min de lecture",
      image: "/placeholder.svg"
    },
    {
      id: 5,
      title: "Levée de fonds : timing et préparation",
      excerpt: "À quel moment initier votre levée de fonds et comment s'y préparer efficacement pour maximiser vos chances.",
      category: "Financement",
      date: "5 Mar 2023",
      readTime: "9 min de lecture",
      image: "/placeholder.svg"
    },
    {
      id: 6,
      title: "Business Model Canvas : guide pratique",
      excerpt: "Maîtrisez cet outil essentiel pour structurer et visualiser votre modèle économique de façon claire et cohérente.",
      category: "Business Model",
      date: "28 Fév 2023",
      readTime: "10 min de lecture",
      image: "/placeholder.svg"
    }
  ];

  const categories = [
    "Toutes Catégories",
    "Idéation",
    "Business Model",
    "Business Plan",
    "Pitch Deck",
    "Juridique",
    "Financement"
  ];

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
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={index === 0 ? "default" : "outline"}
              className={index === 0 
                ? "bg-primary hover:bg-primary/90" 
                : "border-white/10 text-white hover:bg-white/10"}
              size="sm"
            >
              {category}
            </Button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link to={`/blog/${post.id}`} key={post.id} className="group">
              <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden h-full transition-all duration-300 group-hover:border-primary/50 group-hover:translate-y-[-5px]">
                <div className="h-48 bg-gradient-to-r from-primary/20 to-accent/20 flex items-center justify-center">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full">
                      {post.category}
                    </span>
                    <div className="text-white/50 text-xs">
                      {post.date} • {post.readTime}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-white/70 text-sm mb-4">
                    {post.excerpt}
                  </p>
                  <div className="text-primary text-sm font-medium group-hover:underline">
                    Lire l'article
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
            Voir plus d'articles
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
