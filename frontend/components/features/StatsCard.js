import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendValue, 
  color = 'primary',
  animate = true 
}) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    secondary: 'bg-secondary-100 text-secondary-600',
    success: 'bg-success-100 text-success-600',
    warning: 'bg-warning-100 text-warning-600',
    error: 'bg-error-100 text-error-600',
    info: 'bg-blue-100 text-blue-600'
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-success-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-error-600" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-success-600';
      case 'down': return 'text-error-600';
      default: return 'text-gray-500';
    }
  };

  const cardContent = (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trendValue && (
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-medium">{trendValue}</span>
              </div>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </Card>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {cardContent}
      </motion.div>
    );
  }

  return cardContent;
}