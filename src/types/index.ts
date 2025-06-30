export interface User {
  id: string;
  phoneNumber: string;
  subscriptionPlan: 'Basic' | 'Premium' | 'Enterprise';
  accountBalance: number;
  registrationDate: string;
  lastActivity: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface Payment {
  id: string;
  userId: string;
  userPhone: string;
  amount: number;
  date: string;
  type: 'Deposit' | 'Subscription' | 'Commission';
  status: 'Completed' | 'Pending' | 'Failed';
  method: 'Card' | 'Bank Transfer' | 'InterKassa';
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userPhone: string;
  cardNumber: string;
  amount: number;
  requestDate: string;
  status: 'Paid' | 'Unpaid' | 'Processing';
  notes?: string;
}

export interface Tariff {
  id: string;
  name: string;
  price: number;
  features: string[];
  duration: string;
  isActive: boolean;
  description: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'Info' | 'Warning' | 'Success' | 'Error';
  createdDate: string;
  isRead: boolean;
  recipients: 'All' | 'Premium' | 'Basic' | 'Enterprise';
}

export interface Statistics {
  totalIncome: number;
  totalExpenses: number;
  newUsersToday: number;
  newUsersThisMonth: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
  dailyWithdrawals: { date: string; amount: number }[];
  monthlyWithdrawals: { month: string; amount: number }[];
}