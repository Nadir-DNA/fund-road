
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export function AdminInvestorForm() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [sectors, setSectors] = useState("");
  const [stage, setStage] = useState("");
  const [ticket, setTicket] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Convert comma-separated sectors to array
      const sectorsArray = sectors.split(",").map(sector => sector.trim());
      
      const { error } = await supabase
        .from('investors')
        .insert({
          name,
          type,
          sectors: sectorsArray,
          stage,
          ticket,
          location,
          description
        } as Database['public']['Tables']['investors']['Insert']);
      
      if (error) throw error;
      
      toast({
        title: "Investisseur enregistré",
        description: "L'investisseur a été enregistré avec succès.",
        variant: "default",
      });
      
      // Reset form
      setName("");
      setType("");
      setSectors("");
      setStage("");
      setTicket("");
      setLocation("");
      setDescription("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'enregistrement de l'investisseur.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Ajouter un nouvel investisseur</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input 
            id="name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nom de l'investisseur"
            className="bg-black/40 border-white/10 text-white"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="type">Type d'investisseur</Label>
            <Select 
              value={type} 
              onValueChange={setType}
              required
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white">
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fonds d'investissement">Fonds d'investissement</SelectItem>
                <SelectItem value="Fonds Impact">Fonds Impact</SelectItem>
                <SelectItem value="Capital Développement">Capital Développement</SelectItem>
                <SelectItem value="Réseau de Business Angels">Réseau de Business Angels</SelectItem>
                <SelectItem value="Corporate VC">Corporate VC</SelectItem>
                <SelectItem value="Micro VC">Micro VC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sectors">Secteurs (séparés par des virgules)</Label>
            <Input 
              id="sectors" 
              value={sectors}
              onChange={(e) => setSectors(e.target.value)}
              placeholder="ex: Tech, SaaS, IA"
              className="bg-black/40 border-white/10 text-white"
              required
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stage">Stade d'investissement</Label>
            <Input 
              id="stage" 
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              placeholder="ex: Amorçage à Série A"
              className="bg-black/40 border-white/10 text-white"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="ticket">Ticket moyen</Label>
            <Input 
              id="ticket" 
              value={ticket}
              onChange={(e) => setTicket(e.target.value)}
              placeholder="ex: 500K€ - 3M€"
              className="bg-black/40 border-white/10 text-white"
              required
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Localisation</Label>
          <Input 
            id="location" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="ex: Paris, France"
            className="bg-black/40 border-white/10 text-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description de l'investisseur"
            className="bg-black/40 border-white/10 text-white resize-none h-20"
            required
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Ajouter l'investisseur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
