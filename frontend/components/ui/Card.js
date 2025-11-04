import { motion } from 'framer-motion'
import { clsx } from 'clsx'

const Card = ({ 
  children, 
  className = '', 
  hover = false, 
  gradient = false,
  padding = 'p-6',
  ...props 
}) => {
  const baseClasses = 'bg-white rounded-2xl shadow-sm border border-gray-100'
  const hoverClasses = hover ? 'card-hover cursor-pointer' : ''
  const gradientClasses = gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''
  
  const classes = clsx(
    baseClasses,
    hoverClasses,
    gradientClasses,
    padding,
    className
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={classes}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const CardHeader = ({ children, className = '' }) => (
  <div className={clsx('mb-6', className)}>
    {children}
  </div>
)

const CardTitle = ({ children, className = '' }) => (
  <h3 className={clsx('text-xl font-bold text-gray-900', className)}>
    {children}
  </h3>
)

const CardDescription = ({ children, className = '' }) => (
  <p className={clsx('text-gray-600 mt-2', className)}>
    {children}
  </p>
)

const CardContent = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
)

const CardFooter = ({ children, className = '' }) => (
  <div className={clsx('mt-6 pt-6 border-t border-gray-100', className)}>
    {children}
  </div>
)

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card