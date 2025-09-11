
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { InternalLinks } from '@/components/seo/InternalLinks';

export default function PrivacyPolicy() {
  return (
    <>
      <Helmet>
        <title>Politique Confidentialité RGPD | Fund Road</title>
        <meta name="description" content="Politique de confidentialité Fund Road conforme au RGPD. Découvrez comment nous collectons, traitons et protégeons vos données personnelles en toute transparence." />
        <meta name="keywords" content="RGPD, politique confidentialité, protection données, Fund Road, vie privée, cookies, consentement" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Politique de Confidentialité RGPD - Fund Road" />
        <meta property="og:description" content="Protection et traitement transparent de vos données personnelles" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fundroad.com/politique-confidentialite" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://fundroad.com/politique-confidentialite" />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="max-w-4xl mx-auto prose prose-invert">
          <header>
            <h1 className="flex items-center">🔐 POLITIQUE DE CONFIDENTIALITÉ (RGPD)</h1>
            <p className="text-white/60">Dernière mise à jour : 18/04/2025</p>
          </header>
          
          <h2>1. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <ul>
            <li>Données d'identification (nom, e-mail, mot de passe)</li>
            <li>Données d'usage (actions sur la roadmap, documents créés)</li>
            <li>Métadonnées techniques (logs, préférences, navigation)</li>
          </ul>
          
          <h2>2. Finalités du traitement</h2>
          <p>Les données sont traitées pour :</p>
          <ul>
            <li>Créer et gérer votre compte</li>
            <li>Personnaliser votre expérience utilisateur</li>
            <li>Améliorer la qualité du service</li>
            <li>Réaliser des analyses statistiques agrégées</li>
            <li>Vous adresser des communications, avec votre consentement</li>
          </ul>
          
          <h2>3. Base légale</h2>
          <p>Les traitements sont fondés sur :</p>
          <ul>
            <li>Votre consentement explicite lors de l'inscription</li>
            <li>L'exécution du contrat (CGU)</li>
            <li>L'intérêt légitime de Fund Road (amélioration continue)</li>
          </ul>
          
          <h2>4. Durée de conservation</h2>
          <p>Vos données sont conservées :</p>
          <ul>
            <li>Tant que votre compte est actif</li>
            <li>Jusqu'à 3 ans après inactivité (sauf demande de suppression anticipée)</li>
            <li>Les données d'usage sont anonymisées au-delà de cette période</li>
          </ul>
          
          <h2>5. Accès, modification, suppression</h2>
          <p>Conformément au RGPD, vous disposez de :</p>
          <ul>
            <li>Droit d'accès, de rectification, de suppression</li>
            <li>Droit à la portabilité</li>
            <li>Droit à la limitation ou opposition du traitement</li>
            <li>Droit de réclamation auprès de la CNIL</li>
          </ul>
          <p>Vous pouvez exercer vos droits à l'adresse suivante : hello@fund-road.com</p>
          
          <h2>6. Partage des données</h2>
          <p>Nous ne partageons aucune donnée personnelle à des tiers à des fins commerciales.</p>
          <p>Des sous-traitants techniques peuvent y accéder dans le cadre strict de la fourniture du service (hébergeur, analytics), dans le respect du RGPD.</p>
          
          <h2>7. Cookies</h2>
          <p>Des cookies peuvent être utilisés à des fins de fonctionnement (authentification, préférences) et statistiques. Un bandeau d'information et un outil de gestion du consentement est affiché à la première visite.</p>
          
          <h2>8. Sécurité</h2>
          <p>Fund Road met en œuvre les mesures techniques et organisationnelles nécessaires pour assurer la sécurité de vos données (chiffrement, accès restreint, sauvegardes, audit régulier).</p>
        </div>
        
        <InternalLinks currentPage="/politique-confidentialite" maxLinks={2} />
      </main>
      
      <Footer />
    </div>
    </>
  );
}
