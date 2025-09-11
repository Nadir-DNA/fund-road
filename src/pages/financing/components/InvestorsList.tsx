
import { Button } from "@/components/ui/button";
import { LoadingIndicator } from "@/components/ui/LoadingIndicator";
import LazyLoad from "@/components/LazyLoad";
import { type Investor } from "../FinancingPage";

interface InvestorsListProps {
  investors: Investor[];
  isLoading: boolean;
  loadingError: string | null;
  t: (key: string) => string;
}

export default function InvestorsList({ 
  investors, 
  isLoading, 
  loadingError,
  t
}: InvestorsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-20">
        <LoadingIndicator size="lg" className="mb-4" />
        <p className="text-white/70">Chargement des investisseurs...</p>
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-white/70">Une erreur est survenue lors du chargement des données.</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  if (investors.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-white/70">{t("financing.noResults") || "Aucun résultat ne correspond à votre recherche."}</p>
        <p className="text-white/50 mt-2">{t("financing.adjustSearch") || "Essayez d'ajuster vos critères de recherche."}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {investors.map((investor, index) => (
        <LazyLoad key={investor.id} height={300} delay={(index % 6) * 100} showLoader={true}>
          <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-primary/50 transition-all duration-300 hover:translate-y-[-5px]">
            <h3 className="text-xl font-semibold mb-2">{investor.name}</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {investor.type && investor.type.length > 0 && (
                <span className="text-xs px-3 py-1 bg-primary/20 text-primary rounded-full">
                  {investor.type[0]}
                </span>
              )}
              {investor.sectors && investor.sectors.slice(0, 2).map((sector, index) => (
                <span key={index} className="text-xs px-3 py-1 bg-white/10 text-white/80 rounded-full">
                  {sector}
                </span>
              ))}
              {investor.sectors && investor.sectors.length > 2 && (
                <span className="text-xs px-3 py-1 bg-white/10 text-white/80 rounded-full">
                  +{investor.sectors.length - 2}
                </span>
              )}
            </div>
            
            <p className="text-white/70 text-sm mb-4">
              {investor.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Stade:</span>
                <span className="text-sm">{investor.stage ? investor.stage.join(", ") : 'Non spécifié'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Ticket moyen:</span>
                <span className="text-sm">{investor.ticket ? investor.ticket.join(" - ") : 'Variable'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Localisation:</span>
                <span className="text-sm">{investor.location ? investor.location.join(", ") : 'International'}</span>
              </div>
            </div>
          </div>
        </LazyLoad>
      ))}
    </div>
  );
}
