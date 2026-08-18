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
  transactionLabel?: string;
  orderId: string;
  orderLabel?: string;
  paymentMethod: string;
  currency: string;
  listPrice?: number;
  discount?: number;
  discountLabel?: string;
  websiteBuildPrice?: number;
  websiteBuildDiscount?: number;
  websiteBuildDiscountLabel?: string;
  hostingPrice?: number;
  hostingDiscount?: number;
  hostingDiscountLabel?: string;
  projectTotal: number;
  previousPaid: number;
  currentPayment: number;
  totalPaid: number;
  balanceRemaining: number;
  gstin?: string;
  projectId?: string;
  isWaiver?: boolean;
  isSimulated?: boolean;
  documentTitle?: string;
  documentSubtitle?: string;
  statusBadgeText?: string;
  confirmationMessage?: string;
}

export function formatCurrency(amount: number, _currency: string = "INR"): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "Rs. 0";
  }
  const formatted = Math.round(amount).toLocaleString("en-IN");
  return `Rs. ${formatted}`;
}

export function cleanPackageDisplayName(rawName: string): string {
  if (!rawName) return "Fusion Package";
  let cleaned = String(rawName).trim();
  cleaned = cleaned.replace(/^&+\s*/, "");
  const lower = cleaned.toLowerCase();
  if (lower === "foundation" || lower === "ignite") return "Ignite Package (Foundation)";
  if (lower === "growth" || lower === "fusion") return "Fusion Package (Growth)";
  if (lower === "dominance" || lower === "scale" || lower === "catalyst") return "Scale Package (Dominance)";
  cleaned = cleaned.replace(/\s+Pack\b/i, " Package");
  return cleaned;
}

