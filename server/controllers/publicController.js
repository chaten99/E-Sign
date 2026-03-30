import Request from "../models/Request.js";
import { generateRequestPdf } from "../utils/pdfWorker.js";
import { responseHelper } from "../utils/responseHelper.js";

const toPerson = (doc) => {
  if (!doc) return null;
  return {
    name: doc.name || "",
    email: doc.email || "",
  };
};

const buildPdfPayload = (request, reader = null, officer = null) => {
  const court = request.details?.courtId
    ? {
        name: request.details.courtId.name,
        location: request.details.courtId.location,
      }
    : null;
  const details = request.details
    ? {
        date: request.details.date,
        customerName: request.details.customerName,
        amount: request.details.amount,
        dueDate: request.details.dueDate,
        address: request.details.address,
        caseId: request.details.caseId,
        courtId: court,
      }
    : {};

  return {
    requestId: request._id.toString(),
    title: request.title,
    description: request.description,
    status: request.status,
    createdAt: request.createdAt?.toISOString?.() || "",
    lastActivity: request.lastActivity?.toISOString?.() || "",
    details,
    court,
    reader: toPerson(reader),
    officer: toPerson(officer),
    signatureDataUrl: request.signatureDataUrl,
    signedAt: request.signedAt?.toISOString?.() || "",
    qrValue: `${process.env.FRONTEND_URL || "http://localhost:5173"}/requests/${request._id}`,
  };
};

export const getPublicRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id)
      .populate("details.courtId", "name location")
      .populate("assignedOfficerId", "name email");

    if (!request) {
      return responseHelper.notFound(res, "Request");
    }

    if (!request.detailsFilled) {
      return responseHelper.error(res, "Request details are missing.", 400);
    }

    return responseHelper.success(res, "Request fetched successfully", {
      request: {
        _id: request._id,
        title: request.title,
        description: request.description,
        status: request.status,
        createdAt: request.createdAt,
        lastActivity: request.lastActivity,
        details: request.details,
        assignedOfficer: request.assignedOfficerId,
        signatureDataUrl: request.signatureDataUrl,
        signedAt: request.signedAt,
      },
    });
  } catch (error) {
    const message = error?.message || "Failed to fetch request";
    console.error("Public request fetch failed:", error);
    return responseHelper.error(res, message, 500);
  }
};

export const downloadPublicRequestPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findById(id)
      .populate("details.courtId", "name location")
      .populate("assignedOfficerId", "name email");

    if (!request) {
      return responseHelper.notFound(res, "Request");
    }

    if (!request.detailsFilled) {
      return responseHelper.error(res, "Request details are missing.", 400);
    }

    const pdfBuffer = await generateRequestPdf(
      buildPdfPayload(request, null, request.assignedOfficerId)
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=request-${request._id}.pdf`
    );
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    const message = error?.message || "Failed to generate PDF";
    console.error("Public PDF generation failed:", error);
    return responseHelper.error(res, message, 500);
  }
};
