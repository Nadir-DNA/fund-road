
import { useQuery } from "@tanstack/react-query";
import { Resource } from "@/types/journey";
import { useResourceFetch } from "./resource/useResourceFetch";
import { useMaterialResources } from "./resource/useMaterialResources";
import { mapResourceTypeToComponent } from "@/utils/resourceTypeMapping";

export const useResourceFilters = (
  step: any,
  selectedSubstepTitle: string | undefined,
  selectedSubSubstepTitle: string | null | undefined,
  materials: any[] | undefined,
  hasSession: boolean | null,
  onResourcesFound: (resources: Resource[]) => void
) => {
  // Use the separated hook to fetch resources
  const resourceQuery = useResourceFetch(
    step,
    selectedSubstepTitle,
    selectedSubSubstepTitle,
    hasSession
  );
  
  // Process resources from materials
  const materialResources = useMaterialResources(
    materials,
    selectedSubstepTitle,
    selectedSubSubstepTitle
  );

  // Combine resources and notify parent component
  if (resourceQuery.data || materialResources.length > 0) {
    const combinedResources = [
      ...(resourceQuery.data || []),
      ...materialResources
    ];
    onResourcesFound(combinedResources);
  }

  return {
    ...resourceQuery,
    data: [...(resourceQuery.data || []), ...materialResources]
  };
};

// Export the mapResourceTypeToComponent function for use elsewhere
export { mapResourceTypeToComponent };
