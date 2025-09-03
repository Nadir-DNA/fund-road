
import { Step } from "@/types/journey";

export const conceptionStep: Step = {
  id: 2,
  title: "Conception",
  description: "Définir votre proposition de valeur et votre solution",
  subSteps: [
    {
      title: "Proposition de valeur",
      description: "Clarifier l'offre et la valeur créée",
      resources: [
        { 
          title: "Canvas Problème / Solution", 
          componentName: "ProblemSolutionCanvas",
          description: "Visualisez l'adéquation entre le problème et votre solution",
          status: 'available'
        },
        { 
          title: "Fiche Persona utilisateur", 
          componentName: "PersonaBuilder",
          description: "Créez un profil détaillé de votre utilisateur cible",
          status: 'available'
        },
        { 
          title: "Carte d'empathie", 
          componentName: "EmpathyMap",
          description: "Analysez motivations et freins de votre utilisateur",
          status: 'available'
        }
      ]
    },
    {
      title: "Stratégie produit",
      description: "Définir l'approche produit et MVP",
      resources: [
        { 
          title: "Sélection de MVP", 
          componentName: "MVPSelector",
          description: "Choisissez la stratégie MVP la plus adaptée",
          status: 'available'
        },
        { 
          title: "Cahier des charges MVP", 
          componentName: "MvpSpecification",
          description: "Spécifiez les contours de votre MVP",
          status: 'available'
        },
        { 
          title: "Matrice impact/effort", 
          componentName: "FeaturePrioritizationMatrix",
          description: "Priorisez vos fonctionnalités pour le MVP",
          status: 'available'
        }
      ]
    }
  ],
  resources: []
};
