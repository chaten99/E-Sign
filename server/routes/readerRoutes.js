import { Router } from "express";
import { verifyUser, authorizeRoles } from "../middleware/auth.js";
import { handleValidationErrors } from "../middleware/validation.js";
import {
  courtIdQueryValidation,
  createRequestValidation,
  requestDetailsValidation,
  requestIdValidation,
  sendForSignatureValidation,
} from "../validations/readerValidation.js";
import {
  createReaderRequest,
  deleteReaderRequest,
  getOfficersByCourt,
  getReaderCourts,
  getReaderRequests,
  sendRequestForSignature,
  updateReaderRequestDetails,
  downloadReaderRequestPdf,
} from "../controllers/readerController.js";

const readerRoutes = Router();

readerRoutes.use(verifyUser);
readerRoutes.use(authorizeRoles("reader"));

readerRoutes.get("/courts", getReaderCourts);
readerRoutes.get("/requests", getReaderRequests);
readerRoutes.get("/requests/:id/pdf", requestIdValidation, handleValidationErrors, downloadReaderRequestPdf);
readerRoutes.get("/officers", courtIdQueryValidation, handleValidationErrors, getOfficersByCourt);

readerRoutes.post("/requests", createRequestValidation, handleValidationErrors, createReaderRequest);
readerRoutes.put("/requests/:id/details", requestIdValidation, requestDetailsValidation, handleValidationErrors, updateReaderRequestDetails);
readerRoutes.post("/requests/:id/send", requestIdValidation, sendForSignatureValidation, handleValidationErrors, sendRequestForSignature);
readerRoutes.delete("/requests/:id", requestIdValidation, handleValidationErrors, deleteReaderRequest);

export default readerRoutes;
