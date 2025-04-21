
import { useCourseMaterialsQuery } from "./useCourseMaterialsQuery";
import { useUserProgress } from "./useUserProgress";
import { useUserResource } from "./useUserResource";
import { useResourceTemplate } from "./useResourceTemplate";

export const useCourseMaterials = (stepId: number, substepTitle: string | null, subsubstepTitle?: string | null) => {
  const { materials, isLoading, error, refetch } = useCourseMaterialsQuery(stepId, substepTitle, subsubstepTitle);
  const { getUserProgress } = useUserProgress();
  const { getUserResource } = useUserResource();
  const { createOrUpdateResourceTemplate } = useResourceTemplate();
  
  return {
    materials,
    isLoading,
    error,
    refetch,
    getUserProgress,
    getUserResource,
    createOrUpdateResourceTemplate
  };
};
