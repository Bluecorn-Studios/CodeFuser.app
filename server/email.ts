import { withRetry } from "./retry.js";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || "CodeFuser <onboarding@resend.dev>";

export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Resend Warning] RESEND_API_KEY is not configured in environment variables. Email transmission was bypassed.");
    return;
  }

  if (!to || typeof to !== "string" || !to.trim()) {
    console.warn(`[Resend Skipped] Empty target email address provided: "${to}". Skipping email transmission.`);
    return;
  }

  const cleanTo = to.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanTo)) {
    console.warn(`[Resend Skipped] Invalid target email address format provided: "${cleanTo}". Skipping email transmission.`);
    return;
  }

  const fromAddress = process.env.EMAIL_FROM || "CodeFuser <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [cleanTo],
        subject: subject,
        html: html
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API returned status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[Resend Success] Email sent successfully to ${to}. Message ID: ${data.id}`);
    return data;
  } catch (err: any) {
    console.error(`[Resend Failure] Failed to send email to ${to}:`, err.message || err);
    throw err;
  }
}

// Asynchronous wrapper to isolate email transmission and prevent any API errors from interrupting payment or project registration workflows
export function sendEmailAsync(to: string, subject: string, html: string) {
  sendEmail(to, subject, html).catch((err) => {
    console.error(`[Email Async Swallow] Suppressed email failure to protect execution pipeline:`, err);
  });
}

// Premium Email templates matching CodeFuser branding
export function getProjectCreatedTemplate(clientName: string, businessName: string, packageId: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CodeFuser</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.05em; color: #f59e0b; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #d97706; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER CORE</div>
        </div>
        <div class="content">
          <h1>Project Registration Confirmed</h1>
          <p>Hi ${clientName},</p>
          <p>Thank you for choosing CodeFuser. Your project proposal and diagnostic specs have been successfully compiled and registered in our system. Our engineering team is reviewing your requirements to establish the architectural baseline.</p>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Business Name:</span>
              <span class="detail-val">${businessName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Tier Selected:</span>
              <span class="detail-val" style="text-transform: uppercase;">${packageId}</span>
            </div>
          </div>

          <p>You can access your customized Client Portal at any time to monitor compiler progress, upload design assets, and view active deliverables once authorized.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Launch Client Portal</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. All rights reserved. Confidential Client Communication.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPaymentSuccessTemplate(clientName: string, businessName: string, planName: string, orderId: string, amount: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt Confirmed</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.05em; color: #10b981; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER PAYMENT VERIFIED</div>
        </div>
        <div class="content">
          <h1>Payment Receipt Confirmed</h1>
          <p>Hi ${clientName},</p>
          <p>Excellent news! We have successfully received and verified your payment. Your standard pricing is now locked and development resources have been allocated to your brand workspace.</p>
          
          <div class="details-box">
            <div class="detail-row">
              <span class="detail-label">Business Name:</span>
              <span class="detail-val">${businessName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Active Plan:</span>
              <span class="detail-val">${planName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Identifier:</span>
              <span class="detail-val">${orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Amount Paid:</span>
              <span class="detail-val">${amount}</span>
            </div>
          </div>

          <p>Your client portal is now fully activated! You can begin uploading design assets, logo source files, copy guidelines, and track the live dev roadmap immediately.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Enter Client Portal</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. All rights reserved. Secure SSL Transmission Receipt.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getPortalActivatedTemplate(clientName: string, businessName: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Client Portal Activated</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.05em; color: #3b82f6; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">PORTAL AUTHORIZED</div>
        </div>
        <div class="content">
          <h1>Your Client Portal is Ready</h1>
          <p>Hi ${clientName},</p>
          <p>We are excited to inform you that your CodeFuser Client Portal has been fully authorized and activated by our team for <strong>${businessName}</strong>.</p>
          <p>You can now log in using your registered credentials to check on the real-time project milestone timeline, collaborate on system requirements, and retrieve your design and source-code deliverables safely.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Launch Dashboard</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. All rights reserved. Security Authorized Link.
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getDeliverablesReadyTemplate(clientName: string, businessName: string, portalUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Deliverables Ready</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 24px; font-weight: bold; letter-spacing: 0.05em; color: #f59e0b; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .highlight-box { background-color: #18181b; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 16px; margin-bottom: 24px; }
        .highlight-text { color: #f4f4f5; font-size: 14px; font-weight: 500; margin: 0; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #f59e0b; color: #18181b !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 8px; transition: background-color 0.2s; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">DELIVERABLES ARE COMPILED</div>
        </div>
        <div class="content">
          <h1>Your Project Deliverables are Ready!</h1>
          <p>Hi ${clientName},</p>
          <p>We are thrilled to let you know that the deliverables for <strong>${businessName}</strong> are completed, tested, and ready for you to retrieve!</p>
          
          <div class="highlight-box">
            <p class="highlight-text">Your custom branding blueprints, structured databases, code bundles, and launch checklist are ready for download in the client hub.</p>
          </div>

          <p>Please enter your client portal to review the finished product, download high-resolution assets, and review your production deployment launch guide.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Download Deliverables</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. All rights reserved. Secure Assets Handover Communication.
        </div>
      </div>
    </body>
    </html>
  `;
}

