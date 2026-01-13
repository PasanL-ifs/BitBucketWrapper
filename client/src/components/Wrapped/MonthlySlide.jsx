import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'

export default function MonthlySlide({ stats }) {
  const monthlyData = stats?.monthlyStats?.byMonth || []
  const mostProductiveMonth = stats?.monthlyStats?.mostProductiveMonth
  const mostProductiveMonthCommits = stats?.monthlyStats?.mostProductiveMonthCommits || 0

  const maxCommits = Math.max(...monthlyData.map(m => m.commits), 1)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <div className="relative z-10 w-full max-w-4xl text-center">
        <motion.p
          className="text-gray-400 text-xl mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Your most productive month was
        </motion.p>

        <motion.h2
          className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          {mostProductiveMonth || 'N/A'}
        </motion.h2>

        <motion.p
          className="text-2xl text-gray-300 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          with <span className="text-blue-400 font-bold">{mostProductiveMonthCommits}</span> commits
        </motion.p>

        {/* Chart */}
        <motion.div
          className="h-64 w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData} barCategoryGap="20%">
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#9ca3af', fontSize: 12 }}
              />
              <YAxis hide />
              <Bar dataKey="commits" radius={[4, 4, 0, 0]}>
                {monthlyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name === mostProductiveMonth 
                      ? '#3b82f6' 
                      : `rgba(59, 130, 246, ${0.2 + (entry.commits / maxCommits) * 0.4})`
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.p
          className="text-gray-500 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {mostProductiveMonth === 'Dec' && "Closing out the year strong! 🎄"}
          {mostProductiveMonth === 'Jan' && "New year, new code! 🎉"}
          {['Jun', 'Jul', 'Aug'].includes(mostProductiveMonth) && "Summer productivity! ☀️"}
        </motion.p>
      </div>
    </div>
  )
}
