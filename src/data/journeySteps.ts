
import { Step } from "@/types/journey";

export const journeySteps: Step[] = [
  {
    id: 1,
    title: "Phase d'idéation & découverte du problème",
    description: "Identifiez les besoins ou problèmes à résoudre et définissez votre opportunité de marché.",
    resources: [
      { title: "Guide d'observation terrain", description: "Méthodologies pour collecter des insights" },
      { title: "Template d'entretiens utilisateurs", description: "Questions structurées pour vos interviews" }
    ],
    isActive: true,
    detailedDescription: "Cette phase cruciale vous permet d'identifier clairement le problème à résoudre avant de vous lancer dans une solution. Observez le terrain, menez des entretiens avec les utilisateurs potentiels, et cartographiez les frustrations existantes pour assurer que vous répondez à un besoin réel et significatif.",
    subSteps: [
      { 
        title: "Identification des besoins ou problèmes", 
        description: "Observation terrain, entretiens utilisateurs, mapping des frustrations",
        isCompleted: false
      },
      { 
        title: "Définition de l'opportunité", 
        description: "Validation du marché, analyse des tendances, positionnement préliminaire",
        isCompleted: false
      }
    ]
  },
  {
    id: 2,
    title: "Validation du concept",
    description: "Construisez le problème-solution fit et testez vos hypothèses auprès d'utilisateurs réels.",
    resources: [
      { title: "Matrice problème-solution", description: "Formulez votre hypothèse de valeur" },
      { title: "Kit de prototypage rapide", description: "Outils no-code et templates de maquettes" }
    ],
    detailedDescription: "Avant d'investir des ressources significatives, assurez-vous que votre solution répond effectivement au problème identifié. Formulez clairement votre proposition de valeur et testez-la auprès d'utilisateurs réels pour valider vos hypothèses de base.",
    subSteps: [
      { 
        title: "Construction du problème-solution fit", 
        description: "Formulation de l'hypothèse de valeur, proposition de valeur initiale, création de persona",
        isCompleted: false
      },
      { 
        title: "Tests préliminaires", 
        description: "Entretiens utilisateurs, prototypage rapide, landing page de test",
        isCompleted: false
      }
    ]
  },
  {
    id: 3,
    title: "Définition du business model",
    description: "Élaborez votre Business Model Canvas et validez votre modèle économique.",
    resources: [
      { title: "Business Model Canvas", description: "Template détaillé avec instructions" },
      { title: "Guide d'étude de marché", description: "Méthodes d'analyse de la concurrence et du marché" }
    ],
    detailedDescription: "Le Business Model Canvas vous permet de visualiser comment votre entreprise va créer, délivrer et capturer de la valeur. Définissez clairement vos segments clients, votre proposition de valeur, vos canaux de distribution, et votre modèle de revenus pour construire une base solide.",
    subSteps: [
      { 
        title: "Création du Business Model Canvas", 
        description: "Segments clients, proposition de valeur, canaux, revenus, ressources",
        isCompleted: false
      },
      { 
        title: "Étude de marché", 
        description: "Analyse concurrentielle, taille du marché TAM/SAM/SOM, comportement clients",
        isCompleted: false
      },
      { 
        title: "Validation du modèle économique", 
        description: "Tests de monétisation, retours utilisateurs sur l'offre payante",
        isCompleted: false
      }
    ]
  },
  {
    id: 4,
    title: "Élaboration du plan de développement",
    description: "Définissez votre MVP et établissez une feuille de route produit claire.",
    resources: [
      { title: "Guide de définition du MVP", description: "Séparer fonctionnalités cœur et secondaires" },
      { title: "Template de roadmap produit", description: "Structure pour planifier vos développements" }
    ],
    detailedDescription: "Un plan de développement clair est essentiel pour transformer votre concept en produit viable. Définissez précisément votre MVP (Minimum Viable Product) en distinguant les fonctionnalités essentielles des fonctionnalités secondaires, puis établissez une feuille de route réaliste pour guider votre développement.",
    subSteps: [
      { 
        title: "Définition du MVP", 
        description: "Fonctionnalités cœur vs secondaires, cahier des charges, choix technologiques",
        isCompleted: false
      },
      { 
        title: "Feuille de route produit", 
        description: "Roadmap 6-12 mois, phasage des livraisons, objectifs SMART",
        isCompleted: false
      }
    ]
  },
  {
    id: 5,
    title: "Structuration de l'entreprise",
    description: "Choisissez le statut juridique adapté et constituez votre équipe fondatrice.",
    resources: [
      { title: "Comparatif des statuts juridiques", description: "Avantages et inconvénients selon votre projet" },
      { title: "Template de pacte d'associés", description: "Document pour cadrer votre association" }
    ],
    detailedDescription: "La structuration juridique et humaine de votre entreprise pose les fondations de votre réussite. Choisissez le statut juridique qui correspond à vos besoins actuels et futurs, et constituez une équipe fondatrice aux compétences complémentaires, partageant votre vision et vos valeurs.",
    subSteps: [
      { 
        title: "Choix du statut juridique", 
        description: "SAS, SARL, Auto-entrepreneur, pacte d'associés, répartition des parts",
        isCompleted: false
      },
      { 
        title: "Constitution de l'équipe fondatrice", 
        description: "Répartition des rôles, alignement vision/valeurs, plan de recrutement",
        isCompleted: false
      }
    ]
  },
  {
    id: 6,
    title: "Construction du Business Plan",
    description: "Rédigez un plan d'affaires solide présentant votre vision stratégique et financière.",
    resources: [
      { title: "Structure détaillée du BP", description: "Chaque section expliquée avec exemples" },
      { title: "Templates financiers", description: "Tableaux Excel pour vos projections" }
    ],
    detailedDescription: "Le Business Plan est votre document stratégique qui présente votre vision à moyen terme et démontre la viabilité financière de votre projet. C'est un outil essentiel pour communiquer avec les parties prenantes externes, notamment les financeurs, mais aussi pour guider vos décisions internes.",
    subSteps: [
      { 
        title: "Objectifs du Business Plan", 
        description: "Feuille de route stratégique interne, communication externe",
        isCompleted: false
      },
      { 
        title: "Contenu détaillé du BP", 
        description: "Résumé exécutif, analyse marché, stratégie commerciale, projections financières",
        isCompleted: false
      },
      { 
        title: "Annexes clés", 
        description: "Tableaux financiers, courbes de croissance, analyse SWOT",
        isCompleted: false
      }
    ]
  },
  {
    id: 7,
    title: "Création du Pitch Deck",
    description: "Concevez une présentation efficace pour convaincre investisseurs et partenaires.",
    resources: [
      { title: "Structure standard de pitch deck", description: "Slide par slide avec bonnes pratiques" },
      { title: "Templates de pitch", description: "Modèles éprouvés et personnalisables" }
    ],
    detailedDescription: "Votre Pitch Deck est souvent le premier contact avec les investisseurs potentiels. Cette présentation concise doit captiver l'attention, exposer clairement la valeur de votre projet, et démontrer pourquoi votre équipe est la mieux placée pour réussir. Un bon pitch combine storytelling efficace et données convaincantes.",
    subSteps: [
      { 
        title: "Structure standard d'un pitch investisseur", 
        description: "Vision, problème, solution, marché, business model, équipe, roadmap",
        isCompleted: false
      },
      { 
        title: "Bonnes pratiques de design et narration", 
        description: "Clarté, impact visuel, storytelling efficace",
        isCompleted: false
      }
    ]
  },
  {
    id: 8,
    title: "Préparation au financement",
    description: "Identifiez les sources de financement adaptées et préparez votre approche.",
    resources: [
      { title: "Panorama des financements", description: "Options selon votre stade de développement" },
      { title: "Outils d'aide à la levée", description: "Table de capitalisation, simulateur de dilution" }
    ],
    detailedDescription: "Le financement est souvent nécessaire pour accélérer le développement de votre projet. Cartographiez les sources potentielles adaptées à votre stade (love money, business angels, incubateurs, VC), préparez vos outils de suivi, et élaborez une stratégie d'approche personnalisée pour maximiser vos chances de succès.",
    subSteps: [
      { 
        title: "Cartographie des sources de financement", 
        description: "Love money, Business Angels, incubateurs, prêts d'honneur, VC",
        isCompleted: false
      },
      { 
        title: "Outils d'aide à la levée", 
        description: "Table de capitalisation, simulateur de dilution, term sheet",
        isCompleted: false
      },
      { 
        title: "Stratégie d'approche", 
        description: "Mapping d'investisseurs, approche personnalisée, préparation aux objections",
        isCompleted: false
      }
    ]
  },
  {
    id: 9,
    title: "Propriété intellectuelle et brevets",
    description: "Protégez vos innovations et valorisez vos actifs immatériels.",
    resources: [
      { title: "Guide de protection PI", description: "Procédures et stratégies adaptées aux startups" },
      { title: "Checklist dépôt de brevet", description: "Étapes et coûts pour protéger votre innovation" }
    ],
    detailedDescription: "La protection de votre propriété intellectuelle peut constituer un avantage compétitif significatif et augmenter la valeur de votre entreprise aux yeux des investisseurs. Évaluez les différentes options de protection (brevets, marques, designs) en fonction de votre contexte spécifique et de votre stratégie globale.",
    subSteps: [
      { 
        title: "Pourquoi protéger son innovation", 
        description: "Valeur ajoutée pour l'investisseur, délimitation des actifs stratégiques",
        isCompleted: false
      },
      { 
        title: "Procédures en Europe & Afrique", 
        description: "OEB, INPI, OAPI, ARIPO, dépôts de brevets et marques",
        isCompleted: false
      },
      { 
        title: "Stratégie PI adaptée aux startups", 
        description: "Brevets, secret, open innovation, valorisation financière",
        isCompleted: false
      }
    ]
  },
  {
    id: 10,
    title: "Suivi, itération & accompagnement",
    description: "Mettez en place les KPIs à suivre et utilisez les bons outils pour piloter votre projet.",
    resources: [
      { title: "Dashboard de KPIs", description: "Indicateurs clés selon votre phase de développement" },
      { title: "Guide des outils startup", description: "Notion, Airtable, Figma et autres outils utiles" }
    ],
    detailedDescription: "Le succès d'une startup repose sur sa capacité à mesurer ses progrès, itérer rapidement, et s'entourer des bonnes ressources. Définissez les KPIs adaptés à votre phase de développement, recherchez l'accompagnement adéquat (incubateurs, mentors), et adoptez les outils qui optimiseront votre efficacité.",
    subSteps: [
      { 
        title: "KPI à suivre selon la phase", 
        description: "Early stage: engagement, acquisition; Growth: MRR, churn, CAC/LTV",
        isCompleted: false
      },
      { 
        title: "Accompagnement / coaching", 
        description: "Incubateurs, mentors, bootcamps, conseils juridiques",
        isCompleted: false
      },
      { 
        title: "Outils à intégrer", 
        description: "Notion, Airtable, Figma, outils IA pour optimiser le parcours",
        isCompleted: false
      }
    ]
  },
];
