import { motion } from 'framer-motion'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#8b5cf6', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#14b8a6']

export default function LanguageChart({ languages = [], showLegend = true }) {
  const chartData = languages.slice(0, 8).map(lang => ({
    name: lang.name,
    value: lang.count || lang.percentage || 1
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-700">
          <p className="text-white font-semibold">{payload[0].name}</p>
          <p className="text-gray-400">{payload[0].payload.percentage || Math.round(payload[0].value)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <motion.div
        className="w-48 h-48"
        initial={{ opacity: 0, scale: 0.8, rotate: -180 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 0.8, type: "spring" }}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              animationBegin={0}
              animationDuration={1000}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>

      {showLegend && (
        <div className="space-y-2">
          {languages.slice(0, 6).map((lang, idx) => (
            <motion.div
              key={lang.name}
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span className="text-gray-300 text-sm">{lang.name}</span>
              <span className="text-gray-500 text-sm">{lang.percentage}%</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
