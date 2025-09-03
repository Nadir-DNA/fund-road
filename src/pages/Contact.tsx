
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Send, CheckCircle } from "lucide-react";
import { Helmet } from 'react-helmet-async';
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { InternalLinks } from '@/components/seo/InternalLinks';

const formSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit avoir au moins 2 caractères" }),
  email: z.string().email({ message: "Adresse email invalide" }),
  phone: z.string().optional(),
  projectType: z.string({
    required_error: "Veuillez sélectionner un type de projet",
  }),
  projectStage: z.string().optional(),
  message: z.string().min(10, { message: "Le message doit avoir au moins 10 caractères" }),
});

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      projectType: "",
      projectStage: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Envoyer l'email via la fonction Supabase
      const { error } = await supabase.functions.invoke('send-contact-email', {
        body: { 
          ...values,
          recipientEmail: 'hello@fund-road.com',
          subject: `Demande de devis - ${values.projectType}`
        }
      });
      
      if (error) throw error;
      
      setIsSubmitted(true);
      toast({
        title: "Demande envoyée",
        description: "Nous vous contacterons prochainement pour discuter de votre projet.",
      });
    } catch (error: any) {
      console.error("Erreur lors de l'envoi du formulaire:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre demande. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Helmet>
        <title>Contact Fund Road - Demande de devis personnalisé | Accompagnement startup</title>
        <meta name="description" content="Contactez Fund Road pour un accompagnement personnalisé de votre projet entrepreneurial. Devis gratuit pour levée de fonds, business plan et stratégie IP." />
        <meta name="keywords" content="contact Fund Road, devis accompagnement startup, conseil entrepreneurial, coaching levée de fonds, stratégie IP" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Contact Fund Road - Accompagnement personnalisé" />
        <meta property="og:description" content="Obtenez un devis personnalisé pour votre projet entrepreneurial" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://fundroad.com/contact" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://fundroad.com/contact" />
      </Helmet>
      
      <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="pt-24 pb-16 container mx-auto px-4">
        <header className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Demande de devis personnalisé</h1>
          <p className="text-white/70 text-center mb-12">
            Complétez le formulaire ci-dessous pour obtenir un accompagnement stratégique adapté à votre projet
          </p>

          {isSubmitted ? (
            <div className="glass-card p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mb-6">
                <CheckCircle className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Demande envoyée avec succès!</h2>
              <p className="text-white/70 mb-8">
                Merci pour votre intérêt. Notre équipe analysera votre demande et vous contactera sous 48h pour échanger sur votre projet.
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline" className="mr-4">
                Nouvelle demande
              </Button>
              <Button asChild className="bg-gradient-to-r from-primary to-accent text-white">
                <a href="/">
                  Retour à l'accueil
                </a>
              </Button>
            </div>
          ) : (
            <div className="glass-card p-8 rounded-lg">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom complet</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="votre@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Téléphone (optionnel)</FormLabel>
                          <FormControl>
                            <Input placeholder="Votre numéro de téléphone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="projectType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type de projet</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner le type de projet" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="startup">Startup</SelectItem>
                              <SelectItem value="innovation">Innovation technologique</SelectItem>
                              <SelectItem value="service">Service</SelectItem>
                              <SelectItem value="commerce">Commerce</SelectItem>
                              <SelectItem value="ip-strategy">Stratégie de propriété intellectuelle</SelectItem>
                              <SelectItem value="mvp-website">Création de MVP/Site web</SelectItem>
                              <SelectItem value="other">Autre</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="projectStage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stade du projet (optionnel)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="À quel stade est votre projet?" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="idea">Idée</SelectItem>
                            <SelectItem value="concept">Concept validé</SelectItem>
                            <SelectItem value="mvp">MVP / Prototype</SelectItem>
                            <SelectItem value="market">Déjà sur le marché</SelectItem>
                            <SelectItem value="growing">En croissance</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Cette information nous aide à adapter notre accompagnement
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Votre besoin</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Décrivez brièvement votre projet et vos besoins d'accompagnement"
                            className="min-h-[120px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          Parlez-nous de votre projet, de vos objectifs et de vos défis actuels
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      className="bg-gradient-to-r from-primary to-accent text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}
        </header>
        
        <InternalLinks currentPage="/contact" />
      </main>
      
      <Footer />
    </div>
    </>
  );
}
