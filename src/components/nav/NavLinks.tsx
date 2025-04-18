
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

export const NavLinks = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
  return (
    <div className="hidden md:flex items-center space-x-8">
      <Link to="/" className="text-foreground/80 hover:text-primary transition-colors">
        Accueil
      </Link>
      <Link to={isAuthenticated ? "/roadmap" : "/auth"} className="text-foreground/80 hover:text-primary transition-colors">
        Roadmap
      </Link>
      <Link to={isAuthenticated ? "/financing" : "/auth"} className="text-foreground/80 hover:text-primary transition-colors">
        Financement
      </Link>
      
      <DropdownMenu>
        <DropdownMenuTrigger className="text-foreground/80 hover:text-primary transition-colors inline-flex items-center">
          Nous découvrir
          <ChevronDown className="ml-1 h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <Link to="/about">À propos</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/faq">FAQ</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to="/contact">Contact</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
