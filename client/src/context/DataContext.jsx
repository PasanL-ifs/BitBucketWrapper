import { createContext, useContext, useState, useCallback } from 'react'

const DataContext = createContext(null)

export function DataProvider({ children }) {
  const [scanData, setScanData] = useState(null)
  const [authors, setAuthors] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [error, setError] = useState(null)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [discoveredRepos, setDiscoveredRepos] = useState([])
  const [isHostedMode, setIsHostedMode] = useState(false)

  // Discover repositories in a directory (fast, no parsing)
  const discoverRepositories = useCallback(async (path) => {
    setIsDiscovering(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/scan/discover?path=${encodeURIComponent(path)}`)
      
      // Try to parse JSON, with better error handling
      let data
      try {
        const text = await response.text()
        if (!text) {
          throw new Error('Server returned empty response. Try restarting the server.')
        }
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error(`Server connection error. Make sure the backend is running on port 3001.`)
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to discover repositories')
      }
      
      setDiscoveredRepos(data.repos || [])
      return data.repos || []
    } catch (err) {
      const errorMessage = err.name === 'TypeError' 
        ? 'Cannot connect to server. Make sure the backend is running.'
        : err.message
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsDiscovering(false)
    }
  }, [])

  // Scan selected repositories
  const scanRepositories = useCallback(async (pathOrPaths, year) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const body = Array.isArray(pathOrPaths) 
        ? { paths: pathOrPaths, year }
        : { path: pathOrPaths, year }
      
      const response = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      // Try to parse JSON, with better error handling
      let data
      try {
        const text = await response.text()
        if (!text) {
          throw new Error('Server returned empty response. The scan may have been too large.')
        }
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error(`Server error during scan. Try scanning fewer repositories or a smaller time range.`)
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan repositories')
      }
      
      setScanData(data)
      setAuthors(data.authors || [])
      setSelectedYear(year)
      return data
    } catch (err) {
      const errorMessage = err.name === 'TypeError' 
        ? 'Cannot connect to server. Make sure the backend is running.'
        : err.message
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load data from uploaded JSON file (for hosted/GitHub Pages mode)
  const loadFromFile = useCallback(async (fileData) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Parse the uploaded data
      const data = typeof fileData === 'string' ? JSON.parse(fileData) : fileData
      
      if (!data.commits || !data.authors) {
        throw new Error('Invalid data file format')
      }
      
      setScanData({
        success: true,
        repositoriesFound: data.repositories?.length || 0,
        totalCommits: data.totalCommits || data.commits.length,
        authors: data.authors,
        repositories: data.repositories || [],
        dateRange: data.dateRange,
        fromFile: true
      })
      setAuthors(data.authors || [])
      setIsHostedMode(true)
      
      // Store in sessionStorage for stats retrieval
      sessionStorage.setItem('wrappedData', JSON.stringify(data))
      
      return data
    } catch (err) {
      setError(err.message || 'Failed to load data file')
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchDeveloperStats = useCallback(async (email) => {
    // Check if we have data from file upload
    const storedData = sessionStorage.getItem('wrappedData')
    if (storedData) {
      const data = JSON.parse(storedData)
      // Calculate stats client-side from the stored data
      const { calculateDeveloperStatsFromData } = await import('../utils/statsCalculator.js')
      return calculateDeveloperStatsFromData(email, data)
    }
    
    try {
      const response = await fetch(`/api/stats/${encodeURIComponent(email)}`)
      
      // Try to parse JSON, with better error handling
      let data
      try {
        const text = await response.text()
        if (!text) {
          throw new Error('Server returned empty response')
        }
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error('Server connection error. Make sure the backend is running.')
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats')
      }
      
      return data
    } catch (err) {
      const errorMessage = err.name === 'TypeError' 
        ? 'Cannot connect to server. Make sure the backend is running.'
        : err.message
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const fetchTeamStats = useCallback(async () => {
    // Check if we have data from file upload
    const storedData = sessionStorage.getItem('wrappedData')
    if (storedData) {
      const data = JSON.parse(storedData)
      const { calculateTeamStatsFromData } = await import('../utils/statsCalculator.js')
      return calculateTeamStatsFromData(data)
    }
    
    try {
      const response = await fetch('/api/stats/team/overview')
      
      // Try to parse JSON, with better error handling
      let data
      try {
        const text = await response.text()
        if (!text) {
          throw new Error('Server returned empty response')
        }
        data = JSON.parse(text)
      } catch (parseError) {
        throw new Error('Server connection error. Make sure the backend is running.')
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch team stats')
      }
      
      return data
    } catch (err) {
      const errorMessage = err.name === 'TypeError' 
        ? 'Cannot connect to server. Make sure the backend is running.'
        : err.message
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }, [])

  const checkScanStatus = useCallback(async () => {
    // Check for stored file data first
    const storedData = sessionStorage.getItem('wrappedData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData)
        setAuthors(data.authors || [])
        setScanData({ hasData: true, fromFile: true, ...data })
        setIsHostedMode(true)
        return { hasData: true, fromFile: true }
      } catch (e) {
        sessionStorage.removeItem('wrappedData')
      }
    }
    
    try {
      const response = await fetch('/api/scan/status')
      const text = await response.text()
      if (!text) return { hasData: false }
      
      const data = JSON.parse(text)
      
      if (data.hasData) {
        try {
          const authorsResponse = await fetch('/api/authors')
          const authorsText = await authorsResponse.text()
          if (authorsText) {
            const authorsData = JSON.parse(authorsText)
            setAuthors(authorsData.authors || [])
          }
        } catch (e) {
          console.error('Failed to fetch authors:', e)
        }
        setScanData({ hasData: true, ...data })
      }
      
      return data
    } catch (err) {
      console.error('Failed to check scan status:', err)
      return { hasData: false }
    }
  }, [])

  const clearData = useCallback(() => {
    sessionStorage.removeItem('wrappedData')
    setScanData(null)
    setAuthors([])
    setDiscoveredRepos([])
    setIsHostedMode(false)
  }, [])

  const value = {
    scanData,
    authors,
    isLoading,
    isDiscovering,
    error,
    selectedYear,
    setSelectedYear,
    discoveredRepos,
    setDiscoveredRepos,
    isHostedMode,
    discoverRepositories,
    scanRepositories,
    loadFromFile,
    fetchDeveloperStats,
    fetchTeamStats,
    checkScanStatus,
    clearData,
    setError
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
