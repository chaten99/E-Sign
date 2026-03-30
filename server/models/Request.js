import { Schema, model } from "mongoose";

const requestSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    readerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["draft", "pending-sign", "rejected", "signed"],
      default: "draft",
    },
    detailsFilled: {
      type: Boolean,
      default: false,
    },
    details: {
      date: String,
      customerName: String,
      amount: String,
      dueDate: String,
      address: String,
      courtId: {
        type: Schema.Types.ObjectId,
        ref: "Court",
      },
      caseId: String,
    },
    assignedOfficerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    signatureDataUrl: {
      type: String,
      default: "",
    },
    signedAt: Date,
    docsCount: {
      type: Number,
      default: 1,
    },
    rejectedCount: {
      type: Number,
      default: 0,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Request = model("Request", requestSchema);

export default Request;
