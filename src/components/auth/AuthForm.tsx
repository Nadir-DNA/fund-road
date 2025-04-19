
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LogIn } from "lucide-react";
import { LoadingIndicator } from "../ui/LoadingIndicator";

interface AuthFormProps {
  isLogin: boolean;
  onToggleMode: () => void;
  initialEmail?: string;
}

export default function AuthForm({ isLogin, onToggleMode, initialEmail = "" }: AuthFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isLogin && !acceptedTerms) {
      toast({
        title: "Erreur d'inscription",
        description: "Veuillez accepter les conditions d'utilisation",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (error) throw error;
        
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur Fund Road",
        });
        
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + '/auth'
          }
        });
        
        if (error) throw error;
        
        // Send custom verification email
        try {
          const response = await fetch('https://lhvuoorzmjjnaasahmyw.supabase.co/functions/v1/send-email-verification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email,
              confirmation_url: `${window.location.origin}/auth?email=${encodeURIComponent(email)}`
            })
          });

          if (!response.ok) {
            throw new Error('Failed to send verification email');
          }
          
          toast({
            title: "Inscription réussie",
            description: "Veuillez vérifier votre email pour confirmer votre compte",
          });
          
          onToggleMode();
        } catch (emailError) {
          console.error("Erreur d'envoi d'email:", emailError);
          toast({
            title: "Problème d'envoi d'email",
            description: "L'inscription a réussi mais nous n'avons pas pu envoyer l'email de vérification",
            variant: "destructive",
          });
        }
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

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erreur de connexion Google",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

        {!isLogin && (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={acceptedTerms}
              onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm">
              J'accepte les <a href="/terms" className="text-primary hover:underline">conditions d'utilisation</a>
            </Label>
          </div>
        )}
        
        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-accent" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoadingIndicator size="sm" className="mr-2" />
              {isLogin ? "Connexion en cours..." : "Inscription en cours..."}
            </>
          ) : (
            isLogin ? "Se connecter" : "S'inscrire"
          )}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Ou</span>
          </div>
        </div>

        <Button 
          type="button"
          variant="outline" 
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          {isLoading ? <LoadingIndicator size="sm" /> : <LogIn className="mr-2" />}
          Continuer avec Google
        </Button>
      </form>
      
      <div className="mt-6 text-center">
        <button 
          type="button"
          onClick={onToggleMode}
          className="text-sm text-white/60 hover:text-primary"
          disabled={isLoading}
        >
          {isLogin 
            ? "Pas encore de compte ? S'inscrire" 
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
