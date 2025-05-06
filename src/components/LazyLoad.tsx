
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
  showLoader?: boolean;
  delay?: number;
  priority?: boolean; // Option pour chargement immédiat
}

export default function LazyLoad({ 
  children, 
  height = 200, 
  className = "", 
  showLoader = false,
  delay = 100,
  priority = false
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(priority);

  useEffect(() => {
    // Si priority est true, on saute le délai
    if (priority) {
      setIsLoaded(true);
      return;
    }
    
    // Délai minimal pour éviter les flashs
    const timeout = setTimeout(() => {
      setIsLoaded(true);
    }, delay);

    return () => clearTimeout(timeout);
  }, [delay, priority]);

  if (!isLoaded) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        {showLoader ? (
          <div className="flex items-center justify-center h-full">
            <LoadingIndicator size="md" />
          </div>
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>
    );
  }

  return <>{children}</>;
}
