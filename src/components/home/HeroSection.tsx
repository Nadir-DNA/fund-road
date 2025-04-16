
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            Accompagnement entrepreneurial <br className="hidden sm:inline" />
            de l'idée au financement
          </h1>
          
          <div className="text-xl text-white/70 space-y-1 mb-8">
            <p className="font-medium text-2xl mb-2">
              Structurez votre projet et <br className="hidden sm:inline" />
              Trouvez vos financements
            </p>
            <p>
              Un parcours guidé pour vous accompagner à chaque étape clé de votre aventure entrepreneuriale, 
              avec des ressources adaptées à chaque phase.
            </p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg">
              <Link to="/roadmap" className="flex items-center">
                Commencer mon parcours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
