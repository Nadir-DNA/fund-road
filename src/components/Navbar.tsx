import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    await supabase.auth.signOut();
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
      variant: "default",
    });
    navigate('/');
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
              Accueil
            </Link>
            <Link to="/features" className="text-foreground/80 hover:text-primary transition-colors">
              Parcours Entrepreneur
            </Link>
            <Link to="/faq" className="text-foreground/80 hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link to="/financing" className="text-foreground/80 hover:text-primary transition-colors">
              Financements
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-foreground/80 hover:text-primary transition-colors">
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden md:flex space-x-2">
              {isAuthenticated ? (
                <Button variant="outline" onClick={handleSignOut} className="text-white border-white/20 hover:bg-white/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="text-white border-white/20 hover:bg-white/10">
                    <Link to="/auth">Connexion</Link>
                  </Button>
                  <Button asChild className="bg-white text-black hover:bg-white/90">
                    <Link to="/auth">Inscription</Link>
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
              Accueil
            </Link>
            <Link to="/features" className="text-foreground/80 hover:text-primary transition-colors">
              Parcours Entrepreneur
            </Link>
            <Link to="/faq" className="text-foreground/80 hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link to="/financing" className="text-foreground/80 hover:text-primary transition-colors">
              Financements
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
                  Déconnexion
                </Button>
              ) : (
                <>
                  <Button variant="outline" asChild className="w-full text-white border-white/20 hover:bg-white/10">
                    <Link to="/auth">Connexion</Link>
                  </Button>
                  <Button asChild className="w-full bg-white text-black hover:bg-white/90">
                    <Link to="/auth">Inscription</Link>
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
