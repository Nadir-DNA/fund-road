
import React, { useEffect, useState, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
  showLoader?: boolean;
  delay?: number;
  priority?: boolean; // Option for immediate loading
}

export default function LazyLoad({ 
  children, 
  height = 200, 
  className = "", 
  showLoader = false,
  delay = 0, // No delay by default
  priority = true // Always prioritize loading by default
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(priority);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Mark component as mounted
    mountedRef.current = true;
    
    // If priority is true, skip the delay
    if (priority) {
      setIsLoaded(true);
      return;
    }
    
    // Only apply delay when not in priority mode
    if (!isLoaded && delay > 0) {
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          setIsLoaded(true);
        }
      }, delay);
    } else if (!isLoaded) {
      // No delay but still need to set loaded
      setIsLoaded(true);
    }

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, priority, isLoaded]);

  if (!isLoaded) {
    return (
      <div className={`w-full ${className}`} style={{ height }}>
        {showLoader ? (
          <div className="flex items-center justify-center h-full">
            <LoadingIndicator size="sm" />
          </div>
        ) : (
          <Skeleton className="h-full w-full" />
        )}
      </div>
    );
  }

  // Return children directly when loaded
  return <>{children}</>;
}
