
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { InternalLinks } from '@/components/seo/InternalLinks';
import { createProductSchema } from '@/components/seo/StructuredData';

export default function Pricing() {
  const plans = [
    {
      name: "Gratuit",
      price: "0€",
      description: "Parfait pour démarrer votre projet entrepreneurial",
      features: [
        "Accès aux guides de base",
        "Business Model Canvas",
        "Templates Business Plan",
        "Annuaire des financements limité"
      ],
      cta: "Démarrer",
      popular: false
    },
    {
      name: "Pro",
      price: "29€",
      period: "par mois",
      description: "Pour les entrepreneurs déterminés à concrétiser leur projet",
      features: [
        "Tous les outils gratuits",
        "Templates premium de pitch deck",
        "Accès complet à l'annuaire des financements",
        "Check-list interactives personnalisées",
        "Conseils juridiques avancés",
        "Suivi de progression détaillé"
      ],
      cta: "Essai gratuit 14 jours",
      popular: true
    },
    {
      name: "Expert",
      price: "199€",
      period: "par mois",
      description: "Pour les startups en phase de levée de fonds",
      features: [
        "Tout le plan Pro",
        "Accompagnement personnalisé",
        "Relecture de vos documents par nos experts",
        "Mise en relation directe avec investisseurs",
        "Préparation au roadshow",
        "Accompagnement négociation"
      ],
      cta: "Contacter un conseiller",
      popular: false
    }
  ];

  const productSchemas = plans.map(plan => 
    createProductSchema(
      `Fund Road ${plan.name}`,
      plan.description,
      plan.price.replace('€', ''),
      'EUR'
    )
  );

  return (
    <>
      <Helmet>
        <title>Tarifs Fund Road - À partir de 0€</title>
        <meta name="description" content="Découvrez nos offres d'accompagnement pour entrepreneurs : Gratuit, Pro (29€/mois) et Expert (199€/mois). Essai gratuit 14 jours. Choisissez votre formule." />
        <meta name="keywords" content="tarifs Fund Road, prix accompagnement startup, coaching entrepreneur, levée de fonds prix, business plan tarif" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Tarifs Fund Road - Accompagnement sur-mesure" />
        <meta property="og:description" content="Formules d'accompagnement adaptées à chaque étape de votre parcours entrepreneurial" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fundroad.com/tarifs" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://fundroad.com/tarifs" />
        
        {/* Product Structured Data */}
        {productSchemas.map((schema, index) => (
          <script key={index} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <header className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Nos Offres d'Accompagnement</h1>
          <p className="text-white/70 max-w-2xl mx-auto">
            Choisissez la formule qui correspond à vos besoins et à l'étape actuelle de votre projet entrepreneurial.
          </p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`
                bg-black/60 backdrop-blur-md border rounded-xl p-6
                ${plan.popular 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-white/10'}
              `}
            >
              {plan.popular && (
                <div className="bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wide py-1 px-3 rounded-full inline-block mb-4">
                  Recommandé
                </div>
              )}
              
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && (
                  <span className="text-white/60 ml-1">{plan.period}</span>
                )}
              </div>
              
              <p className="text-white/70 mb-6">{plan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${plan.popular 
                  ? 'bg-primary hover:bg-primary/90' 
                  : 'bg-white/10 hover:bg-white/20 text-white'}`}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
        
        <InternalLinks currentPage="/tarifs" />
      </main>
      
      <Footer />
    </div>
    </>
  );
}
