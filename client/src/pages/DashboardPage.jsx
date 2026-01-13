import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import Leaderboard from '../components/Charts/Leaderboard'
import ActivityTimeline from '../components/Charts/ActivityTimeline'
import LanguageChart from '../components/Charts/LanguageChart'
import ContributionHeatmap from '../components/Charts/ContributionHeatmap'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { fetchTeamStats, authors } = useData()
  const [teamStats, setTeamStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadTeamStats()
  }, [])

  const loadTeamStats = async () => {
    try {
      setIsLoading(true)
      const data = await fetchTeamStats()
      setTeamStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Loading team stats...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center glass-card p-8 max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-2xl font-bold mb-2">No Data Available</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/setup')}
          >
            Scan Repositories
          </button>
        </motion.div>
      </div>
    )
  }

  const summary = teamStats?.summary || {}
  const year = summary.dateRange?.start?.split('-')[0] || new Date().getFullYear()

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                className="text-gray-400 hover:text-white"
                onClick={() => navigate('/setup')}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </motion.button>
              <div>
                <h1 className="text-2xl font-display font-bold gradient-text">Team Dashboard</h1>
                <p className="text-sm text-gray-500">{year} Overview</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-xl p-1">
              {['overview', 'leaderboard', 'activity'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-purple-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Summary Stats - Always visible */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatCard
            label="Total Commits"
            value={summary.totalCommits?.toLocaleString() || 0}
            icon="📝"
            color="#10b981"
          />
          <StatCard
            label="Lines Added"
            value={`+${(summary.totalInsertions || 0).toLocaleString()}`}
            icon="➕"
            color="#22c55e"
          />
          <StatCard
            label="Contributors"
            value={summary.totalAuthors || 0}
            icon="👥"
            color="#8b5cf6"
          />
          <StatCard
            label="Repositories"
            value={summary.totalRepositories || 0}
            icon="📚"
            color="#3b82f6"
          />
        </motion.div>

        {/* ===== OVERVIEW TAB ===== */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Leaderboard Preview */}
              <motion.div
                className="lg:col-span-2 glass-card p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-display font-bold">🏆 Top Contributors</h2>
                  <button 
                    className="text-sm text-purple-400 hover:text-purple-300"
                    onClick={() => setActiveTab('leaderboard')}
                  >
                    View All →
                  </button>
                </div>
                <Leaderboard data={teamStats?.leaderboard?.slice(0, 5) || []} metric="commits" />
              </motion.div>

              {/* Top Language */}
              <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-display font-bold mb-6">💻 Languages</h2>
                <div className="text-center mb-4">
                  <p className="text-gray-400 text-sm">Top Language</p>
                  <p className="text-3xl font-bold gradient-text">{teamStats?.topLanguage || 'N/A'}</p>
                </div>
                <LanguageChart 
                  languages={teamStats?.languages?.map(l => ({ 
                    name: l.name, 
                    count: l.lines,
                    percentage: Math.round((l.lines / (teamStats?.languages?.reduce((sum, lang) => sum + lang.lines, 0) || 1)) * 100)
                  })) || []} 
                />
              </motion.div>
            </div>

            {/* Top Repositories */}
            <motion.div
              className="glass-card p-6 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-display font-bold mb-6">📁 Most Active Repositories</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamStats?.topRepositories?.slice(0, 6).map((repo, idx) => (
                  <motion.div
                    key={repo.name}
                    className="p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold truncate">{repo.name}</h3>
                        <p className="text-sm text-gray-500">{repo.commits} commits</p>
                      </div>
                      <span className="text-2xl">
                        {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '📦'}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Access - Individual Wrapped */}
            <motion.div
              className="glass-card p-6 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h2 className="text-xl font-display font-bold mb-6">✨ Generate Individual Wrapped</h2>
              <div className="flex flex-wrap gap-2">
                {authors.slice(0, 10).map((author, idx) => (
                  <motion.button
                    key={author.email}
                    className="px-4 py-2 bg-white/10 hover:bg-purple-500/30 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.03 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/wrapped/${encodeURIComponent(author.email)}`)}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style={{ backgroundColor: author.color || `hsl(${idx * 40}, 70%, 50%)` }}
                    >
                      {author.displayName?.[0] || author.name?.[0]}
                    </div>
                    {author.displayName || author.name}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* ===== LEADERBOARD TAB ===== */}
        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Full Leaderboard */}
            <motion.div
              className="glass-card p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-display font-bold mb-6">🏆 Full Leaderboard - By Commits</h2>
              <Leaderboard data={teamStats?.leaderboard || []} metric="commits" />
            </motion.div>

            {/* Leaderboard by Lines */}
            <motion.div
              className="glass-card p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-display font-bold mb-6">📝 By Lines of Code</h2>
              <Leaderboard 
                data={(teamStats?.leaderboard || [])
                  .map(item => ({ ...item, value: item.linesAdded || item.insertions || 0 }))
                  .sort((a, b) => b.value - a.value)
                } 
                metric="lines" 
              />
            </motion.div>

            {/* Collaborations */}
            {teamStats?.collaborations?.length > 0 && (
              <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-display font-bold mb-6">🤝 Top Collaborations</h2>
                <div className="space-y-3">
                  {teamStats.collaborations.slice(0, 10).map((collab, idx) => (
                    <motion.div
                      key={collab.pair}
                      className="flex items-center gap-4 p-3 bg-white/5 rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + idx * 0.05 }}
                    >
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-sm font-bold border-2 border-gray-900">
                          {collab.authors[0]?.[0]}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-sm font-bold border-2 border-gray-900">
                          {collab.authors[1]?.[0]}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{collab.pair}</p>
                        <p className="text-sm text-gray-500">{collab.sharedRepos} shared repositories</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ===== ACTIVITY TAB ===== */}
        {activeTab === 'activity' && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Activity Timeline */}
            <motion.div
              className="glass-card p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-display font-bold mb-6">📈 Monthly Activity</h2>
              <ActivityTimeline monthlyData={teamStats?.monthlyActivity || []} />
            </motion.div>

            {/* Contribution Heatmap */}
            <motion.div
              className="glass-card p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-display font-bold mb-6">🔥 Contribution Heatmap</h2>
              <ContributionHeatmap dailyData={teamStats?.dailyActivity || []} />
            </motion.div>

            {/* Activity Breakdown */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* By Day of Week */}
              <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-display font-bold mb-6">📅 By Day of Week</h2>
                <div className="space-y-3">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, idx) => {
                    const dayData = teamStats?.dayOfWeekActivity?.[idx] || 0
                    const maxDay = Math.max(...(teamStats?.dayOfWeekActivity || [1]))
                    const percentage = (dayData / maxDay) * 100
                    return (
                      <div key={day} className="flex items-center gap-3">
                        <span className="w-24 text-sm text-gray-400">{day}</span>
                        <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ delay: 0.3 + idx * 0.05, duration: 0.5 }}
                          />
                        </div>
                        <span className="w-16 text-right text-sm font-semibold">{dayData}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              {/* By Hour */}
              <motion.div
                className="glass-card p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-xl font-display font-bold mb-6">🕐 Peak Hours</h2>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: 24 }, (_, hour) => {
                    const hourData = teamStats?.hourlyActivity?.[hour] || 0
                    const maxHour = Math.max(...(teamStats?.hourlyActivity || [1]))
                    const intensity = hourData / maxHour
                    return (
                      <motion.div
                        key={hour}
                        className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium"
                        style={{
                          backgroundColor: `rgba(168, 85, 247, ${intensity * 0.8 + 0.1})`,
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + hour * 0.02 }}
                        title={`${hour}:00 - ${hourData} commits`}
                      >
                        {hour}
                      </motion.div>
                    )
                  })}
                </div>
                <p className="text-center text-gray-400 text-sm mt-4">Hover for commit count</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}

function StatCard({ label, value, icon, color }) {
  return (
    <motion.div
      className="glass-card p-5 stat-card"
      whileHover={{ y: -4 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
          <p className="text-2xl font-display font-bold" style={{ color }}>{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </motion.div>
  )
}
