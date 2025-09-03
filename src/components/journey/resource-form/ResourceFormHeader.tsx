
import React from 'react';
import { CardTitle, CardDescription } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { getResourceReturnPath } from "@/utils/navigationUtils";

interface ResourceFormHeaderProps {
  title: string;
  description: string;
  stepId: number;
  substepTitle: string;
}

export default function ResourceFormHeader({
  title,
  description,
  stepId,
  substepTitle
}: ResourceFormHeaderProps) {
  const navigate = useNavigate();
  
  const handleBackClick = () => {
    // Check if there's a saved return path
    const returnPath = getResourceReturnPath();
    if (returnPath) {
      navigate(returnPath);
    } else {
      // Fallback: Go to step detail
      navigate(`/roadmap/step/${stepId}${substepTitle ? `/${encodeURIComponent(substepTitle)}` : ''}`);
    }
  };

  return (
    <div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-2" 
        onClick={handleBackClick}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Retour
      </Button>
      <CardTitle className="text-xl">{title}</CardTitle>
      <CardDescription className="mt-1">{description}</CardDescription>
    </div>
  );
}
