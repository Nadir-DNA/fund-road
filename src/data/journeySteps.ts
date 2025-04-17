
import { Step } from "@/types/journey";

export const journeySteps: Step[] = [
  // Étape 1: Idéation
  {
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
  },

  // Étape 2: Conception
  {
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
  },

  // Étape 3: Business model
  {
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
  },

  // Étape 4: Stratégie
  {
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
  },

  // Étape 5: Analyse stratégique
  {
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
  },

  // Étape 6: Business plan & financement
  {
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
  },

  // Étape 7: Structuration juridique
  {
    id: 7,
    title: "Structuration juridique",
    description: "Créer et structurer votre entreprise juridiquement",
    subSteps: [
      {
        title: "Choix de statut",
        description: "Définir le statut juridique adapté à votre projet",
        resources: [
          { 
            title: "Sélecteur de statut", 
            componentName: "LegalStatusSelector",
            description: "Trouvez le statut juridique adapté à votre projet",
            status: 'available'
          },
          { 
            title: "Comparaison des statuts", 
            componentName: "LegalStatusComparison",
            description: "Comparez les avantages et inconvénients des options",
            status: 'available'
          }
        ]
      },
      {
        title: "Structure de capital",
        description: "Organiser la répartition du capital et les règles d'actionnariat",
        resources: [
          { 
            title: "Table de capitalisation", 
            componentName: "CapTableEditor",
            description: "Gérez la répartition du capital et la dilution",
            status: 'available'
          },
          { 
            title: "Simulateur dilution", 
            componentName: "DilutionSimulator",
            description: "Visualisez l'impact de votre levée sur le capital",
            status: 'available'
          }
        ]
      },
      {
        title: "Équipe fondatrice",
        description: "Structurer l'équipe dirigeante et relations entre associés",
        resources: [
          { 
            title: "Fiche d'alignement cofondateurs", 
            componentName: "CofounderAlignment",
            description: "Définissez les règles de collaboration entre associés",
            status: 'available'
          },
          { 
            title: "Profil cofondateurs", 
            componentName: "CofounderProfile",
            description: "Analysez les compétences et apports de chaque associé",
            status: 'available'
          }
        ]
      }
    ],
    resources: []
  },

  // Étape 8: Opérations
  {
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
  }
];
