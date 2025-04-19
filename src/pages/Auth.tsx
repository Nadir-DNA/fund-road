
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthForm from "@/components/auth/AuthForm";
import BetaTag from "@/components/common/BetaTag";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
        
        // If authenticated, redirect to the last visited page or home
        if (session) {
          // Get last visited page from localStorage or default to "/"
          const lastPath = localStorage.getItem('lastPath') || '/';
          // Reset for next time
          localStorage.removeItem('lastPath');
          // Navigate after a short delay to ensure state is updated
          setTimeout(() => navigate(lastPath), 100);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setCheckingAuth(false);
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setIsAuthenticated(true);
          // Navigate after state update
          setTimeout(() => navigate('/'), 100);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [navigate]);
  
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <LoadingIndicator size="lg" />
          <p className="text-white/70">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <BetaTag />
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 flex items-center justify-center">
        <AuthForm 
          isLogin={isLogin} 
          onToggleMode={() => setIsLogin(!isLogin)} 
        />
      </main>
      
      <Footer />
    </div>
  );
}
