
import TaskCard from '@/components/TaskCard';
import { useLanguage } from '@/context/LanguageContext';

export default function DashboardSection() {
  const { t } = useLanguage();
  
  // Définition des tâches avec des textes statiques
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
  
  return (
    <section className="py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Tableau de bord personnalisé</h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Suivez votre progression et accédez à tous vos projets en un coup d'œil
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TaskCard
            title="Tâches à compléter"
            subtitle="Avancement du projet"
            tasks={tasks}
          />
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
    </section>
  );
}
