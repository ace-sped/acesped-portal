// TypeScript definitions for Paystack Popup
interface PaystackPop {
  setup(options: PaystackOptions): PaystackHandler;
}

interface PaystackOptions {
  key: string;
  email: string;
  amount: number; // Amount in kobo
  currency?: string;
  ref?: string;
  metadata?: Record<string, any>;
  callback?: (response: PaystackResponse) => void;
  onClose?: () => void;
  channels?: string[];
  plan?: string;
  quantity?: number;
  subaccount?: string;
  transaction_charge?: number;
  bearer?: string;
}

interface PaystackResponse {
  message: string;
  reference: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
}

interface PaystackHandler {
  openIframe(): void;
}

declare global {
  interface Window {
    PaystackPop: PaystackPop;
  }
}

export {};

