
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/LanguageContext';

export default function HeroSection() {
  const { t } = useLanguage();
  
  return (
    <section className="py-24 md:py-32 bg-black">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          De l'idée au financement : votre parcours entrepreneurial
        </h1>
        <p className="text-xl text-white/70 max-w-3xl mx-auto mb-12">
          Structurez votre projet étape par étape et maximisez vos chances de réussite avec notre plateforme dédiée aux entrepreneurs.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild className="bg-gradient-to-r from-primary to-accent text-white px-8 py-6 text-lg">
            <Link to="/features" className="flex items-center">
              En savoir plus
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
