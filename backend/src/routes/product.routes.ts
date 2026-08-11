import { Router } from "express";
import {
  addProduct,
  editProduct,
  getProducts,
  getProductById,
} from "../controllers/product.controller";
import {
  createProductValidation,
  updateProductValidation,
} from "../validations/product.validation";
import { validateRequest } from "../middleware/validation.middleware";
import { authenticateToken } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

// Protect all product routes with authentication
router.use(authenticateToken);

// GET /api/products - Search, filter, and paginate products
router.get("/", getProducts);

// GET /api/products/:id - Get product details
router.get("/:id", getProductById);

// POST /api/products - Add product (Admin, Warehouse, Sales)
router.post(
  "/",
  authorizeRoles("Admin", "Warehouse", "Sales"),
  createProductValidation,
  validateRequest,
  addProduct
);

// PUT /api/products/:id - Edit product (Admin, Warehouse, Sales)
router.put(
  "/:id",
  authorizeRoles("Admin", "Warehouse", "Sales"),
  updateProductValidation,
  validateRequest,
  editProduct
);

export default router;
