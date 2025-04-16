
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/context/LanguageContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      
      if (session) {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
          
        if (!error && profile && profile.is_admin) {
          setIsAdmin(true);
        }
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setIsAuthenticated(!!session);
        
        if (event === 'SIGNED_OUT') {
          setIsAdmin(false);
        } 
        else if (event === 'SIGNED_IN' && session) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          if (!error && profile && profile.is_admin) {
            setIsAdmin(true);
          }
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
        variant: "default",
      });
      navigate('/');
    } catch (error: any) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Un problème est survenu lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

  const handleAuthClick = () => {
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 py-4 backdrop-blur-md bg-black/50 border-b border-white/10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img src="/lovable-uploads/5766c4d5-0e50-4267-9dce-865a0a4882ec.png" alt="Fund Road Logo" className="h-10 w-auto" />
            <Link to="/" className="font-bold text-xl">Fund Road</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
              {t("nav.home")}
            </Link>
            <Link to="/faq" className="text-foreground/80 hover:text-primary transition-colors">
              {t("nav.faq")}
            </Link>
            <Link to="/financing" className="text-foreground/80 hover:text-primary transition-colors">
              {t("nav.financing")}
            </Link>
            <Link to="/roadmap" className="text-foreground/80 hover:text-primary transition-colors">
              Roadmap
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-foreground/80 hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            
            <div className="hidden md:flex space-x-2">
              {isAuthenticated ? (
                <Button variant="outline" onClick={handleSignOut} className="text-white border-white/20 hover:bg-white/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleAuthClick} className="text-white border-white/20 hover:bg-white/10">
                    {t("nav.login")}
                  </Button>
                  <Button onClick={handleAuthClick} className="bg-white text-black hover:bg-white/90">
                    {t("nav.signup")}
                  </Button>
                </>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="mt-4 md:hidden flex flex-col space-y-4 py-4 animate-fade-in">
            <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
              {t("nav.home")}
            </Link>
            <Link to="/faq" className="text-foreground/80 hover:text-primary transition-colors">
              {t("nav.faq")}
            </Link>
            <Link to="/financing" className="text-foreground/80 hover:text-primary transition-colors">
              {t("nav.financing")}
            </Link>
            <Link to="/roadmap" className="text-foreground/80 hover:text-primary transition-colors">
              Roadmap
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-foreground/80 hover:text-primary transition-colors">
                Admin
              </Link>
            )}
            <div className="flex space-x-2 pt-2">
              {isAuthenticated ? (
                <Button variant="outline" onClick={handleSignOut} className="w-full text-white border-white/20 hover:bg-white/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t("nav.logout")}
                </Button>
              ) : (
                <>
                  <Button variant="outline" onClick={handleAuthClick} className="w-full text-white border-white/20 hover:bg-white/10">
                    {t("nav.login")}
                  </Button>
                  <Button onClick={handleAuthClick} className="w-full bg-white text-black hover:bg-white/90">
                    {t("nav.signup")}
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
