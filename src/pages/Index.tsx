import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronRight, Compass, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ResourceCard from '@/components/ResourceCard';
import TaskCard from '@/components/TaskCard';
import { supabase } from "@/integrations/supabase/client";
import { useJourneyProgress } from '@/hooks/useJourneyProgress';
import { journeySteps } from '@/data/journeySteps';

export default function Index() {
  const { t } = useLanguage();
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isCookieConsentVisible, setIsCookieConsentVisible] = useState(false);
  
  useEffect(() => {
    // Show cookie consent after 3 seconds
    const timer = setTimeout(() => {
      setIsCookieConsentVisible(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);
  
  const resources = [
    {
      title: t("index.resources.idea.title"),
      description: t("index.resources.idea.description"),
      icon: <Lightbulb className="h-5 w-5" />,
      href: "/features",
    },
    {
      title: t("index.resources.docs.title"),
      description: t("index.resources.docs.description"),
      icon: <FileText className="h-5 w-5" />,
      href: "/features",
    },
    {
      title: t("index.resources.pitch.title"),
      description: t("index.resources.pitch.description"),
      icon: <Presentation className="h-5 w-5" />,
      href: "/features",
    },
  ];
  
  const tasks = [
    {
      id: "1",
      text: t("index.tasks.task1"),
      completed: true,
    },
    {
      id: "2",
      text: t("index.tasks.task2"),
      completed: false,
    },
    {
      id: "3",
      text: t("index.tasks.task3"),
      completed: false,
    },
  ];
  
  const { localSteps, progress } = useJourneyProgress(journeySteps);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
  }, []);
  
  // Render the roadmap button or authentication prompt
  const renderRoadmapButton = () => {
    if (isAuthenticated) {
      return (
        <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg">
          <Link to="/roadmap" className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Accéder au parcours entrepreneurial
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      );
    } else {
      return (
        <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg">
          <Link to="/auth" className="flex items-center">
            <BookOpen className="mr-2 h-5 w-5" />
            Commencer mon parcours entrepreneurial
            <ChevronRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      );
    }
  };
  
  // Add a roadmap call-to-action section
  const roadmapSection = (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">
          Parcours entrepreneurial complet
        </h2>
        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10">
          Accédez à notre roadmap interactive pour structurer votre projet étape par étape, 
          avec des outils et ressources pour chaque phase de développement.
        </p>
        
        {isAuthenticated && progress.percentage > 0 && (
          <div className="mb-8">
            <div className="glass-card py-4 px-8 inline-flex items-center gap-4 mx-auto">
              <div className="text-2xl font-bold text-primary">{progress.percentage}%</div>
              <div className="text-left">
                <div className="text-sm text-white/70">Parcours complété</div>
                <div className="text-xs text-white/50">{progress.completedSteps}/{progress.totalSteps} étapes</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          {renderRoadmapButton()}
        </div>
      </div>
    </section>
  );
  
  // Insert the roadmap section into the page (this will vary based on your current Index.tsx structure)
  // This is just a placeholder - you'll need to adjust based on your actual Index page layout
  
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="py-24 md:py-32 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("index.hero.title")}
          </h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto mb-12">
            {t("index.hero.subtitle")}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg">
              <Link to="/features" className="flex items-center">
                {t("button.learnMore")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {roadmapSection}
      
      {/* Features Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("index.features.title")}</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              {t("index.features.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <ResourceCard key={index} {...resource} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Dashboard Section */}
      <section className="py-16 bg-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{t("index.dashboard.title")}</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              {t("index.dashboard.subtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TaskCard
              title={t("index.dashboard.taskCard.title")}
              subtitle={t("index.dashboard.taskCard.subtitle")}
              tasks={tasks}
            />
            <TaskCard
              title={t("index.dashboard.progressCard.title")}
              chartData={{
                percentage: 75,
                label: t("index.dashboard.progressCard.label"),
                secondaryStats: [
                  {
                    label: t("index.dashboard.progressCard.stats.completed"),
                    value: "12",
                  },
                  {
                    label: t("index.dashboard.progressCard.stats.remaining"),
                    value: "4",
                  },
                ],
              }}
            />
            <TaskCard
              title={t("index.dashboard.projectCard.title")}
              stats={{
                value: "3",
                label: t("index.dashboard.projectCard.label"),
              }}
            />
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

import { Lightbulb, FileText, Presentation } from "lucide-react";
