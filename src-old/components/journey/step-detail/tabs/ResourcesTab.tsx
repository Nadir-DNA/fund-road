import React, { useState } from "react";
import { Resource, Step } from "@/types/journey";
import { getStepResources, getAllStepResources, getResourceLocationLabel } from "@/utils/resourceHelpers";
import { useSearchParams } from "react-router-dom";
import ResourceManagerContent from "../../resource-manager/ResourceManagerContent";
import ResourceCard from "../../resource-manager/ResourceCard";

interface ResourcesTabProps {
  step: Step;
  stepId: number;
  substepTitle: string | null;
  selectedResourceName: string | null;
  isViewingResource?: boolean;
}

export default function ResourcesTab({
  step,
  stepId,
  substepTitle,
  selectedResourceName,
  isViewingResource = false
}: ResourcesTabProps) {
  const [searchParams] = useSearchParams();
  const resourceParam = searchParams.get("resource");
  
  // Multiple sources of truth for the resource name
  const definiteResourceName = selectedResourceName || resourceParam;
  
  // Definitely viewing a resource if prop is true or if resource name is available
  const definitelyViewingResource = isViewingResource || !!definiteResourceName;
  
  console.log("ResourcesTab:", {
    stepId,
    substepTitle,
    selectedResourceName,
    resourceParam,
    definiteResourceName,
    isViewingResource: isViewingResource, 
    definitelyViewingResource
  });

  // If viewing a specific resource, show its content
  if (definitelyViewingResource && definiteResourceName) {
    const resources = getAllStepResources(stepId, substepTitle);
    const selectedResource = resources.find(r => r.componentName === definiteResourceName);
    
    return (
      <ResourceManagerContent
        selectedResource={selectedResource}
        stepId={stepId}
        selectedSubstepTitle={substepTitle || ""}
        selectedResourceName={definiteResourceName}
      />
    );
  }

  // Otherwise, show all available resources
  const resources = substepTitle 
    ? getStepResources(step, substepTitle) 
    : getAllStepResources(stepId);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <ResourceCard 
            key={resource.id || `resource-${index}`}
            resource={resource}
            stepId={stepId}
            substepTitle={substepTitle || ''}
          />
        ))}
        
        {resources.length === 0 && (
          <div className="col-span-full text-center p-8 border border-dashed border-slate-700 rounded-lg">
            <p className="text-muted-foreground">Aucune ressource disponible pour cette étape.</p>
          </div>
        )}
      </div>
    </div>
  );
}
