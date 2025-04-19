
import { useState, useEffect } from "react";

export const useStepTabs = (selectedResourceName: string | null) => {
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  useEffect(() => {
    if (selectedResourceName) {
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
