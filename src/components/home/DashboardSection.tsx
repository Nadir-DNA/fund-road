
import TaskCard from '@/components/TaskCard';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart3, Users, Target, TrendingUp } from 'lucide-react';

export default function DashboardSection() {
  const { t } = useLanguage();
  
  const tasks = [
    {
      id: "1",
      text: "Valider mon idée de business",
      completed: true,
    },
    {
      id: "2",
      text: "Créer mon Business Model Canvas",
      completed: false,
    },
    {
      id: "3",
      text: "Réaliser mon Business Plan",
      completed: false,
    },
  ];

  const stats = [
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      value: "150+",
      label: "Templates disponibles",
      description: "Outils prêts à utiliser"
    },
    {
      icon: <Users className="h-8 w-8 text-accent" />,
      value: "500+",
      label: "Entrepreneurs actifs",
      description: "Communauté grandissante"
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      value: "95%",
      label: "Taux de réussite",
      description: "Projets aboutis"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-accent" />,
      value: "€2M+",
      label: "Fonds levés",
      description: "Capital mobilisé"
    }
  ];
  
  return (
    <section className="py-24 bg-gradient-to-b from-black to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Tableau de bord <span className="text-gradient">personnalisé</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
            Suivez votre progression en temps réel et accédez à tous vos projets 
            depuis un dashboard centralisé et intuitif.
          </p>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="glass-card p-6 text-center group hover:border-primary/30 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="flex justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.icon}
              </div>
              <div className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                {stat.value}
              </div>
              <div className="font-medium text-white/90 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-white/60">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
        
        {/* Dashboard Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TaskCard
              title="Aperçu de vos tâches"
              subtitle="Progression du projet en cours"
              tasks={tasks}
            />
          </div>
          
          <div className="space-y-8">
            <TaskCard
              title="Progression globale"
              chartData={{
                percentage: 75,
                label: "Parcours entrepreneurial",
                secondaryStats: [
                  {
                    label: "Étapes complétées",
                    value: "12",
                  },
                  {
                    label: "Étapes restantes",
                    value: "4",
                  },
                ],
              }}
            />
            
            <TaskCard
              title="Vos projets"
              stats={{
                value: "3",
                label: "Projets actifs",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
