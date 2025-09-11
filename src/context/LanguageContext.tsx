
import { createContext, useState, useContext, ReactNode, useEffect } from "react";
import { translateText } from "@/utils/translationUtils";

type Language = "fr" | "en";

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  translateContent: (text: string) => Promise<string>;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Base translations for the site (French is the source language)
const translations = {
  fr: {
    // Navigation
    "nav.home": "Accueil",
    "nav.roadmap": "Parcours",
    "nav.financing": "Financement", 
    "nav.blog": "Blog",
    "nav.features": "Fonctionnalités",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.login": "Se connecter",
    "nav.signup": "Inscription",
    "nav.logout": "Déconnexion",
    
    // Common buttons
    "button.getStarted": "Commencer",
    "button.learnMore": "En savoir plus",
    "button.getQuote": "Obtenir un devis",
    "button.seeMore": "En savoir plus",
    "button.getPersonalizedQuote": "Obtenir un devis personnalisé",
    "button.contactUs": "Nous contacter",
    "button.requestQuote": "Demander un devis",
    "button.seeAllFeatures": "Voir toutes les fonctionnalités",
    
    // Page titles & SEO
    "seo.homepage.title": "Fund Road - Accélérez votre parcours entrepreneurial | Levée de fonds & Business Plan",
    "seo.homepage.description": "Transformez votre idée en startup financée avec Fund Road. Outils interactifs, roadmap personnalisée et accompagnement expert pour votre levée de fonds, business plan et pitch deck.",
    "seo.homepage.ogTitle": "Fund Road - Accélérez votre parcours entrepreneurial",
    "seo.homepage.ogDescription": "De l'idée au financement : ressources, outils et accompagnement pour réussir votre startup",
    
    // Hero section
    "hero.badge": "Version Bêta",
    "hero.title": "Transformez votre",
    "hero.titleHighlight": "idée",
    "hero.titleEnd": "en startup financée",
    "hero.subtitle": "Accompagnement complet de l'idéation au financement avec des outils interactifs, une roadmap personnalisée et l'expertise nécessaire pour réussir.",
    "hero.scrollDown": "Défiler vers le bas",
    
    // Services section
    "services.title": "Nos",
    "services.titleHighlight": "services",
    "services.titleEnd": "premium",
    "services.subtitle": "Bénéficiez d'un accompagnement personnalisé avec nos services experts pour accélérer votre développement et maximiser vos chances de succès.",
    "services.investors.title": "Pour les investisseurs",
    "services.investors.description": "Accédez à des opportunités d'investissement dans des startups à fort potentiel, rigoureusement sélectionnées et accompagnées par nos experts.",
    "services.investors.feature1": "Due diligence approfondie",
    "services.investors.feature2": "Projets pré-qualifiés",
    "services.ip.title": "Stratégie IP",
    "services.ip.description": "Protection et valorisation de vos innovations avec une stratégie de propriété intellectuelle sur-mesure adaptée à votre secteur.",
    "services.ip.feature1": "Audit IP complet",
    "services.ip.feature2": "Stratégie de protection",
    "services.mvp.title": "Création MVP/Site web",
    "services.mvp.description": "Transformez votre concept en produit minimum viable ou site web professionnel pour valider votre marché et attirer vos premiers utilisateurs.",
    "services.mvp.feature1": "Développement agile",
    "services.mvp.feature2": "Tests utilisateurs",
    
    // Features section
    "features.title": "Fonctionnalités", 
    "features.titleHighlight": "principales",
    "features.subtitle": "Découvrez notre écosystème complet d'outils et ressources conçus pour accompagner chaque étape de votre parcours entrepreneurial.",
    "features.ideation.title": "Idéation & Validation",
    "features.ideation.description": "Transformez votre idée en concept viable avec notre méthodologie de validation par le marché et nos outils d'analyse.",
    "features.documentation.title": "Documentation & Structure", 
    "features.documentation.description": "Créez tous les documents stratégiques nécessaires : Business Plan, Business Model Canvas, et plus encore.",
    "features.pitch.title": "Pitch & Financement",
    "features.pitch.description": "Maîtrisez l'art du pitch et identifiez les meilleures sources de financement pour votre projet.",
    
    // Dashboard section
    "dashboard.title": "Tableau de bord",
    "dashboard.subtitle": "Suivez votre progression et accédez à vos outils",
    "dashboard.tasks": "Vos tâches",
    "dashboard.progressReport": "Rapport de progression",
    "dashboard.task1": "Valider mon idée de business",
    "dashboard.task2": "Créer mon Business Model Canvas", 
    "dashboard.task3": "Réaliser mon Business Plan",
    "dashboard.stats.templates": "Templates disponibles",
    "dashboard.stats.templatesDesc": "Outils prêts à utiliser",
    "dashboard.stats.entrepreneurs": "Entrepreneurs actifs",
    "dashboard.stats.entrepreneursDesc": "Communauté grandissante",
    "dashboard.stats.successRate": "Taux de réussite",
    "dashboard.stats.successRateDesc": "Projets aboutis",
    "dashboard.stats.funding": "Fonds levés",
    "dashboard.stats.fundingDesc": "Capital mobilisé",
    
    // Footer
    "footer.description": "Accompagnez votre entreprise de l'idée au financement avec notre plateforme intuitive dédiée aux entrepreneurs.",
    "footer.entrepreneurJourney": "Parcours Entrepreneur",
    "footer.journeySteps": "Étapes du parcours",
    "footer.businessModelCanvas": "Business Model Canvas", 
    "footer.businessPlan": "Business Plan",
    "footer.pitchDeck": "Pitch Deck",
    "footer.financing": "Financements",
    "footer.usefulLinks": "Liens utiles",
    "footer.aboutUs": "À propos de nous",
    "footer.contactUs": "Nous contacter",
    "footer.faq": "FAQ",
    "footer.financingOptions": "Options de financement",
    "footer.copyright": "Tous droits réservés.",
    "footer.terms": "Conditions d'utilisation",
    "footer.privacy": "Politique de confidentialité",
    "footer.cookies": "Politique de cookies",
    
    // Social media
    "social.twitter": "Suivez-nous sur Twitter",
    "social.linkedin": "Connectez-vous avec nous sur LinkedIn", 
    "social.instagram": "Suivez-nous sur Instagram",
    "social.github": "Visitez notre GitHub",
    "social.facebook": "Suivez-nous sur Facebook",
    
    // Financing page
    "financing.title": "Trouvez le Financement Adapté à Votre Projet",
    "financing.subtitle": "Connectez-vous avec les investisseurs adaptés à votre startup, selon votre secteur, stade de développement et besoins de financement.",
    "financing.search": "Recherche par nom, secteur ou localisation...",
    "financing.filter": "Filtres Avancés",
    "financing.noResults": "Aucun organisme ne correspond à vos critères.",
    "financing.adjustSearch": "Essayez d'ajuster votre recherche ou vos filtres.",
  },
  
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.roadmap": "Journey", 
    "nav.financing": "Financing",
    "nav.blog": "Blog",
    "nav.features": "Features",
    "nav.faq": "FAQ",
    "nav.contact": "Contact",
    "nav.login": "Login",
    "nav.signup": "Sign Up",
    "nav.logout": "Logout",
    
    // Common buttons
    "button.getStarted": "Get Started",
    "button.learnMore": "Learn More",
    "button.getQuote": "Get a Quote",
    "button.seeMore": "Learn More",
    "button.getPersonalizedQuote": "Get a Personalized Quote",
    "button.contactUs": "Contact Us",
    "button.requestQuote": "Request a Quote",
    "button.seeAllFeatures": "See All Features",
    
    // Page titles & SEO
    "seo.homepage.title": "Fund Road - Accelerate your entrepreneurial journey | Fundraising & Business Plan",
    "seo.homepage.description": "Transform your idea into a funded startup with Fund Road. Interactive tools, personalized roadmap and expert support for your fundraising, business plan and pitch deck.",
    "seo.homepage.ogTitle": "Fund Road - Accelerate your entrepreneurial journey",
    "seo.homepage.ogDescription": "From idea to funding: resources, tools and support to succeed with your startup",
    
    // Hero section
    "hero.badge": "Beta Version",
    "hero.title": "Transform your",
    "hero.titleHighlight": "idea",
    "hero.titleEnd": "into a funded startup",
    "hero.subtitle": "Complete support from ideation to financing with interactive tools, personalized roadmap and the expertise needed to succeed.",
    "hero.scrollDown": "Scroll down",
    
    // Services section
    "services.title": "Our", 
    "services.titleHighlight": "premium",
    "services.titleEnd": "services",
    "services.subtitle": "Benefit from personalized support with our expert services to accelerate your development and maximize your chances of success.",
    "services.investors.title": "For investors",
    "services.investors.description": "Access investment opportunities in high-potential startups, rigorously selected and supported by our experts.",
    "services.investors.feature1": "Thorough due diligence",
    "services.investors.feature2": "Pre-qualified projects",
    "services.ip.title": "IP Strategy",
    "services.ip.description": "Protection and valorization of your innovations with a tailor-made intellectual property strategy adapted to your sector.",
    "services.ip.feature1": "Complete IP audit",
    "services.ip.feature2": "Protection strategy",
    "services.mvp.title": "MVP/Website Creation",
    "services.mvp.description": "Transform your concept into a minimum viable product or professional website to validate your market and attract your first users.",
    "services.mvp.feature1": "Agile development",
    "services.mvp.feature2": "User testing",
    
    // Features section
    "features.title": "Key",
    "features.titleHighlight": "features", 
    "features.subtitle": "Discover our complete ecosystem of tools and resources designed to support every step of your entrepreneurial journey.",
    "features.ideation.title": "Ideation & Validation",
    "features.ideation.description": "Transform your idea into a viable concept with our market validation methodology and analysis tools.",
    "features.documentation.title": "Documentation & Structure",
    "features.documentation.description": "Create all the necessary strategic documents: Business Plan, Business Model Canvas, and more.",
    "features.pitch.title": "Pitch & Financing",
    "features.pitch.description": "Master the art of pitching and identify the best funding sources for your project.",
    
    // Dashboard section
    "dashboard.title": "Dashboard",
    "dashboard.subtitle": "Track your progress and access your tools",
    "dashboard.tasks": "Your tasks",
    "dashboard.progressReport": "Progress report",
    "dashboard.task1": "Validate my business idea",
    "dashboard.task2": "Create my Business Model Canvas",
    "dashboard.task3": "Complete my Business Plan",
    "dashboard.stats.templates": "Available templates",
    "dashboard.stats.templatesDesc": "Ready-to-use tools",
    "dashboard.stats.entrepreneurs": "Active entrepreneurs", 
    "dashboard.stats.entrepreneursDesc": "Growing community",
    "dashboard.stats.successRate": "Success rate",
    "dashboard.stats.successRateDesc": "Completed projects",
    "dashboard.stats.funding": "Funds raised",
    "dashboard.stats.fundingDesc": "Capital mobilized",
    
    // Footer
    "footer.description": "Support your business from idea to funding with our intuitive platform dedicated to entrepreneurs.",
    "footer.entrepreneurJourney": "Entrepreneur Journey",
    "footer.journeySteps": "Journey steps",
    "footer.businessModelCanvas": "Business Model Canvas",
    "footer.businessPlan": "Business Plan", 
    "footer.pitchDeck": "Pitch Deck",
    "footer.financing": "Financing",
    "footer.usefulLinks": "Useful links",
    "footer.aboutUs": "About us",
    "footer.contactUs": "Contact us",
    "footer.faq": "FAQ",
    "footer.financingOptions": "Financing options", 
    "footer.copyright": "All rights reserved.",
    "footer.terms": "Terms of use",
    "footer.privacy": "Privacy policy",
    "footer.cookies": "Cookie policy",
    
    // Social media
    "social.twitter": "Follow us on Twitter",
    "social.linkedin": "Connect with us on LinkedIn",
    "social.instagram": "Follow us on Instagram", 
    "social.github": "Visit our GitHub",
    "social.facebook": "Follow us on Facebook",
    
    // Financing page
    "financing.title": "Find the Right Financing for Your Project",
    "financing.subtitle": "Connect with investors suited to your startup based on your sector, development stage, and funding needs.",
    "financing.search": "Search by name, sector or location...",
    "financing.filter": "Advanced Filters",
    "financing.noResults": "No organizations match your criteria.",
    "financing.adjustSearch": "Try adjusting your search or filters.",
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    // Load language from localStorage or default to French
    return (localStorage.getItem('language') as Language) || "fr";
  });
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, string>>({});
  
  // Save language to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  // Function to translate text using DeepL API
  const translateContent = async (text: string): Promise<string> => {
    if (language === "fr") return text; // If French (source language), no need to translate
    try {
      return await translateText(text, language.toUpperCase(), "FR");
    } catch (error) {
      console.error("Translation error:", error);
      return text;
    }
  };
  
  const t = (key: string): string => {
    // First check if we have a static translation
    const staticTranslation = translations[language][key as keyof typeof translations[typeof language]];
    if (staticTranslation) return staticTranslation;
    
    // Then check dynamic translations
    if (dynamicTranslations[key]) return dynamicTranslations[key];
    
    // If no translation is found, return the key
    return key;
  };
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateContent }}>
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
