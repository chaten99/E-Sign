import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { responseHelper } from "../utils/responseHelper.js";


export const verifyUser = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return responseHelper.unauthorized(res, "Please log in to continue.");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return responseHelper.unauthorized(res, "Your session is no longer valid.");
        }

        req.user = user;
        next();
    } catch (error) {
        return responseHelper.unauthorized(res, "Your session is invalid or expired. Please log in again.");
    }
};


export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return responseHelper.unauthorized(res, "Please log in to continue.");
        }

        if (!allowedRoles.includes(req.user?.role)) {
            return responseHelper.forbidden(res, "You do not have permission to access this resource.");
        }

        next();
    };
};
