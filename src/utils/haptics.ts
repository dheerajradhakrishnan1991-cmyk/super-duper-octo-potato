export function triggerHaptic(style: 'light' | 'medium' | 'heavy' | 'success' | 'warning' = 'medium') {
  try {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      if (style === 'light') {
        navigator.vibrate(20);
      } else if (style === 'heavy') {
        navigator.vibrate(60);
      } else if (style === 'success') {
        navigator.vibrate([30, 40, 30]);
      } else if (style === 'warning') {
        navigator.vibrate([40, 50, 40]);
      } else {
        navigator.vibrate(35);
      }
    }
  } catch {
    // Gracefully ignore if vibration is unsupported or disabled by browser
  }
}

export async function shareContent(title: string, text: string, url: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        // Fallback to clipboard
        await copyToClipboard(url);
        return true;
      }
      return false;
    }
  }
  // Fallback to copying url
  return copyToClipboard(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
