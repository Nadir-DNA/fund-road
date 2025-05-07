
import React from "react";
import { Resource } from "@/types/journey";
import ResourceSequenceNavigation from "./ResourceSequenceNavigation";
import { renderResourceComponent } from "../utils/resourceRenderer";
import ResourceHeader from "./ResourceHeader";

interface InteractiveResourceDisplayProps {
  selectedResource: Resource;
  resourceLocationLabel: string;
  stepId: number;
  selectedSubstepTitle: string;
  selectedResourceName: string;
  componentName: string;
  allResources: Resource[];
  currentIndex: number;
  totalResources: number;
  onRetry: () => void;
  subsubstepTitle?: string | null;
}

export default function InteractiveResourceDisplay({
  selectedResource,
  resourceLocationLabel,
  stepId,
  selectedSubstepTitle,
  selectedResourceName,
  componentName,
  allResources,
  currentIndex,
  totalResources,
  onRetry,
  subsubstepTitle
}: InteractiveResourceDisplayProps) {
  return (
    <div className="space-y-4">
      <ResourceHeader 
        title={selectedResource.title} 
        description={selectedResource.description} 
        resourceLocation={resourceLocationLabel}
        onRetry={onRetry}
      />
      
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        {renderResourceComponent(
          componentName,
          stepId,
          selectedSubstepTitle,
          subsubstepTitle
        )}
      </div>
      
      <ResourceSequenceNavigation
        stepId={stepId}
        currentResource={selectedResource}
        selectedResourceName={selectedResourceName}
      />
    </div>
  );
}
