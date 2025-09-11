
import { Step } from "@/types/journey";

export const ideationStep: Step = {
  id: 1,
  title: "Idéation",
  description: "Explorer les besoins utilisateurs et définir une opportunité",
  subSteps: [
    {
      title: "Recherche utilisateur",
      description: "Comprendre les problèmes et besoins des utilisateurs",
      resources: [
        { 
          title: "Journal d'observation utilisateur", 
          componentName: "UserResearchNotebook",
          description: "Documentez vos observations terrain et insights utilisateurs",
          status: 'available'
        },
        { 
          title: "Analyse comportementale", 
          componentName: "CustomerBehaviorNotes",
          description: "Notez les comportements et habitudes de vos utilisateurs",
          status: 'available'
        }
      ]
    },
    {
      title: "Définition de l'opportunité",
      description: "Structurer l'opportunité commerciale et produit",
      resources: [
        { 
          title: "Synthèse qualitative", 
          componentName: "OpportunityDefinition",
          description: "Structurez les insights clés pour définir votre opportunité",
          status: 'available'
        },
        { 
          title: "Estimation TAM / SAM / SOM", 
          componentName: "MarketSizeEstimator",
          description: "Estimez la taille de votre marché adressable",
          status: 'available'
        },
        { 
          title: "Analyse concurrentielle", 
          componentName: "CompetitiveAnalysisTable",
          description: "Cartographiez le paysage concurrentiel",
          status: 'available'
        }
      ]
    }
  ],
  resources: []
};
