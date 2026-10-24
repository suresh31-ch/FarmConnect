/**
 * Payment Gateway & Escrow Vault API Service
 */

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'COD';
  upiId?: string;
  cardNumber?: string;
}

export interface PaymentTransaction {
  transactionId: string;
  orderId: string;
  amount: number;
  method: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  timestamp: string;
  invoiceUrl?: string;
}

// TODO: Integrate Razorpay / Cashfree / UPI Intent SDK

export async function processPayment(req: PaymentRequest): Promise<PaymentTransaction> {
  // TODO: POST /api/v1/payments/process
  await new Promise((r) => setTimeout(r, 1000));

  return {
    transactionId: `TXN_UPI_${Date.now()}_9812`,
    orderId: req.orderId,
    amount: req.amount,
    method: req.method,
    status: 'SUCCESS',
    timestamp: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    invoiceUrl: `/invoices/INV-${req.orderId}.pdf`
  };
}

export async function fetchPaymentHistory(): Promise<PaymentTransaction[]> {
  // TODO: GET /api/v1/payments/history
  await new Promise((r) => setTimeout(r, 300));
  return [
    {
      transactionId: 'TXN_UPI_1771239812',
      orderId: 'FC-ORD-98214',
      amount: 2020,
      method: 'UPI (PhonePe)',
      status: 'SUCCESS',
      timestamp: 'July 24, 2026 10:15 AM'
    },
    {
      transactionId: 'TXN_CARD_1771120011',
      orderId: 'FC-ORD-88120',
      amount: 4500,
      method: 'HDFC Credit Card',
      status: 'SUCCESS',
      timestamp: 'July 20, 2026 03:40 PM'
    }
  ];
}
