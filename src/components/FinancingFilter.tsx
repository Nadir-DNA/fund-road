
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function FinancingFilter() {
  return (
    <div className="glass-card p-6 mb-8">
      <h3 className="text-xl font-semibold mb-4">Filtrer les sources de financement</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Rechercher..." 
              className="pl-10" 
            />
          </div>
        </div>
        
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Secteur d'activité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech">Tech & Numérique</SelectItem>
              <SelectItem value="health">Santé & Biotech</SelectItem>
              <SelectItem value="green">GreenTech & Énergie</SelectItem>
              <SelectItem value="retail">Commerce & Services</SelectItem>
              <SelectItem value="industry">Industrie & Manufacturing</SelectItem>
              <SelectItem value="all">Tous secteurs</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Stade de développement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pre-seed">Pré-amorçage</SelectItem>
              <SelectItem value="seed">Amorçage</SelectItem>
              <SelectItem value="series-a">Série A</SelectItem>
              <SelectItem value="growth">Croissance</SelectItem>
              <SelectItem value="all">Tous stades</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Localisation" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paris">Paris</SelectItem>
              <SelectItem value="lyon">Lyon</SelectItem>
              <SelectItem value="marseille">Marseille</SelectItem>
              <SelectItem value="france">France entière</SelectItem>
              <SelectItem value="europe">Europe</SelectItem>
              <SelectItem value="all">Monde entier</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <span>Appliquer les filtres</span>
        </Button>
      </div>
    </div>
  );
}
