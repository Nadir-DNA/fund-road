import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function RoadmapStartup() {
  return (
    <>
      <Helmet>
        <title>Roadmap Startup pour réussir sa levée de fonds | Guide complet</title>
        <meta name="description" content="Découvrez le roadmap complet pour réussir votre levée de fonds startup. Étapes clés, préparation, validation marché et stratégie de financement." />
        <meta name="keywords" content="roadmap startup, levée de fonds, financement startup, entrepreneur, business plan, investisseurs" />
        <link rel="canonical" href="https://fundroad.com/roadmap-startup" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Roadmap Startup pour réussir sa levée de fonds | Guide complet" />
        <meta property="og:description" content="Découvrez le roadmap complet pour réussir votre levée de fonds startup. Étapes clés, préparation, validation marché et stratégie de financement." />
        <meta property="og:url" content="https://fundroad.com/roadmap-startup" />
        <meta property="og:type" content="article" />
        <meta property="og:site_name" content="Fund Road" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Roadmap Startup pour réussir sa levée de fonds | Guide complet" />
        <meta name="twitter:description" content="Découvrez le roadmap complet pour réussir votre levée de fonds startup. Étapes clés, préparation, validation marché et stratégie de financement." />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "Roadmap Startup pour réussir sa levée de fonds",
            "description": "Guide complet pour les entrepreneurs souhaitant réussir leur levée de fonds",
            "author": {
              "@type": "Organization",
              "name": "Fund Road"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Fund Road",
              "url": "https://fundroad.com"
            },
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": "https://fundroad.com/roadmap-startup"
            }
          })}
        </script>
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Navbar />
        
        <main className="flex-grow pt-20 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
                Roadmap Startup pour réussir sa levée de fonds
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                [Zone de texte à remplir : Introduction générale sur l'importance d'un roadmap structuré pour les startups]
              </p>
            </div>

            <div className="space-y-12">
              
              {/* Section 1: Étapes clés */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">
                    <h2>Les étapes clés du roadmap startup</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Phase de conception</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Description de la phase de conception et son importance]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Validation du concept</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Processus de validation du concept auprès du marché]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Développement MVP</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Importance du MVP et méthodologie de développement]
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* Section 2: Préparation levée de fonds */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">
                    <h2>Préparation de la levée de fonds</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Business plan et modèle économique</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Éléments essentiels du business plan et définition du modèle économique]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Pitch deck et présentation</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Structure optimale du pitch deck et conseils de présentation]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Équipe et gouvernance</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Constitution de l'équipe dirigeante et mise en place de la gouvernance]
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* Section 3: Validation marché */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">
                    <h2>Validation du marché et du produit</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Étude de marché approfondie</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Méthodologie d'analyse du marché cible et de la concurrence]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Tests utilisateurs et feedback</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Processus de collecte et d'analyse des retours utilisateurs]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Métriques et KPIs</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Indicateurs clés à suivre pour démontrer la traction]
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* Section 4: Structure juridique */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">
                    <h2>Structuration juridique et financière</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Forme juridique optimale</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Choix de la structure juridique adaptée à la startup]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Propriété intellectuelle</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Protection de la propriété intellectuelle et des actifs]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Cap table et répartition</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Structuration du capital et préparation à la dilution]
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* Section 5: Stratégie financement */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-2xl text-primary">
                    <h2>Stratégie de financement</h2>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-3">Types de financement disponibles</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Panorama des solutions de financement pour startups]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Approche des investisseurs</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Stratégie d'approche et de négociation avec les investisseurs]
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-3">Due diligence et closing</h3>
                    <p className="text-muted-foreground mb-4">
                      [Zone de texte à remplir : Préparation aux audits investisseurs et finalisation des accords]
                    </p>
                  </div>

                </CardContent>
              </Card>

              {/* Call to action */}
              <Card className="bg-primary/5 border-primary/30">
                <CardContent className="text-center py-8">
                  <h3 className="text-2xl font-semibold mb-4 text-primary">
                    Prêt à démarrer votre parcours ?
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                    [Zone de texte à remplir : Incitation à l'action pour commencer le parcours interactif]
                  </p>
                </CardContent>
              </Card>

            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}