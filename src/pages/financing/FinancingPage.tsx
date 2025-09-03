
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import Footer from "@/components/Footer";
import SearchFilter from "./components/SearchFilter";
import InvestorsList from "./components/InvestorsList";

export interface Investor {
  id: string;
  name: string;
  type: string[];
  sectors: string[];
  stage: string[];
  ticket: string[];
  location: string[];
  description: string;
}

export default function FinancingPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      // Authentication check logic kept as comment for future reference
      /*
      if (!session?.session) {
        toast({
          title: "Connexion requise",
          description: "Vous devez être connecté pour accéder à cette page.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }
      */
    };
    
    checkAuth();
  }, [navigate]);
  
  useEffect(() => {
    const fetchInvestors = async () => {
      setIsLoading(true);
      setLoadingError(null);
      
      try {
        const { data, error } = await supabase
          .from('investors')
          .select('*');
        
        if (error) throw error;
        
        setInvestors(data || []);
      } catch (error: any) {
        console.error('Error fetching investors:', error);
        setLoadingError(error.message || "Impossible de charger les données d'investisseurs.");
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les données d'investisseurs.",
          variant: "destructive",
        });
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    fetchInvestors();
  }, []);

  const filterInvestorsByType = (investors: Investor[], type: string) => {
    if (type === "all") return investors;
    return investors.filter(investor => 
      investor.type && investor.type.some(t => t.toLowerCase().includes(type.toLowerCase()))
    );
  };

  const filterInvestorsBySearch = (investors: Investor[], term: string) => {
    if (!term) return investors;
    const lowerTerm = term.toLowerCase();
    return investors.filter(investor => 
      (investor.name && investor.name.toLowerCase().includes(lowerTerm)) ||
      (investor.sectors && investor.sectors.some(sector => sector.toLowerCase().includes(lowerTerm))) ||
      (investor.location && investor.location.some(loc => loc.toLowerCase().includes(lowerTerm))) ||
      (investor.description && investor.description.toLowerCase().includes(lowerTerm))
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
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{t("financing.title") || "Sources de Financement"}</h1>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            {t("financing.subtitle") || "Découvrez les sources de financement adaptées à votre stade de développement et à votre secteur d'activité."}
          </p>
          
          <SearchFilter 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        <InvestorsList 
          investors={filteredInvestors}
          isLoading={isLoading}
          loadingError={loadingError}
          t={t}
        />
      </main>
      
      <Footer />
    </div>
  );
}
