import { useState, useCallback } from 'react'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export interface TimerDurations {
  work: number
  shortBreak: number
  longBreak: number
}

export interface UsePomodoroCycleProps {
  durations?: TimerDurations
  onModeChange?: (mode: TimerMode, duration: number) => void
}

export interface UsePomodoroCycleReturn {
  currentMode: TimerMode
  workSessionsCompleted: number
  durations: TimerDurations
  switchMode: (mode: TimerMode) => void
  completeCurrentSession: () => void
  resetCycle: () => void
  getCurrentDuration: () => number
  getProgress: (timeLeft: number) => number
}

const DEFAULT_DURATIONS: TimerDurations = {
  work: 25 * 60,           // 25 minutes
  shortBreak: 5 * 60,      // 5 minutes  
  longBreak: 15 * 60       // 15 minutes
}

export const usePomodoroCycle = ({ 
  durations = DEFAULT_DURATIONS,
  onModeChange
}: UsePomodoroCycleProps = {}): UsePomodoroCycleReturn => {
  const [currentMode, setCurrentMode] = useState<TimerMode>('work')
  const [workSessionsCompleted, setWorkSessionsCompleted] = useState(0)

  const getCurrentDuration = useCallback(() => {
    return durations[currentMode]
  }, [currentMode, durations])

  const getProgress = useCallback((timeLeft: number): number => {
    const total = getCurrentDuration()
    return ((total - timeLeft) / total) * 100
  }, [getCurrentDuration])

  const switchMode = useCallback((mode: TimerMode) => {
    setCurrentMode(mode)
    const duration = durations[mode]
    onModeChange?.(mode, duration)
  }, [durations, onModeChange])

  const completeCurrentSession = useCallback(() => {
    if (currentMode === 'work') {
      const newSessionsCompleted = workSessionsCompleted + 1
      setWorkSessionsCompleted(newSessionsCompleted)
      
      // Determine what the next break should be
      let nextBreakMode: TimerMode
      if (newSessionsCompleted % 4 === 0) {
        nextBreakMode = 'longBreak'
      } else {
        nextBreakMode = 'shortBreak'
      }
      
      // If the next break is disabled (duration is 0), skip directly to work
      if (durations[nextBreakMode] === 0) {
        switchMode('work')
      } else {
        switchMode(nextBreakMode)
      }
    } else {
      // Break is over, back to work
      switchMode('work')
    }
  }, [currentMode, workSessionsCompleted, switchMode, durations])

  const resetCycle = useCallback(() => {
    setWorkSessionsCompleted(0)
    switchMode('work')
  }, [switchMode])

  return {
    currentMode,
    workSessionsCompleted,
    durations,
    switchMode,
    completeCurrentSession,
    resetCycle,
    getCurrentDuration,
    getProgress
  }
} 