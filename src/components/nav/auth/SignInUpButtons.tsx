
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";

export const SignInUpButtons = ({ onAuthClick }: { onAuthClick: () => void }) => {
  const { t } = useLanguage();

  return (
    <>
      <Button variant="outline" onClick={onAuthClick} className="text-white border-white/20 hover:bg-white/10">
        {t("nav.login")}
      </Button>
      <Button onClick={onAuthClick} className="bg-white text-black hover:bg-white/90">
        {t("nav.signup")}
      </Button>
    </>
  );
};
