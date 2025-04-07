import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  const faqData = [
    {
      id: 1,
      question: "Qu'est-ce que Efficio et comment peut-il aider mon entreprise ?",
      answer: "Efficio est une plateforme conçue pour accompagner les entrepreneurs à chaque étape de leur parcours, de l'idéation au financement. Elle offre des outils pour structurer votre business plan, créer un pitch deck percutant et vous connecter avec des investisseurs potentiels."
    },
    {
      id: 2,
      question: "Comment Efficio peut-il m'aider à trouver des financements pour ma startup ?",
      answer: "Efficio vous donne accès à un réseau étendu de fonds d'investissement, de business angels et d'autres sources de financement. Vous pouvez filtrer les investisseurs par secteur, stade de développement et ticket moyen pour trouver ceux qui correspondent le mieux à votre projet."
    },
    {
      id: 3,
      question: "Quels types de ressources et de modèles Efficio met-il à disposition ?",
      answer: "Efficio propose une variété de ressources, incluant des guides pratiques, des modèles de business plan, des templates de pitch deck et des check-lists pour vous aider à structurer votre projet et à gagner du temps."
    },
    {
      id: 4,
      question: "Comment puis-je structurer mon business plan avec Efficio ?",
      answer: "Efficio vous guide à travers les étapes clés de la création d'un business plan solide, en vous fournissant des modèles et des exemples pour chaque section (analyse de marché, stratégie, projections financières, etc.)."
    },
    {
      id: 5,
      question: "Comment créer un pitch deck percutant grâce à Efficio ?",
      answer: "Efficio met à votre disposition des templates de pitch deck conçus par des experts, ainsi que des conseils pour mettre en valeur votre projet et convaincre les investisseurs."
    },
    {
      id: 6,
      question: "Efficio propose-t-il un accompagnement personnalisé pour les entrepreneurs ?",
      answer: "Oui, Efficio offre des services d'accompagnement personnalisé, incluant des sessions de coaching avec des experts, des revues de business plan et de pitch deck, et des mises en relation avec des investisseurs."
    },
    {
      id: 7,
      question: "Comment puis-je contacter l'équipe Efficio si j'ai des questions ou des problèmes ?",
      answer: "Vous pouvez contacter l'équipe Efficio par email ou par téléphone. Nous sommes à votre disposition pour répondre à vos questions et vous aider à tirer le meilleur parti de la plateforme."
    },
    {
      id: 8,
      question: "Efficio est-il adapté à tous les types de projets et de secteurs d'activité ?",
      answer: "Efficio s'adresse à tous les entrepreneurs, quel que soit leur secteur d'activité ou le stade de développement de leur projet. La plateforme est particulièrement adaptée aux startups innovantes et aux projets à fort potentiel de croissance."
    },
    {
      id: 9,
      question: "Comment puis-je m'inscrire à Efficio et commencer à utiliser la plateforme ?",
      answer: "L'inscription à Efficio est simple et rapide. Il vous suffit de créer un compte sur notre site web et de choisir l'abonnement qui correspond le mieux à vos besoins."
    },
  ];

  const filteredFaqData = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>

      <Navbar />

      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Foire aux Questions</h1>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Trouvez rapidement les réponses à vos questions sur Efficio, le parcours entrepreneurial, le financement et les ressources disponibles.
          </p>

          <div className="max-w-md mx-auto relative mb-8">
            <Input
              placeholder="Rechercher une question ou un mot-clé..."
              className="bg-black/40 border-white/10 pl-10 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
          </div>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {filteredFaqData.length > 0 ? (
            filteredFaqData.map((faq) => (
              <AccordionItem value={`item-${faq.id}`} key={faq.id} className="border-b border-white/10">
                <AccordionTrigger className="data-[state=open]:text-primary flex justify-between items-center py-4 text-left w-full font-semibold text-lg hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))
          ) : (
            <div className="text-center py-16">
              <p className="text-xl text-white/70">Aucune question ne correspond à votre recherche.</p>
              <p className="text-white/50 mt-2">Essayez d'ajuster votre recherche ou parcourez les questions populaires ci-dessous.</p>
            </div>
          )}
        </Accordion>
      </main>

      <Footer />
    </div>
  );
}
