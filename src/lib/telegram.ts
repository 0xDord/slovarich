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

export function applyThemeParams(): void {
  // Brand palette is forced via :root tokens in src/index.css.
  // Intentionally a no-op so Telegram's themeParams cannot override brand colors.
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
