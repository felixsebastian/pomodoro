import { Play, Pause, RotateCcw, Settings, BarChart3 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTimer, usePomodoroCycle, useNotifications, useSettings, useAutoRollover } from './hooks'
import type { TimerMode } from './hooks'
import SettingsPanel from './components/SettingsPanel'
import TransitionOverlay from './components/TransitionOverlay'
import SessionStats from './components/SessionStats'

function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isStatsOpen, setIsStatsOpen] = useState(false)
  const [nextMode, setNextMode] = useState<TimerMode>('work')
  const [completedSession, setCompletedSession] = useState<{
    mode: TimerMode
    duration: number
  } | null>(null)
  
  const { settings, updateSettings, resetToDefaults, isLoading } = useSettings()
  const { playNotificationSound, showNotification, requestNotificationPermission } = useNotifications()
  
  const pomodoroCycle = usePomodoroCycle({
    durations: settings.durations,
    onModeChange: (mode, duration) => {
      timer.setTime(duration)
      setNextMode(mode)
    }
  })

  const autoRollover = useAutoRollover({
    enabled: settings.autoStart,
    onComplete: () => {
      timer.start()
    }
  })

  const timer = useTimer({
    initialTime: pomodoroCycle.getCurrentDuration(),
    onComplete: () => {
      // Handle timer completion
      if (settings.soundEnabled) {
        playNotificationSound()
      }
      if (settings.notificationsEnabled) {
        showNotification(pomodoroCycle.currentMode)
      }
      
      // Track completed session for stats
      setCompletedSession({
        mode: pomodoroCycle.currentMode,
        duration: pomodoroCycle.getCurrentDuration()
      })
      
      // Get the next mode before completing the session
      const currentMode = pomodoroCycle.currentMode
      let nextSessionMode: TimerMode = 'work'
      
      if (currentMode === 'work') {
        const nextSessionsCompleted = pomodoroCycle.workSessionsCompleted + 1
        const intendedBreakMode: TimerMode = nextSessionsCompleted % 4 === 0 ? 'longBreak' : 'shortBreak'
        
        // If the intended break is disabled (duration is 0), skip directly to work
        if (settings.durations[intendedBreakMode] === 0) {
          nextSessionMode = 'work'
        } else {
          nextSessionMode = intendedBreakMode
        }
      } else {
        nextSessionMode = 'work'
      }
      
      setNextMode(nextSessionMode)
      pomodoroCycle.completeCurrentSession()
      
      // Start auto-rollover if enabled
      if (settings.autoStart) {
        autoRollover.startTransition()
      }
    }
  })

  // Request notification permission on first interaction
  const handleFirstInteraction = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await requestNotificationPermission()
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Only handle spacebar if not in an input field and settings are closed
      if (event.code === 'Space' && !isSettingsOpen && !isStatsOpen && !autoRollover.isInTransition) {
        const activeElement = document.activeElement
        const isInInput = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA'
        
        if (!isInInput) {
          event.preventDefault()
          if (timer.isRunning) {
            timer.pause()
          } else {
            handleStart()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [timer.isRunning, isSettingsOpen, isStatsOpen, autoRollover.isInTransition])

  // Auto-switch away from disabled break modes
  useEffect(() => {
    const currentMode = pomodoroCycle.currentMode
    if ((currentMode === 'shortBreak' && settings.durations.shortBreak === 0) ||
        (currentMode === 'longBreak' && settings.durations.longBreak === 0)) {
      pomodoroCycle.switchMode('work')
    }
  }, [settings.durations, pomodoroCycle.currentMode, pomodoroCycle.switchMode])

  // Update timer when duration settings change for the current mode
  useEffect(() => {
    // Only update if timer is not running to avoid interrupting active sessions
    if (!timer.isRunning) {
      const newDuration = pomodoroCycle.getCurrentDuration()
      timer.setTime(newDuration)
    }
  }, [settings.durations, pomodoroCycle.currentMode, pomodoroCycle.getCurrentDuration, timer.setTime, timer.isRunning])

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    handleFirstInteraction()
    timer.start()
  }

  const handleReset = () => {
    timer.reset()
    autoRollover.cancelTransition()
  }

  const handleModeSwitch = (mode: TimerMode) => {
    autoRollover.cancelTransition()
    pomodoroCycle.switchMode(mode)
  }

  const handleSettingsOpen = () => {
    setIsSettingsOpen(true)
  }

  const handleSettingsClose = () => {
    setIsSettingsOpen(false)
  }

  const handleStatsOpen = () => {
    setIsStatsOpen(true)
  }

  const handleStatsClose = () => {
    setIsStatsOpen(false)
    // Clear the completed session after stats have been updated
    setCompletedSession(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    )
  }

  const modeConfig = {
    work: {
      title: 'Focus Time',
      subtitle: 'Time to get things done',
      gradient: 'from-red-500 via-pink-500 to-purple-600',
      bgGradient: 'from-red-50 via-pink-50 to-purple-50',
      buttonGradient: 'from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700',
      accentColor: 'text-red-600'
    },
    shortBreak: {
      title: 'Short Break',
      subtitle: 'Take a quick breather',
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
      buttonGradient: 'from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
      accentColor: 'text-green-600'
    },
    longBreak: {
      title: 'Long Break',
      subtitle: 'You deserve a longer rest',
      gradient: 'from-blue-500 via-indigo-500 to-purple-600',
      bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
      buttonGradient: 'from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700',
      accentColor: 'text-blue-600'
    }
  }

  const config = modeConfig[pomodoroCycle.currentMode]

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-all duration-1000`}>
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-2">Pomodoro</h1>
          <p className="text-gray-600 text-base sm:text-lg">Stay focused, stay productive</p>
          {settings.autoStart && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Auto-start enabled • Timers will start automatically
            </p>
          )}
        </div>

        {/* Main Timer Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20">
          {/* Mode Header */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className={`text-xl sm:text-2xl font-bold ${config.accentColor} mb-1`}>
              {config.title}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm">{config.subtitle}</p>
          </div>

          {/* Circular Progress */}
          <div className={`relative mx-auto mb-6 sm:mb-8 w-48 h-48 sm:w-64 sm:h-64 transition-all duration-300 ${timer.isRunning ? 'scale-105' : 'scale-100'}`}>
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-gray-200"
              />
              {/* Progress Circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - pomodoroCycle.getProgress(timer.timeLeft) / 100)}`}
                className={`transition-all duration-300 ease-out ${timer.isRunning ? 'animate-pulse' : ''}`}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={`${config.gradient.includes('red') ? 'stop-red-500' : config.gradient.includes('green') ? 'stop-green-500' : 'stop-blue-500'}`} />
                  <stop offset="100%" className={`${config.gradient.includes('purple') ? 'stop-purple-600' : config.gradient.includes('teal') ? 'stop-teal-600' : 'stop-indigo-600'}`} />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Timer Display */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-3xl sm:text-4xl lg:text-5xl font-mono font-bold text-gray-800 mb-1 sm:mb-2 transition-all duration-200 ${timer.isRunning ? 'text-gray-900' : 'text-gray-800'}`}>
                  {formatTime(timer.timeLeft)}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">
                  {pomodoroCycle.currentMode === 'work' ? 'Focus' : 'Break'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
            <button
              onClick={timer.isRunning ? timer.pause : handleStart}
              disabled={autoRollover.isInTransition}
              className={`bg-gradient-to-r ${config.buttonGradient} text-white p-3 sm:p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              title="Spacebar to start/pause"
            >
              {timer.isRunning ? <Pause size={20} className="sm:w-6 sm:h-6" /> : <Play size={20} className="sm:w-6 sm:h-6" />}
            </button>
            
            <button
              onClick={handleReset}
              disabled={autoRollover.isInTransition}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 sm:p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Reset timer"
            >
              <RotateCcw size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            <button 
              onClick={handleSettingsOpen}
              disabled={autoRollover.isInTransition}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 sm:p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Open settings"
            >
              <Settings size={20} className="sm:w-6 sm:h-6" />
            </button>

            <button 
              onClick={handleStatsOpen}
              disabled={autoRollover.isInTransition}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 sm:p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="View statistics"
            >
              <BarChart3 size={20} className="sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Session Progress Indicator */}
          <div className="flex justify-center items-center space-x-2 mb-3 sm:mb-4">
            <span className="text-xs sm:text-sm text-gray-600">Session:</span>
            {[1, 2, 3, 4].map((session) => (
              <div
                key={session}
                className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${
                  session <= pomodoroCycle.workSessionsCompleted % 4 || (pomodoroCycle.workSessionsCompleted % 4 === 0 && pomodoroCycle.workSessionsCompleted > 0)
                    ? config.accentColor.replace('text-', 'bg-')
                    : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="text-xs sm:text-sm text-gray-500 ml-2">
              {pomodoroCycle.workSessionsCompleted} completed
            </span>
          </div>

          {/* Mode Selector */}
          <div className="flex justify-center space-x-1 sm:space-x-2">
            <button
              onClick={() => handleModeSwitch('work')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 border-2 ${
                pomodoroCycle.currentMode === 'work'
                  ? 'bg-red-100 text-red-700 border-red-200'
                  : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
              }`}
            >
              Work
            </button>
            <button
              onClick={() => handleModeSwitch('shortBreak')}
              disabled={settings.durations.shortBreak === 0}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 border-2 ${
                settings.durations.shortBreak === 0
                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                  : pomodoroCycle.currentMode === 'shortBreak'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => handleModeSwitch('longBreak')}
              disabled={settings.durations.longBreak === 0}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors duration-200 border-2 ${
                settings.durations.longBreak === 0
                  ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                  : pomodoroCycle.currentMode === 'longBreak'
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-gray-100 text-gray-600 border-transparent hover:bg-gray-200'
              }`}
            >
              Long Break
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-gray-500 text-xs sm:text-sm">
            Built with focus and attention to detail
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Press spacebar to start/pause
          </p>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        settings={settings}
        onClose={handleSettingsClose}
        onUpdateSettings={updateSettings}
        onResetToDefaults={resetToDefaults}
      />

      {/* Transition Overlay */}
      <TransitionOverlay
        isVisible={autoRollover.isInTransition}
        secondsLeft={autoRollover.secondsLeft}
        nextMode={nextMode}
        onCancel={autoRollover.cancelTransition}
      />

      {/* Session Stats */}
      <SessionStats
        isOpen={isStatsOpen}
        currentSession={completedSession}
        onClose={handleStatsClose}
      />
    </div>
  )
}

export default App 
