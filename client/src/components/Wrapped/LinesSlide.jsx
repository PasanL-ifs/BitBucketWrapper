import { motion } from 'framer-motion'
import AnimatedNumber from '../UI/AnimatedNumber'

export default function LinesSlide({ stats }) {
  const insertions = stats?.summary?.totalInsertions || 0
  const deletions = stats?.summary?.totalDeletions || 0
  const netLines = insertions - deletions

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradients */}
      <motion.div
        className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-green-500/10 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-red-500/10 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <div className="relative z-10 text-center max-w-3xl">
        <motion.p
          className="text-gray-400 text-xl mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Your code impact
        </motion.p>

        <div className="grid grid-cols-2 gap-8 md:gap-16 mb-12">
          {/* Additions */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, type: "spring" }}
          >
            <div className="text-5xl md:text-7xl font-display font-bold text-green-400 mb-2">
              +<AnimatedNumber value={insertions} format={formatNumber} />
            </div>
            <p className="text-gray-400 text-lg">lines added</p>
          </motion.div>

          {/* Deletions */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, type: "spring" }}
          >
            <div className="text-5xl md:text-7xl font-display font-bold text-red-400 mb-2">
              -<AnimatedNumber value={deletions} format={formatNumber} />
            </div>
            <p className="text-gray-400 text-lg">lines removed</p>
          </motion.div>
        </div>

        {/* Net result */}
        <motion.div
          className="glass-card p-6 inline-block"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-400 mb-2">Net contribution</p>
          <p className={`text-4xl font-display font-bold ${netLines >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {netLines >= 0 ? '+' : ''}{formatNumber(netLines)} lines
          </p>
        </motion.div>

        <motion.p
          className="text-gray-500 mt-8 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          {deletions > insertions * 0.3 
            ? "Great job cleaning up code! 🧹" 
            : "Building something amazing! 🏗️"}
        </motion.p>
      </div>
    </div>
  )
}
