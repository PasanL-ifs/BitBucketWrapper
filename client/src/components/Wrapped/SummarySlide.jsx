import { motion } from 'framer-motion'
import { useRef } from 'react'
import html2canvas from 'html2canvas'

export default function SummarySlide({ stats }) {
  const cardRef = useRef(null)
  const author = stats?.author || {}
  const summary = stats?.summary || {}
  const languages = stats?.languages || {}
  const badges = stats?.badges || []
  const year = stats?.dateRange?.start?.split('-')[0] || new Date().getFullYear()

  const handleDownload = async () => {
    if (!cardRef.current) return

    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a1a',
        scale: 2,
      })
      
      const link = document.createElement('a')
      link.download = `git-wrapped-${author.name?.replace(/\s+/g, '-')}-${year}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Failed to download:', error)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background celebration */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#8b5cf6', '#ec4899', '#f97316', '#10b981'][Math.floor(Math.random() * 4)],
            }}
            animate={{
              y: [0, -100],
              opacity: [0, 1, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          />
        ))}
      </motion.div>

      {/* Summary Card */}
      <motion.div
        ref={cardRef}
        className="relative z-10 w-full max-w-md glass-card p-8 animated-border"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className="w-20 h-20 mx-auto rounded-full flex items-center justify-center text-3xl font-bold mb-4"
            style={{ backgroundColor: author.color || '#8b5cf6' }}
          >
            {author.name?.[0] || '?'}
          </div>
          <h2 className="text-2xl font-display font-bold">{author.name}</h2>
          <p className="text-gray-400">Git Wrapped {year}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <StatBox label="Commits" value={summary.totalCommits?.toLocaleString() || 0} color="#10b981" />
          <StatBox label="Lines Added" value={`+${(summary.totalInsertions || 0).toLocaleString()}`} color="#22c55e" />
          <StatBox label="Lines Removed" value={`-${(summary.totalDeletions || 0).toLocaleString()}`} color="#ef4444" />
          <StatBox label="Repositories" value={summary.repositoriesContributed || 0} color="#3b82f6" />
        </div>

        {/* Top language */}
        <div className="text-center mb-6 p-4 bg-white/5 rounded-xl">
          <p className="text-gray-500 text-sm mb-1">Top Language</p>
          <p className="text-xl font-semibold gradient-text">{languages.topLanguage || 'N/A'}</p>
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {badges.slice(0, 4).map(badge => (
              <span
                key={badge.id}
                className="px-3 py-1 bg-white/10 rounded-full text-sm flex items-center gap-1"
              >
                {badge.icon} {badge.name}
              </span>
            ))}
            {badges.length > 4 && (
              <span className="px-3 py-1 bg-white/10 rounded-full text-sm">
                +{badges.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <span className="gradient-text font-semibold">Git Wrapped</span>
            <span>•</span>
            <span>{year}</span>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        className="relative z-10 mt-8 flex gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <motion.button
          className="btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDownload}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </motion.button>

        <motion.button
          className="btn-secondary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Git Wrapped ${year}`,
                text: `Check out my Git Wrapped! I made ${summary.totalCommits} commits this year!`,
              })
            }
          }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </motion.button>
      </motion.div>

      <motion.p
        className="relative z-10 mt-6 text-gray-500 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Thanks for an amazing year of code! 🎉
      </motion.p>
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div className="text-center p-3 bg-white/5 rounded-xl">
      <div className="text-2xl font-display font-bold" style={{ color }}>{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )
}
