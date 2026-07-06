import { queryRows } from "@/lib/db";
import { getOit2569Item, itaCodeNumber, oit2569Items } from "@/lib/ita-oit-2569";
import { normalizeLegacyUrl, publicAssetPath } from "@/lib/legacy-paths";
import { parseLinkItems, parseMediaItems, type MediaItem, type MediaLinkItem } from "@/lib/media-fields";
import { defaultThemePresetId, isThemePresetId, type SiteThemePresetId } from "@/lib/site-theme";

export type NavItem = {
  id?: number;
  itemKey: string;
  label: string;
  href: string;
  children?: NavItem[];
};

export type QuickLink = {
  itemKey: string;
  label: string;
  href: string;
};

export type ContentItem = {
  id: number;
  title: string;
  description?: string;
  content?: string;
  category?: string;
  categoryId?: number;
  categorySlug?: string;
  href: string;
  status?: string;
  date?: string;
  image?: string;
  metric?: string;
  isFeatured?: boolean;
  galleryImages?: MediaItem[];
  attachments?: MediaItem[];
  externalLinks?: MediaLinkItem[];
  syncToDownloads?: boolean;
};

export type NewsCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string;
};

export type ContentPageItem = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  body: string;
  contentType?: string;
  coverImage?: string;
  attachmentPath?: string;
  sourceUrl?: string;
  navKey?: string;
  status: string;
  href: string;
};

export type ServiceItem = {
  id: number;
  title: string;
  description: string;
  department: string;
  processingTime: string;
  href: string;
};

export type CourseDepartment = {
  name: string;
  href?: string;
};

export type CourseGroup = {
  id: number;
  level: string;
  title: string;
  description: string;
  departments: CourseDepartment[];
};

export type ItaItem = {
  id: number;
  code: string;
  title: string;
  category: string;
  status: string;
  href: string;
  description?: string;
  fiscalYear?: string;
  responsiblePerson?: string;
};

export type SiteSettings = {
  collegeName: string;
  collegeNameEn: string;
  slogan: string;
  contactEmail: string;
  contactPhone: string;
  contactFax: string;
  address: string;
  themePreset: SiteThemePresetId;
};

export type SiteOverview = {
  settings: SiteSettings;
  navigation: NavItem[];
  quickLinks: QuickLink[];
  contentPages: ContentPageItem[];
  newsCategories: NewsCategory[];
  news: ContentItem[];
  documents: ContentItem[];
  procurement: ContentItem[];
  plans: ContentItem[];
  services: ServiceItem[];
  courseGroups: CourseGroup[];
  ita: ItaItem[];
};

export type AdminModule = {
  key: string;
  label: string;
  table: string;
  permission: string;
  description: string;
};

type RawNavigation = {
  id: number;
  item_key: string;
  parent_id: number | null;
  label: string;
  url: string;
  sort_order: number;
};

type RawSetting = {
  setting_key: string;
  setting_value: string;
};

type RawContentPage = {
  id: number;
  slug: string;
  title: string;
  summary: string | null;
  body: string | null;
  content_type?: string | null;
  cover_image?: string | null;
  attachment_path?: string | null;
  source_url?: string | null;
  nav_key: string | null;
  status: string;
};

type RawDate = string | Date | null;

type RawNews = {
  id: number;
  title: string;
  slug: string;
  cover_image: string | null;
  summary: string | null;
  content?: string | null;
  status: string;
  published_at: RawDate;
  view_count: number | null;
  category_id: number | null;
  category_name: string | null;
  category_slug: string | null;
  is_featured?: number | null;
  featured_sort_order?: number | null;
  gallery_images?: string | null;
  attachment_files?: string | null;
  external_links?: string | null;
  sync_to_downloads?: number | null;
};

let optionalNewsMediaSelectCache: string | null = null;

async function getOptionalNewsMediaSelect(): Promise<string> {
  if (optionalNewsMediaSelectCache !== null) {
    return optionalNewsMediaSelectCache;
  }

  const rows = await queryRows<{ Field: string }>("SHOW COLUMNS FROM news");
  const columns = new Set(rows?.map((row) => row.Field) ?? []);
  const optionalColumns = ["gallery_images", "attachment_files", "external_links", "sync_to_downloads"];
  const selectClause = optionalColumns
    .map((column) => (columns.has(column) ? `n.${column}` : `NULL AS ${column}`))
    .join(", ");

  if (optionalColumns.every((column) => columns.has(column))) {
    optionalNewsMediaSelectCache = selectClause;
  }

  return selectClause;
}

const settingsFallback: SiteSettings = {
  collegeName: "วิทยาลัยสารพัดช่างสุรินทร์",
  collegeNameEn: "Surin Polytechnic College",
  slogan: "เรียนดี มีความสุข | ทักษะเด่น เน้นคุณธรรม",
  contactEmail: "contact@srpoly.ac.th",
  contactPhone: "044-514414",
  contactFax: "044-519343",
  address: "778 หมู่ 20 บ้านหนองโตงพัฒนา ตำบลนอกเมือง อำเภอเมืองสุรินทร์ จังหวัดสุรินทร์ 32000",
  themePreset: defaultThemePresetId,
};

