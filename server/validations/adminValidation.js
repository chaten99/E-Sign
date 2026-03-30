import { body, param } from "express-validator"

export const createUesrValidation = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength( {min: 2, max: 20})
    .withMessage("Name must be between 2 and 20 characters"),

    body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

    body("password")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

    body("role")
    .trim()
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["officer", "reader"])
    .withMessage("Role must be either 'officer' or 'reader'"),

    body("courtId")
    .trim()
    .notEmpty()
    .withMessage("Court is required")
    .isMongoId()
    .withMessage("Court must be a valid id")
]

export const addCourtValidation = [
    body("name")
    .trim()
    .notEmpty()
    .withMessage("Court name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Court name must be between 2 and 50 characters"),

    body("location")
    .trim()
    .notEmpty()
    .withMessage("Court location is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Court location must be between 2 and 100 characters"),
]

export const idParamValidation = [
    param("id")
    .trim()
    .notEmpty()
    .withMessage("Id is required")
    .isMongoId()
    .withMessage("Id must be a valid id"),
]
