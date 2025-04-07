
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

interface ResourceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  className?: string;
}

export default function ResourceCard({ 
  title, 
  description, 
  icon, 
  href, 
  className 
}: ResourceCardProps) {
  return (
    <div className={cn(
      "glass-card p-6 transition-all duration-300 hover:translate-y-[-5px]", 
      className
    )}>
      <div className="mb-4 p-3 rounded-full inline-flex bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button asChild variant="outline" className="w-full">
        <Link to={href} className="flex items-center justify-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>Accéder</span>
        </Link>
      </Button>
    </div>
  );
}
