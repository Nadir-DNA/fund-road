
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useUnifiedCourseMaterials } from "@/hooks/course/useUnifiedCourseMaterials";
import { stepIntroductions } from "@/data/stepIntroductions";
import CourseContentDisplay from "../../CourseContentDisplay";

interface OverviewTabProps {
  stepId: number;
  substepTitle: string | null;
  stepTitle: string;
  isLoading: boolean;
}

export default function OverviewTab({ 
  stepId,
  substepTitle,
  stepTitle,
  isLoading: propIsLoading 
}: OverviewTabProps) {
  // Pour les étapes principales (substepTitle = null), on affiche seulement l'introduction
  // Pour les sous-étapes, on charge et affiche les cours
  const shouldLoadCourse = substepTitle !== null;
  
  const { data: materials, isLoading: courseMaterialsLoading, error } = useUnifiedCourseMaterials(
    stepId, 
    shouldLoadCourse ? substepTitle : null
  );
  
  console.log(`📖 OverviewTab - Step ${stepId}, Substep: ${substepTitle || 'main'}, Materials: ${materials?.length || 0}`);
  
  const isLoading = propIsLoading || (shouldLoadCourse && courseMaterialsLoading);
  
  // Cas 1: Étape principale - Afficher l'introduction
  if (!substepTitle) {
    const introduction = stepIntroductions[stepId as keyof typeof stepIntroductions];
    
    if (!introduction) {
      return (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium mb-2">Étape {stepId}</h3>
          <p className="text-muted-foreground">
            Cette étape est en cours de préparation. Explorez les sous-sections pour commencer votre travail.
          </p>
        </div>
      );
    }
    
    return (
      <div className="prose prose-invert max-w-none">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg border border-primary/20">
          <h2 className="text-2xl font-bold text-white mb-4">{introduction.title}</h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            {introduction.description}
          </p>
        </div>
        
        <div className="mt-8 p-4 bg-muted/10 rounded-lg border border-muted/20">
          <h3 className="text-lg font-semibold text-white mb-2">👉 Pour commencer</h3>
          <p className="text-muted-foreground">
            Naviguez vers les sous-sections de cette étape pour accéder aux cours détaillés et aux outils pratiques.
          </p>
        </div>
      </div>
    );
  }
  
  // Cas 2: Sous-étape - Afficher le cours
  const courseContent = materials?.find(m => m.resource_type === 'cours')?.course_content || "";
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingIndicator size="lg" />
        <span className="ml-2">Chargement du cours...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2 text-destructive">Erreur de chargement</h3>
        <p className="text-muted-foreground">
          Impossible de charger le contenu du cours pour cette section.
        </p>
        <p className="text-xs mt-2 text-muted-foreground/70">
          Étape {stepId} - {substepTitle}
        </p>
      </div>
    );
  }
  
  if (!courseContent || courseContent.trim() === "") {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">Cours en préparation</h3>
        <p className="text-muted-foreground">
          Le contenu pédagogique pour cette section sera disponible prochainement.
        </p>
        <p className="text-xs mt-2 text-muted-foreground/70">
          Étape {stepId} - {substepTitle}
        </p>
      </div>
    );
  }
  
  return (
    <div className="prose prose-invert max-w-none">
      <CourseContentDisplay 
        stepId={stepId}
        substepTitle={substepTitle}
        stepTitle={stepTitle}
        courseContent={courseContent}
      />
    </div>
  );
}
