import { AvailableFont } from '../types';

export const AVAILABLE_FONTS: AvailableFont[] = [
  {
    id: 'cairo',
    name: 'Cairo',
    nameAr: 'خط كايرو (عصري وواضح)',
    family: "'Cairo', sans-serif",
    category: 'arabic',
  },
  {
    id: 'amiri',
    name: 'Amiri',
    nameAr: 'خط أميري (نسخي كلاسيكي فخم)',
    family: "'Amiri', serif",
    category: 'arabic',
  },
  {
    id: 'tajawal',
    name: 'Tajawal',
    nameAr: 'خط تجوال (هندسي رشيق)',
    family: "'Tajawal', sans-serif",
    category: 'arabic',
  },
  {
    id: 'almarai',
    name: 'Almarai',
    nameAr: 'خط المراعي (رسمي ومعاصر)',
    family: "'Almarai', sans-serif",
    category: 'arabic',
  },
  {
    id: 'alex-brush',
    name: 'Alex Brush',
    nameAr: 'Alex Brush (مخطوطة لاتينية انسيابية)',
    family: "'Alex Brush', cursive",
    category: 'calligraphy',
  },
  {
    id: 'great-vibes',
    name: 'Great Vibes',
    nameAr: 'Great Vibes (خط شهادات ملكي لاتيني)',
    family: "'Great Vibes', cursive",
    category: 'calligraphy',
  },
  {
    id: 'playfair',
    name: 'Playfair Display',
    nameAr: 'Playfair Display (سيريف أكاديمي)',
    family: "'Playfair Display', serif",
    category: 'english',
  },
  {
    id: 'montserrat',
    name: 'Montserrat',
    nameAr: 'Montserrat (أنيق وقوي)',
    family: "'Montserrat', sans-serif",
    category: 'english',
  },
];

export const COLOR_PRESETS = [
  { name: 'كحلي داكن ملكي', value: '#0f172a' },
  { name: 'ذهبي كلاسيكي', value: '#b45309' },
  { name: 'ذهبي برونزي', value: '#d97706' },
  { name: 'رمادي فحمي', value: '#1e293b' },
  { name: 'أزرق ياقوتي', value: '#1e40af' },
  { name: 'زمردي داكن', value: '#065f46' },
  { name: 'عنابي فاخر', value: '#831843' },
  { name: 'أسود خالص', value: '#000000' },
];
