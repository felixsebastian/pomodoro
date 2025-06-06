import { useCallback } from 'react'

export type TimerMode = 'work' | 'shortBreak' | 'longBreak'

export interface UseNotificationsReturn {
  playNotificationSound: () => void
  showNotification: (mode: TimerMode) => void
  requestNotificationPermission: () => Promise<NotificationPermission>
}

export const useNotifications = (): UseNotificationsReturn => {
  const playNotificationSound = useCallback(() => {
    try {
      // Create a simple beep sound using Web Audio API
      const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const audioContext = new AudioContextClass()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    } catch (error) {
      console.warn('Could not play notification sound:', error)
    }
  }, [])

  const showNotification = useCallback((mode: TimerMode) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = mode === 'work' ? 'Work Session Complete!' : 'Break Time Over!'
      const body = mode === 'work' 
        ? 'Time for a well-deserved break!' 
        : 'Ready to get back to work?'
      
      new Notification(title, {
        body,
        icon: '/favicon.ico'
      })
    }
  }, [])

  const requestNotificationPermission = useCallback(async (): Promise<NotificationPermission> => {
    if ('Notification' in window && Notification.permission === 'default') {
      return await Notification.requestPermission()
    }
    return Notification.permission
  }, [])

  return {
    playNotificationSound,
    showNotification,
    requestNotificationPermission
  }
} 