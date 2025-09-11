
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutUs() {
  return (
    <>
      <Helmet>
        <title>À propos Fund Road | Plateforme entrepreneurs</title>
        <meta name="description" content="Fund Road accompagne les entrepreneurs de l'idée au financement. Roadmap interactive, outils métiers et réseau d'investisseurs France-Afrique." />
        <meta name="keywords" content="à propos Fund Road, plateforme entrepreneurs, accompagnement startup, France Afrique, financement, roadmap interactive" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="À propos Fund Road - Plateforme entrepreneurs France-Afrique" />
        <meta property="og:description" content="Fund Road accompagne les entrepreneurs de l'idée au financement avec une roadmap interactive et des outils métiers." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fundroad.com/a-propos" />
        <meta property="og:site_name" content="Fund Road" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@fundroad" />
        <meta name="twitter:title" content="À propos Fund Road | Plateforme entrepreneurs" />
        <meta name="twitter:description" content="Fund Road accompagne les entrepreneurs de l'idée au financement. Roadmap interactive, outils métiers et réseau d'investisseurs France-Afrique." />
        
        {/* Canonical */}
        <link rel="canonical" href="https://fundroad.com/a-propos" />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Fund Road",
            "url": "https://fundroad.com",
            "description": "Plateforme euro-africaine d'accompagnement des entrepreneurs de l'idée au financement",
            "foundingLocation": {
              "@type": "Place",
              "name": "France"
            },
            "areaServed": ["France", "Africa"],
            "serviceType": "Accompagnement entrepreneurial",
            "sameAs": [
              "https://fundroad.com"
            ]
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <section>
            <h1 className="text-4xl font-bold mb-6">🧭 À propos de Fund Road</h1>
            <p className="text-xl mb-4">Trace your path to funding.</p>
            <p className="text-lg text-white/80">
              Fund Road est la plateforme euro-africaine conçue pour aider les entrepreneurs à structurer leur projet, gagner en crédibilité et réussir leur levée de fonds.
              Nous accompagnons les startups de l'idée au financement à travers une roadmap interactive, des outils métiers intuitifs, un accompagnement stratégique et un accès ciblé aux bons interlocuteurs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">🚀 Notre mission</h2>
            <p className="text-lg mb-4">Notre ambition est simple : permettre à chaque fondateur — où qu'il soit, en France ou en Afrique — de transformer une idée en projet finançable.</p>
            <p className="text-lg mb-4">Pour cela, nous avons construit un écosystème qui allie :</p>
            <ul className="list-disc pl-6 space-y-2 text-white/80">
              <li>Contenu pédagogique clair, découpé étape par étape</li>
              <li>Ressources actionnables à remplir directement depuis la plateforme</li>
              <li>Outils métiers intégrés (Business Model, Cap Table, Pitch Deck…)</li>
              <li>Annuaire d'investisseurs qualifiés, accessible et contextualisé</li>
              <li>Un espace "Prêt à pitcher", avec génération automatique de dataroom</li>
            </ul>
            <p className="text-lg text-white/80 mt-4 italic">Et bientôt : un score d'éligibilité aux financements, des suggestions d'investisseurs par IA, et un suivi de progression gamifié.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">👥 À qui s'adresse Fund Road ?</h2>
            <p className="text-lg mb-4">Fund Road est fait pour toi si tu es :</p>
            <ul className="list-disc pl-6 space-y-2 text-white/80">
              <li>Un·e entrepreneur·e early-stage (pré-seed / seed)</li>
              <li>Un porteur de projet avec une ambition locale ou internationale</li>
              <li>Un membre de la diaspora souhaitant entreprendre en Afrique ou depuis l'Afrique vers l'Europe</li>
              <li>Une structure d'accompagnement (incubateur, école, hub…) cherchant un outil pour structurer ses porteurs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">🌍 Notre approche : France ↔ Afrique, sans friction</h2>
            <p className="text-lg text-white/80">
              Nous croyons que l'innovation et l'ambition n'ont pas de frontières.
              C'est pourquoi Fund Road est pensé dès sa conception pour les startups africaines et européennes, avec des ressources adaptées aux deux contextes, des experts PI mobilisables, et une base d'investisseurs sur les deux continents.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">🧠 Notre valeur ajoutée</h2>
            <ul className="list-disc pl-6 space-y-2 text-white/80">
              <li>Une plateforme centrée sur l'action, pas seulement sur la théorie</li>
              <li>Une approche métier : vous construisez votre dossier de financement, pas à pas</li>
              <li>Un accompagnement juridique et PI intégré (grâce à notre partenaire cabinet)</li>
              <li>Un pont entre deux continents, deux écosystèmes, une seule ambition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">💡 Pourquoi ce nom ?</h2>
            <p className="text-lg text-white/80">
              Parce qu'un bon financement commence par une bonne route.
              Fund Road est là pour baliser ton parcours, t'éviter les embûches et t'aider à atteindre ton objectif : lever les fonds qu'il te faut, au bon moment, face aux bons interlocuteurs.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">🤝 Et demain ?</h2>
            <p className="text-lg text-white/80">
              Fund Road est bien plus qu'un outil.
              C'est le socle d'une future structure d'accompagnement hybride France-Afrique, portée par des experts en stratégie, financement et propriété intellectuelle.
            </p>
            <p className="text-lg text-white/80 mt-4">
              Nous construisons un écosystème pour faire émerger les startups les plus prometteuses du continent, leur ouvrir l'accès aux bons réseaux et leur donner toutes les cartes pour réussir.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">💬 Une question ? Une envie de collaborer ?</h2>
            <p className="text-lg">
              👉 Contacte-nous via{' '}
              <a href="mailto:hello@fund-road.com" className="text-primary hover:text-primary/80 underline">
                hello@fund-road.com
              </a>
            </p>
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
    </>
  );
}
