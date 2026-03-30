import { Router } from "express";
import { verifyUser, authorizeRoles } from "../middleware/auth.js";
import { handleValidationErrors } from "../middleware/validation.js";
import {
  getOfficerRequests,
  rejectOfficerRequest,
  signOfficerRequest,
  downloadOfficerRequestPdf,
} from "../controllers/officerController.js";
import { requestIdValidation, signRequestValidation } from "../validations/officerValidation.js";

const officerRoutes = Router();

officerRoutes.use(verifyUser);
officerRoutes.use(authorizeRoles("officer"));

officerRoutes.get("/requests", getOfficerRequests);
officerRoutes.get("/requests/:id/pdf", requestIdValidation, handleValidationErrors, downloadOfficerRequestPdf);
officerRoutes.post("/requests/:id/reject", requestIdValidation, handleValidationErrors, rejectOfficerRequest);
officerRoutes.post(
  "/requests/:id/sign",
  requestIdValidation,
  signRequestValidation,
  handleValidationErrors,
  signOfficerRequest
);

export default officerRoutes;