const navigationFallback: NavItem[] = [
  { itemKey: "home", label: "หน้าหลัก", href: "/" },
  {
    itemKey: "about",
    label: "เกี่ยวกับวิทยาลัย",
    href: "/about",
    children: [
      { itemKey: "about-structure", label: "โครงสร้างการบริหาร", href: "/content/administrative-structure" },
      { itemKey: "about-administrators", label: "คณะผู้บริหาร", href: "/content/administrators" },
      { itemKey: "about-board", label: "คณะกรรมการวิทยาลัย", href: "/content/college-board" },
      { itemKey: "about-management-board", label: "คณะกรรมการบริหารสถานศึกษา", href: "/content/school-management-board" },
      { itemKey: "about-authority", label: "อำนาจหน้าที่", href: "/content/authority" },
      { itemKey: "about-student-data", label: "ข้อมูลผู้เรียน", href: "/students#student-data" },
      { itemKey: "about-personnel-data", label: "ข้อมูลบุคลากร", href: "/content/personnel-data" },
    ],
  },
  { itemKey: "departments", label: "หน่วยงาน", href: "/departments" },
  { itemKey: "students", label: "นักเรียน/นักศึกษา", href: "/students" },
  {
    itemKey: "services",
    label: "บริการ",
    href: "/services",
    children: [
      { itemKey: "service-admission", label: "ระบบสมัครเรียน", href: "https://admission.vec.go.th" },
      { itemKey: "service-rms", label: "RMS", href: "https://rms.srpoly.ac.th" },
      { itemKey: "service-std02", label: "ศธ.02 ออนไลน์", href: "https://std2018.vec.go.th/web/" },
    ],
  },
  { itemKey: "news", label: "ข่าวสาร", href: "/news" },
  { itemKey: "documents", label: "ดาวน์โหลดเอกสาร", href: "/documents" },
  {
    itemKey: "ita",
    label: "ITA",
    href: "/ita",
    children: [
      { itemKey: "ita-eit", label: "ระบบประเมินคุณธรรมและความโปร่งใส", href: "/content/ita-assessment" },
      { itemKey: "ita-oit", label: "การเปิดเผยข้อมูลสาธารณะ (OIT)", href: "/content/oit" },
    ],
  },
  {
    itemKey: "contact",
    label: "ติดต่อเรา",
    href: "/contact",
    children: [
      { itemKey: "contact-complaint", label: "แจ้งข้อเสนอแนะ/ร้องเรียน", href: "/complaint" },
      { itemKey: "contact-faq", label: "FAQs", href: "/content/faq" },
    ],
  },
];

const quickLinksFallback: QuickLink[] = [
  { itemKey: "admission", label: "ระบบสมัครเรียนออนไลน์", href: "#" },
  { itemKey: "rms", label: "RMS", href: "#" },
  { itemKey: "std02", label: "ศธ.02 ออนไลน์", href: "#" },
  { itemKey: "vcop", label: "V-COP", href: "#" },
  { itemKey: "dve-data", label: "DVE-DATA", href: "#" },
  { itemKey: "movec", label: "M-OVEC", href: "#" },
  { itemKey: "quality", label: "งานประกันคุณภาพ", href: "/plans" },
  { itemKey: "budget-report", label: "รายงานงบทดลอง", href: "/trial-balance" },
];

const contentPagesFallback: ContentPageItem[] = [
  {
    id: 1,
    slug: "administrative-structure",
    title: "โครงสร้างการบริหาร",
    summary: "แผนผังโครงสร้างการบริหารและการมอบหมายงานของวิทยาลัย",
    body: "วิทยาลัยจัดโครงสร้างการบริหารเป็นฝ่ายงานหลัก เพื่อสนับสนุนการจัดการอาชีวศึกษาและบริการชุมชน",
    navKey: "about",
    status: "published",
    href: "/content/administrative-structure",
  },
  {
    id: 2,
    slug: "faq",
    title: "FAQs",
    summary: "คำถามที่พบบ่อยของวิทยาลัยสารพัดช่างสุรินทร์",
    body: "รวบรวมคำถามที่พบบ่อยเกี่ยวกับสถานศึกษา หลักสูตร และช่องทางการติดต่อ",
    navKey: "contact",
    status: "published",
    href: "/content/faq",
  },
  {
    id: 3,
    slug: "oit",
    title: "การเปิดเผยข้อมูลสาธารณะ OIT 2569",
    summary: "Open Data Integrity and Transparency Assessment สำหรับสถานศึกษาอาชีวศึกษา ปีงบประมาณ พ.ศ. 2569",
    body:
      '<div class="content-card content-card--accent"><h2>การเปิดเผยข้อมูลสาธารณะ OIT 2569</h2><p>รวบรวมข้อมูลเปิดเผยต่อสาธารณะของวิทยาลัยตามเกณฑ์ ITA สถานศึกษาอาชีวศึกษา ปีงบประมาณ พ.ศ. 2569 จำนวน 23 ข้อ ครอบคลุมตัวชี้วัดที่ 9 การเปิดเผยข้อมูล และตัวชี้วัดที่ 10 การป้องกันการทุจริต</p></div><div class="content-section-grid"><div class="content-card"><h3>ตัวชี้วัดที่ 9: O1-O17</h3><p>ข้อมูลพื้นฐาน การบริหารงาน จัดซื้อจัดจ้าง การปฏิบัติหน้าที่ และการบริหารทรัพยากรบุคคล</p></div><div class="content-card"><h3>ตัวชี้วัดที่ 10: O18-O23</h3><p>แนวทางร้องเรียนการทุจริต No Gift Policy ควบคุมภายใน วัฒนธรรมสุจริต และมาตรการส่งเสริมคุณธรรมความโปร่งใส</p></div></div><div class="info-note"><h3>เปิดรายการ OIT ทั้งหมด</h3><p><a class="text-link" href="/ita">ดูศูนย์ ITA / OIT 2569</a></p></div>',
    navKey: "ita",
    status: "published",
    href: "/content/oit",
  },
];

