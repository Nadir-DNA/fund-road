
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ResourceCard from "@/components/ResourceCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, BookOpen, PresentationIcon, Search, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { journeySteps } from "@/data/journeySteps";

interface Resource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  file_url?: string;
  step_id: number;
  substep_title: string;
}

interface FilterState {
  stepId: number | null;
  resourceType: string | null;
  searchQuery: string;
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    stepId: null,
    resourceType: null,
    searchQuery: ""
  });

  const { toast } = useToast();

  // Récupérer toutes les ressources de la roadmap depuis la base de données
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('entrepreneur_resources')
          .select('*');
          
        if (error) {
          console.error("Error fetching resources:", error);
          toast({
            title: "Erreur",
            description: "Impossible de charger les ressources",
            variant: "destructive"
          });
        } else if (data) {
          setResources(data as Resource[]);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchResources();
  }, []);

  // Filtrer les ressources en fonction des critères sélectionnés
  const filteredResources = resources.filter(resource => {
    // Filtre par étape
    if (filters.stepId !== null && resource.step_id !== filters.stepId) {
      return false;
    }
    
    // Filtre par type de ressource
    if (filters.resourceType && resource.resource_type !== filters.resourceType) {
      return false;
    }
    
    // Filtre par recherche textuelle
    if (filters.searchQuery && !resource.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) && 
        !resource.description.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Organiser les ressources par étape pour l'affichage
  const resourcesByStep = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.step_id]) {
      acc[resource.step_id] = [];
    }
    acc[resource.step_id].push(resource);
    return acc;
  }, {} as { [key: number]: Resource[] });

  // Obtenir l'icône appropriée selon le type de ressource
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case 'canvas':
        return <PresentationIcon className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <BookOpen className="h-5 w-5" />;
    }
  };

  // Trouver le nom de l'étape à partir de l'ID
  const getStepName = (stepId: number) => {
    const step = journeySteps.find(s => s.id === stepId);
    return step ? step.title : `Étape ${stepId}`;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Ressources Entrepreneuriales</h1>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Accédez à toutes les ressources de votre parcours entrepreneurial centralisées en un seul endroit.
          </p>
        </div>
        
        {/* Filtres et recherche */}
        <div className="mb-8 glass-card p-6 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <Input
                className="pl-10"
                placeholder="Rechercher une ressource..."
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            </div>
            
            <select
              className="bg-black/20 border border-white/10 rounded-md px-4 py-2"
              value={filters.stepId?.toString() || ""}
              onChange={(e) => setFilters({...filters, stepId: e.target.value ? Number(e.target.value) : null})}
            >
              <option value="">Toutes les étapes</option>
              {journeySteps.map(step => (
                <option key={step.id} value={step.id.toString()}>{step.title}</option>
              ))}
            </select>
            
            <select
              className="bg-black/20 border border-white/10 rounded-md px-4 py-2"
              value={filters.resourceType || ""}
              onChange={(e) => setFilters({...filters, resourceType: e.target.value || null})}
            >
              <option value="">Tous les types</option>
              <option value="document">Document</option>
              <option value="canvas">Canvas</option>
              <option value="template">Template</option>
              <option value="tool">Outil</option>
            </select>
          </div>
        </div>
        
        {/* Affichage des ressources par étape */}
        <Tabs defaultValue="byStep" className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-8">
            <TabsTrigger value="byStep" className="flex-1">Par étape</TabsTrigger>
            <TabsTrigger value="byType" className="flex-1">Par type</TabsTrigger>
            <TabsTrigger value="all" className="flex-1">Toutes</TabsTrigger>
          </TabsList>
          
          {/* Vue par étape */}
          <TabsContent value="byStep">
            {isLoading ? (
              <div className="grid grid-cols-1 gap-8 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card p-6 rounded-lg">
                    <div className="h-8 bg-white/10 rounded mb-4 w-1/3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="h-40 bg-white/5 rounded"></div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : Object.keys(resourcesByStep).length > 0 ? (
              <div className="space-y-10">
                {Object.entries(resourcesByStep).map(([stepId, stepResources]) => (
                  <div key={stepId} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
                      {getStepName(Number(stepId))}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {stepResources.map(resource => (
                        <ResourceCard
                          key={resource.id}
                          title={resource.title}
                          description={resource.description || "Aucune description disponible"}
                          icon={getResourceIcon(resource.resource_type)}
                          href="#"
                          onClick={() => {
                            setSelectedResource(resource);
                            setResourceModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">Aucune ressource trouvée</h3>
                <p className="text-muted-foreground">
                  Aucune ressource ne correspond à votre recherche. Essayez de modifier vos filtres.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Vue par type */}
          <TabsContent value="byType">
            {isLoading ? (
              <div className="animate-pulse">
                {/* Contenus de chargement similaires à la vue par étape */}
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="space-y-10">
                {/* Grouper par type de ressource */}
                {Object.entries(
                  filteredResources.reduce((acc, resource) => {
                    if (!acc[resource.resource_type]) {
                      acc[resource.resource_type] = [];
                    }
                    acc[resource.resource_type].push(resource);
                    return acc;
                  }, {} as { [key: string]: Resource[] })
                ).map(([type, typeResources]) => (
                  <div key={type} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 border-b border-white/10 pb-2">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {typeResources.map(resource => (
                        <ResourceCard
                          key={resource.id}
                          title={resource.title}
                          description={resource.description || "Aucune description disponible"}
                          icon={getResourceIcon(resource.resource_type)}
                          href="#"
                          onClick={() => {
                            setSelectedResource(resource);
                            setResourceModalOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">Aucune ressource trouvée</h3>
                <p className="text-muted-foreground">
                  Aucune ressource ne correspond à votre recherche. Essayez de modifier vos filtres.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Vue de toutes les ressources */}
          <TabsContent value="all">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                {Array(9).fill(0).map((_, i) => (
                  <div key={i} className="h-60 bg-white/5 rounded"></div>
                ))}
              </div>
            ) : filteredResources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map(resource => (
                  <ResourceCard
                    key={resource.id}
                    title={resource.title}
                    description={resource.description || "Aucune description disponible"}
                    icon={getResourceIcon(resource.resource_type)}
                    href="#"
                    onClick={() => {
                      setSelectedResource(resource);
                      setResourceModalOpen(true);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-xl font-medium mb-2">Aucune ressource trouvée</h3>
                <p className="text-muted-foreground">
                  Aucune ressource ne correspond à votre recherche. Essayez de modifier vos filtres.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Modal pour afficher les détails de la ressource */}
      <Dialog open={resourceModalOpen} onOpenChange={setResourceModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto glass-card">
          {selectedResource && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedResource.title}</DialogTitle>
                <DialogDescription>
                  {selectedResource.description || "Aucune description disponible"}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Étape: {getStepName(selectedResource.step_id)}</span>
                    <p className="text-sm text-muted-foreground">Type: {selectedResource.resource_type}</p>
                  </div>
                </div>
                
                {selectedResource.file_url ? (
                  <div className="mt-4">
                    <Button 
                      variant="default"
                      className="w-full sm:w-auto"
                      onClick={() => window.open(selectedResource.file_url, '_blank')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Télécharger le document
                    </Button>
                  </div>
                ) : (
                  <div className="p-4 border border-white/10 rounded-md text-center">
                    <p>Cette ressource nécessite d'être complétée dans l'étape correspondante du parcours.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setResourceModalOpen(false);
                        // Rediriger vers l'étape correspondante (à implémenter)
                      }}
                    >
                      Aller à l'étape
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
}
