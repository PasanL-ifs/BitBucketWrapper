import { motion } from 'framer-motion'

export default function ErrorMessage({ 
  title = 'Oops!', 
  message = 'Something went wrong', 
  action,
  actionLabel = 'Try Again'
}) {
  return (
    <motion.div
      className="text-center glass-card p-8 max-w-md mx-auto"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className="text-6xl mb-4"
        animate={{ rotate: [0, -10, 10, -10, 0] }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        😕
      </motion.div>
      
      <h2 className="text-2xl font-display font-bold mb-2">{title}</h2>
      <p className="text-gray-400 mb-6">{message}</p>
      
      {action && (
        <motion.button
          className="btn-primary"
          onClick={action}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}
