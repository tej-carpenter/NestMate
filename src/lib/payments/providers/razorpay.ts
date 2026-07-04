import Razorpay from "razorpay";
import crypto from "crypto";
import { PaymentProvider, PaymentOrderOptions, PaymentOrderResult, PaymentVerificationOptions, PaymentVerificationResult } from "../types";

export class RazorpayProvider implements PaymentProvider {
  private razorpay: Razorpay;

  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys not configured");
    }
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  async createOrder(options: PaymentOrderOptions): Promise<PaymentOrderResult> {
    const razorpayOptions = {
      amount: options.amount,
      currency: options.currency,
      receipt: options.receiptId,
    };

    const order = await this.razorpay.orders.create(razorpayOptions);

    return {
      ...order,
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      providerOrderId: order.id,
      provider: "razorpay",
    };
  }

  async verifyPayment(options: PaymentVerificationOptions): Promise<PaymentVerificationResult> {
    const { providerOrderId, providerPaymentId, signature } = options;

    if (!signature) {
      return { success: false, transactionId: providerPaymentId, message: "Missing signature" };
    }

    const body = providerOrderId + "|" + providerPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === signature;

    if (isAuthentic) {
      return { success: true, transactionId: providerPaymentId };
    } else {
      return { success: false, transactionId: providerPaymentId, message: "Invalid payment signature" };
    }
  }
}
