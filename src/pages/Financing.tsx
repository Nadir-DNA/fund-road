
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, DollarSign, PiggyBank, Wallet, Coins } from "lucide-react";

export default function Financing() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const investors = [
    {
      id: 1,
      name: "TechVentures Capital",
      type: "Fonds d'investissement",
      sectors: ["Tech", "SaaS", "IA"],
      stage: "Amorçage à Série A",
      ticket: "500K€ - 3M€",
      location: "Paris, France",
      description: "TechVentures Capital investit dans des startups tech innovantes à fort potentiel de croissance."
    },
    {
      id: 2,
      name: "GreenInvest",
      type: "Fonds Impact",
      sectors: ["CleanTech", "Développement Durable"],
      stage: "Amorçage à Série B",
      ticket: "1M€ - 5M€",
      location: "Berlin, Allemagne",
      description: "Fonds dédié aux technologies durables qui répondent aux défis environnementaux et climatiques."
    },
    {
      id: 3,
      name: "Growth Partners",
      type: "Capital Développement",
      sectors: ["Logiciels B2B", "FinTech", "HealthTech"],
      stage: "Série B à Série C",
      ticket: "10M€ - 30M€",
      location: "Paris, France",
      description: "Accompagnement d'entreprises établies avec des modèles économiques éprouvés prêtes à se développer."
    },
    {
      id: 4,
      name: "Alpha Angels",
      type: "Réseau de Business Angels",
      sectors: ["Tech", "Consommation", "Marketplace"],
      stage: "Pré-amorçage à Amorçage",
      ticket: "100K€ - 500K€",
      location: "Lyon, France",
      description: "Un réseau d'entrepreneurs expérimentés investissant dans des startups early-stage avec des équipes solides."
    },
    {
      id: 5,
      name: "Innovation Fund",
      type: "Corporate VC",
      sectors: ["DeepTech", "Robotique", "Industrie Avancée"],
      stage: "Amorçage à Série A",
      ticket: "1M€ - 8M€",
      location: "Marseille, France",
      description: "Branche capital-risque d'entreprise concentrée sur des investissements stratégiques en technologies de pointe."
    },
    {
      id: 6,
      name: "Founders Capital",
      type: "Micro VC",
      sectors: ["SaaS B2B", "Outils Développeurs", "IA"],
      stage: "Pré-amorçage à Amorçage",
      ticket: "250K€ - 1M€",
      location: "Nantes, France",
      description: "Fondé par des entrepreneurs à succès pour soutenir la nouvelle génération de fondateurs tech."
    }
  ];

  const filterInvestorsByType = (investors, type) => {
    if (type === "all") return investors;
    return investors.filter(investor => investor.type.toLowerCase().includes(type.toLowerCase()));
  };

  const filterInvestorsBySearch = (investors, term) => {
    if (!term) return investors;
    const lowerTerm = term.toLowerCase();
    return investors.filter(investor => 
      investor.name.toLowerCase().includes(lowerTerm) ||
      investor.sectors.some(sector => sector.toLowerCase().includes(lowerTerm)) ||
      investor.location.toLowerCase().includes(lowerTerm) ||
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
              <TabsTrigger value="Fonds">Fonds d'Investissement</TabsTrigger>
              <TabsTrigger value="Angel">Business Angels</TabsTrigger>
              <TabsTrigger value="Corporate">Corporate VC</TabsTrigger>
              <TabsTrigger value="Impact">Fonds Impact</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex justify-end mb-4">
            <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
              <Filter className="h-4 w-4 mr-2" />
              Filtres Avancés
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvestors.map((investor) => (
            <div 
              key={investor.id} 
              className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:translate-y-[-5px]"
            >
              <h3 className="text-xl font-semibold mb-2">{investor.name}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full">
                  {investor.type}
                </span>
                {investor.sectors.slice(0, 2).map((sector, index) => (
                  <span key={index} className="text-xs px-3 py-1 bg-white/10 text-white/80 rounded-full">
                    {sector}
                  </span>
                ))}
                {investor.sectors.length > 2 && (
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
                  <span className="text-sm">{investor.stage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Ticket moyen:</span>
                  <span className="text-sm">{investor.ticket}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/50 text-sm">Localisation:</span>
                  <span className="text-sm">{investor.location}</span>
                </div>
              </div>
              
              <Button className="w-full bg-white/10 hover:bg-white/20 text-white">
                Voir le Profil
              </Button>
            </div>
          ))}
        </div>
        
        {filteredInvestors.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl text-white/70">Aucun organisme ne correspond à vos critères.</p>
            <p className="text-white/50 mt-2">Essayez d'ajuster votre recherche ou vos filtres.</p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
