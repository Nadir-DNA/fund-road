
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { Globe } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm border border-white/10 rounded-md px-3 py-2">
      <Globe className="h-4 w-4 text-white/70" />
      <Button
        variant={language === "fr" ? "default" : "outline"}
        className={`px-3 py-1 h-auto text-xs ${language === "fr" ? "bg-primary text-white" : "bg-transparent border-white/20 text-white"}`}
        onClick={() => setLanguage("fr")}
      >
        FR
      </Button>
      <Button
        variant={language === "en" ? "default" : "outline"}
        className={`px-3 py-1 h-auto text-xs ${language === "en" ? "bg-primary text-white" : "bg-transparent border-white/20 text-white"}`}
        onClick={() => setLanguage("en")}
      >
        EN
      </Button>
    </div>
  );
}
