
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
  const [isVisible, setIsVisible] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const timeoutRef = useRef<number | null>(null);
  
  // Effect to handle loading state with proper cleanup
  useEffect(() => {
    // Mark component as mounted
    mountedRef.current = true;
    
    // If priority is true, show content immediately
    if (priority) {
      console.log("LazyLoad: Priority mode - showing content immediately");
      setIsLoaded(true);
      return () => {
        mountedRef.current = false;
      };
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

  // Effect for intersection observer to detect when component is in viewport
  useEffect(() => {
    if (!componentRef.current || priority) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && mountedRef.current) {
          setIsVisible(true);
          console.log("LazyLoad: Component is now visible in viewport");
          
          if (!isLoaded && mountedRef.current) {
            console.log("LazyLoad: Loading content due to visibility");
            setIsLoaded(true);
          }
        }
      },
      { threshold: 0.1 }
    );
    
    observer.observe(componentRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [isLoaded, priority]);

  return (
    <div ref={componentRef} className={`w-full ${className}`} style={{ minHeight: isLoaded ? 'auto' : height }}>
      {!isLoaded ? (
        showLoader ? (
          <div className="flex items-center justify-center h-full">
            <LoadingIndicator size="sm" />
          </div>
        ) : (
          <Skeleton className="h-full w-full" />
        )
      ) : (
        <div className="lazy-loaded-content">{children}</div>
      )}
    </div>
  );
}
