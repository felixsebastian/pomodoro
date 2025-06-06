import { useState, useEffect, useRef, useCallback } from 'react'

export interface UseAutoRolloverProps {
  enabled: boolean
  onComplete: () => void
  delay?: number
}

export interface UseAutoRolloverReturn {
  isInTransition: boolean
  secondsLeft: number
  startTransition: () => void
  cancelTransition: () => void
}

export const useAutoRollover = ({ 
  enabled, 
  onComplete, 
  delay = 3 
}: UseAutoRolloverProps): UseAutoRolloverReturn => {
  const [isInTransition, setIsInTransition] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(delay)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const cleanup = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const startTransition = useCallback(() => {
    if (!enabled) {
      onComplete()
      return
    }

    setIsInTransition(true)
    setSecondsLeft(delay)

    // Countdown interval
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          cleanup()
          setIsInTransition(false)
          onComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Fallback timeout in case interval fails
    timeoutRef.current = setTimeout(() => {
      cleanup()
      setIsInTransition(false)
      onComplete()
    }, delay * 1000)
  }, [enabled, onComplete, delay, cleanup])

  const cancelTransition = useCallback(() => {
    cleanup()
    setIsInTransition(false)
    setSecondsLeft(delay)
  }, [cleanup, delay])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    isInTransition,
    secondsLeft,
    startTransition,
    cancelTransition
  }
} 