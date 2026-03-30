import { Router } from "express";
import { verifyUser, authorizeRoles } from "../middleware/auth.js";
import {
  getAdminDashboardDetails,
  getAllCourts,
  getAllOfficers,
  getAllRequests,
  getAllReaders,
  handleAddCourt,
  handleCreateUser,
  handleDeleteCourt,
  handleDeleteUser,
} from "../controllers/adminController.js";
import { handleValidationErrors } from "../middleware/validation.js";
import { addCourtValidation, createUesrValidation, idParamValidation } from "../validations/adminValidation.js";
const adminRoutes = Router();

adminRoutes.use(verifyUser);
adminRoutes.use(authorizeRoles("admin"));


adminRoutes.get("/dashboard", getAdminDashboardDetails);
adminRoutes.get("/officers", getAllOfficers);
adminRoutes.get("/readers", getAllReaders);
adminRoutes.get("/courts", getAllCourts);
adminRoutes.get("/requests", getAllRequests);

adminRoutes.post("/user", createUesrValidation, handleValidationErrors, handleCreateUser);
adminRoutes.post("/court", addCourtValidation, handleValidationErrors, handleAddCourt);
adminRoutes.delete("/users/:id", idParamValidation, handleValidationErrors, handleDeleteUser);
adminRoutes.delete("/courts/:id", idParamValidation, handleValidationErrors, handleDeleteCourt);

export default adminRoutes;
