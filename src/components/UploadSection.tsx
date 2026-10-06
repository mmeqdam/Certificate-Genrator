import React, { useRef, useState } from 'react';
import {
  FileUp,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { CertificateTemplate, Participant } from '../types';
import { SAMPLE_TEMPLATES } from '../utils/sampleCertificates';
import { renderPdfFirstPage, renderImageFile } from '../utils/pdfRenderer';
import { parseExcelFile } from '../utils/excelParser';

interface UploadSectionProps {
  currentTemplate: CertificateTemplate;
  onTemplateChange: (template: CertificateTemplate) => void;
  participants: Participant[];
  onParticipantsChange: (participants: Participant[], detectedCol: string, allCols: string[]) => void;
  availableColumns: string[];
  selectedColumn: string;
  onSelectColumn: (col: string) => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  currentTemplate,
  onTemplateChange,
  participants,
  onParticipantsChange,
  availableColumns,
  selectedColumn,
  onSelectColumn,
}) => {
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const [isDraggingPdf, setIsDraggingPdf] = useState(false);
  const [isDraggingExcel, setIsDraggingExcel] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [excelLoading, setExcelLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Handle PDF/Image upload
  const handleTemplateFile = async (file: File) => {
    setErrorMessage(null);
    setPdfLoading(true);

    try {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImage = file.type.startsWith('image/');

      if (!isPdf && !isImage) {
        throw new Error('يرجى رفع ملف PDF أو صورة (PNG, JPG) لتصميم الشهادة.');
      }

      if (isPdf) {
        const rendered = await renderPdfFirstPage(file);
        onTemplateChange({
          id: `custom-pdf-${Date.now()}`,
          name: file.name,
          type: 'pdf',
          dataUrl: rendered.dataUrl,
          pdfBytes: rendered.pdfBytes,
          aspectRatio: rendered.aspectRatio,
          width: rendered.width,
          height: rendered.height,
          originalFileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        });
      } else {
        const rendered = await renderImageFile(file);
        onTemplateChange({
          id: `custom-img-${Date.now()}`,
          name: file.name,
          type: 'image',
          dataUrl: rendered.dataUrl,
          pdfBytes: rendered.pdfBytes,
          aspectRatio: rendered.aspectRatio,
          width: rendered.width,
          height: rendered.height,
          originalFileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ أثناء معالجة ملف الشهادة');
    } finally {
      setPdfLoading(false);
    }
  };

  // Handle Excel upload
  const handleExcelFile = async (file: File) => {
    setErrorMessage(null);
    setExcelLoading(true);

    try {
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

      if (!isValid && !file.type.includes('sheet') && !file.type.includes('csv')) {
        throw new Error('يرجى رفع ملف Excel بصيغة (.xlsx أو .xls) أو ملف .csv');
      }

      const result = await parseExcelFile(file);
      onParticipantsChange(result.participants, result.selectedColumn, result.columns);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'حدث خطأ أثناء قراءة ملف Excel');
    } finally {
      setExcelLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 mb-6">
      {errorMessage && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Certificate Design (PDF / Image) */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-bold text-slate-800 text-base">
                تصميم الشهادة (ملف PDF أو صورة)
              </h2>
            </div>
            {currentTemplate && (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {currentTemplate.type === 'pdf' ? 'ملف PDF مفعل' : 'قالب نشط'}
              </span>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleTemplateFile(e.target.files[0]);
              }
            }}
          />

          {/* Drop Zone */}
          <div
            id="certificate-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingPdf(true);
            }}
            onDragLeave={() => setIsDraggingPdf(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingPdf(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleTemplateFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => pdfInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] ${
              isDraggingPdf
                ? 'border-amber-500 bg-amber-50/70 scale-[0.99]'
                : 'border-slate-200 hover:border-amber-400 hover:bg-slate-50/80 bg-slate-50/40'
            }`}
          >
            {pdfLoading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-slate-600">جاري معالجة واستخراج تصميم الشهادة...</p>
              </div>
            ) : (
              <>
                <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-2 shadow-xs">
                  <FileUp className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  اسحب وأفلت تصميم الشهادة هنا (PDF أو صورة)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  أو <span className="text-amber-700 font-medium underline">اضغط لاختيار ملف من جهازك</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">يدعم: PDF, PNG, JPG عالي الدقة</p>
              </>
            )}
          </div>

          {/* Current Template & Presets */}
          <div className="mt-3 flex items-center justify-between text-xs">
            <div className="text-slate-600 truncate max-w-[260px]">
              <span className="text-slate-400">القالب الحالي:</span>{' '}
              <span className="font-semibold text-slate-800">{currentTemplate.name}</span>
            </div>

            {/* Template Selector dropdown/chips */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 hidden sm:inline">نماذج جاهزة:</span>
              <div className="flex gap-1">
                {SAMPLE_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => onTemplateChange(tmpl)}
                    className={`px-2 py-1 rounded text-xs transition-colors cursor-pointer ${
                      currentTemplate.id === tmpl.id
                        ? 'bg-amber-600 text-white font-medium shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title={tmpl.name}
                  >
                    نموذج {idx + 1}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Excel / Names File */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="font-bold text-slate-800 text-base">
                ملف الأسماء (Excel / CSV)
              </h2>
            </div>
            {participants.length > 0 && (
              <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {participants.length} اسم جاهز
              </span>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleExcelFile(e.target.files[0]);
              }
            }}
          />

          {/* Drop Zone */}
          <div
            id="excel-dropzone"
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingExcel(true);
            }}
            onDragLeave={() => setIsDraggingExcel(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingExcel(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleExcelFile(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => excelInputRef.current?.click()}
            className={`flex-1 border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[140px] ${
              isDraggingExcel
                ? 'border-emerald-500 bg-emerald-50/70 scale-[0.99]'
                : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/80 bg-slate-50/40'
            }`}
          >
            {excelLoading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-medium text-slate-600">جاري تحليل واستخراج أسماء المشاركين...</p>
              </div>
            ) : (
              <>
                <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 shadow-xs">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-800">
                  اسحب وأفلت جدول الأسماء هنا (Excel أو CSV)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  أو <span className="text-emerald-700 font-medium underline">اضغط لاختيار ملف إكسل</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1">يدعم: .xlsx, .xls, .csv</p>
              </>
            )}
          </div>

          {/* Column selector & Sample info */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            {availableColumns.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">عمود الأسماء:</span>
                <select
                  value={selectedColumn}
                  onChange={(e) => onSelectColumn(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {availableColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <span className="text-slate-400">لم يتم رفع ملف إكسل بعد (يتم استخدام بيانات تجريبية)</span>
            )}

            <div className="text-slate-500 text-xs">
              <span className="font-semibold text-emerald-700">{participants.length}</span> شهادة سيتم إصدارها
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
