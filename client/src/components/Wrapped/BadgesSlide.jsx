import { motion } from 'framer-motion'

export default function BadgesSlide({ stats }) {
  const badges = stats?.badges || []

  if (badges.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-8xl mb-6">🎯</div>
          <h2 className="text-4xl font-display font-bold mb-4">Keep Going!</h2>
          <p className="text-gray-400 text-xl">
            You're on your way to earning badges next year!
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background sparkles */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          >
            ✨
          </motion.div>
        ))}
      </motion.div>

      <div className="relative z-10 w-full max-w-3xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-400 text-xl mb-4">You earned</p>
          <h2 className="text-5xl md:text-6xl font-display font-bold gradient-text mb-2">
            {badges.length} {badges.length === 1 ? 'Badge' : 'Badges'}
          </h2>
          <p className="text-gray-500">Achievements unlocked!</p>
        </motion.div>

        {/* Badges grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {badges.map((badge, idx) => (
            <motion.div
              key={badge.id}
              className="glass-card p-6 text-center badge-shine"
              initial={{ opacity: 0, scale: 0.5, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                delay: 0.3 + idx * 0.15,
                type: "spring",
                stiffness: 200
              }}
              whileHover={{ scale: 1.05, rotateY: 5 }}
            >
              <motion.div
                className="text-5xl mb-3"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: idx * 0.2,
                }}
              >
                {badge.icon}
              </motion.div>
              <h3 className="font-display font-bold text-lg mb-1">{badge.name}</h3>
              <p className="text-gray-500 text-sm">{badge.description}</p>
            </motion.div>
          ))}
        </div>

        {badges.length >= 5 && (
          <motion.p
            className="text-center text-purple-400 mt-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            🏆 Achievement Hunter! You collected {badges.length} badges!
          </motion.p>
        )}
      </div>
    </div>
  )
}
