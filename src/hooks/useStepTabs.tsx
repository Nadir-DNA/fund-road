
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export const useStepTabs = (selectedResourceName: string | null) => {
  const [activeTab, setActiveTab] = useState<string>(selectedResourceName ? "resources" : "overview");
  
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
