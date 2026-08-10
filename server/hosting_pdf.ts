import PDFDocument from "pdfkit";
import { HostingInvoiceRecord, HostingSubscriptionRecord } from "./hosting_model.js";

export interface HostingReceiptPDFData {
  invoice: HostingInvoiceRecord;
  subscription: HostingSubscriptionRecord;
  clientName: string;
  businessName: string;
  clientEmail?: string;
  projectName: string;
}

export function formatINR(amount: number): string {
  const rounded = Math.round(amount).toLocaleString("en-IN");
  return `Rs. ${rounded}`;
}

export function formatDate(isoString: string): string {
  if (!isoString) return "N/A";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch (e) {
    return isoString;
  }
}

export function generateHostingReceiptPDF(data: HostingReceiptPDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 0,
        size: "A4",
        info: {
          Title: `CodeFuser Hosting Invoice - ${data.invoice.receiptNumber}`,
          Author: "CodeFuser Digital Studio",
          Subject: "Official Hosting Payment Receipt",
          Keywords: "CodeFuser, Hosting, Invoice, Receipt, Cloud",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const width = 595.28;
      const height = 841.89;
      const margin = 35;
      const contentWidth = width - margin * 2;

      // Fill Clean White Page Canvas
      doc.rect(0, 0, width, height).fill("#FFFFFF");

      // --- 1. TOP HEADER BANNER (Dark Obsidian #0F172A) ---
      const headerHeight = 105;
      doc.rect(0, 0, width, headerHeight).fill("#0F172A");

      // Draw Official CodeFuser Logo Vector Mark in Header
      doc.save();
      doc.translate(margin, 22);
      doc.scale(0.18);
      doc.lineWidth(12.5);
      doc.strokeColor("#FFFFFF");
      doc.path("M 75,18 L 47,18 A 32,32 0 0 0 47,82 L 75,82");
      // Amber Accent Brackets { }
      doc.strokeColor("#F59E0B");
      doc.path("M 126,16.4 C 107,16.4 104,29 104,40.5 C 104,46.8 99,50 88,50 C 99,50 104,53.2 104,59.5 C 104,71 107,83.6 126,83.6");
      doc.path("M 144,16.4 C 163,16.4 166,29 166,40.5 C 166,46.8 171,50 182,50 C 171,50 166,53.2 166,59.5 C 166,71 163,83.6 144,83.6");
      doc.strokeColor("#FFFFFF");
      doc.path("M 210,18 L 210,82 M 210,18 L 235,18 A 32,32 0 0 1 235,82 L 210,82");
      doc.path("M 295,18 L 343,18 M 295,50 L 370,50 M 295,82 L 343,82");
      doc.path("M 370,18 L 370,82 M 370,18 L 420,18 M 370,50 L 410,50");
      doc.path("M 448,18 L 448,53 A 27,27 0 0 0 502,53 L 502,18");
      doc.path("M 572,28 C 572,18 530,18 530,33 C 530,47 572,53 572,67 C 572,82 530,82 530,72");
      doc.path("M 604,18 L 604,82 M 604,18 L 654,18 M 604,50 L 654,50 M 604,82 L 654,82");
      doc.path("M 682,18 L 682,82 M 682,18 L 710,18 A 16,16 0 0 1 710,50 L 682,50 M 694,50 L 728,82");
      doc.stroke();
      doc.restore();

      doc.fillColor("#94A3B8").fontSize(8).font("Helvetica-Bold").text("DIGITAL GROWTH & CLOUD INFRASTRUCTURE", margin, 66);
      doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text("WWW.CODEFUSER.IN • SUPPORT@CODEFUSER.COM", margin, 78);

      // Right Header Block
      const rightX = 300;
      const rightWidth = width - margin - rightX;
      doc.fillColor("#FFFFFF").fontSize(15).font("Helvetica-Bold").text("HOSTING INVOICE", rightX, 22, { width: rightWidth, align: "right" });
      doc.fillColor("#F59E0B").fontSize(8.5).font("Helvetica-Bold").text("OFFICIAL SERVICE SUBSCRIPTION RECEIPT", rightX, 42, { width: rightWidth, align: "right" });
      doc.fillColor("#F8FAFC").fontSize(9.5).font("Helvetica-Bold").text(`Receipt No: #${data.invoice.receiptNumber}`, rightX, 58, { width: rightWidth, align: "right" });
      doc.fillColor("#CBD5E1").fontSize(8.5).font("Helvetica").text(`Date: ${formatDate(data.invoice.paymentDate)}`, rightX, 74, { width: rightWidth, align: "right" });

      // Amber Accent Line
      doc.rect(0, headerHeight, width, 3.5).fill("#F59E0B");

      let y = headerHeight + 20;

      // --- 2. ISSUER & CUSTOMER DETAILS ---
      const colWidth = (contentWidth - 20) / 2;
      const fromX = margin;
      const billX = margin + colWidth + 20;

      // Left: FROM
      doc.fillColor("#D97706").fontSize(8).font("Helvetica-Bold").text("ISSUED BY", fromX, y);
      doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text("CodeFuser Cloud Services", fromX, y + 14);
      doc.fillColor("#334155").fontSize(8.5).font("Helvetica").text("Managed Hosting & Domain Infrastructure", fromX, y + 27);
      doc.fillColor("#475569").fontSize(8.5).font("Helvetica").text("Support: support@codefuser.com", fromX, y + 39);

      // Right: BILL TO
      doc.fillColor("#D97706").fontSize(8).font("Helvetica-Bold").text("HOSTING SUBSCRIBER", billX, y);
      doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold").text(data.clientName || "Valued Client", billX, y + 14);
      doc.fillColor("#1E293B").fontSize(9).font("Helvetica-Bold").text(data.businessName || "Business Account", billX, y + 27);
      if (data.clientEmail) {
        doc.fillColor("#475569").fontSize(8.5).font("Helvetica").text(`Email: ${data.clientEmail}`, billX, y + 39);
      }

      y += 62;
      doc.moveTo(margin, y).lineTo(width - margin, y).lineWidth(0.75).stroke("#E2E8F0");
      y += 14;

      // --- 3. SUBSCRIPTION SPECIFICATIONS ---
      const boxH = 65;
      doc.roundedRect(margin, y, contentWidth, boxH, 6).fill("#F8FAFC");
      doc.roundedRect(margin, y, contentWidth, boxH, 6).lineWidth(0.75).stroke("#E2E8F0");

      let boxY = y + 10;
      doc.fillColor("#D97706").fontSize(8).font("Helvetica-Bold").text("HOSTING SERVICE SPECIFICATIONS", margin + 12, boxY);
      boxY += 15;

      const pCol1 = margin + 12;
      const pCol2 = margin + contentWidth / 2 + 10;

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Hosting Plan:", pCol1, boxY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.subscription.planName, pCol1 + 75, boxY);

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Billing Cycle:", pCol2, boxY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text("Monthly Recurring", pCol2 + 85, boxY);

      boxY += 18;

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Service Period:", pCol1, boxY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(`${formatDate(data.invoice.billingPeriodStart)} – ${formatDate(data.invoice.billingPeriodEnd)}`, pCol1 + 75, boxY);

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Next Billing Date:", pCol2, boxY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(formatDate(data.invoice.nextBillingDate), pCol2 + 85, boxY);

      y += boxH + 16;

      // --- 4. FINANCIAL BREAKDOWN TABLE ---
      doc.fillColor("#0F172A").fontSize(10).font("Helvetica-Bold").text("HOSTING FEE BREAKDOWN", margin, y);
      y += 14;

      const headerH = 22;
      doc.roundedRect(margin, y, contentWidth, headerH, 4).fill("#1E293B");
      doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text("SERVICE DESCRIPTION", margin + 12, y + 7);
      doc.fillColor("#F59E0B").fontSize(8).font("Helvetica-Bold").text("AMOUNT (INR)", margin + contentWidth - 140, y + 7, { width: 128, align: "right" });

      y += headerH + 3;

      // Row 1: Regular Price
      doc.roundedRect(margin, y, contentWidth, 22, 2).fill("#FFFFFF");
      doc.roundedRect(margin, y, contentWidth, 22, 2).lineWidth(0.5).stroke("#E2E8F0");
      doc.fillColor("#334155").fontSize(8.5).font("Helvetica").text(`CodeFuser Managed Hosting (${data.subscription.planName})`, margin + 12, y + 6);
      doc.fillColor("#1E293B").fontSize(8.5).font("Helvetica").text(formatINR(data.invoice.amount), margin + contentWidth - 140, y + 6, { width: 128, align: "right" });

      y += 25;

      // Row 2: Discount if applicable
      if (data.invoice.discount > 0) {
        doc.roundedRect(margin, y, contentWidth, 22, 2).fill("#F0FDF4");
        doc.roundedRect(margin, y, contentWidth, 22, 2).lineWidth(0.5).stroke("#86EFAC");
        doc.fillColor("#166534").fontSize(8.5).font("Helvetica-Bold").text("Promotional Free Hosting Discount (100% Benefit)", margin + 12, y + 6);
        doc.fillColor("#166534").fontSize(8.5).font("Helvetica-Bold").text(`-${formatINR(data.invoice.discount)}`, margin + contentWidth - 140, y + 6, { width: 128, align: "right" });
        y += 25;
      }

      // Total Paid Row
      doc.roundedRect(margin, y, contentWidth, 24, 4).fill("#FEF3C7");
      doc.roundedRect(margin, y, contentWidth, 24, 4).lineWidth(1).stroke("#F59E0B");
      doc.fillColor("#92400E").fontSize(9).font("Helvetica-Bold").text("TOTAL AMOUNT PAYABLE / CHARGED", margin + 12, y + 7);
      doc.fillColor("#B45309").fontSize(10).font("Helvetica-Bold").text(formatINR(data.invoice.finalAmount), margin + contentWidth - 140, y + 7, { width: 128, align: "right" });

      y += 38;

      // --- 5. PAYMENT STATUS BANNER ---
      const statusH = 55;
      const isFree = data.invoice.finalAmount === 0;
      const bannerBg = isFree ? "#F0FDF4" : "#F0FDF4";
      const bannerBorder = "#86EFAC";
      const bannerFg = "#166534";

      doc.roundedRect(margin, y, contentWidth, statusH, 6).fill(bannerBg);
      doc.roundedRect(margin, y, contentWidth, statusH, 6).lineWidth(1).stroke(bannerBorder);

      let sY = y + 10;
      doc.fillColor(bannerFg).fontSize(9).font("Helvetica-Bold").text("✓ PAYMENT STATUS: PAID & ACTIVE", margin + 14, sY);

      sY += 16;
      const statusMsg = isFree
        ? `This invoice confirms that your promotional free hosting period is active. Total paid is Rs. 0. Your next regular billing date will be ${formatDate(data.invoice.nextBillingDate)} at ${formatINR(data.subscription.monthlyAmount)}/month.`
        : `This invoice confirms that your monthly hosting charge of ${formatINR(data.invoice.finalAmount)} was successfully collected. Your hosting is active through ${formatDate(data.invoice.billingPeriodEnd)}.`;

      doc.fillColor(bannerFg).fontSize(7.5).font("Helvetica").text(statusMsg, margin + 14, sY, { width: contentWidth - 28 });

      y += statusH + 16;

      // --- 6. AUDIT REFERENCE ---
      doc.fillColor("#0F172A").fontSize(10).font("Helvetica-Bold").text("TRANSACTION & AUTOPAY AUDIT REFERENCE", margin, y);
      y += 14;

      const txBoxH = 50;
      doc.roundedRect(margin, y, contentWidth, txBoxH, 6).fill("#F8FAFC");
      doc.roundedRect(margin, y, contentWidth, txBoxH, 6).lineWidth(0.75).stroke("#E2E8F0");

      let tY = y + 10;
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Transaction Ref:", pCol1, tY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.invoice.transactionId || "VERIFIED_RECORD", pCol1 + 85, tY);

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("AutoPay Mandate:", pCol2, tY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.subscription.autopayStatus.toUpperCase(), pCol2 + 85, tY);

      tY += 18;
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Razorpay Sub ID:", pCol1, tY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.subscription.razorpaySubscriptionId || "CF_SUB_DIRECT", pCol1 + 85, tY);

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Mandate Status:", pCol2, tY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.subscription.mandateStatus.toUpperCase(), pCol2 + 85, tY);

      // --- 7. FOOTER ---
      const footerY = height - 48;
      doc.moveTo(margin, footerY - 10).lineTo(width - margin, footerY - 10).lineWidth(0.75).stroke("#E2E8F0");

      doc.fillColor("#475569").fontSize(7.5).font("Helvetica-Bold").text(
        "CodeFuser Cloud Services • Managed Hosting & Domain • codefuser.in",
        margin,
        footerY,
        { width: contentWidth, align: "center" }
      );

      doc.fillColor("#94A3B8").fontSize(7).font("Helvetica").text(
        "Official Hosting Invoice • System Generated Document • Keeps your website live and secured.",
        margin,
        footerY + 11,
        { width: contentWidth, align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