const newsFallback: ContentItem[] = [
  {
    id: 1,
    title: "เปิดรับสมัครนักศึกษาใหม่ ประจำปีการศึกษา 2569",
    description: "เปิดรับสมัครนักศึกษาใหม่ พร้อมหลักสูตรอาชีพที่ตอบโจทย์ตลาดแรงงาน",
    category: "รับสมัครนักศึกษา",
    categoryId: 1,
    categorySlug: "admission",
    href: "/news/1",
    status: "published",
    date: "2026-06-17",
    image: publicAssetPath("/assets/images/hero-campus.png"),
    metric: "126 ครั้ง",
    isFeatured: true,
  },
  {
    id: 2,
    title: "กิจกรรม Fix it Center บริการชุมชน",
    description: "นักเรียน นักศึกษา และครูร่วมให้บริการซ่อมบำรุงเบื้องต้นแก่ประชาชนในพื้นที่",
    category: "กิจกรรมวิทยาลัย",
    categoryId: 2,
    categorySlug: "activities",
    href: "/news/2",
    status: "published",
    date: "2026-06-12",
    image: publicAssetPath("/assets/images/hero-campus.png"),
    metric: "88 ครั้ง",
  },
  {
    id: 3,
    title: "ลงนามความร่วมมือพัฒนาทักษะอาชีพกับสถานประกอบการ",
    description: "ยกระดับทักษะวิชาชีพและเพิ่มโอกาสฝึกประสบการณ์จริง",
    category: "ความร่วมมือ MOU",
    categoryId: 4,
    categorySlug: "mou",
    href: "/news/3",
    status: "published",
    date: "2026-06-05",
    image: publicAssetPath("/assets/images/hero-campus.png"),
    metric: "74 ครั้ง",
  },
];

const newsCategoriesFallback: NewsCategory[] = [
  { id: 1, name: "ประชาสัมพันธ์ทั่วไป", slug: "general" },
  { id: 2, name: "งานกิจกรรม", slug: "activities" },
  { id: 3, name: "จัดซื้อจัดจ้าง", slug: "procurement" },
  { id: 4, name: "ประกาศ", slug: "announcements" },
];

const documentsFallback: ContentItem[] = [
  {
    id: 1,
    title: "คู่มือการให้บริการขอเอกสารทางการศึกษา",
    description: "ขั้นตอน ระยะเวลา เอกสารประกอบ และช่องทางติดต่อสำหรับขอเอกสารทางการศึกษา",
    category: "คู่มือการให้บริการ",
    href: "/documents/1",
    status: "published",
    date: "2026-06-17",
    metric: "PDF",
  },
  {
    id: 2,
    title: "แบบฟอร์มคำร้องทั่วไป",
    description: "แบบฟอร์มสำหรับยื่นคำร้องด้านทะเบียนและบริการนักเรียน นักศึกษา",
    category: "เอกสารนักเรียน",
    href: "/documents/2",
    status: "published",
    date: "2026-06-16",
    metric: "PDF",
  },
  {
    id: 3,
    title: "รายงานผลการดำเนินงานประจำปี",
    description: "รายงานผลการดำเนินงานและผลสัมฤทธิ์ตามแผนปฏิบัติราชการ",
    category: "เอกสาร ITA",
    href: "/documents/3",
    status: "published",
    date: "2026-06-15",
    metric: "O9",
  },
];

const procurementFallback: ContentItem[] = [
  {
    id: 1,
    title: "แผนการจัดซื้อจัดจ้าง ประจำปีงบประมาณ 2569",
    category: "แผนจัดซื้อจัดจ้าง",
    href: "/procurement/1",
    status: "published",
    date: "2026-06-17",
    metric: "1,250,000 บาท",
  },
  {
    id: 2,
    title: "ประกาศราคากลางครุภัณฑ์ห้องปฏิบัติการ",
    category: "ราคากลาง",
    href: "/procurement/2",
    status: "published",
    date: "2026-06-15",
    metric: "350,000 บาท",
  },
  {
    id: 3,
    title: "สรุปผลการจัดซื้อจัดจ้างประจำเดือน",
    category: "สรุปผลจัดซื้อจัดจ้าง",
    href: "/procurement/3",
    status: "published",
    date: "2026-06-10",
    metric: "เผยแพร่แล้ว",
  },
];

