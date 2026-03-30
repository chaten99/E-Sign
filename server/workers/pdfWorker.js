import { parentPort, workerData } from "worker_threads";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";

const THEME = {
  colors: {
    primary: "#111827",
    secondary: "#6B7280",
    border: "#E5E7EB",
    white: "#FFFFFF",
    accent: "#3730A3",
    accentBg: "#EEF2FF",
    boxBg: "#F9FAFB",
    boxBorder: "#D1D5DB"
  },
  fonts: {
    regular: "Helvetica",
    bold: "Helvetica-Bold",
  },
  margins: { x: 50, rightLimit: 545 },
};

const safeText = (value) => (value ? String(value).trim() : "-");

const formatLocal = (value) => {
  if (!value) return "-";
  try {
    const date = new Date(value);
    return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  } catch {
    return String(value);
  }
};

const drawLabelValue = (doc, label, value, x, y, width) => {
  doc
    .font(THEME.fonts.regular)
    .fontSize(10)
    .fillColor(THEME.colors.secondary)
    .text(label, x, y, { width, lineBreak: false });
  
  doc
    .font(THEME.fonts.bold)
    .fontSize(11)
    .fillColor(THEME.colors.primary)
    .text(safeText(value), x, y + 14, { width });
};

const drawSectionTitle = (doc, title, y) => {
  doc
    .font(THEME.fonts.bold)
    .fontSize(12)
    .fillColor(THEME.colors.primary)
    .text(title, THEME.margins.x, y);

  doc
    .moveTo(THEME.margins.x, y + 18)
    .lineTo(THEME.margins.rightLimit, y + 18)
    .strokeColor(THEME.colors.border)
    .lineWidth(1)
    .stroke();
};

const getBufferFromDataUrl = (dataUrl) => {
  try {
    const base64 = dataUrl.split(",")[1];
    return base64 ? Buffer.from(base64, "base64") : null;
  } catch (error) {
    return null;
  }
};

