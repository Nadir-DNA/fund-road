
import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingIndicator({ size = "md", className = "" }: LoadingIndicatorProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeMap[size]}`} />
    </div>
  );
}
