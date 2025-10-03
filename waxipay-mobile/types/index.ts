// ===========================================
// types/index.ts
// ===========================================
export interface User {
  id: string;
  phone_number: string;
  email?: string;
  full_name: string;
  user_type: "driver" | "merchant" | "deliverer" | "individual";
  is_verified: boolean;
  created_at: string;
  wallet?: Wallet;
}

export interface Wallet {
  id: string;
  balance: string;
  balance_formatted: string;
  currency: string;
  is_active: boolean;
  created_at: string;
}

export interface Transaction {
  id: string;
  user: string;
  user_name: string;
  transaction_type: "payment_in" | "payment_out" | "withdrawal" | "deposit";
  transaction_type_display: string;
  payment_method: "wave" | "orange_money" | "free_money" | "bank_card";
  payment_method_display: string;
  amount: string;
  amount_formatted: string;
  currency: string;
  fees: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  status_display: string;
  reference: string;
  external_reference?: string;
  recipient_phone?: string;
  description?: string;
  created_at: string;
  completed_at?: string;
}

export interface TransactionStats {
  total_received: number;
  total_sent: number;
  month_transactions: number;
  weekly_data: {
    date: string;
    total: number;
    count: number;
  }[];
  wallet_balance: number;
}
