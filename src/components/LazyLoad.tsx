
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
  showLoader?: boolean;
  delay?: number;
}

export default function LazyLoad({ 
  children, 
  height = 200, 
  className = "", 
  showLoader = false,
  delay = 100
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

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
