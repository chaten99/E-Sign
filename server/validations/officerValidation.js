import { body, param } from "express-validator";

export const requestIdValidation = [
  param("id").isMongoId().withMessage("Invalid request id"),
];

export const signRequestValidation = [
  body("signatureDataUrl")
    .notEmpty()
    .withMessage("Signature is required")
    .isString()
    .withMessage("Signature is invalid")
    .custom((value) => value.startsWith("data:image/"))
    .withMessage("Signature must be an image data URL"),
];
