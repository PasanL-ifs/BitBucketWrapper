import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../context/DataContext'

// Slide Components
import WelcomeSlide from '../components/Wrapped/WelcomeSlide'
import CommitsSlide from '../components/Wrapped/CommitsSlide'
import LinesSlide from '../components/Wrapped/LinesSlide'
import MonthlySlide from '../components/Wrapped/MonthlySlide'
import TimeSlide from '../components/Wrapped/TimeSlide'
import LanguagesSlide from '../components/Wrapped/LanguagesSlide'
import BadgesSlide from '../components/Wrapped/BadgesSlide'
import InsightsSlide from '../components/Wrapped/InsightsSlide'
import SummarySlide from '../components/Wrapped/SummarySlide'

const SLIDES = [
  { id: 'welcome', Component: WelcomeSlide },
  { id: 'commits', Component: CommitsSlide },
  { id: 'lines', Component: LinesSlide },
  { id: 'monthly', Component: MonthlySlide },
  { id: 'time', Component: TimeSlide },
  { id: 'languages', Component: LanguagesSlide },
  { id: 'badges', Component: BadgesSlide },
  { id: 'insights', Component: InsightsSlide },
  { id: 'summary', Component: SummarySlide },
]

export default function WrappedPage() {
  const { email } = useParams()
  const navigate = useNavigate()
  const { fetchDeveloperStats } = useData()
  
  const [stats, setStats] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [direction, setDirection] = useState(1)
  const [autoPlay, setAutoPlay] = useState(false)

  useEffect(() => {
    loadStats()
  }, [email])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const data = await fetchDeveloperStats(email)
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-advance slides
  useEffect(() => {
    if (!autoPlay || currentSlide >= SLIDES.length - 1) return
    
    const timer = setTimeout(() => {
      goToNextSlide()
    }, 5000)

    return () => clearTimeout(timer)
  }, [autoPlay, currentSlide])

  const goToNextSlide = useCallback(() => {
    if (currentSlide < SLIDES.length - 1) {
      setDirection(1)
      setCurrentSlide(prev => prev + 1)
    }
  }, [currentSlide])

  const goToPrevSlide = useCallback(() => {
    if (currentSlide > 0) {
      setDirection(-1)
      setCurrentSlide(prev => prev - 1)
    }
  }, [currentSlide])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        goToNextSlide()
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide()
      } else if (e.key === 'Escape') {
        navigate('/setup')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextSlide, goToPrevSlide, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <svg className="w-10 h-10 text-white animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-gray-400">Generating your Wrapped...</p>
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
          <h2 className="text-2xl font-bold mb-2">Oops!</h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            className="btn-primary"
            onClick={() => navigate('/setup')}
          >
            Go Back
          </button>
        </motion.div>
      </div>
    )
  }

  const CurrentSlideComponent = SLIDES[currentSlide].Component

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Navigation */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center">
        <motion.button
          className="text-gray-400 hover:text-white flex items-center gap-2 bg-black/30 px-4 py-2 rounded-full backdrop-blur-sm"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate('/setup')}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Exit
        </motion.button>

        <motion.div
          className="flex items-center gap-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            className={`p-2 rounded-full ${autoPlay ? 'bg-purple-500' : 'bg-black/30'} backdrop-blur-sm`}
            onClick={() => setAutoPlay(!autoPlay)}
          >
            {autoPlay ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            )}
          </button>
        </motion.div>
      </div>

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 px-6 pt-2">
        {SLIDES.map((_, idx) => (
          <motion.div
            key={idx}
            className="h-1 flex-1 rounded-full overflow-hidden bg-white/20 cursor-pointer"
            onClick={() => {
              setDirection(idx > currentSlide ? 1 : -1)
              setCurrentSlide(idx)
            }}
          >
            <motion.div
              className="h-full bg-white"
              initial={{ width: '0%' }}
              animate={{
                width: idx < currentSlide ? '100%' : idx === currentSlide ? '100%' : '0%'
              }}
              transition={{ duration: idx === currentSlide ? (autoPlay ? 5 : 0.5) : 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Slide Content */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          custom={direction}
          initial={{ opacity: 0, x: direction * 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -100 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="min-h-screen"
        >
          <CurrentSlideComponent stats={stats} />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center items-center gap-6">
        <motion.button
          className={`p-3 rounded-full bg-white/10 backdrop-blur-sm ${currentSlide === 0 ? 'opacity-30' : 'hover:bg-white/20'}`}
          whileHover={currentSlide > 0 ? { scale: 1.1 } : {}}
          whileTap={currentSlide > 0 ? { scale: 0.9 } : {}}
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>

        <span className="text-gray-400 text-sm">
          {currentSlide + 1} / {SLIDES.length}
        </span>

        <motion.button
          className={`p-3 rounded-full bg-white/10 backdrop-blur-sm ${currentSlide === SLIDES.length - 1 ? 'opacity-30' : 'hover:bg-white/20'}`}
          whileHover={currentSlide < SLIDES.length - 1 ? { scale: 1.1 } : {}}
          whileTap={currentSlide < SLIDES.length - 1 ? { scale: 0.9 } : {}}
          onClick={goToNextSlide}
          disabled={currentSlide === SLIDES.length - 1}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Click areas for navigation */}
      <div
        className="absolute inset-y-0 left-0 w-1/3 cursor-pointer z-10"
        onClick={goToPrevSlide}
      />
      <div
        className="absolute inset-y-0 right-0 w-1/3 cursor-pointer z-10"
        onClick={goToNextSlide}
      />
    </div>
  )
}
