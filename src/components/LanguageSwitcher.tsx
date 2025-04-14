
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  
  return (
    <div className="flex items-center gap-2">
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
