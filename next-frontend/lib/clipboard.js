/**
 * Universal safe copy-to-clipboard utility that works across:
 * - HTTPS secure contexts
 * - HTTP local network IPs (e.g. http://192.168.x.x:3000, http://192.0.0.2:3000)
 * - Restrictive browsers and legacy environments
 */
export async function copyToClipboard(text) {
  if (text === undefined || text === null) return false;
  const str = String(text);

  // 1. Try modern navigator.clipboard if available in secure context
  try {
    if (typeof navigator !== 'undefined' && navigator?.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(str);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard.writeText failed, falling back to execCommand:', err);
  }

  // 2. Robust fallback using hidden textarea + document.execCommand('copy')
  try {
    if (typeof document !== 'undefined') {
      const textArea = document.createElement('textarea');
      textArea.value = str;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      textArea.style.zIndex = '-9999';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, str.length);

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (err) {
    console.error('Fallback clipboard copy failed:', err);
  }

  return false;
}
