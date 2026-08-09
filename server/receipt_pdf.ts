import PDFDocument from "pdfkit";

export interface PaymentReceiptData {
  receiptNumber: string;
  receiptDate: string;
  clientName: string;
  businessName: string;
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
          Title: `CodeFuser Receipt - ${data.receiptNumber}`,
          Author: "CodeFuser Studio",
          Subject: "Official Payment Receipt",
          Keywords: "CodeFuser, Receipt, Payment, Website",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const width = 595.28;
      const height = 841.89;
      const margin = 40;
      const contentWidth = width - margin * 2;

      // Fill Dark Background Canvas (#0B0F17)
      doc.rect(0, 0, width, height).fill("#0B0F17");

      // Outer Decorative Border Frame
      doc.rect(20, 20, width - 40, height - 40).lineWidth(1).stroke("#1F2937");

      let y = 45;

      // --- HEADER SECTION ---
      // Logo & Branding
      doc.fillColor("#F59E0B").fontSize(22).font("Helvetica-Bold").text("CODE", margin, y, { continued: true });
      doc.fillColor("#FFFFFF").text("FUSER");

      doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text("HIGH-PERFORMANCE WEB ENGINEERING", margin, y + 26);

      // Receipt Title & Badge on Right
      const statusText = data.paymentStatus === "paid" ? "FULLY SETTLED" : data.paymentStatus === "partially_paid" ? "PARTIAL PAYMENT" : "PENDING";
      const statusBg = data.paymentStatus === "paid" ? "#065F46" : data.paymentStatus === "partially_paid" ? "#92400E" : "#374151";
      const statusFg = data.paymentStatus === "paid" ? "#34D399" : data.paymentStatus === "partially_paid" ? "#FBBF24" : "#D1D5DB";

      // Right Header Block
      doc.fillColor("#FFFFFF").fontSize(14).font("Helvetica-Bold").text("PAYMENT RECEIPT", margin + 250, y, { width: 225, align: "right" });
      doc.fillColor("#F59E0B").fontSize(10).font("Helvetica-Bold").text(`#${data.receiptNumber}`, margin + 250, y + 18, { width: 225, align: "right" });
      doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text(`Date: ${data.receiptDate}`, margin + 250, y + 32, { width: 225, align: "right" });

      // Status Pill Badge
      const badgeWidth = 110;
      const badgeX = width - margin - badgeWidth;
      doc.roundedRect(badgeX, y + 46, badgeWidth, 18, 4).fill(statusBg);
      doc.fillColor(statusFg).fontSize(8).font("Helvetica-Bold").text(statusText, badgeX, y + 51, { width: badgeWidth, align: "center" });

      y += 85;

      // Divider Line
      doc.moveTo(margin, y).lineTo(width - margin, y).lineWidth(1).stroke("#1F2937");
      y += 15;

      // --- CLIENT & PROJECT DETAILS (2-COLUMN CARD) ---
      const cardHeight = 110;
      doc.roundedRect(margin, y, contentWidth, cardHeight, 8).fill("#111827");
      doc.roundedRect(margin, y, contentWidth, cardHeight, 8).lineWidth(1).stroke("#1F2937");

      // Column 1: Client Info
      const col1X = margin + 16;
      let cardY = y + 14;

      doc.fillColor("#F59E0B").fontSize(8).font("Helvetica-Bold").text("BILLED TO", col1X, cardY);
      cardY += 14;
      doc.fillColor("#FFFFFF").fontSize(12).font("Helvetica-Bold").text(data.clientName || "Valued Client", col1X, cardY);
      cardY += 16;
      doc.fillColor("#E5E7EB").fontSize(9).font("Helvetica").text(data.businessName || "Business Account", col1X, cardY);
      cardY += 14;
      doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text(`Project: ${data.projectName || data.businessName}`, col1X, cardY);

      // Column 2: Package Info
      const col2X = margin + contentWidth / 2 + 10;
      cardY = y + 14;

      doc.fillColor("#F59E0B").fontSize(8).font("Helvetica-Bold").text("PROJECT SPECIFICATIONS", col2X, cardY);
      cardY += 14;
      doc.fillColor("#FFFFFF").fontSize(11).font("Helvetica-Bold").text(`Package: ${data.packageName}`, col2X, cardY);
      cardY += 16;
      doc.fillColor("#E5E7EB").fontSize(9).font("Helvetica").text(`Payment Term: ${data.paymentType}`, col2X, cardY);
      cardY += 14;
      doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text(`Ownership: ${data.ownershipChoice || "Buyout (Full Code Base)"}`, col2X, cardY);

      y += cardHeight + 15;

      // --- TRANSACTION & METHOD DETAILS ---
      const txCardHeight = 90;
      doc.roundedRect(margin, y, contentWidth, txCardHeight, 8).fill("#111827");
      doc.roundedRect(margin, y, contentWidth, txCardHeight, 8).lineWidth(1).stroke("#1F2937");

      let txY = y + 12;
      doc.fillColor("#F59E0B").fontSize(8).font("Helvetica-Bold").text("PAYMENT & TRANSACTION REFERENCE", margin + 16, txY);
      txY += 16;

      // 4 Key Grid
      const gridCol1 = margin + 16;
      const gridCol2 = margin + contentWidth / 2 + 10;

