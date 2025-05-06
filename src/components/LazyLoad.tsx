
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
  delay = 0,
  priority = true // Always prioritize loading by default
}: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(priority);
  const [initialRender, setInitialRender] = useState(true);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  
  // Effect to handle loading state with proper cleanup
  useEffect(() => {
    // Mark component as mounted
    mountedRef.current = true;
    
    // If priority is true, show content immediately
    if (priority) {
      setIsLoaded(true);
      return;
    }
    
    // Only apply delay when not in priority mode
    if (!isLoaded && delay > 0) {
      console.log(`LazyLoad: Setting up delay of ${delay}ms`);
      timeoutRef.current = window.setTimeout(() => {
        if (mountedRef.current) {
          console.log("LazyLoad: Timeout completed, showing content");
          setIsLoaded(true);
        }
      }, delay);
    } else if (!isLoaded) {
      // No delay but still need to set loaded
      console.log("LazyLoad: No delay specified, showing content immediately");
      setIsLoaded(true);
    }

    // Clean up timeout when unmounting or when deps change
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current !== null) {
        console.log("LazyLoad: Clearing timeout during cleanup");
        clearTimeout(timeoutRef.current);
      }
    };
  }, [delay, priority, isLoaded]);

  // UseEffect to mark initial render completed
  useEffect(() => {
    // Use requestAnimationFrame to ensure we're in the next paint cycle
    requestAnimationFrame(() => {
      if (mountedRef.current) {
        setInitialRender(false);
      }
    });
  }, []);

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

  // Return children directly when loaded with a key to force remounting
  return <div key={initialRender ? 'initial' : 'loaded'}>{children}</div>;
}
