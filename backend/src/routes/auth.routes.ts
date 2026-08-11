import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { loginValidation } from "../validations/auth.validation";
import { validateRequest } from "../middleware/validation.middleware";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// POST /api/auth/login
router.post("/login", loginValidation, validateRequest, login);

// Protected endpoints for testing token and role-based access
router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

router.get("/admin-only", authenticateToken, authorizeRoles("Admin"), (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin access granted",
  });
});

router.get("/sales-only", authenticateToken, authorizeRoles("Sales"), (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Sales access granted",
  });
});

router.get("/warehouse-only", authenticateToken, authorizeRoles("Warehouse"), (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Warehouse access granted",
  });
});

router.get("/accounts-only", authenticateToken, authorizeRoles("Accounts"), (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Accounts access granted",
  });
});

export default router;
