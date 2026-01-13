import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export function useExport() {
  const exportToPNG = async (elementRef, filename = 'git-wrapped') => {
    if (!elementRef?.current) {
      console.error('No element reference provided')
      return false
    }

    try {
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: '#0a0a1a',
        scale: 2,
        logging: false,
        useCORS: true
      })
      
      const link = document.createElement('a')
      link.download = `${filename}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      
      return true
    } catch (error) {
      console.error('Failed to export PNG:', error)
      return false
    }
  }

  const exportToPDF = async (elementRef, filename = 'git-wrapped') => {
    if (!elementRef?.current) {
      console.error('No element reference provided')
      return false
    }

    try {
      const canvas = await html2canvas(elementRef.current, {
        backgroundColor: '#0a0a1a',
        scale: 2,
        logging: false,
        useCORS: true
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`${filename}.pdf`)
      
      return true
    } catch (error) {
      console.error('Failed to export PDF:', error)
      return false
    }
  }

  const shareStats = async (stats) => {
    const text = `🎉 My Git Wrapped ${stats?.dateRange?.start?.split('-')[0] || new Date().getFullYear()}!

📊 ${stats?.summary?.totalCommits || 0} commits
➕ ${(stats?.summary?.totalInsertions || 0).toLocaleString()} lines added
💻 Top language: ${stats?.languages?.topLanguage || 'N/A'}
🔥 Longest streak: ${stats?.streakStats?.longestStreak || 0} days

Generated with Git Wrapped ✨`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Git Wrapped',
          text
        })
        return true
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Share failed:', error)
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text)
      return 'copied'
    } catch (error) {
      console.error('Failed to copy:', error)
      return false
    }
  }

  return { exportToPNG, exportToPDF, shareStats }
}
