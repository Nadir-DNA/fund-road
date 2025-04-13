import { useState, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Zap, BookOpen, CheckCircle2, Star, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LazyLoad from "@/components/LazyLoad";

const TaskCard = lazy(() => import("@/components/TaskCard"));

export default function Index() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-10 hidden lg:flex flex-col gap-6">
        <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="2"/>
          </svg>
        </button>
        
        <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 4H18C19.1046 4 20 4.89543 20 6V18C20 19.1046 19.1046 20 18 20H15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <path d="M8 8L4 12L8 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 12H16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <button className="p-4 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 9L9.99998 16L6.99994 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="white" strokeWidth="2"/>
          </svg>
        </button>
      </div>
      
      <Navbar />
      
      <main className="relative pt-32 pb-20 px-4 container mx-auto z-10">
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 text-white backdrop-blur-sm gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Accompagnement entrepreneurial de l'idée au financement</span>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Structurez votre projet et<br />
            Trouvez vos <span className="text-primary">financements</span>
          </h1>
          
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-12">
            Un parcours guidé pour vous accompagner à chaque étape clé
            de votre aventure entrepreneuriale, avec des ressources adaptées à chaque phase.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button size="lg" asChild className="bg-gradient-to-r from-primary to-accent text-white px-8">
              <Link to="/features">
                <span>Démarrez votre parcours</span>
              </Link>
            </Button>
            
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
              <div className="bg-primary/20 text-white rounded-full w-8 h-8 flex items-center justify-center">
                1K+
              </div>
              <span className="text-sm text-white/80">entrepreneurs accompagnés</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <div className="glass-card p-6 rounded-lg">
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 9H21" stroke="currentColor" strokeWidth="2"/>
                <path d="M9 21L9 9" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Business Model Canvas</h3>
            <p className="text-white/70">
              Structurez votre modèle d'affaires avec notre méthodologie pas à pas et nos templates spécialisés.
            </p>
            <Link to="/features" className="text-primary hover:underline text-sm mt-3 inline-block">En savoir plus</Link>
          </div>
          
          <div className="glass-card p-6 rounded-lg">
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4V20H20M4 16L8 12L12 16L20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Business Plan</h3>
            <p className="text-white/70">
              Créez un plan d'affaires solide avec nos guides détaillés et nos outils de projection financière.
            </p>
            <Link to="/features" className="text-primary hover:underline text-sm mt-3 inline-block">En savoir plus</Link>
          </div>
          
          <div className="glass-card p-6 rounded-lg">
            <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 12L20 7.5" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 12V21" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 12L4 7.5" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">Pitch Deck</h3>
            <p className="text-white/70">
              Concevez une présentation efficace pour convaincre investisseurs et partenaires avec nos templates.
            </p>
            <Link to="/features" className="text-primary hover:underline text-sm mt-3 inline-block">En savoir plus</Link>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto mb-20 glass-card p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Solutions complètes pour la levée de fonds et startups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Star className="h-5 w-5 text-primary mr-2" />
                Guide levée de fonds
              </h3>
              <p className="text-white/70 mb-4">
                Découvrez nos méthodologies éprouvées pour réussir votre levée de fonds. 
                Identifiez les sources de financement adaptées à votre stade de développement et maximisez vos chances de succès.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Préparation à la levée de fonds</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Cartographie d'investisseurs</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <BookOpen className="h-5 w-5 text-primary mr-2" />
                Ressources entrepreneur
              </h3>
              <p className="text-white/70 mb-4">
                Accédez à nos nombreuses ressources pour startups : guides sur les brevets, templates de business plan, 
                et méthodologie de création de pitch deck impactants.
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Protection de la propriété intellectuelle</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Business Model Canvas interactif</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="relative mt-16 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-4 lg:col-span-3 transform -rotate-3 translate-y-6 md:translate-x-12">
            <Suspense fallback={<div className="h-64 glass-card animate-pulse"></div>}>
              <LazyLoad height={320}>
                <TaskCard 
                  title="Ressources disponibles" 
                  stats={{
                    value: "127",
                    label: "Templates, guides et outils gratuits"
                  }}
                  className="transform hover:translate-y-[-5px] transition-transform duration-300"
                />
              </LazyLoad>
            </Suspense>
          </div>
          
          <div className="col-span-12 md:col-span-5 lg:col-span-4 z-20 transform translate-y-16 md:translate-x-8 md:translate-y-0">
            <Suspense fallback={<div className="h-64 glass-card animate-pulse"></div>}>
              <LazyLoad height={320}>
                <TaskCard 
                  title="Progression parcours" 
                  chartData={{
                    percentage: 74,
                    label: "Avancement parcours",
                    secondaryStats: [
                      { label: "Business Plan", value: "92%" },
                      { label: "Pitch Deck", value: "45%" }
                    ]
                  }}
                  className="transform hover:translate-y-[-5px] transition-transform duration-300"
                />
              </LazyLoad>
            </Suspense>
          </div>
          
          <div className="col-span-12 md:col-span-5 lg:col-span-4 transform rotate-2 translate-y-8 md:-translate-x-8">
            <Suspense fallback={<div className="h-64 glass-card animate-pulse"></div>}>
              <LazyLoad height={320}>
                <TaskCard 
                  title="Étapes du parcours" 
                  subtitle="(10)"
                  tasks={[
                    { id: "1", text: "Phase d'idéation & découverte du problème", completed: true },
                    { id: "2", text: "Validation du concept", completed: false }
                  ]}
                  className="transform hover:translate-y-[-5px] transition-transform duration-300"
                />
              </LazyLoad>
            </Suspense>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto mt-24 mb-16 glass-card p-8 rounded-lg border border-primary/20">
          <div className="flex items-start gap-4">
            <div className="bg-primary/20 p-3 rounded-full">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3">Offre d'accompagnement stratégique</h3>
              <p className="text-white/80 mb-4">
                Bénéficiez d'un accompagnement sur mesure pour structurer et valoriser votre projet :
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Mise en relation avec nos partenaires privilégiés en propriété intellectuelle (brevets, marques, contrats).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span>Rédaction de votre dossier de financement, incluant :</span>
                </li>
                <ul className="pl-7 space-y-2 mt-2 mb-2">
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Un business plan professionnel,</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <span>Un pitch deck percutant, prêt à présenter à des investisseurs.</span>
                  </li>
                </ul>
              </ul>
              <div className="mb-4">
                <p className="flex items-center gap-2 font-medium">
                  <ArrowRight className="h-4 w-4 text-primary" />
                  Vous souhaitez en savoir plus ?
                </p>
                <p className="text-white/70 text-sm">Cliquez ci-dessous pour obtenir un devis personnalisé adapté à votre projet.</p>
              </div>
              <Button asChild className="bg-gradient-to-r from-primary to-accent text-white">
                <Link to="/contact">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Obtenir un devis
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold mb-6">Prêt à structurer votre projet ?</h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Démarrez votre parcours entrepreneurial avec nos ressources et méthodologies éprouvées.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild variant="outline" className="border-white/20 hover:bg-white/10">
              <Link to="/blog">
                Découvrir les ressources
              </Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-primary to-accent text-white">
              <Link to="/features">
                Voir le parcours complet
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
