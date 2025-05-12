
import React from 'react';
import { ResourceComponentProps } from '../resourceComponentsMap';
import CourseContentDisplay from '../CourseContentDisplay';

interface CourseContentDisplayProps extends ResourceComponentProps {
  courseContent?: string;
  stepTitle?: string;
}

export default function ResourceCourseContentDisplay({ 
  stepId, 
  substepTitle, 
  courseContent,
  stepTitle
}: CourseContentDisplayProps) {
  // Use our main CourseContentDisplay component
  return (
    <CourseContentDisplay
      stepId={stepId}
      substepTitle={substepTitle}
      stepTitle={stepTitle || ""}
      courseContent={courseContent || ""}
    />
  );
}
