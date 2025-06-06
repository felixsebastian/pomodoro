import { Calendar, Clock, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

interface SessionStats {
  date: string
  workSessions: number
  totalFocusTime: number // in minutes
}

interface SessionStatsProps {
  isOpen: boolean
  onClose: () => void
  currentSession?: {
    mode: 'work' | 'shortBreak' | 'longBreak'
    duration: number
  } | null
}

const SessionStats: React.FC<SessionStatsProps> = ({ isOpen, onClose, currentSession }) => {
  const [stats, setStats] = useState<SessionStats[]>([])

  // Load stats from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('pomodoro-stats')
    if (savedStats) {
      setStats(JSON.parse(savedStats))
    }
  }, [])

  // Add a completed session
  useEffect(() => {
    if (currentSession?.mode === 'work') {
      const today = new Date().toISOString().split('T')[0]
      const focusTimeMinutes = Math.round(currentSession.duration / 60)
      
      setStats(prevStats => {
        const updatedStats = [...prevStats]
        const todayIndex = updatedStats.findIndex(stat => stat.date === today)
        
        if (todayIndex >= 0) {
          updatedStats[todayIndex].workSessions += 1
          updatedStats[todayIndex].totalFocusTime += focusTimeMinutes
        } else {
          updatedStats.push({
            date: today,
            workSessions: 1,
            totalFocusTime: focusTimeMinutes
          })
        }
        
        // Keep only last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const filtered = updatedStats.filter(stat => 
          new Date(stat.date) >= thirtyDaysAgo
        )
        
        localStorage.setItem('pomodoro-stats', JSON.stringify(filtered))
        return filtered
      })
    }
  }, [currentSession])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const totalSessions = stats.reduce((sum, stat) => sum + stat.workSessions, 0)
  const totalTime = stats.reduce((sum, stat) => sum + stat.totalFocusTime, 0)
  const avgSessionsPerDay = stats.length > 0 ? Math.round(totalSessions / stats.length * 10) / 10 : 0

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              Session Statistics
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              ×
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="p-6 border-b border-gray-100">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalSessions}</div>
              <div className="text-xs text-gray-500">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatTime(totalTime)}</div>
              <div className="text-xs text-gray-500">Focus Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{avgSessionsPerDay}</div>
              <div className="text-xs text-gray-500">Avg/Day</div>
            </div>
          </div>
        </div>

        {/* Daily History */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <Calendar size={16} />
              Recent Days
            </h3>
            
            {stats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock size={48} className="mx-auto mb-2 opacity-50" />
                <p>No sessions recorded yet</p>
                <p className="text-sm">Complete your first work session to see stats!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 10)
                  .map((stat) => (
                    <div key={stat.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-800">{formatDate(stat.date)}</div>
                        <div className="text-sm text-gray-500">
                          {stat.workSessions} session{stat.workSessions !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-800">{formatTime(stat.totalFocusTime)}</div>
                        <div className="text-sm text-gray-500">focus time</div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default SessionStats 