import pool from "../config/database";

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
  created_at?: Date;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const findUserByEmail = async (email: string): Promise<User | null> => {
  const query = "SELECT id, name, email, password, role, created_at FROM users WHERE LOWER(email) = LOWER($1)";
  const result = await pool.query(query, [email.trim()]);
  if (result.rows.length === 0) {
    return null;
  }
  return {
    ...result.rows[0],
    id: Number(result.rows[0].id),
  };
};

export const findUserById = async (id: number): Promise<UserResponse | null> => {
  const query = "SELECT id, name, email, role FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);
  if (result.rows.length === 0) {
    return null;
  }
  return {
    ...result.rows[0],
    id: Number(result.rows[0].id),
  };
};
