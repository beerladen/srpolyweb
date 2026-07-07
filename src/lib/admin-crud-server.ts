import {
  getAdminCrudConfig,
  type AdminCrudField,
  type AdminCrudModuleConfig,
  type AdminCrudRow,
  type AdminCrudValue,
} from "@/lib/admin-crud-config";
import { executeSqlResult, queryRows } from "@/lib/db";
import { normalizeLegacyUrl } from "@/lib/legacy-paths";

type RawCrudRow = Record<string, unknown> & { id: number };

type NormalizedMutation =
  | { ok: true; values: Record<string, string | number | null> }
  | { ok: false; message: string };

function quoteIdentifier(value: string): string {
  return `\`${value.replace(/`/g, "")}\``;
}

function fieldLabel(config: AdminCrudModuleConfig, fieldName: string): string {
  return config.fields.find((field) => field.name === fieldName)?.label ?? fieldName;
}

function formatDate(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const raw = String(value);
  return raw ? raw.slice(0, 10) : null;
}

function formatDateTime(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    const hours = String(value.getHours()).padStart(2, "0");
    const minutes = String(value.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  const raw = String(value).replace(" ", "T");
  return raw ? raw.slice(0, 16) : null;
}

function valueForClient(field: AdminCrudField, value: unknown): AdminCrudValue {
  if (field.type === "switch") {
    return Boolean(Number(value ?? 0));
  }

  if (field.type === "date") {
    return formatDate(value);
  }

  if (field.type === "datetime") {
    return formatDateTime(value);
  }

  if (field.type === "number") {
    return value === null || value === undefined ? null : Number(value);
  }

  return value === null || value === undefined ? "" : String(value);
}

function stringValue(value: unknown): string | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  return String(value);
}

function slugify(value: unknown, fallback: string): string {
  const normalized = String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");

  return normalized || `${fallback}-${Date.now().toString(36)}`;
}

function buildHref(config: AdminCrudModuleConfig, row: RawCrudRow): string {
  if (config.hrefTemplate) {
    return config.hrefTemplate.replace(/\{(\w+)\}/g, (_match, key: string) => {
      const value = key === "id" ? row.id : row[key];
      return encodeURIComponent(String(value ?? ""));
    });
  }

  if (config.hrefField) {
    const href = stringValue(row[config.hrefField]);

    if (href) {
      return config.normalizeHref ? normalizeLegacyUrl(href) : href;
    }
  }

  return config.hrefFallback ?? "#";
}

function buildMetric(config: AdminCrudModuleConfig, row: RawCrudRow): string | undefined {
  if (!config.metricField) {
    return undefined;
  }

  const value = row[config.metricField];

  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  if (typeof value === "number" && config.metricSuffix) {
    return `${value.toLocaleString("th-TH")} ${config.metricSuffix}`;
  }

  return config.metricSuffix ? `${String(value)} ${config.metricSuffix}` : String(value);
}

export function rowToAdminCrudRow(config: AdminCrudModuleConfig, row: RawCrudRow): AdminCrudRow {
  const values = Object.fromEntries(
    config.fields.map((field) => [field.name, valueForClient(field, row[field.name])])
  );
  const statusField = config.statusField ? config.fields.find((field) => field.name === config.statusField) : undefined;
  const statusValue = config.statusField ? row[config.statusField] : undefined;
  const status =
    statusField?.type === "switch"
      ? Boolean(Number(statusValue ?? 0))
        ? "active"
        : "inactive"
      : stringValue(statusValue);

  return {
    id: Number(row.id),
    title: stringValue(row[config.titleField]) ?? `#${row.id}`,
    description: config.descriptionField ? stringValue(row[config.descriptionField]) : undefined,
    category: config.categoryField ? stringValue(row[config.categoryField]) : undefined,
    href: buildHref(config, row),
    status,
    metric: buildMetric(config, row),
    values,
  };
}

