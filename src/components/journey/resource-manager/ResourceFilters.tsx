
import { Resource } from "@/types/journey";
import { useResourceFilters } from "@/hooks/useResourceFilters";
import { getStepResources } from "@/utils/resourceHelpers";

interface ResourceFiltersProps {
  step: any;
  selectedSubstepTitle: string | undefined;
  selectedSubSubstepTitle?: string | null | undefined;
  materials: any[] | undefined;
  hasSession: boolean | null;
  onResourcesFound: (resources: Resource[]) => void;
}

export function ResourceFilters({
  step,
  selectedSubstepTitle,
  selectedSubSubstepTitle,
  materials,
  hasSession,
  onResourcesFound
}: ResourceFiltersProps) {
  // Use the hook to fetch resources
  useResourceFilters(
    step,
    selectedSubstepTitle,
    selectedSubSubstepTitle,
    materials,
    hasSession,
    onResourcesFound
  );

  return null; // This component doesn't render anything
}

// Export the helper function for direct use
export { getStepResources };
