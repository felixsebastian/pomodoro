import { useState, useEffect, useCallback } from 'react'
import type { TimerDurations } from './usePomodoroCycle'

export interface AppSettings {
  durations: TimerDurations
  autoStart: boolean
  soundEnabled: boolean
  notificationsEnabled: boolean
}

export interface UseSettingsReturn {
  settings: AppSettings
  updateSettings: (newSettings: Partial<AppSettings>) => void
  resetToDefaults: () => void
  isLoading: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  durations: {
    work: 25 * 60,        // 25 minutes
    shortBreak: 5 * 60,   // 5 minutes
    longBreak: 15 * 60    // 15 minutes
  },
  autoStart: false,
  soundEnabled: true,
  notificationsEnabled: true
}

const STORAGE_KEY = 'pomodoro-settings'

export const useSettings = (): UseSettingsReturn => {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoading, setIsLoading] = useState(true)

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY)
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
      } catch (error) {
        console.warn('Failed to save settings to localStorage:', error)
      }
    }
  }, [settings, isLoading])

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }))
  }, [])

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS)
  }, [])

  return {
    settings,
    updateSettings,
    resetToDefaults,
    isLoading
  }
} 