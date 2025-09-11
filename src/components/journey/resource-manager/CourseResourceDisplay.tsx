
import React from 'react';
import { Resource } from '@/types/journey';
import CourseContentDisplay from '../CourseContentDisplay';
import ResourceSequenceNavigation from './ResourceSequenceNavigation';
import ResourceHeader from './ResourceHeader';

interface CourseResourceDisplayProps {
  selectedResource: Resource;
  resourceLocationLabel: string;
  stepId: number;
  selectedSubstepTitle: string;
  allResources: Resource[];
  currentIndex: number;
  totalResources: number;
  onRetry: () => void;
}

export default function CourseResourceDisplay({
  selectedResource,
  resourceLocationLabel,
  stepId,
  selectedSubstepTitle,
  allResources,
  currentIndex,
  totalResources,
  onRetry
}: CourseResourceDisplayProps) {
  return (
    <div className="space-y-4">
      <ResourceHeader
        title={selectedResource.title}
        description={selectedResource.description}
        resourceLocation={resourceLocationLabel}
        onRetry={onRetry}
      />
      
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
        <CourseContentDisplay
          stepId={stepId}
          substepTitle={selectedSubstepTitle}
          stepTitle={selectedResource.title}
          courseContent={selectedResource.courseContent || ''}
        />
      </div>
      
      <ResourceSequenceNavigation
        stepId={stepId}
        currentResource={selectedResource}
        selectedResourceName={selectedResource.componentName || ''}
        substepTitle={selectedSubstepTitle}
      />
    </div>
  );
}
