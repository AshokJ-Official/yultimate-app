import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function PageHeader({ 
  title, 
  description, 
  actions = [], 
  breadcrumb,
  className = '' 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-8 ${className}`}
    >
      {breadcrumb}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {description && (
            <p className="text-gray-600 mt-2">{description}</p>
          )}
        </div>
        
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'default'}
                size={action.size || 'default'}
                onClick={action.onClick}
                className={`flex items-center gap-2 ${action.className || ''}`}
                disabled={action.disabled}
              >
                {action.icon && <action.icon className="w-4 h-4" />}
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}