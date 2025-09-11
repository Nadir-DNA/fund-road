
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { SignInUpButtons } from "./auth/SignInUpButtons";
import type { AuthButtonsProps } from "@/types/auth";

export const AuthButtons = ({ isAuthenticated, onSignOut, onAuthClick }: AuthButtonsProps) => {
  const { t } = useLanguage();

  return (
    <div className="hidden md:flex space-x-2">
      {isAuthenticated ? (
        <Button variant="outline" onClick={onSignOut} className="text-white border-white/20 hover:bg-white/10">
          <LogOut className="h-4 w-4 mr-2" />
          {t("nav.logout")}
        </Button>
      ) : (
        <SignInUpButtons onAuthClick={onAuthClick} />
      )}
    </div>
  );
};