const plansFallback: ContentItem[] = [
  {
    id: 1,
    title: "แผนพัฒนาสถานศึกษา พ.ศ. 2569-2572",
    category: "แผนพัฒนาสถานศึกษา",
    href: "/plans/1",
    status: "published",
    date: "2026-06-17",
  },
  {
    id: 2,
    title: "แผนปฏิบัติราชการประจำปีงบประมาณ 2569",
    category: "แผนปฏิบัติราชการ",
    href: "/plans/2",
    status: "published",
    date: "2026-06-16",
  },
  {
    id: 3,
    title: "รายงานการประเมินตนเอง SAR",
    category: "SAR",
    href: "/plans/3",
    status: "published",
    date: "2026-06-12",
  },
];

const servicesFallback: ServiceItem[] = [
  {
    id: 1,
    title: "ระบบสมัครเรียนออนไลน์",
    description: "สมัครเรียนและติดตามประกาศรับสมัครผ่านระบบออนไลน์",
    department: "งานทะเบียน",
    processingTime: "ภายใน 3 วันทำการ",
    href: "#",
  },
  {
    id: 2,
    title: "ขอเอกสารทางการศึกษาออนไลน์",
    description: "ยื่นคำร้องขอใบรับรองหรือเอกสารทางการศึกษา",
    department: "งานทะเบียน",
    processingTime: "1-3 วันทำการ",
    href: "#",
  },
  {
    id: 3,
    title: "แจ้งซ่อมออนไลน์",
    description: "แจ้งซ่อมอาคาร อุปกรณ์ หรือระบบสารสนเทศของวิทยาลัย",
    department: "งานอาคารสถานที่",
    processingTime: "ตามลำดับงาน",
    href: "#",
  },
  {
    id: 4,
    title: "แบบฟอร์มคำร้องออนไลน์",
    description: "รวมแบบฟอร์มคำร้องและเอกสารที่ใช้บ่อย",
    department: "งานทะเบียน",
    processingTime: "ขึ้นอยู่กับประเภทคำร้อง",
    href: "/documents",
  },
];

const courseGroupsFallback: CourseGroup[] = [
  {
    id: 1,
    level: "ปวช.",
    title: "ประกาศนียบัตรวิชาชีพ",
    description: "หลักสูตรสายอาชีพสำหรับผู้สำเร็จการศึกษาระดับมัธยมศึกษาตอนต้น",
    departments: [
      { name: "ช่างยนต์", href: "https://www.facebook.com/AutoMechanicSRPC" },
      { name: "ช่างกลโรงงาน", href: "https://www.facebook.com/srpc.machine" },
      { name: "ช่างไฟฟ้ากำลัง", href: "https://www.facebook.com/profile.php?id=100093121053985" },
      { name: "ช่างอิเล็คทรอนิกส์", href: "https://www.facebook.com/elesrpolysurin" },
      { name: "การบัญชี", href: "https://www.facebook.com/Acc.srpoly" },
      { name: "เทคโนโลยีธุรกิจดิจิทัล", href: "https://www.facebook.com/BusinessComputer.SRPC" },
      { name: "อาหารและโภชนาการ", href: "https://www.facebook.com/foodandnutritionsrpc" },
    ],
  },
  {
    id: 2,
    level: "ปวส.",
    title: "ประกาศนียบัตรวิชาชีพชั้นสูง",
    description: "หลักสูตรต่อยอดทักษะวิชาชีพเพื่อเข้าสู่ตลาดแรงงานและประกอบอาชีพ",
    departments: [
      { name: "เทคนิคเครื่องกล", href: "https://www.facebook.com/AutoMechanicSRPC" },
      { name: "เทคนิคการผลิต", href: "https://www.facebook.com/srpc.machine" },
      { name: "ไฟฟ้ากำลัง", href: "https://www.facebook.com/profile.php?id=100093121053985" },
      { name: "ช่างอิเล็คทรอนิกส์", href: "https://www.facebook.com/elesrpolysurin" },
      { name: "การบัญชี", href: "https://www.facebook.com/Acc.srpoly" },
      { name: "เทคโนโลยีธุรกิจดิจิทัล", href: "https://www.facebook.com/BusinessComputer.SRPC" },
      { name: "อาหารและโภชนาการ", href: "https://www.facebook.com/foodandnutritionsrpc" },
    ],
  },
  {
    id: 3,
    level: "ระยะสั้น",
    title: "หลักสูตรวิชาชีพระยะสั้น",
    description: "หลักสูตรเพิ่มทักษะอาชีพสำหรับประชาชนและชุมชน",
    departments: [
      { name: "ตัดผม-เสริมสวย", href: "https://www.facebook.com/61577319825112/" },
      { name: "ตัดเย็บเสื้อผ้า", href: "https://www.facebook.com/61572364141573/" },
    ],
  },
];

const itaFallback: ItaItem[] = [
  { id: 1, code: "O1", title: "โครงสร้างและอำนาจหน้าที่", category: "เกี่ยวกับวิทยาลัย", status: "published", href: "/about" },
  { id: 3, code: "O3", title: "ข้อมูลข่าวสารประชาสัมพันธ์", category: "ข่าวสาร", status: "published", href: "/news" },
  { id: 4, code: "O4", title: "แผนพัฒนาสถานศึกษา", category: "แผนและรายงาน", status: "published", href: "/plans" },
  { id: 8, code: "O8", title: "คู่มือการให้บริการ", category: "บริการออนไลน์", status: "published", href: "/documents/1" },
  { id: 11, code: "O11", title: "แผนการจัดซื้อจัดจ้าง", category: "จัดซื้อจัดจ้าง / พัสดุ", status: "published", href: "/procurement" },
  { id: 16, code: "O16", title: "ช่องทางร้องเรียนทั่วไป", category: "ร้องเรียน / ข้อเสนอแนะ", status: "published", href: "/complaint" },
];

