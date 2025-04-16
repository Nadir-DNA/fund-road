
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth state...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Session:", session ? "exists" : "none");
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        // Login user
        console.log("Attempting login with:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        console.log("Login successful:", data.user?.id);
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Fund Road",
          variant: "default",
        });
        
        // Check if user is admin
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();
          
        console.log("Profile data:", profileData, "Error:", profileError);
        
        // Redirect to admin page if user is admin
        if (!profileError && profileData?.is_admin) {
          console.log("User is admin, redirecting to admin page");
          navigate('/admin');
        } else {
          // Redirect to home page after successful login
          console.log("User is not admin, redirecting to home page");
          navigate('/');
        }
      } else {
        // Register user
        console.log("Attempting registration with:", email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        console.log("Registration successful");
        toast({
          title: "Inscription réussie",
          description: "Veuillez vérifier votre email pour confirmer votre compte",
          variant: "default",
        });
        
        // Switch to login view after successful signup
        setIsLogin(true);
      }
    } catch (error: any) {
      console.error("Erreur d'authentification:", error);
      toast({
        title: isLogin ? "Échec de connexion" : "Échec d'inscription",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Show loading state while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Redirect if authenticated
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Background gradient effects */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
          <h1 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? "Connexion" : "Inscription"}
          </h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                className="bg-black/40 border-white/10 text-white"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                className="bg-black/40 border-white/10 text-white"
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
              {isLoading 
                ? (isLogin ? "Connexion en cours..." : "Inscription en cours...") 
                : (isLogin ? "Se connecter" : "S'inscrire")}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <button 
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-white/60 hover:text-primary"
            >
              {isLogin 
                ? "Pas encore de compte ? S'inscrire" 
                : "Déjà un compte ? Se connecter"}
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
