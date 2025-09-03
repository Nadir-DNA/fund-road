
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: Page non trouvée:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <div className="text-center z-10 px-4">
        <img src="/lovable-uploads/5766c4d5-0e50-4267-9dce-865a0a4882ec.png" alt="Fund Road Logo" className="h-20 w-auto mx-auto mb-6" />
        <h1 className="text-7xl font-bold mb-4">404</h1>
        <p className="text-2xl text-white/70 mb-6">Page non trouvée</p>
        <p className="text-white/50 mb-8 max-w-md mx-auto">
          Cette page n'existe pas ou a été déplacée. Revenez à l'accueil pour continuer votre parcours entrepreneurial.
        </p>
        <Button asChild className="bg-gradient-to-r from-primary to-accent text-white">
          <Link to="/" className="inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
