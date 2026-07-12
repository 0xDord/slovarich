import { useCallback } from 'react'
import WebApp from '@twa-dev/sdk'

type ImpactStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'
type NotificationType = 'error' | 'success' | 'warning'

export function useHaptics() {
  const impact = useCallback((style: ImpactStyle = 'light') => {
    try { WebApp.HapticFeedback?.impactOccurred(style) } catch { /* no-op */ }
  }, [])

  const notify = useCallback((type: NotificationType = 'success') => {
    try { WebApp.HapticFeedback?.notificationOccurred(type) } catch { /* no-op */ }
  }, [])

  const select = useCallback(() => {
    try { WebApp.HapticFeedback?.selectionChanged() } catch { /* no-op */ }
  }, [])

  return { impact, notify, select }
}
