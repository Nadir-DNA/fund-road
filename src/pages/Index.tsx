
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import RoadmapSection from '@/components/home/RoadmapSection';
import FeaturesSection from '@/components/home/FeaturesSection';
import DashboardSection from '@/components/home/DashboardSection';
import ResourceCard from '@/components/ResourceCard';
import { Button } from '@/components/ui/button';
import { FileText, Shield, Rocket } from 'lucide-react';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function Index() {
  const [isCookieConsentVisible, setIsCookieConsentVisible] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  
  useEffect(() => {
    // Show cookie consent after 3 seconds
    const timer = setTimeout(() => {
      setIsCookieConsentVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-black text-white">
      <ErrorBoundary>
        <Navbar />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <HeroSection />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <RoadmapSection />
      </ErrorBoundary>
      
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center">
            Nos services
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Investors Card */}
            <ResourceCard
              title="Pour les investisseurs"
              description="Accédez à des opportunités d'investissement dans des startups à fort potentiel, rigoureusement sélectionnées et accompagnées."
              icon={<Rocket className="h-6 w-6" />}
              href="/financing"
              className="md:col-span-1 lg:col-span-1"
            />
            
            {/* IP Strategy Card */}
            <ResourceCard
              title="Stratégie de propriété intellectuelle"
              description="Nous vous accompagnons dans la protection et la valorisation de vos innovations avec une stratégie IP adaptée à votre entreprise."
              icon={<Shield className="h-6 w-6" />}
              href="/contact"
              className="md:col-span-1 lg:col-span-1"
            />
            
            {/* MVP Development Card */}
            <ResourceCard
              title="Création de votre MVP/site web"
              description="Transformez votre idée en produit minimum viable ou site web professionnel pour valider votre concept et attirer vos premiers utilisateurs."
              icon={<FileText className="h-6 w-6" />}
              href="/contact"
              className="md:col-span-2 lg:col-span-1"
            />
          </div>
          
          <div className="mt-12 text-center">
            <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-6 py-5 text-lg">
              <Link to="/contact">
                Obtenir un devis personnalisé
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      <ErrorBoundary>
        <FeaturesSection />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <DashboardSection />
      </ErrorBoundary>
      
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </div>
  );
}
