import { responseHelper } from "../utils/responseHelper.js";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return responseHelper.unauthorized(res, "Invalid credentials");
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return responseHelper.unauthorized(res, "Invalid credentials");
        }

        const token = generateToken(user);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite:"None",
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        });

        return responseHelper.success(res, "Login successful", { token });
    } catch (error) {
        console.error("Login error:", error);
        responseHelper.error(res, "Login failed", 500, error.message);
    }
};

export const getCurrentUser = async (req, res) => {
    return responseHelper.success(res, "Current user fetched successfully", {user: req.user});
}

export const logout = (req, res) => {
    res.clearCookie("token");
    return responseHelper.success(res, "Logout successful");
}
