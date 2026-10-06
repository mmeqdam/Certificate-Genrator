import { CertificateTemplate } from '../types';

// Creates an SVG template string and converts it to a Data URL
function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

export const SAMPLE_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'royal-gold',
    name: 'شهادة تقدير ذهبية ملكية (Classic Royal)',
    type: 'svg',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1131" width="1600" height="1131">
        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#b45309" />
            <stop offset="35%" stop-color="#f59e0b" />
            <stop offset="50%" stop-color="#fef3c7" />
            <stop offset="70%" stop-color="#d97706" />
            <stop offset="100%" stop-color="#92400e" />
          </linearGradient>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#ffffff" />
            <stop offset="100%" stop-color="#fafaf9" />
          </linearGradient>
          <pattern id="guilloche" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 0 40 Q 20 0 40 40 T 80 40" fill="none" stroke="#f59e0b" stroke-opacity="0.07" stroke-width="1.5"/>
            <path d="M 0 40 Q 20 80 40 40 T 80 40" fill="none" stroke="#f59e0b" stroke-opacity="0.07" stroke-width="1.5"/>
          </pattern>
        </defs>

        <!-- Background -->
        <rect width="1600" height="1131" fill="url(#bgGrad)" />
        <rect width="1600" height="1131" fill="url(#guilloche)" />

        <!-- Outer Border -->
        <rect x="35" y="35" width="1530" height="1061" fill="none" stroke="url(#goldGrad)" stroke-width="14" rx="10"/>
        <rect x="55" y="55" width="1490" height="1021" fill="none" stroke="#1e293b" stroke-width="2" rx="6"/>
        <rect x="65" y="65" width="1470" height="1001" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="6,6"/>

        <!-- Corner Ornaments -->
        <g fill="url(#goldGrad)">
          <!-- Top Left -->
          <polygon points="65,65 140,65 140,75 75,75 75,140 65,140" />
          <circle cx="95" cy="95" r="8" />
          <!-- Top Right -->
          <polygon points="1535,65 1460,65 1460,75 1525,75 1525,140 1535,140" />
          <circle cx="1505" cy="95" r="8" />
          <!-- Bottom Left -->
          <polygon points="65,1065 140,1065 140,1055 75,1055 75,990 65,990" />
          <circle cx="95" cy="1035" r="8" />
          <!-- Bottom Right -->
          <polygon points="1535,1065 1460,1065 1460,1055 1525,1055 1525,990 1535,990" />
          <circle cx="1505" cy="1035" r="8" />
        </g>

        <!-- Header Ribbon / Badge -->
        <g transform="translate(800, 160)" text-anchor="middle">
          <circle cx="0" cy="0" r="46" fill="#1e293b" stroke="url(#goldGrad)" stroke-width="5"/>
          <!-- Star icon -->
          <polygon points="0,-24 7,-8 24,-7 12,6 16,23 0,14 -16,23 -12,6 -24,-7 -7,-8" fill="url(#goldGrad)"/>
        </g>

        <!-- Title Texts -->
        <text x="800" y="275" text-anchor="middle" font-family="'Amiri', serif" font-size="52" font-weight="700" fill="#0f172a" letter-spacing="2">شــهادة شــكر وتـقـدير</text>
        <text x="800" y="325" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="20" font-weight="600" fill="#b45309" letter-spacing="4">CERTIFICATE OF APPRECIATION</text>

        <!-- Subtitle and Description -->
        <text x="800" y="405" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="24" fill="#64748b">تُمنح هذه الشهادة بكل فخر واعتزاز إلى</text>

        <!-- Space for Name Box around Y=470 to Y=590 -->
        <!-- Decorative subtle line under name area -->
        <line x1="450" y1="585" x2="1150" y2="585" stroke="url(#goldGrad)" stroke-width="2" stroke-dasharray="12,6"/>
        <circle cx="800" cy="585" r="5" fill="#d97706"/>

        <!-- Body text -->
        <text x="800" y="660" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="22" fill="#334155">
          تقديراً لمشاركته المتميزة وجهوده الاستثنائية وتفانيه في إنجاز متطلبات البرنامج التدريبي بنجاح
        </text>
        <text x="800" y="700" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="19" fill="#64748b">
          متمنين له دوام التوفيق والنجاح ومزيداً من العطاء والإبداع المستمر
        </text>

        <!-- Signatures and Footer -->
        <!-- Right Signature -->
        <g transform="translate(420, 910)" text-anchor="middle">
          <line x1="-120" y1="0" x2="120" y2="0" stroke="#94a3b8" stroke-width="1.5"/>
          <text x="0" y="35" font-family="'Cairo', sans-serif" font-size="18" font-weight="700" fill="#0f172a">المشرف العام</text>
          <text x="0" y="60" font-family="'Cairo', sans-serif" font-size="14" fill="#64748b">إدارة التدريب والتطوير</text>
        </g>

        <!-- Golden Seal Center -->
        <g transform="translate(800, 890)" text-anchor="middle">
          <circle cx="0" cy="0" r="45" fill="none" stroke="url(#goldGrad)" stroke-width="4"/>
          <circle cx="0" cy="0" r="38" fill="none" stroke="url(#goldGrad)" stroke-width="1" stroke-dasharray="4,4"/>
          <text x="0" y="6" font-family="'Cairo', sans-serif" font-size="13" font-weight="700" fill="#b45309">معتمد رسميـاً</text>
        </g>

        <!-- Left Signature -->
        <g transform="translate(1180, 910)" text-anchor="middle">
          <line x1="-120" y1="0" x2="120" y2="0" stroke="#94a3b8" stroke-width="1.5"/>
          <text x="0" y="35" font-family="'Cairo', sans-serif" font-size="18" font-weight="700" fill="#0f172a">رئيس مجلس الإدارة</text>
          <text x="0" y="60" font-family="'Cairo', sans-serif" font-size="14" fill="#64748b">الاعتماد والتصديق</text>
        </g>
      </svg>
    `),
    aspectRatio: 1600 / 1131,
    width: 1600,
    height: 1131,
  },
  {
    id: 'modern-navy',
    name: 'شهادة إتمام دورة تدريبية (Modern Navy & Emerald)',
    type: 'svg',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1131" width="1600" height="1131">
        <defs>
          <linearGradient id="navyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="100%" stop-color="#1e293b" />
          </linearGradient>
          <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#059669" />
            <stop offset="100%" stop-color="#10b981" />
          </linearGradient>
        </defs>

        <!-- Background -->
        <rect width="1600" height="1131" fill="#f8fafc" />

        <!-- Geometric header / side accents -->
        <polygon points="0,0 500,0 420,160 0,160" fill="url(#navyGrad)" />
        <polygon points="430,0 530,0 470,120 370,120" fill="url(#emeraldGrad)" opacity="0.9" />

        <polygon points="1600,1131 1100,1131 1180,971 1600,971" fill="url(#navyGrad)" />
        <polygon points="1170,1131 1070,1131 1130,1011 1230,1011" fill="url(#emeraldGrad)" opacity="0.9" />

        <!-- Inner clean border -->
        <rect x="50" y="50" width="1500" height="1031" fill="none" stroke="#e2e8f0" stroke-width="2" rx="12" />

        <!-- Organization Logo / Name -->
        <text x="800" y="210" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="20" font-weight="700" fill="#059669" letter-spacing="3">أكاديمية التدريب والاحتراف الرقمي</text>
        <text x="800" y="280" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="54" font-weight="900" fill="#0f172a">شهادة إتمام برنامج تدريبي</text>
        <text x="800" y="325" text-anchor="middle" font-family="'Montserrat', sans-serif" font-size="18" font-weight="600" fill="#64748b" letter-spacing="5">CERTIFICATE OF COMPLETION</text>

        <text x="800" y="415" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="24" fill="#475569">تشهد إدارة الأكاديمية بأن المتدرب المتميز:</text>

        <!-- Name line placeholder area around Y=520 -->
        <line x1="420" y1="570" x2="1180" y2="570" stroke="#059669" stroke-width="3" />

        <text x="800" y="650" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="22" font-weight="600" fill="#1e293b">
          قد أتم بنجاح كافة متطلبات الدورة التدريبية واجتاز الاختبارات العملية بكفاءة واقتدار
        </text>

        <g transform="translate(500, 890)" text-anchor="middle">
          <line x1="-100" y1="0" x2="100" y2="0" stroke="#cbd5e1" stroke-width="2"/>
          <text x="0" y="30" font-family="'Cairo', sans-serif" font-size="17" font-weight="700" fill="#0f172a">مدرب الدورة</text>
        </g>

        <g transform="translate(1100, 890)" text-anchor="middle">
          <line x1="-100" y1="0" x2="100" y2="0" stroke="#cbd5e1" stroke-width="2"/>
          <text x="0" y="30" font-family="'Cairo', sans-serif" font-size="17" font-weight="700" fill="#0f172a">المدير التنفيذي</text>
        </g>
      </svg>
    `),
    aspectRatio: 1600 / 1131,
    width: 1600,
    height: 1131,
  },
  {
    id: 'academic-diploma',
    name: 'شهادة تفوق وتميز أكاديمي (Academic Honors)',
    type: 'svg',
    dataUrl: svgToDataUrl(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1131" width="1600" height="1131">
        <defs>
          <radialGradient id="vignette" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#ffffff"/>
            <stop offset="100%" stop-color="#f1f5f9"/>
          </radialGradient>
        </defs>

        <rect width="1600" height="1131" fill="url(#vignette)" />

        <!-- Double Frame -->
        <rect x="40" y="40" width="1520" height="1051" fill="none" stroke="#1e293b" stroke-width="6" rx="4"/>
        <rect x="52" y="52" width="1496" height="1027" fill="none" stroke="#64748b" stroke-width="1.5" rx="2"/>

        <g transform="translate(800, 170)" text-anchor="middle">
          <circle cx="0" cy="0" r="38" fill="#1e293b" />
          <path d="M-15,5 L0,-15 L15,5 L0,2 Z" fill="#ffffff" />
        </g>

        <text x="800" y="270" text-anchor="middle" font-family="'Amiri', serif" font-size="56" font-weight="700" fill="#0f172a">شهادة تميز وتكريم</text>
        <text x="800" y="320" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="20" fill="#64748b">ACADEMIC EXCELLENCE AWARD</text>

        <text x="800" y="410" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="24" fill="#334155">تمنح هذه الشهادة تقديراً للتفوق والريادة إلى</text>

        <!-- Underline -->
        <line x1="400" y1="575" x2="1200" y2="575" stroke="#94a3b8" stroke-width="2" stroke-dasharray="8,4" />

        <text x="800" y="660" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="22" fill="#334155">
          تقديراً لحصوله على المركز الأول والأداء الاستثنائي المشرف
        </text>

        <g transform="translate(450, 920)" text-anchor="middle">
          <line x1="-120" y1="0" x2="120" y2="0" stroke="#94a3b8" stroke-width="1.5"/>
          <text x="0" y="30" font-family="'Tajawal', sans-serif" font-size="18" font-weight="700" fill="#0f172a">عميد الكلية</text>
        </g>

        <g transform="translate(1150, 920)" text-anchor="middle">
          <line x1="-120" y1="0" x2="120" y2="0" stroke="#94a3b8" stroke-width="1.5"/>
          <text x="0" y="30" font-family="'Tajawal', sans-serif" font-size="18" font-weight="700" fill="#0f172a">رئيس الجامعة</text>
        </g>
      </svg>
    `),
    aspectRatio: 1600 / 1131,
    width: 1600,
    height: 1131,
  },
];
