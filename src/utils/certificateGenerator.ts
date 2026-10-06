import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CertificateTemplate, Participant, FieldConfig } from '../types';

/**
 * Render participant name onto a high-resolution transparent canvas
 * to preserve 100% flawless Arabic shaping, ligatures, and calligraphy styling.
 */
export function renderNameToCanvas(
  name: string,
  fieldConfig: FieldConfig,
  boxWidthPx: number,
  boxHeightPx: number,
  dpr: number = 3
): string {
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(10, Math.round(boxWidthPx * dpr));
  canvas.height = Math.max(10, Math.round(boxHeightPx * dpr));

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('فشل تهيئة سياق الرسم للشهادة');
  }

  // Clear transparent
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Full name with prefix/suffix
  const fullText = `${fieldConfig.prefix || ''}${name}${fieldConfig.suffix || ''}`.trim();

  // Scaled font size
  const scaledFontSize = Math.round(fieldConfig.fontSize * dpr);
  ctx.font = `${fieldConfig.fontWeight || '700'} ${scaledFontSize}px ${fieldConfig.fontFamily}`;
  ctx.fillStyle = fieldConfig.fontColor;
  ctx.textBaseline = 'middle';

  // Text alignment
  let x = canvas.width / 2;
  ctx.textAlign = 'center';

  if (fieldConfig.textAlign === 'right') {
    ctx.textAlign = 'right';
    x = canvas.width - (15 * dpr);
  } else if (fieldConfig.textAlign === 'left') {
    ctx.textAlign = 'left';
    x = 15 * dpr;
  }

  const y = canvas.height / 2;
  ctx.fillText(fullText, x, y);

  return canvas.toDataURL('image/png');
}

/**
 * Helper to convert Uint8Array to base64 string safely without stack overflow
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  return window.btoa(binary);
}

/**
 * Check if byte array starts with valid %PDF header
 */
export function isValidPdfBytes(bytes?: Uint8Array): boolean {
  if (!bytes || bytes.length < 4) return false;
  return (
    bytes[0] === 0x25 && // %
    bytes[1] === 0x50 && // P
    bytes[2] === 0x44 && // D
    bytes[3] === 0x46    // F
  );
}

/**
 * Generate a single PDF certificate for a participant
 */
export async function generateSingleCertificatePdf(
  template: CertificateTemplate,
  participant: Participant,
  fieldConfig: FieldConfig
): Promise<Uint8Array> {
  // Determine reference dimensions
  let pageWidth = template.width || 1600;
  let pageHeight = template.height || 1131;

  // Render text image overlay
  const boxWidthPx = (fieldConfig.widthPercent / 100) * pageWidth;
  const boxHeightPx = (fieldConfig.heightPercent / 100) * pageHeight;
  const textPngDataUrl = renderNameToCanvas(participant.name, fieldConfig, boxWidthPx, boxHeightPx, 3);
  const textPngBytes = Uint8Array.from(atob(textPngDataUrl.split(',')[1]), c => c.charCodeAt(0));

  let pdfDoc: PDFDocument | null = null;

  // 1. If it's a PDF with a valid header, try modifying the PDF directly
  if (template.type === 'pdf' && isValidPdfBytes(template.pdfBytes)) {
    try {
      pdfDoc = await PDFDocument.load(template.pdfBytes!);
      const page = pdfDoc.getPages()[0];
      const size = page.getSize();
      pageWidth = size.width;
      pageHeight = size.height;

      const embeddedText = await pdfDoc.embedPng(textPngBytes);

      const x = (fieldConfig.xPercent / 100) * pageWidth;
      const width = (fieldConfig.widthPercent / 100) * pageWidth;
      const height = (fieldConfig.heightPercent / 100) * pageHeight;
      // PDF coordinate system origin is bottom-left
      const y = pageHeight - ((fieldConfig.yPercent / 100) * pageHeight) - height;

      page.drawImage(embeddedText, { x, y, width, height });
    } catch (err) {
      console.warn('PDFDocument.load failed, falling back to raster image embedding:', err);
      pdfDoc = null;
    }
  }

  // 2. Fallback or Image/SVG Template: Create a fresh PDF document
  if (!pdfDoc) {
    pdfDoc = await PDFDocument.create();

    let bgPngDataUrl: string;
    if (template.dataUrl.startsWith('data:image/svg+xml') || template.type === 'svg') {
      bgPngDataUrl = await rasterizeSvgToPng(template.dataUrl, pageWidth, pageHeight);
    } else {
      bgPngDataUrl = template.dataUrl;
    }

    const isPng = !bgPngDataUrl.includes('image/jpeg') && !bgPngDataUrl.includes('image/jpg');
    const bgBase64 = bgPngDataUrl.split(',')[1] || '';
    const bgImgBytes = Uint8Array.from(atob(bgBase64), c => c.charCodeAt(0));

    const embeddedBg = isPng ? await pdfDoc.embedPng(bgImgBytes) : await pdfDoc.embedJpg(bgImgBytes);
    const page = pdfDoc.addPage([embeddedBg.width, embeddedBg.height]);

    // Draw background
    page.drawImage(embeddedBg, {
      x: 0,
      y: 0,
      width: embeddedBg.width,
      height: embeddedBg.height,
    });

    // Draw text overlay
    const embeddedText = await pdfDoc.embedPng(textPngBytes);
    const x = (fieldConfig.xPercent / 100) * embeddedBg.width;
    const width = (fieldConfig.widthPercent / 100) * embeddedBg.width;
    const height = (fieldConfig.heightPercent / 100) * embeddedBg.height;
    const y = embeddedBg.height - ((fieldConfig.yPercent / 100) * embeddedBg.height) - height;

    page.drawImage(embeddedText, { x, y, width, height });
  }

  return await pdfDoc.save();
}

/**
 * Helper to convert SVG Data URL to high-resolution PNG data URL
 */
export function rasterizeSvgToPng(svgDataUrl: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width || 1600;
      canvas.height = height || 1131;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context failed'));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/png', 0.95));
    };
    img.onerror = () => reject(new Error('فشل تحويل قالب SVG إلى صورة'));
    img.src = svgDataUrl;
  });
}

/**
 * Generate all certificates and bundle them into a single ZIP file
 */
export async function generateAllCertificatesZip(
  template: CertificateTemplate,
  participants: Participant[],
  fieldConfig: FieldConfig,
  onProgress: (completed: number, total: number, currentName: string) => void
): Promise<Blob> {
  const zip = new JSZip();
  const total = participants.length;

  for (let i = 0; i < total; i++) {
    const p = participants[i];
    onProgress(i, total, p.name);

    // Yield control briefly to ensure UI progress bar animates smoothly
    await new Promise(r => setTimeout(r, 10));

    const pdfBytes = await generateSingleCertificatePdf(template, p, fieldConfig);

    // Create safe filename
    const safeName = p.name.replace(/[/\\?%*:|"<>]/g, '_').trim() || `شهادة_${i + 1}`;
    const filename = `${safeName}.pdf`;

    zip.file(filename, pdfBytes);
  }

  onProgress(total, total, 'جاري ضغط وتجهيز ملف الـ ZIP...');

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return zipBlob;
}

/**
 * Trigger download of generated ZIP or file
 */
export function triggerFileDownload(blob: Blob, filename: string) {
  saveAs(blob, filename);
}
