import { motion } from 'framer-motion'
import { useMemo } from 'react'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function ContributionHeatmap({ activeDays = [], year }) {
  const targetYear = year || new Date().getFullYear()
  
  // Create a map of dates to commit counts
  const dateMap = useMemo(() => {
    const map = new Map()
    activeDays.forEach(date => {
      map.set(date, (map.get(date) || 0) + 1)
    })
    return map
  }, [activeDays])

  // Generate all weeks of the year
  const weeks = useMemo(() => {
    const result = []
    const startDate = new Date(targetYear, 0, 1)
    const endDate = new Date(targetYear, 11, 31)
    
    // Adjust to start from the first Sunday
    const firstDay = startDate.getDay()
    startDate.setDate(startDate.getDate() - firstDay)
    
    let currentWeek = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate || currentWeek.length > 0) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const isInYear = currentDate.getFullYear() === targetYear
      
      currentWeek.push({
        date: dateStr,
        count: dateMap.get(dateStr) || 0,
        inYear: isInYear,
        month: currentDate.getMonth(),
        day: currentDate.getDay()
      })
      
      if (currentWeek.length === 7) {
        result.push(currentWeek)
        currentWeek = []
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
      
      if (currentDate > endDate && currentWeek.length === 0) break
    }
    
    if (currentWeek.length > 0) {
      result.push(currentWeek)
    }
    
    return result
  }, [targetYear, dateMap])

  const maxCount = Math.max(...Array.from(dateMap.values()), 1)

  const getColor = (count, inYear) => {
    if (!inYear) return 'rgba(255,255,255,0.02)'
    if (count === 0) return 'rgba(139, 92, 246, 0.1)'
    const intensity = Math.min(count / maxCount, 1)
    return `rgba(139, 92, 246, ${0.2 + intensity * 0.8})`
  }

  // Find month label positions
  const monthLabels = useMemo(() => {
    const labels = []
    let lastMonth = -1
    
    weeks.forEach((week, weekIndex) => {
      const firstDayInYear = week.find(d => d.inYear)
      if (firstDayInYear && firstDayInYear.month !== lastMonth) {
        labels.push({ month: firstDayInYear.month, weekIndex })
        lastMonth = firstDayInYear.month
      }
    })
    
    return labels
  }, [weeks])

  return (
    <div className="overflow-x-auto">
      {/* Month labels */}
      <div className="flex mb-2 pl-8">
        {monthLabels.map(({ month, weekIndex }) => (
          <div
            key={month}
            className="text-xs text-gray-500"
            style={{ 
              marginLeft: weekIndex === 0 ? 0 : `${(weekIndex - (monthLabels.find(m => m.month === month - 1)?.weekIndex || 0)) * 14 - 20}px`,
              minWidth: '30px'
            }}
          >
            {MONTHS[month]}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Day labels */}
        <div className="flex flex-col gap-[2px] mr-2 pt-0">
          {DAYS.map((day, idx) => (
            <div 
              key={day} 
              className="text-xs text-gray-500 h-3 flex items-center"
              style={{ visibility: idx % 2 === 1 ? 'visible' : 'hidden' }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-[2px]">
          {weeks.map((week, weekIdx) => (
            <div key={weekIdx} className="flex flex-col gap-[2px]">
              {week.map((day, dayIdx) => (
                <motion.div
                  key={day.date}
                  className="w-3 h-3 rounded-sm heatmap-cell cursor-pointer"
                  style={{ backgroundColor: getColor(day.count, day.inYear) }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (weekIdx * 7 + dayIdx) * 0.002 }}
                  title={`${day.date}: ${day.count} commits`}
                  whileHover={{ scale: 1.5 }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4">
        <span className="text-xs text-gray-500">Less</span>
        {[0, 0.25, 0.5, 0.75, 1].map((intensity, idx) => (
          <div
            key={idx}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: `rgba(139, 92, 246, ${0.1 + intensity * 0.9})` }}
          />
        ))}
        <span className="text-xs text-gray-500">More</span>
      </div>
    </div>
  )
}
