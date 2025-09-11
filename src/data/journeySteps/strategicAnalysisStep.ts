
import { Step } from "@/types/journey";

export const strategicAnalysisStep: Step = {
  id: 5,
  title: "Analyse stratégique",
  description: "Analyser les facteurs de réussite et de risque",
  subSteps: [
    {
      title: "Analyse environnementale",
      description: "Comprendre le contexte et l'environnement concurrentiel",
      resources: [
        { 
          title: "Grille d'analyse sectorielle", 
          componentName: "MarketAnalysisGrid",
          description: "Analysez en détail votre secteur d'activité",
          status: 'available' 
        },
        { 
          title: "SWOT", 
          componentName: "SwotAnalysis",
          description: "Analysez les forces, faiblesses, opportunités et menaces",
          status: 'available'
        },
        { 
          title: "Analyse de croissance", 
          componentName: "GrowthProjection",
          description: "Projetez votre développement sur 3-5 ans",
          status: 'available'
        }
      ]
    },
    {
      title: "Propriété intellectuelle",
      description: "Définir la stratégie de protection de vos actifs immatériels",
      resources: [
        { 
          title: "Auto-diagnostic PI", 
          componentName: "IPSelfAssessment",
          description: "Évaluez la dimension stratégique de votre PI",
          status: 'available'
        },
        { 
          title: "Dépôt INPI / OAPI / ARIPO", 
          componentName: "IPProceduresChecklist",
          description: "Guide des procédures de protection en Europe et Afrique",
          status: 'available'
        }
      ]
    }
  ],
  resources: []
};
