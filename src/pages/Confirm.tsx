
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, XCircle } from "lucide-react";

export default function Confirm() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token_hash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const next = searchParams.get('next') || '/roadmap';

      if (!token_hash || !type) {
        setStatus('error');
        setMessage('Lien de confirmation invalide ou expiré.');
        return;
      }

      try {
        console.log('Tentative de vérification du token:', { token_hash, type });
        
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as any
        });

        if (error) {
          console.error('Erreur de vérification:', error);
          setStatus('error');
          setMessage(error.message || 'Erreur lors de la confirmation de votre email.');
          return;
        }

        if (data.user) {
          console.log('Email confirmé avec succès pour:', data.user.email);
          setStatus('success');
          setMessage('Votre email a été confirmé avec succès !');
          
          toast({
            title: "Email confirmé",
            description: "Votre compte a été activé avec succès",
          });

          // Redirection après 2 secondes
          setTimeout(() => {
            navigate(next, { replace: true });
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Impossible de confirmer votre email. Veuillez réessayer.');
        }
      } catch (error: any) {
        console.error('Erreur lors de la confirmation:', error);
        setStatus('error');
        setMessage('Une erreur est survenue lors de la confirmation.');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/60 backdrop-blur-md border border-white/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'loading' && <LoadingIndicator size="lg" />}
            {status === 'success' && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === 'error' && <XCircle className="h-16 w-16 text-red-500" />}
          </div>
          <CardTitle className="text-white">
            {status === 'loading' && 'Confirmation en cours...'}
            {status === 'success' && 'Email confirmé !'}
            {status === 'error' && 'Erreur de confirmation'}
          </CardTitle>
          <CardDescription className="text-white/70">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'success' && (
            <p className="text-sm text-white/60">
              Redirection automatique vers votre tableau de bord...
            </p>
          )}
          {status === 'error' && (
            <div className="space-y-2">
              <p className="text-sm text-white/60">
                Vous pouvez essayer de vous connecter ou demander un nouvel email de confirmation.
              </p>
              <button
                onClick={() => navigate('/auth')}
                className="text-primary hover:underline text-sm"
              >
                Retour à la connexion
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