const renderPdf = async () => {
  const payload = workerData || {};
  const {
    requestId,
    title,
    description,
    status = "draft",
    createdAt,
    lastActivity,
    details = {},
    court = {},
    reader = {},
    officer = {},
    signatureDataUrl,
    signedAt,
    qrValue,
  } = payload;

  const doc = new PDFDocument({ 
    size: "A4", 
    margin: THEME.margins.x,
    info: { Title: title || "Document Request", Creator: "System" }
  });
  
  const chunks = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  doc.on("end", () => {
    parentPort?.postMessage({ ok: true, buffer: Buffer.concat(chunks) });
  });

  doc.rect(0, 0, doc.page.width, 120).fill(THEME.colors.primary);
  
  doc
    .font(THEME.fonts.bold)
    .fillColor(THEME.colors.white)
    .fontSize(24)
    .text("Document Request", THEME.margins.x, 40);
    
  doc
    .font(THEME.fonts.regular)
    .fontSize(11)
    .fillColor(THEME.colors.border)
    .text(`Request ID: ${safeText(requestId)}`, THEME.margins.x, 72);

  let currentY = 145;

  doc
    .font(THEME.fonts.bold)
    .fillColor(THEME.colors.primary)
    .fontSize(16)
    .text(safeText(title), THEME.margins.x, currentY, { width: 360 });

  doc
    .roundedRect(430, currentY - 2, 115, 28, 6)
    .fill(THEME.colors.accentBg);
  doc
    .font(THEME.fonts.bold)
    .fillColor(THEME.colors.accent)
    .fontSize(10)
    .text(String(status).toUpperCase(), 430, currentY + 7, {
      width: 115,
      align: "center",
      characterSpacing: 1
    });

  if (description) {
    currentY += 25;
    doc
      .font(THEME.fonts.regular)
      .fontSize(10)
      .fillColor(THEME.colors.secondary)
      .text(description, THEME.margins.x, currentY, { width: 360, lineGap: 2 });
    currentY += doc.heightOfString(description, { width: 360 });
  } else {
    currentY += 25;
  }

  currentY += 30; 
  drawSectionTitle(doc, "Request Summary", currentY);
  currentY += 30;
  
  drawLabelValue(doc, "Created", formatLocal(createdAt), THEME.margins.x, currentY, 140);
  drawLabelValue(doc, "Last Activity", formatLocal(lastActivity), 210, currentY, 160);
  drawLabelValue(doc, "Reader", reader?.email || reader?.name, 380, currentY, 160);

  currentY += 55;
  drawSectionTitle(doc, "Customer Details", currentY);
  currentY += 30;

  drawLabelValue(doc, "Customer Name", details.customerName, THEME.margins.x, currentY, 180);
  drawLabelValue(doc, "Amount", details.amount, 250, currentY, 120);
  drawLabelValue(doc, "Case ID", details.caseId, 390, currentY, 155);
  
  currentY += 45; 
  drawLabelValue(doc, "Date", formatLocal(details.date), THEME.margins.x, currentY, 140);
  drawLabelValue(doc, "Due Date", formatLocal(details.dueDate), 210, currentY, 140);
  drawLabelValue(doc, "Address", details.address, 370, currentY, 175);

  currentY += 60;
  drawSectionTitle(doc, "Court Information", currentY);
  currentY += 30;
  
  drawLabelValue(doc, "Court Name", court?.name, THEME.margins.x, currentY, 200);
  drawLabelValue(doc, "Location", court?.location, 270, currentY, 200);

  currentY += 60;
  drawSectionTitle(doc, "Signing & Verification", currentY);
  currentY += 30;

  drawLabelValue(doc, "Officer", officer?.email || officer?.name, THEME.margins.x, currentY, 220);
  drawLabelValue(doc, "Signed At", formatLocal(signedAt), 300, currentY, 200);

  currentY += 40;
  
  const sigBoxHeight = 80;
  doc
    .roundedRect(THEME.margins.x, currentY, 220, sigBoxHeight, 4)
    .lineWidth(1)
    .strokeColor(THEME.colors.boxBorder)
    .fillAndStroke(THEME.colors.boxBg, THEME.colors.boxBorder);

  const signatureBuffer = signatureDataUrl ? getBufferFromDataUrl(signatureDataUrl) : null;

  if (signatureBuffer) {
    try {
      doc.image(signatureBuffer, THEME.margins.x + 10, currentY + 10, { height: 45 });
      doc
        .font(THEME.fonts.bold)
        .fontSize(9)
        .fillColor(THEME.colors.secondary)
        .text("Authorized Signature", THEME.margins.x, currentY + sigBoxHeight - 18, { width: 220, align: "center" });
    } catch (e) {
      doc.font(THEME.fonts.regular).fontSize(10).fillColor(THEME.colors.secondary).text("Invalid Signature Data", THEME.margins.x, currentY + 35, { width: 220, align: "center" });
    }
  } else {
    doc
      .font(THEME.fonts.regular)
      .fontSize(10)
      .fillColor("#9CA3AF")
      .text("Signature pending", THEME.margins.x, currentY + 35, { width: 220, align: "center" });
  }

  if (qrValue) {
    try {
      const qrBuffer = await QRCode.toBuffer(qrValue, {
        width: 120,
        margin: 0,
        color: { dark: THEME.colors.primary, light: "#FFFFFF00" },
      });
      
      const qrX = 430; 
      doc.image(qrBuffer, qrX, currentY, { width: 70 });
      doc
        .font(THEME.fonts.regular)
        .fontSize(9)
        .fillColor(THEME.colors.secondary)
        .text("Scan to view file", qrX - 15, currentY + 75, { width: 100, align: "center" });
    } catch (error) {
      console.error("QR Code generation failed:", error);
    }
  }

  doc.end();
};

renderPdf().catch((error) => {
  console.error("PDF generation failed:", error);
  parentPort?.postMessage({ ok: false, error: error.message });
});
