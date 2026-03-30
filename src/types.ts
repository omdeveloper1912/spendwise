export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: TransactionType;
}

export interface Budget {
  category: string;
  limit: number;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export const CATEGORIES = {
  expense: [
    'Food & Dining',
    'Shopping',
    'Transportation',
    'Bills & Utilities',
    'Entertainment',
    'Health',
    'Education',
    'Other'
  ],
  income: [
    'Salary',
    'Freelance',
    'Investment',
    'Gift',
    'Other'
  ]
};
