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
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to discover repositories')
      }
      
      const data = await response.json()
      setDiscoveredRepos(data.repos || [])
      return data.repos || []
    } catch (err) {
      setError(err.message)
      throw err
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
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to scan repositories')
      }
      
      const data = await response.json()
      setScanData(data)
      setAuthors(data.authors || [])
      setSelectedYear(year)
      return data
    } catch (err) {
      setError(err.message)
      throw err
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
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch stats')
      }
      
      return await response.json()
    } catch (err) {
      setError(err.message)
      throw err
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
      
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to fetch team stats')
      }
      
      return await response.json()
    } catch (err) {
      setError(err.message)
      throw err
    }
  }, [])

  const checkScanStatus = useCallback(async () => {
    // Check for stored file data first
    const storedData = sessionStorage.getItem('wrappedData')
    if (storedData) {
      const data = JSON.parse(storedData)
      setAuthors(data.authors || [])
      setScanData({ hasData: true, fromFile: true, ...data })
      setIsHostedMode(true)
      return { hasData: true, fromFile: true }
    }
    
    try {
      const response = await fetch('/api/scan/status')
      const data = await response.json()
      
      if (data.hasData) {
        const authorsResponse = await fetch('/api/authors')
        const authorsData = await authorsResponse.json()
        setAuthors(authorsData.authors || [])
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
