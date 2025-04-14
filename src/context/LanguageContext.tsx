
import { createContext, useState, useContext, ReactNode } from "react";

type Language = "fr" | "en";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations for the site
const translations = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.features": "Fonctionnalités",
    "nav.financing": "Financement",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.login": "Se connecter",
    "nav.signup": "Inscription",
    "nav.logout": "Déconnexion",
    
    // Common buttons
    "button.getStarted": "Commencer",
    "button.learnMore": "En savoir plus",
    "button.getQuote": "Obtenir un devis",
    
    // Page titles
    "page.features": "Parcours Entrepreneur",
    "page.faq": "Foire aux Questions",
    "page.contact": "Contact",
    
    // Features page
    "features.subtitle": "De l'idéation au financement : un accompagnement complet pour structurer votre projet et maximiser vos chances de succès.",
    "features.idea.title": "De l'idée au concept",
    "features.idea.description": "Méthodologie pour transformer votre idée en concept viable et validé par le marché.",
    "features.docs.title": "Documentation business",
    "features.docs.description": "Créez tous les documents nécessaires à la structuration de votre projet entrepreneurial.",
    "features.pitch.title": "Pitch et financement",
    "features.pitch.description": "Préparez votre pitch et identifiez les sources de financement adaptées à votre projet.",
    
    // Financing page
    "financing.title": "Trouvez le Financement Adapté à Votre Projet",
    "financing.subtitle": "Connectez-vous avec les investisseurs adaptés à votre startup, selon votre secteur, stade de développement et besoins de financement.",
    "financing.search": "Recherche par nom, secteur ou localisation...",
    "financing.filter": "Filtres Avancés",
    "financing.noResults": "Aucun organisme ne correspond à vos critères.",
    "financing.adjustSearch": "Essayez d'ajuster votre recherche ou vos filtres.",
    
    // More translations can be added as needed
  },
  
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.features": "Features",
    "nav.financing": "Financing",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.logout": "Logout",
    
    // Common buttons
    "button.getStarted": "Get Started",
    "button.learnMore": "Learn More",
    "button.getQuote": "Get a Quote",
    
    // Page titles
    "page.features": "Entrepreneur Journey",
    "page.faq": "Frequently Asked Questions",
    "page.contact": "Contact",
    
    // Features page
    "features.subtitle": "From ideation to financing: comprehensive support to structure your project and maximize your chances of success.",
    "features.idea.title": "From Idea to Concept",
    "features.idea.description": "Methodology to transform your idea into a viable concept validated by the market.",
    "features.docs.title": "Business Documentation",
    "features.docs.description": "Create all the necessary documents to structure your entrepreneurial project.",
    "features.pitch.title": "Pitch and Financing",
    "features.pitch.description": "Prepare your pitch and identify funding sources suited to your project.",
    
    // Financing page
    "financing.title": "Find the Right Financing for Your Project",
    "financing.subtitle": "Connect with investors suited to your startup based on your sector, development stage, and funding needs.",
    "financing.search": "Search by name, sector or location...",
    "financing.filter": "Advanced Filters",
    "financing.noResults": "No organizations match your criteria.",
    "financing.adjustSearch": "Try adjusting your search or filters.",
    
    // More translations can be added as needed
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("fr");
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