async function withDynamicFieldOptions(config: AdminCrudModuleConfig): Promise<AdminCrudModuleConfig> {
  const needsNewsCategories = config.fields.some((field) => field.optionsSource === "news_categories");
  const needsDocumentCategories = config.fields.some((field) => field.optionsSource === "document_categories");
  const needsPersonnelGroups = config.fields.some((field) => field.optionsSource === "personnel_groups");

  if (!needsNewsCategories && !needsDocumentCategories && !needsPersonnelGroups) {
    return config;
  }

  const [newsCategories, documentCategories, personnelGroups] = await Promise.all([
    needsNewsCategories
      ? queryRows<{ id: number; name: string }>(
          "SELECT id, name FROM categories WHERE type = 'news' AND status = 'active' ORDER BY sort_order, id"
        )
      : Promise.resolve(null),
    needsDocumentCategories
      ? queryRows<{ id: number; name: string }>(
          "SELECT id, name FROM categories WHERE type = 'document' AND status = 'active' ORDER BY sort_order, id"
        )
      : Promise.resolve(null),
    needsPersonnelGroups
      ? queryRows<{ id: number; name: string }>(
          "SELECT id, name FROM categories WHERE type = 'personnel_group' AND status = 'active' ORDER BY sort_order, id"
        )
      : Promise.resolve(null),
  ]);

  const newsOptions = (newsCategories?.length ? newsCategories : [{ id: 0, name: "ข่าวสาร" }]).map((category) => ({
    value: String(category.id),
    label: category.name,
  }));
  const documentOptions = (
    documentCategories?.length ? documentCategories : [{ id: 0, name: "เอกสารทั่วไป" }]
  ).map((category) => ({
    value: String(category.id),
    label: category.name,
  }));
  const fallbackPersonnelGroups = [
    { id: 0, name: "ผู้บริหาร" },
    { id: 0, name: "ข้าราชการครู" },
    { id: 0, name: "พนักงานราชการ" },
    { id: 0, name: "ครูจ้างสอน/ผู้ชำนาญการ" },
    { id: 0, name: "เจ้าหน้าที่/ลูกจ้าง" },
  ];
  const personnelGroupOptions = (personnelGroups?.length ? personnelGroups : fallbackPersonnelGroups).map((category) => ({
    value: category.name,
    label: category.name,
  }));

  return {
    ...config,
    fields: config.fields.map((field) =>
      field.optionsSource === "news_categories"
        ? { ...field, options: newsOptions, defaultValue: field.defaultValue ?? newsOptions[0]?.value ?? "" }
        : field.optionsSource === "document_categories"
          ? {
              ...field,
              options: documentOptions,
              defaultValue: field.defaultValue ?? documentOptions[0]?.value ?? "",
            }
        : field.optionsSource === "personnel_groups"
          ? {
              ...field,
              options: personnelGroupOptions,
              defaultValue: field.defaultValue ?? personnelGroupOptions[0]?.value ?? "",
            }
          : field
    ),
  };
}

export async function getAdminCrudAvailableConfig(moduleKey: string): Promise<AdminCrudModuleConfig | null> {
  const config = getAdminCrudConfig(moduleKey);

  if (!config) {
    return null;
  }

  const columns = await queryRows<{ Field: string }>(`SHOW COLUMNS FROM ${quoteIdentifier(config.table)}`);

  if (!columns) {
    return withDynamicFieldOptions(config);
  }

  const availableColumns = new Set(columns.map((column) => column.Field));

  return withDynamicFieldOptions({
    ...config,
    fields: config.fields.filter((field) => availableColumns.has(field.name) || !field.optionalColumn),
  });
}

function selectColumns(config: AdminCrudModuleConfig): string {
  const columns = Array.from(new Set(["id", ...config.fields.map((field) => field.name)]));
  return columns.map(quoteIdentifier).join(", ");
}

export async function getAdminCrudRows(
  moduleOrConfig: string | AdminCrudModuleConfig,
  limit = 300
): Promise<AdminCrudRow[] | null> {
  const config =
    typeof moduleOrConfig === "string" ? await getAdminCrudAvailableConfig(moduleOrConfig) : moduleOrConfig;

  if (!config) {
    return null;
  }

  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const rows = await queryRows<RawCrudRow>(
    `SELECT ${selectColumns(config)} FROM ${quoteIdentifier(config.table)} ${config.orderBy ?? "ORDER BY id DESC"} LIMIT ${safeLimit}`
  );

  return rows?.map((row) => rowToAdminCrudRow(config, row)) ?? null;
}

export async function getAdminCrudRawRow(
  moduleOrConfig: string | AdminCrudModuleConfig,
  id: number
): Promise<RawCrudRow | null> {
  const config =
    typeof moduleOrConfig === "string" ? await getAdminCrudAvailableConfig(moduleOrConfig) : moduleOrConfig;

  if (!config) {
    return null;
  }

  const rows = await queryRows<RawCrudRow>(
    `SELECT ${selectColumns(config)} FROM ${quoteIdentifier(config.table)} WHERE id = ? LIMIT 1`,
    [id]
  );

  return rows?.[0] ?? null;
}

