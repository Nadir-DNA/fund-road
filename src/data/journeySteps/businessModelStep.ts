
import { Step } from "@/types/journey";

export const businessModelStep: Step = {
  id: 3,
  title: "Business model",
  description: "Structurer votre modèle économique et validez-le",
  subSteps: [
    {
      title: "Modèle économique",
      description: "Construire un business model viable",
      resources: [
        { 
          title: "Business Model Canvas", 
          componentName: "BusinessModelCanvas",
          description: "Construisez votre modèle d'affaires complet",
          status: 'available' 
        },
        { 
          title: "Tests de monétisation", 
          componentName: "MonetizationTestGrid",
          description: "Testez différentes hypothèses de pricing",
          status: 'available' 
        },
        { 
          title: "Feedback offre payante", 
          componentName: "PaidOfferFeedback",
          description: "Collectez les retours sur votre proposition payante",
          status: 'available'
        }
      ]
    },
    {
      title: "Validation commerciale",
      description: "Tester la proposition de valeur auprès du marché",
      resources: [
        { 
          title: "Compte-rendu d'expérience", 
          componentName: "ExperimentSummary",
          description: "Synthétisez les résultats de vos tests",
          status: 'available' 
        }
      ]
    }
  ],
  resources: []
};
