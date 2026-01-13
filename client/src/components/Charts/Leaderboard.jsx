import { motion } from 'framer-motion'

export default function Leaderboard({ data = [], metric = 'commits', limit = 10 }) {
  const sortedData = [...data]
    .sort((a, b) => (b[metric] || 0) - (a[metric] || 0))
    .slice(0, limit)

  const maxValue = sortedData[0]?.[metric] || 1

  const getMedal = (rank) => {
    if (rank === 0) return '🥇'
    if (rank === 1) return '🥈'
    if (rank === 2) return '🥉'
    return `${rank + 1}`
  }

  return (
    <div className="space-y-3">
      {sortedData.map((item, idx) => (
        <motion.div
          key={item.email || item.name || idx}
          className="flex items-center gap-4 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
        >
          {/* Rank */}
          <div className="w-8 text-center font-bold text-lg">
            {getMedal(idx)}
          </div>

          {/* Avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: item.color || `hsl(${idx * 40}, 70%, 50%)` }}
          >
            {item.name?.[0] || '?'}
          </div>

          {/* Name and stats */}
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">{item.name}</div>
            <div className="text-sm text-gray-500">
              {item[metric]?.toLocaleString()} {metric}
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ 
                backgroundColor: item.color || '#8b5cf6',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${(item[metric] / maxValue) * 100}%` }}
              transition={{ delay: idx * 0.05 + 0.3, duration: 0.5 }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  )
}
