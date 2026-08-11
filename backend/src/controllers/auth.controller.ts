import { Request, Response } from "express";
import { loginUser } from "../services/auth.service";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    if (!result) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Login controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
