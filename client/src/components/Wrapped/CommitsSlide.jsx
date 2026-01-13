import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import AnimatedNumber from '../UI/AnimatedNumber'

export default function CommitsSlide({ stats }) {
  const totalCommits = stats?.summary?.totalCommits || 0
  const [showStat, setShowStat] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowStat(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const getCommitMessage = (count) => {
    if (count >= 1000) return "Absolutely legendary! 🏆"
    if (count >= 500) return "Unstoppable force! 🚀"
    if (count >= 200) return "Crushing it! 💪"
    if (count >= 100) return "Solid contributor! ⭐"
    if (count >= 50) return "Great work! 👏"
    return "Every commit counts! ✨"
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      />

      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.p
          className="text-gray-400 text-xl mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          You made
        </motion.p>

        <motion.div
          className="mb-6"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        >
          {showStat && (
            <div className="text-8xl md:text-[10rem] font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              <AnimatedNumber value={totalCommits} />
            </div>
          )}
        </motion.div>

        <motion.p
          className="text-3xl md:text-4xl text-white font-semibold mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          commits this year
        </motion.p>

        <motion.p
          className="text-xl text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          {getCommitMessage(totalCommits)}
        </motion.p>
      </motion.div>

      {/* Floating commit icons */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl opacity-20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -40, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  )
}
