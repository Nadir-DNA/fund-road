
import { Link } from 'react-router-dom';
import ResourceCard from '@/components/ResourceCard';
import { Lightbulb, FileText, Presentation } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';

export default function FeaturesSection() {
  const { t } = useLanguage();
  
  // Définition des ressources avec des titres et descriptions statiques
  const resources = [
    {
      title: "Idéation & Validation",
      description: "Méthodologie pour transformer votre idée en concept viable et validé par le marché.",
      icon: <Lightbulb className="h-5 w-5" />,
      href: "/features",
    },
    {
      title: "Documentation & Structure",
      description: "Créez tous les documents nécessaires à la structuration de votre projet entrepreneurial.",
      icon: <FileText className="h-5 w-5" />,
      href: "/features",
    },
    {
      title: "Pitch & Financement",
      description: "Préparez votre pitch et identifiez les sources de financement adaptées à votre projet.",
      icon: <Presentation className="h-5 w-5" />,
      href: "/features",
    },
  ];
  
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fonctionnalités principales</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Découvrez les outils et ressources disponibles pour chaque étape de votre projet
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {resources.map((resource, index) => (
            <ResourceCard key={index} {...resource} />
          ))}
        </div>
      </div>
    </section>
  );
}
