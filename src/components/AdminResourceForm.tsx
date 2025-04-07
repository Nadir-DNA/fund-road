
import { useState, useEffect } from "react";
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

interface Category {
  id: string;
  name: string;
}

export function AdminResourceForm() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const { toast } = useToast();
  
  useEffect(() => {
    // Fetch categories when component mounts
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name');
      
      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      if (data) {
        setCategories(data);
      }
    };
    
    fetchCategories();
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Vous devez être connecté pour publier une ressource.");
      }
      
      // Insert resource
      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .insert({
          title,
          excerpt,
          content,
          category_id: categoryId || null,
          author_id: user.id,
          published: true,
        } as Database['public']['Tables']['resources']['Insert'])
        .select()
        .single();
      
      if (resourceError) throw resourceError;
      
      // Process tags
      if (tags.trim()) {
        const tagList = tags.split(',').map(tag => tag.trim());
        
        // Insert each tag if it doesn't exist and create resource_tag relation
        for (const tagName of tagList) {
          // Check if tag exists
          let { data: existingTags, error: tagError } = await supabase
            .from('tags')
            .select('id')
            .eq('name', tagName);
          
          if (tagError) throw tagError;
          
          let tagId;
          
          if (!existingTags || existingTags.length === 0) {
            // Create new tag
            const { data: newTag, error: newTagError } = await supabase
              .from('tags')
              .insert({ name: tagName } as Database['public']['Tables']['tags']['Insert'])
              .select('id')
              .single();
            
            if (newTagError) throw newTagError;
            tagId = newTag?.id;
          } else {
            tagId = existingTags[0].id;
          }
          
          // Create resource_tag relation
          const { error: relationError } = await supabase
            .from('resource_tags')
            .insert({
              resource_id: resource?.id,
              tag_id: tagId
            } as Database['public']['Tables']['resource_tags']['Insert']);
          
          if (relationError) throw relationError;
        }
      }
      
      toast({
        title: "Ressource enregistrée",
        description: "La ressource a été enregistrée avec succès.",
        variant: "default",
      });
      
      // Reset form
      setTitle("");
      setExcerpt("");
      setContent("");
      setCategoryId("");
      setTags("");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de l'enregistrement de la ressource.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Publier une nouvelle ressource</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Titre</Label>
          <Input 
            id="title" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la ressource"
            className="bg-black/40 border-white/10 text-white"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="excerpt">Extrait</Label>
          <Textarea 
            id="excerpt" 
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Court résumé de la ressource"
            className="bg-black/40 border-white/10 text-white resize-none h-20"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="content">Contenu</Label>
          <Textarea 
            id="content" 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contenu détaillé de la ressource"
            className="bg-black/40 border-white/10 text-white resize-none h-48"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Select 
              value={categoryId} 
              onValueChange={setCategoryId}
            >
              <SelectTrigger className="bg-black/40 border-white/10 text-white">
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
            <Input 
              id="tags" 
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ex: startup, financement, idéation"
              className="bg-black/40 border-white/10 text-white"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            className="bg-primary hover:bg-primary/90"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enregistrement..." : "Publier la ressource"}
          </Button>
        </div>
      </form>
    </div>
  );
}
