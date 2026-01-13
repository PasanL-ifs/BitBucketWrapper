import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#14b8a6']

export default function LanguagesSlide({ stats }) {
  const languages = stats?.languages?.breakdown || []
  const topLanguage = stats?.languages?.topLanguage
  const topLanguagePercentage = stats?.languages?.topLanguagePercentage || 0

  const chartData = languages.slice(0, 8).map(lang => ({
    name: lang.name,
    value: lang.count
  }))

  const getLanguageEmoji = (lang) => {
    const emojis = {
      'C#': '💜',
      'XAML': '🎨',
      'Java': '☕',
      'JavaScript': '⚡',
      'TypeScript': '💙',
      'Python': '🐍',
      'HTML': '🌐',
      'CSS': '🎀',
      'SQL': '🗃️',
      'Go': '🐹',
      'Rust': '🦀',
      'Swift': '🍎',
      'Kotlin': '🟣',
    }
    return emojis[lang] || '💻'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-orange-500/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      />

      <div className="relative z-10 w-full max-w-4xl">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-gray-400 text-xl mb-4">Your top language was</p>
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-2">
            <span className="mr-4">{getLanguageEmoji(topLanguage)}</span>
            <span className="gradient-text">{topLanguage || 'Unknown'}</span>
          </h2>
          <p className="text-2xl text-gray-300">
            <span className="text-purple-400 font-bold">{topLanguagePercentage}%</span> of your code
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Pie Chart */}
          <motion.div
            className="h-64"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Language list */}
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            {languages.slice(0, 6).map((lang, idx) => (
              <motion.div
                key={lang.name}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + idx * 0.1 }}
              >
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="flex-1 text-gray-300">{lang.name}</span>
                <span className="text-gray-500">{lang.percentage}%</span>
                <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                    initial={{ width: 0 }}
                    animate={{ width: `${lang.percentage}%` }}
                    transition={{ delay: 0.8 + idx * 0.1, duration: 0.5 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {languages.length > 4 && (
          <motion.p
            className="text-center text-gray-500 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            🌍 Polyglot alert! You worked with {languages.length} languages this year
          </motion.p>
        )}
      </div>
    </div>
  )
}
