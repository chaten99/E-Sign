import { body } from "express-validator";

export const loginValidation = [
    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .bail()
    .isEmail()
    .withMessage("Please provide a valid email address."),

    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required.")
    .bail()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long."),
];
