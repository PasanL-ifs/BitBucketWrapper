import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'

export default function SetupPage() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const { 
    discoverRepositories,
    scanRepositories, 
    loadFromFile,
    authors, 
    isLoading,
    isDiscovering,
    error, 
    setError,
    checkScanStatus,
    scanData,
    discoveredRepos,
    setDiscoveredRepos
  } = useData()
  
  const [step, setStep] = useState(1)
  const [repoPath, setRepoPath] = useState('')
  const [selectedYear, setSelectedYear] = useState('all')
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [scanComplete, setScanComplete] = useState(false)
  const [selectedRepos, setSelectedRepos] = useState([])
  const [inputMode, setInputMode] = useState('folder') // 'folder' or 'file'

  const currentYear = new Date().getFullYear()
  const years = ['all', ...Array.from({ length: 5 }, (_, i) => currentYear - i)]

  useEffect(() => {
    checkScanStatus().then(data => {
      if (data.hasData) {
        setScanComplete(true)
        setStep(4)
      }
    })
  }, [checkScanStatus])

  // Handle folder path discovery
  const handleDiscover = async () => {
    if (!repoPath.trim()) {
      setError('Please enter a repository path')
      return
    }

    try {
      const repos = await discoverRepositories(repoPath.trim())
      if (repos.length === 0) {
        setError('No Git repositories found in this folder')
        return
      }
      // Select all by default
      setSelectedRepos(repos.map(r => r.path))
      setStep(2.5) // New step for repo selection
    } catch (err) {
      // Error is already set in context
    }
  }

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      await loadFromFile(text)
      setScanComplete(true)
      setStep(4)
    } catch (err) {
      setError('Failed to parse the uploaded file. Please ensure it\'s a valid Git Wrapped export.')
    }
  }

  // Handle repo selection toggle
  const toggleRepo = (repoPath) => {
    setSelectedRepos(prev => 
      prev.includes(repoPath)
        ? prev.filter(p => p !== repoPath)
        : [...prev, repoPath]
    )
  }

  const selectAllRepos = () => {
    setSelectedRepos(discoveredRepos.map(r => r.path))
  }

  const deselectAllRepos = () => {
    setSelectedRepos([])
  }

  // Handle scan with selected repos
  const handleScan = async () => {
    if (selectedRepos.length === 0) {
      setError('Please select at least one repository')
      return
    }

    try {
      await scanRepositories(selectedRepos, selectedYear)
      setScanComplete(true)
      setStep(4)
    } catch (err) {
      // Error is already set in context
    }
  }

  const handleGenerate = () => {
    if (selectedAuthor) {
      navigate(`/wrapped/${encodeURIComponent(selectedAuthor.email)}`)
    }
  }

  const getYearDisplay = (year) => {
    if (year === 'all') return '✨ All Time'
    return year
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Back button */}
      <motion.button
        className="absolute top-6 left-6 text-gray-400 hover:text-white flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate('/')}
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </motion.button>

      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Progress Steps */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-2 sm:gap-4">
            <StepIndicator number={1} current={step} complete={step > 1} label="Time Range" />
            <div className={`w-8 sm:w-16 h-0.5 ${step > 1 ? 'bg-purple-500' : 'bg-gray-700'}`} />
            <StepIndicator number={2} current={step} complete={step > 2.5} label="Select Repos" />
            <div className={`w-8 sm:w-16 h-0.5 ${step > 2.5 ? 'bg-purple-500' : 'bg-gray-700'}`} />
            <StepIndicator number={3} current={step} complete={step > 3} label="Scan" />
            <div className={`w-8 sm:w-16 h-0.5 ${step > 3 ? 'bg-purple-500' : 'bg-gray-700'}`} />
            <StepIndicator number={4} current={step} complete={false} label="Developer" />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Year/Time Range Selection */}
          {step === 1 && (
            <StepContent key="step1">
              <h2 className="text-3xl font-display font-bold mb-2 text-center gradient-text">
                Select Time Range
              </h2>
              <p className="text-gray-400 text-center mb-8">
                Choose a year or view all-time statistics
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                {years.map(year => (
                  <motion.button
                    key={year}
                    className={`py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                      selectedYear === year
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white glow'
                        : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedYear(year)}
                  >
                    {getYearDisplay(year)}
                  </motion.button>
                ))}
              </div>

              <motion.button
                className="btn-primary w-full py-4 text-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setStep(2)}
              >
                Continue
              </motion.button>
            </StepContent>
          )}

          {/* Step 2: Path Input / File Upload */}
          {step === 2 && (
            <StepContent key="step2">
              <h2 className="text-3xl font-display font-bold mb-2 text-center gradient-text">
                Choose Data Source
              </h2>
              <p className="text-gray-400 text-center mb-6">
                Scan local repositories or upload exported data
              </p>

              {/* Input Mode Toggle */}
              <div className="flex justify-center gap-2 mb-6">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputMode === 'folder'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setInputMode('folder')}
                >
                  📁 Local Folder
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputMode === 'file'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-gray-400 hover:text-white'
                  }`}
                  onClick={() => setInputMode('file')}
                >
                  📄 Upload File
                </button>
              </div>

              {inputMode === 'folder' ? (
                <>
                  <div className="mb-6">
                    <label className="block text-sm text-gray-400 mb-2">Workspace Folder Path</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                      placeholder="C:\Users\pakulk\Workspace"
                      value={repoPath}
                      onChange={(e) => setRepoPath(e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      We'll find all Git repositories in this folder and let you choose which ones to include
                    </p>
                  </div>

                  {error && (
                    <motion.div
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex gap-4">
                    <motion.button
                      className="btn-secondary flex-1 py-4"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStep(1)}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleDiscover}
                      disabled={isDiscovering}
                    >
                      {isDiscovering ? (
                        <>
                          <LoadingSpinner />
                          Discovering...
                        </>
                      ) : (
                        'Find Repositories'
                      )}
                    </motion.button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <div
                      className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <div className="text-4xl mb-4">📤</div>
                      <p className="text-gray-300 mb-2">Click to upload or drag and drop</p>
                      <p className="text-gray-500 text-sm">wrapped-data.json file</p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                    <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                      <p className="text-xs text-gray-400 mb-2 text-center">
                        Use the <code className="bg-white/10 px-2 py-1 rounded text-purple-300">git-wrapped-export</code> CLI tool to generate this file
                      </p>
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mt-3">
                        <a
                          href="https://github.com/PasanL-ifs/BitBucketWrapper/releases"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-purple-400 hover:text-purple-300 underline flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Download CLI Tool (Windows .exe)
                        </a>
                        <span className="text-gray-600 hidden sm:inline">|</span>
                        <a
                          href="https://github.com/PasanL-ifs/BitBucketWrapper/blob/main/cli/README.md"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-gray-400 hover:text-gray-300 underline"
                        >
                          Other versions (Node.js, Python)
                        </a>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}

                  <motion.button
                    className="btn-secondary w-full py-4"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(1)}
                  >
                    Back
                  </motion.button>
                </>
              )}
            </StepContent>
          )}

          {/* Step 2.5: Repository Selection */}
          {step === 2.5 && (
            <StepContent key="step2-5">
              <h2 className="text-3xl font-display font-bold mb-2 text-center gradient-text">
                Select Repositories
              </h2>
              <p className="text-gray-400 text-center mb-2">
                Found {discoveredRepos.length} repositories
              </p>
              <p className="text-purple-400 text-sm text-center mb-6">
                {selectedRepos.length} selected
              </p>

              {/* Select/Deselect All */}
              <div className="flex justify-end gap-2 mb-4">
                <button
                  className="text-sm text-purple-400 hover:text-purple-300"
                  onClick={selectAllRepos}
                >
                  Select All
                </button>
                <span className="text-gray-600">|</span>
                <button
                  className="text-sm text-gray-400 hover:text-gray-300"
                  onClick={deselectAllRepos}
                >
                  Deselect All
                </button>
              </div>

              {/* Repository List */}
              <div className="max-h-64 overflow-y-auto mb-6 pr-2 space-y-2">
                {discoveredRepos.map((repo, index) => (
                  <motion.div
                    key={repo.path}
                    className={`p-4 rounded-xl flex items-center gap-4 cursor-pointer transition-all ${
                      selectedRepos.includes(repo.path)
                        ? 'bg-purple-500/20 border-2 border-purple-500'
                        : 'bg-white/5 border border-gray-700 hover:bg-white/10'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => toggleRepo(repo.path)}
                  >
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${
                      selectedRepos.includes(repo.path)
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-gray-600'
                    }`}>
                      {selectedRepos.includes(repo.path) && (
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{repo.name}</div>
                      <div className="text-xs text-gray-500 truncate">{repo.path}</div>
                    </div>
                    <span className="text-2xl">📁</span>
                  </motion.div>
                ))}
              </div>

              {error && (
                <motion.div
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-4">
                <motion.button
                  className="btn-secondary flex-1 py-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setDiscoveredRepos([])
                    setSelectedRepos([])
                    setStep(2)
                  }}
                >
                  Back
                </motion.button>
                <motion.button
                  className="btn-primary flex-1 py-4 text-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScan}
                  disabled={isLoading || selectedRepos.length === 0}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      Scanning...
                    </>
                  ) : (
                    `Scan ${selectedRepos.length} Repo${selectedRepos.length !== 1 ? 's' : ''}`
                  )}
                </motion.button>
              </div>
            </StepContent>
          )}

          {/* Step 4: Choose Developer */}
          {step === 4 && (
            <StepContent key="step4">
              <h2 className="text-3xl font-display font-bold mb-2 text-center gradient-text">
                Choose Developer
              </h2>
              <p className="text-gray-400 text-center mb-2">
                Select a team member to generate their Wrapped
              </p>
              {scanData && (
                <p className="text-sm text-purple-400 text-center mb-8">
                  Found {scanData.repositoriesCount || scanData.repositoriesFound || 0} repositories with {scanData.totalCommits || 0} commits
                  {selectedYear !== 'all' && ` in ${selectedYear}`}
                  {selectedYear === 'all' && ' (All Time)'}
                </p>
              )}

              <div className="max-h-80 overflow-y-auto mb-6 pr-2 space-y-2">
                {authors.map((author, index) => (
                  <motion.button
                    key={author.email}
                    className={`w-full p-4 rounded-xl flex items-center gap-4 transition-all ${
                      selectedAuthor?.email === author.email
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500'
                        : 'bg-white/5 border border-gray-700 hover:bg-white/10'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedAuthor(author)}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                      style={{ backgroundColor: author.color || `hsl(${index * 40}, 70%, 50%)` }}
                    >
                      {author.displayName?.[0] || author.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{author.displayName || author.name}</div>
                      <div className="text-sm text-gray-400">{author.email}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-400">{author.commitCount}</div>
                      <div className="text-xs text-gray-500">commits</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-4">
                <motion.button
                  className="btn-secondary flex-1 py-4"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/dashboard')}
                >
                  Team Dashboard
                </motion.button>
                <motion.button
                  className="btn-primary flex-1 py-4 text-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGenerate}
                  disabled={!selectedAuthor}
                >
                  Generate Wrapped ✨
                </motion.button>
              </div>
            </StepContent>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function StepIndicator({ number, current, complete, label }) {
  const isActive = Math.floor(current) === number || (current === 2.5 && number === 2)
  const isDone = complete || current > number

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
          isDone
            ? 'bg-purple-500 text-white'
            : isActive
            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
            : 'bg-gray-700 text-gray-400'
        }`}
      >
        {isDone && !isActive ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          number
        )}
      </div>
      <span className={`text-xs mt-2 hidden sm:block ${isActive ? 'text-purple-400' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  )
}

function StepContent({ children }) {
  return (
    <motion.div
      className="glass-card p-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}
