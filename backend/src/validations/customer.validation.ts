import { body } from "express-validator";

const ALLOWED_TYPES = ["Retail", "Wholesale", "Distributor"];
const ALLOWED_STATUSES = ["Lead", "Active", "Inactive"];

export const createCustomerValidation = [
  body().custom((_value, { req }) => {
    if (!req.body.customer_name && req.body.name) {
      req.body.customer_name = req.body.name;
    }
    if (!req.body.mobile_number && req.body.mobile) {
      req.body.mobile_number = req.body.mobile;
    }
    return true;
  }),
  body("customer_name")
    .trim()
    .notEmpty()
    .withMessage("Customer name is required"),
  body("mobile_number")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),
  body("business_name")
    .trim()
    .notEmpty()
    .withMessage("Business name is required"),
  body("customer_type")
    .trim()
    .notEmpty()
    .withMessage("Customer type is required")
    .isIn(ALLOWED_TYPES)
    .withMessage("Customer type must be one of: Retail, Wholesale, Distributor"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Email must be valid"),
  body("status")
    .optional({ checkFalsy: true })
    .trim()
    .isIn(ALLOWED_STATUSES)
    .withMessage("Status must be one of: Lead, Active, Inactive"),
  body("gst_number")
    .optional({ checkFalsy: true })
    .trim(),
  body("follow_up_date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Follow-up date must be a valid date (YYYY-MM-DD)"),
  body("notes")
    .optional({ checkFalsy: true })
    .trim(),
];

export const updateCustomerValidation = [
  body().custom((_value, { req }) => {
    if (!req.body.customer_name && req.body.name) {
      req.body.customer_name = req.body.name;
    }
    if (!req.body.mobile_number && req.body.mobile) {
      req.body.mobile_number = req.body.mobile;
    }
    return true;
  }),
  body("customer_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Customer name cannot be empty"),
  body("mobile_number")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Mobile number cannot be empty"),
  body("business_name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Business name cannot be empty"),
  body("customer_type")
    .optional()
    .trim()
    .isIn(ALLOWED_TYPES)
    .withMessage("Customer type must be one of: Retail, Wholesale, Distributor"),
  body("address")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Address cannot be empty"),
  body("email")
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage("Email must be valid"),
  body("status")
    .optional()
    .trim()
    .isIn(ALLOWED_STATUSES)
    .withMessage("Status must be one of: Lead, Active, Inactive"),
  body("gst_number")
    .optional({ checkFalsy: true })
    .trim(),
  body("follow_up_date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Follow-up date must be a valid date (YYYY-MM-DD)"),
  body("notes")
    .optional({ checkFalsy: true })
    .trim(),
];

export const addNotesValidation = [
  body("notes")
    .optional({ checkFalsy: true })
    .trim(),
  body("follow_up_date")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Follow-up date must be a valid date (YYYY-MM-DD)"),
];
