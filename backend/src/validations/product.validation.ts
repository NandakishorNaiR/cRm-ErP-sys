import { body } from "express-validator";

export const createProductValidation = [
  body().custom((_value, { req }) => {
    if (!req.body.product_name && req.body.name) {
      req.body.product_name = req.body.name;
    }
    if (req.body.minimum_stock_quantity === undefined && req.body.minimum_stock_alert_quantity !== undefined) {
      req.body.minimum_stock_quantity = req.body.minimum_stock_alert_quantity;
    }
    if (!req.body.warehouse_location && req.body.location) {
      req.body.warehouse_location = req.body.location;
    }
    return true;
  }),
  body("product_name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required"),
  body("sku")
    .trim()
    .notEmpty()
    .withMessage("SKU is required"),
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category is required"),
  body("unit_price")
    .notEmpty()
    .withMessage("Unit price is required")
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a number greater than or equal to 0"),
  body("current_stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Current stock must be an integer greater than or equal to 0"),
  body("minimum_stock_quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum stock quantity must be an integer greater than or equal to 0"),
  body("warehouse_location")
    .trim()
    .notEmpty()
    .withMessage("Warehouse location is required"),
];

export const updateProductValidation = [
  body().custom((_value, { req }) => {
    if (!req.body.product_name && req.body.name) {
      req.body.product_name = req.body.name;
    }
    if (req.body.minimum_stock_quantity === undefined && req.body.minimum_stock_alert_quantity !== undefined) {
      req.body.minimum_stock_quantity = req.body.minimum_stock_alert_quantity;
    }
    if (!req.body.warehouse_location && req.body.location) {
      req.body.warehouse_location = req.body.location;
    }
    return true;
  }),
  body("product_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Product name cannot be empty"),
  body("sku")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("SKU cannot be empty"),
  body("category")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Category cannot be empty"),
  body("unit_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a number greater than or equal to 0"),
  body("minimum_stock_quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Minimum stock quantity must be an integer greater than or equal to 0"),
  body("warehouse_location")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Warehouse location cannot be empty"),
];

export const createStockMovementValidation = [
  body("product_id")
    .notEmpty()
    .withMessage("Product ID is required")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a valid positive integer"),
  body("quantity_changed")
    .notEmpty()
    .withMessage("Quantity changed is required")
    .isInt({ min: 1 })
    .withMessage("Quantity changed must be a positive integer greater than 0"),
  body("movement_type")
    .trim()
    .notEmpty()
    .withMessage("Movement type is required")
    .toUpperCase()
    .isIn(["IN", "OUT"])
    .withMessage("Movement type must be either IN or OUT"),
  body("reason")
    .trim()
    .notEmpty()
    .withMessage("Reason is required"),
];
