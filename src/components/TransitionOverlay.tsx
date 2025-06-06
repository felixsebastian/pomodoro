import { X } from 'lucide-react'
import type { TimerMode } from '../hooks'

interface TransitionOverlayProps {
  isVisible: boolean
  secondsLeft: number
  nextMode: TimerMode
  onCancel: () => void
}

export const TransitionOverlay = ({
  isVisible,
  secondsLeft,
  nextMode,
  onCancel
}: TransitionOverlayProps) => {
  if (!isVisible) return null

  const modeConfig = {
    work: {
      title: 'Work Session',
      message: 'Time to focus and get things done!',
      bgGradient: 'from-red-500/20 via-pink-500/20 to-purple-600/20',
      accentColor: 'text-red-600',
      progressColor: 'stroke-red-500'
    },
    shortBreak: {
      title: 'Short Break',
      message: 'Take a quick breather and relax',
      bgGradient: 'from-green-500/20 via-emerald-500/20 to-teal-600/20',
      accentColor: 'text-green-600',
      progressColor: 'stroke-green-500'
    },
    longBreak: {
      title: 'Long Break',
      message: 'You deserve a longer rest period',
      bgGradient: 'from-blue-500/20 via-indigo-500/20 to-purple-600/20',
      accentColor: 'text-blue-600',
      progressColor: 'stroke-blue-500'
    }
  }

  const config = modeConfig[nextMode]
  const progress = ((3 - secondsLeft) / 3) * 100

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center p-4">
      <div className={`bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20 max-w-md w-full text-center relative`}>
        {/* Cancel Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
        >
          <X size={20} className="text-gray-600" />
        </button>

        {/* Countdown Circle */}
        <div className="relative mx-auto mb-6 w-24 h-24">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200"
            />
            {/* Progress Circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
              className={`${config.progressColor} transition-all duration-300 ease-out`}
            />
          </svg>
          
          {/* Countdown Number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">
              {secondsLeft}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className={`text-2xl font-bold ${config.accentColor}`}>
            Starting {config.title}
          </h2>
          <p className="text-gray-600 text-lg">
            {config.message}
          </p>
          <p className="text-sm text-gray-500">
            Timer will start automatically in {secondsLeft} second{secondsLeft !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ease-out ${
              nextMode === 'work' ? 'bg-red-500' :
              nextMode === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export default TransitionOverlay 