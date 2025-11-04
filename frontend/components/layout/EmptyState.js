import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          {Icon && (
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon className="w-8 h-8 text-gray-400" />
            </div>
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          
          {description && (
            <p className="text-gray-600 mb-6">
              {description}
            </p>
          )}
          
          {action && (
            <Button
              onClick={action.onClick}
              className="flex items-center gap-2 mx-auto"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}