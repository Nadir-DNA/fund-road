
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminResourceForm } from "@/components/AdminResourceForm";
import { AdminInvestorForm } from "@/components/AdminInvestorForm";
import { AdminAuth } from "@/components/AdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import type { Database } from "@/integrations/supabase/types";

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotAdminDialog, setShowNotAdminDialog] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already authenticated and is an admin
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Session found:", session.user.id);
          setIsAuthenticated(true);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
          
          console.log("Profile data:", profile, "Error:", error);
            
          if (!error && profile && profile.is_admin) {
            console.log("User is admin");
            setIsAdmin(true);
          } else {
            // User is authenticated but not an admin
            console.log("User is not admin or error fetching profile");
            setShowNotAdminDialog(true);
          }
        } else {
          // User is not authenticated, redirect to auth page
          console.log("No session found, redirecting to auth page");
          toast({
            title: "Accès refusé",
            description: "Vous devez être connecté pour accéder à cette page.",
            variant: "destructive",
          });
          navigate('/auth');
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast({
          title: "Erreur",
          description: "Une erreur est survenue lors de la vérification de vos droits.",
          variant: "destructive",
        });
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          console.log("Auth state changed: SIGNED_IN", session.user.id);
          setIsAuthenticated(true);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();
            
          console.log("Profile data after sign in:", profile, "Error:", error);
            
          if (!error && profile && profile.is_admin) {
            console.log("User is admin after state change");
            setIsAdmin(true);
          } else {
            // User is authenticated but not an admin
            console.log("User is not admin after state change");
            setShowNotAdminDialog(true);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("Auth state changed: SIGNED_OUT");
          setIsAuthenticated(false);
          setIsAdmin(false);
          navigate('/auth');
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const handleAuthSuccess = () => {
    console.log("Auth success handler called");
    setIsAuthenticated(true);
    setIsAdmin(true);
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/auth');
  };
  
  const handleNotAdminDialogClose = async () => {
    await supabase.auth.signOut();
    setShowNotAdminDialog(false);
    navigate('/');
  };

  console.log("Current state:", { isLoading, isAuthenticated, isAdmin, showNotAdminDialog });

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  // If the user is not authenticated or not an admin, show the auth form
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
        
        <Navbar />
        
        <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
          <div className="max-w-md mx-auto">
            <AdminAuth onAuthSuccess={handleAuthSuccess} />
          </div>
        </main>
        
        <Dialog open={showNotAdminDialog} onOpenChange={setShowNotAdminDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accès refusé</DialogTitle>
              <DialogDescription>
                Vous n'avez pas les droits d'administrateur nécessaires pour accéder à cette page.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={handleNotAdminDialogClose}>Retourner à l'accueil</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-center">Interface d'Administration</h1>
          <Button variant="outline" onClick={handleSignOut}>Se déconnecter</Button>
        </div>
        
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="resources">Gestion des Ressources</TabsTrigger>
            <TabsTrigger value="investors">Gestion des Investisseurs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="resources" className="p-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
            <AdminResourceForm />
          </TabsContent>
          
          <TabsContent value="investors" className="p-6 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl">
            <AdminInvestorForm />
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
