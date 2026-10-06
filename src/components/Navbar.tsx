import React from 'react';
import { Award, Download, FileSpreadsheet, Code2, Sparkles, RefreshCw } from 'lucide-react';
import { downloadSampleExcel } from '../utils/excelParser';

interface NavbarProps {
  onLoadSampleData: () => void;
  onOpenCodeModal: () => void;
  onReset: () => void;
  totalParticipants: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onLoadSampleData,
  onOpenCodeModal,
  onReset,
  totalParticipants,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 tracking-tight font-sans">
                  مُولّد الشهادات التلقائي
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  دعم PDF + Excel
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                توليد جماعي عالي الدقة وسحب وإفلات مع تصدير ZIP
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={downloadSampleExcel}
              id="download-sample-excel-btn"
              title="تنزيل ملف إكسل تجريبي يحتوي على أسماء وأرقام شهادات"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">تحميل نموذج Excel</span>
            </button>

            <button
              onClick={onLoadSampleData}
              id="load-sample-data-btn"
              title="تعبئة بيانات مشاركين وقالب تجريبي للتجربة الفورية"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>بيانات تجريبية ({totalParticipants})</span>
            </button>

            <button
              onClick={onOpenCodeModal}
              id="view-code-guide-btn"
              title="عرض كود الـ Backend وخطوات التشغيل"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-300 shadow-xs cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">كود الـ Backend والتشغيل</span>
            </button>

            <button
              onClick={onReset}
              id="reset-app-btn"
              title="إعادة ضبط التطبيق"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
