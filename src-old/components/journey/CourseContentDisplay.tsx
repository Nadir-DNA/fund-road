
import React from "react";
import { Card } from "@/components/ui/card";
import { LazyMarkdown } from "@/components/ui/LazyMarkdown";
import { Skeleton } from "@/components/ui/skeleton";

interface CourseContentDisplayProps {
  stepId: number;
  stepTitle: string;
  substepTitle: string | null;
  courseContent: string;
}

export default function CourseContentDisplay({
  stepId,
  stepTitle,
  substepTitle,
  courseContent
}: CourseContentDisplayProps) {
  const isContentLoading = !courseContent || courseContent.trim() === '';
  
  // Log for debugging
  console.log(`CourseContentDisplay - Content: ${courseContent ? `Available (${courseContent.length} chars)` : 'Not available'}`);

  return (
    <Card className="p-4 md:p-6 bg-slate-800 shadow-md">
      <div className="space-y-4">
        {isContentLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 bg-slate-700" />
            <Skeleton className="h-4 w-full bg-slate-700" />
            <Skeleton className="h-4 w-full bg-slate-700" />
            <Skeleton className="h-4 w-5/6 bg-slate-700" />
          </>
        ) : (
          <div className="course-content-wrapper">
            <LazyMarkdown content={courseContent} />
          </div>
        )}
      </div>
    </Card>
  );
}
