
import { Resource } from "@/types/journey";
import { mapResourceTypeToComponent } from "@/utils/resourceTypeMapping";

/**
 * Utility to extract resources from course materials
 */
export const useMaterialResources = (
  materials: any[] | undefined,
  selectedSubstepTitle: string | undefined,
  selectedSubSubstepTitle: string | null | undefined
) => {
  if (!materials || materials.length === 0) {
    return [];
  }

  const filteredResources = materials.filter(item =>
    (item.resource_type === 'resource' ||
      item.resource_type === 'tool' ||
      item.resource_type === 'template') &&
    (
      (selectedSubSubstepTitle
        ? item.subsubstep_title === selectedSubSubstepTitle
        : selectedSubstepTitle
        ? item.substep_title === selectedSubstepTitle && (item.subsubstep_title === null || item.subsubstep_title === undefined || item.subsubstep_title === '')
        : item.substep_title === null)
    )
  ).map(item => ({
    id: item.id || `material-${Math.random().toString(36).substring(7)}`,
    title: item.title,
    description: item.description || '',
    componentName: mapResourceTypeToComponent(item.resource_type) || item.component_name || '',
    url: item.file_url,
    type: item.resource_type || 'resource',
    status: 'available' as const
  }));

  console.log(`Found ${filteredResources.length} resources from materials`, filteredResources);
  return filteredResources;
};
