
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { CategorySelect } from "./admin/CategorySelect";
import { translateContentFields } from "@/utils/translationUtils";
import { useLanguage } from "@/context/LanguageContext";

// Define an interface for the resource data that includes the translated fields
interface ResourceData {
  title: string;
  excerpt: string;
  content: string;
  category_id: string | null;
  author_id: string;
  published: boolean;
  title_en?: string;
  excerpt_en?: string;
  content_en?: string;
}

export function AdminResourceForm() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const { toast } = useToast();
  const { language, t } = useLanguage();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Vous devez être connecté pour publier une ressource.");
      }
      
      // Prepare resource data with required fields
      const resourceData: ResourceData = {
        title,
        excerpt,
        content,
        category_id: categoryId || null,
        author_id: user.id,
        published: true,
      };
      
      // Translate content if needed
      setIsTranslating(true);
      try {
        // Translate fields: title, excerpt, content
        const translatedData = await translateContentFields(
          { title, excerpt, content },
          ['title', 'excerpt', 'content'],
          'EN',
          'FR'
        );
        
        // Add translated fields to resource data
        if (translatedData.title_en) resourceData.title_en = translatedData.title_en;
        if (translatedData.excerpt_en) resourceData.excerpt_en = translatedData.excerpt_en;
        if (translatedData.content_en) resourceData.content_en = translatedData.content_en;
      } catch (translationError) {
        console.error("Translation error:", translationError);
        // Continue with submission even if translation fails
        toast({
          title: "Attention",
          description: "La traduction a échoué, mais la ressource sera enregistrée en français.",
          variant: "destructive",
        });
      } finally {
        setIsTranslating(false);
      }
      
      // Insert resource
      const { data: resource, error: resourceError } = await supabase
        .from('resources')
        .insert(resourceData as Database['public']['Tables']['resources']['Insert'])
        .select()
        .single();
      
      if (resourceError) throw resourceError;
      
      await processTags(tags, resource?.id);
      
      toast({
        title: "Ressource enregistrée",
        description: "La ressource a été enregistrée avec succès et traduite en anglais.",
        variant: "default",
      });
      
      // Reset form
      resetForm();
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
  
  const resetForm = () => {
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategoryId("");
    setTags("");
  };
  
  const processTags = async (tagString: string, resourceId: string | undefined) => {
    if (!tagString.trim() || !resourceId) return;
    
    const tagList = tagString.split(',').map(tag => tag.trim());
    
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
          resource_id: resourceId,
          tag_id: tagId
        } as Database['public']['Tables']['resource_tags']['Insert']);
      
      if (relationError) throw relationError;
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
          <CategorySelect 
            value={categoryId}
            onChange={setCategoryId}
          />
          
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
            {isSubmitting 
              ? isTranslating 
                ? "Traduction et enregistrement..." 
                : "Enregistrement..." 
              : "Publier la ressource"}
          </Button>
        </div>
      </form>
    </div>
  );
}
