export type TransactionType = 'income' | 'expense' | 'transfer';
export type TransactionSource = 'manual' | 'voice' | 'receipt_ocr';

export interface Account {
  id: string;
  user_id?: string;
  name: string;
  type: 'cash' | 'bank' | 'ewallet' | 'credit' | 'investment';
  balance: number;
  currency: string;
  color?: string;
  icon?: string;
  accountNumber?: string;
}

export interface Category {
  id: string;
  user_id?: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  budgetLimit?: number;
}

export interface Transaction {
  id: string;
  user_id?: string;
  account_id: string;
  account_name?: string; // Flexible free-text name
  to_account_id?: string; // For transfers
  to_account_name?: string;
  category_id: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string YYYY-MM-DD or YYYY-MM-DDTHH:mm
  description: string;
  source: TransactionSource;
  receipt_url?: string;
  created_at?: string;
}

export interface Budget {
  id: string;
  user_id?: string;
  category_id: string;
  amount: number;
  month: number; // 1 - 12
  year: number;
}

export interface FinancialGoal {
  id: string;
  user_id?: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string; // YYYY-MM-DD
  category: string;
  icon?: string;
  color?: string;
  created_at?: string;
}

export interface Debt {
  id: string;
  user_id?: string;
  type: 'debt' | 'receivable'; // debt = hutang saya ke orang, receivable = piutang orang ke saya
  person: string;
  amount: number;
  due_date: string;
  status: 'unpaid' | 'paid' | 'partial';
  paid_amount?: number;
  notes?: string;
  created_at?: string;
}

export interface VoiceLog {
  id: string;
  user_id?: string;
  transcript: string;
  parsed_intent: ParsedIntent;
  action_taken: string;
  created_at: string;
}

export type IntentName = 
  | 'create_transaction'
  | 'query_financial_summary'
  | 'query_balance'
  | 'query_category_spending'
  | 'query_budget_status'
  | 'query_goal_status'
  | 'navigate_page'
  | 'unknown';

export interface ParsedIntent {
  name: IntentName;
  confidence: number;
  parameters: {
    type?: TransactionType;
    amount?: number;
    category?: string;
    account?: string;
    to_account?: string;
    description?: string;
    period?: 'this_month' | 'last_month' | 'today' | 'this_year' | 'all';
    target_name?: string;
    page?: string;
    rawText?: string;
  };
  explanation?: string;
}

export interface VoiceSettings {
  language: 'id-ID' | 'en-US';
  speechRate: number; // 0.8 - 1.5
  speechPitch: number; // 0.8 - 1.2
  voiceURI: string;
  autoConfirmBelow: number;
  autoPlayVoiceResponse: boolean;
  soundEffects: boolean;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'tip' | 'praise' | 'prediction';
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  metricChange?: string;
  category?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarColor: string;
  avatarEmoji: string;
  currency: string;
  hasCompletedOnboarding: boolean;
  monthlyIncomeTarget?: number;
  emergencyFundGoalMonths?: number;
  darkMode?: boolean;
}

export interface FamilyDataStore {
  activeUserId: string;
  users: UserProfile[];
}
