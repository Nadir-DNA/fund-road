
import { useState } from "react";
import { CheckCircle2, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Step = {
  id: number;
  title: string;
  description: string;
  resources: { title: string; description: string }[];
  isActive?: boolean;
  isCompleted?: boolean;
  subSteps?: { 
    title: string; 
    description: string; 
    isCompleted?: boolean;
  }[];
  detailedDescription?: string;
};

const steps: Step[] = [
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

export default function JourneyTimeline() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [selectedSubStep, setSelectedSubStep] = useState<{title: string, description: string} | null>(null);
  const [localSteps, setLocalSteps] = useState(steps);

  const handleStepClick = (step: Step) => {
    setSelectedStep(step);
    setSelectedSubStep(null);
    setDialogOpen(true);
  };

  const handleSubStepClick = (step: Step, subStep: {title: string, description: string}) => {
    setSelectedStep(step);
    setSelectedSubStep(subStep);
    setDialogOpen(true);
  };

  const toggleStepCompletion = (stepId: number) => {
    setLocalSteps(prev => 
      prev.map(step => 
        step.id === stepId
          ? { ...step, isCompleted: !step.isCompleted }
          : step
      )
    );
  };

  const toggleSubStepCompletion = (stepId: number, subStepTitle: string) => {
    setLocalSteps(prev => 
      prev.map(step => {
        if (step.id === stepId && step.subSteps) {
          const updatedSubSteps = step.subSteps.map(subStep => 
            subStep.title === subStepTitle
              ? { ...subStep, isCompleted: !subStep.isCompleted }
              : subStep
          );
          return { ...step, subSteps: updatedSubSteps };
        }
        return step;
      })
    );
  };

  return (
    <div className="py-16 px-4">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Votre Parcours Entrepreneurial</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Suivez ces 10 étapes pour naviguer du concept initial jusqu'à l'obtention de financement,
          avec des ressources dédiées à chaque phase de votre projet.
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {localSteps.map((step, index) => (
          <div key={step.id} className="relative flex">
            {/* Timeline connector */}
            {index < localSteps.length - 1 && (
              <div className="absolute top-7 left-3.5 h-full w-0.5 bg-border" />
            )}
            
            {/* Step content */}
            <div className="flex flex-col items-start mb-12 ml-2">
              <div className="flex items-start">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button 
                        className="relative flex items-center justify-center mr-4 focus:outline-none"
                        onClick={() => toggleStepCompletion(step.id)}
                      >
                        {step.isCompleted ? (
                          <CheckCircle2 className="h-7 w-7 text-primary" />
                        ) : step.isActive ? (
                          <CircleDot className="h-7 w-7 text-primary animate-pulse" />
                        ) : (
                          <div className="h-7 w-7 rounded-full border-2 border-muted-foreground/50" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {step.isCompleted ? "Marquer comme non complété" : "Marquer comme complété"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="w-full">
                  <button 
                    onClick={() => handleStepClick(step)}
                    className={cn(
                      "text-lg font-semibold mb-2 text-left hover:text-primary transition-colors focus:outline-none",
                      (step.isActive || step.isCompleted) && "text-primary",
                      step.isCompleted && "line-through decoration-primary/70"
                    )}
                  >
                    {step.title}
                  </button>
                  <p className="text-muted-foreground mb-4">{step.description}</p>
                  
                  {/* Sub-steps */}
                  {step.subSteps && (
                    <div className="mb-4 space-y-3 pl-2">
                      {step.subSteps.map((subStep, idx) => (
                        <div key={idx} className="pl-3 border-l border-primary/30 flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button 
                                  className="flex-shrink-0 mt-0.5 focus:outline-none"
                                  onClick={() => toggleSubStepCompletion(step.id, subStep.title)}
                                >
                                  {subStep.isCompleted ? (
                                    <CheckCircle2 className="h-4 w-4 text-primary" />
                                  ) : (
                                    <div className="h-4 w-4 rounded-full border border-muted-foreground/50" />
                                  )}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {subStep.isCompleted ? "Marquer comme non complété" : "Marquer comme complété"}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <div>
                            <button 
                              className={cn(
                                "font-medium text-sm text-left hover:text-primary transition-colors focus:outline-none",
                                subStep.isCompleted && "line-through decoration-primary/70"
                              )}
                              onClick={() => handleSubStepClick(step, subStep)}
                            >
                              {subStep.title}
                            </button>
                            <p className="text-xs text-muted-foreground">{subStep.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="glass-card p-4 mb-4 space-y-3">
                    <h4 className="font-medium">Ressources disponibles:</h4>
                    <ul className="space-y-2">
                      {step.resources.map((resource, idx) => (
                        <li key={idx} className="pl-4 border-l-2 border-primary/50">
                          <span className="font-medium">{resource.title}</span>
                          <p className="text-sm text-muted-foreground">{resource.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Information Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-card">
          {selectedStep && (
            <DialogHeader>
              <DialogTitle className="text-2xl text-gradient">
                {selectedSubStep ? selectedSubStep.title : selectedStep.title}
              </DialogTitle>
              <DialogDescription className="text-base text-white">
                {selectedSubStep 
                  ? <div className="py-4">{selectedSubStep.description}</div>
                  : (
                    <div className="space-y-4 py-2">
                      <p className="text-white text-lg">{selectedStep.detailedDescription}</p>
                      
                      {selectedStep.subSteps && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium mb-3">Étapes à suivre:</h3>
                          <ul className="space-y-3">
                            {selectedStep.subSteps.map((subStep, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <div className="bg-primary/20 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="text-primary font-medium">{idx + 1}</span>
                                </div>
                                <div>
                                  <h4 className="font-medium">{subStep.title}</h4>
                                  <p className="text-sm text-muted-foreground">{subStep.description}</p>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Ressources recommandées:</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedStep.resources.map((resource, idx) => (
                            <div key={idx} className="p-4 bg-primary/10 backdrop-blur-md rounded-lg border border-primary/20">
                              <h4 className="font-medium text-white mb-1">{resource.title}</h4>
                              <p className="text-sm text-muted-foreground">{resource.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
              </DialogDescription>
            </DialogHeader>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
