import type { LoanScore as LoanScoreData } from '../types'
import './LoanScore.css'

interface LoanScoreProps {
  score: LoanScoreData
}

/**
 * Loan Scoring Formula:
 * Score = (Payment History * 0.35) + (Credit Utilization * 0.30) + (Account Age * 0.15) + (Loan Diversity * 0.10) + (Recent Inquiries * 0.10)
 * 
 * Rating Scale:
 * - 750-850: Excellent
 * - 670-749: Good
 * - 580-669: Fair
 * - 300-579: Poor
 */

export default function LoanScore({ score }: LoanScoreProps) {
  const getScoreColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return '#28a745'
      case 'good':
        return '#17a2b8'
      case 'fair':
        return '#ffc107'
      case 'poor':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return '#28a745'
      case 'medium':
        return '#ffc107'
      case 'high':
        return '#ff6b6b'
      case 'critical':
        return '#dc3545'
      default:
        return '#6c757d'
    }
  }

  return (
    <div className="loan-score-card">
      <div className="score-display">
        <div className="score-circle" style={{ borderColor: getScoreColor(score.rating) }}>
          <div className="score-number">{score.score}</div>
          <div className="score-max">/850</div>
        </div>
        <div className="score-details">
          <div className="score-rating" style={{ color: getScoreColor(score.rating) }}>
            {score.rating.toUpperCase()}
          </div>
          <div className="risk-level">
            Risk Level:
            <span style={{ color: getRiskColor(score.riskLevel) }} className="risk-badge">
              {score.riskLevel.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="score-breakdown">
        <h4>Factors Considered:</h4>
        <ul>
          <li>
            <span className="factor-label">Payment History</span>
            <span className="factor-weight">35%</span>
          </li>
          <li>
            <span className="factor-label">Credit Utilization</span>
            <span className="factor-weight">30%</span>
          </li>
          <li>
            <span className="factor-label">Account Age</span>
            <span className="factor-weight">15%</span>
          </li>
          <li>
            <span className="factor-label">Loan Diversity</span>
            <span className="factor-weight">10%</span>
          </li>
          <li>
            <span className="factor-label">Recent Inquiries</span>
            <span className="factor-weight">10%</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
