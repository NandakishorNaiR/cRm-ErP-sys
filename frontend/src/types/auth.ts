export interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Sales" | "Warehouse" | "Accounts" | string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}
