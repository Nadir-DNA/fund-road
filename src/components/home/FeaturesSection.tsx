
import { Link } from 'react-router-dom';
import ResourceCard from '@/components/ResourceCard';
import { Lightbulb, FileText, Presentation, ArrowRight } from "lucide-react";
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';

export default function FeaturesSection() {
  const { t } = useLanguage();
  
  const resources = [
    {
      title: t("features.ideation.title"),
      description: t("features.ideation.description"),
      icon: <Lightbulb className="h-6 w-6" />,
      href: "/features",
      gradient: "from-yellow-500/20 to-orange-500/20",
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400"
    },
    {
      title: t("features.documentation.title"),
      description: t("features.documentation.description"),
      icon: <FileText className="h-6 w-6" />,
      href: "/features",
      gradient: "from-blue-500/20 to-primary/20",
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400"
    },
    {
      title: t("features.pitch.title"),
      description: t("features.pitch.description"),
      icon: <Presentation className="h-6 w-6" />,
      href: "/features",
      gradient: "from-purple-500/20 to-accent/20",
      iconBg: "bg-purple-500/20",
      iconColor: "text-purple-400"
    },
  ];
  
  return (
    <section className="py-24 bg-gradient-to-b from-black to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">{t("features.title")}</span> {t("features.titleHighlight")}
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            {t("features.subtitle")}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {resources.map((resource, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${resource.gradient} border border-white/10 p-8 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105`}
            >
              <div className="relative z-10">
                <div className={`w-16 h-16 ${resource.iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className={resource.iconColor}>
                    {resource.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold mb-4 text-white group-hover:text-primary transition-colors duration-300">
                  {resource.title}
                </h3>
                
                <p className="text-white/70 mb-6 leading-relaxed">
                  {resource.description}
                </p>
                
                <Link 
                  to={resource.href}
                  className="inline-flex items-center text-primary hover:text-accent transition-colors duration-300 font-medium"
                >
                  {t("button.seeMore")}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 px-8 py-4 text-lg backdrop-blur-sm">
            <Link to="/features" className="flex items-center">
              {t("button.seeAllFeatures")}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
