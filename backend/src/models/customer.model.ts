import pool from "../config/database";

export interface Customer {
  id: number;
  customer_name: string;
  mobile_number: string;
  email: string | null;
  business_name: string;
  gst_number: string | null;
  customer_type: string;
  address: string;
  status: string;
  follow_up_date: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomerInput {
  customer_name: string;
  mobile_number: string;
  email?: string | null;
  business_name: string;
  gst_number?: string | null;
  customer_type: string;
  address: string;
  status?: string;
  follow_up_date?: string | null;
  notes?: string | null;
}

export interface UpdateCustomerInput {
  customer_name?: string;
  mobile_number?: string;
  email?: string | null;
  business_name?: string;
  gst_number?: string | null;
  customer_type?: string;
  address?: string;
  status?: string;
  follow_up_date?: string | null;
  notes?: string | null;
}

export interface CustomerQueryParams {
  search?: string;
  status?: string;
  customer_type?: string;
  page?: number;
  limit?: number;
}

const formatCustomer = (row: any): Customer => {
  let followUpDate: string | null = null;
  if (row.follow_up_date) {
    if (row.follow_up_date instanceof Date) {
      const year = row.follow_up_date.getFullYear();
      const month = String(row.follow_up_date.getMonth() + 1).padStart(2, "0");
      const day = String(row.follow_up_date.getDate()).padStart(2, "0");
      followUpDate = `${year}-${month}-${day}`;
    } else if (typeof row.follow_up_date === "string") {
      followUpDate = row.follow_up_date.split("T")[0];
    }
  }

  return {
    ...row,
    id: Number(row.id),
    follow_up_date: followUpDate,
  };
};

export const createCustomer = async (
  input: CreateCustomerInput
): Promise<Customer> => {
  const query = `
    INSERT INTO customers (
      customer_name,
      mobile_number,
      email,
      business_name,
      gst_number,
      customer_type,
      address,
      status,
      follow_up_date,
      notes,
      created_at,
      updated_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    RETURNING *
  `;

  const values = [
    input.customer_name.trim(),
    input.mobile_number.trim(),
    input.email ? input.email.trim() : null,
    input.business_name.trim(),
    input.gst_number ? input.gst_number.trim() : null,
    input.customer_type.trim(),
    input.address.trim(),
    input.status ? input.status.trim() : "Lead",
    input.follow_up_date || null,
    input.notes ? input.notes.trim() : null,
  ];

  const result = await pool.query(query, values);
  return formatCustomer(result.rows[0]);
};

export const updateCustomer = async (
  id: number,
  input: UpdateCustomerInput
): Promise<Customer | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (input.customer_name !== undefined) {
    fields.push(`customer_name = $${paramIndex++}`);
    values.push(input.customer_name.trim());
  }
  if (input.mobile_number !== undefined) {
    fields.push(`mobile_number = $${paramIndex++}`);
    values.push(input.mobile_number.trim());
  }
  if (input.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    values.push(input.email ? input.email.trim() : null);
  }
  if (input.business_name !== undefined) {
    fields.push(`business_name = $${paramIndex++}`);
    values.push(input.business_name.trim());
  }
  if (input.gst_number !== undefined) {
    fields.push(`gst_number = $${paramIndex++}`);
    values.push(input.gst_number ? input.gst_number.trim() : null);
  }
  if (input.customer_type !== undefined) {
    fields.push(`customer_type = $${paramIndex++}`);
    values.push(input.customer_type.trim());
  }
  if (input.address !== undefined) {
    fields.push(`address = $${paramIndex++}`);
    values.push(input.address.trim());
  }
  if (input.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(input.status.trim());
  }
  if (input.follow_up_date !== undefined) {
    fields.push(`follow_up_date = $${paramIndex++}`);
    values.push(input.follow_up_date || null);
  }
  if (input.notes !== undefined) {
    fields.push(`notes = $${paramIndex++}`);
    values.push(input.notes ? input.notes.trim() : null);
  }

  if (fields.length === 0) {
    return findCustomerById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE customers
    SET ${fields.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    return null;
  }
  return formatCustomer(result.rows[0]);
};

export const findCustomerById = async (
  id: number
): Promise<Customer | null> => {
  const query = "SELECT * FROM customers WHERE id = $1";
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    return null;
  }
  return formatCustomer(result.rows[0]);
};

export const findCustomers = async (
  params: CustomerQueryParams
): Promise<{ customers: Customer[]; total: number; page: number; limit: number }> => {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, params.limit || 10);
  const offset = (page - 1) * limit;

  const conditions: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (params.search && params.search.trim() !== "") {
    const searchTerm = `%${params.search.trim()}%`;
    conditions.push(
      `(customer_name ILIKE $${paramIndex} OR business_name ILIKE $${paramIndex} OR mobile_number ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`
    );
    values.push(searchTerm);
    paramIndex++;
  }

  if (params.status && params.status.trim() !== "") {
    conditions.push(`status = $${paramIndex}`);
    values.push(params.status.trim());
    paramIndex++;
  }

  if (params.customer_type && params.customer_type.trim() !== "") {
    conditions.push(`customer_type = $${paramIndex}`);
    values.push(params.customer_type.trim());
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countQuery = `SELECT COUNT(*) FROM customers ${whereClause}`;
  const countResult = await pool.query(countQuery, values);
  const total = Number(countResult.rows[0].count);

  const dataQuery = `
    SELECT * FROM customers
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;
  const dataResult = await pool.query(dataQuery, [...values, limit, offset]);

  const customers = dataResult.rows.map(formatCustomer);

  return {
    customers,
    total,
    page,
    limit,
  };
};

export const updateCustomerNotes = async (
  id: number,
  notes?: string,
  follow_up_date?: string
): Promise<Customer | null> => {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (notes !== undefined) {
    fields.push(`notes = $${paramIndex++}`);
    values.push(notes ? notes.trim() : null);
  }

  if (follow_up_date !== undefined) {
    fields.push(`follow_up_date = $${paramIndex++}`);
    values.push(follow_up_date || null);
  }

  if (fields.length === 0) {
    return findCustomerById(id);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE customers
    SET ${fields.join(", ")}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  if (result.rows.length === 0) {
    return null;
  }
  return formatCustomer(result.rows[0]);
};