const officialItaFallback: ItaItem[] = oit2569Items.map((item, index) => ({
  id: index + 1,
  code: item.code,
  title: item.title,
  category: item.category,
  status: "review",
  href: item.href,
  description: item.description,
  fiscalYear: "2569",
  responsiblePerson: item.responsiblePerson,
}));

const completeItaFallback = officialItaFallback.length ? officialItaFallback : itaFallback;

export const adminModules: AdminModule[] = [
  { key: "navigation_items", label: "เมนู Navbar", table: "navigation_items", permission: "cms.navbar", description: "ควบคุมเมนูหลัก เมนูย่อย และลำดับการแสดงผลของเว็บไซต์" },
  { key: "quick_links", label: "ลิงก์ด่วน / eService", table: "quick_links", permission: "cms.quick_links", description: "จัดการลิงก์ระบบสารสนเทศ บริการออนไลน์ และลิงก์ภายนอกที่หน้าแรก" },
  { key: "content_pages", label: "หน้าเนื้อหาเว็บไซต์", table: "content_pages", permission: "content_pages", description: "จัดการหน้าเนื้อหาและหน้า CMS ที่เชื่อมกับเมนู" },
  { key: "site_blocks", label: "แบนเนอร์และข้อความหน้าเว็บ", table: "site_blocks", permission: "site_blocks", description: "ปรับ hero, ข้อความสำคัญ และปุ่มลัดหน้าแรก" },
  { key: "course_groups", label: "หลักสูตรและแผนกวิชา", table: "course_groups", permission: "course_groups", description: "จัดกลุ่มหลักสูตร รายชื่อแผนก และลิงก์เว็บไซต์แผนก" },
  { key: "student_stats", label: "ยอดผู้เรียน", table: "student_stats", permission: "student_stats", description: "บันทึกสถิตินักเรียน นักศึกษา รายปีการศึกษา" },
  { key: "student_enrollments", label: "ผู้เรียน ปวช./ปวส. รายปี", table: "student_enrollments", permission: "student_stats", description: "จัดการจำนวนนักเรียน นักศึกษา แยกตามปีการศึกษา ระดับ แผนกวิชา และสถานะลงทะเบียน" },
  { key: "short_course_enrollments", label: "ผู้เรียนหลักสูตรระยะสั้น", table: "short_course_enrollments", permission: "student_stats", description: "จัดการจำนวนผู้เรียนหลักสูตรระยะสั้นแบบรายวิชา รุ่น ชั่วโมงเรียน และผลสำเร็จ" },
  { key: "personnel_profiles", label: "บุคลากร / คณะกรรมการ", table: "personnel_profiles", permission: "personnel", description: "ข้อมูลผู้บริหาร บุคลากร และคณะกรรมการ" },
  { key: "personnel_summary_stats", label: "สรุปจำนวนบุคลากร", table: "personnel_summary_stats", permission: "personnel", description: "จัดการสรุปจำนวนครู บุคลากร และเจ้าหน้าที่ แยกตามปีการศึกษาและประเภท" },
  { key: "personnel_layouts", label: "เลย์เอาต์บุคลากร", table: "personnel_page_layouts", permission: "personnel", description: "ควบคุมรูปแบบการแสดงผลการ์ดบุคลากร" },
  { key: "news_categories", label: "หมวดข่าว", table: "categories", permission: "news", description: "เพิ่ม แก้ไข และจัดลำดับหมวดข่าวที่ใช้กับหน้าแรกและหน้าข่าว" },
  { key: "news", label: "ข่าวประชาสัมพันธ์", table: "news", permission: "news", description: "เผยแพร่ข่าวและกิจกรรมของวิทยาลัย" },
  { key: "announcements", label: "ประกาศวิทยาลัย", table: "announcements", permission: "announcements", description: "ประกาศ ปฏิทิน และเอกสารแนบสำคัญ" },
  { key: "document_categories", label: "หมวดดาวน์โหลดเอกสาร", table: "categories", permission: "documents", description: "จัดกลุ่มเอกสารตามงานทะเบียน งานวิชาการ งานการเงิน และฝ่ายงานต่างๆ" },
  { key: "documents", label: "ดาวน์โหลดเอกสาร / แบบฟอร์ม", table: "documents", permission: "documents", description: "ศูนย์ดาวน์โหลดเอกสาร คำร้อง แบบฟอร์ม คู่มือ และไฟล์บริการผู้เรียน" },
  { key: "legal_items", label: "กฎหมายและระเบียบ", table: "legal_items", permission: "content_pages", description: "จัดการกฎหมาย ระเบียบ ไฟล์แนบ และลิงก์อ้างอิงที่แสดงบนหน้าเกี่ยวกับวิทยาลัย" },
  { key: "procurement", label: "จัดซื้อจัดจ้าง / พัสดุ", table: "procurement", permission: "procurement", description: "แผนจัดซื้อจัดจ้าง ราคากลาง และผลจัดซื้อจัดจ้าง" },
  { key: "trial_balance_reports", label: "รายงานงบทดลอง", table: "procurement", permission: "finance", description: "จัดการรายงานงบทดลอง ไฟล์แนบ ปีงบประมาณ และจำนวนดาวน์โหลด" },
  { key: "plans", label: "แผนและรายงาน", table: "plans_reports", permission: "plans", description: "แผนปฏิบัติราชการ รายงาน SAR และรายงานควบคุมภายใน" },
  { key: "services", label: "บริการออนไลน์", table: "services", permission: "services", description: "บริการ E-Service ลิงก์บริการ และขั้นตอนให้บริการ" },
  { key: "ita", label: "Mapping ITA / OIT", table: "ita_mapping", permission: "ita", description: "ติดตามความพร้อมข้อมูลสาธารณะตามตัวชี้วัด" },
];

