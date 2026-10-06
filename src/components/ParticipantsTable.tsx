import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Trash2,
  Eye,
  Download,
  Check,
  FileCheck,
  Loader2,
  FileText
} from 'lucide-react';
import { Participant } from '../types';

interface ParticipantsTableProps {
  participants: Participant[];
  onAddParticipant: (name: string) => void;
  onRemoveParticipant: (id: string) => void;
  onSelectParticipant: (index: number) => void;
  onDownloadSingle: (participant: Participant) => void;
  activeIndex: number;
  downloadingId?: string | null;
}

export const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  participants,
  onAddParticipant,
  onRemoveParticipant,
  onSelectParticipant,
  onDownloadSingle,
  activeIndex,
  downloadingId = null,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newName, setNewName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.code && p.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onAddParticipant(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">قائمة المستلمين ({participants.length})</h3>
            <p className="text-[11px] text-slate-500">تم استيرادها من ملف Excel ويمكن التعديل عليها</p>
          </div>
        </div>

        {/* Search & Add */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الكود..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pr-8 pl-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 w-44"
            />
          </div>

          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة اسم</span>
          </button>
        </div>
      </div>

      {/* Add Name Quick Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-3 bg-emerald-50/40 border-b border-emerald-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="اكتب الاسم الكامل للمستلم هنا..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
            className="flex-1 text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            حفظ
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(false)}
            className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
          >
            إلغاء
          </button>
        </form>
      )}

      {/* Quick info banner */}
      <div className="px-4 py-2 bg-emerald-50/60 border-b border-emerald-100/80 flex items-center justify-between text-[11px] text-emerald-900 font-medium">
        <span>💡 اضغط على زر <strong className="font-bold text-emerald-950">"تنزيل PDF"</strong> بجانب اسم أي شخص لتنزيل شهادته فوراً بصيغة PDF منفردة.</span>
      </div>

      {/* Table List */}
      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            لا توجد أسماء مطابقة لعملية البحث
          </div>
        ) : (
          filtered.map((participant) => {
            const originalIndex = participants.findIndex((p) => p.id === participant.id);
            const isSelected = originalIndex === activeIndex;
            const isDownloadingThis = downloadingId === participant.id;

            return (
              <div
                key={participant.id}
                className={`flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors text-xs ${
                  isSelected ? 'bg-amber-50/70' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 text-[11px] font-mono text-slate-400 text-center">
                    {originalIndex + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-slate-800 truncate flex items-center gap-1.5">
                      <span>{participant.name}</span>
                      {isSelected && (
                        <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded font-medium">
                          معروض الآن
                        </span>
                      )}
                    </div>
                    {participant.code && (
                      <div className="text-[11px] text-slate-400 font-mono truncate">
                        {participant.code} {participant.role ? `• ${participant.role}` : ''}
                      </div>
                    )}
                  </div>
                </div>

                {/* Row Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Dedicated Prominent Download PDF button */}
                  <button
                    type="button"
                    onClick={() => onDownloadSingle(participant)}
                    disabled={isDownloadingThis}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-950 active:bg-emerald-200 border border-emerald-300 rounded-lg shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                    title={`تنزيل شهادة ${participant.name} بصيغة PDF`}
                  >
                    {isDownloadingThis ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
                    ) : (
                      <Download className="w-3.5 h-3.5 text-emerald-700" />
                    )}
                    <span>تنزيل PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectParticipant(originalIndex)}
                    className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-600 text-white font-medium shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-200'
                    }`}
                    title="معاينة على الشهادة"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(participant.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="حذف من القائمة"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
