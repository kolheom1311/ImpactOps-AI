import React, { useState } from 'react'
import { InterventionPlan, Facility } from '../types'
import {
  ShieldAlert,
  CheckCircle,
  XCircle,
  HelpCircle,
  TrendingDown,
  DollarSign,
  Leaf,
  Clock,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Send,
  AlertCircle,
} from 'lucide-react'

interface RecommendationApprovalProps {
  plans: InterventionPlan[]
  facility: Facility
  onApprovePlan: (plan: InterventionPlan, notes: string) => Promise<void>
  onRejectPlan: (plan: InterventionPlan, reason: string) => Promise<void>
  onCompletePlan: (plan: InterventionPlan) => void
  isProcessing: boolean
}

export const RecommendationApproval: React.FC<RecommendationApprovalProps> = ({
  plans,
  facility,
  onApprovePlan,
  onRejectPlan,
  onCompletePlan,
  isProcessing,
}) => {
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(plans[0]?.id || null)
  const [operatorNotes, setOperatorNotes] = useState<Record<string, string>>({})
  const [selectedActionModal, setSelectedActionModal] = useState<{
    plan: InterventionPlan
    action: 'approve' | 'reject'
  } | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedPlanId((prev) => (prev === id ? null : id))
  }

  const handleConfirmAction = async () => {
    if (!selectedActionModal) return
    const { plan, action } = selectedActionModal
    const note = operatorNotes[plan.id] || ''

    if (action === 'approve') {
      await onApprovePlan(plan, note)
    } else {
      await onRejectPlan(plan, note)
    }
    setSelectedActionModal(null)
  }

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', height: '100%' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginBottom: '16px',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={18} color="#10b981" />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
            Operational Intervention Protocols & Human Decision Gate
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">Human-in-the-Loop Enforced</span>
        </div>
      </div>

      {/* Honest Operational Disclaimer Notice */}
      <div
        style={{
          background: 'rgba(6, 182, 212, 0.08)',
          border: '1px solid rgba(6, 182, 212, 0.25)',
          borderRadius: '8px',
          padding: '10px 14px',
          marginBottom: '16px',
          fontSize: '12px',
          color: '#e0f2fe',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <AlertCircle size={18} color="#06b6d4" style={{ flexShrink: 0 }} />
        <div>
          <strong>System Boundary Disclosure:</strong> Approved actions are tracked as formal{' '}
          <span style={{ color: '#38bdf8', fontWeight: 700 }}>Authorized Operational Plans (AOP)</span> for
          maintenance teams and BMS dispatch. ImpactOps AI does not assert direct physical relay or actuator execution.
        </div>
      </div>

      {/* Plans List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {plans.map((plan, index) => {
          const isExpanded = expandedPlanId === plan.id
          const isApproved = plan.status === 'APPROVED'
          const isRejected = plan.status === 'REJECTED'
          const isCompleted = plan.status === 'COMPLETED'

          const urgencyBadge =
            plan.urgency === 'P1_IMMEDIATE'
              ? 'badge-rose'
              : plan.urgency === 'P2_HIGH'
              ? 'badge-amber'
              : 'badge-slate'

          return (
            <div
              key={plan.id}
              className="glass-card"
              style={{
                padding: '16px 18px',
                borderColor: isApproved
                  ? 'rgba(16, 185, 129, 0.45)'
                  : isRejected
                  ? 'rgba(244, 63, 94, 0.4)'
                  : 'var(--border-subtle)',
                background: isApproved
                  ? 'rgba(16, 185, 129, 0.06)'
                  : isRejected
                  ? 'rgba(244, 63, 94, 0.04)'
                  : 'var(--bg-card)',
              }}
            >
              {/* Plan Row Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8' }}>
                    #{index + 1}
                  </span>
                  <span className={`badge ${urgencyBadge}`}>{plan.urgency.replace('_', ' ')}</span>
                  <span className="badge badge-slate" style={{ fontSize: '10px' }}>
                    {plan.category.replace('_', ' ')}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isApproved && (
                    <span className="badge badge-emerald">
                      <CheckCircle size={12} />
                      Authorized: {plan.humanApproval?.authorizationCode}
                    </span>
                  )}
                  {isRejected && (
                    <span className="badge badge-rose">
                      <XCircle size={12} />
                      Rejected by Operator
                    </span>
                  )}
                  {isCompleted && (
                    <span className="badge badge-teal">
                      <CheckCircle size={12} />
                      Verified & Completed
                    </span>
                  )}

                  <button
                    onClick={() => toggleExpand(plan.id)}
                    className="btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '11px' }}
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    <span>{isExpanded ? 'Hide Details' : 'Inspect Math & Details'}</span>
                  </button>
                </div>
              </div>

              {/* Title & Core Metrics Row */}
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff', marginBottom: '10px' }}>
                {plan.title}
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontSize: '11px',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Projected Monthly Savings</div>
                  <strong className="tabular-nums" style={{ color: '#10b981', fontSize: '14px' }}>
                    ${plan.estimatedMonthlySavingsDollars.toLocaleString()}/mo
                  </strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Annual Financial Yield</div>
                  <strong className="tabular-nums" style={{ color: '#38bdf8', fontSize: '14px' }}>
                    ${plan.estimatedAnnualSavingsDollars.toLocaleString()}/yr
                  </strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Resource Abatement</div>
                  <strong className="tabular-nums" style={{ color: '#fbbf24', fontSize: '14px' }}>
                    {plan.estimatedResourceSavings.value.toLocaleString()} {plan.estimatedResourceSavings.unit}
                  </strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Carbon Avoided</div>
                  <strong className="tabular-nums" style={{ color: '#34d399', fontSize: '14px' }}>
                    {plan.estimatedCarbonAvoidedKgPerMonth.toLocaleString()} kg CO₂e/mo
                  </strong>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Payback Period</div>
                  <strong className="tabular-nums" style={{ color: '#ffffff', fontSize: '14px' }}>
                    {plan.paybackPeriodDays} Days
                  </strong>
                </div>
              </div>

              {/* Expandable Calculation Breakdown */}
              {isExpanded && (
                <div
                  style={{
                    background: 'rgba(0, 0, 0, 0.45)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    padding: '14px',
                    marginBottom: '14px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <HelpCircle size={14} color="#06b6d4" />
                    <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#06b6d4', textTransform: 'uppercase' }}>
                      Transparent Mathematical Formula & Assumptions
                    </h4>
                  </div>

                  <div
                    style={{
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: '#a7f3d0',
                      marginBottom: '10px',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                    }}
                  >
                    {plan.calculationBreakdown.formula}
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <strong style={{ color: '#cbd5e1', fontSize: '11px' }}>Engineering Assumptions:</strong>
                    <ul style={{ paddingLeft: '18px', marginTop: '4px', color: 'var(--text-secondary)' }}>
                      {plan.calculationBreakdown.assumptions.map((asm, i) => (
                        <li key={i}>{asm}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>
                      Confidence Rating: <strong style={{ color: '#10b981' }}>{plan.confidenceLevel}%</strong>
                    </span>
                    <span>
                      Implementation Effort: <strong style={{ color: '#ffffff' }}>{plan.implementationEffort}</strong>
                    </span>
                    <span>
                      Cost to Implement: <strong style={{ color: '#ffffff' }}>${plan.estimatedCostToImplement}</strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Human Decision Gate Buttons */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  paddingTop: '6px',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {isApproved
                    ? `Approved on ${new Date(plan.humanApproval?.approvedAt || '').toLocaleDateString()} by ${plan.humanApproval?.operator}`
                    : 'Requires Human Approval to Authorize Operational Plan'}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {!isApproved && !isRejected && (
                    <>
                      <button
                        onClick={() => setSelectedActionModal({ plan, action: 'reject' })}
                        disabled={isProcessing}
                        className="btn-secondary"
                        style={{
                          padding: '6px 12px',
                          fontSize: '12px',
                          color: '#fb7185',
                          borderColor: 'rgba(244, 63, 94, 0.3)',
                        }}
                      >
                        <XCircle size={14} />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => setSelectedActionModal({ plan, action: 'approve' })}
                        disabled={isProcessing}
                        className="btn-primary"
                        style={{ padding: '6px 14px', fontSize: '12px' }}
                      >
                        <CheckCircle size={14} />
                        <span>Authorize Operational Plan</span>
                      </button>
                    </>
                  )}

                  {isApproved && !isCompleted && (
                    <button
                      onClick={() => onCompletePlan(plan)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px', color: '#38bdf8' }}
                    >
                      <CheckCircle size={14} />
                      <span>Mark Work Completed</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Human Decision Confirmation Dialog Modal */}
      {selectedActionModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '480px',
              width: '100%',
              padding: '24px',
              background: '#0c1424',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              {selectedActionModal.action === 'approve' ? (
                <CheckCircle size={22} color="#10b981" />
              ) : (
                <XCircle size={22} color="#f43f5e" />
              )}
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
                {selectedActionModal.action === 'approve'
                  ? 'Authorize Operational Plan'
                  : 'Reject Operational Plan'}
              </h3>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.5 }}>
              You are about to{' '}
              <strong style={{ color: selectedActionModal.action === 'approve' ? '#10b981' : '#f43f5e' }}>
                {selectedActionModal.action.toUpperCase()}
              </strong>{' '}
              the plan: <strong>"{selectedActionModal.plan.title}"</strong>. This will record an immutable entry in the
              tamper-evident audit log.
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Operator Authorization Notes / Reason:
              </label>
              <textarea
                rows={3}
                value={operatorNotes[selectedActionModal.plan.id] || ''}
                onChange={(e) =>
                  setOperatorNotes({
                    ...operatorNotes,
                    [selectedActionModal.plan.id]: e.target.value,
                  })
                }
                placeholder={
                  selectedActionModal.action === 'approve'
                    ? 'e.g., Verified chiller thermal telemetry and approved immediate schedule reset.'
                    : 'e.g., Scheduled maintenance already planned for next shift.'
                }
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '8px 10px',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setSelectedActionModal(null)}
                className="btn-secondary"
                disabled={isProcessing}
                style={{ padding: '8px 14px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className={selectedActionModal.action === 'approve' ? 'btn-primary' : 'btn-secondary'}
                style={{
                  padding: '8px 16px',
                  color: selectedActionModal.action === 'reject' ? '#fb7185' : undefined,
                  borderColor: selectedActionModal.action === 'reject' ? 'rgba(244, 63, 94, 0.4)' : undefined,
                }}
              >
                {isProcessing
                  ? 'Processing...'
                  : selectedActionModal.action === 'approve'
                  ? 'Confirm Authorization'
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
