export interface Message {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
  language?: 'en' | 'sw'
}

export interface Transaction {
  id: string
  amount: number
  type: 'loan' | 'repayment' | 'deposit' | 'withdrawal'
  date: Date
  description: string
  status: 'pending' | 'completed' | 'failed'
}

export interface LoanApplication {
  id: string
  amount: number
  term: number
  purpose: string
  status: 'pending' | 'approved' | 'rejected' | 'active'
  applicationDate: Date
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: 'customer' | 'agent' | 'admin'
}

export interface LoanScore {
  score: number
  rating: 'excellent' | 'good' | 'fair' | 'poor'
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
}
