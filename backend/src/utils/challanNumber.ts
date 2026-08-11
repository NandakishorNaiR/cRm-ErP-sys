import pool from "../config/database";
import { PoolClient } from "pg";

export const generateNextChallanNumber = async (
  client?: PoolClient
): Promise<string> => {
  const db = client || pool;
  const currentYear = new Date().getFullYear();
  const prefix = `CHN-${currentYear}-`;

  const query = `
    SELECT challan_number
    FROM challans
    WHERE challan_number LIKE $1
    ORDER BY id DESC
    LIMIT 1
  `;

  const result = await db.query(query, [`${prefix}%`]);

  if (result.rows.length === 0) {
    return `${prefix}0001`;
  }

  const lastChallanNumber: string = result.rows[0].challan_number;
  const parts = lastChallanNumber.split("-");
  const lastSeq = parseInt(parts[parts.length - 1], 10);
  const nextSeq = isNaN(lastSeq) ? 1 : lastSeq + 1;

  const paddedSeq = String(nextSeq).padStart(4, "0");
  return `${prefix}${paddedSeq}`;
};
