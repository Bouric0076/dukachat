import { Transaction } from '../types'

const STORAGE_KEY = 'dukachat_transactions'

export const transactionStore = {
  // Get all transactions from localStorage
  getAll(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error reading transactions:', error)
      return []
    }
  },

  // Add a new transaction
  add(transaction: Omit<Transaction, 'id'>): Transaction {
    const transactions = this.getAll()
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    }
    transactions.push(newTransaction)
    _saveTransactions(transactions)
    return newTransaction
  },

  // Update a transaction
  update(id: string, updates: Partial<Transaction>): Transaction | null {
    const transactions = this.getAll()
    const index = transactions.findIndex((t) => t.id === id)
    if (index === -1) return null

    const updated = { ...transactions[index], ...updates }
    transactions[index] = updated
    _saveTransactions(transactions)
    return updated
  },

  // Delete a transaction
  delete(id: string): boolean {
    const transactions = this.getAll()
    const filtered = transactions.filter((t) => t.id !== id)
    if (filtered.length === transactions.length) return false
    this._save(filtered)
    return true
  },

  // Get transactions by type
  getByType(type: Transaction['type']): Transaction[] {
    return this.getAll().filter((t) => t.type === type)
  },

  // Get transactions by date range
  getByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.getAll().filter(
      (t) => new Date(t.date) >= startDate && new Date(t.date) <= endDate
    )
  },

  // Clear all transactions
  clear(): void {
    localStorage.removeItem(STORAGE_KEY)
  },

  // Save transactions to localStorage
  _save(transactions: Transaction[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
    } catch (error) {
      console.error('Error saving transactions:', error)
    }
  },
}

// Helper function to save transactions
function _saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions))
  } catch (error) {
    console.error('Error saving transactions:', error)
  }
}
