import { X, RotateCcw } from 'lucide-react'
import type { AppSettings } from '../hooks/useSettings'

interface SettingsPanelProps {
  isOpen: boolean
  settings: AppSettings
  onClose: () => void
  onUpdateSettings: (settings: Partial<AppSettings>) => void
  onResetToDefaults: () => void
}

export const SettingsPanel = ({
  isOpen,
  settings,
  onClose,
  onUpdateSettings,
  onResetToDefaults
}: SettingsPanelProps) => {
  if (!isOpen) return null

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return 'Disabled'
    const minutes = Math.floor(seconds / 60)
    return `${minutes} min`
  }

  const handleDurationChange = (type: keyof typeof settings.durations, minutes: number) => {
    onUpdateSettings({
      durations: {
        ...settings.durations,
        [type]: minutes * 60
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Timer Durations */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Timer Durations</h3>
            <div className="space-y-4">
              {/* Work Duration */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    Work Session
                  </label>
                  <span className="text-sm text-gray-500">
                    {formatDuration(settings.durations.work)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="60"
                  step="5"
                  value={settings.durations.work / 60}
                  onChange={(e) => handleDurationChange('work', parseInt(e.target.value))}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer slider-red"
                />
              </div>

              {/* Short Break Duration */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-medium ${settings.durations.shortBreak === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                    Short Break
                  </label>
                  <span className={`text-sm ${settings.durations.shortBreak === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDuration(settings.durations.shortBreak)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="1"
                  value={settings.durations.shortBreak / 60}
                  onChange={(e) => handleDurationChange('shortBreak', parseInt(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${settings.durations.shortBreak === 0 ? 'bg-gray-300 slider-gray' : 'bg-green-200 slider-green'}`}
                />
              </div>

              {/* Long Break Duration */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className={`text-sm font-medium ${settings.durations.longBreak === 0 ? 'text-gray-400' : 'text-gray-700'}`}>
                    Long Break
                  </label>
                  <span className={`text-sm ${settings.durations.longBreak === 0 ? 'text-gray-400' : 'text-gray-500'}`}>
                    {formatDuration(settings.durations.longBreak)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={settings.durations.longBreak / 60}
                  onChange={(e) => handleDurationChange('longBreak', parseInt(e.target.value))}
                  className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${settings.durations.longBreak === 0 ? 'bg-gray-300 slider-gray' : 'bg-blue-200 slider-blue'}`}
                />
              </div>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Preferences</h3>
            <div className="space-y-4">
              {/* Auto Start */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Auto Start
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically start next timer after 3s delay
                  </p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ autoStart: !settings.autoStart })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.autoStart ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.autoStart ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Sound Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sound Notifications
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Play sound when timer completes
                  </p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Browser Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Browser Notifications
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Show browser notifications
                  </p>
                </div>
                <button
                  onClick={() => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    settings.notificationsEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                      settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 rounded-b-2xl border-t border-gray-200 p-6">
          <button
            onClick={onResetToDefaults}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <RotateCcw size={16} />
            <span className="text-sm">Reset to defaults</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel 