import express from 'express';
import path from 'path';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { PDFDocument, rgb } from 'pdf-lib';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

// Increase json and urlencoded body limit for certificate base64/binary transfers
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Certificate Generator Backend API',
  });
});

// Parse Excel file endpoint
app.post('/api/parse-excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'لم يتم إرسال ملف Excel' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ error: 'الملف فارغ أو لا يحتوي على صفوف بيانات' });
    }

    const columns = Object.keys(jsonData[0] || {});

    // Try to auto-detect name column
    const nameKeywords = ['name', 'الاسم', 'اسم', 'الأسم', 'طالب', 'المتدرب', 'المشارك', 'student', 'participant', 'full name'];
    const detectedNameCol = columns.find(col =>
      nameKeywords.some(kw => col.toLowerCase().includes(kw))
    ) || columns[0];

    const names = jsonData.map(row => String(row[detectedNameCol] || '').trim()).filter(Boolean);

    res.json({
      success: true,
      sheetName: firstSheetName,
      columns,
      detectedNameCol,
      totalRows: jsonData.length,
      sampleNames: names.slice(0, 5),
      rows: jsonData,
    });
  } catch (error: any) {
    console.error('Error parsing Excel:', error);
    res.status(500).json({ error: 'حدث خطأ أثناء قراءة ملف Excel: ' + (error.message || '') });
  }
});

// Generate Certificates ZIP endpoint
app.post('/api/generate-certificates', async (req, res) => {
  try {
    const {
      templateBytesBase64,
      pdfBytesBase64,
      templateType,
      names,
      fieldConfig,
      textImageMap,
    } = req.body;

    if (!templateBytesBase64 && !pdfBytesBase64) {
      return res.status(400).json({ error: 'ملف قالب الشهادة مفقود' });
    }

    if (!names || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ error: 'قائمة الأسماء فارغة' });
    }

    const zip = new JSZip();

    // Check if pdfBytesBase64 or templateBytesBase64 contains a valid PDF header
    let rawPdfBuffer: Buffer | null = null;
    const candidatePdfBase64 = pdfBytesBase64 || (templateType === 'pdf' ? templateBytesBase64 : null);

    if (candidatePdfBase64) {
      try {
        const cleanBase64 = candidatePdfBase64.replace(/^data:[^;]+;base64,/, '');
        const buf = Buffer.from(cleanBase64, 'base64');
        // Validate %PDF magic bytes
        if (buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46) {
          rawPdfBuffer = buf;
        }
      } catch (e) {
        rawPdfBuffer = null;
      }
    }

    // For image embedding fallback
    let bgImgBuffer: Buffer | null = null;
    let isPng = true;
    if (templateBytesBase64) {
      const cleanBase64 = templateBytesBase64.replace(/^data:[^;]+;base64,/, '');
      bgImgBuffer = Buffer.from(cleanBase64, 'base64');
      isPng = !templateBytesBase64.includes('image/jpeg') && !templateBytesBase64.includes('image/jpg');
    }

    // For each recipient
    for (let i = 0; i < names.length; i++) {
      const item = names[i];
      const personName = typeof item === 'string' ? item : item.name || `participant_${i + 1}`;
      const safeFilename = personName.replace(/[/\\?%*:|"<>]/g, '_').trim() || `certificate_${i + 1}`;

      let pdfDoc: PDFDocument | null = null;

      // 1. Try PDF template if buffer is a real valid PDF
      if (rawPdfBuffer) {
        try {
          pdfDoc = await PDFDocument.load(rawPdfBuffer);
          const page = pdfDoc.getPages()[0];
          const { width, height } = page.getSize();

          if (textImageMap && textImageMap[personName]) {
            const imgData = textImageMap[personName];
            const imgBuffer = Buffer.from(imgData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
            const embeddedImg = await pdfDoc.embedPng(imgBuffer);

            const x = (fieldConfig.xPercent / 100) * width;
            const boxWidth = (fieldConfig.widthPercent / 100) * width;
            const boxHeight = (fieldConfig.heightPercent / 100) * height;
            const y = height - ((fieldConfig.yPercent / 100) * height) - boxHeight;

            page.drawImage(embeddedImg, {
              x,
              y,
              width: boxWidth,
              height: boxHeight,
            });
          }
        } catch (err) {
          console.warn('PDFDocument.load failed on server, falling back to image embedding:', err);
          pdfDoc = null;
        }
      }

      // 2. Image template fallback (PNG/JPG)
      if (!pdfDoc && bgImgBuffer) {
        pdfDoc = await PDFDocument.create();
        const embeddedBg = isPng ? await pdfDoc.embedPng(bgImgBuffer) : await pdfDoc.embedJpg(bgImgBuffer);
        const page = pdfDoc.addPage([embeddedBg.width, embeddedBg.height]);

        page.drawImage(embeddedBg, {
          x: 0,
          y: 0,
          width: embeddedBg.width,
          height: embeddedBg.height,
        });

        if (textImageMap && textImageMap[personName]) {
          const imgData = textImageMap[personName];
          const imgBuffer = Buffer.from(imgData.replace(/^data:image\/\w+;base64,/, ''), 'base64');
          const embeddedImg = await pdfDoc.embedPng(imgBuffer);

          const x = (fieldConfig.xPercent / 100) * embeddedBg.width;
          const boxWidth = (fieldConfig.widthPercent / 100) * embeddedBg.width;
          const boxHeight = (fieldConfig.heightPercent / 100) * embeddedBg.height;
          const y = embeddedBg.height - ((fieldConfig.yPercent / 100) * embeddedBg.height) - boxHeight;

          page.drawImage(embeddedImg, {
            x,
            y,
            width: boxWidth,
            height: boxHeight,
          });
        }
      }

      if (!pdfDoc) {
        throw new Error('تعذر معالجة قالب الشهادة');
      }

      const pdfBytes = await pdfDoc.save();
      zip.file(`${safeFilename}.pdf`, pdfBytes);
    }

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="certificates.zip"');
    res.send(zipBuffer);
  } catch (error: any) {
    console.error('Error generating certificates zip:', error);
    res.status(500).json({ error: 'فشل في توليد ملف الـ ZIP: ' + (error.message || '') });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Certificate Generator Server running on http://localhost:${PORT}`);
  });
}

startServer();
