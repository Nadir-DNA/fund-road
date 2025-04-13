
import React, { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface LazyLoadProps {
  children: React.ReactNode;
  height?: string | number;
  className?: string;
}

export default function LazyLoad({ children, height = 200, className = "" }: LazyLoadProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!isLoaded) {
    return <Skeleton className={`w-full ${className}`} style={{ height }} />;
  }

  return <>{children}</>;
}
