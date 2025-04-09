
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Investor {
  id: string;
  name: string;
  type: string[];
  sectors: string[];
  stage: string[];
  ticket: string[];
  location: string[];
  description: string;
}

export default function Financing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch investors from Supabase
  useEffect(() => {
    const fetchInvestors = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('investors')
          .select('*');
        
        if (error) throw error;
        
        setInvestors(data || []);
      } catch (error) {
        console.error('Error fetching investors:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données d'investisseurs.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvestors();
  }, []);

  const filterInvestorsByType = (investors: Investor[], type: string) => {
    if (type === "all") return investors;
    return investors.filter(investor => 
      investor.type.some(t => t.toLowerCase().includes(type.toLowerCase()))
    );
  };

  const filterInvestorsBySearch = (investors: Investor[], term: string) => {
    if (!term) return investors;
    const lowerTerm = term.toLowerCase();
    return investors.filter(investor => 
      investor.name.toLowerCase().includes(lowerTerm) ||
      investor.sectors.some(sector => sector.toLowerCase().includes(lowerTerm)) ||
      investor.location.some(loc => loc.toLowerCase().includes(lowerTerm)) ||
      investor.description.toLowerCase().includes(lowerTerm)
    );
  };

  const filteredInvestors = filterInvestorsBySearch(
    filterInvestorsByType(investors, activeTab),
    searchTerm
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Trouvez le Financement Adapté à Votre Projet</h1>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Connectez-vous avec les investisseurs adaptés à votre startup, selon votre secteur, stade de développement et besoins de financement.
          </p>
          
          <div className="max-w-md mx-auto relative mb-8">
            <Input
              placeholder="Recherche par nom, secteur ou localisation..."
              className="bg-black/40 border-white/10 pl-10 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
          </div>
          
          <Tabs defaultValue="all" className="mb-8" onValueChange={setActiveTab}>
            <TabsList className="bg-black/40 border border-white/10">
              <TabsTrigger value="all">Tous les Organismes</TabsTrigger>
              <TabsTrigger value="Venture">Venture Capital</TabsTrigger>
              <TabsTrigger value="Angel">Business Angels</TabsTrigger>
              <TabsTrigger value="Corporate">Corporate VC</TabsTrigger>
              <TabsTrigger value="Private">Private Equity</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
              <Filter className="h-4 w-4 mr-2" />
              Filtres Avancés
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {filteredInvestors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInvestors.map((investor) => (
                  <div 
                    key={investor.id} 
                    className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:translate-y-[-5px]"
                  >
                    <h3 className="text-xl font-semibold mb-2">{investor.name}</h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {investor.type && investor.type.length > 0 && (
                        <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full">
                          {investor.type[0]}
                        </span>
                      )}
                      {investor.sectors && investor.sectors.slice(0, 2).map((sector, index) => (
                        <span key={index} className="text-xs px-3 py-1 bg-white/10 text-white/80 rounded-full">
                          {sector}
                        </span>
                      ))}
                      {investor.sectors && investor.sectors.length > 2 && (
                        <span className="text-xs px-3 py-1 bg-white/10 text-white/80 rounded-full">
                          +{investor.sectors.length - 2}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-white/70 text-sm mb-4">
                      {investor.description}
                    </p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-white/50 text-sm">Stade:</span>
                        <span className="text-sm">{investor.stage ? investor.stage.join(", ") : 'Non spécifié'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50 text-sm">Ticket moyen:</span>
                        <span className="text-sm">{investor.ticket ? investor.ticket.join(" - ") : 'Variable'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/50 text-sm">Localisation:</span>
                        <span className="text-sm">{investor.location ? investor.location.join(", ") : 'International'}</span>
                      </div>
                    </div>
                    
                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white">
                      Voir le Profil
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-xl text-white/70">Aucun organisme ne correspond à vos critères.</p>
                <p className="text-white/50 mt-2">Essayez d'ajuster votre recherche ou vos filtres.</p>
              </div>
            )}
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