      // Row 1
      doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text("Payment Method:", gridCol1, txY);
      doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text(data.paymentMethod, gridCol1 + 90, txY);

      doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text("Transaction Date:", gridCol2, txY);
      doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text(data.paymentDate, gridCol2 + 90, txY);

      txY += 18;

      // Row 2
      doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text("Transaction Ref:", gridCol1, txY);
      doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text(data.transactionId || "N/A", gridCol1 + 90, txY);

      doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text("Order Reference:", gridCol2, txY);
      doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text(data.orderId || "N/A", gridCol2 + 90, txY);

      if (data.gstin) {
        txY += 18;
        doc.fillColor("#9CA3AF").fontSize(8).font("Helvetica").text("GSTIN / Tax ID:", gridCol1, txY);
        doc.fillColor("#FFFFFF").fontSize(8).font("Helvetica-Bold").text(data.gstin, gridCol1 + 90, txY);
      }

      y += txCardHeight + 20;

      // --- FINANCIAL BREAKDOWN TABLE ---
      doc.fillColor("#FFFFFF").fontSize(11).font("Helvetica-Bold").text("FINANCIAL SETTLEMENT SUMMARY", margin, y);
      y += 18;

      // Table Header Row
      const tableX = margin;
      const tableWidth = contentWidth;
      const headerHeight = 22;

      doc.roundedRect(tableX, y, tableWidth, headerHeight, 4).fill("#1F2937");
      doc.fillColor("#F59E0B").fontSize(8).font("Helvetica-Bold").text("DESCRIPTION", tableX + 12, y + 7);
      doc.fillColor("#F59E0B").fontSize(8).font("Helvetica-Bold").text("AMOUNT (INR)", tableX + tableWidth - 140, y + 7, { width: 128, align: "right" });

      y += headerHeight + 2;

      // Rows
      const rows = [
        { label: "Project Contract Total", value: formatCurrency(data.projectTotal, data.currency), isBold: false },
        { label: "Amount Previously Paid", value: formatCurrency(data.previousPaid, data.currency), isBold: false },
        { label: "Current Payment Received", value: formatCurrency(data.currentPayment, data.currency), isHighlight: true },
        { label: "Total Amount Paid to Date", value: formatCurrency(data.totalPaid, data.currency), isBold: true },
        { label: "Remaining Balance Due", value: formatCurrency(data.balanceRemaining, data.currency), isRemaining: true }
      ];

      rows.forEach((row, idx) => {
        const rowBg = idx % 2 === 0 ? "#111827" : "#0F172A";
        const rowH = 24;

        if (row.isHighlight) {
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).fill("#1E293B");
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).lineWidth(1).stroke("#F59E0B");
          doc.fillColor("#F59E0B").fontSize(9).font("Helvetica-Bold").text(row.label, tableX + 12, y + 7);
          doc.fillColor("#F59E0B").fontSize(9).font("Helvetica-Bold").text(row.value, tableX + tableWidth - 140, y + 7, { width: 128, align: "right" });
        } else if (row.isRemaining) {
          const remColor = data.balanceRemaining === 0 ? "#34D399" : "#F87171";
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).fill("#111827");
          doc.fillColor("#E5E7EB").fontSize(9).font("Helvetica-Bold").text(row.label, tableX + 12, y + 7);
          doc.fillColor(remColor).fontSize(9).font("Helvetica-Bold").text(row.value, tableX + tableWidth - 140, y + 7, { width: 128, align: "right" });
        } else {
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).fill(rowBg);
          doc.fillColor(row.isBold ? "#FFFFFF" : "#D1D5DB").fontSize(9).font(row.isBold ? "Helvetica-Bold" : "Helvetica").text(row.label, tableX + 12, y + 7);
          doc.fillColor(row.isBold ? "#FFFFFF" : "#E5E7EB").fontSize(9).font(row.isBold ? "Helvetica-Bold" : "Helvetica").text(row.value, tableX + tableWidth - 140, y + 7, { width: 128, align: "right" });
        }

        y += rowH + 3;
      });

      y += 20;

      // --- GUARANTEE & FOOTER NOTE ---
      doc.roundedRect(margin, y, contentWidth, 50, 6).fill("#111827");
      doc.roundedRect(margin, y, contentWidth, 50, 6).lineWidth(1).stroke("#1F2937");

      doc.fillColor("#34D399").fontSize(8).font("Helvetica-Bold").text("VERIFIED PAYMENT RECORD", margin + 14, y + 10);
      doc.fillColor("#9CA3AF").fontSize(7.5).font("Helvetica").text(
        "This official receipt confirms payment received for your CodeFuser website project. All payments are securely logged in our system audit trail.",
        margin + 14,
        y + 24,
        { width: contentWidth - 28 }
      );

      // Bottom Footer
      const footerY = height - 45;
      doc.moveTo(margin, footerY - 10).lineTo(width - margin, footerY - 10).lineWidth(1).stroke("#1F2937");

      doc.fillColor("#6B7280").fontSize(7).font("Helvetica").text(
        "CodeFuser Digital Studio • Official Client Receipt • System Generated • support@codefuser.com",
        margin,
        footerY,
        { width: contentWidth, align: "center" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
