
import { Link } from "react-router-dom";
import { Book, Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/80 relative z-10">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8 sm:mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Book className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="font-bold text-lg sm:text-xl">Fund Road</span>
            </div>
            <p className="text-white/60 max-w-xs text-sm sm:text-base">
              Accompagnez votre entreprise de l'idée au financement avec notre plateforme intuitive dédiée aux entrepreneurs.
            </p>
            <div className="flex space-x-3 sm:space-x-4">
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full h-8 w-8 sm:h-10 sm:w-10">
                <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Parcours Entrepreneur</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  Étapes du parcours
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  Business Model Canvas
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  Business Plan
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  Pitch Deck
                </Link>
              </li>
              <li>
                <Link to="/financing" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  Financements
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">Ressources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  Guides pratiques
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  Check-lists
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/financing" className="text-white/60 hover:text-primary transition-colors text-sm sm:text-base">
                  Options de financement
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs sm:text-sm text-white/60">
            © {new Date().getFullYear()} Fund Road. Tous droits réservés.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0 text-xs sm:text-sm">
            <Link to="/faq" className="text-white/60 hover:text-primary transition-colors">
              Conditions d'utilisation
            </Link>
            <Link to="/faq" className="text-white/60 hover:text-primary transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/faq" className="text-white/60 hover:text-primary transition-colors">
              Politique de cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
