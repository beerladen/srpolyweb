"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  KeyRound,
  Pencil,
  Plus,
  ShieldCheck,
  ShieldOff,
  Trash2,
  UserCog,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showAppToast } from "@/components/ui/app-toast";
import { apiPath } from "@/lib/base-path";
import { permissionCatalogKeys, permissionDescription, permissionLabel } from "@/lib/permissions";
import type { AdminUser } from "@/lib/admin-auth";
import type { ManagedAdminRole, ManagedAdminUser, PasswordResetRequest } from "@/lib/admin-user-management";

type AdminUsersManagerProps = {
  users: ManagedAdminUser[];
  roles: ManagedAdminRole[];
  currentUser: AdminUser;
  passwordResetRequests: PasswordResetRequest[];
};

type UserFormState = {
  id?: number;
  name: string;
  email: string;
  password: string;
  roleId: string;
  roleName: string;
  department: string;
  status: string;
  permissions: string[];
};

type RoleFormState = {
  id?: number;
  roleName: string;
  permissions: string[];
};

type ResetPasswordFormState = {
  userId: number;
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type ApiResult<T> = {
  ok?: boolean;
  item?: T;
  message?: string;
};

const customRoleValue = "custom";

const permissionGroups = [
  {
    title: "ระบบผู้ดูแล",
    keys: ["users", "site_blocks", "cms.navbar", "cms.quick_links", "content_pages", "facebook_api"],
  },
  {
    title: "ข้อมูลเว็บไซต์",
    keys: ["course_groups", "student_stats", "personnel", "services", "ita"],
  },
  {
    title: "ข่าวสารและเอกสาร",
    keys: ["news", "announcements", "documents", "plans"],
  },
  {
    title: "งานเฉพาะฝ่าย",
    keys: ["finance", "procurement", "complaints"],
  },
];

const emptyUserForm: UserFormState = {
  name: "",
  email: "",
  password: "",
  roleId: customRoleValue,
  roleName: "กำหนดเอง",
  department: "",
  status: "active",
  permissions: [],
};

const emptyRoleForm: RoleFormState = {
  roleName: "",
  permissions: [],
};

const emptyResetPasswordForm: ResetPasswordFormState = {
  userId: 0,
  userName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function statusLabel(status: string) {
  return status === "active" ? "เปิดใช้งาน" : "ปิดใช้งาน";
}

function statusVariant(status: string): "default" | "outline" {
  return status === "active" ? "default" : "outline";
}

function normalizePermissionList(permissions: string[]) {
  if (permissions.includes("*")) {
    return ["*"];
  }

  return Array.from(new Set(permissions));
}

function PermissionChips({ permissions, limit = 8 }: { permissions: string[]; limit?: number }) {
  const normalized = normalizePermissionList(permissions);
  const visible = normalized.slice(0, limit);
  const hidden = Math.max(0, normalized.length - visible.length);

  return (
    <div className="flex flex-wrap gap-1.5">
      {visible.map((permission) => (
        <Badge key={permission} variant={permission === "*" ? "default" : "secondary"}>
          {permissionLabel(permission)}
        </Badge>
      ))}
      {hidden > 0 ? <Badge variant="outline">+{hidden}</Badge> : null}
    </div>
  );
}

function PermissionPicker({
  selected,
  onChange,
  disabled = false,
}: {
  selected: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}) {
  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const hasAll = selectedSet.has("*");
  const groupedKeys = new Set(permissionGroups.flatMap((group) => group.keys));
  const remainingKeys = permissionCatalogKeys().filter((key) => !groupedKeys.has(key));
  const groups = remainingKeys.length
    ? [...permissionGroups, { title: "อื่น ๆ", keys: remainingKeys }]
    : permissionGroups;

  function togglePermission(permission: string) {
    if (disabled) {
      return;
    }

    if (permission === "*") {
      onChange(hasAll ? [] : ["*"]);
      return;
    }

    const next = new Set(hasAll ? [] : selected);

    if (next.has(permission)) {
      next.delete(permission);
    } else {
      next.add(permission);
    }

    onChange(Array.from(next));
  }

  return (
    <div className="grid gap-4">
      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/70 p-3">
        <input
          type="checkbox"
          className="mt-1 size-4 accent-blue-700"
          checked={hasAll}
          disabled={disabled}
          onChange={() => togglePermission("*")}
        />
        <span className="min-w-0">
          <span className="block text-sm font-bold text-blue-950">ทุกเมนู / Super Admin</span>
          <span className="mt-1 block text-xs leading-5 text-slate-600">
            ใช้เฉพาะบัญชีผู้ดูแลสูงสุด เพราะสามารถจัดการผู้ใช้ สำรองข้อมูล และทุกโมดูลได้ทั้งหมด
          </span>
        </span>
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        {groups.map((group) => (
          <section key={group.title} className="rounded-lg border border-blue-100 bg-white p-3">
            <h4 className="text-sm font-bold text-blue-950">{group.title}</h4>
            <div className="mt-3 grid gap-2">
              {group.keys.map((permission) => (
                <label
                  key={permission}
                  className={`flex items-start gap-2 rounded-md border px-3 py-2 text-sm ${
                    hasAll
                      ? "border-slate-100 bg-slate-50 text-slate-400"
                      : "border-slate-100 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 size-4 accent-blue-700"
                    checked={hasAll || selectedSet.has(permission)}
                    disabled={disabled || hasAll}
                    onChange={() => togglePermission(permission)}
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold">{permissionLabel(permission)}</span>
                    <span className="mt-0.5 block text-xs leading-5 text-slate-500">{permissionDescription(permission)}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

async function readApi<T>(response: Response): Promise<ApiResult<T>> {
  const data = (await response.json().catch(() => ({}))) as ApiResult<T>;

  if (!response.ok) {
    throw new Error(data.message || "บันทึกข้อมูลไม่สำเร็จ");
  }

  return data;
}

function formatDateTimeText(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function generateTemporaryPassword() {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const symbols = "!@#$%";
  const values = new Uint32Array(10);
  crypto.getRandomValues(values);
  const core = Array.from(values, (value) => characters[value % characters.length]).join("");

  return `Sr${core}${symbols[values[0] % symbols.length]}${new Date().getFullYear()}`;
}

export function AdminUsersManager({ users, roles, currentUser, passwordResetRequests }: AdminUsersManagerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [userForm, setUserForm] = useState<UserFormState>(emptyUserForm);
  const [roleForm, setRoleForm] = useState<RoleFormState>(emptyRoleForm);
  const [resetPasswordForm, setResetPasswordForm] = useState<ResetPasswordFormState>(emptyResetPasswordForm);
  const [message, setMessage] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const activeUsers = users.filter((user) => user.status === "active");
  const inactiveUsers = users.filter((user) => user.status !== "active");
  const superAdmins = users.filter((user) => user.status === "active" && user.effectivePermissions.includes("*"));
  const pendingResetRequests = passwordResetRequests.filter((request) => request.status === "pending");
  const currentUserDisplay = `${currentUser.name} (${currentUser.roleName})`;
  const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
  const usersByIdentifier = useMemo(() => {
    const map = new Map<string, ManagedAdminUser>();

    users.forEach((user) => {
      const email = user.email.toLowerCase();
      map.set(email, user);
      map.set(email.split("@")[0], user);
    });

    return map;
  }, [users]);
  const resetRequestsWithUsers = pendingResetRequests.map((request) => ({
    request,
    user: request.userId ? usersById.get(request.userId) : usersByIdentifier.get(request.identifier.toLowerCase()),
  }));
  const selectedRole = roles.find((role) => String(role.id) === userForm.roleId) ?? null;
  const selectedRolePermissions = selectedRole?.permissions ?? [];
  const userFormTitle = userForm.id ? "อัปเดตบัญชีผู้ใช้" : "เพิ่มบัญชีผู้ใช้";
  const roleFormTitle = roleForm.id ? "อัปเดตบทบาท" : "เพิ่มบทบาท";

  function refreshPage() {
    startTransition(() => router.refresh());
  }

  function openCreateUser() {
    setMessage(null);
    setUserForm(emptyUserForm);
    setUserDialogOpen(true);
  }

  function openEditUser(user: ManagedAdminUser) {
    setMessage(null);
    setUserForm({
      id: user.id,
      name: user.name,
      email: user.email,
      password: "",
      roleId: user.roleId ? String(user.roleId) : customRoleValue,
      roleName: user.roleName || "กำหนดเอง",
      department: user.department === "-" ? "" : user.department,
      status: user.status === "active" ? "active" : "inactive",
      permissions: normalizePermissionList(user.directPermissions),
    });
    setUserDialogOpen(true);
  }

  function openResetPassword(user: ManagedAdminUser, initialPassword = "") {
    setMessage(null);
    setResetPasswordForm({
      userId: user.id,
      userName: user.name,
      email: user.email,
      password: initialPassword,
      confirmPassword: initialPassword,
    });
    setResetDialogOpen(true);
  }

  function fillTemporaryPassword() {
    const temporaryPassword = generateTemporaryPassword();
    setResetPasswordForm((form) => ({
      ...form,
      password: temporaryPassword,
      confirmPassword: temporaryPassword,
    }));
  }

  function openCreateRole() {
    setMessage(null);
    setRoleForm(emptyRoleForm);
    setRoleDialogOpen(true);
  }

  function openEditRole(role: ManagedAdminRole) {
    setMessage(null);
    setRoleForm({
      id: role.id,
      roleName: role.roleName,
      permissions: normalizePermissionList(role.permissions),
    });
    setRoleDialogOpen(true);
  }

  async function saveUser() {
    setSavingKey("user");
    setMessage(null);

    const payload = {
      name: userForm.name,
      email: userForm.email,
      password: userForm.password,
      roleId: userForm.roleId === customRoleValue ? null : Number(userForm.roleId),
      roleName: userForm.roleId === customRoleValue ? userForm.roleName : selectedRole?.roleName,
      department: userForm.department,
      status: userForm.status,
      permissions: userForm.permissions,
    };
    const endpoint = userForm.id ? `/api/admin/users/${userForm.id}` : "/api/admin/users";
    const method = userForm.id ? "PATCH" : "POST";

    try {
      await readApi<ManagedAdminUser>(
        await fetch(apiPath(endpoint), {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      );
      showAppToast({ type: "success", title: "บันทึกผู้ใช้สำเร็จ", message: "อัปเดตบัญชีและสิทธิ์เรียบร้อยแล้ว" });
      setUserDialogOpen(false);
      refreshPage();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "บันทึกผู้ใช้ไม่สำเร็จ";
      setMessage(errorMessage);
      showAppToast({ type: "error", title: "บันทึกผู้ใช้ไม่สำเร็จ", message: errorMessage });
    } finally {
      setSavingKey(null);
    }
  }

  async function savePasswordReset() {
    if (!resetPasswordForm.userId) {
      return;
    }

    if (resetPasswordForm.password.length < 6) {
      setMessage("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
      setMessage("รหัสผ่านใหม่และช่องยืนยันไม่ตรงกัน");
      return;
    }

    setSavingKey("reset-password");
    setMessage(null);

    try {
      await readApi<ManagedAdminUser>(
        await fetch(apiPath(`/api/admin/users/${resetPasswordForm.userId}/password`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: resetPasswordForm.password }),
        })
      );
      showAppToast({
        type: "success",
        title: "รีเซ็ตรหัสผ่านสำเร็จ",
        message: `อัปเดตรหัสผ่านของ ${resetPasswordForm.userName} เรียบร้อยแล้ว`,
      });
      setResetDialogOpen(false);
      setResetPasswordForm(emptyResetPasswordForm);
      refreshPage();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "รีเซ็ตรหัสผ่านไม่สำเร็จ";
      setMessage(errorMessage);
      showAppToast({ type: "error", title: "รีเซ็ตรหัสผ่านไม่สำเร็จ", message: errorMessage });
    } finally {
      setSavingKey(null);
    }
  }

  async function toggleUserStatus(user: ManagedAdminUser) {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    setSavingKey(`status-${user.id}`);
    setMessage(null);

    try {
      await readApi<ManagedAdminUser>(
        await fetch(apiPath(`/api/admin/users/${user.id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            roleId: user.roleId,
            roleName: user.roleName,
            department: user.department === "-" ? "" : user.department,
            status: nextStatus,
            permissions: user.directPermissions,
          }),
        })
      );
      showAppToast({
        type: "success",
        title: nextStatus === "active" ? "เปิดใช้งานบัญชีแล้ว" : "ปิดใช้งานบัญชีแล้ว",
        message: `${user.name} ถูกอัปเดตสถานะเรียบร้อย`,
      });
      refreshPage();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "อัปเดตสถานะไม่สำเร็จ";
      showAppToast({ type: "error", title: "อัปเดตสถานะไม่สำเร็จ", message: errorMessage });
    } finally {
      setSavingKey(null);
    }
  }

  async function saveRole() {
    setSavingKey("role");
    setMessage(null);

    const endpoint = roleForm.id ? `/api/admin/roles/${roleForm.id}` : "/api/admin/roles";
    const method = roleForm.id ? "PATCH" : "POST";

    try {
      await readApi<ManagedAdminRole>(
        await fetch(apiPath(endpoint), {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleName: roleForm.roleName,
            permissions: roleForm.permissions,
          }),
        })
      );
      showAppToast({ type: "success", title: "บันทึกบทบาทสำเร็จ", message: "อัปเดตชุดสิทธิ์ของบทบาทเรียบร้อยแล้ว" });
      setRoleDialogOpen(false);
      refreshPage();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "บันทึกบทบาทไม่สำเร็จ";
      setMessage(errorMessage);
      showAppToast({ type: "error", title: "บันทึกบทบาทไม่สำเร็จ", message: errorMessage });
    } finally {
      setSavingKey(null);
    }
  }

  async function deleteRole(role: ManagedAdminRole) {
    if (!window.confirm(`ลบบทบาท "${role.roleName}" ใช่หรือไม่`)) {
      return;
    }

    setSavingKey(`role-${role.id}`);

    try {
      await readApi<{ id: number }>(
        await fetch(apiPath(`/api/admin/roles/${role.id}`), {
          method: "DELETE",
        })
      );
      showAppToast({ type: "success", title: "ลบบทบาทสำเร็จ", message: "ลบบทบาทที่ไม่มีผู้ใช้งานผูกอยู่แล้ว" });
      refreshPage();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "ลบบทบาทไม่สำเร็จ";
      showAppToast({ type: "error", title: "ลบบทบาทไม่สำเร็จ", message: errorMessage });
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-lg border border-blue-100 bg-[linear-gradient(135deg,#f7fbff_0%,#ffffff_52%,#eef7ff_100%)] p-5 shadow-sm shadow-blue-950/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge variant="outline" className="border-blue-100 bg-white text-blue-800">
              ระบบจัดการบัญชีผู้ใช้
            </Badge>
            <h2 className="mt-3 text-2xl font-bold tracking-normal text-blue-950">ผู้ใช้งานและบทบาท</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              เพิ่ม แก้ไข ปิดใช้งาน รีเซ็ตรหัสผ่าน และกำหนดสิทธิ์ตามบทบาทหรือเฉพาะรายบัญชีได้จากหน้านี้
            </p>
            <p className="mt-1 text-xs font-semibold text-blue-700">
              ผู้ดูแลปัจจุบัน: {currentUserDisplay}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={openCreateRole}>
              <BadgeCheck data-icon="inline-start" />
              เพิ่มบทบาท
            </Button>
            <Button type="button" onClick={openCreateUser}>
              <Plus data-icon="inline-start" />
              เพิ่มผู้ใช้
            </Button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            { label: "ผู้ใช้ทั้งหมด", value: users.length, icon: Users },
            { label: "เปิดใช้งาน", value: activeUsers.length, icon: ShieldCheck },
            { label: "ปิดใช้งาน", value: inactiveUsers.length, icon: ShieldOff },
            { label: "Super Admin", value: superAdmins.length, icon: KeyRound },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.label} className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-md bg-blue-600 text-white">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-blue-700">{item.label}</p>
                    <p className="text-2xl font-extrabold text-slate-950">{item.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {resetRequestsWithUsers.length ? (
        <Card className="border-amber-200 bg-amber-50/60 shadow-sm shadow-amber-950/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-950">
              <KeyRound className="size-5" />
              คำขอรีเซ็ตรหัสผ่าน
            </CardTitle>
            <CardDescription>
              ผู้ใช้ที่ลืมรหัสผ่านจะส่งคำขอมาที่นี่ ผู้ดูแลสามารถเปิดบัญชีที่ตรงกันและตั้งรหัสผ่านใหม่ได้ทันที
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {resetRequestsWithUsers.map(({ request, user }) => (
              <div key={request.id} className="rounded-lg border border-amber-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-950">{request.identifier}</p>
                    <p className="mt-1 text-xs text-slate-500">ส่งคำขอเมื่อ {formatDateTimeText(request.createdAt)}</p>
                  </div>
                  <Badge variant={user ? "secondary" : "outline"}>{user ? "พบบัญชี" : "รอตรวจสอบ"}</Badge>
                </div>
                {request.requesterNote ? (
                  <p className="mt-3 line-clamp-2 rounded-md bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-950">
                    {request.requesterNote}
                  </p>
                ) : null}
                <div className="mt-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  {user ? (
                    <>
                      <span className="block font-semibold text-slate-950">{user.name}</span>
                      <span className="block text-xs">{user.email}</span>
                    </>
                  ) : (
                    "ยังไม่พบบัญชีที่ตรงกัน ตรวจสอบชื่อผู้ใช้หรืออีเมลก่อนรีเซ็ต"
                  )}
                </div>
                <Button
                  type="button"
                  className="mt-3 w-full"
                  variant={user ? "default" : "outline"}
                  disabled={!user}
                  onClick={() => user && openResetPassword(user)}
                >
                  <KeyRound data-icon="inline-start" />
                  รีเซ็ตรหัสผ่าน
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.6fr)]">
        <Card className="border-blue-100 shadow-sm shadow-blue-950/5">
          <CardHeader>
            <CardTitle>บัญชีผู้ใช้งาน</CardTitle>
            <CardDescription>จัดการข้อมูลบัญชี บทบาท สถานะ และสิทธิ์ที่มีผลกับเมนูหลังบ้าน</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ผู้ใช้</TableHead>
                    <TableHead>บทบาท</TableHead>
                    <TableHead>หน่วยงาน</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead>สิทธิ์ที่ใช้จริง</TableHead>
                    <TableHead className="text-right">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="font-semibold text-slate-950">{user.name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </TableCell>
                      <TableCell>{user.roleName}</TableCell>
                      <TableCell>{user.department}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(user.status)}>{statusLabel(user.status)}</Badge>
                      </TableCell>
                      <TableCell className="min-w-[260px]">
                        <PermissionChips permissions={user.effectivePermissions} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => openEditUser(user)}>
                            <Pencil data-icon="inline-start" />
                            แก้ไข
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => openResetPassword(user)}>
                            <KeyRound data-icon="inline-start" />
                            รีเซ็ต
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isPending || savingKey === `status-${user.id}`}
                            onClick={() => toggleUserStatus(user)}
                          >
                            {user.status === "active" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm shadow-blue-950/5">
          <CardHeader>
            <CardTitle>บทบาท</CardTitle>
            <CardDescription>ชุดสิทธิ์ตั้งต้นที่นำไปผูกกับบัญชีผู้ใช้</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {roles.map((role) => (
              <div key={role.id} className="rounded-lg border border-blue-100 bg-white p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">{role.roleName}</p>
                    <p className="text-xs text-slate-500">{role.userCount} บัญชีใช้งานบทบาทนี้</p>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="outline" size="icon-sm" onClick={() => openEditRole(role)}>
                      <Pencil className="size-4" />
                      <span className="sr-only">แก้ไขบทบาท</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      disabled={role.userCount > 0 || savingKey === `role-${role.id}`}
                      onClick={() => deleteRole(role)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">ลบบทบาท</span>
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <PermissionChips permissions={role.permissions} limit={6} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-100 shadow-sm shadow-blue-950/5">
        <CardHeader>
          <CardTitle>รายการสิทธิ์ที่ระบบรองรับ</CardTitle>
          <CardDescription>ใช้กำหนดเมนูหลังบ้านและปุ่มจัดการบนหน้าเว็บไซต์</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {permissionCatalogKeys().map((permission) => (
            <div key={permission} className="rounded-lg border border-blue-100 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-slate-950">{permissionLabel(permission)}</div>
                <Badge variant="secondary">{permission}</Badge>
              </div>
              <p className="mt-2 text-sm leading-6 text-slate-600">{permissionDescription(permission)}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="size-5 text-blue-700" />
              {userFormTitle}
            </DialogTitle>
            <DialogDescription>
              เลือกบทบาทหลักและเพิ่มสิทธิ์เฉพาะรายบัญชีได้ หากต้องการกำหนดเองทั้งหมดให้เลือกบทบาทเป็น “กำหนดเอง”
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel>ชื่อผู้ใช้</FieldLabel>
                <Input value={userForm.name} onChange={(event) => setUserForm((form) => ({ ...form, name: event.target.value }))} />
              </Field>
              <Field>
                <FieldLabel>อีเมล / ชื่อเข้าระบบ</FieldLabel>
                <Input
                  value={userForm.email}
                  onChange={(event) => setUserForm((form) => ({ ...form, email: event.target.value }))}
                  placeholder="user@srpoly.ac.th"
                />
                <FieldDescription>ระบบยังใช้ชื่อหน้า @ เพื่อเข้าสู่ระบบได้ เช่น srpoly</FieldDescription>
              </Field>
              <Field>
                <FieldLabel>{userForm.id ? "รหัสผ่านใหม่" : "รหัสผ่าน"}</FieldLabel>
                <Input
                  type="password"
                  value={userForm.password}
                  onChange={(event) => setUserForm((form) => ({ ...form, password: event.target.value }))}
                  placeholder={userForm.id ? "เว้นว่างไว้ถ้าไม่เปลี่ยนรหัสผ่าน" : "อย่างน้อย 6 ตัวอักษร"}
                />
              </Field>
              <Field>
                <FieldLabel>สถานะบัญชี</FieldLabel>
                <Select value={userForm.status} onValueChange={(value) => setUserForm((form) => ({ ...form, status: value }))}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">เปิดใช้งาน</SelectItem>
                    <SelectItem value="inactive">ปิดใช้งาน</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>บทบาทหลัก</FieldLabel>
                <Select
                  value={userForm.roleId}
                  onValueChange={(value) => {
                    const role = roles.find((item) => String(item.id) === value);
                    setUserForm((form) => ({
                      ...form,
                      roleId: value,
                      roleName: role?.roleName ?? "กำหนดเอง",
                    }));
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={customRoleValue}>กำหนดเอง</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={String(role.id)}>
                        {role.roleName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>หน่วยงาน / ฝ่ายงาน</FieldLabel>
                <Input
                  value={userForm.department}
                  onChange={(event) => setUserForm((form) => ({ ...form, department: event.target.value }))}
                />
              </Field>
              {userForm.roleId === customRoleValue ? (
                <Field>
                  <FieldLabel>ชื่อบทบาทที่แสดง</FieldLabel>
                  <Input
                    value={userForm.roleName}
                    onChange={(event) => setUserForm((form) => ({ ...form, roleName: event.target.value }))}
                  />
                </Field>
              ) : null}
            </div>

            {selectedRolePermissions.length ? (
              <section className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
                <h4 className="text-sm font-bold text-emerald-900">สิทธิ์จากบทบาทหลัก</h4>
                <div className="mt-2">
                  <PermissionChips permissions={selectedRolePermissions} />
                </div>
              </section>
            ) : null}

            <section className="grid gap-3">
              <div>
                <h4 className="font-bold text-slate-950">สิทธิ์เฉพาะรายบัญชี</h4>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  สิทธิ์ส่วนนี้จะถูกเพิ่มจากบทบาทหลัก ถ้าเลือก “ทุกเมนู” บัญชีนี้จะเป็น Super Admin
                </p>
              </div>
              <PermissionPicker
                selected={userForm.permissions}
                onChange={(permissions) => setUserForm((form) => ({ ...form, permissions }))}
              />
            </section>
          </FieldGroup>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setUserDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="button" disabled={savingKey === "user"} onClick={saveUser}>
              {savingKey === "user" ? "กำลังบันทึก..." : userForm.id ? "อัปเดตข้อมูล" : "สร้างบัญชี"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="size-5 text-blue-700" />
              รีเซ็ตรหัสผ่าน
            </DialogTitle>
            <DialogDescription>
              ตั้งรหัสผ่านใหม่ให้บัญชีนี้ ระบบจะบันทึกเป็นรหัสเข้ารหัสและปิดคำขอรีเซ็ตที่เกี่ยวข้องให้อัตโนมัติ
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-4">
            <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4">
              <p className="font-bold text-blue-950">{resetPasswordForm.userName}</p>
              <p className="mt-1 text-sm text-blue-700">{resetPasswordForm.email}</p>
            </div>
            <Field>
              <FieldLabel>รหัสผ่านใหม่</FieldLabel>
              <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                <Input
                  type="text"
                  value={resetPasswordForm.password}
                  onChange={(event) => setResetPasswordForm((form) => ({ ...form, password: event.target.value }))}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                />
                <Button type="button" variant="outline" onClick={fillTemporaryPassword}>
                  สร้างรหัสชั่วคราว
                </Button>
              </div>
              <FieldDescription>
                หากสร้างรหัสชั่วคราว ระบบจะเติมช่องยืนยันให้ทันที ผู้ดูแลสามารถคัดลอกไปแจ้งผู้ใช้ได้
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel>ยืนยันรหัสผ่านใหม่</FieldLabel>
              <Input
                type="password"
                value={resetPasswordForm.confirmPassword}
                onChange={(event) => setResetPasswordForm((form) => ({ ...form, confirmPassword: event.target.value }))}
              />
            </Field>
          </FieldGroup>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setResetDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="button" disabled={savingKey === "reset-password"} onClick={savePasswordReset}>
              {savingKey === "reset-password" ? "กำลังรีเซ็ต..." : "รีเซ็ตรหัสผ่าน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{roleFormTitle}</DialogTitle>
            <DialogDescription>กำหนดชุดสิทธิ์ตั้งต้นของบทบาท เพื่อให้ผูกกับผู้ใช้ได้ง่าย</DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-5">
            <Field>
              <FieldLabel>ชื่อบทบาท</FieldLabel>
              <Input value={roleForm.roleName} onChange={(event) => setRoleForm((form) => ({ ...form, roleName: event.target.value }))} />
            </Field>
            <PermissionPicker
              selected={roleForm.permissions}
              onChange={(permissions) => setRoleForm((form) => ({ ...form, permissions }))}
            />
          </FieldGroup>

          {message ? <p className="text-sm text-red-600">{message}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRoleDialogOpen(false)}>
              ยกเลิก
            </Button>
            <Button type="button" disabled={savingKey === "role"} onClick={saveRole}>
              {savingKey === "role" ? "กำลังบันทึก..." : roleForm.id ? "อัปเดตบทบาท" : "สร้างบทบาท"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
