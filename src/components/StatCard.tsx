interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: string;
    gradient: string;
    delay?: number;
    loading?: boolean;
    trend?: {
      value: number;
      isPositive: boolean;
    };
  }
  
  export default function StatCard({ 
    title, 
    value, 
    subtitle, 
    icon, 
    gradient, 
    delay = 0, 
    loading = false,
    trend 
  }: StatCardProps) {
    return (
      <div 
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 animate-fade-in`}
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white opacity-5 rounded-full translate-y-8 -translate-x-8"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div className="text-3xl">{icon}</div>
            {loading ? (
              <div className="animate-pulse bg-white bg-opacity-30 h-8 w-16 rounded"></div>
            ) : (
              <div className="text-right">
                <div className="text-2xl font-bold">{value}</div>
                {trend && (
                  <div className={`text-sm flex items-center justify-end ${
                    trend.isPositive ? 'text-green-200' : 'text-red-200'
                  }`}>
                    <span className="mr-1">
                      {trend.isPositive ? '↗' : '↘'}
                    </span>
                    {Math.abs(trend.value)}%
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-white text-opacity-90 font-medium">{title}</div>
          {subtitle && <div className="text-white text-opacity-70 text-sm mt-1">{subtitle}</div>}
        </div>
      </div>
    );
  }