import {
  Bell,
  BookOpen,
  Building2,
  ClipboardCheck,
  DatabaseBackup,
  FileText,
  Home,
  Landmark,
  LayoutDashboard,
  Link2,
  MessageSquareWarning,
  Network,
  Newspaper,
  PanelTop,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
  badge?: string;
  targetBlank?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const sidebarData: NavSection[] = [
  {
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    title: "เว็บไซต์",
    items: [
      { title: "ดูหน้าเว็บ", href: "/", icon: Home, targetBlank: true },
      { title: "เมนู Navbar", href: "/admin/modules/navigation_items", icon: Link2, permission: "cms.navbar" },
      { title: "ลิงก์ด่วน / eService", href: "/admin/modules/quick_links", icon: ShieldCheck, permission: "cms.quick_links" },
      { title: "หน้าเนื้อหา", href: "/admin/modules/content_pages", icon: FileText, permission: "content_pages" },
      { title: "แบนเนอร์หน้าแรก", href: "/admin/modules/site_blocks", icon: PanelTop, permission: "site_blocks" },
      { title: "ป๊อปอัปวาระพิเศษ", href: "/admin/modules/site_popups", icon: Bell, permission: "site_blocks" },
      { title: "หลักสูตร / แผนก", href: "/admin/modules/course_groups", icon: BookOpen, permission: "course_groups" },
      { title: "ยอดผู้เรียน", href: "/admin/modules/student_stats", icon: Sparkles, permission: "student_stats" },
      { title: "ผู้เรียน ปวช./ปวส.", href: "/admin/modules/student_enrollments", icon: Sparkles, permission: "student_stats" },
      { title: "ผู้เรียนระยะสั้น", href: "/admin/modules/short_course_enrollments", icon: Sparkles, permission: "student_stats" },
      { title: "บุคลากร", href: "/admin/modules/personnel_profiles", icon: Building2, permission: "personnel" },
      { title: "กลุ่มบุคลากร", href: "/admin/modules/personnel_groups", icon: Users, permission: "personnel" },
      { title: "ตำแหน่งบุคลากร", href: "/admin/modules/personnel_position_options", icon: Users, permission: "personnel" },
      { title: "สรุปจำนวนบุคลากร", href: "/admin/modules/personnel_summary_stats", icon: Users, permission: "personnel" },
      { title: "โครงสร้างการบริหาร", href: "/admin/modules/administrative_structure", icon: Network, permission: "personnel" },
    ],
  },
  {
    title: "ข้อมูลเผยแพร่",
    items: [
      { title: "หมวดข่าว", href: "/admin/modules/news_categories", icon: Link2, permission: "news" },
      { title: "ข่าวประชาสัมพันธ์", href: "/admin/modules/news", icon: Newspaper, permission: "news" },
      { title: "ประกาศวิทยาลัย", href: "/admin/modules/announcements", icon: Bell, permission: "announcements" },
      { title: "หมวดดาวน์โหลดเอกสาร", href: "/admin/modules/document_categories", icon: Link2, permission: "documents" },
      { title: "ดาวน์โหลดเอกสาร", href: "/admin/modules/documents", icon: FileText, permission: "documents" },
      { title: "กฎหมายและระเบียบ", href: "/admin/modules/legal_items", icon: FileText, permission: "content_pages" },
      { title: "จัดซื้อจัดจ้าง", href: "/admin/modules/procurement", icon: Landmark, permission: "procurement" },
      { title: "รายงานงบทดลอง", href: "/admin/modules/trial_balance_reports", icon: FileText, permission: "finance" },
      { title: "แผนและรายงาน", href: "/admin/modules/plans", icon: ClipboardCheck, permission: "plans" },
      { title: "บริการออนไลน์", href: "/admin/modules/services", icon: ShieldCheck, permission: "services" },
      { title: "ITA / OIT", href: "/admin/modules/ita", icon: ShieldCheck, permission: "ita" },
    ],
  },
  {
    title: "ระบบ",
    items: [
      { title: "ผู้ใช้งาน / สิทธิ์", href: "/admin/users", icon: Users, permission: "users" },
      { title: "สำรองข้อมูล", href: "/admin/backup", icon: DatabaseBackup, permission: "users" },
      { title: "เรื่องร้องเรียน", href: "/admin/complaints", icon: MessageSquareWarning, permission: "complaints", badge: "1" },
      { title: "ตั้งค่าเว็บไซต์", href: "/admin/settings", icon: Settings, permission: "site_blocks" },
    ],
  },
];

export const bottomNavItems: NavItem[] = [
  { title: "เชื่อมต่อ Facebook", href: "/admin/facebook", icon: Link2, permission: "facebook_api" },
  { title: "กลับหน้าเว็บ", href: "/", icon: Home, targetBlank: true },
];
