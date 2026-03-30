import { validationResult } from "express-validator";
import { responseHelper } from "../utils/responseHelper.js";

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors.array()[0]);
        const formattedError = errors.array()[0].msg || "Validation error";
        return responseHelper.validationError(res, formattedError);
    }
    next();
}