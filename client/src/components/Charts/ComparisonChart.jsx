import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts'

export default function ComparisonChart({ 
  data = [], 
  dataKey = 'value',
  nameKey = 'name',
  colors = ['#8b5cf6', '#ec4899', '#f97316', '#10b981']
}) {
  const maxValue = Math.max(...data.map(d => d[dataKey] || 0), 1)

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 px-3 py-2 rounded-lg border border-gray-700">
          <p className="text-white font-semibold">{payload[0].payload[nameKey]}</p>
          <p className="text-purple-400">{payload[0].value?.toLocaleString()}</p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      className="w-full h-64"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
          <XAxis type="number" hide />
          <YAxis 
            type="category" 
            dataKey={nameKey}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#9ca3af', fontSize: 12 }}
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey={dataKey} radius={[0, 4, 4, 0]} animationDuration={1000}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || colors[index % colors.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
