import pool from "../config/database";
import { PoolClient } from "pg";

export interface StockMovement {
  id: number;
  product_id: number;
  quantity_changed: number;
  movement_type: "IN" | "OUT" | string;
  reason: string;
  created_by: number;
  created_at: Date;
  product_name?: string;
  sku?: string;
  created_by_name?: string;
}

export interface CreateStockMovementInput {
  product_id: number;
  quantity_changed: number;
  movement_type: "IN" | "OUT" | string;
  reason: string;
  created_by: number;
}

export interface StockMovementQueryParams {
  product_id?: number;
  movement_type?: string;
  page?: number;
  limit?: number;
}

const formatStockMovement = (row: any): StockMovement => {
  return {
    ...row,
    id: Number(row.id),
    product_id: Number(row.product_id),
    quantity_changed: Number(row.quantity_changed),
    created_by: Number(row.created_by),
  };
};

export const createStockMovement = async (
  input: CreateStockMovementInput,
  client?: PoolClient
): Promise<StockMovement> => {
  const db = client || pool;
  const query = `
    INSERT INTO stock_movements (
      product_id,
      quantity_changed,
      movement_type,
      reason,
      created_by,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
  `;

  const values = [
    input.product_id,
    input.quantity_changed,
    input.movement_type.toUpperCase(),
    input.reason.trim(),
    input.created_by,
  ];

  const result = await db.query(query, values);
  return formatStockMovement(result.rows[0]);
};

export const findStockMovements = async (
  params: StockMovementQueryParams
): Promise<{ movements: StockMovement[]; total: number; page: number; limit: number }> => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (params.product_id) {
    conditions.push(`sm.product_id = $${paramIndex++}`);
    values.push(params.product_id);
  }

  if (params.movement_type && params.movement_type.trim() !== "") {
    conditions.push(`sm.movement_type = $${paramIndex++}`);
    values.push(params.movement_type.trim().toUpperCase());
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) FROM stock_movements sm ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].count);

  const dataQuery = `
    SELECT 
      sm.*,
      p.product_name,
      p.sku,
      u.name AS created_by_name
    FROM stock_movements sm
    LEFT JOIN products p ON sm.product_id = p.id
    LEFT JOIN users u ON sm.created_by = u.id
    ${whereClause}
    ORDER BY sm.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

  const movements = dataResult.rows.map(formatStockMovement);

  return {
    movements,
    total,
    page,
    limit,
  };
};
