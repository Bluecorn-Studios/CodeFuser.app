import PDFDocument from "pdfkit";
import { getHostingPlanConfig } from "./hosting_model.js";

export interface PaymentReceiptData {
  receiptNumber: string;
  receiptDate: string;
  clientName: string;
  businessName: string;
  clientEmail?: string;
  projectName: string;
  packageName: string;
  ownershipChoice?: string;
  paymentType: string;
  paymentStatus: string;
  paymentDate: string;
  transactionId: string;
  orderId: string;
  paymentMethod: string;
  currency: string;
  projectTotal: number;
  previousPaid: number;
  currentPayment: number;
  totalPaid: number;
  balanceRemaining: number;
  gstin?: string;
  projectId?: string;
}

export function formatCurrency(amount: number, currency: string = "INR"): string {
  const formatted = Math.round(amount).toLocaleString("en-IN");
  return `Rs. ${formatted}`;
}

export function generatePaymentReceiptPDF(data: PaymentReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 0,
        size: "A4",
        info: {
          Title: `CodeFuser Payment Receipt - ${data.receiptNumber}`,
          Author: "CodeFuser Digital Studio",
          Subject: "Official Payment Confirmation",
          Keywords: "CodeFuser, Receipt, Payment, Website, Web Engineering",
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

      doc.fillColor("#94A3B8").fontSize(8).font("Helvetica-Bold").text("DIGITAL GROWTH & WEB ENGINEERING", margin, 66);
      doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text("WWW.CODEFUSER.IN • SUPPORT@CODEFUSER.COM", margin, 78);

      // Right Header Block
      const rightX = 300;
      const rightWidth = width - margin - rightX;
      doc.fillColor("#FFFFFF").fontSize(16).font("Helvetica-Bold").text("PAYMENT RECEIPT", rightX, 22, { width: rightWidth, align: "right" });
      doc.fillColor("#F59E0B").fontSize(9).font("Helvetica-Bold").text("OFFICIAL PAYMENT CONFIRMATION", rightX, 42, { width: rightWidth, align: "right" });
      doc.fillColor("#F8FAFC").fontSize(10).font("Helvetica-Bold").text(`Receipt No: #${data.receiptNumber}`, rightX, 58, { width: rightWidth, align: "right" });
      doc.fillColor("#CBD5E1").fontSize(8.5).font("Helvetica").text(`Issue Date: ${data.receiptDate}`, rightX, 74, { width: rightWidth, align: "right" });

      // Amber Accent Ribbon Bar
      doc.rect(0, headerHeight, width, 3.5).fill("#F59E0B");

      let y = headerHeight + 20;

      // --- 2. FROM / BILL TO SECTION (2 Columns) ---
      const colWidth = (contentWidth - 20) / 2;
      const fromX = margin;
      const billX = margin + colWidth + 20;

      // Left Column: FROM
      doc.fillColor("#D97706").fontSize(8).font("Helvetica-Bold").text("FROM / ISSUED BY", fromX, y);
      doc.fillColor("#0F172A").fontSize(12).font("Helvetica-Bold").text("CodeFuser", fromX, y + 14);
      doc.fillColor("#334155").fontSize(9).font("Helvetica").text("Digital Growth & Web Engineering", fromX, y + 28);
      doc.fillColor("#475569").fontSize(8.5).font("Helvetica").text("Email: support@codefuser.com", fromX, y + 41);
      doc.fillColor("#475569").fontSize(8.5).font("Helvetica").text("Web: https://codefuser.in", fromX, y + 53);

      // Right Column: BILL TO
      doc.fillColor("#D97706").fontSize(8).font("Helvetica-Bold").text("BILLED TO / CUSTOMER", billX, y);
      doc.fillColor("#0F172A").fontSize(12).font("Helvetica-Bold").text(data.clientName || "Valued Client", billX, y + 14);
      doc.fillColor("#1E293B").fontSize(9.5).font("Helvetica-Bold").text(data.businessName || "Business Account", billX, y + 28);
      if (data.clientEmail) {
        doc.fillColor("#475569").fontSize(8.5).font("Helvetica").text(`Email: ${data.clientEmail}`, billX, y + 41);
      }
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text(`Project ID: ${data.projectId || data.receiptNumber.slice(-8)}`, billX, y + 53);

      y += 75;

      // Divider Line
      doc.moveTo(margin, y).lineTo(width - margin, y).lineWidth(0.75).stroke("#E2E8F0");
      y += 14;

      // --- 3. PROJECT INFORMATION BLOCK ---
      const infoBoxHeight = 68;
      doc.roundedRect(margin, y, contentWidth, infoBoxHeight, 6).fill("#F8FAFC");
      doc.roundedRect(margin, y, contentWidth, infoBoxHeight, 6).lineWidth(0.75).stroke("#E2E8F0");

      let infoY = y + 10;
      doc.fillColor("#D97706").fontSize(8).font("Helvetica-Bold").text("PROJECT & SERVICE SPECIFICATIONS", margin + 12, infoY);
      infoY += 15;

      const pCol1 = margin + 12;
      const pCol2 = margin + contentWidth / 2 + 10;

      // Grid Row 1
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Project Name:", pCol1, infoY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.projectName, pCol1 + 75, infoY, { width: 170 });

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Selected Package:", pCol2, infoY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.packageName, pCol2 + 85, infoY, { width: 170 });

      infoY += 18;

      // Grid Row 2
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Payment Plan:", pCol1, infoY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.paymentType, pCol1 + 75, infoY, { width: 170 });

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Ownership Terms:", pCol2, infoY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.ownershipChoice || "Buyout (Full Code Base & License)", pCol2 + 85, infoY, { width: 170 });

      y += infoBoxHeight + 12;

      // --- 3B. DOMAIN & HOSTING BENEFITS BLOCK ---
      let hostingFreeMonths = 1;
      let monthlyHostingPrice = 499;
      let domainBenefitText = "Included (CodeFuser Managed)";
      try {
        const planCfg = getHostingPlanConfig(data.packageName);
        hostingFreeMonths = planCfg.freeHostingMonths;
        monthlyHostingPrice = planCfg.monthlyHostingPrice;
        if (planCfg.domainFreeYears > 0) {
          domainBenefitText = `${planCfg.domainFreeYears} Year${planCfg.domainFreeYears > 1 ? "s" : ""} FREE Domain`;
        } else {
          domainBenefitText = "Google Search Setup / Included";
        }
      } catch (e) {
        // Fallback safely if unmapped
        hostingFreeMonths = 1;
        monthlyHostingPrice = 499;
      }

      const benefitBoxH = 60;
      doc.roundedRect(margin, y, contentWidth, benefitBoxH, 6).fill("#F0FDF4");
      doc.roundedRect(margin, y, contentWidth, benefitBoxH, 6).lineWidth(0.75).stroke("#86EFAC");

      let benY = y + 8;
      doc.fillColor("#166534").fontSize(8).font("Helvetica-Bold").text("DOMAIN & HOSTING PROMOTIONAL BENEFITS INCLUDED", margin + 12, benY);
      benY += 14;

      doc.fillColor("#166534").fontSize(8).font("Helvetica").text("Hosting Period:", pCol1, benY);
      doc.fillColor("#14532D").fontSize(8.5).font("Helvetica-Bold").text(`${hostingFreeMonths} Month${hostingFreeMonths > 1 ? "s" : ""} FREE (Promotional Discount)`, pCol1 + 75, benY);

      doc.fillColor("#166534").fontSize(8).font("Helvetica").text("Domain Status:", pCol2, benY);
      doc.fillColor("#14532D").fontSize(8.5).font("Helvetica-Bold").text(domainBenefitText, pCol2 + 85, benY);

      benY += 16;

      doc.fillColor("#166534").fontSize(8).font("Helvetica").text("Hosting Value:", pCol1, benY);
      doc.fillColor("#14532D").fontSize(8.5).text(`Rs. ${monthlyHostingPrice.toLocaleString("en-IN")} (Discount: -Rs. ${monthlyHostingPrice.toLocaleString("en-IN")} • Paid: Rs. 0)`, pCol1 + 75, benY);

      doc.fillColor("#166534").fontSize(8).font("Helvetica").text("Next Billing Rate:", pCol2, benY);
      doc.fillColor("#14532D").fontSize(8.5).font("Helvetica-Bold").text(`Rs. ${monthlyHostingPrice.toLocaleString("en-IN")}/month (Starts in ${hostingFreeMonths * 30} days)`, pCol2 + 85, benY);

      y += benefitBoxH + 16;

      // --- 4. FINANCIAL PAYMENT SUMMARY TABLE ---
      doc.fillColor("#0F172A").fontSize(10).font("Helvetica-Bold").text("FINANCIAL SETTLEMENT SUMMARY", margin, y);
      y += 16;

      const tableX = margin;
      const tableWidth = contentWidth;
      const headerRowH = 22;

      // Header Row
      doc.roundedRect(tableX, y, tableWidth, headerRowH, 4).fill("#1E293B");
      doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text("FINANCIAL ITEM DESCRIPTION", tableX + 12, y + 7);
      doc.fillColor("#F59E0B").fontSize(8).font("Helvetica-Bold").text("AMOUNT (INR)", tableX + tableWidth - 150, y + 7, { width: 138, align: "right" });

      y += headerRowH + 2;

      const rows = [
        { label: "Website / Package Contract Total", value: formatCurrency(data.projectTotal, data.currency), isBold: false },
        { label: "Amount Previously Paid", value: formatCurrency(data.previousPaid, data.currency), isBold: false },
        { label: "Current Payment Received", value: formatCurrency(data.currentPayment, data.currency), isHighlight: true },
        { label: "Total Amount Paid to Date", value: formatCurrency(data.totalPaid, data.currency), isBold: true },
        { label: "Remaining Balance Due", value: formatCurrency(data.balanceRemaining, data.currency), isRemaining: true }
      ];

      rows.forEach((row, idx) => {
        const rowH = 22;
        const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";

        if (row.isHighlight) {
          doc.roundedRect(tableX, y, tableWidth, rowH, 3).fill("#FEF3C7");
          doc.roundedRect(tableX, y, tableWidth, rowH, 3).lineWidth(0.75).stroke("#F59E0B");
          doc.fillColor("#92400E").fontSize(8.5).font("Helvetica-Bold").text(row.label, tableX + 12, y + 6);
          doc.fillColor("#B45309").fontSize(8.5).font("Helvetica-Bold").text(row.value, tableX + tableWidth - 150, y + 6, { width: 138, align: "right" });
        } else if (row.isRemaining) {
          const isZero = data.balanceRemaining === 0;
          const remBg = isZero ? "#F0FDF4" : "#FEF2F2";
          const remBorder = isZero ? "#86EFAC" : "#FCA5A5";
          const remFg = isZero ? "#166534" : "#991B1B";

          doc.roundedRect(tableX, y, tableWidth, rowH, 3).fill(remBg);
          doc.roundedRect(tableX, y, tableWidth, rowH, 3).lineWidth(0.75).stroke(remBorder);
          doc.fillColor(remFg).fontSize(8.5).font("Helvetica-Bold").text(row.label, tableX + 12, y + 6);
          doc.fillColor(remFg).fontSize(8.5).font("Helvetica-Bold").text(row.value, tableX + tableWidth - 150, y + 6, { width: 138, align: "right" });
        } else {
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).fill(rowBg);
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).lineWidth(0.5).stroke("#E2E8F0");
          doc.fillColor(row.isBold ? "#0F172A" : "#334155").fontSize(8.5).font(row.isBold ? "Helvetica-Bold" : "Helvetica").text(row.label, tableX + 12, y + 6);
          doc.fillColor(row.isBold ? "#0F172A" : "#1E293B").fontSize(8.5).font(row.isBold ? "Helvetica-Bold" : "Helvetica").text(row.value, tableX + tableWidth - 150, y + 6, { width: 138, align: "right" });
        }

        y += rowH + 3;
      });

      y += 14;

      // --- 5. PROMINENT PAYMENT CONFIRMATION SECTION ---
      const confirmBoxH = 68;
      const isSettled = data.balanceRemaining === 0;
      const confirmBg = isSettled ? "#F0FDF4" : "#EFF6FF";
      const confirmBorder = isSettled ? "#86EFAC" : "#BFDBFE";
      const confirmTextFg = isSettled ? "#166534" : "#1E40AF";
      const confirmBadgeBg = isSettled ? "#15803D" : "#1D4ED8";

      doc.roundedRect(margin, y, contentWidth, confirmBoxH, 6).fill(confirmBg);
      doc.roundedRect(margin, y, contentWidth, confirmBoxH, 6).lineWidth(1).stroke(confirmBorder);

      let confY = y + 10;
      doc.fillColor(confirmTextFg).fontSize(9).font("Helvetica-Bold").text("✓ OFFICIAL PAYMENT CONFIRMATION", margin + 14, confY);
      
      // Status Pill
      const statusPillText = isSettled ? "PAID IN FULL" : data.paymentStatus === "partially_paid" ? "PARTIALLY PAID" : "PAYMENT RECEIVED";
      const statusPillW = 95;
      doc.roundedRect(width - margin - statusPillW - 14, confY - 2, statusPillW, 16, 4).fill(confirmBadgeBg);
      doc.fillColor("#FFFFFF").fontSize(7.5).font("Helvetica-Bold").text(statusPillText, width - margin - statusPillW - 14, confY + 2, { width: statusPillW, align: "center" });

      confY += 16;
      doc.fillColor(confirmTextFg).fontSize(16).font("Helvetica-Bold").text(formatCurrency(data.currentPayment, data.currency), margin + 14, confY);

      confY += 20;
      const noteMessage = isSettled
        ? `This official receipt confirms that the payment of ${formatCurrency(data.currentPayment, data.currency)} was successfully received. Your project contract total of ${formatCurrency(data.projectTotal, data.currency)} is now FULLY SETTLED and your remaining balance is Rs. 0.`
        : `This official receipt confirms that a partial payment of ${formatCurrency(data.currentPayment, data.currency)} was successfully received. Total amount paid to date is ${formatCurrency(data.totalPaid, data.currency)}. Remaining balance due is ${formatCurrency(data.balanceRemaining, data.currency)}.`;

      doc.fillColor(confirmTextFg).fontSize(7.5).font("Helvetica").text(noteMessage, margin + 14, confY, { width: contentWidth - 28 });

      y += confirmBoxH + 16;

      // --- 6. TRANSACTION & AUDIT REFERENCE ---
      doc.fillColor("#0F172A").fontSize(10).font("Helvetica-Bold").text("TRANSACTION & AUDIT REFERENCE", margin, y);
      y += 14;

      const txBoxH = data.gstin ? 70 : 56;
      doc.roundedRect(margin, y, contentWidth, txBoxH, 6).fill("#F8FAFC");
      doc.roundedRect(margin, y, contentWidth, txBoxH, 6).lineWidth(0.75).stroke("#E2E8F0");

      let tY = y + 10;
      const tCol1 = margin + 12;
      const tCol2 = margin + contentWidth / 2 + 10;

      // Row 1
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Payment Method:", tCol1, tY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.paymentMethod, tCol1 + 85, tY);

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Transaction Date:", tCol2, tY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.paymentDate, tCol2 + 85, tY);

      tY += 18;

      // Row 2
      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Transaction ID:", tCol1, tY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.transactionId || "VERIFIED_RECORD", tCol1 + 85, tY);

      doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("Order Reference:", tCol2, tY);
      doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.orderId || "N/A", tCol2 + 85, tY);

      if (data.gstin) {
        tY += 18;
        doc.fillColor("#64748B").fontSize(8).font("Helvetica").text("GSTIN / Tax ID:", tCol1, tY);
        doc.fillColor("#0F172A").fontSize(8.5).font("Helvetica-Bold").text(data.gstin, tCol1 + 85, tY);
      }

      // --- 7. FOOTER SECTION ---
      const footerY = height - 48;
      doc.moveTo(margin, footerY - 10).lineTo(width - margin, footerY - 10).lineWidth(0.75).stroke("#E2E8F0");

      // Draw small monochrome CodeFuser logo in footer
      doc.save();
      doc.translate(margin, footerY - 2);
      doc.scale(0.08);
      doc.lineWidth(12.5);
      doc.strokeColor("#475569");
      doc.path("M 75,18 L 47,18 A 32,32 0 0 0 47,82 L 75,82");
      doc.path("M 126,16.4 C 107,16.4 104,29 104,40.5 C 104,46.8 99,50 88,50 C 99,50 104,53.2 104,59.5 C 104,71 107,83.6 126,83.6");
      doc.path("M 144,16.4 C 163,16.4 166,29 166,40.5 C 166,46.8 171,50 182,50 C 171,50 166,53.2 166,59.5 C 166,71 163,83.6 144,83.6");
      doc.path("M 210,18 L 210,82 M 210,18 L 235,18 A 32,32 0 0 1 235,82 L 210,82");
      doc.path("M 295,18 L 343,18 M 295,50 L 370,50 M 295,82 L 343,82");
      doc.path("M 370,18 L 370,82 M 370,18 L 420,18 M 370,50 L 410,50");
      doc.path("M 448,18 L 448,53 A 27,27 0 0 0 502,53 L 502,18");
      doc.path("M 572,28 C 572,18 530,18 530,33 C 530,47 572,53 572,67 C 572,82 530,82 530,72");
      doc.path("M 604,18 L 604,82 M 604,18 L 654,18 M 604,50 L 654,50 M 604,82 L 654,82");
      doc.path("M 682,18 L 682,82 M 682,18 L 710,18 A 16,16 0 0 1 710,50 L 682,50 M 694,50 L 728,82");
      doc.stroke();
      doc.restore();

      doc.fillColor("#475569").fontSize(7.5).font("Helvetica-Bold").text(
        "CodeFuser Digital Growth & Web Engineering • codefuser.in • support@codefuser.com",
        margin + 65,
        footerY,
        { width: contentWidth - 65, align: "right" }
      );

      doc.fillColor("#94A3B8").fontSize(7).font("Helvetica").text(
        "Official Payment Receipt • System Generated • This receipt confirms the payment recorded against the above project.",
        margin + 65,
        footerY + 11,
        { width: contentWidth - 65, align: "right" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
