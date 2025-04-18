
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface MobileMenuProps {
  isAuthenticated: boolean;
  onSignOut: () => void;
  onAuthClick: () => void;
}

export const MobileMenu = ({ isAuthenticated, onSignOut, onAuthClick }: MobileMenuProps) => {
  const { t } = useLanguage();

  return (
    <div className="mt-4 md:hidden flex flex-col space-y-4 py-4 animate-fade-in">
      <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
        Accueil
      </Link>
      <Link to={isAuthenticated ? "/roadmap" : "/auth"} className="text-foreground/80 hover:text-primary transition-colors">
        Roadmap
      </Link>
      <Link to={isAuthenticated ? "/financing" : "/auth"} className="text-foreground/80 hover:text-primary transition-colors">
        Financement
      </Link>
      <Link to="/about" className="text-foreground/80 hover:text-primary transition-colors">
        À propos
      </Link>
      <Link to="/faq" className="text-foreground/80 hover:text-primary transition-colors">
        FAQ
      </Link>
      <Link to="/contact" className="text-foreground/80 hover:text-primary transition-colors">
        Contact
      </Link>
      
      <div className="flex space-x-2 pt-2">
        {isAuthenticated ? (
          <Button variant="outline" onClick={onSignOut} className="w-full text-white border-white/20 hover:bg-white/10">
            <LogOut className="h-4 w-4 mr-2" />
            {t("nav.logout")}
          </Button>
        ) : (
          <>
            <Button variant="outline" onClick={onAuthClick} className="w-full text-white border-white/20 hover:bg-white/10">
              {t("nav.login")}
            </Button>
            <Button onClick={onAuthClick} className="w-full bg-white text-black hover:bg-white/90">
              {t("nav.signup")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
