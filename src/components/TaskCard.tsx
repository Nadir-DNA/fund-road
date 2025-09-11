
import { cn } from "@/lib/utils";

interface TaskCardProps {
  title: string;
  subtitle?: string;
  stats?: {
    value: string;
    label: string;
  };
  tasks?: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  chartData?: {
    percentage: number;
    label: string;
    secondaryStats?: {
      label: string;
      value: string;
    }[];
  };
  className?: string;
}

export default function TaskCard({
  title,
  subtitle,
  stats,
  tasks,
  chartData,
  className
}: TaskCardProps) {
  return (
    <div className={cn(
      "bg-black/60 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-lg",
      className
    )}>
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-white/80">{title}</h3>
          {subtitle && (
            <span className="text-xs text-white/50">{subtitle}</span>
          )}
        </div>
        
        {stats && (
          <div className="text-center py-2">
            <div className="text-3xl font-bold">{stats.value}</div>
            <div className="text-xs text-white/60">{stats.label}</div>
          </div>
        )}
        
        {tasks && (
          <div className="space-y-2 mt-2">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-white/5">
                <input 
                  type="checkbox" 
                  checked={task.completed} 
                  className="form-checkbox h-4 w-4 text-primary rounded border-white/30"
                  readOnly
                />
                <span className={cn(
                  "text-sm", 
                  task.completed ? "text-white/40 line-through" : "text-white"
                )}>
                  {task.text}
                </span>
              </div>
            ))}
          </div>
        )}
        
        {chartData && (
          <div className="text-center py-4">
            <div className="relative mx-auto w-32 h-16 mb-2">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-bold">{chartData.percentage}%</div>
              </div>
              <div 
                className="absolute bottom-0 h-4 w-full bg-white/10 rounded-full overflow-hidden"
                style={{
                  background: `linear-gradient(90deg, #10B981 0%, #6EE7B7 ${chartData.percentage}%, rgba(255, 255, 255, 0.1) ${chartData.percentage}%)`
                }}
              ></div>
            </div>
            <div className="text-xs text-white/60 mb-4">{chartData.label}</div>
            
            {chartData.secondaryStats && (
              <div className="grid grid-cols-2 gap-2 text-center">
                {chartData.secondaryStats.map((stat, index) => (
                  <div key={index} className="bg-white/5 rounded-lg p-2">
                    <div className="text-lg font-semibold">{stat.value}</div>
                    <div className="text-xs text-white/60">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
