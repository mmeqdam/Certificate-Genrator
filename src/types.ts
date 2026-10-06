export interface CertificateTemplate {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'svg';
  dataUrl: string; // Base64 data URL for preview rendering
  pdfBytes?: Uint8Array; // Original PDF bytes if uploaded as PDF
  aspectRatio: number; // width / height
  width: number;
  height: number;
  originalFileName?: string;
  fileSize?: string;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
  code?: string;
  role?: string;
  extra?: Record<string, string>;
}

export interface FieldConfig {
  xPercent: number; // 0 to 100 relative to certificate width
  yPercent: number; // 0 to 100 relative to certificate height
  widthPercent: number; // 10 to 100
  heightPercent: number; // 5 to 50
  fontSize: number; // in pt/px at reference scale
  fontFamily: string;
  fontWeight: string; // '400' | '600' | '700' | '800' | 'bold'
  fontColor: string; // Hex color
  textAlign: 'center' | 'right' | 'left';
  prefix: string; // Optional: e.g. "المكرم / "
  suffix: string; // Optional
  showBorderGuide: boolean; // Visual bounding box in editor
}

export interface GenerationProgress {
  isGenerating: boolean;
  total: number;
  completed: number;
  percentage: number;
  currentName: string;
  isComplete: boolean;
  zipBlob?: Blob;
  downloadUrl?: string;
  error?: string;
  mode: 'client' | 'server';
}

export interface AvailableFont {
  id: string;
  name: string;
  nameAr: string;
  family: string;
  category: 'arabic' | 'english' | 'calligraphy';
}
