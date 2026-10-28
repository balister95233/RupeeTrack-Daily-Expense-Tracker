import { CategoryConfig, Expense, BudgetSettings } from '../types/expense';

export const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'cat-1', name: 'Grocery and household shopping', icon: 'ShoppingCart', budget: 8000 },
  { id: 'cat-2', name: 'Milk and dairy products', icon: 'Milk', budget: 2500 },
  { id: 'cat-3', name: 'Petrol and fuel', icon: 'Fuel', budget: 4500 },
  { id: 'cat-4', name: 'Food and restaurants', icon: 'UtensilsCrossed', budget: 5000 },
  { id: 'cat-5', name: 'Tea, coffee, and snacks', icon: 'Coffee', budget: 1500 },
  { id: 'cat-6', name: 'Rent and accommodation', icon: 'Home', budget: 18000 },
  { id: 'cat-7', name: 'Electricity and utility bills', icon: 'Zap', budget: 3000 },
  { id: 'cat-8', name: 'Mobile recharge and internet', icon: 'Wifi', budget: 1800 },
  { id: 'cat-9', name: 'Transportation', icon: 'Bus', budget: 2000 },
  { id: 'cat-10', name: 'Education and books', icon: 'BookOpen', budget: 3500 },
  { id: 'cat-11', name: 'Medical and healthcare', icon: 'HeartPulse', budget: 3000 },
  { id: 'cat-12', name: 'Shopping and clothing', icon: 'Shirt', budget: 6000 },
  { id: 'cat-13', name: 'Entertainment', icon: 'Film', budget: 2500 },
  { id: 'cat-14', name: 'Travel', icon: 'Plane', budget: 8000 },
  { id: 'cat-15', name: 'Personal care', icon: 'Sparkles', budget: 2000 },
  { id: 'cat-16', name: 'EMI and loan payments', icon: 'Landmark', budget: 12000 },
  { id: 'cat-17', name: 'Other expenses', icon: 'Receipt', budget: 3000 },
];

export const DEFAULT_BUDGET_SETTINGS: BudgetSettings = {
  overallMonthlyBudget: 60000,
  monthlyIncome: 85000,
  savingsTarget: 25000,
};

export const PAYMENT_METHODS = ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Other'] as const;