function buildNavigationTree(rows: RawNavigation[]): NavItem[] {
  const byId = new Map<number, NavItem & { parentId: number | null; sortOrder: number }>();

  for (const row of rows) {
    byId.set(row.id, {
      id: row.id,
      itemKey: row.item_key,
      label: row.label,
      href: normalizeLegacyUrl(row.url),
      parentId: row.parent_id,
      sortOrder: row.sort_order,
      children: [],
    });
  }

  const roots: (NavItem & { parentId: number | null; sortOrder: number })[] = [];

  for (const item of byId.values()) {
    if (item.parentId && byId.has(item.parentId)) {
      byId.get(item.parentId)?.children?.push(item);
    } else {
      roots.push(item);
    }
  }

  for (const item of byId.values()) {
    item.children?.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }

  return roots.sort((a, b) => a.sortOrder - b.sortOrder);
}

function applySettings(rows: RawSetting[] | null): SiteSettings {
  if (!rows?.length) {
    return settingsFallback;
  }

  const values = Object.fromEntries(rows.map((row) => [row.setting_key, row.setting_value]));

  return {
    collegeName: values.college_name ?? settingsFallback.collegeName,
    collegeNameEn: values.college_name_en ?? settingsFallback.collegeNameEn,
    slogan: values.slogan ?? settingsFallback.slogan,
    contactEmail: values.contact_email ?? settingsFallback.contactEmail,
    contactPhone: values.contact_phone ?? settingsFallback.contactPhone,
    contactFax: values.contact_fax ?? settingsFallback.contactFax,
    address: values.address ?? settingsFallback.address,
    themePreset: isThemePresetId(values.theme_preset) ? values.theme_preset : settingsFallback.themePreset,
  };
}

function fallbackWhenEmpty<T>(rows: T[] | null, fallback: T[]): T[] {
  return rows?.length ? rows : fallback;
}

function normalizeDate(value: RawDate): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

function safeDecodeUrlSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function parseLineList(value: string | null | undefined): string[] {
  return (value ?? "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseCourseLinkMap(value: string | null | undefined): Map<string, string> {
  const links = new Map<string, string>();

  for (const line of parseLineList(value)) {
    const [name, href] = line.split("|").map((part) => part.trim());
    if (name && href) {
      links.set(name, normalizeLegacyUrl(href));
    }
  }

  return links;
}

function buildCourseDepartments(coursesText: string | null, linksText: string | null): CourseDepartment[] {
  const links = parseCourseLinkMap(linksText);
  const names = parseLineList(coursesText);
  const courseNames = names.length ? names : Array.from(links.keys());

  return courseNames.map((name) => ({
    name,
    href: links.get(name),
  }));
}

function mapContentPage(row: RawContentPage): ContentPageItem {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    summary: row.summary ?? "",
    body: row.body ?? "",
    contentType: row.content_type ?? undefined,
    coverImage: row.cover_image ?? undefined,
    attachmentPath: row.attachment_path ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    navKey: row.nav_key ?? undefined,
    status: row.status,
    href: `/content/${row.slug}`,
  };
}

function mapNews(row: RawNews): ContentItem {
  return {
    id: row.id,
    title: row.title,
    description: row.summary ?? undefined,
    content: row.content ?? undefined,
    category: row.category_name ?? "ข่าวสาร",
    categoryId: row.category_id ?? undefined,
    categorySlug: row.category_slug ?? undefined,
    href: `/news/${row.slug}`,
    status: row.status,
    date: normalizeDate(row.published_at),
    image: publicAssetPath(row.cover_image) ?? publicAssetPath("/assets/images/hero-campus.png"),
    metric: row.view_count ? `${row.view_count.toLocaleString("th-TH")} ครั้ง` : undefined,
    isFeatured: Boolean(Number(row.is_featured ?? 0)),
    galleryImages: parseMediaItems(row.gallery_images),
    attachments: parseMediaItems(row.attachment_files),
    externalLinks: parseLinkItems(row.external_links),
    syncToDownloads: Boolean(Number(row.sync_to_downloads ?? 0)),
  };
}

