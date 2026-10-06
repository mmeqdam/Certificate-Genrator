import * as XLSX from 'xlsx';
import { Participant } from '../types';

export const DEFAULT_SAMPLE_NAMES: string[] = [
  'محمد بن أحمد المنصوري',
  'سارة خالد العتيبي',
  'د. عبد الله بن سعد القحطاني',
  'فاطمة الزهراء الشريف',
  'م. طارق عبد العزيز النجار',
  'نورة بنت فهد السبيعي',
  'Eng. Alexander Wright',
  'ليلى إبراهيم الدوسري',
];

export function getSampleParticipants(): Participant[] {
  return DEFAULT_SAMPLE_NAMES.map((name, index) => ({
    id: `sample-${index + 1}`,
    name,
    code: `CERT-2026-${String(index + 1).padStart(3, '0')}`,
    role: index % 2 === 0 ? 'اجتياز بامتياز' : 'حضور ومشاركة',
  }));
}

export interface ExcelParseResult {
  participants: Participant[];
  columns: string[];
  selectedColumn: string;
  totalFound: number;
}

export async function parseExcelFile(file: File, specifiedCol?: string): Promise<ExcelParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error('الملف لا يحتوي على أي صفحات (Sheets)');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

  if (!jsonData || jsonData.length === 0) {
    throw new Error('الملف فارغ أو لا يحتوي على صفوف بيانات');
  }

  const columns = Object.keys(jsonData[0] || {});
  if (columns.length === 0) {
    throw new Error('تعذر العثور على أعمدة في الملف');
  }

  // Find best name column if not specified
  let selectedColumn = specifiedCol;
  if (!selectedColumn || !columns.includes(selectedColumn)) {
    const nameKeywords = ['name', 'الاسم', 'اسم', 'الأسم', 'طالب', 'المتدرب', 'المشارك', 'student', 'participant', 'full name', 'fullname'];
    selectedColumn = columns.find(col =>
      nameKeywords.some(kw => col.toLowerCase().includes(kw))
    ) || columns[0];
  }

  const participants: Participant[] = [];

  jsonData.forEach((row, idx) => {
    const rawVal = row[selectedColumn];
    const name = rawVal !== undefined && rawVal !== null ? String(rawVal).trim() : '';

    if (name) {
      participants.push({
        id: `p-${idx + 1}-${Date.now()}`,
        name,
        code: row['الكود'] || row['Code'] || row['الرقم'] || row['ID'] || `CERT-${String(idx + 1).padStart(3, '0')}`,
        role: row['التقدير'] || row['Grade'] || row['الصفة'] || '',
        extra: Object.fromEntries(
          Object.entries(row).map(([k, v]) => [k, String(v)])
        ),
      });
    }
  });

  return {
    participants,
    columns,
    selectedColumn,
    totalFound: participants.length,
  };
}

// Download a ready-to-use sample Excel file
export function downloadSampleExcel() {
  const data = [
    { 'الاسم الكامل': 'محمد بن أحمد المنصوري', 'رقم الشهادة': 'CERT-001', 'التقدير': 'ممتاز مرتفع', 'البريد الإلكتروني': 'mohammed@example.com' },
    { 'الاسم الكامل': 'سارة خالد العتيبي', 'رقم الشهادة': 'CERT-002', 'التقدير': 'ممتاز', 'البريد الإلكتروني': 'sara@example.com' },
    { 'الاسم الكامل': 'د. عبد الله بن سعد القحطاني', 'رقم الشهادة': 'CERT-003', 'التقدير': 'مرتبة الشرف', 'البريد الإلكتروني': 'dr.abdullah@example.com' },
    { 'الاسم الكامل': 'فاطمة الزهراء الشريف', 'رقم الشهادة': 'CERT-004', 'التقدير': 'ممتاز مرتفع', 'البريد الإلكتروني': 'fatima@example.com' },
    { 'الاسم الكامل': 'م. طارق عبد العزيز النجار', 'رقم الشهادة': 'CERT-005', 'التقدير': 'ممتاز', 'البريد الإلكتروني': 'tariq@example.com' },
    { 'الاسم الكامل': 'نورة بنت فهد السبيعي', 'رقم الشهادة': 'CERT-006', 'التقدير': 'جيد جداً', 'البريد الإلكتروني': 'noura@example.com' },
    { 'الاسم الكامل': 'Eng. Alexander Wright', 'رقم الشهادة': 'CERT-007', 'التقدير': 'Excellent', 'البريد الإلكتروني': 'alex@example.com' },
    { 'الاسم الكامل': 'ليلى إبراهيم الدوسري', 'رقم الشهادة': 'CERT-008', 'التقدير': 'ممتاز', 'البريد الإلكتروني': 'laila@example.com' },
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  // Column widths
  ws['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 28 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'قائمة المشاركين');
  XLSX.writeFile(wb, 'نموذج_أسماء_الشهادات.xlsx');
}
