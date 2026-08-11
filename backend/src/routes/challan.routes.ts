import { Router } from "express";
import {
  createChallan,
  updateChallanStatus,
  getChallans,
  getChallanById,
} from "../controllers/challan.controller";
import {
  createChallanValidation,
  updateChallanStatusValidation,
} from "../validations/challan.validation";
import { validateRequest } from "../middleware/validation.middleware";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Protect all sales challan routes with authentication
router.use(authenticateToken);

// GET /api/challans - List, search, and paginate sales challans
router.get("/", getChallans);

// GET /api/challans/:id - View sales challan detail page with item snapshots
router.get("/:id", getChallanById);

// POST /api/challans - Create Sales Challan as Draft or Confirmed (Admin, Sales)
router.post(
  "/",
  authorizeRoles("Admin", "Sales"),
  createChallanValidation,
  validateRequest,
  createChallan
);

// PUT /api/challans/:id/status - Update challan status (Admin, Sales)
router.put(
  "/:id/status",
  authorizeRoles("Admin", "Sales"),
  updateChallanStatusValidation,
  validateRequest,
  updateChallanStatus
);

// PATCH /api/challans/:id/status - Update challan status (Admin, Sales)
router.patch(
  "/:id/status",
  authorizeRoles("Admin", "Sales"),
  updateChallanStatusValidation,
  validateRequest,
  updateChallanStatus
);

export default router;
