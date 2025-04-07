
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

interface AdminAuthProps {
  onAuthSuccess: () => void;
}

export function AdminAuth({ onAuthSuccess }: AdminAuthProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // First sign in the user
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      console.log("User signed in:", data.user.id);
      
      // After successful login, check if the user is an admin
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();
        
      console.log("Admin check result:", { profileData, profileError });
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        throw profileError;
      }
      
      if (!profileData?.is_admin) {
        console.log("User is not an admin:", profileData);
        // User is not an admin, sign out and show error
        await supabase.auth.signOut();
        throw new Error("Vous n'avez pas les droits d'accès à l'administration.");
      }
      
      console.log("Admin authentication successful");
      toast({
        title: "Authentification réussie",
        description: "Bienvenue dans l'interface d'administration",
        variant: "default",
      });
      
      onAuthSuccess();
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Authentification échouée",
        description: error.message || "Une erreur s'est produite lors de l'authentification",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">Connexion Administrateur</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez votre email"
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
            placeholder="Entrez votre mot de passe"
            className="bg-black/40 border-white/10 text-white"
            required
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Connexion en cours..." : "Se connecter"}
        </Button>
      </form>
      
      <div className="mt-4 text-xs text-center text-white/50">
        <p>Cette interface est réservée aux administrateurs du site.</p>
        <p className="mt-2">Si vous n'êtes pas administrateur, veuillez revenir à l'accueil.</p>
      </div>
    </div>
  );
}
