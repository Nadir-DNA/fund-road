
import React from 'react';

interface CourseContentPopoverProps {
  children: React.ReactNode;
  courseId: string;
}

export default function CourseContentPopover({ children, courseId }: CourseContentPopoverProps) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}
