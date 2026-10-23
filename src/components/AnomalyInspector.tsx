import React from 'react'
import { Anomaly } from '../types'
import { AlertTriangle, Clock, ArrowUpRight, Search, CheckCircle2, ChevronRight } from 'lucide-react'

interface AnomalyInspectorProps {
  anomalies: Anomaly[]
  selectedAnomaly: Anomaly | null
  onSelectAnomaly: (anomaly: Anomaly) => void
  onInvestigate: (anomaly: Anomaly) => void
  isInvestigating: boolean
}

export const AnomalyInspector: React.FC<AnomalyInspectorProps> = ({
  anomalies,
  selectedAnomaly,
  onSelectAnomaly,
  onInvestigate,
  isInvestigating,
}) => {
  return (
    <div className="glass-panel" style={{ padding: '20px 24px', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={18} color="#f59e0b" />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>Detected Anomalies</h2>
        </div>
        <span className="badge badge-amber">{anomalies.length} Active Incidents</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {anomalies.map((anom) => {
          const isSelected = selectedAnomaly?.id === anom.id
          const severityBadge =
            anom.severity === 'CRITICAL'
              ? 'badge-rose'
              : anom.severity === 'HIGH'
              ? 'badge-amber'
              : 'badge-slate'

          return (
            <div
              key={anom.id}
              onClick={() => onSelectAnomaly(anom)}
              className="glass-card"
              style={{
                padding: '16px',
                cursor: 'pointer',
                borderColor: isSelected ? 'rgba(16, 185, 129, 0.5)' : 'var(--border-subtle)',
                background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-card)',
                boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.15)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`badge ${severityBadge}`}>{anom.severity}</span>
                  <span className="badge badge-teal" style={{ textTransform: 'uppercase' }}>
                    {anom.resourceType}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <Clock size={12} />
                  <span>{anom.durationHours}h Active</span>
                </div>
              </div>

              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', marginBottom: '6px' }}>
                {anom.title}
              </h3>

              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.4 }}>
                {anom.description}
              </p>

              {/* Deviation metrics */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  marginBottom: '12px',
                  fontSize: '11px',
                }}
              >
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Observed Delta</div>
                  <strong className="tabular-nums" style={{ color: '#fb7185', fontSize: '12px' }}>
                    +{anom.deviationPercent.toFixed(1)}%
                  </strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Z-Score</div>
                  <strong className="tabular-nums" style={{ color: '#38bdf8', fontSize: '12px' }}>
                    {anom.evidence.zScore}σ
                  </strong>
                </div>
                <div>
                  <div style={{ color: 'var(--text-muted)' }}>Avoidable/Wk</div>
                  <strong className="tabular-nums" style={{ color: '#fbbf24', fontSize: '12px' }}>
                    ${Math.round(anom.estimatedAvoidableCostPerWeek).toLocaleString()}
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Confidence: <strong style={{ color: '#10b981' }}>{anom.evidence.confidenceScore}%</strong>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onInvestigate(anom)
                  }}
                  disabled={isInvestigating}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '11px' }}
                >
                  <Search size={13} />
                  <span>Investigate with AI</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
