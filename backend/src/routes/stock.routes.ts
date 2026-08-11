import { Router } from "express";
import {
  addStockMovement,
  getStockMovements,
} from "../controllers/stock.controller";
import { createStockMovementValidation } from "../validations/product.validation";
import { validateRequest } from "../middleware/validation.middleware";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Protect all stock routes with authentication
router.use(authenticateToken);

// GET /api/stock/movements - Fetch stock movement audit logs
router.get("/movements", getStockMovements);

// POST /api/stock/movements - Record IN/OUT stock movement (Admin, Warehouse)
router.post(
  "/movements",
  authorizeRoles("Admin", "Warehouse"),
  createStockMovementValidation,
  validateRequest,
  addStockMovement
);

export default router;
