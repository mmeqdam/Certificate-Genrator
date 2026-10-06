import React, { useRef, useState, useEffect } from 'react';
import {
  Move,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  User,
  Crosshair,
  Sparkles,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Loader2
} from 'lucide-react';
import { CertificateTemplate, Participant, FieldConfig } from '../types';

interface CertificateCanvasProps {
  template: CertificateTemplate;
  participants: Participant[];
  fieldConfig: FieldConfig;
  onFieldConfigChange: (newConfig: Partial<FieldConfig>) => void;
  activeParticipantIndex: number;
  onSelectParticipantIndex: (index: number) => void;
  onDownloadSingle?: (participant: Participant) => void;
  isDownloadingSingle?: boolean;
}

export const CertificateCanvas: React.FC<CertificateCanvasProps> = ({
  template,
  participants,
  fieldConfig,
  onFieldConfigChange,
  activeParticipantIndex,
  onSelectParticipantIndex,
  onDownloadSingle,
  isDownloadingSingle = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialConfig, setInitialConfig] = useState<FieldConfig>(fieldConfig);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isNearCenter, setIsNearCenter] = useState<boolean>(false);

  const activeParticipant = participants[activeParticipantIndex] || {
    id: 'placeholder',
    name: 'اسم المشارك يظهر هنا',
  };

  // Center alignment threshold for visual guide
  useEffect(() => {
    const boxCenter = fieldConfig.xPercent + (fieldConfig.widthPercent / 2);
    setIsNearCenter(Math.abs(boxCenter - 50) < 1.5);
  }, [fieldConfig.xPercent, fieldConfig.widthPercent]);

  // Handle Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialConfig({ ...fieldConfig });
  };

  // Handle Resizing
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(handle);
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialConfig({ ...fieldConfig });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPixels = (e.clientX - dragStart.x) / zoomLevel;
      const deltaYPixels = (e.clientY - dragStart.y) / zoomLevel;

      const deltaXPercent = (deltaXPixels / rect.width) * 100;
      const deltaYPercent = (deltaYPixels / rect.height) * 100;

      if (isDragging) {
        let newX = initialConfig.xPercent + deltaXPercent;
        let newY = initialConfig.yPercent + deltaYPercent;

        // Clamp inside bounds
        newX = Math.max(0, Math.min(100 - fieldConfig.widthPercent, newX));
        newY = Math.max(0, Math.min(100 - fieldConfig.heightPercent, newY));

        // Center snap guide
        const boxCenter = newX + (fieldConfig.widthPercent / 2);
        if (Math.abs(boxCenter - 50) < 1.2) {
          newX = 50 - (fieldConfig.widthPercent / 2);
        }

        onFieldConfigChange({
          xPercent: Number(newX.toFixed(2)),
          yPercent: Number(newY.toFixed(2)),
        });
      } else if (isResizing) {
        if (isResizing === 'e' || isResizing === 'se') {
          const newW = Math.max(15, Math.min(100 - initialConfig.xPercent, initialConfig.widthPercent + deltaXPercent));
          onFieldConfigChange({ widthPercent: Number(newW.toFixed(2)) });
        }
        if (isResizing === 's' || isResizing === 'se') {
          const newH = Math.max(4, Math.min(100 - initialConfig.yPercent, initialConfig.heightPercent + deltaYPercent));
          onFieldConfigChange({ heightPercent: Number(newH.toFixed(2)) });
        }
        if (isResizing === 'w') {
          const newX = Math.max(0, initialConfig.xPercent + deltaXPercent);
          const newW = initialConfig.widthPercent - deltaXPercent;
          if (newW >= 15 && newX >= 0) {
            onFieldConfigChange({
              xPercent: Number(newX.toFixed(2)),
              widthPercent: Number(newW.toFixed(2)),
            });
          }
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, initialConfig, fieldConfig, zoomLevel, onFieldConfigChange]);

  // Center horizontally helper
  const handleCenterHorizontally = () => {
    const centeredX = 50 - (fieldConfig.widthPercent / 2);
    onFieldConfigChange({ xPercent: Number(centeredX.toFixed(2)) });
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Toolbar */}
      <div className="bg-slate-50/80 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Name Cycle Stepper */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-amber-600" />
            معاينة الاسم:
          </span>
          <div className="flex items-center bg-white border border-slate-300 rounded-lg px-1.5 py-0.5 shadow-2xs">
            <button
              onClick={() => onSelectParticipantIndex(Math.max(0, activeParticipantIndex - 1))}
              disabled={activeParticipantIndex === 0}
              className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded transition-colors cursor-pointer"
              title="الاسم السابق"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-bold text-slate-800 truncate max-w-[140px] sm:max-w-[180px]">
              {activeParticipant.name}
            </span>
            <button
              onClick={() => onSelectParticipantIndex(Math.min(participants.length - 1, activeParticipantIndex + 1))}
              disabled={activeParticipantIndex >= participants.length - 1}
              className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded transition-colors cursor-pointer"
              title="الاسم التالي"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
          <span className="text-slate-400 font-mono text-[11px]">
            ({activeParticipantIndex + 1} / {participants.length || 1})
          </span>

          {/* Direct Individual Download Button for Active Participant */}
          {onDownloadSingle && (
            <button
              type="button"
              onClick={() => onDownloadSingle(activeParticipant)}
              disabled={isDownloadingSingle}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title={`تنزيل شهادة ${activeParticipant.name} بصيغة PDF`}
            >
              {isDownloadingSingle ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : (
                <Download className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>تنزيل PDF لهذا الشخص</span>
            </button>
          )}
        </div>

        {/* Quick Position and Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCenterHorizontally}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-slate-700 font-medium transition-colors cursor-pointer"
            title="توسيط مربع الاسم أفقياً في منتصف الشهادة تماماً"
          >
            <Crosshair className="w-3.5 h-3.5 text-amber-600" />
            <span>توسيط أفقي (Center)</span>
          </button>

          {/* Coordinate Badge */}
          <div className="hidden md:flex items-center gap-2 bg-slate-200/70 text-slate-700 px-2 py-1 rounded-md font-mono text-[11px]">
            <span>X: {fieldConfig.xPercent}%</span>
            <span>Y: {fieldConfig.yPercent}%</span>
            <span>W: {fieldConfig.widthPercent}%</span>
          </div>

          {/* Zoom buttons */}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-2xs">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.1))}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-r-lg transition-colors cursor-pointer"
              title="تصغير المعاينة"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 text-[11px] font-mono text-slate-600 min-w-[45px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.6, z + 0.1))}
              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-l-lg transition-colors cursor-pointer"
              title="تكبير المعاينة"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="relative bg-slate-900/5 p-4 sm:p-8 flex items-center justify-center min-h-[440px] sm:min-h-[520px] overflow-auto select-none">
        <div
          ref={containerRef}
          id="certificate-preview-stage"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging || isResizing ? 'none' : 'transform 0.15s ease-out',
            aspectRatio: `${template.aspectRatio || 1.414}`,
          }}
          className="relative w-full max-w-[920px] shadow-2xl rounded-sm overflow-hidden bg-white border border-slate-300 transition-shadow"
        >
          {/* Certificate Background Image */}
          <img
            src={template.dataUrl}
            alt="قالب الشهادة"
            className="w-full h-full object-contain pointer-events-none block"
            draggable={false}
          />

          {/* Vertical Center Snapping Guide Line */}
          {isNearCenter && (
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 -translate-x-1/2 bg-amber-500/80 pointer-events-none z-10 border-l border-dashed border-amber-600" />
          )}

          {/* Draggable Name Field Box */}
          <div
            id="name-draggable-box"
            onMouseDown={handleMouseDown}
            style={{
              left: `${fieldConfig.xPercent}%`,
              top: `${fieldConfig.yPercent}%`,
              width: `${fieldConfig.widthPercent}%`,
              height: `${fieldConfig.heightPercent}%`,
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
            className={`absolute z-20 group transition-all duration-75 flex items-center justify-center ${
              isDragging
                ? 'ring-2 ring-amber-500 bg-amber-500/10 shadow-lg'
                : 'ring-1.5 ring-amber-500/80 hover:ring-2 hover:ring-amber-600 bg-amber-400/5 hover:bg-amber-400/10'
            }`}
          >
            {/* Top Indicator Label with Move Icon */}
            <div className="absolute -top-7 right-0 left-0 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-slate-900 text-white text-[10px] font-mono px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
                <Move className="w-2.5 h-2.5" />
                اسحب لوضع الاسم ({fieldConfig.xPercent}% , {fieldConfig.yPercent}%)
              </span>
              {isNearCenter && (
                <span className="bg-amber-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                  منتصف متطابق
                </span>
              )}
            </div>

            {/* The Participant Name rendered inside */}
            <div
              style={{
                fontFamily: fieldConfig.fontFamily,
                fontSize: `${fieldConfig.fontSize}px`,
                fontWeight: fieldConfig.fontWeight,
                color: fieldConfig.fontColor,
                textAlign: fieldConfig.textAlign,
                width: '100%',
                paddingLeft: '12px',
                paddingRight: '12px',
                lineHeight: 1.25,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              className="transition-colors duration-100 drop-shadow-2xs pointer-events-none"
            >
              {fieldConfig.prefix}
              {activeParticipant.name}
              {fieldConfig.suffix}
            </div>

            {/* Resize Handles */}
            {/* Right handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'e')}
              className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3.5 h-7 bg-white border-2 border-amber-600 rounded-sm cursor-ew-resize hover:scale-110 shadow-xs z-30"
              title="تعديل عرض المربع"
            />
            {/* Left handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'w')}
              className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-3.5 h-7 bg-white border-2 border-amber-600 rounded-sm cursor-ew-resize hover:scale-110 shadow-xs z-30"
              title="تعديل عرض المربع"
            />
            {/* Bottom-right corner handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 'se')}
              className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-600 border border-white rounded-xs cursor-nwse-resize hover:scale-125 shadow-xs z-30"
              title="تغيير الأبعاد"
            />
            {/* Bottom center handle */}
            <div
              onMouseDown={(e) => handleResizeStart(e, 's')}
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-7 h-3 bg-white border-2 border-amber-600 rounded-sm cursor-ns-resize hover:scale-110 shadow-xs z-30"
              title="تعديل ارتفاع المربع"
            />
          </div>
        </div>
      </div>

      {/* Helpful Hint Bar */}
      <div className="bg-amber-50/60 px-4 py-2 border-t border-amber-100 flex items-center justify-between text-xs text-amber-900">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>اسحب المربع بالماوس لوضعه في المكان المناسب على الشهادة، أو اسحب المقابض الجانبية لتوسيعه.</span>
        </span>
        <span className="font-semibold text-slate-600 hidden sm:inline">
          الدقة: 300 DPI للطباعة
        </span>
      </div>
    </div>
  );
};
