import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { queryRows } from "@/lib/db";
import { expandPermissions } from "@/lib/permissions";

export type AdminRole = {
  id: number;
  roleName: string;
  permissions: string[];
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  roleName: string;
  department: string;
  status: string;
  rolePermissions: string[];
  directPermissions: string[];
  effectivePermissions: string[];
};

type RawRole = {
  id: number;
  role_name: string;
  permissions: string | null;
};

type RawUser = {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string | null;
  department: string | null;
  status: string;
  role_name: string | null;
  role_permissions: string | null;
  user_permissions: string | null;
};

const srpolyAdminEmail = "srpoly@srpoly.ac.th";
const srpolyPasswordHash = "$2b$10$qNYMYELSTqz4tDwfqnWV/.klVujTQgrM1mGeR1c9snX2ZG01ptDtG";
export const adminSessionCookieName = "srpoly_admin_session";
export const deprecatedAdminSessionCookieName = "admin_session";
export const legacyAdminCookieName = "admin_email";
export const adminCookiePath = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "") || "/";

const fallbackRoles: AdminRole[] = [
  { id: 1, roleName: "Super Admin", permissions: ["*"] },
  { id: 2, roleName: "งานประชาสัมพันธ์", permissions: ["news", "announcements"] },
  { id: 3, roleName: "งานแผน", permissions: ["plans", "documents"] },
  { id: 4, roleName: "งานการเงิน", permissions: ["finance", "procurement", "documents"] },
  { id: 5, roleName: "งานบุคลากร", permissions: ["personnel", "documents"] },
  { id: 6, roleName: "งานบริการออนไลน์", permissions: ["services", "cms.quick_links"] },
  { id: 7, roleName: "งานร้องเรียน", permissions: ["complaints"] },
];

const fallbackUsers: AdminUser[] = [
  makeFallbackUser(100, "SRPOLY Admin", srpolyAdminEmail, "Super Admin", "งานเทคโนโลยีสารสนเทศ", ["*"]),
  makeFallbackUser(1, "ผู้ดูแลระบบ", "admin@srpoly.ac.th", "Super Admin", "งานเทคโนโลยีสารสนเทศ", ["*"]),
  makeFallbackUser(2, "งานประชาสัมพันธ์", "pr@srpoly.ac.th", "งานประชาสัมพันธ์", "งานประชาสัมพันธ์", ["news", "announcements"]),
  makeFallbackUser(3, "งานแผน", "plan@srpoly.ac.th", "งานแผน", "งานแผนและงบประมาณ", ["plans", "documents"]),
  makeFallbackUser(4, "งานการเงิน", "finance@srpoly.ac.th", "งานการเงิน", "งานการเงิน", ["finance", "procurement", "documents"]),
  makeFallbackUser(5, "งานบุคลากร", "personnel@srpoly.ac.th", "งานบุคลากร", "งานบุคลากร", ["personnel", "documents"]),
  makeFallbackUser(6, "งานบริการออนไลน์", "service@srpoly.ac.th", "งานบริการออนไลน์", "งานเทคโนโลยีสารสนเทศ", ["services", "cms.quick_links"]),
];

function makeFallbackUser(
  id: number,
  name: string,
  email: string,
  roleName: string,
  department: string,
  permissions: string[]
): AdminUser {
  return {
    id,
    name,
    email,
    roleName,
    department,
    status: "active",
    rolePermissions: permissions,
    directPermissions: permissions,
    effectivePermissions: expandPermissions(permissions),
  };
}

function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

function emailUsername(email: string): string {
  return email.split("@")[0]?.toLowerCase() ?? email.toLowerCase();
}

function matchesIdentifier(user: Pick<AdminUser, "email">, identifier: string): boolean {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  return user.email.toLowerCase() === normalizedIdentifier || emailUsername(user.email) === normalizedIdentifier;
}

