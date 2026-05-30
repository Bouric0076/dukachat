import { Transaction } from '../types'
import './TransactionCard.css'

interface TransactionCardProps {
  transaction: Transaction
  onDelete?: (id: string) => void
}

export default function TransactionCard({ transaction, onDelete }: TransactionCardProps) {
  const statusColor = {
    pending: '#ffc107',
    completed: '#28a745',
    failed: '#dc3545',
  }

  const typeIcon = {
    loan: '💰',
    repayment: '↩️',
    deposit: '📥',
    withdrawal: '📤',
  }

  return (
    <div className="transaction-card">
      <div className="card-header">
        <div className="card-title">
          <span className="transaction-icon">{typeIcon[transaction.type]}</span>
          <div className="transaction-info">
            <h3>{transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</h3>
            <p className="transaction-description">{transaction.description}</p>
          </div>
        </div>
        <div className="card-amount">
          <span className="amount">${transaction.amount.toFixed(2)}</span>
          <span
            className="status-badge"
            style={{ backgroundColor: statusColor[transaction.status] }}
          >
            {transaction.status}
          </span>
        </div>
      </div>

      <div className="card-footer">
        <div className="transaction-date">
          {new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </div>
        {onDelete && (
          <button
            className="delete-btn"
            onClick={() => onDelete(transaction.id)}
            aria-label="Delete transaction"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
