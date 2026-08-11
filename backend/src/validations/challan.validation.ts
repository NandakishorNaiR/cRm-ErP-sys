import { body } from "express-validator";

const ALLOWED_CREATE_STATUSES = ["Draft", "Confirmed"];
const ALLOWED_UPDATE_STATUSES = ["Confirmed", "Cancelled"];

export const createChallanValidation = [
  body("customer_id")
    .notEmpty()
    .withMessage("Customer ID is required")
    .isInt({ min: 1 })
    .withMessage("Customer ID must be a valid positive integer"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("Items must be a non-empty array with at least one product"),
  body("items.*.product_id")
    .notEmpty()
    .withMessage("Product ID is required for each item")
    .isInt({ min: 1 })
    .withMessage("Product ID must be a valid positive integer"),
  body("items.*.quantity")
    .notEmpty()
    .withMessage("Quantity is required for each item")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer greater than 0"),
  body("status")
    .optional({ checkFalsy: true })
    .trim()
    .isIn(ALLOWED_CREATE_STATUSES)
    .withMessage("Status must be either Draft or Confirmed"),
];

export const updateChallanStatusValidation = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(ALLOWED_UPDATE_STATUSES)
    .withMessage("Status must be either Confirmed or Cancelled"),
];
