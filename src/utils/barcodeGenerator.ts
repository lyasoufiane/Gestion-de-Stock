import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';

export function renderBarcodeSvg(element: SVGSVGElement | null, text: string, format: 'CODE128' | 'EAN13' = 'CODE128') {
  if (!element || !text) return;
  try {
    JsBarcode(element, text, {
      format: format,
      width: 2,
      height: 50,
      displayValue: true,
      fontSize: 12,
      font: 'sans-serif',
      textMargin: 4,
      background: '#ffffff',
      lineColor: '#1e293b'
    });
  } catch (err) {
    console.warn('Barcode render error, fallback to CODE128:', err);
    try {
      JsBarcode(element, text, {
        format: 'CODE128',
        width: 2,
        height: 50,
        displayValue: true,
        fontSize: 12
      });
    } catch (e) {
      console.error('Final barcode render fail:', e);
    }
  }
}

export async function generateQrCodeDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      margin: 1,
      width: 200,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QR code generation error:', err);
    return '';
  }
}
