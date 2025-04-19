
import React, { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
  showLoader?: boolean;
  delay?: number;
  fallback?: React.ReactNode;
}

export default function LazyLoad({ 
  children, 
  height = 200, 
  className = "", 
  showLoader = false,
  delay = 100,
  fallback
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // Set up the timeout
    timeoutRef.current = window.setTimeout(() => {
      if (mountedRef.current) {
        setIsLoaded(true);
      }
    }, delay);

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  if (!isLoaded) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
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
