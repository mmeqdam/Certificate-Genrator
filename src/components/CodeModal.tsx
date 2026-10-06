import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Terminal,
  Server,
  Code2,
  FileCode,
  BookOpen,
  Layers
} from 'lucide-react';

interface CodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeModal: React.FC<CodeModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'backend' | 'frontend' | 'setup' | 'package'>('setup');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const setupCommands = `# 1. استنساخ المشروع أو إنشاؤه
mkdir certificate-generator
cd certificate-generator

# 2. تثبيت الحزم المطلوبة للـ Backend والـ Frontend
npm install express multer xlsx pdf-lib @pdf-lib/fontkit jszip file-saver lucide-react
npm install -D tsx typescript @types/node @types/express @types/multer @types/file-saver esbuild vite @vitejs/plugin-react @tailwindcss/vite tailwindcss

# 3. تشغيل وضع التطوير المحلي (Dev Mode)
npm run dev
# التطبيق سيعمل فوراً على: http://localhost:3000

# 4. لبناء وتشغيل المشروع للإنتاج (Production)
npm run build
npm start
`;

  const backendCode = `// server.ts - خادم Node.js مع Express لإصدار الشهادات
import express from 'express';
import path from 'path';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
});

// 1. مسار قراءة وتحليل ملف الإكسل لاستخراج الأسماء
app.post('/api/parse-excel', upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'لم يتم إرسال ملف' });

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    const columns = Object.keys(jsonData[0] || {});
    const nameKeywords = ['name', 'الاسم', 'اسم', 'طالب', 'المتدرب', 'student'];
    const detectedNameCol = columns.find(col =>
      nameKeywords.some(kw => col.toLowerCase().includes(kw))
    ) || columns[0];

    const names = jsonData.map(row => String(row[detectedNameCol] || '').trim()).filter(Boolean);

    res.json({
      success: true,
      columns,
      detectedNameCol,
      totalRows: names.length,
      names,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. مسار توليد كافة الشهادات وإرجاع ملف ZIP بأسماء المشاركين
app.post('/api/generate-certificates', async (req, res) => {
  try {
    const { templateBytesBase64, templateType, names, fieldConfig, textImageMap } = req.body;
    const zip = new JSZip();
    const templateBuffer = Buffer.from(templateBytesBase64.replace(/^data:[^;]+;base64,/, ''), 'base64');

    for (let i = 0; i < names.length; i++) {
      const personName = typeof names[i] === 'string' ? names[i] : names[i].name;
      const safeFilename = personName.replace(/[/\\\\?%*:|"<>]/g, '_').trim() || \`certificate_\${i + 1}\`;

      const pdfDoc = await PDFDocument.load(templateBuffer);
      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();

      // رسم الاسم على الشهادة باستخدام تراكب صورة فائق الدقة لدعم الحروف العربية
      if (textImageMap && textImageMap[personName]) {
        const imgBuffer = Buffer.from(textImageMap[personName].replace(/^data:image\\/\\w+;base64,/, ''), 'base64');
        const embeddedImg = await pdfDoc.embedPng(imgBuffer);

        const x = (fieldConfig.xPercent / 100) * width;
        const boxWidth = (fieldConfig.widthPercent / 100) * width;
        const boxHeight = (fieldConfig.heightPercent / 100) * height;
        // نقطة الأصل في الـ PDF أسفل اليسار
        const y = height - ((fieldConfig.yPercent / 100) * height) - boxHeight;

        page.drawImage(embeddedImg, { x, y, width: boxWidth, height: boxHeight });
      }

      const pdfBytes = await pdfDoc.save();
      zip.file(\`\${safeFilename}.pdf\`, pdfBytes);
    }

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="certificates.zip"');
    res.send(zipBuffer);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// تكامل Vite في التطوير والملفات الثابتة في الإنتاج
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*', (req, res) => res.sendFile(path.join(process.cwd(), 'dist/index.html')));
  }
  app.listen(PORT, '0.0.0.0', () => console.log(\`Server on http://localhost:\${PORT}\`));
}
start();
`;

  const packageJsonCode = `{
  "name": "certificate-generator",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "build": "vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs"
  },
  "dependencies": {
    "express": "^4.21.2",
    "multer": "^2.4.0",
    "xlsx": "^0.18.5",
    "pdf-lib": "^1.17.1",
    "@pdf-lib/fontkit": "^1.1.1",
    "pdfjs-dist": "^4.0.379",
    "jszip": "^3.10.2",
    "file-saver": "^2.0.5",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "lucide-react": "^0.546.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^22.14.0",
    "@types/multer": "^2.2.0",
    "@types/file-saver": "^2.0.7",
    "tsx": "^4.21.0",
    "esbuild": "^0.25.0",
    "typescript": "^5.8.2",
    "vite": "^6.2.3"
  }
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                الكود المصدري وخطوات التشغيل (Fullstack Source Code)
              </h3>
              <p className="text-xs text-slate-500">
                شرح هيكلية التطبيق وخطوات التشغيل على أي خادم أو حاسوب شخصي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 px-6 gap-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('setup')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'setup'
                ? 'border-amber-600 text-amber-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4 text-amber-600" />
            <span>خطوات التشغيل والـ CLI</span>
          </button>

          <button
            onClick={() => setActiveTab('backend')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'backend'
                ? 'border-blue-600 text-blue-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="w-4 h-4 text-blue-600" />
            <span>كود الـ Backend (server.ts)</span>
          </button>

          <button
            onClick={() => setActiveTab('package')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'package'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>ملف package.json</span>
          </button>
        </div>

        {/* Content View */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs bg-slate-900 text-slate-100 relative">
          {activeTab === 'setup' && (
            <div>
              <div className="flex items-center justify-between mb-2 text-slate-400 font-sans">
                <span className="font-bold text-amber-400">أوامر التثبيت والتشغيل عبر سطر الأوامر (Terminal):</span>
                <button
                  onClick={() => handleCopy(setupCommands, 'setup')}
                  className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 transition-colors cursor-pointer"
                >
                  {copiedKey === 'setup' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'setup' ? 'تم النسخ' : 'نسخ الأوامر'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-emerald-400 leading-relaxed">
                {setupCommands}
              </pre>

              <div className="mt-6 text-slate-300 font-sans space-y-3">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  آلية عمل النظام وخصائصه:
                </h4>
                <ul className="list-disc pr-6 space-y-1.5 text-xs text-slate-300 leading-relaxed">
                  <li>
                    <strong className="text-white">الرفع والمعالجة:</strong> يدعم التطبيق رفع قوالب PDF الأصلية أو الصور (PNG/JPG)، واستخراج الصفحة الأولى بدقة للمعاينة التفاعلية.
                  </li>
                  <li>
                    <strong className="text-white">السحب والإفلات (Drag & Drop):</strong> يعتمد على نسب مئوية مريحة (<code className="text-amber-400">xPercent, yPercent, widthPercent</code>) تضمن وضع الاسم في المكان الدقيق بصرف النظر عن دقة الشاشة أو أبعاد الورقة (A4 أفقي أو عمودي).
                  </li>
                  <li>
                    <strong className="text-white">دعم الخطوط العربية 100%:</strong> يتم تشكيل وتوصيل الحروف العربية بدقة متناهية ودون تقطيع للحروف بفضل تقنية الرندرينج عالي الدقة (300 DPI Canvas Layering).
                  </li>
                  <li>
                    <strong className="text-white">التوليد والحزم:</strong> ينشئ ملف PDF منفصل لكل اسم موجود في جدول الإكسل، ويقوم بضغطه فورياً داخل ملف ZIP بأسماء الأشخاص.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'backend' && (
            <div>
              <div className="flex items-center justify-between mb-2 text-slate-400 font-sans">
                <span className="font-bold text-blue-400">كود الخادم الكامل (Node.js + Express + pdf-lib + JSZip):</span>
                <button
                  onClick={() => handleCopy(backendCode, 'backend')}
                  className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 transition-colors cursor-pointer"
                >
                  {copiedKey === 'backend' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'backend' ? 'تم النسخ' : 'نسخ الكود'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-slate-200 leading-relaxed">
                {backendCode}
              </pre>
            </div>
          )}

          {activeTab === 'package' && (
            <div>
              <div className="flex items-center justify-between mb-2 text-slate-400 font-sans">
                <span className="font-bold text-emerald-400">ملف التعريف والتبعيات (package.json):</span>
                <button
                  onClick={() => handleCopy(packageJsonCode, 'package')}
                  className="inline-flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-slate-300 transition-colors cursor-pointer"
                >
                  {copiedKey === 'package' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'package' ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-amber-200 leading-relaxed">
                {packageJsonCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
