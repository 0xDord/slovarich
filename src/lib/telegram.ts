import WebApp from '@twa-dev/sdk'

let ready = false

export function initTelegram(): boolean {
  if (ready) return true
  if (typeof window === 'undefined') return false

  try {
    WebApp.ready()
    ready = true
  } catch (e) {
    console.warn('[telegram] ready() failed:', e)
    return false
  }

  try { WebApp.expand() } catch (e) { console.warn('[telegram] expand() failed:', e) }

  try {
    WebApp.disableVerticalSwipes()
  } catch (e) {
    // older clients don't have this method
  }

  applyThemeParams()
  return true
}

export function restoreVerticalSwipes() {
  if (!ready) return
  try { WebApp.enableVerticalSwipes() } catch { /* ignore */ }
}

export function applyThemeParams() {
  if (typeof document === 'undefined') return
  const tp = WebApp.themeParams
  if (!tp) return

  const root = document.documentElement
  const map: Array<[keyof typeof tp, string]> = [
    ['bg_color', '--tg-theme-bg-color'],
    ['text_color', '--tg-theme-text-color'],
    ['hint_color', '--tg-theme-hint-color'],
    ['button_color', '--tg-theme-button-color'],
    ['button_text_color', '--tg-theme-button-text-color'],
    ['secondary_bg_color', '--tg-theme-secondary-bg-color'],
    ['link_color', '--tg-theme-link-color'],
  ]
  for (const [tgKey, cssVar] of map) {
    const value = tp[tgKey]
    if (typeof value === 'string' && value) {
      root.style.setProperty(cssVar, value)
    }
  }
}

export function onThemeChanged(cb: () => void): () => void {
  if (!ready) return () => {}
  try {
    WebApp.onEvent('themeChanged', cb)
    return () => {
      try { WebApp.offEvent('themeChanged', cb) } catch { /* ignore */ }
    }
  } catch {
    return () => {}
  }
}
