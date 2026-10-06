import * as pdfjsLib from 'pdfjs-dist';

// Ensure worker is configured
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Use unpkg or cdnjs corresponding to installed pdfjs-dist version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

export interface RenderedPdfPage {
  dataUrl: string;
  width: number;
  height: number;
  aspectRatio: number;
  pdfBytes: Uint8Array;
}

/**
 * Loads a PDF file and renders its first page to a high-resolution image data URL
 */
export async function renderPdfFirstPage(file: File): Promise<RenderedPdfPage> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);

  const loadingTask = pdfjsLib.getDocument({
    data: pdfBytes,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
    cMapPacked: true,
  });

  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(1);

  // Render at scale 2 for crisp preview
  const viewport = page.getViewport({ scale: 2.0 });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) {
    throw new Error('فشل إنشاء سياق رسم الـ Canvas');
  }

  // Draw white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport,
  };

  // @ts-ignore
  await page.render(renderContext).promise;

  const dataUrl = canvas.toDataURL('image/png', 0.95);

  return {
    dataUrl,
    width: viewport.width / 2, // Original PDF points
    height: viewport.height / 2,
    aspectRatio: viewport.width / viewport.height,
    pdfBytes,
  };
}

/**
 * Loads an image file (PNG/JPG/WEBP) and gets its data URL and dimensions
 */
export async function renderImageFile(file: File): Promise<RenderedPdfPage> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfBytes = new Uint8Array(arrayBuffer);

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        resolve({
          dataUrl,
          width: img.naturalWidth,
          height: img.naturalHeight,
          aspectRatio: img.naturalWidth / img.naturalHeight,
          pdfBytes,
        });
      };
      img.onerror = () => reject(new Error('تعذر قراءة ملف الصورة'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('خطأ في تحميل الملف'));
    reader.readAsDataURL(file);
  });
}
