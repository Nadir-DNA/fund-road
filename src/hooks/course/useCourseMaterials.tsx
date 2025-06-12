
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CourseMaterial {
  id: string;
  title: string;
  course_content: string;
  resource_type: string;
  substep_title: string;
  step_id: number;
}

export const useCourseMaterials = (stepId: number, substepTitle?: string | null) => {
  const [materials, setMaterials] = useState<CourseMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseMaterials = async () => {
      try {
        setIsLoading(true);
        setError(null);

        let query = supabase
          .from('entrepreneur_resources')
          .select('*')
          .eq('resource_type', 'course')
          .eq('step_id', stepId);

        // If substepTitle is provided, filter by it
        if (substepTitle) {
          query = query.eq('substep_title', substepTitle);
        }

        const { data, error: queryError } = await query.order('substep_index');

        if (queryError) {
          console.error('Error fetching course materials:', queryError);
          setError(queryError.message);
          return;
        }

        console.log(`Course materials found for step ${stepId}${substepTitle ? `, substep ${substepTitle}` : ''}:`, data);
        setMaterials(data || []);
      } catch (err) {
        console.error('Unexpected error fetching course materials:', err);
        setError('Une erreur inattendue est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseMaterials();
  }, [stepId, substepTitle]);

  // Helper function to check if course content is available
  const hasCourseContent = materials.length > 0 && materials.some(m => m.course_content && m.course_content.trim() !== '');
  
  // Helper function to get placeholder content when no course is available
  const getPlaceholderContent = () => {
    return {
      id: 'placeholder',
      title: 'Cours bientôt disponible',
      course_content: `# Cours bientôt disponible

## Contenu en préparation

Le contenu pédagogique pour cette étape est actuellement en cours de préparation par notre équipe.

### Ce que vous pouvez faire en attendant :

1. **Explorez les ressources** disponibles dans l'onglet "Ressources"
2. **Consultez la documentation** des outils recommandés
3. **Rejoignez notre communauté** pour échanger avec d'autres entrepreneurs
4. **Pratiquez** avec les exercices suggérés dans les autres sections

### Notification

Vous serez automatiquement notifié dès que ce contenu sera disponible.

---

*Notre équipe pédagogique travaille activement à la création de contenus de qualité pour vous accompagner dans votre parcours entrepreneurial.*`,
      resource_type: 'course',
      substep_title: substepTitle || '',
      step_id: stepId
    };
  };

  return {
    materials: hasCourseContent ? materials : [getPlaceholderContent()],
    isLoading,
    error,
    hasCourseContent
  };
};
