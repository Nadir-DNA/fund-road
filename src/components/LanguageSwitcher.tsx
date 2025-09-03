
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isChanging, setIsChanging] = useState(false);
  
  const handleLanguageChange = async (newLanguage: "fr" | "en") => {
    if (language === newLanguage) return;
    
    setIsChanging(true);
    setLanguage(newLanguage);
    
    // Show toast notification
    toast({
      title: newLanguage === "fr" ? "Langue changée en Français" : "Language changed to English",
      description: newLanguage === "fr" 
        ? "Le contenu du site est maintenant affiché en Français"
        : "Website content is now displayed in English",
      duration: 3000,
    });
    
    // Small delay to show loading state
    setTimeout(() => {
      setIsChanging(false);
    }, 500);
  };
  
  return (
    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2">
      <Globe className="h-4 w-4 text-white/70" />
      <Button
        variant={language === "fr" ? "default" : "outline"}
        className={`px-3 py-1 h-auto text-xs ${
          language === "fr" 
            ? "bg-primary text-white" 
            : "bg-transparent border-white/20 text-white"
        }`}
        onClick={() => handleLanguageChange("fr")}
        disabled={isChanging}
      >
        FR
      </Button>
      <Button
        variant={language === "en" ? "default" : "outline"}
        className={`px-3 py-1 h-auto text-xs ${
          language === "en" 
            ? "bg-primary text-white" 
            : "bg-transparent border-white/20 text-white"
        }`}
        onClick={() => handleLanguageChange("en")}
        disabled={isChanging}
      >
        EN
      </Button>
    </div>
  );
}
