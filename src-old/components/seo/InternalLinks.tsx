import { Link } from 'react-router-dom';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InternalLink {
  title: string;
  href: string;
  description: string;
  isExternal?: boolean;
}

interface InternalLinksProps {
  currentPage: string;
  maxLinks?: number;
}

// Configuration des liens internes pertinents par page
const linksByPage: Record<string, InternalLink[]> = {
  '/': [
    {
      title: 'Découvrir toutes nos fonctionnalités',
      href: '/fonctionnalites',
      description: 'Explorez tous les outils disponibles pour votre parcours entrepreneurial'
    },
    {
      title: 'Lire notre blog',
      href: '/blog',
      description: 'Conseils et guides pour réussir votre projet entrepreneurial'
    },
    {
      title: 'Voir nos tarifs',
      href: '/tarifs',
      description: 'Choisissez l\'offre adaptée à vos besoins'
    },
    {
      title: 'Nous contacter',
      href: '/contact',
      description: 'Obtenez un devis personnalisé pour votre projet'
    }
  ],
  '/blog': [
    {
      title: 'Commencer votre parcours',
      href: '/',
      description: 'Découvrez Fund Road et nos outils pour entrepreneurs'
    },
    {
      title: 'Voir nos fonctionnalités',
      href: '/fonctionnalites',
      description: 'Outils et méthodes pour structurer votre projet'
    },
    {
      title: 'Demander un accompagnement',
      href: '/contact',
      description: 'Bénéficiez d\'un coaching personnalisé'
    }
  ],
  '/fonctionnalites': [
    {
      title: 'Retour à l\'accueil',
      href: '/',
      description: 'Découvrez Fund Road, votre partenaire entrepreneurial'
    },
    {
      title: 'Nos conseils sur le blog',
      href: '/blog',
      description: 'Articles et guides pour réussir votre startup'
    },
    {
      title: 'Comparer nos offres',
      href: '/tarifs',
      description: 'Trouvez l\'accompagnement qui vous convient'
    }
  ],
  '/contact': [
    {
      title: 'Découvrir Fund Road',
      href: '/',
      description: 'Apprenez-en plus sur notre plateforme'
    },
    {
      title: 'Nos tarifs et services',
      href: '/tarifs',
      description: 'Détail de nos offres d\'accompagnement'
    },
    {
      title: 'Lire nos articles',
      href: '/blog',
      description: 'Ressources gratuites pour entrepreneurs'
    }
  ],
  '/tarifs': [
    {
      title: 'Voir toutes les fonctionnalités',
      href: '/fonctionnalites',
      description: 'Détail des outils inclus dans chaque offre'
    },
    {
      title: 'Nous contacter',
      href: '/contact',
      description: 'Questions sur nos services ? Contactez-nous'
    },
    {
      title: 'Conseils gratuits sur le blog',
      href: '/blog',
      description: 'Ressources gratuites avant de vous lancer'
    }
  ]
};

export const InternalLinks = ({ currentPage, maxLinks = 3 }: InternalLinksProps) => {
  const relevantLinks = linksByPage[currentPage]?.slice(0, maxLinks) || [];

  if (relevantLinks.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 py-12 border-t border-white/10">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Continuez votre parcours
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {relevantLinks.map((link, index) => (
            <div key={index} className="glass-card p-6 rounded-lg hover:border-primary/30 transition-colors">
              <h3 className="text-lg font-semibold mb-2 text-white">
                {link.title}
              </h3>
              <p className="text-white/70 mb-4 text-sm leading-relaxed">
                {link.description}
              </p>
              <Button 
                asChild 
                variant="outline" 
                size="sm" 
                className="w-full group"
              >
                {link.isExternal ? (
                  <a 
                    href={link.href} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center"
                  >
                    Découvrir
                    <ExternalLink className="ml-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  </a>
                ) : (
                  <Link 
                    to={link.href}
                    className="flex items-center justify-center"
                  >
                    Découvrir
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};