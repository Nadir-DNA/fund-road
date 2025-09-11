import TaskCard from '@/components/TaskCard';
import { useLanguage } from '@/context/LanguageContext';
import { BarChart3, Users, Target, TrendingUp } from 'lucide-react';
import GlobalReportGenerator from '@/components/journey/GlobalReportGenerator';
import { useOverallProgress } from '@/hooks/useOverallProgress';
export default function DashboardSection() {
  const { t } = useLanguage();
  const { overallProgress } = useOverallProgress();
  const tasks = [{
    id: "1",
    text: t("dashboard.task1"),
    completed: true
  }, {
    id: "2",
    text: t("dashboard.task2"),
    completed: false
  }, {
    id: "3", 
    text: t("dashboard.task3"),
    completed: false
  }];
  const stats = [{
    icon: <BarChart3 className="h-8 w-8 text-primary" />,
    value: "150+",
    label: t("dashboard.stats.templates"),
    description: t("dashboard.stats.templatesDesc")
  }, {
    icon: <Users className="h-8 w-8 text-accent" />,
    value: "500+",
    label: t("dashboard.stats.entrepreneurs"),
    description: t("dashboard.stats.entrepreneursDesc")
  }, {
    icon: <Target className="h-8 w-8 text-primary" />,
    value: "95%",
    label: t("dashboard.stats.successRate"),
    description: t("dashboard.stats.successRateDesc")
  }, {
    icon: <TrendingUp className="h-8 w-8 text-accent" />,
    value: "€2M+",
    label: t("dashboard.stats.funding"),
    description: t("dashboard.stats.fundingDesc")
  }];
  return (
    <section className="py-24 bg-gradient-to-b from-black to-slate-900 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("dashboard.title")}
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            {t("dashboard.subtitle")}
          </p>
        </div>

        {/* Progress & Report Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-white">{t("dashboard.tasks")}</h3>
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                title={task.text}
                tasks={[task]} 
              />
            ))}
          </div>
          
          <div>
            <h3 className="text-2xl font-semibold text-white mb-6">{t("dashboard.progressReport")}</h3>
            <GlobalReportGenerator />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-slate-800/50 rounded-xl border border-slate-700">
              <div className="flex justify-center mb-4">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-gray-300 mb-1">{stat.label}</div>
              <div className="text-sm text-gray-400">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}