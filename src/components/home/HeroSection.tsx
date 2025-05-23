import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';

export default function HeroSection() {
  const { t } = useLanguage();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => subscription.unsubscribe();
  }, []);
  
  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            Fund Road, ton copilote pour construire, <br className="hidden sm:inline" />
            structurer et financer ta startup
          </h1>
          
          <div className="text-xl text-white/70 space-y-1 mb-8">
            <p>
              Un parcours guidé pour vous accompagner à chaque étape clé de votre aventure entrepreneuriale, 
              avec des ressources adaptées à chaque phase.
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg">
              <Link to={isAuthenticated ? "/roadmap" : "/auth"} className="flex items-center">
                Inscris-toi pour commencer ton parcours gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
