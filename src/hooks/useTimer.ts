import { useState, useEffect, useRef } from 'react'

export interface UseTimerProps {
  initialTime: number
  onComplete?: () => void
}

export interface UseTimerReturn {
  timeLeft: number
  isRunning: boolean
  start: () => void
  pause: () => void
  reset: () => void
  setTime: (time: number) => void
}

export const useTimer = ({ initialTime, onComplete }: UseTimerProps): UseTimerReturn => {
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Countdown timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, timeLeft])

  // Handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      onComplete?.()
    }
  }, [timeLeft, isRunning, onComplete])

  const start = () => {
    setIsRunning(true)
  }

  const pause = () => {
    setIsRunning(false)
  }

  const reset = () => {
    setIsRunning(false)
    setTimeLeft(initialTime)
  }

  const setTime = (time: number) => {
    setIsRunning(false)
    setTimeLeft(time)
  }

  return {
    timeLeft,
    isRunning,
    start,
    pause,
    reset,
    setTime
  }
} 