// --- CODEFUSER HOSTING LIFECYCLE EMAIL TEMPLATES ---

export interface HostingEmailParams {
  clientName: string;
  businessName: string;
  planName: string;
  monthlyPrice: string;
  billingPeriod?: string;
  paymentStatus?: string;
  invoiceNumber?: string;
  transactionId?: string;
  nextBillingDate?: string;
  gracePeriodEndsAt?: string;
  suspendedAt?: string;
  cancelledAt?: string;
  mandateId?: string;
  portalUrl: string;
  supportContact?: string;
}

export function getHostingAutopayActivatedTemplate(params: HostingEmailParams): string {
  const { clientName, businessName, planName, monthlyPrice, nextBillingDate, mandateId, portalUrl } = params;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeFuser Hosting - AutoPay Activated</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.05em; color: #10b981; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER HOSTING</div>
        </div>
        <div class="content">
          <h1>AutoPay Mandate Activated</h1>
          <p>Hi ${clientName},</p>
          <p>Your automatic monthly recurring hosting mandate for <strong>${businessName}</strong> has been successfully authorized and activated!</p>
          
          <div class="details-box">
            <div class="detail-row"><span class="detail-label">Business Name:</span><span class="detail-val">${businessName}</span></div>
            <div class="detail-row"><span class="detail-label">Hosting Plan:</span><span class="detail-val">${planName}</span></div>
            <div class="detail-row"><span class="detail-label">Monthly Hosting Price:</span><span class="detail-val">${monthlyPrice}</span></div>
            <div class="detail-row"><span class="detail-label">Payment Status:</span><span class="detail-val" style="color:#10b981;">AUTOPAY ACTIVE</span></div>
            ${mandateId ? `<div class="detail-row"><span class="detail-label">Mandate Ref:</span><span class="detail-val">${mandateId}</span></div>` : ""}
            ${nextBillingDate ? `<div class="detail-row"><span class="detail-label">Next Billing Date:</span><span class="detail-val">${nextBillingDate}</span></div>` : ""}
          </div>

          <p>Your cloud web infrastructure will auto-renew seamlessly every month. You can manage or modify your mandate settings anytime in your Client Portal.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Manage Hosting Subscription</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Contact support: support@codefuser.com
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getHostingPaymentSuccessTemplate(params: HostingEmailParams): string {
  const { clientName, businessName, planName, monthlyPrice, invoiceNumber, transactionId, billingPeriod, nextBillingDate, portalUrl } = params;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeFuser Hosting - Payment Receipt</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #27272a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.05em; color: #10b981; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER HOSTING</div>
        </div>
        <div class="content">
          <h1>Hosting Payment Confirmed</h1>
          <p>Hi ${clientName},</p>
          <p>We have successfully processed your monthly hosting fee for <strong>${businessName}</strong>. Your cloud infrastructure remains fully operational.</p>
          
          <div class="details-box">
            <div class="detail-row"><span class="detail-label">Business Name:</span><span class="detail-val">${businessName}</span></div>
            <div class="detail-row"><span class="detail-label">Hosting Plan:</span><span class="detail-val">${planName}</span></div>
            <div class="detail-row"><span class="detail-label">Amount Paid:</span><span class="detail-val">${monthlyPrice}</span></div>
            ${invoiceNumber ? `<div class="detail-row"><span class="detail-label">Invoice Number:</span><span class="detail-val">${invoiceNumber}</span></div>` : ""}
            ${transactionId ? `<div class="detail-row"><span class="detail-label">Transaction ID:</span><span class="detail-val">${transactionId}</span></div>` : ""}
            ${billingPeriod ? `<div class="detail-row"><span class="detail-label">Billing Period:</span><span class="detail-val">${billingPeriod}</span></div>` : ""}
            <div class="detail-row"><span class="detail-label">Payment Status:</span><span class="detail-val" style="color:#10b981;">PAID</span></div>
            ${nextBillingDate ? `<div class="detail-row"><span class="detail-label">Next Billing Date:</span><span class="detail-val">${nextBillingDate}</span></div>` : ""}
          </div>

          <p>You can view and download your full PDF GST tax invoice anytime in the Client Portal.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">View Invoice & Portal</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Support: support@codefuser.com
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getHostingPaymentFailedTemplate(params: HostingEmailParams): string {
  const { clientName, businessName, planName, monthlyPrice, gracePeriodEndsAt, portalUrl } = params;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeFuser Hosting - Payment Failed</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #ef4444; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.05em; color: #ef4444; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #ef4444; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER HOSTING</div>
        </div>
        <div class="content">
          <h1>Action Required: Hosting Payment Failed</h1>
          <p>Hi ${clientName},</p>
          <p>We were unable to process your recurring hosting payment for <strong>${businessName}</strong>. Please update your payment method to keep your website live.</p>
          
          <div class="details-box">
            <div class="detail-row"><span class="detail-label">Business Name:</span><span class="detail-val">${businessName}</span></div>
            <div class="detail-row"><span class="detail-label">Hosting Plan:</span><span class="detail-val">${planName}</span></div>
            <div class="detail-row"><span class="detail-label">Monthly Hosting Price:</span><span class="detail-val">${monthlyPrice}</span></div>
            <div class="detail-row"><span class="detail-label">Payment Status:</span><span class="detail-val" style="color:#ef4444;">PAYMENT FAILED</span></div>
            ${gracePeriodEndsAt ? `<div class="detail-row"><span class="detail-label">Grace Period Ends:</span><span class="detail-val" style="color:#f59e0b;">${gracePeriodEndsAt}</span></div>` : ""}
          </div>

          <p>Your hosting remains online during the grace period. Please verify or update your AutoPay mandate before the grace period ends to prevent automatic service suspension.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Update Payment Mandate</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Contact support: support@codefuser.com
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getHostingGracePeriodTemplate(params: HostingEmailParams): string {
  const { clientName, businessName, planName, monthlyPrice, gracePeriodEndsAt, portalUrl } = params;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeFuser Hosting - Grace Period Active</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #f59e0b; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.05em; color: #f59e0b; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #d97706; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER HOSTING</div>
        </div>
        <div class="content">
          <h1>Notice: Hosting Entered Grace Period</h1>
          <p>Hi ${clientName},</p>
          <p>Your promotional free hosting period or billing cycle for <strong>${businessName}</strong> has ended without an active payment mandate. A temporary grace period has been initiated.</p>
          
          <div class="details-box">
            <div class="detail-row"><span class="detail-label">Business Name:</span><span class="detail-val">${businessName}</span></div>
            <div class="detail-row"><span class="detail-label">Hosting Plan:</span><span class="detail-val">${planName}</span></div>
            <div class="detail-row"><span class="detail-label">Monthly Hosting Price:</span><span class="detail-val">${monthlyPrice}</span></div>
            <div class="detail-row"><span class="detail-label">Current Status:</span><span class="detail-val" style="color:#f59e0b;">GRACE PERIOD ACTIVE</span></div>
            ${gracePeriodEndsAt ? `<div class="detail-row"><span class="detail-label">Grace Period Ends:</span><span class="detail-val" style="color:#f59e0b;">${gracePeriodEndsAt}</span></div>` : ""}
          </div>

          <p>To avoid service interruption or web suspension, please activate your AutoPay mandate or clear outstanding dues before the grace period expires.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Set Up AutoPay Now</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Contact support: support@codefuser.com
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getHostingSuspensionTemplate(params: HostingEmailParams): string {
  const { clientName, businessName, planName, monthlyPrice, suspendedAt, portalUrl } = params;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeFuser Hosting - Service Suspended</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #dc2626; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.05em; color: #dc2626; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #dc2626; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER HOSTING</div>
        </div>
        <div class="content">
          <h1>Notice: Hosting Service Suspended</h1>
          <p>Hi ${clientName},</p>
          <p>The grace period for <strong>${businessName}</strong> has expired without an active payment mandate. Your hosting service has been suspended.</p>
          
          <div class="details-box">
            <div class="detail-row"><span class="detail-label">Business Name:</span><span class="detail-val">${businessName}</span></div>
            <div class="detail-row"><span class="detail-label">Hosting Plan:</span><span class="detail-val">${planName}</span></div>
            <div class="detail-row"><span class="detail-label">Monthly Hosting Price:</span><span class="detail-val">${monthlyPrice}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-val" style="color:#dc2626;">HOSTING SUSPENDED</span></div>
            ${suspendedAt ? `<div class="detail-row"><span class="detail-label">Suspended At:</span><span class="detail-val">${suspendedAt}</span></div>` : ""}
          </div>

          <p>Your website data is safely preserved. You can restore your hosting service immediately by setting up an active AutoPay mandate in your portal.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Reactivate Hosting Service</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Contact support: support@codefuser.com
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getHostingReactivationTemplate(params: HostingEmailParams): string {
  const { clientName, businessName, planName, monthlyPrice, nextBillingDate, portalUrl } = params;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeFuser Hosting - Service Reactivated</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #10b981; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.05em; color: #10b981; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #10b981; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER HOSTING</div>
        </div>
        <div class="content">
          <h1>Hosting Service Reactivated</h1>
          <p>Hi ${clientName},</p>
          <p>Great news! Your hosting service for <strong>${businessName}</strong> has been successfully reactivated and restored to online status.</p>
          
          <div class="details-box">
            <div class="detail-row"><span class="detail-label">Business Name:</span><span class="detail-val">${businessName}</span></div>
            <div class="detail-row"><span class="detail-label">Hosting Plan:</span><span class="detail-val">${planName}</span></div>
            <div class="detail-row"><span class="detail-label">Monthly Hosting Price:</span><span class="detail-val">${monthlyPrice}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-val" style="color:#10b981;">REACTIVATED / ACTIVE</span></div>
            ${nextBillingDate ? `<div class="detail-row"><span class="detail-label">Next Billing Date:</span><span class="detail-val">${nextBillingDate}</span></div>` : ""}
          </div>

          <p>Thank you for keeping your CodeFuser hosting active. You can access your portal anytime.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Launch Client Portal</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Contact support: support@codefuser.com
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getHostingAutopayCancelledTemplate(params: HostingEmailParams): string {
  const { clientName, businessName, planName, monthlyPrice, cancelledAt, portalUrl } = params;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeFuser Hosting - AutoPay Cancelled</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #71717a; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.05em; color: #a1a1aa; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #3f3f46; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER HOSTING</div>
        </div>
        <div class="content">
          <h1>AutoPay Mandate Cancelled</h1>
          <p>Hi ${clientName},</p>
          <p>This confirms that your automatic recurring hosting mandate for <strong>${businessName}</strong> has been cancelled.</p>
          
          <div class="details-box">
            <div class="detail-row"><span class="detail-label">Business Name:</span><span class="detail-val">${businessName}</span></div>
            <div class="detail-row"><span class="detail-label">Hosting Plan:</span><span class="detail-val">${planName}</span></div>
            <div class="detail-row"><span class="detail-label">Monthly Hosting Price:</span><span class="detail-val">${monthlyPrice}</span></div>
            <div class="detail-row"><span class="detail-label">Status:</span><span class="detail-val" style="color:#ef4444;">MANDATE CANCELLED</span></div>
            ${cancelledAt ? `<div class="detail-row"><span class="detail-label">Cancelled Date:</span><span class="detail-val">${cancelledAt}</span></div>` : ""}
          </div>

          <p>Your hosting remains active until the end of your paid cycle, after which a mandate will be required to prevent service interruption.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">View Subscription Details</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Contact support: support@codefuser.com
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getHostingUpcomingBillingReminderTemplate(params: HostingEmailParams): string {
  const { clientName, businessName, planName, monthlyPrice, nextBillingDate, portalUrl } = params;
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CodeFuser Hosting - Upcoming Billing Reminder</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0b0b0c; color: #d4d4d8; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background-color: #121214; border: 1px solid #3b82f6; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
        .header { background-color: #18181b; padding: 32px; border-bottom: 1px solid #27272a; text-align: center; }
        .logo { font-size: 22px; font-weight: bold; letter-spacing: 0.05em; color: #3b82f6; }
        .content { padding: 32px; line-height: 1.6; }
        h1 { font-size: 20px; font-weight: 600; color: #ffffff; margin-top: 0; margin-bottom: 16px; }
        p { color: #a1a1aa; margin-top: 0; margin-bottom: 24px; }
        .details-box { background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 14px; }
        .detail-row:last-child { margin-bottom: 0; }
        .detail-label { color: #71717a; font-weight: 500; }
        .detail-val { color: #f4f4f5; font-weight: 600; }
        .btn-container { text-align: center; margin-top: 32px; margin-bottom: 16px; }
        .btn { display: inline-block; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; }
        .footer { background-color: #18181b; padding: 24px; text-align: center; font-size: 12px; color: #52525b; border-top: 1px solid #27272a; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">CODEFUSER HOSTING</div>
        </div>
        <div class="content">
          <h1>Upcoming Billing Reminder</h1>
          <p>Hi ${clientName},</p>
          <p>This is a reminder that your monthly hosting renewal for <strong>${businessName}</strong> is coming up soon.</p>
          
          <div class="details-box">
            <div class="detail-row"><span class="detail-label">Business Name:</span><span class="detail-val">${businessName}</span></div>
            <div class="detail-row"><span class="detail-label">Hosting Plan:</span><span class="detail-val">${planName}</span></div>
            <div class="detail-row"><span class="detail-label">Monthly Hosting Price:</span><span class="detail-val">${monthlyPrice}</span></div>
            ${nextBillingDate ? `<div class="detail-row"><span class="detail-label">Next Billing Date:</span><span class="detail-val" style="color:#3b82f6;">${nextBillingDate}</span></div>` : ""}
            <div class="detail-row"><span class="detail-label">Payment Mode:</span><span class="detail-val">AutoPay Recurring Mandate</span></div>
          </div>

          <p>No manual action is required if your AutoPay payment method is active and up to date.</p>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">View Client Portal</a>
          </div>
        </div>
        <div class="footer">
          &copy; 2026 CodeFuser Systems. Contact support: support@codefuser.com
        </div>
      </div>
    </body>
    </html>
  `;
}

