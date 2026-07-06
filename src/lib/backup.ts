import { spawn } from "child_process";
import { stat } from "fs/promises";
import path from "path";
import { Readable } from "stream";
import mysql from "mysql2/promise";

type BackupTableRow = {
  TABLE_NAME: string;
};

function getDbConfig() {
  return {
    host: process.env.DB_HOST ?? "127.0.0.1",
    database: process.env.DB_NAME ?? "ita_surin_poly",
    user: process.env.DB_USER ?? "root",
    password: process.env.DB_PASS ?? "",
    charset: process.env.DB_CHARSET ?? "utf8mb4",
  };
}

export function backupTimestamp(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? "00";

  return `${value("year")}${value("month")}${value("day")}-${value("hour")}${value("minute")}${value("second")}`;
}

export function backupDatabaseName(): string {
  return getDbConfig().database.replace(/[^a-zA-Z0-9_-]+/g, "_") || "database";
}

function quoteIdentifier(value: string): string {
  return `\`${value.replace(/`/g, "``")}\``;
}

function escapeSqlString(value: string): string {
  return value.replace(/[\0\b\t\n\r\x1a"'\\]/g, (char) => {
    switch (char) {
      case "\0":
        return "\\0";
      case "\b":
        return "\\b";
      case "\t":
        return "\\t";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\x1a":
        return "\\Z";
      case "\"":
      case "'":
      case "\\":
        return `\\${char}`;
      default:
        return char;
    }
  });
}

function sqlLiteral(value: unknown): string {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (value instanceof Date) {
    return `'${value.toISOString().slice(0, 19).replace("T", " ")}'`;
  }

  if (Buffer.isBuffer(value)) {
    return `0x${value.toString("hex")}`;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  if (typeof value === "bigint") {
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  const textValue = typeof value === "string" ? value : JSON.stringify(value);

  return `'${escapeSqlString(textValue ?? "")}'`;
}

async function getBaseTables(connection: mysql.Connection): Promise<string[]> {
  const [rawRows] = await connection.query(
    `SELECT TABLE_NAME
     FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`
  );
  const rows = rawRows as BackupTableRow[];

  return rows.map((row) => row.TABLE_NAME).filter(Boolean);
}

async function createTableSql(connection: mysql.Connection, tableName: string): Promise<string> {
  const [rawRows] = await connection.query(`SHOW CREATE TABLE ${quoteIdentifier(tableName)}`);
  const rows = rawRows as Array<Record<string, string>>;
  const createSql = rows[0]?.["Create Table"];

  return createSql ? `${createSql};` : "";
}

async function insertRowsSql(connection: mysql.Connection, tableName: string): Promise<string[]> {
  const [rawRows, fields] = await connection.query(`SELECT * FROM ${quoteIdentifier(tableName)}`);
  const rows = rawRows as Array<Record<string, unknown>>;
  const columns = fields.map((field) => field.name);

  if (!rows.length || !columns.length) {
    return [];
  }

  const table = quoteIdentifier(tableName);
  const columnSql = columns.map(quoteIdentifier).join(", ");
  const statements: string[] = [];
  const batchSize = 80;

  for (let startIndex = 0; startIndex < rows.length; startIndex += batchSize) {
    const batch = rows.slice(startIndex, startIndex + batchSize);
    const values = batch.map((row) => `(${columns.map((column) => sqlLiteral(row[column])).join(", ")})`);
    statements.push(`INSERT INTO ${table} (${columnSql}) VALUES\n${values.join(",\n")};`);
  }

  return statements;
}

export async function createDatabaseBackupSql(requestedBy: string): Promise<string> {
  const config = getDbConfig();
  const connection = await mysql.createConnection(config);

  try {
    const tables = await getBaseTables(connection);
    const lines: string[] = [
      `-- SRPOLY database backup`,
      `-- Database: ${config.database}`,
      `-- Created at: ${new Date().toISOString()}`,
      `-- Requested by: ${requestedBy}`,
      "",
      "SET NAMES utf8mb4;",
      "SET FOREIGN_KEY_CHECKS=0;",
      "",
    ];

    for (const tableName of tables) {
      lines.push(`-- --------------------------------------------------------`);
      lines.push(`-- Table structure for ${quoteIdentifier(tableName)}`);
      lines.push(`DROP TABLE IF EXISTS ${quoteIdentifier(tableName)};`);
      lines.push(await createTableSql(connection, tableName));
      lines.push("");

      const inserts = await insertRowsSql(connection, tableName);
      if (inserts.length) {
        lines.push(`-- Data for ${quoteIdentifier(tableName)}`);
        lines.push(...inserts);
        lines.push("");
      }
    }

    lines.push("SET FOREIGN_KEY_CHECKS=1;");
    lines.push("");

    return lines.join("\n");
  } finally {
    await connection.end();
  }
}

export function uploadsDirectory(): string {
  return path.join(process.cwd(), "public", "uploads");
}

export async function uploadsArchiveStream(): Promise<Readable> {
  const directory = uploadsDirectory();
  const directoryStat = await stat(directory).catch(() => null);

  if (!directoryStat?.isDirectory()) {
    throw new Error("Uploads directory not found");
  }

  const archive = spawn("tar", ["-czf", "-", "-C", directory, "."], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  await new Promise<void>((resolve, reject) => {
    archive.once("spawn", resolve);
    archive.once("error", reject);
  });

  let stderr = "";
  archive.stderr?.on("data", (chunk) => {
    stderr += chunk.toString();
  });
  archive.on("close", (code) => {
    if (code && code !== 0) {
      archive.stdout?.destroy(new Error(stderr || "Cannot create uploads archive"));
    }
  });

  if (!archive.stdout) {
    throw new Error("Cannot create uploads archive");
  }

  return archive.stdout;
}
