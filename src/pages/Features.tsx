
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import JourneyTimeline from "@/components/JourneyTimeline";
import JourneyProgressIndicator from "@/components/journey/JourneyProgressIndicator";
import { ChevronRight, CheckCircle, Presentation, FileText, Lightbulb, TrendingUp, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Features() {
  const [journeyProgress, setJourneyProgress] = useState(74);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Parcours Entrepreneur</h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              De l'idéation au financement : un accompagnement complet pour structurer votre projet 
              et maximiser vos chances de succès.
            </p>
          </div>
          
          {/* Progress Indicator */}
          <JourneyProgressIndicator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Lightbulb className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">De l'idée au concept</h3>
              <p className="text-white/70 mb-4">
                Méthodologie pour transformer votre idée en concept viable et validé par le marché.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Validation du concept</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Problem-solution fit</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <FileText className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Documentation business</h3>
              <p className="text-white/70 mb-4">
                Créez tous les documents nécessaires à la structuration de votre projet entrepreneurial.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Business Model Canvas</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Business Plan complet</span>
                </li>
              </ul>
            </div>
            
            <div className="glass-card p-6 rounded-lg">
              <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Presentation className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pitch et financement</h3>
              <p className="text-white/70 mb-4">
                Préparez votre pitch et identifiez les sources de financement adaptées à votre projet.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Pitch Deck investisseur</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-primary mr-2" />
                  <span>Stratégie de financement</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-center mt-12">
            <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-8">
              <Link to="/financing">
                Explorer les options de financement
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
        
        {/* Parcours Tabs */}
        <section className="container mx-auto px-4 py-8">
          <Tabs defaultValue="timeline" className="w-full max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 bg-black/20 border border-white/10">
              <TabsTrigger value="timeline">Parcours chronologique</TabsTrigger>
              <TabsTrigger value="themes">Parcours par thématique</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline" className="mt-6">
              {/* Timeline Section */}
              <div className="py-8 bg-gradient-to-b from-transparent to-black/40">
                <JourneyTimeline />
              </div>
            </TabsContent>
            <TabsContent value="themes" className="mt-6">
              <div className="glass-card p-6 rounded-lg text-center">
                <h3 className="text-xl font-medium mb-4">Parcours thématiques</h3>
                <p className="text-white/70 mb-6">
                  Explorez nos parcours spécifiques selon vos besoins et votre secteur d'activité.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 border border-primary/30 rounded-lg">
                    <h4 className="font-medium mb-2">Startups Tech</h4>
                    <p className="text-sm text-white/70 mb-2">Parcours optimisé pour les startups technologiques</p>
                    <Button variant="outline" size="sm" className="w-full">Explorer</Button>
                  </div>
                  <div className="p-4 border border-primary/30 rounded-lg">
                    <h4 className="font-medium mb-2">Biotechnologies</h4>
                    <p className="text-sm text-white/70 mb-2">Spécificités pour les projets biotech et santé</p>
                    <Button variant="outline" size="sm" className="w-full">Explorer</Button>
                  </div>
                  <div className="p-4 border border-primary/30 rounded-lg">
                    <h4 className="font-medium mb-2">E-commerce</h4>
                    <p className="text-sm text-white/70 mb-2">Structurer votre projet de commerce en ligne</p>
                    <Button variant="outline" size="sm" className="w-full">Explorer</Button>
                  </div>
                  <div className="p-4 border border-primary/30 rounded-lg">
                    <h4 className="font-medium mb-2">Économie sociale</h4>
                    <p className="text-sm text-white/70 mb-2">Projets à impact social et environnemental</p>
                    <Button variant="outline" size="sm" className="w-full">Explorer</Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
