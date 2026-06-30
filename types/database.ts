export type TransactionType = "expense" | "income";
export type Account = "personal" | "business";

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  account: Account;
  note: string | null;
  date: string; // format YYYY-MM-DD
  created_at: string;
}

export const EXPENSE_CATEGORIES = [
  "Transport",
  "Nourriture",
  "Internet",
  "Loyer",
  "Santé",
  "Loisirs",
  "Autre",
] as const;

export const INCOME_CATEGORIES = [
  "Salaire",
  "Client",
  "Vente",
  "Autre",
] as const;

export const ACCOUNT_LABELS: Record<Account, string> = {
  personal: "Personnel",
  business: "Habynex",
};

export interface RecurringTransaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  category: string;
  account: Account;
  note: string | null;
  day_of_month: number;
  active: boolean;
  last_generated: string | null;
  is_subscription: boolean;
  service_name: string | null;
  created_at: string;
}

export interface SavingsGoal {
  id: string;
  user_id: string;
  account: Account;
  name: string;
  target_amount: number;
  target_date: string | null;
  status: "active" | "completed" | "cancelled";
  note: string | null;
  created_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}

export interface Debt {
  id: string;
  user_id: string;
  account: Account;
  name: string;
  principal_amount: number;
  current_balance: number;
  interest_rate: number | null;
  start_date: string;
  target_date: string | null;
  status: "active" | "paid";
  note: string | null;
  created_at: string;
}

export interface DebtPayment {
  id: string;
  debt_id: string;
  user_id: string;
  amount: number;
  date: string;
  note: string | null;
  created_at: string;
}
