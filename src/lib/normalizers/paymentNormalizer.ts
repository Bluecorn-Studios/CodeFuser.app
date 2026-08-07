export interface NormalizedPaymentDetails {
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
  currency: string;
  status: "paid" | "partially_paid" | "unpaid" | "failed";
}

export function normalizePaymentDetails(raw: any): NormalizedPaymentDetails {
  const p = raw && typeof raw === "object" ? raw : {};
  return {
    orderId: String(p.orderId || p.razorpay_order_id || p.order_id || ""),
    paymentId: String(p.paymentId || p.razorpay_payment_id || p.payment_id || ""),
    signature: String(p.signature || p.razorpay_signature || ""),
    amount: typeof p.amount === "number" ? p.amount : Number(p.amount || 0),
    currency: String(p.currency || "INR"),
    status: (["paid", "partially_paid", "unpaid", "failed"].includes(String(p.status).toLowerCase())
      ? String(p.status).toLowerCase()
      : "unpaid") as NormalizedPaymentDetails["status"],
  };
}
