import { Router } from "express";
import {
  addCustomer,
  editCustomer,
  getCustomers,
  getCustomerById,
  addFollowUpNotes,
} from "../controllers/customer.controller";
import {
  createCustomerValidation,
  updateCustomerValidation,
  addNotesValidation,
} from "../validations/customer.validation";
import { validateRequest } from "../middleware/validation.middleware";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Protect all customer routes with authentication
router.use(authenticateToken);

// GET /api/customers - Search, filter, and paginate customers (All authenticated roles)
router.get("/", getCustomers);

// GET /api/customers/:id - View customer detail (All authenticated roles)
router.get("/:id", getCustomerById);

// POST /api/customers - Add new customer (Admin, Sales)
router.post(
  "/",
  authorizeRoles("Admin", "Sales"),
  createCustomerValidation,
  validateRequest,
  addCustomer
);

// PUT /api/customers/:id - Edit existing customer (Admin, Sales)
router.put(
  "/:id",
  authorizeRoles("Admin", "Sales"),
  updateCustomerValidation,
  validateRequest,
  editCustomer
);

// POST /api/customers/:id/notes - Add/update follow-up notes & date (Admin, Sales)
router.post(
  "/:id/notes",
  authorizeRoles("Admin", "Sales"),
  addNotesValidation,
  validateRequest,
  addFollowUpNotes
);

export default router;
