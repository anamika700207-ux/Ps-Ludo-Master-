/**
 * Safe Mobile Haptic Feedback Utility for PS Ludo Master
 */

let isHapticsEnabled = true;

try {
  const saved = localStorage.getItem('ps_ludo_vibration_v1');
  if (saved !== null) {
    isHapticsEnabled = saved === 'true';
  }
} catch {}

export function setHapticsEnabled(enabled: boolean) {
  isHapticsEnabled = enabled;
  try {
    localStorage.setItem('ps_ludo_vibration_v1', String(enabled));
  } catch {}
}

export function getHapticsEnabled(): boolean {
  return isHapticsEnabled;
}

export type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'capture' | 'save';

export function triggerHaptic(type: HapticType = 'light') {
  if (!isHapticsEnabled) return;
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.vibrate) return;

  try {
    switch (type) {
      case 'light':
      case 'selection':
        navigator.vibrate(15);
        break;
      case 'medium':
        navigator.vibrate(30);
        break;
      case 'save':
        navigator.vibrate([20, 30, 25]);
        break;
      case 'capture':
      case 'heavy':
        navigator.vibrate([40, 30, 60]);
        break;
      case 'success':
        navigator.vibrate([30, 40, 50, 40, 80]);
        break;
      default:
        navigator.vibrate(20);
        break;
    }
  } catch {
    // Graceful fallback on devices that block vibration
  }
}
