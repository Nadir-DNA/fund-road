
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useToast } from "@/components/ui/use-toast";
import { getLastPath, clearLastPath } from "@/utils/navigationUtils";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Fund Road!",
        });
        
        // Check for return path and redirect
        const returnPath = getLastPath();
        clearLastPath();
        
        if (returnPath) {
          navigate(returnPath);
        } else {
          navigate("/roadmap");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Compte créé",
          description: "Vérifiez votre email pour confirmer votre compte.",
        });
      }
    } catch (error: any) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