export async function getAdminCrudRow(
  moduleOrConfig: string | AdminCrudModuleConfig,
  id: number
): Promise<AdminCrudRow | null> {
  const config =
    typeof moduleOrConfig === "string" ? await getAdminCrudAvailableConfig(moduleOrConfig) : moduleOrConfig;
  const row = config ? await getAdminCrudRawRow(config, id) : null;

  return row && config ? rowToAdminCrudRow(config, row) : null;
}

function isTruthySwitchValue(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    return value > 0;
  }

  const normalized = String(value ?? "").trim().toLowerCase();
  return ["1", "true", "active", "published", "yes", "on"].includes(normalized);
}

function normalizeDatetimeForSql(value: string): string {
  const normalized = value.trim().replace("T", " ");

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(normalized)) {
    return `${normalized}:00`;
  }

  return normalized;
}

function coerceFieldValue(
  config: AdminCrudModuleConfig,
  field: AdminCrudField,
  payloadValue: unknown,
  existing?: RawCrudRow | null
): { ok: true; value: string | number | null } | { ok: false; message: string } {
  const hasPayloadValue = payloadValue !== undefined;
  const rawValue = hasPayloadValue ? payloadValue : existing?.[field.name] ?? field.defaultValue ?? null;

  if (field.type === "switch") {
    return { ok: true, value: isTruthySwitchValue(rawValue) ? 1 : 0 };
  }

  if (field.type === "number") {
    if (rawValue === null || rawValue === undefined || rawValue === "") {
      if (field.defaultValue !== undefined && field.defaultValue !== null && field.defaultValue !== "") {
        const defaultNumberValue = Number(field.defaultValue);

        if (Number.isFinite(defaultNumberValue)) {
          return { ok: true, value: defaultNumberValue };
        }
      }

      return field.required
        ? { ok: false, message: `กรุณาระบุ${field.label}` }
        : { ok: true, value: null };
    }

    const numberValue = Number(rawValue);
    return Number.isFinite(numberValue)
      ? { ok: true, value: numberValue }
      : { ok: false, message: `${field.label}ต้องเป็นตัวเลข` };
  }

  if (field.type === "date") {
    const dateValue = String(rawValue ?? "").trim();
    return dateValue
      ? { ok: true, value: dateValue.slice(0, 10) }
      : field.required
        ? { ok: false, message: `กรุณาระบุ${field.label}` }
        : { ok: true, value: null };
  }

  if (field.type === "datetime") {
    const dateValue = String(rawValue ?? "").trim();
    return dateValue
      ? { ok: true, value: normalizeDatetimeForSql(dateValue) }
      : field.required
        ? { ok: false, message: `กรุณาระบุ${field.label}` }
        : { ok: true, value: null };
  }

  const textValue = String(rawValue ?? "").trim();

  if (field.required && !textValue && field.defaultValue !== undefined && field.defaultValue !== null) {
    const defaultTextValue = String(field.defaultValue).trim();

    if (defaultTextValue) {
      return { ok: true, value: defaultTextValue };
    }
  }

  if (field.required && !textValue) {
    return { ok: false, message: `กรุณาระบุ${field.label}` };
  }

  if (field.type === "select" && field.options?.length && textValue) {
    const allowedValues = new Set(field.options.map((option) => option.value));

    if (!allowedValues.has(textValue)) {
      const existingValue = String(existing?.[field.name] ?? "").trim();

      if (existingValue && existingValue === textValue) {
        return { ok: true, value: textValue };
      }

      const defaultValue = String(field.defaultValue ?? field.options[0]?.value ?? "");
      return defaultValue
        ? { ok: true, value: defaultValue }
        : { ok: false, message: `${field.label}ไม่ถูกต้อง` };
    }
  }

  if (!textValue && !field.required) {
    return { ok: true, value: null };
  }

  return { ok: true, value: textValue };
}

