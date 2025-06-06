import { Play, Pause, RotateCcw, Settings } from 'lucide-react'
import { useTimer, usePomodoroCycle, useNotifications } from './hooks'
import type { TimerMode } from './hooks'

function App() {
  const { playNotificationSound, showNotification, requestNotificationPermission } = useNotifications()
  
  const pomodoroCycle = usePomodoroCycle({
    onModeChange: (mode, duration) => {
      timer.setTime(duration)
    }
  })

  const timer = useTimer({
    initialTime: pomodoroCycle.getCurrentDuration(),
    onComplete: () => {
      // Handle timer completion
      playNotificationSound()
      showNotification(pomodoroCycle.currentMode)
      pomodoroCycle.completeCurrentSession()
    }
  })

  // Request notification permission on first interaction
  const handleFirstInteraction = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await requestNotificationPermission()
    }
  }

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
  }

  const handleModeSwitch = (mode: TimerMode) => {
    pomodoroCycle.switchMode(mode)
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
    <div className={`min-h-screen bg-gradient-to-br ${config.bgGradient} flex items-center justify-center p-4 transition-all duration-1000`}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Pomodoro</h1>
          <p className="text-gray-600 text-lg">Stay focused, stay productive</p>
        </div>

        {/* Main Timer Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
          {/* Mode Header */}
          <div className="text-center mb-8">
            <h2 className={`text-2xl font-bold ${config.accentColor} mb-1`}>
              {config.title}
            </h2>
            <p className="text-gray-500 text-sm">{config.subtitle}</p>
          </div>

          {/* Circular Progress */}
          <div className="relative mx-auto mb-8 w-64 h-64">
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
                className="transition-all duration-300 ease-out"
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
                <div className="text-5xl font-mono font-bold text-gray-800 mb-2">
                  {formatTime(timer.timeLeft)}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-wider">
                  {pomodoroCycle.currentMode === 'work' ? 'Focus' : 'Break'}
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center space-x-4 mb-6">
            <button
              onClick={timer.isRunning ? timer.pause : handleStart}
              className={`bg-gradient-to-r ${config.buttonGradient} text-white p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95`}
            >
              {timer.isRunning ? <Pause size={24} /> : <Play size={24} />}
            </button>
            
            <button
              onClick={handleReset}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <RotateCcw size={24} />
            </button>
            
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-4 rounded-full shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95">
              <Settings size={24} />
            </button>
          </div>

          {/* Session Progress Indicator */}
          <div className="flex justify-center items-center space-x-2 mb-4">
            <span className="text-sm text-gray-600">Session:</span>
            {[1, 2, 3, 4].map((session) => (
              <div
                key={session}
                className={`w-3 h-3 rounded-full ${
                  session <= pomodoroCycle.workSessionsCompleted % 4 || (pomodoroCycle.workSessionsCompleted % 4 === 0 && pomodoroCycle.workSessionsCompleted > 0)
                    ? config.accentColor.replace('text-', 'bg-')
                    : 'bg-gray-200'
                }`}
              />
            ))}
            <span className="text-sm text-gray-500 ml-2">
              {pomodoroCycle.workSessionsCompleted} completed
            </span>
          </div>

          {/* Mode Selector */}
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleModeSwitch('work')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                pomodoroCycle.currentMode === 'work'
                  ? 'bg-red-100 text-red-700 border-2 border-red-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Work
            </button>
            <button
              onClick={() => handleModeSwitch('shortBreak')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                pomodoroCycle.currentMode === 'shortBreak'
                  ? 'bg-green-100 text-green-700 border-2 border-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Short Break
            </button>
            <button
              onClick={() => handleModeSwitch('longBreak')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                pomodoroCycle.currentMode === 'longBreak'
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Long Break
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm">
            Built with focus and attention to detail
          </p>
        </div>
      </div>
    </div>
  )
}

export default App 
