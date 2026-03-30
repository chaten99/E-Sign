import Request from "../models/Request.js";
import { generateRequestPdf } from "../utils/pdfWorker.js";
import { responseHelper } from "../utils/responseHelper.js";

export const getOfficerRequests = async (req, res) => {
  try {
    const requests = await Request.find({ assignedOfficerId: req.user._id })
      .populate("details.courtId", "name location")
      .populate("readerId", "name email")
      .sort({ createdAt: -1 });

    return responseHelper.success(res, "Requests fetched successfully", { requests });
  } catch (error) {
    return responseHelper.error(res, "Failed to fetch requests", 500, error.message);
  }
};

export const rejectOfficerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findOne({ _id: id, assignedOfficerId: req.user._id });

    if (!request) {
      return responseHelper.notFound(res, "Request");
    }

    if (request.status !== "pending-sign") {
      return responseHelper.error(res, "Only pending requests can be rejected.", 400);
    }

    request.status = "rejected";
    request.rejectedCount = (request.rejectedCount || 0) + 1;
    request.lastActivity = new Date();
    await request.save();

    return responseHelper.success(res, "Request rejected", { request });
  } catch (error) {
    return responseHelper.error(res, "Failed to reject request", 500, error.message);
  }
};

export const signOfficerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { signatureDataUrl } = req.body;

    const request = await Request.findOne({ _id: id, assignedOfficerId: req.user._id });
    if (!request) {
      return responseHelper.notFound(res, "Request");
    }

    if (request.status !== "pending-sign") {
      return responseHelper.error(res, "Only pending requests can be signed.", 400);
    }

    request.status = "signed";
    request.signatureDataUrl = signatureDataUrl;
    request.signedAt = new Date();
    request.lastActivity = new Date();
    await request.save();

    await request.populate("details.courtId", "name location");
    await request.populate("readerId", "name email");

    return responseHelper.success(res, "Request signed", { request });
  } catch (error) {
    return responseHelper.error(res, "Failed to sign request", 500, error.message);
  }
};

export const downloadOfficerRequestPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findOne({ _id: id, assignedOfficerId: req.user._id })
      .populate("details.courtId", "name location")
      .populate("readerId", "name email");

    if (!request) {
      return responseHelper.notFound(res, "Request");
    }

    if (!request.detailsFilled) {
      return responseHelper.error(res, "Request details are missing.", 400);
    }

    const qrValue = `${process.env.FRONTEND_URL || "http://localhost:5173"}/requests/${request._id}`;
    const court = request.details?.courtId
      ? {
          name: request.details.courtId.name,
          location: request.details.courtId.location,
        }
      : null;
    const reader = request.readerId
      ? {
          name: request.readerId.name,
          email: request.readerId.email,
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

    const pdfBuffer = await generateRequestPdf({
      requestId: request._id.toString(),
      title: request.title,
      description: request.description,
      status: request.status,
      createdAt: request.createdAt?.toISOString?.() || "",
      lastActivity: request.lastActivity?.toISOString?.() || "",
      details,
      court,
      reader,
      officer: { name: req.user?.name, email: req.user?.email },
      signatureDataUrl: request.signatureDataUrl,
      signedAt: request.signedAt?.toISOString?.() || "",
      qrValue,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=request-${request._id}.pdf`
    );
    return res.status(200).send(pdfBuffer);
  } catch (error) {
    const message = error?.message || "Failed to generate PDF";
    console.error("Officer PDF generation failed:", error);
    return responseHelper.error(res, message, 500);
  }
};
