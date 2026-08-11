import pool from "../config/database";
import { PoolClient } from "pg";

export interface Product {
  id: number;
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock: number;
  minimum_stock_quantity: number;
  warehouse_location: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductInput {
  product_name: string;
  sku: string;
  category: string;
  unit_price: number;
  current_stock?: number;
  minimum_stock_quantity?: number;
  warehouse_location: string;
}

export interface UpdateProductInput {
  product_name?: string;
  sku?: string;
  category?: string;
  unit_price?: number;
  current_stock?: number;
  minimum_stock_quantity?: number;
  warehouse_location?: string;
}

export interface ProductQueryParams {
  search?: string;
  category?: string;
  warehouse_location?: string;
  low_stock_only?: boolean;
  page?: number;
  limit?: number;
}

const formatProduct = (row: any): Product => {
  return {
    ...row,
    id: Number(row.id),
    unit_price: Number(row.unit_price),
    current_stock: Number(row.current_stock),
    minimum_stock_quantity: Number(row.minimum_stock_quantity),
  };
};

export const createProduct = async (
  input: CreateProductInput
): Promise<Product> => {
  const query = `
    INSERT INTO products (
      product_name,
      sku,
      category,
      unit_price,
      current_stock,
      minimum_stock_quantity,
      warehouse_location,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
    RETURNING *
  `;

  const values = [
    input.product_name.trim(),
    input.sku.trim(),
    input.category.trim(),
    input.unit_price,
    input.current_stock !== undefined ? input.current_stock : 0,
    input.minimum_stock_quantity !== undefined ? input.minimum_stock_quantity : 0,
    input.warehouse_location.trim(),
  ];

  const result = await pool.query(query, values);
  return formatProduct(result.rows[0]);
};

export const updateProduct = async (
  id: number,
  input: UpdateProductInput
): Promise<Product | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.product_name !== undefined) {
    fields.push(`product_name = $${paramIndex++}`);
    values.push(input.product_name.trim());
  }
  if (input.sku !== undefined) {
    fields.push(`sku = $${paramIndex++}`);
    values.push(input.sku.trim());
  }
  if (input.category !== undefined) {
    fields.push(`category = $${paramIndex++}`);
    values.push(input.category.trim());
  }
  if (input.unit_price !== undefined) {
    fields.push(`unit_price = $${paramIndex++}`);
    values.push(input.unit_price);
  }
  if (input.current_stock !== undefined) {
    fields.push(`current_stock = $${paramIndex++}`);
    values.push(input.current_stock);
  }
  if (input.minimum_stock_quantity !== undefined) {
    fields.push(`minimum_stock_quantity = $${paramIndex++}`);
    values.push(input.minimum_stock_quantity);
  }
  if (input.warehouse_location !== undefined) {
    fields.push(`warehouse_location = $${paramIndex++}`);
    values.push(input.warehouse_location.trim());
  }

  if (fields.length === 0) {
    return findProductById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE products
    SET ${fields.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    return null;
  }
  return formatProduct(result.rows[0]);
};

export const findProductById = async (
  id: number,
  client?: PoolClient
): Promise<Product | null> => {
  const query = "SELECT * FROM products WHERE id = $1";
  const db = client || pool;
  const result = await db.query(query, [id]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatProduct(result.rows[0]);
};

export const findProductBySku = async (
  sku: string
): Promise<Product | null> => {
  const query = "SELECT * FROM products WHERE LOWER(sku) = LOWER($1)";
  const result = await pool.query(query, [sku.trim()]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatProduct(result.rows[0]);
};

export const findProducts = async (
  params: ProductQueryParams
): Promise<{ products: Product[]; total: number; page: number; limit: number }> => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (params.search && params.search.trim() !== "") {
    const searchTerm = `%${params.search.trim()}%`;
    conditions.push(
      `(product_name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex} OR category ILIKE $${paramIndex} OR warehouse_location ILIKE $${paramIndex})`
    );
    values.push(searchTerm);
    paramIndex++;
  }

  if (params.category && params.category.trim() !== "") {
    conditions.push(`category ILIKE $${paramIndex}`);
    values.push(params.category.trim());
    paramIndex++;
  }

  if (params.warehouse_location && params.warehouse_location.trim() !== "") {
    conditions.push(`warehouse_location ILIKE $${paramIndex}`);
    values.push(params.warehouse_location.trim());
    paramIndex++;
  }

  if (params.low_stock_only) {
    conditions.push(`current_stock <= minimum_stock_quantity`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) FROM products ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].count);

  const dataQuery = `
    SELECT * FROM products
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

  const products = dataResult.rows.map(formatProduct);

  return {
    products,
    total,
    page,
    limit,
  };
};

export const updateProductStock = async (
  id: number,
  newStock: number,
  client?: PoolClient
): Promise<Product | null> => {
  const db = client || pool;
  const query = `
    UPDATE products
    SET current_stock = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING *
  `;
  const result = await db.query(query, [newStock, id]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatProduct(result.rows[0]);
};
