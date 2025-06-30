import { User, Payment, WithdrawalRequest, Tariff, Notification, Statistics } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    phoneNumber: '+1234567890',
    subscriptionPlan: 'Premium',
    accountBalance: 2547.50,
    registrationDate: '2024-01-15',
    lastActivity: '2024-12-15',
    status: 'Active'
  },
  {
    id: '2',
    phoneNumber: '+1987654321',
    subscriptionPlan: 'Basic',
    accountBalance: 890.25,
    registrationDate: '2024-02-20',
    lastActivity: '2024-12-14',
    status: 'Active'
  },
  {
    id: '3',
    phoneNumber: '+1122334455',
    subscriptionPlan: 'Enterprise',
    accountBalance: 5230.00,
    registrationDate: '2024-01-10',
    lastActivity: '2024-12-13',
    status: 'Active'
  },
  {
    id: '4',
    phoneNumber: '+1555666777',
    subscriptionPlan: 'Basic',
    accountBalance: 156.75,
    registrationDate: '2024-03-05',
    lastActivity: '2024-12-10',
    status: 'Inactive'
  },
  {
    id: '5',
    phoneNumber: '+1999888777',
    subscriptionPlan: 'Premium',
    accountBalance: 3421.80,
    registrationDate: '2024-02-28',
    lastActivity: '2024-12-15',
    status: 'Active'
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'p1',
    userId: '1',
    userPhone: '+1234567890',
    amount: 299.99,
    date: '2024-12-15',
    type: 'Subscription',
    status: 'Completed',
    method: 'Card'
  },
  {
    id: 'p2',
    userId: '2',
    userPhone: '+1987654321',
    amount: 500.00,
    date: '2024-12-14',
    type: 'Deposit',
    status: 'Completed',
    method: 'InterKassa'
  },
  {
    id: 'p3',
    userId: '3',
    userPhone: '+1122334455',
    amount: 999.99,
    date: '2024-12-13',
    type: 'Subscription',
    status: 'Completed',
    method: 'Bank Transfer'
  },
  {
    id: 'p4',
    userId: '1',
    userPhone: '+1234567890',
    amount: 1200.00,
    date: '2024-12-12',
    type: 'Deposit',
    status: 'Completed',
    method: 'Card'
  },
  {
    id: 'p5',
    userId: '4',
    userPhone: '+1555666777',
    amount: 99.99,
    date: '2024-12-10',
    type: 'Subscription',
    status: 'Failed',
    method: 'Card'
  }
];

export const mockWithdrawals: WithdrawalRequest[] = [
  {
    id: 'w1',
    userId: '1',
    userPhone: '+1234567890',
    cardNumber: '**** **** **** 1234',
    amount: 1500.00,
    requestDate: '2024-12-15',
    status: 'Processing',
    notes: 'Standard withdrawal request'
  },
  {
    id: 'w2',
    userId: '3',
    userPhone: '+1122334455',
    cardNumber: '**** **** **** 5678',
    amount: 2500.00,
    requestDate: '2024-12-14',
    status: 'Paid',
    notes: 'Processed successfully'
  },
  {
    id: 'w3',
    userId: '2',
    userPhone: '+1987654321',
    cardNumber: '**** **** **** 9012',
    amount: 300.00,
    requestDate: '2024-12-13',
    status: 'Unpaid',
    notes: 'Pending verification'
  },
  {
    id: 'w4',
    userId: '5',
    userPhone: '+1999888777',
    cardNumber: '**** **** **** 3456',
    amount: 800.00,
    requestDate: '2024-12-12',
    status: 'Processing',
    notes: 'Under review'
  }
];

export const mockTariffs: Tariff[] = [
  {
    id: 't1',
    name: 'Basic Plan',
    price: 99.99,
    features: ['Basic Features', 'Email Support', '5GB Storage', 'Standard API Access'],
    duration: 'Monthly',
    isActive: true,
    description: 'Perfect for individuals and small businesses getting started'
  },
  {
    id: 't2',
    name: 'Premium Plan',
    price: 299.99,
    features: ['All Basic Features', 'Priority Support', '50GB Storage', 'Advanced API Access', 'Custom Integrations'],
    duration: 'Monthly',
    isActive: true,
    description: 'Ideal for growing businesses with advanced needs'
  },
  {
    id: 't3',
    name: 'Enterprise Plan',
    price: 999.99,
    features: ['All Premium Features', '24/7 Phone Support', 'Unlimited Storage', 'Full API Access', 'Custom Development', 'Dedicated Account Manager'],
    duration: 'Monthly',
    isActive: true,
    description: 'Comprehensive solution for large organizations'
  },
  {
    id: 't4',
    name: 'Starter Plan',
    price: 49.99,
    features: ['Limited Features', 'Email Support', '1GB Storage'],
    duration: 'Monthly',
    isActive: false,
    description: 'Basic starter package'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: 'n1',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur on December 20th from 2:00 AM to 4:00 AM EST.',
    type: 'Warning',
    createdDate: '2024-12-15',
    isRead: false,
    recipients: 'All'
  },
  {
    id: 'n2',
    title: 'New Feature Release',
    message: 'We have released new analytics features for Premium subscribers.',
    type: 'Success',
    createdDate: '2024-12-14',
    isRead: true,
    recipients: 'Premium'
  },
  {
    id: 'n3',
    title: 'Payment Processing Update',
    message: 'InterKassa integration has been updated with improved security features.',
    type: 'Info',
    createdDate: '2024-12-13',
    isRead: true,
    recipients: 'All'
  }
];

export const mockStatistics: Statistics = {
  totalIncome: 125430.50,
  totalExpenses: 45200.00,
  newUsersToday: 23,
  newUsersThisMonth: 456,
  pendingWithdrawals: 3,
  completedWithdrawals: 127,
  dailyWithdrawals: [
    { date: '2024-12-10', amount: 2500 },
    { date: '2024-12-11', amount: 1800 },
    { date: '2024-12-12', amount: 3200 },
    { date: '2024-12-13', amount: 2100 },
    { date: '2024-12-14', amount: 2800 },
    { date: '2024-12-15', amount: 1900 }
  ],
  monthlyWithdrawals: [
    { month: 'Jul', amount: 15400 },
    { month: 'Aug', amount: 18200 },
    { month: 'Sep', amount: 21300 },
    { month: 'Oct', amount: 19800 },
    { month: 'Nov', amount: 23500 },
    { month: 'Dec', amount: 14300 }
  ]
};