import TaskCard from '@/components/TaskCard';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart3, Users, Target, TrendingUp } from 'lucide-react';
export default function DashboardSection() {
  const {
    t
  } = useLanguage();
  const tasks = [{
    id: "1",
    text: "Valider mon idée de business",
    completed: true
  }, {
    id: "2",
    text: "Créer mon Business Model Canvas",
    completed: false
  }, {
    id: "3",
    text: "Réaliser mon Business Plan",
    completed: false
  }];
  const stats = [{
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    value: "150+",
    label: "Templates disponibles",
    description: "Outils prêts à utiliser"
  }, {
    icon: <Users className="h-8 w-8 text-accent" />,
    value: "500+",
    label: "Entrepreneurs actifs",
    description: "Communauté grandissante"
  }, {
    icon: <Target className="h-8 w-8 text-primary" />,
    value: "95%",
    label: "Taux de réussite",
    description: "Projets aboutis"
  }, {
    icon: <TrendingUp className="h-8 w-8 text-accent" />,
    value: "€2M+",
    label: "Fonds levés",
    description: "Capital mobilisé"
  }];
  return <section className="py-24 bg-gradient-to-b from-black to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      
      
      
    </section>;
}