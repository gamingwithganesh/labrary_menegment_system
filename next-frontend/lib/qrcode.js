import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(textOrObj) {
  try {
    const payload = typeof textOrObj === 'object' ? JSON.stringify(textOrObj) : String(textOrObj);
    const dataUrl = await QRCode.toDataURL(payload, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR Code:', err);
    return null;
  }
}