export async function getSiteOverview(): Promise<SiteOverview> {
  const newsMediaSelect = await getOptionalNewsMediaSelect();
  const [
    settingsRows,
    navigationRows,
    quickLinkRows,
    contentPageRows,
    courseGroupRows,
    newsCategoryRows,
    newsRows,
    documentRows,
    procurementRows,
    planRows,
    serviceRows,
    itaRows,
  ] = await Promise.all([
    queryRows<RawSetting>("SELECT setting_key, setting_value FROM site_settings"),
    queryRows<RawNavigation>("SELECT id, item_key, parent_id, label, url, sort_order FROM navigation_items WHERE is_active = 1 ORDER BY COALESCE(parent_id, id), sort_order, id"),
    queryRows<{ item_key: string; label: string; url: string }>("SELECT item_key, label, url FROM quick_links WHERE is_active = 1 ORDER BY sort_order, id"),
    queryRows<RawContentPage>(
      "SELECT id, slug, title, summary, body, content_type, cover_image, attachment_path, source_url, nav_key, status FROM content_pages WHERE status = 'published' ORDER BY updated_at DESC, id DESC LIMIT 80"
    ),
    queryRows<{ id: number; level_label: string; title: string; description: string | null; courses_text: string | null; course_links_text: string | null }>(
      "SELECT id, level_label, title, description, courses_text, course_links_text FROM course_groups WHERE status = 'active' ORDER BY sort_order, id"
    ),
    queryRows<{ id: number; name: string; slug: string; description: string | null }>(
      "SELECT id, name, slug, description FROM categories WHERE type = 'news' AND status = 'active' ORDER BY sort_order, id"
    ),
    queryRows<RawNews>(
      `SELECT n.id, n.title, n.slug, n.cover_image, n.summary, n.content, n.status, n.published_at, n.view_count,
              n.category_id, c.name AS category_name, c.slug AS category_slug,
              n.is_featured, n.featured_sort_order, ${newsMediaSelect}
       FROM news n
       LEFT JOIN categories c ON c.id = n.category_id
       WHERE n.status = 'published'
       ORDER BY n.is_featured DESC, n.featured_sort_order ASC, COALESCE(n.published_at, n.created_at) DESC
       LIMIT 18`
    ),
    queryRows<{ id: number; title: string; description: string | null; fiscal_year: string | null; department: string | null; file_type: string | null; public_status: string; published_at: RawDate; ita_code: string | null }>(
      "SELECT id, title, description, fiscal_year, department, file_type, public_status, published_at, ita_code FROM documents WHERE public_status = 'published' ORDER BY COALESCE(published_at, updated_at) DESC LIMIT 8"
    ),
    queryRows<{ id: number; title: string; type: string | null; fiscal_year: string | null; budget: number | null; status: string; published_at: RawDate }>(
      "SELECT id, title, type, fiscal_year, budget, status, published_at FROM procurement WHERE status = 'published' AND COALESCE(type, '') <> 'รายงานงบทดลอง' ORDER BY COALESCE(published_at, updated_at) DESC LIMIT 6"
    ),
    queryRows<{ id: number; title: string; report_type: string | null; fiscal_year: string | null; department: string | null; status: string; published_at: RawDate }>(
      "SELECT id, title, report_type, fiscal_year, department, status, published_at FROM plans_reports WHERE status = 'published' ORDER BY COALESCE(published_at, updated_at) DESC LIMIT 6"
    ),
    queryRows<{ id: number; service_name: string; description: string | null; processing_time: string | null; service_url: string | null; responsible_department: string | null }>(
      "SELECT id, service_name, description, processing_time, service_url, responsible_department FROM services WHERE status = 'active' ORDER BY service_name ASC LIMIT 8"
    ),
    queryRows<{
      id: number;
      ita_code: string;
      ita_title: string;
      category: string | null;
      status: string;
      evidence_url: string | null;
      fiscal_year: string | null;
      responsible_person: string | null;
      note: string | null;
    }>(
      "SELECT id, ita_code, ita_title, category, status, evidence_url, fiscal_year, responsible_person, note FROM ita_mapping ORDER BY ita_code ASC"
    ),
  ]);

  const navigation = navigationRows?.length ? buildNavigationTree(navigationRows) : navigationFallback;

  return {
    settings: applySettings(settingsRows),
    navigation,
    quickLinks: fallbackWhenEmpty<QuickLink>(
      quickLinkRows?.map((row) => ({
        itemKey: row.item_key,
        label: row.label,
        href: normalizeLegacyUrl(row.url),
      })) ?? null,
      quickLinksFallback
    ),
    contentPages: fallbackWhenEmpty<ContentPageItem>(
      contentPageRows?.map(mapContentPage) ?? null,
      contentPagesFallback
    ),
    newsCategories: fallbackWhenEmpty<NewsCategory>(
      newsCategoryRows?.map((row) => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description ?? undefined,
      })) ?? null,
      newsCategoriesFallback
    ),
    courseGroups: fallbackWhenEmpty<CourseGroup>(
      courseGroupRows?.map((row) => ({
        id: row.id,
        level: row.level_label,
        title: row.title,
        description: row.description ?? "",
        departments: buildCourseDepartments(row.courses_text, row.course_links_text),
      })) ?? null,
      courseGroupsFallback
    ),
    news: newsRows === null ? newsFallback : newsRows.map(mapNews),
    documents: fallbackWhenEmpty<ContentItem>(
      documentRows?.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description ?? undefined,
        category: row.department ?? "เอกสารเผยแพร่",
        href: `/documents/${row.id}`,
        status: row.public_status,
        date: normalizeDate(row.published_at),
        metric: row.ita_code ?? row.file_type ?? undefined,
      })) ?? null,
      documentsFallback
    ),
    procurement: fallbackWhenEmpty<ContentItem>(
      procurementRows?.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.type ?? "จัดซื้อจัดจ้าง",
        href: `/procurement/${row.id}`,
        status: row.status,
        date: normalizeDate(row.published_at),
        metric: row.budget ? `${Number(row.budget).toLocaleString("th-TH")} บาท` : "เผยแพร่แล้ว",
      })) ?? null,
      procurementFallback
    ),
    plans: fallbackWhenEmpty<ContentItem>(
      planRows?.map((row) => ({
        id: row.id,
        title: row.title,
        category: row.report_type ?? "แผนและรายงาน",
        href: `/plans/${row.id}`,
        status: row.status,
        date: normalizeDate(row.published_at),
        metric: row.fiscal_year ?? undefined,
      })) ?? null,
      plansFallback
    ),
    services: fallbackWhenEmpty<ServiceItem>(
      serviceRows?.map((row) => ({
        id: row.id,
        title: row.service_name,
        description: row.description ?? "",
        department: row.responsible_department ?? "หน่วยงานที่เกี่ยวข้อง",
        processingTime: row.processing_time ?? "-",
        href: normalizeLegacyUrl(row.service_url),
      })) ?? null,
      servicesFallback
    ),
    ita: fallbackWhenEmpty<ItaItem>(
      itaRows
        ?.map((row) => {
          const officialItem = getOit2569Item(row.ita_code);
          const evidenceHref = row.evidence_url
            ? normalizeLegacyUrl(row.evidence_url)
            : officialItem?.href ?? "/ita";

          return {
            id: row.id,
            code: officialItem?.code ?? row.ita_code,
            title: officialItem?.title ?? row.ita_title,
            category: officialItem?.category ?? row.category ?? "ITA",
            status: row.status,
            href: evidenceHref,
            description: officialItem?.description ?? row.note ?? undefined,
            fiscalYear: row.fiscal_year ?? "2569",
            responsiblePerson: row.responsible_person ?? officialItem?.responsiblePerson,
          };
        })
        .sort((a, b) => itaCodeNumber(a.code) - itaCodeNumber(b.code)) ?? null,
      completeItaFallback
    ),
  };
}

