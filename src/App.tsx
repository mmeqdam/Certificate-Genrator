import React, { useState } from 'react';
import {
  Download,
  FileArchive,
  Eye,
  Sparkles,
  CheckCircle,
  HelpCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { UploadSection } from './components/UploadSection';
import { CertificateCanvas } from './components/CertificateCanvas';
import { StylingControls } from './components/StylingControls';
import { ParticipantsTable } from './components/ParticipantsTable';
import { GenerationModal } from './components/GenerationModal';
import { CodeModal } from './components/CodeModal';
import { CertificateTemplate, Participant, FieldConfig, GenerationProgress } from './types';
import { SAMPLE_TEMPLATES } from './utils/sampleCertificates';
import { getSampleParticipants } from './utils/excelParser';
import {
  generateSingleCertificatePdf,
  generateAllCertificatesZip,
  triggerFileDownload,
  renderNameToCanvas,
  rasterizeSvgToPng,
  uint8ArrayToBase64,
  isValidPdfBytes
} from './utils/certificateGenerator';

export default function App() {
  // State: Template
  const [template, setTemplate] = useState<CertificateTemplate>(SAMPLE_TEMPLATES[0]);

  // State: Participants list
  const [participants, setParticipants] = useState<Participant[]>(getSampleParticipants());
  const [availableColumns, setAvailableColumns] = useState<string[]>([
    'الاسم الكامل',
    'رقم الشهادة',
    'التقدير',
    'البريد الإلكتروني',
  ]);
  const [selectedColumn, setSelectedColumn] = useState<string>('الاسم الكامل');
  const [activeParticipantIndex, setActiveParticipantIndex] = useState<number>(0);

  // State: Field positioning and typography configuration
  const [fieldConfig, setFieldConfig] = useState<FieldConfig>({
    xPercent: 22,
    yPercent: 47,
    widthPercent: 56,
    heightPercent: 9,
    fontSize: 42,
    fontFamily: "'Amiri', serif",
    fontWeight: '700',
    fontColor: '#0f172a',
    textAlign: 'center',
    prefix: '',
    suffix: '',
    showBorderGuide: true,
  });

  // State: Modals & Progress
  const [isGenModalOpen, setIsGenModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [downloadingParticipantId, setDownloadingParticipantId] = useState<string | null>(null);

  const [progress, setProgress] = useState<GenerationProgress>({
    isGenerating: false,
    total: participants.length,
    completed: 0,
    percentage: 0,
    currentName: '',
    isComplete: false,
    mode: 'client',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Field config updates
  const handleFieldConfigChange = (updates: Partial<FieldConfig>) => {
    setFieldConfig((prev) => ({ ...prev, ...updates }));
  };

  // Load sample data
  const handleLoadSampleData = () => {
    const samples = getSampleParticipants();
    setParticipants(samples);
    setActiveParticipantIndex(0);
    showToast('تم تحميل بيانات 8 مشاركين تجريبيين بنجاح!');
  };

  // Reset to initial
  const handleReset = () => {
    setTemplate(SAMPLE_TEMPLATES[0]);
    setParticipants(getSampleParticipants());
    setActiveParticipantIndex(0);
    setFieldConfig({
      xPercent: 22,
      yPercent: 47,
      widthPercent: 56,
      heightPercent: 9,
      fontSize: 42,
      fontFamily: "'Amiri', serif",
      fontWeight: '700',
      fontColor: '#0f172a',
      textAlign: 'center',
      prefix: '',
      suffix: '',
      showBorderGuide: true,
    });
    showToast('تمت إعادة ضبط إعدادات القالب والأسماء');
  };

  // Single Certificate Download
  const handleDownloadSingle = async (participant: Participant) => {
    try {
      setDownloadingParticipantId(participant.id);
      showToast(`جاري تجهيز وتنزيل شهادة "${participant.name}" بصيغة PDF...`);
      const pdfBytes = await generateSingleCertificatePdf(template, participant, fieldConfig);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const safeFilename = participant.name.replace(/[/\\?%*:|"<>]/g, '_').trim() || `شهادة_${participant.id}`;
      triggerFileDownload(blob, `${safeFilename}.pdf`);
      showToast(`تم تنزيل شهادة "${participant.name}" بصيغة PDF بنجاح!`);
    } catch (err: any) {
      console.error(err);
      alert('حدث خطأ أثناء تنزيل الشهادة: ' + (err.message || ''));
    } finally {
      setDownloadingParticipantId(null);
    }
  };

  // Start Bulk Generation
  const handleStartGeneration = async (mode: 'client' | 'server') => {
    if (participants.length === 0) {
      alert('قائمة المشاركين فارغة، يرجى رفع ملف إكسل أو إضافة أسماء أولاً.');
      return;
    }

    setProgress({
      isGenerating: true,
      total: participants.length,
      completed: 0,
      percentage: 0,
      currentName: 'جاري البدء...',
      isComplete: false,
      mode,
    });

    try {
      if (mode === 'server') {
        // Prepare pre-rendered high-res text overlay map for 100% exact Arabic shaping
        const textImageMap: Record<string, string> = {};
        const boxWidthPx = (fieldConfig.widthPercent / 100) * template.width;
        const boxHeightPx = (fieldConfig.heightPercent / 100) * template.height;

        participants.forEach((p) => {
          textImageMap[p.name] = renderNameToCanvas(p.name, fieldConfig, boxWidthPx, boxHeightPx, 3);
        });

        setProgress((prev) => ({ ...prev, currentName: 'جاري الإرسال والمعالجة في خادم Node.js...' }));

        // Ensure template image is a clean PNG dataUrl (rasterize SVG if needed)
        let cleanImageDataUrl = template.dataUrl;
        if (template.dataUrl.startsWith('data:image/svg+xml') || template.type === 'svg') {
          cleanImageDataUrl = await rasterizeSvgToPng(template.dataUrl, template.width, template.height);
        }

        // Check if we have valid original PDF bytes
        let pdfBytesBase64: string | undefined = undefined;
        if (template.type === 'pdf' && isValidPdfBytes(template.pdfBytes)) {
          pdfBytesBase64 = uint8ArrayToBase64(template.pdfBytes!);
        }

        const response = await fetch('/api/generate-certificates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateBytesBase64: cleanImageDataUrl,
            pdfBytesBase64,
            templateType: template.type,
            names: participants.map((p) => p.name),
            fieldConfig,
            textImageMap,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || 'فشل في توليد الشهادات عبر الخادم');
        }

        const zipBlob = await response.blob();
        const downloadUrl = URL.createObjectURL(zipBlob);

        setProgress({
          isGenerating: false,
          total: participants.length,
          completed: participants.length,
          percentage: 100,
          currentName: 'تم الانتهاء!',
          isComplete: true,
          zipBlob,
          downloadUrl,
          mode,
        });

        // Trigger download
        triggerFileDownload(zipBlob, `شهادات_${new Date().toISOString().slice(0, 10)}.zip`);
      } else {
        // Client-side instant generation
        const zipBlob = await generateAllCertificatesZip(
          template,
          participants,
          fieldConfig,
          (completed, total, currentName) => {
            const percentage = Math.round((completed / total) * 100);
            setProgress((prev) => ({
              ...prev,
              completed,
              total,
              percentage,
              currentName,
            }));
          }
        );

        const downloadUrl = URL.createObjectURL(zipBlob);

        setProgress({
          isGenerating: false,
          total: participants.length,
          completed: participants.length,
          percentage: 100,
          currentName: 'تم الانتهاء!',
          isComplete: true,
          zipBlob,
          downloadUrl,
          mode,
        });

        // Automatically trigger download
        triggerFileDownload(zipBlob, `شهادات_${new Date().toISOString().slice(0, 10)}.zip`);
      }
    } catch (err: any) {
      console.error('Error generating certificates:', err);
      setProgress((prev) => ({
        ...prev,
        isGenerating: false,
        error: err.message || 'حدث خطأ أثناء إصدار الشهادات',
      }));
    }
  };

  const activeParticipant = participants[activeParticipantIndex] || {
    id: 'placeholder',
    name: 'اسم المشارك',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onLoadSampleData={handleLoadSampleData}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onReset={handleReset}
        totalParticipants={participants.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Step 1 & 2: Upload Area */}
        <UploadSection
          currentTemplate={template}
          onTemplateChange={(newTmpl) => {
            setTemplate(newTmpl);
            showToast(`تم تغيير القالب إلى: ${newTmpl.name}`);
          }}
          participants={participants}
          onParticipantsChange={(newParticipants, detectedCol, cols) => {
            setParticipants(newParticipants);
            setSelectedColumn(detectedCol);
            setAvailableColumns(cols);
            setActiveParticipantIndex(0);
            showToast(`تم استيراد ${newParticipants.length} اسم من ملف Excel بنجاح!`);
          }}
          availableColumns={availableColumns}
          selectedColumn={selectedColumn}
          onSelectColumn={(col) => {
            setSelectedColumn(col);
            // Re-map participant names to this column if extra data exists
            const remapped = participants.map((p) => {
              if (p.extra && p.extra[col]) {
                return { ...p, name: p.extra[col] };
              }
              return p;
            });
            setParticipants(remapped);
            showToast(`تم تبديل عمود الاسم إلى: ${col}`);
          }}
        />

        {/* Workspace Grid: Left Canvas, Right Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Certificate Interactive Preview & Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="font-bold text-slate-900 text-base">
                  معاينة الشهادة وتحديد موقع الاسم (Drag & Drop)
                </h2>
              </div>

              {/* Single certificate direct download */}
              <button
                type="button"
                onClick={() => handleDownloadSingle(activeParticipant)}
                disabled={downloadingParticipantId === activeParticipant.id}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-950 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                title={`تنزيل شهادة ${activeParticipant.name} بصيغة PDF`}
              >
                {downloadingParticipantId === activeParticipant.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                ) : (
                  <Download className="w-3.5 h-3.5 text-emerald-700" />
                )}
                <span>تنزيل شهادة ({activeParticipant.name}) بصيغة PDF</span>
              </button>
            </div>

            <CertificateCanvas
              template={template}
              participants={participants}
              fieldConfig={fieldConfig}
              onFieldConfigChange={handleFieldConfigChange}
              activeParticipantIndex={activeParticipantIndex}
              onSelectParticipantIndex={setActiveParticipantIndex}
              onDownloadSingle={handleDownloadSingle}
              isDownloadingSingle={downloadingParticipantId === activeParticipant.id}
            />

            {/* Big Action Bar */}
            <div className="bg-gradient-to-r from-amber-600 to-amber-700 rounded-2xl p-5 text-white shadow-lg shadow-amber-600/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileArchive className="w-6 h-6 text-amber-200" />
                  <h3 className="text-base font-black">
                    توليد كافة الشهادات ({participants.length} شهادة)
                  </h3>
                </div>
                <p className="text-xs text-amber-100 mt-1">
                  توليد ملفات PDF بأسماء المستلمين وحزمها داخل ملف مضغوط ZIP بنقرة واحدة
                </p>
              </div>

              <button
                type="button"
                id="generate-all-certificates-main-btn"
                onClick={() => {
                  setProgress((prev) => ({ ...prev, isComplete: false, error: undefined }));
                  setIsGenModalOpen(true);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-sm rounded-xl shadow-md transition-all transform hover:scale-[1.02] cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-700" />
                <span>توليد وتنزيل ZIP</span>
              </button>
            </div>
          </div>

          {/* Right Column: Styling Controls & Participants Table (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <StylingControls
              fieldConfig={fieldConfig}
              onChange={handleFieldConfigChange}
            />

            <ParticipantsTable
              participants={participants}
              activeIndex={activeParticipantIndex}
              onSelectParticipant={setActiveParticipantIndex}
              onAddParticipant={(name) => {
                const newP: Participant = {
                  id: `p-custom-${Date.now()}`,
                  name,
                  code: `CERT-${String(participants.length + 1).padStart(3, '0')}`,
                };
                setParticipants([newP, ...participants]);
                setActiveParticipantIndex(0);
                showToast(`تمت إضافة ${name} إلى القائمة`);
              }}
              onRemoveParticipant={(id) => {
                const filtered = participants.filter((p) => p.id !== id);
                setParticipants(filtered);
                if (activeParticipantIndex >= filtered.length) {
                  setActiveParticipantIndex(Math.max(0, filtered.length - 1));
                }
              }}
              onDownloadSingle={handleDownloadSingle}
              downloadingId={downloadingParticipantId}
            />
          </div>
        </div>
      </main>

      {/* Generation Progress & Download Modal */}
      <GenerationModal
        isOpen={isGenModalOpen}
        onClose={() => setIsGenModalOpen(false)}
        progress={progress}
        onStartGeneration={handleStartGeneration}
        participants={participants}
        templateName={template.name}
        onDownloadSingle={handleDownloadSingle}
        downloadingId={downloadingParticipantId}
      />

      {/* Full Source Code & Instructions Modal */}
      <CodeModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
