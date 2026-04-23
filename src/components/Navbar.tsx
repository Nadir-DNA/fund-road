import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLinks } from "./nav/NavLinks";
import { AuthButtons } from "./nav/AuthButtons";
import { MobileMenu } from "./nav/MobileMenu";
import LanguageSwitcher from "./LanguageSwitcher";
import { useAuthStatus } from "@/hooks/useAuthStatus";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, handleSignOut } = useAuthStatus();
  
  const handleAuthClick = () => {
    navigate('/auth');
  };
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[68px] backdrop-blur-xl bg-background/70 border-b border-white/[0.06]">
      <div className="container mx-auto px-4 md:px-6 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5">
              <img 
                src="/lovable-uploads/965b31f2-63c1-45e2-9ab0-95b60a8b9d83.png" 
                alt="Fund Road" 
                className="h-8 w-auto" 
              />
              <span className="font-bold text-lg tracking-tight">Fund Road</span>
            </Link>
            {/* Beta badge — intégré proprement dans le flux */}
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-semibold text-primary uppercase tracking-wider">
              Beta
            </span>
          </div>
          
          {/* Desktop nav */}
          <div className="hidden md:flex items-center">
            <NavLinks />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>
            
            <div className="hidden md:block">
              <AuthButtons 
                isAuthenticated={isAuthenticated} 
                onSignOut={handleSignOut} 
                onAuthClick={handleAuthClick} 
              />
            </div>
            
            {/* Mobile menu toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:h-9 md:w-9" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <MobileMenu 
          isAuthenticated={isAuthenticated} 
          onSignOut={handleSignOut} 
          onAuthClick={handleAuthClick} 
        />
      )}
    </nav>
  );
}
