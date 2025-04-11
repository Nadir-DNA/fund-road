
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, Filter, FileText, BookOpen, PresentationIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { journeySteps } from "@/data/journeySteps";
import { Checkbox } from "@/components/ui/checkbox";
import JourneyProgressIndicator from "@/components/journey/JourneyProgressIndicator";

interface Resource {
  id: string;
  title: string;
  description: string;
  resource_type: string;
  course_content?: string;
  file_url?: string;
  step_id: number;
  substep_title: string;
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    types: [] as string[],
    stepIds: [] as number[]
  });
  
  const { toast } = useToast();

  // Récupérer toutes les ressources interactives de la roadmap depuis la base de données
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

  const toggleTypeFilter = (type: string) => {
    setFilters(prev => {
      if (prev.types.includes(type)) {
        return { ...prev, types: prev.types.filter(t => t !== type) };
      } else {
        return { ...prev, types: [...prev.types, type] };
      }
    });
  };

  const toggleStepFilter = (stepId: number) => {
    setFilters(prev => {
      if (prev.stepIds.includes(stepId)) {
        return { ...prev, stepIds: prev.stepIds.filter(id => id !== stepId) };
      } else {
        return { ...prev, stepIds: [...prev.stepIds, stepId] };
      }
    });
  };

  // Filtrer les ressources en fonction des critères sélectionnés
  const filteredResources = resources.filter(resource => {
    // Filtre par recherche textuelle
    if (searchQuery && 
        !resource.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !resource.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Filtre par type de ressource
    if (filters.types.length > 0 && !filters.types.includes(resource.resource_type)) {
      return false;
    }
    
    // Filtre par étape
    if (filters.stepIds.length > 0 && !filters.stepIds.includes(resource.step_id)) {
      return false;
    }
    
    return true;
  });

  // Obtenir l'icône appropriée selon le type de ressource
  const getResourceIcon = (resourceType: string) => {
    switch (resourceType.toLowerCase()) {
      case 'canvas':
      case 'matrice':
        return <PresentationIcon className="h-10 w-10 text-primary" />;
      case 'document':
      case 'template':
        return <FileText className="h-10 w-10 text-primary" />;
      default:
        return <BookOpen className="h-10 w-10 text-primary" />;
    }
  };

  // Trouver le nom de l'étape à partir de l'ID
  const getStepName = (stepId: number) => {
    const step = journeySteps.find(s => s.id === stepId);
    return step ? step.title : `Étape ${stepId}`;
  };
  
  // Regrouper les ressources par étape
  const resourcesByStep = filteredResources.reduce((acc, resource) => {
    if (!acc[resource.step_id]) {
      acc[resource.step_id] = [];
    }
    acc[resource.step_id].push(resource);
    return acc;
  }, {} as { [key: number]: Resource[] });

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.15),transparent_60%)]"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.15),transparent_60%)]"></div>
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-20 relative z-10">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">Ressources du Parcours Entrepreneurial</h1>
          <p className="text-lg md:text-xl text-white/70 max-w-3xl mx-auto">
            Accédez à toutes les ressources interactives et outils de votre parcours Fund Road pour développer votre projet.
          </p>
        </div>
        
        <JourneyProgressIndicator />
        
        {/* Filtres et recherche */}
        <div className="mb-10 glass-card p-6 rounded-lg">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-grow relative">
              <Input
                className="pl-10 bg-black/40 border-white/10 text-white"
                placeholder="Rechercher une ressource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 h-4 w-4" />
            </div>
            
            <div className="flex-shrink-0">
              <Button 
                variant="outline" 
                className="border-white/10 text-white hover:bg-white/10 w-full md:w-auto"
                onClick={() => document.getElementById("filters")?.classList.toggle("hidden")}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>
          </div>
          
          <div id="filters" className="hidden mt-6 pt-4 border-t border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Filtres par type */}
              <div>
                <h3 className="font-medium mb-3">Type de ressource</h3>
                <div className="flex flex-wrap gap-4">
                  {['canvas', 'matrice', 'document', 'template', 'outil'].map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`type-${type}`} 
                        checked={filters.types.includes(type)}
                        onCheckedChange={() => toggleTypeFilter(type)}
                      />
                      <label 
                        htmlFor={`type-${type}`}
                        className="text-sm cursor-pointer"
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Filtres par étape */}
              <div>
                <h3 className="font-medium mb-3">Étape du parcours</h3>
                <div className="flex flex-wrap gap-4">
                  {journeySteps.slice(0, 6).map(step => (
                    <div key={step.id} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`step-${step.id}`} 
                        checked={filters.stepIds.includes(step.id)}
                        onCheckedChange={() => toggleStepFilter(step.id)}
                      />
                      <label 
                        htmlFor={`step-${step.id}`}
                        className="text-sm cursor-pointer line-clamp-1"
                      >
                        {step.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Affichage des ressources */}
        <Tabs defaultValue="step" className="w-full">
          <TabsList className="w-full max-w-md mx-auto mb-8 bg-black/40 border border-white/10">
            <TabsTrigger value="step" className="flex-1">Par étape</TabsTrigger>
            <TabsTrigger value="all" className="flex-1">Toutes les ressources</TabsTrigger>
          </TabsList>
          
          <TabsContent value="step">
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
              <div className="space-y-16">
                {Object.entries(resourcesByStep)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([stepId, stepResources]) => (
                    <div key={stepId}>
                      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-white/10 pb-3">
                        <span className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center text-primary">
                          {stepId}
                        </span>
                        {getStepName(Number(stepId))}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stepResources.map(resource => (
                          <Card 
                            key={resource.id}
                            className="bg-black/60 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-300 hover:translate-y-[-5px] overflow-hidden"
                          >
                            <CardHeader>
                              <div className="flex justify-between items-start">
                                <div className="bg-primary/10 p-3 rounded-lg">
                                  {getResourceIcon(resource.resource_type)}
                                </div>
                                <span className="text-xs px-3 py-1 bg-white/10 text-white/80 rounded-full">
                                  {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}
                                </span>
                              </div>
                              <CardTitle className="mt-3">{resource.title}</CardTitle>
                              <CardDescription className="text-white/70">
                                {resource.description}
                              </CardDescription>
                            </CardHeader>
                            <CardFooter>
                              <Button 
                                className="w-full bg-white/10 hover:bg-white/20 text-white"
                                onClick={() => {
                                  setSelectedResource(resource);
                                  setResourceModalOpen(true);
                                }}
                              >
                                Voir la ressource
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="glass-card p-10 text-center">
                <h3 className="text-xl font-medium mb-2">Aucune ressource trouvée</h3>
                <p className="text-white/70">
                  Aucune ressource ne correspond à votre recherche. Essayez de modifier vos filtres.
                </p>
              </div>
            )}
          </TabsContent>
          
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
                  <Card 
                    key={resource.id}
                    className="bg-black/60 backdrop-blur-md border border-white/10 hover:border-primary/50 transition-all duration-300 hover:translate-y-[-5px] overflow-hidden"
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          {getResourceIcon(resource.resource_type)}
                        </div>
                        <span className="text-xs px-3 py-1 bg-white/10 text-white/80 rounded-full">
                          {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}
                        </span>
                      </div>
                      <CardTitle className="mt-3">{resource.title}</CardTitle>
                      <CardDescription className="text-white/70">
                        {resource.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter>
                      <Button 
                        className="w-full bg-white/10 hover:bg-white/20 text-white"
                        onClick={() => {
                          setSelectedResource(resource);
                          setResourceModalOpen(true);
                        }}
                      >
                        Voir la ressource
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="glass-card p-10 text-center">
                <h3 className="text-xl font-medium mb-2">Aucune ressource trouvée</h3>
                <p className="text-white/70">
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
                  {selectedResource.description}
                </DialogDescription>
              </DialogHeader>
              
              <div className="py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-sm text-white/70">Étape: {getStepName(selectedResource.step_id)}</span>
                    <p className="text-sm text-white/70">Type: {selectedResource.resource_type}</p>
                    <p className="text-sm text-white/70">Sous-étape: {selectedResource.substep_title}</p>
                  </div>
                </div>
                
                {selectedResource.course_content && (
                  <div className="mt-4 border border-white/10 rounded-lg p-4">
                    <h3 className="font-medium mb-2">Contenu associé:</h3>
                    <p className="text-white/70">{selectedResource.course_content}</p>
                  </div>
                )}
                
                {selectedResource.file_url ? (
                  <div className="mt-6">
                    <Button 
                      variant="default"
                      className="w-full sm:w-auto"
                      onClick={() => window.open(selectedResource.file_url, '_blank')}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Télécharger la ressource
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 p-4 border border-white/10 rounded-md text-center">
                    <p className="text-white/70">Accédez à cette ressource interactive dans le parcours entrepreneur</p>
                    <Button 
                      variant="outline" 
                      className="mt-4 border-primary/40 hover:bg-primary/20"
                      onClick={() => {
                        setResourceModalOpen(false);
                        // Rediriger vers l'étape correspondante
                        window.location.href = '/features';
                      }}
                    >
                      Aller au parcours entrepreneur
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
