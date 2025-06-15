import QRCode from 'qrcode';
import crypto from 'crypto';

export function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateQRData(): string {
  return `QR-${Date.now()}-${crypto.randomBytes(8).toString('hex')}`;
}

export async function generateQRCodeImage(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });
    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

export function validateQRCode(code: string): boolean {
  // Basic validation for QR code format
  return /^QR-\d+-[a-f0-9]{16}$/.test(code);
}

export function validatePin(pin: string): boolean {
  // Validate 4-digit PIN
  return /^\d{4}$/.test(pin);
}