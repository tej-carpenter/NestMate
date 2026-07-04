export type PaymentOrderOptions = {
  amount: number;
  currency: string;
  receiptId: string;
  bookingId: string;
};

export type PaymentOrderResult = {
  id: string;
  amount: number;
  currency: string;
  providerOrderId: string;
  provider: string;
  [key: string]: any;
};

export type PaymentVerificationOptions = {
  providerOrderId: string;
  providerPaymentId: string;
  signature?: string;
  bookingId: string;
};

export type PaymentVerificationResult = {
  success: boolean;
  transactionId: string;
  message?: string;
};

export interface PaymentProvider {
  createOrder(options: PaymentOrderOptions): Promise<PaymentOrderResult>;
  verifyPayment(options: PaymentVerificationOptions): Promise<PaymentVerificationResult>;
}
