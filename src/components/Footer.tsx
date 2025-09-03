import { Link } from "react-router-dom";
import { Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="border-t border-white/10 bg-black/80 relative z-10">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8 sm:mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/965b31f2-63c1-45e2-9ab0-95b60a8b9d83.png" alt="Fund Road Logo" className="h-8 w-auto" />
              <span className="font-bold text-lg sm:text-xl">Fund Road</span>
            </div>
            <p className="text-white/60 max-w-xs text-sm sm:text-base">
              {t("footer.description")}
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10"
                aria-label={t("social.twitter")}
              >
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10"
                asChild
              >
                <a 
                  href="https://www.linkedin.com/in/nadir-daoudi-531909139/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label={t("social.linkedin")}
                >
                  <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
                </a>
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10"
                aria-label={t("social.instagram")}
              >
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10"
                aria-label={t("social.github")}
              >
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10"
                aria-label={t("social.facebook")}
              >
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">{t("footer.entrepreneurJourney")}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/roadmap" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  {t("footer.journeySteps")}
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  {t("footer.businessModelCanvas")}
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  {t("footer.businessPlan")}
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  {t("footer.pitchDeck")}
                </Link>
              </li>
              <li>
                <Link to="/financing" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  {t("footer.financing")}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">{t("footer.usefulLinks")}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  {t("footer.contactUs")}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link to="/financing" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  {t("footer.financingOptions")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs sm:text-sm text-white/60">
            © {new Date().getFullYear()} Fund Road. {t("footer.copyright")}
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0 text-xs sm:text-sm">
            <Link to="/terms" className="text-white/60 hover:text-primary transition-colors">
              {t("footer.terms")}
            </Link>
            <Link to="/privacy" className="text-white/60 hover:text-primary transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link to="/faq" className="text-white/60 hover:text-primary transition-colors">
              {t("footer.cookies")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
