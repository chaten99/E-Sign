import { body, param, query } from "express-validator";

export const createRequestValidation = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Request title is required")
    .isLength({ min: 3, max: 120 })
    .withMessage("Request title must be between 3 and 120 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Description must be 500 characters or less"),
];

export const requestIdValidation = [
  param("id").isMongoId().withMessage("Invalid request id"),
];

export const requestDetailsValidation = [
  body("date").notEmpty().withMessage("Date is required").isISO8601().withMessage("Date is invalid"),
  body("customerName").trim().notEmpty().withMessage("Customer name is required"),
  body("amount").trim().notEmpty().withMessage("Amount is required"),
  body("dueDate").notEmpty().withMessage("Due date is required").isISO8601().withMessage("Due date is invalid"),
  body("address").trim().notEmpty().withMessage("Address is required"),
  body("courtId").notEmpty().withMessage("Court is required").isMongoId().withMessage("Invalid court id"),
  body("caseId").trim().notEmpty().withMessage("Case ID is required"),
];

export const sendForSignatureValidation = [
  body("officerId").notEmpty().withMessage("Officer is required").isMongoId().withMessage("Invalid officer id"),
];

export const courtIdQueryValidation = [
  query("courtId").notEmpty().withMessage("Court is required").isMongoId().withMessage("Invalid court id"),
];
