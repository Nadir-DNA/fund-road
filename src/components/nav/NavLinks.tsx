
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";

export function NavLinks() {
  const location = useLocation();
  const { t } = useLanguage();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <Link 
        to="/" 
        className={`text-white/90 hover:text-white transition-colors ${
          isActive('/') ? 'text-white font-medium' : ''
        }`}
      >
        {t("nav.home")}
      </Link>
      <Link 
        to="/roadmap" 
        className={`text-white/90 hover:text-white transition-colors ${
          isActive('/roadmap') ? 'text-white font-medium' : ''
        }`}
      >
        {t("nav.roadmap")}
      </Link>
      <Link 
        to="/financing" 
        className={`text-white/90 hover:text-white transition-colors ${
          isActive('/financing') ? 'text-white font-medium' : ''
        }`}
      >
        {t("nav.financing")}
      </Link>
      <Link 
        to="/blog" 
        className={`text-white/90 hover:text-white transition-colors ${
          isActive('/blog') ? 'text-white font-medium' : ''
        }`}
      >
        {t("nav.blog")}
      </Link>
    </>
  );
}