// Helper to format ISO date string for given relative days offset
export function getRelativeDateString(daysOffset: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate realistic initial sample data
export function generateInitialSampleExpenses(): Expense[] {
  return [
    {
      id: 'tx-1',
      title: 'Weekly Supermarket & Organic Groceries',
      amount: 3500,
      category: 'Grocery and household shopping',
      date: getRelativeDateString(0),
      payment: 'UPI',
      notes: 'Fresh vegetables, pulses, and pantry essentials from Reliance Smart',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'tx-2',
      title: 'Monthly Farm Fresh Milk Supply',
      amount: 1200,
      category: 'Milk and dairy products',
      date: getRelativeDateString(0),
      payment: 'Cash',
      notes: 'Paid morning milk vendor for the fortnight',
      createdAt: Date.now() - 3600000 * 5,
    },
    {
      id: 'tx-3',
      title: 'Petrol Full Tank (Indian Oil)',
      amount: 2000,
      category: 'Petrol and fuel',
      date: getRelativeDateString(-1),
      payment: 'Credit Card',
      notes: 'XP95 premium fuel',
      createdAt: Date.now() - 86400000,
    },
    {
      id: 'tx-4',
      title: 'Weekend Family Dinner at Barbeque Nation',
      amount: 1500,
      category: 'Food and restaurants',
      date: getRelativeDateString(-1),
      payment: 'UPI',
      notes: 'Buffet celebration',
      createdAt: Date.now() - 86400000 * 1.5,
    },
    {
      id: 'tx-5',
      title: 'State Electricity Bill Payment',
      amount: 900,
      category: 'Electricity and utility bills',
      date: getRelativeDateString(-2),
      payment: 'UPI',
      notes: 'Paid online via BESCOM portal',
      createdAt: Date.now() - 86400000 * 2,
    },
    {
      id: 'tx-6',
      title: 'Monthly High-Speed Fiber Internet & Mobile Plan',
      amount: 1499,
      category: 'Mobile recharge and internet',
      date: getRelativeDateString(-3),
      payment: 'Debit Card',
      notes: 'Airtel Xstream Fiber 200 Mbps recharge',
      createdAt: Date.now() - 86400000 * 3,
    },
    {
      id: 'tx-7',
      title: 'Chai, Bun Maska & Evening Samosas',
      amount: 220,
      category: 'Tea, coffee, and snacks',
      date: getRelativeDateString(-3),
      payment: 'UPI',
      notes: 'Colleagues team tea break',
      createdAt: Date.now() - 86400000 * 3.3,
    },
    {
      id: 'tx-8',
      title: 'Monthly Apartment Maintenance & Rent',
      amount: 18000,
      category: 'Rent and accommodation',
      date: getRelativeDateString(-5),
      payment: 'UPI',
      notes: 'Transferred directly to landlord account',
      createdAt: Date.now() - 86400000 * 5,
    },
    {
      id: 'tx-9',
      title: 'Metro Smart Card Recharge & Auto',
      amount: 650,
      category: 'Transportation',
      date: getRelativeDateString(-6),
      payment: 'UPI',
      notes: 'Weekly office commute',
      createdAt: Date.now() - 86400000 * 6,
    },
    {
      id: 'tx-10',
      title: 'Online Coding Bootcamp & TypeScript Book',
      amount: 1850,
      category: 'Education and books',
      date: getRelativeDateString(-8),
      payment: 'Credit Card',
      notes: 'Advanced Web Architecture course',
      createdAt: Date.now() - 86400000 * 8,
    },
    {
      id: 'tx-11',
      title: 'Pharmacy Vitamins & First Aid Kit',
      amount: 780,
      category: 'Medical and healthcare',
      date: getRelativeDateString(-10),
      payment: 'UPI',
      notes: 'Apollo Pharmacy order',
      createdAt: Date.now() - 86400000 * 10,
    },
    {
      id: 'tx-12',
      title: 'Cotton Formal Shirts & Festive Kurta',
      amount: 3200,
      category: 'Shopping and clothing',
      date: getRelativeDateString(-12),
      payment: 'Debit Card',
      notes: 'End of season sale discount',
      createdAt: Date.now() - 86400000 * 12,
    },
    {
      id: 'tx-13',
      title: 'Movie Tickets & Popcorn Combo',
      amount: 850,
      category: 'Entertainment',
      date: getRelativeDateString(-14),
      payment: 'Credit Card',
      notes: 'PVR Inox weekend show',
      createdAt: Date.now() - 86400000 * 14,
    },
    {
      id: 'tx-14',
      title: 'Two-Wheeler Vehicle EMI',
      amount: 4200,
      category: 'EMI and loan payments',
      date: getRelativeDateString(-15),
      payment: 'Debit Card',
      notes: 'Auto-debited from salary account',
      createdAt: Date.now() - 86400000 * 15,
    },
    {
      id: 'tx-15',
      title: 'Haircut, Grooming & Spa',
      amount: 600,
      category: 'Personal care',
      date: getRelativeDateString(-17),
      payment: 'Cash',
      notes: 'Local salon appointment',
      createdAt: Date.now() - 86400000 * 17,
    },
    {
      id: 'tx-16',
      title: 'Train Tickets for Weekend Getaway',
      amount: 2400,
      category: 'Travel',
      date: getRelativeDateString(-22),
      payment: 'UPI',
      notes: 'IRCTC booking to Mysuru',
      createdAt: Date.now() - 86400000 * 22,
    },
  ];
}
