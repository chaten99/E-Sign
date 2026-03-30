import { Router } from "express";
import { getCurrentUser, login, logout } from "../controllers/authController.js";
import { loginValidation } from "../validations/authValidation.js";
import { handleValidationErrors } from "../middleware/validation.js";
import { verifyUser } from "../middleware/auth.js";

const router = Router();

router.post("/login",loginValidation,handleValidationErrors,login);
router.post("/logout", logout);
router.get("/session", verifyUser ,getCurrentUser);

export default router;