export function normalizeAdminCrudPayload(
  config: AdminCrudModuleConfig,
  payload: Record<string, unknown> | null,
  existing?: RawCrudRow | null
): NormalizedMutation {
  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "ข้อมูลที่ส่งมาไม่ถูกต้อง" };
  }

  const effectivePayload = { ...payload };

  for (const field of config.fields) {
    if (field.autoGenerate !== "slug") {
      continue;
    }

    const currentValue = String(effectivePayload[field.name] ?? "").trim();

    if (currentValue) {
      effectivePayload[field.name] = slugify(currentValue, config.key);
      continue;
    }

    const existingValue = stringValue(existing?.[field.name]);

    if (existingValue) {
      effectivePayload[field.name] = existingValue;
      continue;
    }

    const sourceField = field.sourceField ?? config.titleField;
    effectivePayload[field.name] = slugify(effectivePayload[sourceField] ?? existing?.[sourceField], config.key);
  }

  const values: Record<string, string | number | null> = {};

  for (const field of config.fields) {
    const result = coerceFieldValue(config, field, effectivePayload[field.name], existing);

    if (!result.ok) {
      return result;
    }

    values[field.name] = result.value;
  }

  return { ok: true, values };
}

export async function ensureGeneratedUniqueFields(
  config: AdminCrudModuleConfig,
  values: Record<string, string | number | null>,
  itemId?: number
): Promise<Record<string, string | number | null>> {
  const nextValues = { ...values };

  for (const field of config.fields) {
    if (field.autoGenerate !== "slug" || !(config.uniqueFields ?? []).includes(field.name)) {
      continue;
    }

    const baseValue = slugify(nextValues[field.name], config.key);
    let candidate = baseValue;

    for (let suffix = 2; suffix < 200; suffix += 1) {
      const rows = await queryRows<{ id: number }>(
        `SELECT id FROM ${quoteIdentifier(config.table)} WHERE ${quoteIdentifier(field.name)} = ? ${
          itemId ? "AND id <> ?" : ""
        } LIMIT 1`,
        itemId ? [candidate, itemId] : [candidate]
      );

      if (!rows?.length) {
        nextValues[field.name] = candidate;
        break;
      }

      candidate = `${baseValue}-${suffix}`;
    }
  }

  return nextValues;
}

export async function findAdminCrudDuplicate(
  config: AdminCrudModuleConfig,
  values: Record<string, string | number | null>,
  itemId?: number
): Promise<string | null> {
  for (const fieldName of config.uniqueFields ?? []) {
    const value = values[fieldName];

    if (value === null || value === undefined || value === "") {
      continue;
    }

    const rows = await queryRows<{ id: number }>(
      `SELECT id FROM ${quoteIdentifier(config.table)} WHERE ${quoteIdentifier(fieldName)} = ? ${itemId ? "AND id <> ?" : ""} LIMIT 1`,
      itemId ? [value, itemId] : [value]
    );

    if (rows?.length) {
      return fieldLabel(config, fieldName);
    }
  }

  return null;
}

export async function createAdminCrudItem(
  config: AdminCrudModuleConfig,
  values: Record<string, string | number | null>
) {
  const fieldNames = config.fields.map((field) => field.name);
  const insertColumns = [...fieldNames];
  const placeholders = fieldNames.map(() => "?");
  const params = fieldNames.map((fieldName) => values[fieldName]);

  if (config.createdAt) {
    insertColumns.push("created_at");
    placeholders.push("NOW()");
  }

  if (config.updatedAt) {
    insertColumns.push("updated_at");
    placeholders.push("NOW()");
  }

  return executeSqlResult(
    `INSERT INTO ${quoteIdentifier(config.table)} (${insertColumns.map(quoteIdentifier).join(", ")}) VALUES (${placeholders.join(", ")})`,
    params
  );
}

export async function updateAdminCrudItem(
  config: AdminCrudModuleConfig,
  id: number,
  values: Record<string, string | number | null>
) {
  const fieldNames = config.fields.map((field) => field.name);
  const assignments = fieldNames.map((fieldName) => `${quoteIdentifier(fieldName)} = ?`);
  const params = fieldNames.map((fieldName) => values[fieldName]);

  if (config.updatedAt) {
    assignments.push("updated_at = NOW()");
  }

  return executeSqlResult(
    `UPDATE ${quoteIdentifier(config.table)} SET ${assignments.join(", ")} WHERE id = ?`,
    [...params, id]
  );
}

export async function deleteAdminCrudItem(config: AdminCrudModuleConfig, id: number) {
  return executeSqlResult(`DELETE FROM ${quoteIdentifier(config.table)} WHERE id = ?`, [id]);
}
