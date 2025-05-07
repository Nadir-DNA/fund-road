
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useLocation } from "react-router-dom";

export const useStepTabs = (selectedResourceName: string | null) => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const tabFromUrl = searchParams.get('tab');
  
  // Initialize activeTab based on URL params or default to overview
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "overview");
  
  // Track the current step ID to detect changes
  const [currentPath, setCurrentPath] = useState<string>(location.pathname);
  const lastStateResetTimestamp = useRef<number>(0);
  
  // Reset tab when path changes (indicating step change) or on resetResource in state
  useEffect(() => {
    // Check for path change (different step)
    if (location.pathname !== currentPath) {
      console.log(`Path changed from ${currentPath} to ${location.pathname}, resetting to overview tab`);
      setActiveTab("overview");
      setCurrentPath(location.pathname);
      return;
    }
    
    // Check for navigation state that indicates step change
    if (location.state && (location.state as any).resetResource) {
      const stateTimestamp = (location.state as any).timestamp || Date.now();
      
      // Only process if this is a new state reset (prevents duplicate processing)
      if (stateTimestamp > lastStateResetTimestamp.current) {
        console.log("Tab reset requested via navigation state with timestamp:", stateTimestamp);
        lastStateResetTimestamp.current = stateTimestamp;
        setActiveTab("overview");
        return;
      }
    }
    
    // Normal tab handling from URL params
    if (tabFromUrl && tabFromUrl !== activeTab) {
      console.log(`Setting activeTab to ${tabFromUrl} from URL params`);
      setActiveTab(tabFromUrl);
    } else if (selectedResourceName && activeTab !== "resources") {
      // If a resource is selected but no tab is specified, switch to the resources tab
      console.log(`Setting activeTab to resources because resource ${selectedResourceName} is selected`);
      setActiveTab("resources");
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
