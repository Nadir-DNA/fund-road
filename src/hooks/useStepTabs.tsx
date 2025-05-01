
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useStepTabs = (selectedResourceName: string | null) => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  
  // Initialize activeTab based on URL params or default to overview
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "overview");
  
  // Set the activeTab based on the URL params and the selectedResourceName
  useEffect(() => {
    if (tabFromUrl) {
      console.log(`Setting activeTab to ${tabFromUrl} from URL params`);
      setActiveTab(tabFromUrl);
    } else if (selectedResourceName) {
      // If a resource is selected but no tab is specified, switch to the resources tab
      console.log(`Setting activeTab to resources because resource ${selectedResourceName} is selected`);
      setActiveTab("resources");
    }
  }, [tabFromUrl, selectedResourceName]);

  const handleTabChange = (value: string) => {
    console.log(`Tab changed to: ${value}`);
    setActiveTab(value);
  };

  return {
    activeTab,
    handleTabChange
  };
};
