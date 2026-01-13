import { motion } from 'framer-motion'

export default function TimeSlide({ stats }) {
  const hourlyStats = stats?.hourlyStats?.byHour || []
  const dailyStats = stats?.dailyStats?.byDay || []
  const timePatterns = stats?.timePatterns || {}
  
  const peakHour = stats?.hourlyStats?.peakHour
  const mostActiveDay = stats?.dailyStats?.mostActiveDay

  const formatHour = (hour) => {
    if (hour === 0) return '12 AM'
    if (hour === 12) return '12 PM'
    return hour < 12 ? `${hour} AM` : `${hour - 12} PM`
  }

  const maxHourCommits = Math.max(...hourlyStats.map(h => h.commits), 1)
  const maxDayCommits = Math.max(...dailyStats.map(d => d.commits), 1)

  const getCoderTypeEmoji = () => {
    if (timePatterns.isNightOwl) return '🌙'
    if (timePatterns.isEarlyBird) return '🌅'
    return '☀️'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: timePatterns.isNightOwl 
            ? 'linear-gradient(to bottom, rgba(30, 27, 75, 0.3), rgba(0,0,0,0))'
            : 'linear-gradient(to bottom, rgba(251, 191, 36, 0.1), rgba(0,0,0,0))'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-400 text-xl mb-4">You're a</p>
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-4">
            {getCoderTypeEmoji()} {timePatterns.coderType || 'Coder'}
          </h2>
          <p className="text-gray-400">
            Peak coding at <span className="text-purple-400 font-semibold">{formatHour(peakHour)}</span>
          </p>
        </motion.div>

        {/* Hourly heatmap */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-gray-500 text-sm mb-3 text-center">Commits by hour</p>
          <div className="flex justify-center gap-1 flex-wrap">
            {hourlyStats.map((hour, idx) => (
              <motion.div
                key={idx}
                className="w-6 h-8 rounded flex flex-col items-center justify-end"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.5 + idx * 0.02 }}
                style={{ transformOrigin: 'bottom' }}
              >
                <div
                  className="w-full rounded-t"
                  style={{
                    height: `${Math.max((hour.commits / maxHourCommits) * 100, 5)}%`,
                    backgroundColor: hour.hour === peakHour 
                      ? '#a855f7' 
                      : `rgba(168, 85, 247, ${0.2 + (hour.commits / maxHourCommits) * 0.6})`
                  }}
                />
                {idx % 4 === 0 && (
                  <span className="text-[10px] text-gray-500 mt-1">{idx}</span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Day of week */}
        <motion.div
          className="glass-card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-gray-500 text-sm mb-4 text-center">Most active on</p>
          <div className="flex justify-center gap-3">
            {dailyStats.map((day, idx) => (
              <motion.div
                key={idx}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + idx * 0.05 }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center font-semibold mb-1"
                  style={{
                    backgroundColor: day.name === mostActiveDay 
                      ? '#a855f7' 
                      : `rgba(168, 85, 247, ${0.1 + (day.commits / maxDayCommits) * 0.3})`,
                    color: day.name === mostActiveDay ? 'white' : '#9ca3af'
                  }}
                >
                  {day.commits}
                </div>
                <span className="text-xs text-gray-500">{day.short}</span>
              </motion.div>
            ))}
          </div>
          
          {timePatterns.isWeekendWarrior && (
            <p className="text-center text-sm text-purple-400 mt-4">
              ⚔️ Weekend Warrior - {stats?.dailyStats?.weekendPercentage}% on weekends!
            </p>
          )}
        </motion.div>
      </div>
    </div>
  )
}
