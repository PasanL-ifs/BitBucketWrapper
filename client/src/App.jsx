import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import LandingPage from './pages/LandingPage'
import SetupPage from './pages/SetupPage'
import WrappedPage from './pages/WrappedPage'
import DashboardPage from './pages/DashboardPage'
import { DataProvider } from './context/DataContext'

function App() {
  return (
    <DataProvider>
      <div className="min-h-screen mesh-bg">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/wrapped/:email" element={<WrappedPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </div>
    </DataProvider>
  )
}

export default App
