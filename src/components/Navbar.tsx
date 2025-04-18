
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Flag } from "lucide-react";
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
    <div className="h-[72px]">
      <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] py-4 backdrop-blur-md bg-black/50 border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img src="/lovable-uploads/965b31f2-63c1-45e2-9ab0-95b60a8b9d83.png" alt="Fund Road Logo" className="h-10 w-auto" />
              <a href="/" className="font-bold text-xl">Fund Road</a>
            </div>
            
            <NavLinks isAuthenticated={isAuthenticated} />

            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              
              <AuthButtons 
                isAuthenticated={isAuthenticated}
                onSignOut={handleSignOut}
                onAuthClick={handleAuthClick}
              />
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {isMenuOpen && (
            <MobileMenu
              isAuthenticated={isAuthenticated}
              onSignOut={handleSignOut}
              onAuthClick={handleAuthClick}
            />
          )}
          
          {/* Flag icon at the bottom left of the navbar */}
          <div className="absolute bottom-[-14px] left-4">
            <div className="bg-primary px-2 py-1 rounded-b-md flex items-center gap-1 text-xs font-medium text-white">
              <Flag className="h-3 w-3" />
              <span>Beta</span>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
