
import { Step } from "@/types/journey";

export const operationsStep: Step = {
  id: 8,
  title: "Opérations",
  description: "Mettre en place les processus et l'organisation",
  subSteps: [
    {
      title: "Processus opérationnels",
      description: "Définir les processus clés de l'entreprise",
      resources: [
        { 
          title: "Plan de recrutement", 
          componentName: "RecruitmentPlan",
          description: "Prévoyez vos besoins en RH et profils recherchés",
          status: 'available'
        }
      ]
    },
    {
      title: "Stack technologique",
      description: "Sélectionner les outils et technologies adaptées",
      resources: [
        { 
          title: "Sélecteur d'outils", 
          componentName: "StartupToolPicker",
          description: "Choisissez les outils technologiques adaptés",
          status: 'available'
        }
      ]
    }
  ],
  resources: []
};
