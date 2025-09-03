
import { Step } from "@/types/journey";

export const businessPlanStep: Step = {
  id: 6,
  title: "Business plan & financement",
  description: "Structurer votre plan financier et préparer votre levée",
  subSteps: [
    {
      title: "Prévisionnel financier",
      description: "Établir vos projections financières et besoins de financement",
      resources: [
        { 
          title: "Tableaux financiers", 
          componentName: "FinancialTables",
          description: "Créez vos prévisions de revenus et coûts",
          status: 'available'
        },
        { 
          title: "Cartographie des financements", 
          componentName: "FundingMap",
          description: "Identifiez les sources de financement adaptées",
          status: 'available'
        }
      ]
    },
    {
      title: "Préparation à la levée",
      description: "Structurer votre démarche de levée de fonds",
      resources: [
        { 
          title: "Term sheet simplifiée", 
          componentName: "TermSheetBuilder",
          description: "Préparez le cadre de négociation investisseur",
          status: 'available'
        },
        { 
          title: "Argumentaire pitch", 
          componentName: "PitchStoryTeller",
          description: "Construisez votre narration pour convaincre",
          status: 'available'
        },
        { 
          title: "Email investisseurs", 
          componentName: "InvestorEmailScript",
          description: "Rédigez un premier contact efficace",
          status: 'available'
        },
        { 
          title: "Réponses objections", 
          componentName: "InvestorObjectionPrep",
          description: "Anticipez les questions difficiles",
          status: 'available'
        },
        { 
          title: "Plan de suivi investisseurs", 
          componentName: "InvestorFollowUpPlan",
          description: "Structurez vos démarches de prospection",
          status: 'available'
        }
      ]
    }
  ],
  resources: []
};
