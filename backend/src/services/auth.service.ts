import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, UserResponse } from "../models/user.model";

export interface LoginResult {
  token: string;
  user: UserResponse;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResult | null> => {
  const user = await findUserByEmail(email);
  if (!user || !user.password) {
    return null;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return null;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured in environment variables");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    jwtSecret,
    { expiresIn: "24h" }
  );

  const userResponse: UserResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  return {
    token,
    user: userResponse,
  };
};
