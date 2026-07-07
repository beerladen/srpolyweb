import mysql from "mysql2/promise";

const globalForDb = globalThis as typeof globalThis & {
  __itaMysqlPool?: mysql.Pool;
};

function getPool() {
  if (!globalForDb.__itaMysqlPool) {
    globalForDb.__itaMysqlPool = mysql.createPool({
      host: process.env.DB_HOST ?? "127.0.0.1",
      port: Number(process.env.DB_PORT ?? 3306),
      database: process.env.DB_NAME ?? "ita_surin_poly",
      user: process.env.DB_USER ?? "root",
      password: process.env.DB_PASS ?? "",
      charset: process.env.DB_CHARSET ?? "utf8mb4",
      waitForConnections: true,
      connectionLimit: 5,
      maxIdle: 5,
      idleTimeout: 60_000,
      enableKeepAlive: true,
      connectTimeout: 1200,
    });
  }

  return globalForDb.__itaMysqlPool;
}

export async function queryRows<T extends Record<string, unknown>>(
  sql: string,
  params: mysql.ExecuteValues[] = []
): Promise<T[] | null> {
  try {
    const [rows] = await getPool().execute(sql, params);
    return rows as T[];
  } catch {
    return null;
  }
}

export async function executeSql(
  sql: string,
  params: mysql.ExecuteValues[] = []
): Promise<boolean> {
  try {
    await getPool().execute(sql, params);
    return true;
  } catch {
    return false;
  }
}

export async function executeSqlResult(
  sql: string,
  params: mysql.ExecuteValues[] = []
): Promise<mysql.ResultSetHeader | null> {
  try {
    const [result] = await getPool().execute(sql, params);
    return result as mysql.ResultSetHeader;
  } catch {
    return null;
  }
}
