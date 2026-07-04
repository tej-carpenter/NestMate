import { PaymentProvider, PaymentOrderOptions, PaymentOrderResult, PaymentVerificationOptions, PaymentVerificationResult } from "./types";
import { RazorpayProvider } from "./providers/razorpay";

export class PaymentService {
  private provider: PaymentProvider;

  constructor() {
    // Determine which provider to use based on env variables or config.
    // For now, default to Razorpay.
    const providerName = process.env.PAYMENT_PROVIDER || "razorpay";

    if (providerName === "razorpay") {
      this.provider = new RazorpayProvider();
    } else {
      throw new Error(`Unsupported payment provider: ${providerName}`);
    }
  }

  async createOrder(options: PaymentOrderOptions): Promise<PaymentOrderResult> {
    return this.provider.createOrder(options);
  }

  async verifyPayment(options: PaymentVerificationOptions): Promise<PaymentVerificationResult> {
    return this.provider.verifyPayment(options);
  }
}

export const paymentService = new PaymentService();
