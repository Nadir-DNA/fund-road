
import { Step } from "@/types/journey";

export const legalStep: Step = {
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
};
