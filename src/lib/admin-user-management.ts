import bcrypt from "bcryptjs";
import { executeSqlResult, queryRows } from "@/lib/db";
import type { AdminUser } from "@/lib/admin-auth";
import { canAccess, expandPermissions, permissionCatalogKeys } from "@/lib/permissions";

export type ManagedAdminRole = {
  id: number;
  roleName: string;
  permissions: string[];
  userCount: number;
};

export type ManagedAdminUser = AdminUser & {
  roleId: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PasswordResetRequest = {
  id: number;
  identifier: string;
  requestedEmail: string | null;
  requesterNote: string | null;
  status: string;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  handledByName: string | null;
  createdAt: string | null;
  handledAt: string | null;
};

export type UserMutationInput = {
  name?: unknown;
  email?: unknown;
  password?: unknown;
  roleId?: unknown;
  roleName?: unknown;
  department?: unknown;
  status?: unknown;
  permissions?: unknown;
};

export type RoleMutationInput = {
  roleName?: unknown;
  permissions?: unknown;
};

export type PasswordResetMutationInput = {
  identifier?: unknown;
  note?: unknown;
  password?: unknown;
};

export type MutationResult<T> =
  | { ok: true; item: T }
  | { ok: false; status: number; message: string };

type RawManagedRole = {
  id: number;
  role_name: string;
  permissions: string | null;
  user_count?: number | null;
};

type RawManagedUser = {
  id: number;
  name: string;
  email: string;
  role_id: number | null;
  role: string | null;
  department: string | null;
  status: string;
  role_name: string | null;
  role_permissions: string | null;
  user_permissions: string | null;
  created_at: Date | string | null;
  updated_at: Date | string | null;
};

type RawPasswordResetRequest = {
  id: number;
  identifier: string;
  requested_email: string | null;
  requester_note: string | null;
  status: string;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  handled_by_name: string | null;
  created_at: Date | string | null;
  handled_at: Date | string | null;
};

type RawUserIdentity = {
  id: number;
  name: string;
  email: string;
};

const statusValues = new Set(["active", "inactive"]);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function nullableString(value: unknown): string | null {
  const normalized = stringValue(value);
  return normalized ? normalized : null;
}

function normalizeEmail(value: unknown): string {
  return stringValue(value).toLowerCase();
}

function normalizeIdentifier(value: unknown): string {
  return stringValue(value).toLowerCase();
}

function formatDateTime(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
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

function normalizePermissions(value: unknown): string[] {
  const allowed = new Set(["*", ...permissionCatalogKeys()]);
  const permissions = parsePermissions(value).filter((permission) => allowed.has(permission));

  if (permissions.includes("*")) {
    return ["*"];
  }

  return Array.from(new Set(permissions));
}

function stringifyPermissions(permissions: string[]): string {
  return JSON.stringify(permissions);
}

function roleFromRows(rows: RawManagedRole[]): ManagedAdminRole[] {
  return rows.map((role) => ({
    id: role.id,
    roleName: role.role_name,
    permissions: expandPermissions(parsePermissions(role.permissions)),
    userCount: Number(role.user_count ?? 0),
  }));
}

function userFromRow(user: RawManagedUser): ManagedAdminUser {
  const rolePermissions = parsePermissions(user.role_permissions);
  const directPermissions = parsePermissions(user.user_permissions);
  const mergedPermissions = Array.from(new Set([...rolePermissions, ...directPermissions]));

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roleId: user.role_id,
    roleName: user.role_name ?? user.role ?? "กำหนดเอง",
    department: user.department ?? "-",
    status: user.status,
    rolePermissions,
    directPermissions,
    effectivePermissions: expandPermissions(mergedPermissions),
    createdAt: formatDateTime(user.created_at),
    updatedAt: formatDateTime(user.updated_at),
  };
}

async function getRawRoles(): Promise<RawManagedRole[]> {
  return (
    (await queryRows<RawManagedRole>(
      `SELECT r.id, r.role_name, r.permissions, COUNT(u.id) AS user_count
       FROM roles r
       LEFT JOIN users u ON u.role_id = r.id
       GROUP BY r.id, r.role_name, r.permissions
       ORDER BY r.id`
    )) ?? []
  );
}

async function getRawUsers(): Promise<RawManagedUser[]> {
  return (
    (await queryRows<RawManagedUser>(
      `SELECT u.id, u.name, u.email, u.role_id, u.role, u.department, u.status,
              u.permissions AS user_permissions, u.created_at, u.updated_at,
              r.role_name, r.permissions AS role_permissions
       FROM users u
       LEFT JOIN roles r ON r.id = u.role_id
       ORDER BY FIELD(u.status, 'active', 'inactive'), u.id`
    )) ?? []
  );
}

async function findRole(roleId: number | null): Promise<ManagedAdminRole | null> {
  if (!roleId) {
    return null;
  }

  const rows = await queryRows<RawManagedRole>(
    "SELECT id, role_name, permissions FROM roles WHERE id = ? LIMIT 1",
    [roleId]
  );

  return rows?.[0] ? roleFromRows(rows)[0] : null;
}

async function findUser(userId: number): Promise<ManagedAdminUser | null> {
  const rows = await queryRows<RawManagedUser>(
    `SELECT u.id, u.name, u.email, u.role_id, u.role, u.department, u.status,
            u.permissions AS user_permissions, u.created_at, u.updated_at,
            r.role_name, r.permissions AS role_permissions
     FROM users u
     LEFT JOIN roles r ON r.id = u.role_id
     WHERE u.id = ?
     LIMIT 1`,
    [userId]
  );

  return rows?.[0] ? userFromRow(rows[0]) : null;
}

async function findUserIdentity(identifier: string): Promise<RawUserIdentity | null> {
  const normalizedIdentifier = normalizeIdentifier(identifier);

  if (!normalizedIdentifier) {
    return null;
  }

  const rows = await queryRows<RawUserIdentity>(
    `SELECT id, name, email
     FROM users
     WHERE LOWER(email) = ? OR LOWER(SUBSTRING_INDEX(email, '@', 1)) = ?
     LIMIT 1`,
    [normalizedIdentifier, normalizedIdentifier]
  );

  return rows?.[0] ?? null;
}

function resetRequestFromRow(row: RawPasswordResetRequest): PasswordResetRequest {
  return {
    id: row.id,
    identifier: row.identifier,
    requestedEmail: row.requested_email,
    requesterNote: row.requester_note,
    status: row.status,
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    handledByName: row.handled_by_name,
    createdAt: formatDateTime(row.created_at),
    handledAt: formatDateTime(row.handled_at),
  };
}

async function emailExists(email: string, exceptUserId?: number): Promise<boolean> {
  const rows = await queryRows<{ id: number }>(
    `SELECT id FROM users WHERE LOWER(email) = ? ${exceptUserId ? "AND id <> ?" : ""} LIMIT 1`,
    exceptUserId ? [email, exceptUserId] : [email]
  );

  return Boolean(rows?.length);
}

async function activeSuperAdminExistsAfterUserChange(
  targetUserId: number,
  nextStatus: string,
  nextRoleId: number | null,
  nextDirectPermissions: string[]
): Promise<boolean> {
  const [users, roles] = await Promise.all([getRawUsers(), getRawRoles()]);
  const roleMap = new Map(roles.map((role) => [role.id, parsePermissions(role.permissions)]));

  return users.some((user) => {
    const status = user.id === targetUserId ? nextStatus : user.status;

    if (status !== "active") {
      return false;
    }

    const roleId = user.id === targetUserId ? nextRoleId : user.role_id;
    const directPermissions = user.id === targetUserId ? nextDirectPermissions : parsePermissions(user.user_permissions);
    const rolePermissions = roleId ? roleMap.get(roleId) ?? [] : [];
    const effectivePermissions = expandPermissions([...rolePermissions, ...directPermissions]);

    return effectivePermissions.includes("*");
  });
}

async function activeSuperAdminExistsAfterRoleChange(roleId: number, nextPermissions: string[]): Promise<boolean> {
  const [users, roles] = await Promise.all([getRawUsers(), getRawRoles()]);
  const roleMap = new Map(roles.map((role) => [role.id, role.id === roleId ? nextPermissions : parsePermissions(role.permissions)]));

  return users.some((user) => {
    if (user.status !== "active") {
      return false;
    }

    const rolePermissions = user.role_id ? roleMap.get(user.role_id) ?? [] : [];
    const directPermissions = parsePermissions(user.user_permissions);
    const effectivePermissions = expandPermissions([...rolePermissions, ...directPermissions]);

    return effectivePermissions.includes("*");
  });
}

function canAssignPermissions(actor: AdminUser, permissions: string[]): boolean {
  return !permissions.includes("*") || actor.effectivePermissions.includes("*");
}

function nextEffectivePermissions(role: ManagedAdminRole | null, directPermissions: string[]): string[] {
  return expandPermissions([...(role?.permissions ?? []), ...directPermissions]);
}

export async function getManagedAdminRoles(): Promise<ManagedAdminRole[]> {
  return roleFromRows(await getRawRoles());
}

export async function getManagedAdminUsers(): Promise<ManagedAdminUser[]> {
  return (await getRawUsers()).map(userFromRow);
}

export async function getPasswordResetRequests(): Promise<PasswordResetRequest[]> {
  const rows = await queryRows<RawPasswordResetRequest>(
    `SELECT pr.id, pr.identifier, pr.requested_email, pr.requester_note, pr.status,
            pr.user_id, pr.created_at, pr.handled_at,
            u.name AS user_name, u.email AS user_email,
            handler.name AS handled_by_name
     FROM password_reset_requests pr
     LEFT JOIN users u ON u.id = pr.user_id
     LEFT JOIN users handler ON handler.id = pr.handled_by
     ORDER BY FIELD(pr.status, 'pending', 'handled', 'cancelled'), pr.created_at DESC, pr.id DESC
     LIMIT 40`
  );

  return rows?.map(resetRequestFromRow) ?? [];
}

export async function createPasswordResetRequest(
  input: PasswordResetMutationInput
): Promise<MutationResult<{ id?: number }>> {
  const identifier = normalizeIdentifier(input.identifier);
  const note = nullableString(input.note);

  if (identifier.length < 2) {
    return { ok: false, status: 400, message: "กรุณาระบุชื่อผู้ใช้หรืออีเมล" };
  }

  const user = await findUserIdentity(identifier);
  const pendingRows = await queryRows<{ id: number }>(
    `SELECT id
     FROM password_reset_requests
     WHERE status = 'pending'
       AND (LOWER(identifier) = ? OR (? IS NOT NULL AND user_id = ?))
     ORDER BY id DESC
     LIMIT 1`,
    [identifier, user?.id ?? null, user?.id ?? null]
  );

  if (pendingRows?.[0]) {
    return { ok: true, item: { id: pendingRows[0].id } };
  }

  const created = await executeSqlResult(
    `INSERT INTO password_reset_requests (identifier, requested_email, requester_note, user_id, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`,
    [identifier, user?.email ?? null, note, user?.id ?? null]
  );

  if (!created) {
    return { ok: false, status: 503, message: "ยังส่งคำขอรีเซ็ตรหัสผ่านไม่ได้" };
  }

  return { ok: true, item: { id: created.insertId } };
}

export async function createManagedAdminUser(
  input: UserMutationInput,
  actor: AdminUser
): Promise<MutationResult<ManagedAdminUser>> {
  const name = stringValue(input.name);
  const email = normalizeEmail(input.email);
  const password = stringValue(input.password);
  const roleId = Number(input.roleId) > 0 ? Number(input.roleId) : null;
  const role = await findRole(roleId);
  const roleName = role?.roleName ?? nullableString(input.roleName) ?? "กำหนดเอง";
  const department = nullableString(input.department);
  const status = statusValues.has(stringValue(input.status)) ? stringValue(input.status) : "active";
  const permissions = normalizePermissions(input.permissions);

  if (roleId && !role) {
    return { ok: false, status: 400, message: "ไม่พบบทบาทที่เลือก" };
  }

  if (!name) {
    return { ok: false, status: 400, message: "กรุณาระบุชื่อผู้ใช้" };
  }

  if (!emailPattern.test(email)) {
    return { ok: false, status: 400, message: "กรุณาระบุอีเมลให้ถูกต้อง" };
  }

  if (await emailExists(email)) {
    return { ok: false, status: 409, message: "อีเมลนี้ถูกใช้แล้ว" };
  }

  if (password.length < 6) {
    return { ok: false, status: 400, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }

  if (!canAssignPermissions(actor, permissions)) {
    return { ok: false, status: 403, message: "เฉพาะ Super Admin เท่านั้นที่กำหนดสิทธิ์ทุกเมนูได้" };
  }

  if (role?.permissions.includes("*") && !actor.effectivePermissions.includes("*")) {
    return { ok: false, status: 403, message: "เฉพาะ Super Admin เท่านั้นที่กำหนดบทบาท Super Admin ได้" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await executeSqlResult(
    `INSERT INTO users (name, email, password, role_id, role, permissions, department, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
    [name, email, passwordHash, roleId, roleName, stringifyPermissions(permissions), department, status]
  );

  if (!created?.insertId) {
    return { ok: false, status: 503, message: "ยังสร้างผู้ใช้ไม่ได้" };
  }

  const item = await findUser(created.insertId);

  return item ? { ok: true, item } : { ok: false, status: 503, message: "สร้างแล้ว แต่อ่านข้อมูลกลับมาไม่ได้" };
}

export async function updateManagedAdminUser(
  userId: number,
  input: UserMutationInput,
  actor: AdminUser
): Promise<MutationResult<ManagedAdminUser>> {
  const existing = await findUser(userId);

  if (!existing) {
    return { ok: false, status: 404, message: "ไม่พบบัญชีผู้ใช้" };
  }

  const name = stringValue(input.name);
  const email = normalizeEmail(input.email);
  const password = stringValue(input.password);
  const roleId = Number(input.roleId) > 0 ? Number(input.roleId) : null;
  const role = await findRole(roleId);
  const roleName = role?.roleName ?? nullableString(input.roleName) ?? "กำหนดเอง";
  const department = nullableString(input.department);
  const status = statusValues.has(stringValue(input.status)) ? stringValue(input.status) : "active";
  const permissions = normalizePermissions(input.permissions);
  const effectivePermissions = nextEffectivePermissions(role, permissions);

  if (roleId && !role) {
    return { ok: false, status: 400, message: "ไม่พบบทบาทที่เลือก" };
  }

  if (!name) {
    return { ok: false, status: 400, message: "กรุณาระบุชื่อผู้ใช้" };
  }

  if (!emailPattern.test(email)) {
    return { ok: false, status: 400, message: "กรุณาระบุอีเมลให้ถูกต้อง" };
  }

  if (await emailExists(email, userId)) {
    return { ok: false, status: 409, message: "อีเมลนี้ถูกใช้แล้ว" };
  }

  if (password && password.length < 6) {
    return { ok: false, status: 400, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" };
  }

  if (!canAssignPermissions(actor, permissions)) {
    return { ok: false, status: 403, message: "เฉพาะ Super Admin เท่านั้นที่กำหนดสิทธิ์ทุกเมนูได้" };
  }

  if (role?.permissions.includes("*") && !actor.effectivePermissions.includes("*")) {
    return { ok: false, status: 403, message: "เฉพาะ Super Admin เท่านั้นที่กำหนดบทบาท Super Admin ได้" };
  }

  if (actor.id === userId && status !== "active") {
    return { ok: false, status: 400, message: "ไม่สามารถปิดใช้งานบัญชีของตัวเองได้" };
  }

  if (actor.id === userId && !canAccess(effectivePermissions, "users")) {
    return { ok: false, status: 400, message: "บัญชีของคุณต้องคงสิทธิ์จัดการผู้ใช้งานไว้" };
  }

  if (!(await activeSuperAdminExistsAfterUserChange(userId, status, roleId, permissions))) {
    return { ok: false, status: 400, message: "ต้องมี Super Admin ที่เปิดใช้งานอย่างน้อย 1 บัญชี" };
  }

  const params: Array<string | number | null> = [
    name,
    email,
    roleId,
    roleName,
    stringifyPermissions(permissions),
    department,
    status,
  ];
  const passwordSql = password ? ", password = ?" : "";

  if (password) {
    params.push(await bcrypt.hash(password, 10));
  }

  params.push(userId);

  const saved = await executeSqlResult(
    `UPDATE users
     SET name = ?, email = ?, role_id = ?, role = ?, permissions = ?, department = ?, status = ?${passwordSql}, updated_at = NOW()
     WHERE id = ?`,
    params
  );

  if (!saved) {
    return { ok: false, status: 503, message: "ยังบันทึกบัญชีผู้ใช้ไม่ได้" };
  }

  const item = await findUser(userId);

  return item ? { ok: true, item } : { ok: false, status: 404, message: "ไม่พบบัญชีผู้ใช้หลังบันทึก" };
}

export async function resetManagedAdminUserPassword(
  userId: number,
  input: PasswordResetMutationInput,
  actor: AdminUser
): Promise<MutationResult<ManagedAdminUser>> {
  const existing = await findUser(userId);
  const password = stringValue(input.password);

  if (!existing) {
    return { ok: false, status: 404, message: "ไม่พบบัญชีผู้ใช้" };
  }

  if (password.length < 6) {
    return { ok: false, status: 400, message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" };
  }

  if (existing.effectivePermissions.includes("*") && actor.id !== userId && !actor.effectivePermissions.includes("*")) {
    return { ok: false, status: 403, message: "เฉพาะ Super Admin เท่านั้นที่รีเซ็ตรหัสผ่านบัญชี Super Admin ได้" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const saved = await executeSqlResult(
    "UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?",
    [passwordHash, userId]
  );

  if (!saved) {
    return { ok: false, status: 503, message: "ยังรีเซ็ตรหัสผ่านไม่ได้" };
  }

  await executeSqlResult(
    `UPDATE password_reset_requests
     SET status = 'handled', handled_by = ?, handled_at = NOW(), updated_at = NOW()
     WHERE status = 'pending'
       AND (user_id = ? OR LOWER(identifier) = ? OR LOWER(requested_email) = ?)`,
    [actor.id, userId, existing.email.toLowerCase(), existing.email.toLowerCase()]
  );

  const item = await findUser(userId);

  return item ? { ok: true, item } : { ok: false, status: 404, message: "รีเซ็ตแล้ว แต่ยังอ่านข้อมูลบัญชีกลับมาไม่ได้" };
}

export async function createManagedAdminRole(
  input: RoleMutationInput,
  actor: AdminUser
): Promise<MutationResult<ManagedAdminRole>> {
  const roleName = stringValue(input.roleName);
  const permissions = normalizePermissions(input.permissions);

  if (!roleName) {
    return { ok: false, status: 400, message: "กรุณาระบุชื่อบทบาท" };
  }

  if (!permissions.length) {
    return { ok: false, status: 400, message: "กรุณาเลือกสิทธิ์ของบทบาท" };
  }

  if (!canAssignPermissions(actor, permissions)) {
    return { ok: false, status: 403, message: "เฉพาะ Super Admin เท่านั้นที่สร้างบทบาททุกเมนูได้" };
  }

  const created = await executeSqlResult(
    "INSERT INTO roles (role_name, permissions) VALUES (?, ?)",
    [roleName, stringifyPermissions(permissions)]
  );

  if (!created?.insertId) {
    return { ok: false, status: 503, message: "ยังสร้างบทบาทไม่ได้ หรือชื่อบทบาทซ้ำ" };
  }

  const role = (await getManagedAdminRoles()).find((item) => item.id === created.insertId);

  return role ? { ok: true, item: role } : { ok: false, status: 503, message: "สร้างแล้ว แต่อ่านข้อมูลกลับมาไม่ได้" };
}

export async function updateManagedAdminRole(
  roleId: number,
  input: RoleMutationInput,
  actor: AdminUser
): Promise<MutationResult<ManagedAdminRole>> {
  const existing = (await getManagedAdminRoles()).find((role) => role.id === roleId);
  const roleName = stringValue(input.roleName);
  const permissions = normalizePermissions(input.permissions);

  if (!existing) {
    return { ok: false, status: 404, message: "ไม่พบบทบาท" };
  }

  if (!roleName) {
    return { ok: false, status: 400, message: "กรุณาระบุชื่อบทบาท" };
  }

  if (!permissions.length) {
    return { ok: false, status: 400, message: "กรุณาเลือกสิทธิ์ของบทบาท" };
  }

  if (!canAssignPermissions(actor, permissions)) {
    return { ok: false, status: 403, message: "เฉพาะ Super Admin เท่านั้นที่กำหนดสิทธิ์ทุกเมนูได้" };
  }

  if (existing.permissions.includes("*") && !actor.effectivePermissions.includes("*")) {
    return { ok: false, status: 403, message: "เฉพาะ Super Admin เท่านั้นที่แก้บทบาท Super Admin ได้" };
  }

  if (!(await activeSuperAdminExistsAfterRoleChange(roleId, permissions))) {
    return { ok: false, status: 400, message: "ต้องมี Super Admin ที่เปิดใช้งานอย่างน้อย 1 บัญชี" };
  }

  const saved = await executeSqlResult(
    "UPDATE roles SET role_name = ?, permissions = ? WHERE id = ?",
    [roleName, stringifyPermissions(permissions), roleId]
  );

  if (!saved) {
    return { ok: false, status: 503, message: "ยังบันทึกบทบาทไม่ได้ หรือชื่อบทบาทซ้ำ" };
  }

  const role = (await getManagedAdminRoles()).find((item) => item.id === roleId);

  return role ? { ok: true, item: role } : { ok: false, status: 404, message: "ไม่พบบทบาทหลังบันทึก" };
}

export async function deleteManagedAdminRole(roleId: number, actor: AdminUser): Promise<MutationResult<{ id: number }>> {
  const roles = await getManagedAdminRoles();
  const existing = roles.find((role) => role.id === roleId);

  if (!existing) {
    return { ok: false, status: 404, message: "ไม่พบบทบาท" };
  }

  if (existing.userCount > 0) {
    return { ok: false, status: 400, message: "ยังลบบทบาทนี้ไม่ได้ เพราะมีผู้ใช้งานผูกอยู่" };
  }

  if (existing.permissions.includes("*") && !actor.effectivePermissions.includes("*")) {
    return { ok: false, status: 403, message: "เฉพาะ Super Admin เท่านั้นที่ลบบทบาท Super Admin ได้" };
  }

  const deleted = await executeSqlResult("DELETE FROM roles WHERE id = ?", [roleId]);

  if (!deleted) {
    return { ok: false, status: 503, message: "ยังลบบทบาทไม่ได้" };
  }

  return { ok: true, item: { id: roleId } };
}
