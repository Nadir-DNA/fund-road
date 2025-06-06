
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.11';
import { VerificationEmail } from './_templates/verification-email.tsx';
import React from 'npm:react@18.3.1';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailVerificationRequest {
  email: string;
  token_hash: string;
  token: string;
  redirect_to?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, token_hash, token, redirect_to }: EmailVerificationRequest = await req.json();

    // Construire l'URL de confirmation Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const confirmationUrl = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=signup&redirect_to=${encodeURIComponent(redirect_to || 'https://fund-road.com/confirm')}`;

    // Render the React email template
    const html = await renderAsync(
      React.createElement(VerificationEmail, {
        confirmationUrl: confirmationUrl,
        userEmail: email,
        token: token
      })
    );

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Fund Road <onboarding@resend.dev>",
      to: [email],
      subject: "Vérifiez votre adresse email pour Fund Road",
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in email verification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
