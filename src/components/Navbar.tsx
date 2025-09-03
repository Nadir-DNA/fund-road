
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
    <nav className="fixed top-0 left-0 right-0 z-50 h-[72px] py-4 backdrop-blur-md bg-black/50 border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link to="/">
              <img src="/lovable-uploads/965b31f2-63c1-45e2-9ab0-95b60a8b9d83.png" alt="Fund Road Logo" className="h-10 w-auto" />
            </Link>
            <Link to="/" className="font-bold text-xl">Fund Road</Link>
          </div>
          
          <NavLinks />

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <AuthButtons isAuthenticated={isAuthenticated} onSignOut={handleSignOut} onAuthClick={handleAuthClick} />
            
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && <MobileMenu isAuthenticated={isAuthenticated} onSignOut={handleSignOut} onAuthClick={handleAuthClick} />}
        
        {/* Beta flag positioned prominently */}
        <div className="absolute bottom-0 left-4 z-50">
          <div className="bg-primary px-3 rounded-b-md flex items-center gap-2 text-sm font-medium text-white shadow-md py-0 my-[39px] mx-[59px]">
            <Flag className="h-4 w-4" />
            <span>Beta</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
