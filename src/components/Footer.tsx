
import { Link } from "react-router-dom";
import { Book, Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/80 relative z-10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Book className="h-6 w-6 text-primary" />
              <span className="font-bold text-xl">Efficio</span>
            </div>
            <p className="text-white/60 max-w-xs">
              Accompagnez votre entreprise de l'idée au financement avec notre plateforme intuitive dédiée aux entrepreneurs.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full">
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full">
                <Github className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-white/5 rounded-full">
                <Facebook className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Parcours Entrepreneur</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-white/60 hover:text-primary transition-colors">
                  Étapes du parcours
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-white/60 hover:text-primary transition-colors">
                  Business Model Canvas
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-white/60 hover:text-primary transition-colors">
                  Business Plan
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-white/60 hover:text-primary transition-colors">
                  Pitch Deck
                </Link>
              </li>
              <li>
                <Link to="/financing" className="text-white/60 hover:text-primary transition-colors">
                  Financements
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Ressources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/blog" className="text-white/60 hover:text-primary transition-colors">
                  Guides pratiques
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/60 hover:text-primary transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-white/60 hover:text-primary transition-colors">
                  Check-lists
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-white/60 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/financing" className="text-white/60 hover:text-primary transition-colors">
                  Options de financement
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Efficio. Tous droits réservés.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/faq" className="text-sm text-white/60 hover:text-primary transition-colors">
              Conditions d'utilisation
            </Link>
            <Link to="/faq" className="text-sm text-white/60 hover:text-primary transition-colors">
              Politique de confidentialité
            </Link>
            <Link to="/faq" className="text-sm text-white/60 hover:text-primary transition-colors">
              Politique de cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
