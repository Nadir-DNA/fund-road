
import { useState } from 'react';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !validateEmail(email)) {
      toast({
        variant: "destructive",
        title: "Email invalide",
        description: "Veuillez entrer une adresse email valide."
      });
      return;
    }

    setIsLoading(true);
    
    // Simulation d'une inscription (à remplacer par une vraie API)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubscribed(true);
      setEmail('');
      toast({
        title: "Inscription réussie !",
        description: "Vous recevrez bientôt nos dernières actualités."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="py-24 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/2 right-1/3 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Merci pour votre inscription !
            </h2>
            <p className="text-white/70 text-lg">
              Vous recevrez bientôt nos conseils exclusifs et les dernières actualités entrepreneuriales.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-gradient-to-b from-slate-900 to-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/2 right-1/3 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Newsletter exclusive</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Restez informé de nos dernières <span className="text-gradient">actualités</span>
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Recevez chaque semaine nos conseils d'experts, les nouvelles fonctionnalités 
              et les success stories de notre communauté d'entrepreneurs.
            </p>
          </div>
          
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSubmit} className="glass-card p-8">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder="Votre adresse email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-primary/50 focus:ring-primary/25"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading || !email}
                  className="button-gradient text-white px-8 h-12 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 group"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                      Inscription...
                    </>
                  ) : (
                    <>
                      S'inscrire
                      <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-white/50 mt-4 text-center">
                En vous inscrivant, vous acceptez de recevoir nos emails. 
                Vous pouvez vous désabonner à tout moment.
              </p>
            </form>
          </div>
          
          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-white mb-2">Conseils exclusifs</h3>
              <p className="text-sm text-white/60">Tips et stratégies d'experts en entrepreneuriat</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-white mb-2">Nouveautés en avant-première</h3>
              <p className="text-sm text-white/60">Accès prioritaire aux nouvelles fonctionnalités</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Send className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-white mb-2">Success stories</h3>
              <p className="text-sm text-white/60">Inspirez-vous des réussites de notre communauté</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
