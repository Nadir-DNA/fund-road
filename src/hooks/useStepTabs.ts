
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export function useStepTabs(defaultTab: string | null = null) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(
    searchParams.get('tab') || (defaultTab ? 'resources' : 'overview')
  );

  // Update search params when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tab', value);
    setSearchParams(newParams);
  };

  // Update the active tab when search params change
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  return { activeTab, handleTabChange };
}
