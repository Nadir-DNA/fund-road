
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useToast } from "@/components/ui/use-toast";
import { getLastPath, getResourceReturnPath, clearLastPath, clearResourceReturnPath } from "@/utils/navigationUtils";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [returnPath, setReturnPath] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check if there's a return path when the component mounts
  useEffect(() => {
    const checkReturnPaths = () => {
      // Check for return paths in order of priority
      const resourcePath = getResourceReturnPath();
      const lastPath = getLastPath();
      
      if (resourcePath) {
        console.log("Auth: Found resource return path:", resourcePath);
        setReturnPath(resourcePath);
      } else if (lastPath) {
        console.log("Auth: Found last path:", lastPath);
        setReturnPath(lastPath);
      }
    };
    
    checkReturnPaths();
  }, []);
  
  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        setAuthChecked(true);
        
        if (data.session) {
          console.log("Auth: User already authenticated, redirecting");
          handleRedirect();
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthChecked(true);
      }
    };
    
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log("Auth: Auth state changed - user signed in, redirecting");
        handleRedirect();
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleRedirect = () => {
    if (returnPath) {
      console.log("Auth: Redirecting to:", returnPath);
      
      // Add a small delay for better UX
      setTimeout(() => {
        navigate(returnPath || "/roadmap");
        // Clear stored paths after successful redirect
        clearResourceReturnPath();
        clearLastPath();
        
        toast({
          title: "Connexion réussie",
          description: "Redirection vers votre dernière page...",
          duration: 3000
        });
      }, 500);
    } else {
      console.log("Auth: No return path found, redirecting to roadmap");
      navigate("/roadmap");
      
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur Fund Road!",
      });
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        console.log("Auth: Attempting login with email:", email);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        console.log("Auth: Login successful");
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Fund Road!",
        });
        
        // Will be redirected by the auth state change listener
      } else {
        console.log("Auth: Attempting signup with email:", email);
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        console.log("Auth: Signup successful");
        
        toast({
          title: "Compte créé",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
        
        // Let's automatically log in the user if email confirmation is not required
        if (data.session) {
          console.log("Auth: Auto-login after signup");
          // Will be redirected by the auth state change listener
        }
      }
    } catch (error: any) {
      console.error("Auth Error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If still checking auth, show loading indicator
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <LoadingIndicator size="lg" />
        <span className="ml-2">Vérification de l'authentification...</span>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isLogin ? "Connexion" : "Créer un compte"}</CardTitle>
          <CardDescription>
            {isLogin
              ? "Connectez-vous pour accéder à votre compte"
              : "Créez un compte pour commencer"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
                minLength={6}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <LoadingIndicator size="sm" />
              ) : isLogin ? (
                "Se connecter"
              ) : (
                "S'inscrire"
              )}
            </Button>
            
            <div className="text-center mt-4">
              <Button
                variant="link"
                type="button"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin
                  ? "Pas encore de compte ? S'inscrire"
                  : "Déjà un compte ? Se connecter"}
              </Button>
            </div>
            
            {returnPath && (
              <div className="text-xs text-center text-muted-foreground mt-4">
                Vous serez redirigé vers votre dernière page après connexion.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
