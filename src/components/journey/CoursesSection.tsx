
import CourseContentDisplay from "./CourseContentDisplay";
import { Resource } from "@/types/journey";

interface CoursesSectionProps {
  courses: Resource[];
  stepId: number;
  substepTitle: string;
}

export default function CoursesSection({ courses, stepId, substepTitle }: CoursesSectionProps) {
  if (courses.length === 0) return null;

  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Cours</h2>
      <div className="space-y-6">
        {courses.map(course => (
          <div key={course.id} className="bg-slate-700/30 rounded-lg p-6">
            {course.course_content ? (
              <CourseContentDisplay 
                stepId={Number(stepId)} 
                substepTitle={substepTitle || null}
                stepTitle={course.title || ""} 
                courseContent={course.course_content}
              />
            ) : (
              <p>Ce cours n'a pas de contenu.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
