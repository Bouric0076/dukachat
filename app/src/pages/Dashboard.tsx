import { useState, useEffect } from 'react'
import TransactionCard from '../components/TransactionCard'
import LoanScore from '../components/LoanScore'
import { transactionStore } from '../store/transactions'
import { Transaction, LoanScore as LoanScoreType } from '../types'
import './Dashboard.css'

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const loanScore: LoanScoreType = {
    score: 720,
    rating: 'good',
    riskLevel: 'medium',
  }

  useEffect(() => {
    // Load transactions from localStorage
    const stored = transactionStore.getAll()
    setTransactions(stored)

    // TODO: Calculate loan score based on transactions and user data
  }, [])

  const handleDeleteTransaction = (id: string) => {
    transactionStore.delete(id)
    setTransactions(transactionStore.getAll())
  }

  const getTransactionStats = () => {
    const totalIncome = transactions
      .filter((t) => t.type === 'deposit' || t.type === 'loan')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpense = transactions
      .filter((t) => t.type === 'withdrawal' || t.type === 'repayment')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpense

    return { totalIncome, totalExpense, balance }
  }

  const stats = getTransactionStats()

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>
      </div>

      <div className="dashboard-grid">
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-label">Total Income</div>
            <div className="stat-value">${stats.totalIncome.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Expense</div>
            <div className="stat-value">${stats.totalExpense.toFixed(2)}</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-label">Balance</div>
            <div className="stat-value" style={{ color: stats.balance >= 0 ? '#28a745' : '#dc3545' }}>
              ${stats.balance.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="score-section">
          <LoanScore score={loanScore} />
        </div>
      </div>

      <div className="transactions-section">
        <h2>Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="empty-message">No transactions yet</p>
        ) : (
          <div className="transactions-grid">
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onDelete={handleDeleteTransaction}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
