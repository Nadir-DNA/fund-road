
import { Step } from "@/types/journey";

export const strategyStep: Step = {
  id: 4,
  title: "Stratégie",
  description: "Définir la vision et la stratégie long terme",
  subSteps: [
    {
      title: "Vision stratégique",
      description: "Définir l'ambition et la direction de l'entreprise",
      resources: [
        { 
          title: "Business plan", 
          componentName: "BusinessPlanEditor",
          description: "Rédigez votre plan d'affaires détaillé",
          status: 'available' 
        },
        { 
          title: "Fiche d'intention stratégique", 
          componentName: "BusinessPlanIntent",
          description: "Clarifiez l'objectif et le public de votre BP",
          status: 'available' 
        }
      ]
    },
    {
      title: "Roadmap",
      description: "Planifier le développement du produit et de l'entreprise",
      resources: [
        { 
          title: "Roadmap produit", 
          componentName: "ProductRoadmapEditor",
          description: "Visualisez les étapes d'évolution de votre produit",
          status: 'available' 
        }
      ]
    }
  ],
  resources: []
};
