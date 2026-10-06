import React from 'react';
import {
  Type,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Sliders,
  Sparkles,
  TextCursorInput
} from 'lucide-react';
import { FieldConfig } from '../types';
import { AVAILABLE_FONTS, COLOR_PRESETS } from '../utils/fonts';

interface StylingControlsProps {
  fieldConfig: FieldConfig;
  onChange: (updates: Partial<FieldConfig>) => void;
}

export const StylingControls: React.FC<StylingControlsProps> = ({
  fieldConfig,
  onChange,
}) => {
  const fontSizes = [28, 36, 44, 52, 60, 72];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">تخصيص الخط والاسم</h3>
            <p className="text-[11px] text-slate-500">تحكم بالنوع والحجم والألوان والوزن</p>
          </div>
        </div>
      </div>

      {/* 1. Font Family */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Type className="w-3.5 h-3.5 text-amber-600" />
          <span>نوع الخط (Font Family):</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {AVAILABLE_FONTS.map((font) => (
            <button
              key={font.id}
              type="button"
              onClick={() => onChange({ fontFamily: font.family })}
              className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                fieldConfig.fontFamily === font.family
                  ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 text-amber-950 font-bold shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="text-xs font-semibold">{font.name}</div>
              <div
                style={{ fontFamily: font.family }}
                className="text-base truncate mt-0.5 text-slate-900"
              >
                محمد أحمد
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Font Size & Weight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Font Size */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">حجم الخط (Size):</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="16"
                max="100"
                value={fieldConfig.fontSize}
                onChange={(e) => onChange({ fontSize: Number(e.target.value) || 36 })}
                className="w-14 px-2 py-0.5 text-center text-xs font-mono font-bold bg-slate-100 border border-slate-300 rounded focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-xs text-slate-500">px</span>
            </div>
          </div>

          <input
            type="range"
            min="18"
            max="80"
            step="1"
            value={fieldConfig.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="w-full accent-amber-600 cursor-pointer"
          />

          <div className="flex items-center justify-between gap-1 pt-1">
            {fontSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChange({ fontSize: size })}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors cursor-pointer ${
                  fieldConfig.fontSize === size
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Font Weight & Alignment */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700">سُمك الخط والمحاذاة:</label>
          <div className="grid grid-cols-2 gap-2">
            {/* Alignment */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => onChange({ textAlign: 'right' })}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  fieldConfig.textAlign === 'right'
                    ? 'bg-white shadow-xs text-amber-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="محاذاة لليمين"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange({ textAlign: 'center' })}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  fieldConfig.textAlign === 'center'
                    ? 'bg-white shadow-xs text-amber-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="محاذاة في الوسط"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onChange({ textAlign: 'left' })}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                  fieldConfig.textAlign === 'left'
                    ? 'bg-white shadow-xs text-amber-700 font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="محاذاة لليسار"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Weight */}
            <select
              value={fieldConfig.fontWeight}
              onChange={(e) => onChange({ fontWeight: e.target.value })}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              <option value="400">عادي (Regular)</option>
              <option value="600">شبه عريض (Semi-Bold)</option>
              <option value="700">عريض (Bold)</option>
              <option value="800">عريض جداً (Extra Bold)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Font Color & Quick Palette */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-amber-600" />
          <span>لون الخط (Color):</span>
        </label>
        <div className="flex flex-wrap items-center gap-2">
          {/* Custom color picker */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-300 rounded-xl p-1.5 pl-3">
            <input
              type="color"
              value={fieldConfig.fontColor}
              onChange={(e) => onChange({ fontColor: e.target.value })}
              className="w-7 h-7 rounded-lg border-0 cursor-pointer bg-transparent"
            />
            <span className="font-mono text-xs font-bold text-slate-800 uppercase">
              {fieldConfig.fontColor}
            </span>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => onChange({ fontColor: color.value })}
                className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                  fieldConfig.fontColor.toLowerCase() === color.value.toLowerCase()
                    ? 'border-amber-500 scale-110 shadow-xs ring-2 ring-amber-300'
                    : 'border-white shadow-2xs hover:scale-105'
                }`}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 4. Optional Prefix / Suffix */}
      <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1">
            <TextCursorInput className="w-3 h-3 text-slate-400" />
            <span>لقب قبل الاسم (اختياري):</span>
          </label>
          <input
            type="text"
            placeholder="مثال: المكرم / أو الأستاذ /"
            value={fieldConfig.prefix}
            onChange={(e) => onChange({ prefix: e.target.value })}
            className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 text-slate-800"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-1">
            <span>عرض صندوق الاسم:</span>
            <span className="text-slate-400 font-mono">({fieldConfig.widthPercent}%)</span>
          </label>
          <input
            type="range"
            min="20"
            max="95"
            value={fieldConfig.widthPercent}
            onChange={(e) => onChange({ widthPercent: Number(e.target.value) })}
            className="w-full accent-amber-600 cursor-pointer mt-2"
          />
        </div>
      </div>
    </div>
  );
};