export async function getContentPages(): Promise<ContentPageItem[]> {
  return (await getSiteOverview()).contentPages;
}

export async function getContentPage(slug: string): Promise<ContentPageItem | undefined> {
  return (await getContentPages()).find((page) => page.slug === slug);
}

export async function getNewsItem(slugOrId: string): Promise<ContentItem | undefined> {
  const newsMediaSelect = await getOptionalNewsMediaSelect();
  const rawSlug = String(slugOrId ?? "").trim();
  const decodedSlug = safeDecodeUrlSegment(rawSlug);
  const lookupSlugs = Array.from(new Set([rawSlug, decodedSlug].filter(Boolean)));
  const safeLookupSlugs = lookupSlugs.length ? lookupSlugs : [""];
  const slugPlaceholders = safeLookupSlugs.map(() => "?").join(", ");
  const numericId = Number(decodedSlug || rawSlug) || 0;
  const rows = await queryRows<RawNews>(
    `SELECT n.id, n.title, n.slug, n.cover_image, n.summary, n.content, n.status, n.published_at, n.view_count,
            n.category_id, c.name AS category_name, c.slug AS category_slug,
            n.is_featured, n.featured_sort_order, ${newsMediaSelect}
     FROM news n
     LEFT JOIN categories c ON c.id = n.category_id
     WHERE n.status = 'published' AND (n.slug IN (${slugPlaceholders}) OR n.id = ?)
     LIMIT 1`,
    [...safeLookupSlugs, numericId]
  );

  return rows?.[0] ? mapNews(rows[0]) : undefined;
}

export async function getAdminContentPages(): Promise<ContentPageItem[]> {
  const rows = await queryRows<RawContentPage>(
    "SELECT id, slug, title, summary, body, content_type, cover_image, attachment_path, source_url, nav_key, status FROM content_pages ORDER BY updated_at DESC, id DESC LIMIT 200"
  );

  return fallbackWhenEmpty<ContentPageItem>(rows?.map(mapContentPage) ?? null, contentPagesFallback);
}

export function statusLabel(status?: string): string {
  const labels: Record<string, string> = {
    published: "เผยแพร่",
    review: "รอตรวจ",
    draft: "ร่าง",
    active: "เปิดใช้งาน",
    inactive: "ปิดใช้งาน",
    archived: "เก็บถาวร",
  };

  return labels[status ?? ""] ?? status ?? "-";
}

export function statusVariant(status?: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "published" || status === "active") {
    return "default";
  }

  if (status === "draft" || status === "review") {
    return "secondary";
  }

  if (status === "archived" || status === "inactive") {
    return "outline";
  }

  return "secondary";
}
