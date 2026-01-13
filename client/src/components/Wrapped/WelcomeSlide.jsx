import { motion } from 'framer-motion'

export default function WelcomeSlide({ stats }) {
  const firstName = stats?.author?.name?.split(' ')[0] || 'Developer'
  const year = stats?.dateRange?.start?.split('-')[0] || new Date().getFullYear()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Animated background circles */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-400 text-xl mb-4"
        >
          Welcome back,
        </motion.div>

        <motion.h1
          className="text-6xl md:text-8xl font-display font-bold mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <span className="gradient-text">{firstName}</span>
        </motion.h1>

        <motion.p
          className="text-2xl md:text-3xl text-gray-300 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          Let's see what you accomplished in{' '}
          <span className="text-purple-400 font-semibold">{year}</span>
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-2 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span>Tap or press</span>
          <kbd className="px-3 py-1 bg-white/10 rounded-lg text-sm">→</kbd>
          <span>to continue</span>
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-purple-500/40"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  )
}
