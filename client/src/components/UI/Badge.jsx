import { motion } from 'framer-motion'

export default function Badge({ icon, name, description, size = 'md', animated = true }) {
  const sizes = {
    sm: 'p-3 text-3xl',
    md: 'p-5 text-5xl',
    lg: 'p-6 text-6xl'
  }

  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  }

  return (
    <motion.div
      className="glass-card text-center badge-shine overflow-hidden"
      initial={animated ? { opacity: 0, scale: 0.5, rotateY: 90 } : {}}
      animate={animated ? { opacity: 1, scale: 1, rotateY: 0 } : {}}
      whileHover={{ scale: 1.05, rotateY: 5 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      <div className={sizes[size]}>
        <motion.div
          className="mb-2"
          animate={animated ? { y: [0, -5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {icon}
        </motion.div>
        <h3 className={`font-display font-bold ${textSizes[size]} mb-1`}>{name}</h3>
        {description && (
          <p className="text-gray-500 text-sm">{description}</p>
        )}
      </div>
    </motion.div>
  )
}
