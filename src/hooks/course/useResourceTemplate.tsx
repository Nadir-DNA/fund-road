
import { useToast } from "@/components/ui/use-toast";
import { CourseMaterial } from "./types";
import { validateResourceData } from "./utils/resourceValidation";
import { createOrUpdateResourceTemplate as createOrUpdateTemplate } from "./services/resourceTemplateService";

export const useResourceTemplate = () => {
  const { toast } = useToast();

  const createOrUpdateResourceTemplate = async (resourceData: Partial<CourseMaterial>) => {
    try {
      await validateResourceData(resourceData);
      const data = await createOrUpdateTemplate(resourceData);
      
      toast({
        title: "Succès",
        description: "Ressource créée ou mise à jour avec succès",
        variant: "default",
      });
      
      return data;
      
    } catch (error: any) {
      console.error("Error creating/updating resource template:", error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { createOrUpdateResourceTemplate };
};
