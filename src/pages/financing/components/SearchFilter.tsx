
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SearchFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: string;
  onTabChange: (value: string) => void;
}

export default function SearchFilter({ 
  searchTerm, 
  setSearchTerm, 
  activeTab, 
  onTabChange 
}: SearchFilterProps) {
  const { t } = useLanguage();

  return (
    <>
      <div className="max-w-md mx-auto relative mb-8">
        <Input
          placeholder={t("financing.search") || "Rechercher..."}
          className="bg-black/40 border-white/10 pl-10 text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
      </div>
      
      <Tabs defaultValue={activeTab} className="mb-8" onValueChange={onTabChange}>
        <TabsList className="bg-black/40 border border-white/10">
          <TabsTrigger value="all">Tous les Organismes</TabsTrigger>
          <TabsTrigger value="Venture">Venture Capital</TabsTrigger>
          <TabsTrigger value="Angel">Business Angels</TabsTrigger>
          <TabsTrigger value="Corporate">Corporate VC</TabsTrigger>
          <TabsTrigger value="Private">Private Equity</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/10">
          <Filter className="h-4 w-4 mr-2" />
          {t("financing.filter") || "Filtrer"}
        </Button>
      </div>
    </>
  );
}
