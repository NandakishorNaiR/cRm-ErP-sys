import pool from "../config/database";
import { PoolClient } from "pg";
import { ChallanItem, findChallanItemsByChallanId } from "./challanItem.model";

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  total_quantity: number;
  status: string;
  created_by: number;
  created_at: Date;
}

export interface ChallanWithDetails extends Challan {
  customer_name?: string;
  business_name?: string;
  created_by_name?: string;
  items?: ChallanItem[];
}

export interface CreateChallanInput {
  challan_number: string;
  customer_id: number;
  total_quantity: number;
  status: string;
  created_by: number;
}

export interface ChallanQueryParams {
  customer_id?: number;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

const formatChallan = (row: any): ChallanWithDetails => {
  return {
    ...row,
    id: Number(row.id),
    customer_id: Number(row.customer_id),
    total_quantity: Number(row.total_quantity),
    created_by: Number(row.created_by),
  };
};

export const createChallanHeader = async (
  input: CreateChallanInput,
  client?: PoolClient
): Promise<Challan> => {
  const db = client || pool;
  const query = `
    INSERT INTO challans (
      challan_number,
      customer_id,
      total_quantity,
      status,
      created_by,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING *
  `;

  const values = [
    input.challan_number,
    input.customer_id,
    input.total_quantity,
    input.status,
    input.created_by,
  ];

  const result = await db.query(query, values);
  return formatChallan(result.rows[0]);
};

export const updateChallanStatus = async (
  id: number,
  status: string,
  client?: PoolClient
): Promise<Challan | null> => {
  const db = client || pool;
  const query = `
    UPDATE challans
    SET status = $1
    WHERE id = $2
    RETURNING *
  `;

  const result = await db.query(query, [status, id]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatChallan(result.rows[0]);
};

export const findChallanById = async (
  id: number,
  client?: PoolClient
): Promise<ChallanWithDetails | null> => {
  const db = client || pool;
  const query = `
    SELECT 
      c.*,
      cust.customer_name,
      cust.business_name,
      u.name AS created_by_name
    FROM challans c
    LEFT JOIN customers cust ON c.customer_id = cust.id
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.id = $1
  `;

  const result = await db.query(query, [id]);
  if (result.rows.length === 0) {
    return null;
  }

  const challan = formatChallan(result.rows[0]);
  challan.items = await findChallanItemsByChallanId(id, client);
  return challan;
};

export const findChallans = async (
  params: ChallanQueryParams
): Promise<{ challans: ChallanWithDetails[]; total: number; page: number; limit: number }> => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (params.customer_id) {
    conditions.push(`c.customer_id = $${paramIndex++}`);
    values.push(params.customer_id);
  }

  if (params.status && params.status.trim() !== "") {
    conditions.push(`c.status = $${paramIndex++}`);
    values.push(params.status.trim());
  }

  if (params.search && params.search.trim() !== "") {
    const searchTerm = `%${params.search.trim()}%`;
    conditions.push(
      `(c.challan_number ILIKE $${paramIndex} OR cust.customer_name ILIKE $${paramIndex} OR cust.business_name ILIKE $${paramIndex})`
    );
    values.push(searchTerm);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `
    SELECT COUNT(*) 
    FROM challans c
    LEFT JOIN customers cust ON c.customer_id = cust.id
    ${whereClause}
  `;
  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].count);

  const dataQuery = `
    SELECT 
      c.*,
      cust.customer_name,
      cust.business_name,
      u.name AS created_by_name
    FROM challans c
    LEFT JOIN customers cust ON c.customer_id = cust.id
    LEFT JOIN users u ON c.created_by = u.id
    ${whereClause}
    ORDER BY c.created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

  const challans = await Promise.all(
    dataResult.rows.map(async (row) => {
      const challan = formatChallan(row);
      challan.items = await findChallanItemsByChallanId(challan.id);
      return challan;
    })
  );

  return {
    challans,
    total,
    page,
    limit,
  };
};