export function generatePaymentReceiptPDF(data: PaymentReceiptData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const isWaiver = Boolean(data.isWaiver);
      const isSimulated = Boolean(data.isSimulated);
      const isSettled = data.balanceRemaining === 0;
      const isPartial = data.paymentStatus === "partially_paid" || (!isSettled && !isWaiver && !isSimulated && data.totalPaid > 0);

      // Determine Document Type & Headers
      let docTitle = data.documentTitle;
      let docSubtitle = data.documentSubtitle;

      if (!docTitle) {
        if (isWaiver) {
          docTitle = "PROJECT SETTLEMENT STATEMENT";
          docSubtitle = "100% Promotional Waiver Confirmation";
        } else if (isSimulated) {
          docTitle = "PAYMENT SIMULATION STATEMENT";
          docSubtitle = "Sandbox Test Confirmation";
        } else if (isPartial) {
          docTitle = "PAYMENT RECEIPT";
          docSubtitle = "Milestone Payment Confirmation";
        } else {
          docTitle = "PAYMENT RECEIPT";
          docSubtitle = "Official Payment Confirmation";
        }
      }

      const doc = new PDFDocument({
        margin: 0,
        size: "A4",
        info: {
          Title: `CodeFuser ${docTitle} - ${data.receiptNumber}`,
          Author: "CodeFuser Digital Growth & Web Engineering",
          Subject: docSubtitle,
          Keywords: "CodeFuser, Receipt, Payment, Website, Web Engineering, Financial Document",
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const width = 595.28;
      const height = 841.89;
      const margin = 36;
      const contentWidth = width - margin * 2;

      // Fill Clean Pure White Canvas
      doc.rect(0, 0, width, height).fill("#FFFFFF");

      // =========================================================================
      // 1. TOP HEADER BANNER (Obsidian #0F172A)
      // =========================================================================
      const headerHeight = 96;
      doc.rect(0, 0, width, headerHeight).fill("#0F172A");

      // Draw CodeFuser Monogram / Vector Mark
      doc.save();
      doc.translate(margin, 20);
      doc.scale(0.16);
      doc.lineWidth(12);
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

      doc.fillColor("#94A3B8").fontSize(7.5).font("Helvetica-Bold").text("DIGITAL GROWTH & WEB ENGINEERING", margin, 60);
      doc.fillColor("#64748B").fontSize(7).font("Helvetica").text("support@codefuser.com  •  https://codefuser.in", margin, 72);

      // Right Header Block
      const rightX = 260;
      const rightWidth = width - margin - rightX;
      doc.fillColor("#FFFFFF").fontSize(13.5).font("Helvetica-Bold").text(docTitle, rightX, 18, { width: rightWidth, align: "right" });
      doc.fillColor(isWaiver ? "#34D399" : "#F59E0B").fontSize(8).font("Helvetica-Bold").text(docSubtitle || "", rightX, 36, { width: rightWidth, align: "right" });
      doc.fillColor("#F8FAFC").fontSize(8.5).font("Helvetica-Bold").text(`Receipt No: #${data.receiptNumber}`, rightX, 50, { width: rightWidth, align: "right" });
      doc.fillColor("#CBD5E1").fontSize(8).font("Helvetica").text(`Issue Date: ${data.receiptDate}`, rightX, 64, { width: rightWidth, align: "right" });

      // Subtle Accent Line
      doc.rect(0, headerHeight, width, 2.5).fill(isWaiver ? "#10B981" : "#F59E0B");

      let y = headerHeight + 14;

      // =========================================================================
      // 2. CUSTOMER & PROJECT SPECIFICATIONS (2-Column Structured Card)
      // =========================================================================
      const colWidth = (contentWidth - 16) / 2;
      const col1X = margin;
      const col2X = margin + colWidth + 16;
      const specBoxH = 72;

      // Left Box: CUSTOMER
      doc.roundedRect(col1X, y, colWidth, specBoxH, 4).fill("#F8FAFC");
      doc.roundedRect(col1X, y, colWidth, specBoxH, 4).lineWidth(0.5).stroke("#E2E8F0");

      doc.fillColor("#64748B").fontSize(7.5).font("Helvetica-Bold").text("CUSTOMER / BILLED TO", col1X + 10, y + 8);
      doc.fillColor("#0F172A").fontSize(10.5).font("Helvetica-Bold").text(data.businessName || "Business Account", col1X + 10, y + 21, { width: colWidth - 20, ellipsis: true });
      doc.fillColor("#334155").fontSize(8.5).font("Helvetica").text(data.clientName || "Valued Client", col1X + 10, y + 36, { width: colWidth - 20, ellipsis: true });
      if (data.clientEmail) {
        doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text(data.clientEmail, col1X + 10, y + 49, { width: colWidth - 20, ellipsis: true });
      }

      // Right Box: PROJECT & SERVICE
      doc.roundedRect(col2X, y, colWidth, specBoxH, 4).fill("#F8FAFC");
      doc.roundedRect(col2X, y, colWidth, specBoxH, 4).lineWidth(0.5).stroke("#E2E8F0");

      const cleanPkgName = cleanPackageDisplayName(data.packageName);
      doc.fillColor("#64748B").fontSize(7.5).font("Helvetica-Bold").text("PROJECT & SERVICE", col2X + 10, y + 8);
      doc.fillColor("#0F172A").fontSize(10.5).font("Helvetica-Bold").text(data.projectName || `${data.businessName} Platform`, col2X + 10, y + 21, { width: colWidth - 20, ellipsis: true });
      doc.fillColor("#1E293B").fontSize(8.5).font("Helvetica-Bold").text(`Package: ${cleanPkgName}`, col2X + 10, y + 36, { width: colWidth - 20, ellipsis: true });
      doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text(`Plan: ${data.paymentType} • ID: ${data.projectId || data.receiptNumber.slice(-8)}`, col2X + 10, y + 49, { width: colWidth - 20, ellipsis: true });

      y += specBoxH + 10;

      // =========================================================================
      // 3. PROMOTIONAL INCLUSIONS & HOSTING SPECIFICATIONS
      // =========================================================================
      let hostingFreeMonths = 1;
      let monthlyHostingPrice = 499;
      let domainBenefitText = "1 Year FREE Domain Included";
      try {
        const planCfg = getHostingPlanConfig(data.packageName);
        hostingFreeMonths = planCfg.freeHostingMonths || 1;
        monthlyHostingPrice = planCfg.monthlyHostingPrice || 499;
        if (planCfg.domainFreeYears > 0) {
          domainBenefitText = `${planCfg.domainFreeYears} Year${planCfg.domainFreeYears > 1 ? "s" : ""} FREE Domain Included`;
        } else {
          domainBenefitText = "Google Search Setup & Domain Config Included";
        }
      } catch (e) {
        hostingFreeMonths = 1;
        monthlyHostingPrice = 499;
      }

      // Calculate first billing date estimate (+30 or +60 days)
      const issueDateObj = new Date(data.receiptDate || Date.now());
      const nextBillingDateObj = new Date(isNaN(issueDateObj.getTime()) ? Date.now() : issueDateObj.getTime());
      nextBillingDateObj.setDate(nextBillingDateObj.getDate() + hostingFreeMonths * 30);
      const formattedNextBilling = nextBillingDateObj.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });

      const promoBoxH = 46;
      doc.roundedRect(margin, y, contentWidth, promoBoxH, 4).fill("#F0FDF4");
      doc.roundedRect(margin, y, contentWidth, promoBoxH, 4).lineWidth(0.5).stroke("#86EFAC");

      let promoY = y + 7;
      doc.fillColor("#166534").fontSize(7.5).font("Helvetica-Bold").text("INCLUDED PROMOTIONS & HOSTING SPECIFICATIONS", margin + 10, promoY);
      promoY += 13;

      const pCol1 = margin + 10;
      const pCol2 = margin + contentWidth / 2 + 6;

      doc.fillColor("#166534").fontSize(8).font("Helvetica").text("Hosting:", pCol1, promoY);
      doc.fillColor("#14532D").fontSize(8).font("Helvetica-Bold").text(
        `${hostingFreeMonths} Month${hostingFreeMonths > 1 ? "s" : ""} FREE (Then Rs. ${monthlyHostingPrice.toLocaleString("en-IN")}/mo)`,
        pCol1 + 45,
        promoY
      );

      doc.fillColor("#166534").fontSize(8).font("Helvetica").text("Domain:", pCol2, promoY);
      doc.fillColor("#14532D").fontSize(8).font("Helvetica-Bold").text(domainBenefitText, pCol2 + 45, promoY);

      promoY += 12;
      doc.fillColor("#166534").fontSize(7.5).font("Helvetica").text("First Billing:", pCol1, promoY);
      doc.fillColor("#14532D").fontSize(7.5).font("Helvetica").text(`${formattedNextBilling} (No charges during promotional period)`, pCol1 + 55, promoY);

      y += promoBoxH + 12;

      // =========================================================================
      // 4. FINANCIAL SETTLEMENT SUMMARY TABLE (The Main Section)
      // =========================================================================
      doc.fillColor("#0F172A").fontSize(9.5).font("Helvetica-Bold").text("FINANCIAL SETTLEMENT SUMMARY", margin, y);
      y += 13;

      const tableX = margin;
      const tableWidth = contentWidth;
      const headerRowH = 18;

      // Header Row
      doc.roundedRect(tableX, y, tableWidth, headerRowH, 3).fill("#1E293B");
      doc.fillColor("#FFFFFF").fontSize(7.5).font("Helvetica-Bold").text("FINANCIAL ITEM DESCRIPTION", tableX + 10, y + 5);
      doc.fillColor("#F8FAFC").fontSize(7.5).font("Helvetica-Bold").text("AMOUNT (INR)", tableX + tableWidth - 140, y + 5, { width: 130, align: "right" });

      y += headerRowH + 2;

      interface TableRow {
        label: string;
        value: string;
        isBold?: boolean;
        isHighlight?: boolean;
        isRemaining?: boolean;
        isDiscount?: boolean;
        isTotal?: boolean;
      }

      const rows: TableRow[] = [];

      // Build structured rows accurately reflecting the scenario
      if (isWaiver) {
        // 100% FULLWAIVER Scenario
        const listVal = data.listPrice || data.projectTotal || 19999;
        rows.push({
          label: "Original Package List Value",
          value: formatCurrency(listVal, data.currency),
          isBold: false
        });
        rows.push({
          label: data.discountLabel || "100% Promotional Waiver (FULLWAIVER)",
          value: `- ${formatCurrency(listVal, data.currency)}`,
          isDiscount: true
        });
        if (data.hostingPrice && data.hostingPrice > 0 && data.hostingDiscount && data.hostingDiscount > 0) {
          rows.push({
            label: "Hosting Promotional Waiver",
            value: `- ${formatCurrency(data.hostingDiscount, data.currency)}`,
            isDiscount: true
          });
        }
        rows.push({
          label: "Net Project Contract Value",
          value: formatCurrency(0, data.currency),
          isBold: true
        });
        rows.push({
          label: "Current Cash Payment Received",
          value: formatCurrency(0, data.currency),
          isHighlight: true
        });
        rows.push({
          label: "Total Cash Paid to Date",
          value: formatCurrency(0, data.currency),
          isBold: true
        });
        rows.push({
          label: "Remaining Balance Due",
          value: formatCurrency(0, data.currency),
          isRemaining: true
        });
      } else if (data.websiteBuildPrice !== undefined && data.hostingPrice !== undefined) {
        // Explicit Website Build + Hosting Separate Breakdown Scenario
        rows.push({
          label: "Website Build List Value",
          value: formatCurrency(data.websiteBuildPrice, data.currency)
        });
        if (data.websiteBuildDiscount && data.websiteBuildDiscount > 0) {
          rows.push({
            label: data.websiteBuildDiscountLabel || "Website Build Promotional Waiver",
            value: `- ${formatCurrency(data.websiteBuildDiscount, data.currency)}`,
            isDiscount: true
          });
        }
        const netWebsite = Math.max(0, data.websiteBuildPrice - (data.websiteBuildDiscount || 0));
        rows.push({
          label: "Website Net Value",
          value: formatCurrency(netWebsite, data.currency)
        });
        rows.push({
          label: "Managed Cloud Hosting Fee",
          value: formatCurrency(data.hostingPrice, data.currency)
        });
        if (data.hostingDiscount && data.hostingDiscount > 0) {
          rows.push({
            label: data.hostingDiscountLabel || "Hosting Promotional Waiver",
            value: `- ${formatCurrency(data.hostingDiscount, data.currency)}`,
            isDiscount: true
          });
        }
        rows.push({
          label: "Net Contract Value Payable",
          value: formatCurrency(data.projectTotal, data.currency),
          isTotal: true
        });
        rows.push({
          label: "Current Payment Received",
          value: formatCurrency(data.currentPayment, data.currency),
          isHighlight: true
        });
        rows.push({
          label: "Total Amount Paid to Date",
          value: formatCurrency(data.totalPaid, data.currency),
          isBold: true
        });
        rows.push({
          label: "Remaining Balance Due",
          value: formatCurrency(data.balanceRemaining, data.currency),
          isRemaining: true
        });
      } else if (data.listPrice !== undefined && data.discount !== undefined && data.discount > 0) {
        // Coupon or Upfront Discount + Real Payment Scenario
        rows.push({
          label: "Original Package List Value",
          value: formatCurrency(data.listPrice, data.currency),
          isBold: false
        });
        rows.push({
          label: data.discountLabel || "Promotional Discount / Coupon",
          value: `- ${formatCurrency(data.discount, data.currency)}`,
          isDiscount: true
        });
        rows.push({
          label: "Net Contract Value Payable",
          value: formatCurrency(data.projectTotal, data.currency),
          isTotal: true
        });
        if (data.previousPaid > 0) {
          rows.push({
            label: "Amount Previously Paid (Phase 1)",
            value: formatCurrency(data.previousPaid, data.currency)
          });
        }
        rows.push({
          label: "Current Payment Received",
          value: formatCurrency(data.currentPayment, data.currency),
          isHighlight: true
        });
        rows.push({
          label: "Total Amount Paid to Date",
          value: formatCurrency(data.totalPaid, data.currency),
          isBold: true
        });
        rows.push({
          label: "Remaining Balance Due",
          value: formatCurrency(data.balanceRemaining, data.currency),
          isRemaining: true
        });
      } else {
        // Standard Contract / Milestone Settlement Scenario
        rows.push({
          label: "Website & Platform Contract Total",
          value: formatCurrency(data.projectTotal, data.currency),
          isBold: false
        });
        if (data.previousPaid > 0) {
          rows.push({
            label: "Amount Previously Paid (Phase 1)",
            value: formatCurrency(data.previousPaid, data.currency)
          });
        }
        rows.push({
          label: "Current Payment Received",
          value: formatCurrency(data.currentPayment, data.currency),
          isHighlight: true
        });
        rows.push({
          label: "Total Amount Paid to Date",
          value: formatCurrency(data.totalPaid, data.currency),
          isBold: true
        });
        rows.push({
          label: "Remaining Balance Due",
          value: formatCurrency(data.balanceRemaining, data.currency),
          isRemaining: true
        });
      }

      // Render table rows
      rows.forEach((row, idx) => {
        const rowH = 18;
        const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";

        if (row.isDiscount) {
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).fill("#F0FDF4");
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).lineWidth(0.5).stroke("#86EFAC");
          doc.fillColor("#166534").fontSize(8).font("Helvetica-Bold").text(row.label, tableX + 10, y + 4.5);
          doc.fillColor("#166534").fontSize(8).font("Helvetica-Bold").text(row.value, tableX + tableWidth - 140, y + 4.5, { width: 130, align: "right" });
        } else if (row.isHighlight) {
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).fill("#FEF3C7");
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).lineWidth(0.5).stroke("#F59E0B");
          doc.fillColor("#92400E").fontSize(8).font("Helvetica-Bold").text(row.label, tableX + 10, y + 4.5);
          doc.fillColor("#B45309").fontSize(8).font("Helvetica-Bold").text(row.value, tableX + tableWidth - 140, y + 4.5, { width: 130, align: "right" });
        } else if (row.isRemaining) {
          const isZero = data.balanceRemaining === 0;
          const remBg = isZero ? "#F0FDF4" : "#FEF2F2";
          const remBorder = isZero ? "#86EFAC" : "#FCA5A5";
          const remFg = isZero ? "#166534" : "#991B1B";

          doc.roundedRect(tableX, y, tableWidth, rowH, 2).fill(remBg);
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).lineWidth(0.5).stroke(remBorder);
          doc.fillColor(remFg).fontSize(8).font("Helvetica-Bold").text(row.label, tableX + 10, y + 4.5);
          doc.fillColor(remFg).fontSize(8).font("Helvetica-Bold").text(row.value, tableX + tableWidth - 140, y + 4.5, { width: 130, align: "right" });
        } else if (row.isTotal) {
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).fill("#F1F5F9");
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).lineWidth(0.5).stroke("#CBD5E1");
          doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold").text(row.label, tableX + 10, y + 4.5);
          doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold").text(row.value, tableX + tableWidth - 140, y + 4.5, { width: 130, align: "right" });
        } else {
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).fill(rowBg);
          doc.roundedRect(tableX, y, tableWidth, rowH, 2).lineWidth(0.5).stroke("#E2E8F0");
          doc.fillColor(row.isBold ? "#0F172A" : "#334155").fontSize(8).font(row.isBold ? "Helvetica-Bold" : "Helvetica").text(row.label, tableX + 10, y + 4.5);
          doc.fillColor(row.isBold ? "#0F172A" : "#1E293B").fontSize(8).font(row.isBold ? "Helvetica-Bold" : "Helvetica").text(row.value, tableX + tableWidth - 140, y + 4.5, { width: 130, align: "right" });
        }

        y += rowH + 2;
      });

      y += 8;

      // =========================================================================
      // 5. PROMINENT STATUS & CONFIRMATION BOX
      // =========================================================================
      const confirmBoxH = 58;

      let confirmBg = "#F0FDF4";
      let confirmBorder = "#86EFAC";
      let confirmTextFg = "#166534";
      let confirmBadgeBg = "#15803D";
      let sectionTitle = "✓ OFFICIAL PAYMENT CONFIRMATION";
      let statusPillText = data.statusBadgeText || (isSettled ? "PAID IN FULL" : "PARTIALLY PAID");

      if (isWaiver) {
        confirmBg = "#F0FDF4";
        confirmBorder = "#86EFAC";
        confirmTextFg = "#166534";
        confirmBadgeBg = "#15803D";
        sectionTitle = "✓ PROMOTIONAL SETTLEMENT CONFIRMATION";
        statusPillText = data.statusBadgeText || "FULLY WAIVED (100% PROMO)";
      } else if (isSimulated) {
        confirmBg = "#F8FAFC";
        confirmBorder = "#CBD5E1";
        confirmTextFg = "#334155";
        confirmBadgeBg = "#475569";
        sectionTitle = "✓ SANDBOX TEST CONFIRMATION";
        statusPillText = data.statusBadgeText || "TEST / SIMULATION";
      } else if (data.paymentMethod?.toLowerCase().includes("manual")) {
        confirmBg = "#F0FDF4";
        confirmBorder = "#86EFAC";
        confirmTextFg = "#166534";
        confirmBadgeBg = "#15803D";
        sectionTitle = "✓ MANUAL RECONCILIATION CONFIRMATION";
        statusPillText = data.statusBadgeText || "MANUALLY SETTLED";
      } else if (!isSettled) {
        confirmBg = "#EFF6FF";
        confirmBorder = "#BFDBFE";
        confirmTextFg = "#1E40AF";
        confirmBadgeBg = "#1D4ED8";
        sectionTitle = "✓ PARTIAL PAYMENT CONFIRMATION";
        statusPillText = data.statusBadgeText || "PARTIALLY PAID";
      }

      doc.roundedRect(margin, y, contentWidth, confirmBoxH, 4).fill(confirmBg);
      doc.roundedRect(margin, y, contentWidth, confirmBoxH, 4).lineWidth(0.75).stroke(confirmBorder);

      let confY = y + 7;
      doc.fillColor(confirmTextFg).fontSize(8.5).font("Helvetica-Bold").text(sectionTitle, margin + 12, confY);

      // Status Badge Pill
      const pillWidth = 140;
      doc.roundedRect(width - margin - pillWidth - 12, confY - 2, pillWidth, 15, 3).fill(confirmBadgeBg);
      doc.fillColor("#FFFFFF").fontSize(7).font("Helvetica-Bold").text(statusPillText, width - margin - pillWidth - 12, confY + 2, { width: pillWidth, align: "center" });

      confY += 13;
      const displayAmountText = isWaiver
        ? "Rs. 0 (100% Waived)"
        : isSimulated
        ? "Rs. 0 (Simulation)"
        : formatCurrency(data.currentPayment, data.currency);
      doc.fillColor(confirmTextFg).fontSize(13).font("Helvetica-Bold").text(displayAmountText, margin + 12, confY);

      confY += 16;
      let noteMessage = data.confirmationMessage;
      if (!noteMessage) {
        if (isWaiver) {
          noteMessage = "This project was completed under a 100% promotional waiver. Total cash collected: Rs. 0. Project is fully active.";
        } else if (isSimulated) {
          noteMessage = "This test statement confirms that this transaction was executed in sandbox simulation mode. No real payment was collected.";
        } else if (isSettled) {
          noteMessage = `Payment of ${formatCurrency(data.currentPayment, data.currency)} was successfully received. Remaining balance: Rs. 0. Project contract is fully settled.`;
        } else {
          noteMessage = `Payment of ${formatCurrency(data.currentPayment, data.currency)} was successfully received. Total amount paid to date: ${formatCurrency(data.totalPaid, data.currency)}. Remaining balance: ${formatCurrency(data.balanceRemaining, data.currency)}.`;
        }
      }

      doc.fillColor(confirmTextFg).fontSize(7).font("Helvetica").text(noteMessage, margin + 12, confY, { width: contentWidth - 24 });

      y += confirmBoxH + 10;

      // =========================================================================
      // 6. TRANSACTION & AUDIT REFERENCE (Secondary Information)
      // =========================================================================
      doc.fillColor("#0F172A").fontSize(9.5).font("Helvetica-Bold").text("TRANSACTION & AUDIT REFERENCE", margin, y);
      y += 11;

      const txBoxH = data.gstin ? 56 : 44;
      doc.roundedRect(margin, y, contentWidth, txBoxH, 4).fill("#F8FAFC");
      doc.roundedRect(margin, y, contentWidth, txBoxH, 4).lineWidth(0.5).stroke("#E2E8F0");

      let tY = y + 7;
      const tCol1 = margin + 10;
      const tCol2 = margin + contentWidth / 2 + 8;

      const txLabel = data.transactionLabel || (isWaiver ? "Waiver Reference:" : isSimulated ? "Simulation Reference:" : "Transaction ID:");
      const ordLabel = data.orderLabel || (isWaiver ? "Waiver Order Ref:" : isSimulated ? "Simulation Order Ref:" : "Order Reference:");

      // Row 1
      doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text("Payment Method:", tCol1, tY);
      doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold").text(data.paymentMethod, tCol1 + 85, tY);

      doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text("Transaction Date:", tCol2, tY);
      doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold").text(data.paymentDate, tCol2 + 85, tY);

      tY += 15;

      // Row 2
      doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text(txLabel, tCol1, tY);
      doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold").text(data.transactionId || "VERIFIED_RECORD", tCol1 + 85, tY);

      doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text(ordLabel, tCol2, tY);
      doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold").text(data.orderId || "N/A", tCol2 + 85, tY);

      if (data.gstin) {
        tY += 15;
        doc.fillColor("#64748B").fontSize(7.5).font("Helvetica").text("GSTIN / Tax ID:", tCol1, tY);
        doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold").text(data.gstin, tCol1 + 85, tY);
      }

      // =========================================================================
      // 7. FOOTER SECTION
      // =========================================================================
      const footerY = height - 42;
      doc.moveTo(margin, footerY - 6).lineTo(width - margin, footerY - 6).lineWidth(0.5).stroke("#E2E8F0");

      // Footer brand mark
      doc.save();
      doc.translate(margin, footerY);
      doc.scale(0.075);
      doc.lineWidth(12);
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

      doc.fillColor("#475569").fontSize(7).font("Helvetica-Bold").text(
        "CodeFuser Digital Growth & Web Engineering • support@codefuser.com • https://codefuser.in",
        margin + 60,
        footerY + 1,
        { width: contentWidth - 60, align: "right" }
      );

      doc.fillColor("#94A3B8").fontSize(6.5).font("Helvetica").text(
        `Official ${docTitle} • System Generated • Retain this document for your business & accounting records.`,
        margin + 60,
        footerY + 11,
        { width: contentWidth - 60, align: "right" }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
