
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InternalLinks } from '@/components/seo/InternalLinks';

export default function TermsOfService() {
  return (
    <>
      <Helmet>
        <title>CGU Fund Road - Conditions d'utilisation</title>
        <meta name="description" content="Conditions générales d'utilisation de la plateforme Fund Road. Droits et obligations des utilisateurs, propriété intellectuelle et modalités d'utilisation des services." />
        <meta name="keywords" content="CGU Fund Road, conditions utilisation, mentions légales, entrepreneur, plateforme, droits utilisateur" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Conditions Générales d'Utilisation - Fund Road" />
        <meta property="og:description" content="Modalités d'utilisation de la plateforme Fund Road pour entrepreneurs" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fundroad.com/conditions-generales" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://fundroad.com/conditions-generales" />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto prose prose-invert">
          <header>
            <h1>CONDITIONS GÉNÉRALES D'UTILISATION (CGU)</h1>
            <p className="text-white/60">Dernière mise à jour : 18/04/2025</p>
          </header>
          
          <p>Bienvenue sur Fund Road, une plateforme en ligne éditée par Fund Road, accessible à l'adresse https://fund-road.com.</p>
          <p>En accédant ou en utilisant nos services, vous acceptez pleinement et sans réserve les présentes CGU.</p>
          
          <h2>1. Objet</h2>
          <p>Les présentes CGU ont pour objet de définir les conditions d'accès et d'utilisation de la plateforme Fund Road par les utilisateurs.</p>
          
          <h2>2. Description du service</h2>
          <p>Fund Road est une plateforme dédiée aux entrepreneurs qui souhaitent structurer leur projet, suivre une roadmap pédagogique, accéder à des outils interactifs et à un annuaire d'investisseurs.</p>
          <p>Le service est accessible via inscription et comprend des fonctionnalités gratuites et, à terme, des offres payantes.</p>
          
          <h2>3. Inscription et comptes utilisateurs</h2>
          <p>L'utilisateur s'engage à fournir des informations exactes et à jour.</p>
          <p>L'accès à certaines fonctionnalités nécessite la création d'un compte personnel.</p>
          <p>Fund Road se réserve le droit de suspendre ou supprimer un compte en cas de violation des CGU ou d'usage abusif.</p>
          
          <h2>4. Propriété intellectuelle</h2>
          <p>L'ensemble des contenus (cours, outils, codes, marques, logos…) présents sur la plateforme est protégé par le droit d'auteur et reste la propriété exclusive de Fund Road ou de ses partenaires.</p>
          <p>L'utilisateur s'interdit toute reproduction ou diffusion sans autorisation préalable écrite.</p>
          
          <h2>5. Utilisation des contenus interactifs</h2>
          <p>Les utilisateurs peuvent renseigner et sauvegarder des données personnelles (canvas, documents, ressources…).</p>
          <p>Ces contenus leur appartiennent, mais Fund Road se réserve le droit de les analyser de manière anonyme et agrégée à des fins d'amélioration du service.</p>
          
          <h2>6. Responsabilités</h2>
          <p>Fund Road fournit un service d'accompagnement et de mise à disposition d'outils, mais ne garantit pas l'obtention de financement.</p>
          <p>L'utilisateur est seul responsable de l'utilisation qu'il fait des outils et recommandations proposés.</p>
          
          <h2>7. Durée et résiliation</h2>
          <p>Les présentes CGU sont valables à compter de l'inscription de l'utilisateur et jusqu'à la suppression de son compte.</p>
          <p>L'utilisateur peut résilier son compte à tout moment.</p>
          
          <h2>8. Évolution du service et des CGU</h2>
          <p>Fund Road se réserve le droit de modifier à tout moment les fonctionnalités, l'offre ou les présentes CGU. Les utilisateurs seront informés en cas de changements majeurs.</p>
          
          <h2>9. Droit applicable</h2>
          <p>Les présentes CGU sont soumises au droit français. En cas de litige, une tentative de résolution amiable sera privilégiée. À défaut, les tribunaux compétents de Marseille seront seuls compétents.</p>
        </div>
        
        <InternalLinks currentPage="/conditions-generales" maxLinks={2} />
      </main>
      
      <Footer />
    </div>
    </>
  );
}
