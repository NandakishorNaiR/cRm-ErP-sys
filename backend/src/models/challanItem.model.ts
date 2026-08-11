import pool from "../config/database";
import { PoolClient } from "pg";

export interface ChallanItem {
  id: number;
  challan_id: number;
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
}

export interface CreateChallanItemInput {
  challan_id: number;
  product_id: number;
  product_name: string;
  sku: string;
  unit_price: number;
  quantity: number;
}

const formatChallanItem = (row: any): ChallanItem => {
  return {
    ...row,
    id: Number(row.id),
    challan_id: Number(row.challan_id),
    product_id: Number(row.product_id),
    unit_price: Number(row.unit_price),
    quantity: Number(row.quantity),
  };
};

export const createChallanItems = async (
  items: CreateChallanItemInput[],
  client?: PoolClient
): Promise<ChallanItem[]> => {
  if (items.length === 0) {
    return [];
  }

  const db = client || pool;
  const createdItems: ChallanItem[] = [];

  for (const item of items) {
    const query = `
      INSERT INTO challan_items (
        challan_id,
        product_id,
        product_name,
        sku,
        unit_price,
        quantity
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      item.challan_id,
      item.product_id,
      item.product_name,
      item.sku,
      item.unit_price,
      item.quantity,
    ];

    const result = await db.query(query, values);
    createdItems.push(formatChallanItem(result.rows[0]));
  }

  return createdItems;
};

export const findChallanItemsByChallanId = async (
  challan_id: number,
  client?: PoolClient
): Promise<ChallanItem[]> => {
  const db = client || pool;
  const query = "SELECT * FROM challan_items WHERE challan_id = $1 ORDER BY id ASC";
  const result = await db.query(query, [challan_id]);
  return result.rows.map(formatChallanItem);
};
