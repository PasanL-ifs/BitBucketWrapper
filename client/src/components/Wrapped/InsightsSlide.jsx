import { motion } from 'framer-motion'

export default function InsightsSlide({ stats }) {
  const insights = stats?.insights || []
  const streakStats = stats?.streakStats || {}
  const biggestCommit = stats?.biggestCommit

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-pink-500/5 to-purple-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <div className="relative z-10 w-full max-w-3xl">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-2">
            ✨ <span className="gradient-text">Fun Facts</span>
          </h2>
          <p className="text-gray-400">Some highlights from your year</p>
        </motion.div>

        {/* Insights */}
        <div className="space-y-4 mb-10">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              className="glass-card p-5"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.15 }}
            >
              <p className="text-lg text-gray-200">{insight}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Longest streak */}
          {streakStats.longestStreak > 0 && (
            <motion.div
              className="glass-card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <div className="text-4xl mb-2">🔥</div>
              <div className="text-3xl font-display font-bold text-orange-400 mb-1">
                {streakStats.longestStreak} days
              </div>
              <p className="text-gray-500">Longest streak</p>
            </motion.div>
          )}

          {/* Biggest commit */}
          {biggestCommit && (
            <motion.div
              className="glass-card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <div className="text-4xl mb-2">💪</div>
              <div className="text-3xl font-display font-bold text-pink-400 mb-1">
                {biggestCommit.totalChanges.toLocaleString()} lines
              </div>
              <p className="text-gray-500">Biggest commit</p>
              <p className="text-xs text-gray-600 mt-1 truncate" title={biggestCommit.message}>
                "{biggestCommit.message}"
              </p>
            </motion.div>
          )}

          {/* Active days */}
          {streakStats.totalActiveDays > 0 && (
            <motion.div
              className="glass-card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <div className="text-4xl mb-2">📅</div>
              <div className="text-3xl font-display font-bold text-blue-400 mb-1">
                {streakStats.totalActiveDays} days
              </div>
              <p className="text-gray-500">Active coding days</p>
            </motion.div>
          )}

          {/* Repositories */}
          {stats?.repositories?.length > 0 && (
            <motion.div
              className="glass-card p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <div className="text-4xl mb-2">📚</div>
              <div className="text-3xl font-display font-bold text-green-400 mb-1">
                {stats.repositories.length}
              </div>
              <p className="text-gray-500">Repositories touched</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
