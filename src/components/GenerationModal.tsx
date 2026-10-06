import React, { useState } from 'react';
import {
  X,
  Download,
  CheckCircle2,
  FileArchive,
  Loader2,
  AlertTriangle,
  Server,
  Cpu,
  FileText,
  Sparkles,
  Search,
  UserCheck
} from 'lucide-react';
import { Participant, GenerationProgress } from '../types';

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: GenerationProgress;
  onStartGeneration: (mode: 'client' | 'server') => void;
  participants: Participant[];
  templateName: string;
  onDownloadSingle?: (participant: Participant) => void;
  downloadingId?: string | null;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  onClose,
  progress,
  onStartGeneration,
  participants,
  templateName,
  onDownloadSingle,
  downloadingId = null,
}) => {
  const [selectedMode, setSelectedMode] = useState<'client' | 'server'>('client');
  const [activeTab, setActiveTab] = useState<'bulk-zip' | 'single-pdf'>('bulk-zip');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const isWorking = progress.isGenerating;
  const isDone = progress.isComplete;

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden transition-all">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              {activeTab === 'bulk-zip' ? <FileArchive className="w-5 h-5" /> : <FileText className="w-5 h-5 text-emerald-700" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                إصدار وتنزيل الشهادات
              </h3>
              <p className="text-xs text-slate-500">
                إجمالي {participants.length} شهادة بصيغة PDF عالية الدقة
              </p>
            </div>
          </div>
          {!isWorking && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Tabs (Available when not currently generating) */}
        {!isWorking && !isDone && (
          <div className="flex border-b border-slate-200 bg-slate-100/70 p-1.5 gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('bulk-zip')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'bulk-zip'
                  ? 'bg-white text-amber-900 shadow-xs'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              <FileArchive className="w-4 h-4 text-amber-600" />
              <span>توليد الكل في حزمة ZIP ({participants.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('single-pdf')}
              className={`flex-1 py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'single-pdf'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-slate-600 hover:bg-white/60'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>تنزيل شهادات فردية (PDF)</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* TAB 1: Bulk ZIP Generation */}
          {!isWorking && !isDone && activeTab === 'bulk-zip' && (
            <div className="space-y-4">
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>جاهز لإصدار {participants.length} شهادة دفعة واحدة</span>
                </div>
                <p>
                  سيتم إنشاء ملف PDF مستقل لكل اسم في قائمة Excel بالدقة الكاملة للطباعة (300 DPI) وتضمينها داخل أرشيف مضغوط ZIP بأسماء أصحابها.
                </p>
                <div className="text-[11px] text-amber-800 pt-1">
                  القالب المعتمد: <span className="font-semibold">{templateName}</span>
                </div>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">طريقة المعالجة:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedMode('client')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      selectedMode === 'client'
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-1">
                      <Cpu className="w-4 h-4 text-amber-600" />
                      <span>فوري بالمتصفح (موصى به)</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      معالجة مباشرة وسريعة دون استهلاك للشبكة
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMode('server')}
                    className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                      selectedMode === 'server'
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900 mb-1">
                      <Server className="w-4 h-4 text-blue-600" />
                      <span>عبر خادم Node.js API</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      توليد خادمي مخصص للحزم الكبيرة جداً
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Individual PDF Download List */}
          {!isWorking && !isDone && activeTab === 'single-pdf' && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900">
                <span className="font-bold">تنزيل شهادة أي شخص منفردة:</span> اضغط على زر <strong className="font-bold text-emerald-950">"تنزيل PDF"</strong> بجانب اسم المشارك وسيتم تنزيل شهادته فوراً بصيغة PDF عالية الدقة.
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث عن اسم المشارك..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pr-9 pl-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Participants list with individual download buttons */}
              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white shadow-2xs">
                {filteredParticipants.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    لا يوجد مشارك بهذا الاسم
                  </div>
                ) : (
                  filteredParticipants.map((p, idx) => {
                    const isDownloadingThis = downloadingId === p.id;
                    return (
                      <div
                        key={p.id}
                        className="flex items-center justify-between px-3.5 py-2 hover:bg-slate-50 text-xs transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-5 text-[11px] font-mono text-slate-400 text-center">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <div className="font-bold text-slate-800 truncate">{p.name}</div>
                            {p.code && <div className="text-[10px] text-slate-400 font-mono">{p.code}</div>}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => onDownloadSingle && onDownloadSingle(p)}
                          disabled={isDownloadingThis}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-950 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          {isDownloadingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                          ) : (
                            <Download className="w-3.5 h-3.5 text-emerald-700" />
                          )}
                          <span>تنزيل PDF</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Active Generation State */}
          {isWorking && (
            <div className="py-4 space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
                  جاري التوليد والحزم...
                </span>
                <span className="font-mono font-bold text-amber-600">
                  {progress.percentage}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-150"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="truncate max-w-[280px]">
                  الملف الحالي: <span className="font-semibold text-slate-800">{progress.currentName}</span>
                </span>
                <span className="font-mono">
                  {progress.completed} / {progress.total}
                </span>
              </div>
            </div>
          )}

          {/* Complete Success State */}
          {isDone && (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">
                  تم إصدار كافة الشهادات بنجاح!
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  تم تجهيز {progress.total} ملف PDF مضغوط داخل أرشيف ZIP، ويمكنك أيضاً تنزيل شهادة أي شخص منفردة من القائمة أدناه:
                </p>
              </div>

              {/* Preview of file names inside with Individual Download buttons */}
              <div className="bg-slate-50 rounded-xl p-3 max-h-48 overflow-y-auto text-right text-xs space-y-1.5 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 mb-1 flex items-center justify-between">
                  <span>محتويات الشهادات ({participants.length} ملف PDF):</span>
                  <span>اضغط لتنزيل الشهادة منفردة</span>
                </div>
                {participants.map((p) => {
                  const isDownloadingThis = downloadingId === p.id;
                  return (
                    <div key={p.id} className="flex items-center justify-between gap-1.5 text-slate-700 font-mono text-[11px] p-1.5 hover:bg-white rounded-lg transition-colors">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span className="truncate font-sans font-medium">{p.name}.pdf</span>
                      </div>

                      {onDownloadSingle && (
                        <button
                          type="button"
                          onClick={() => onDownloadSingle(p)}
                          disabled={isDownloadingThis}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded border border-emerald-300 transition-colors shrink-0 cursor-pointer"
                        >
                          {isDownloadingThis ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Download className="w-3 h-3" />
                          )}
                          <span>PDF</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Error Message */}
          {progress.error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{progress.error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          {!isWorking && !isDone && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
              {activeTab === 'bulk-zip' && (
                <button
                  type="button"
                  id="confirm-generate-zip-btn"
                  onClick={() => onStartGeneration(selectedMode)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md shadow-amber-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>بدء التوليد والتحميل (ZIP)</span>
                </button>
              )}
            </>
          )}

          {isDone && (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                إغلاق
              </button>
              {progress.downloadUrl && (
                <a
                  href={progress.downloadUrl}
                  download="شهادات_المشاركين.zip"
                  id="final-download-zip-link"
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تنزيل ملف الـ ZIP كاملاً</span>
                </a>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
