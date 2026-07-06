export type PermissionKey = string;

export type PermissionMeta = {
  label: string;
  description: string;
};

export const permissionDetails: Record<PermissionKey, PermissionMeta> = {
  users: {
    label: "จัดการผู้ใช้และสิทธิ์",
    description: "เพิ่ม แก้ไข ลบผู้ใช้ และกำหนดสิทธิ์ของแต่ละบัญชี",
  },
  "cms.navbar": {
    label: "แก้ไขเมนูหลัก Navbar",
    description: "ควบคุมเมนูหลัก เมนูย่อย และลำดับการแสดงผลของ Navbar",
  },
  "cms.quick_links": {
    label: "แก้ไขลิงก์ระบบสารสนเทศ",
    description: "ควบคุมลิงก์ด่วนและบริการออนไลน์ เช่น สมัครเรียน RMS ศธ.02 และลิงก์ภายนอก",
  },
  content_pages: {
    label: "จัดการหน้าเนื้อหาเว็บไซต์",
    description: "แก้ไขหน้าเนื้อหาทั่วไปและหน้า CMS ที่สร้างเพิ่ม",
  },
  site_blocks: {
    label: "จัดการแบนเนอร์และข้อความหน้าเว็บ",
    description: "แก้ไขภาพแบนเนอร์ Hero ข้อความต้อนรับ และปุ่มหลักบนหน้าแรก",
  },
  course_groups: {
    label: "จัดการหลักสูตรและรายชื่อแผนกวิชา",
    description: "แก้ไขหลักสูตร รายชื่อแผนกวิชา และลิงก์เว็บไซต์หรือ Facebook ของแผนก",
  },
  student_stats: {
    label: "จัดการยอดผู้เรียน",
    description: "แก้ไขข้อมูลนักเรียน/นักศึกษาแบบรายปีการศึกษา",
  },
  news: {
    label: "จัดการข่าวประชาสัมพันธ์",
    description: "ควบคุมข่าวประชาสัมพันธ์และรายการข่าวที่แสดงบนหน้าแรก",
  },
  facebook_api: {
    label: "ตั้งค่าและดึงข่าวจาก Facebook",
    description: "ตั้งค่า Facebook App, Page Token และสั่งซิงก์ข่าวจากเพจเข้าสู่ระบบข่าว",
  },
  announcements: {
    label: "จัดการประกาศวิทยาลัย",
    description: "แก้ไขประกาศทั่วไปของวิทยาลัย",
  },
  plans: {
    label: "จัดการงานแผนและรายงาน",
    description: "ควบคุมแผนปฏิบัติการ แผนพัฒนา รายงาน และข้อมูลหน้าแรก",
  },
  finance: {
    label: "จัดการงานการเงิน",
    description: "สิทธิ์เสริมของงานการเงิน ใช้ร่วมกับจัดซื้อจัดจ้างและเอกสารทางการเงิน",
  },
  personnel: {
    label: "จัดการงานบุคลากร",
    description: "แก้ไขผู้บริหาร คณะกรรมการ รูปภาพ ตำแหน่ง และรูปแบบการ์ดบุคลากร",
  },
  procurement: {
    label: "จัดการจัดซื้อจัดจ้าง / พัสดุ",
    description: "ควบคุมประกาศจัดซื้อจัดจ้าง รายงานงบทดลอง และรายการพัสดุ",
  },
  documents: {
    label: "จัดการดาวน์โหลดเอกสาร",
    description: "ควบคุมหมวดเอกสาร แบบฟอร์ม ไฟล์ดาวน์โหลด ยอดดาวน์โหลด และไฟล์แนบสำหรับบริการผู้เรียน",
  },
  services: {
    label: "จัดการบริการออนไลน์",
    description: "แก้ไขรายการ E-Service ขั้นตอนบริการ และลิงก์บริการ",
  },
  ita: {
    label: "จัดการ ITA / OIT",
    description: "ควบคุมข้อมูล ITA, OIT และข้อมูลสาธารณะของเว็บไซต์",
  },
  complaints: {
    label: "จัดการเรื่องร้องเรียน",
    description: "จัดการเรื่องร้องเรียน ข้อเสนอแนะ และส่วนติดต่อร้องเรียนของเว็บไซต์",
  },
};

const derivedPermissions: Record<string, string[]> = {
  finance: ["procurement", "documents"],
};

export function expandPermissions(permissions: readonly string[] = []): string[] {
  if (permissions.includes("*")) {
    return ["*"];
  }

  const expanded = new Set<string>();

  for (const permission of permissions) {
    expanded.add(permission);
    for (const derived of derivedPermissions[permission] ?? []) {
      expanded.add(derived);
    }
  }

  return Array.from(expanded);
}

export function canAccess(permissions: readonly string[] = [], permission?: string): boolean {
  if (!permission) {
    return true;
  }

  const expanded = expandPermissions(permissions);
  return expanded.includes("*") || expanded.includes(permission);
}

export function permissionLabel(permission: string): string {
  if (permission === "*") {
    return "ทุกเมนู";
  }

  return permissionDetails[permission]?.label ?? permission;
}

export function permissionDescription(permission: string): string {
  return permissionDetails[permission]?.description ?? "สิทธิ์จากระบบเดิม";
}

export function permissionCatalogKeys(): string[] {
  return Object.keys(permissionDetails);
}
