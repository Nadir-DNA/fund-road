
import { useState, useEffect } from "react";

export const useStepTabs = (selectedResourceName: string | null) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Set the activeTab based on the selectedResourceName
  // This effect runs when the component mounts or when selectedResourceName changes
  useEffect(() => {
    if (selectedResourceName) {
      // If a resource is selected, switch to the resources tab
      setActiveTab("resources");
    }
  }, [selectedResourceName]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return {
    activeTab,
    handleTabChange
  };
};
