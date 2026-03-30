import { Router } from "express";
import { handleValidationErrors } from "../middleware/validation.js";
import { requestIdValidation } from "../validations/officerValidation.js";
import {
  getPublicRequest,
  downloadPublicRequestPdf,
} from "../controllers/publicController.js";

const publicRoutes = Router();

publicRoutes.get("/:id", requestIdValidation, handleValidationErrors, getPublicRequest);
publicRoutes.get(
  "/:id/pdf",
  requestIdValidation,
  handleValidationErrors,
  downloadPublicRequestPdf
);

export default publicRoutes;
