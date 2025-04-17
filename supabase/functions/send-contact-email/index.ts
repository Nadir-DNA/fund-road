
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialiser Resend avec la clé API
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Headers CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Interface pour la requête
interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  projectType: string;
  projectStage?: string;
  message: string;
  recipientEmail: string;
  subject: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Gérer les requêtes OPTIONS pour CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer les données du formulaire
    const formData: ContactFormData = await req.json();
    const { name, email, phone, projectType, projectStage, message, recipientEmail, subject } = formData;

    // Créer le contenu HTML de l'email
    const htmlContent = `
      <h2>Nouvelle demande de devis</h2>
      <p><strong>Nom:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Téléphone:</strong> ${phone || "Non spécifié"}</p>
      <p><strong>Type de projet:</strong> ${projectType}</p>
      <p><strong>Stade du projet:</strong> ${projectStage || "Non spécifié"}</p>
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `;

    // Envoyer l'email
    const emailResponse = await resend.emails.send({
      from: "Fund Road <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: subject,
      html: htmlContent,
      reply_to: email,
    });

    // Envoyer également une confirmation à l'utilisateur
    await resend.emails.send({
      from: "Fund Road <onboarding@resend.dev>",
      to: [email],
      subject: "Nous avons bien reçu votre demande",
      html: `
        <h2>Merci pour votre demande, ${name}!</h2>
        <p>Nous avons bien reçu votre message concernant votre projet "${projectType}".</p>
        <p>Notre équipe va étudier votre demande et reviendra vers vous dans les meilleurs délais.</p>
        <p>À bientôt,<br>L'équipe Fund Road</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