async function verifyPassword(password: string, storedPassword?: string | null): Promise<boolean> {
  if (!storedPassword) {
    return false;
  }

  if (storedPassword.startsWith("$2")) {
    const normalizedHash = storedPassword.replace(/^\$2y\$/, "$2b$");
    return bcrypt.compare(password, normalizedHash);
  }

  return password === storedPassword;
}

function parsePermissions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

export async function getAdminRoles(): Promise<AdminRole[]> {
  const rows = await queryRows<RawRole>("SELECT id, role_name, permissions FROM roles ORDER BY id");

  if (!rows?.length) {
    return fallbackRoles;
  }

  return rows.map((role) => ({
    id: role.id,
    roleName: role.role_name,
    permissions: expandPermissions(parsePermissions(role.permissions)),
  }));
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const rows = await queryRows<RawUser>(
    `SELECT u.id, u.name, u.email, u.role, u.department, u.status,
            r.role_name, r.permissions AS role_permissions, u.permissions AS user_permissions
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     ORDER BY u.id`
  );

  if (!rows?.length) {
    return fallbackUsers;
  }

  return rows.map((user) => {
    const rolePermissions = parsePermissions(user.role_permissions);
    const directPermissions = parsePermissions(user.user_permissions);
    const mergedPermissions = Array.from(new Set([...rolePermissions, ...directPermissions]));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleName: user.role_name ?? user.role ?? "-",
      department: user.department ?? "-",
      status: user.status,
      rolePermissions,
      directPermissions,
      effectivePermissions: expandPermissions(mergedPermissions),
    };
  });
}

export async function authenticateAdmin(identifier: string, password: string): Promise<AdminUser | null> {
  const normalizedIdentifier = normalizeIdentifier(identifier);

  if (!normalizedIdentifier || !password) {
    return null;
  }

  const fallbackUser = fallbackUsers.find((item) => matchesIdentifier(item, normalizedIdentifier));
  if (fallbackUser?.email === srpolyAdminEmail && await verifyPassword(password, srpolyPasswordHash)) {
    return fallbackUser;
  }

  const rows = await queryRows<RawUser>(
    `SELECT u.id, u.name, u.email, u.password, u.role, u.department, u.status,
            r.role_name, r.permissions AS role_permissions, u.permissions AS user_permissions
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.status = 'active'
       AND (LOWER(u.email) = ? OR LOWER(SUBSTRING_INDEX(u.email, '@', 1)) = ?)
     LIMIT 1`,
    [normalizedIdentifier, normalizedIdentifier]
  );

  const user = rows?.[0];

  if (user && await verifyPassword(password, user.password)) {
    const rolePermissions = parsePermissions(user.role_permissions);
    const directPermissions = parsePermissions(user.user_permissions);
    const mergedPermissions = Array.from(new Set([...rolePermissions, ...directPermissions]));

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roleName: user.role_name ?? user.role ?? "-",
      department: user.department ?? "-",
      status: user.status,
      rolePermissions,
      directPermissions,
      effectivePermissions: expandPermissions(mergedPermissions),
    };
  }

  return null;
}

export async function getCurrentAdminUser(): Promise<AdminUser> {
  const user = await getSignedInAdminUser();

  if (!user) {
    redirect("/signin");
  }

  return user;
}

export async function getSignedInAdminUser(): Promise<AdminUser | null> {
  const email = await getSignedInAdminEmail();
  if (!email) {
    return null;
  }

  const users = await getAdminUsers();

  return (
    users.find((user) => user.status === "active" && user.email.toLowerCase() === email) ??
    fallbackUsers.find((user) => user.status === "active" && user.email.toLowerCase() === email) ??
    null
  );
}

async function getSignedInAdminEmail(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const rawEmail = cookieStore.get(adminSessionCookieName)?.value;

  return rawEmail
    ? safeDecodeURIComponent(rawEmail).toLowerCase()
    : undefined;
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
