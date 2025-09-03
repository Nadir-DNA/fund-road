
import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

export const useStepTabs = (selectedResourceName: string | null = null) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const tabFromUrl = searchParams.get('tab');
  
  // Initialize activeTab based on URL params or default to overview
  const [activeTab, setActiveTab] = useState<string>(
    tabFromUrl || (selectedResourceName ? 'resources' : 'overview')
  );
  
  // Track the current path to detect changes
  const [currentPath, setCurrentPath] = useState<string>(location.pathname);
  
  // Reset tab when path changes (indicating step change)
  useEffect(() => {
    // Check for path changes (different step)
    if (location.pathname !== currentPath) {
      console.log(`Path changed from ${currentPath} to ${location.pathname}, resetting to overview tab`);
      setActiveTab("overview");
      setCurrentPath(location.pathname);
      return;
    }
    
    // If a resource is selected in the URL, make sure we're on the resources tab
    if (selectedResourceName && activeTab !== "resources") {
      console.log(`Setting activeTab to resources because resource ${selectedResourceName} is selected`);
      setActiveTab("resources");
      return;
    }
    
    // Normal tab handling from URL params
    if (tabFromUrl && tabFromUrl !== activeTab) {
      console.log(`Setting activeTab to ${tabFromUrl} from URL params`);
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl, selectedResourceName, location, currentPath, activeTab]);

  const handleTabChange = (value: string) => {
    console.log(`Tab changed to: ${value}`);
    setActiveTab(value);
  };

  return {
    activeTab,
    handleTabChange
  };
};
