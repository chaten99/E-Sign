import Court from "../models/Court.js";
import Request from "../models/Request.js";
import User from "../models/User.js";
import { generateRequestPdf } from "../utils/pdfWorker.js";
import { responseHelper } from "../utils/responseHelper.js";

export const getReaderCourts = async (req, res) => {
  try {
    const courts = await Court.find().select("name location").sort({ name: 1 });
    return responseHelper.success(res, "Courts fetched successfully", { courts });
  } catch (error) {
    return responseHelper.error(res, "Failed to fetch courts", 500, error.message);
  }
};

export const getReaderRequests = async (req, res) => {
  try {
    const requests = await Request.find({ readerId: req.user._id })
      .populate("details.courtId", "name location")
      .populate("assignedOfficerId", "name email")
      .sort({ createdAt: -1 });

    return responseHelper.success(res, "Requests fetched successfully", { requests });
  } catch (error) {
    return responseHelper.error(res, "Failed to fetch requests", 500, error.message);
  }
};

export const createReaderRequest = async (req, res) => {
  try {
    const { title, description } = req.body;

    const request = await Request.create({
      title,
      description: description || "",
      readerId: req.user._id,
      status: "draft",
      detailsFilled: false,
      lastActivity: new Date(),
    });

    return responseHelper.success(res, "Request created successfully", { request }, 201);
  } catch (error) {
    return responseHelper.error(res, "Failed to create request", 500, error.message);
  }
};

export const updateReaderRequestDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      customerName,
      amount,
      dueDate,
      address,
      courtId,
      caseId,
    } = req.body;

    const request = await Request.findOne({ _id: id, readerId: req.user._id });
    if (!request) {
      return responseHelper.notFound(res, "Request");
    }

    if (request.status !== "draft") {
      return responseHelper.forbidden(res, "Request details are locked after sending for signature.");
    }

    const court = await Court.findById(courtId).select("_id");
    if (!court) {
      return responseHelper.notFound(res, "Court");
    }

    request.details = {
      date,
      customerName,
      amount,
      dueDate,
      address,
      courtId: court._id,
      caseId,
    };
    request.detailsFilled = true;
    request.lastActivity = new Date();

    await request.save();
    await request.populate("details.courtId", "name location");

    return responseHelper.success(res, "Request details saved successfully", { request });
  } catch (error) {
    return responseHelper.error(res, "Failed to save request details", 500, error.message);
  }
};

export const sendRequestForSignature = async (req, res) => {
  try {
    const { id } = req.params;
    const { officerId } = req.body;

    const request = await Request.findOne({ _id: id, readerId: req.user._id });
    if (!request) {
      return responseHelper.notFound(res, "Request");
    }

    if (request.status !== "draft") {
      return responseHelper.forbidden(res, "Request already sent for signature.");
    }

    if (!request.detailsFilled || !request.details?.courtId) {
      return responseHelper.error(res, "Fill request details before sending for signature.", 400);
    }

    const officer = await User.findOne({ _id: officerId, role: "officer" });
    if (!officer) {
      return responseHelper.notFound(res, "Officer");
    }

    if (!officer.courtId || String(officer.courtId) !== String(request.details.courtId)) {
      return responseHelper.error(res, "Selected officer does not belong to this court.", 400);
    }

    request.status = "pending-sign";
    request.assignedOfficerId = officer._id;
    request.lastActivity = new Date();
    await request.save();
    await request.populate("assignedOfficerId", "name email");

    return responseHelper.success(res, "Request sent for signature", { request });
  } catch (error) {
    return responseHelper.error(res, "Failed to send request for signature", 500, error.message);
  }
};

export const deleteReaderRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findOneAndDelete({ _id: id, readerId: req.user._id });

    if (!request) {
      return responseHelper.notFound(res, "Request");
    }

    return responseHelper.success(res, "Request removed successfully");
  } catch (error) {
    return responseHelper.error(res, "Failed to remove request", 500, error.message);
  }
};

export const getOfficersByCourt = async (req, res) => {
  try {
    const { courtId } = req.query;

    const officers = await User.find({ role: "officer", courtId })
      .select("name email courtId")
      .populate("courtId", "name location")
      .sort({ name: 1 });

    return responseHelper.success(res, "Officers fetched successfully", { officers });
  } catch (error) {
    return responseHelper.error(res, "Failed to fetch officers", 500, error.message);
  }
};

export const downloadReaderRequestPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await Request.findOne({ _id: id, readerId: req.user._id })
      .populate("details.courtId", "name location")
      .populate("assignedOfficerId", "name email");

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
    const officer = request.assignedOfficerId
      ? {
          name: request.assignedOfficerId.name,
          email: request.assignedOfficerId.email,
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
      reader: { name: req.user?.name, email: req.user?.email },
      officer,
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
    console.error("Reader PDF generation failed:", error);
    return responseHelper.error(res, message, 500);
  }
};
