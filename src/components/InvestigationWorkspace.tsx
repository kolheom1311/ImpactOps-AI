import React from 'react'
import { InvestigationReport, Anomaly, Facility } from '../types'
import {
  Sparkles,
  Cpu,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  FileText,
  Activity,
  Layers,
  HelpCircle,
} from 'lucide-react'

interface InvestigationWorkspaceProps {
  report: InvestigationReport | null
  activeAnomaly: Anomaly | null
  facility: Facility
  isInvestigating: boolean
  investigationStage: string
  onSelectIntervention: () => void
}

export const InvestigationWorkspace: React.FC<InvestigationWorkspaceProps> = ({
  report,
  activeAnomaly,
  facility,
  isInvestigating,
  investigationStage,
  onSelectIntervention,
}) => {
  // Agent workflow progression steps
  const agentStages = [
    { id: 'OBSERVE', label: '1. Ingest Telemetry' },
    { id: 'DETECT', label: '2. Statistical Outlier' },
    { id: 'REASON', label: '3. Root Cause Physics' },
    { id: 'SYNTHESIZE', label: '4. Mathematical Proof' },
    { id: 'RECOMMEND', label: '5. Formulate Plans' },
    { id: 'APPROVAL_GATE', label: '6. Human Gate' },
  ]

  const getCurrentStepIndex = () => {
    switch (investigationStage) {
      case 'OBSERVE':
        return 0
      case 'DETECT':
        return 1
      case 'REASON':
        return 2
      case 'SYNTHESIZE':
        return 3
      case 'RECOMMEND':
        return 4
      case 'APPROVAL_GATE':
        return 5
      case 'COMPLETE':
        return 6
      default:
        return report ? 6 : -1
    }
  }

  const currentIdx = getCurrentStepIndex()

  return (
    <div className="glass-panel" style={{ padding: '20px 24px', height: '100%' }}>
      {/* Workspace Header */}
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
          <Sparkles size={18} color="#10b981" />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
            Autonomous AI Investigation Workspace
          </h2>
        </div>

        {report && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {report.engineSource === 'google_gemini_flash' ? (
              <span className="badge badge-emerald" style={{ fontSize: '11px' }}>
                <Sparkles size={12} />
                Google Gemini 1.5 Flash (AI Reasoning Active)
              </span>
            ) : (
              <span className="badge badge-teal" style={{ fontSize: '11px' }}>
                <Cpu size={12} />
                Deterministic Rule Engine (Verified Math Fallback)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Agent Workflow Progression Tracker */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '8px',
          background: 'rgba(0, 0, 0, 0.35)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        {agentStages.map((stg, idx) => {
          const isDone = currentIdx > idx
          const isActive = currentIdx === idx
          return (
            <div
              key={stg.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                color: isDone ? '#34d399' : isActive ? '#38bdf8' : 'var(--text-muted)',
                fontWeight: isActive || isDone ? 700 : 500,
              }}
            >
              {isDone ? (
                <CheckCircle2 size={14} color="#10b981" />
              ) : isActive ? (
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    border: '2px solid #06b6d4',
                    borderTopColor: 'transparent',
                  }}
                  className="animate-spin"
                />
              ) : (
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              )}
              <span>{stg.label}</span>
            </div>
          )
        })}
      </div>

      {/* Live Loading State */}
      {isInvestigating && (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '3px solid rgba(16, 185, 129, 0.2)',
              borderTopColor: '#10b981',
            }}
            className="animate-spin"
          />
          <div>
            <h3 style={{ fontSize: '15px', color: '#ffffff', fontWeight: 700, marginBottom: '4px' }}>
              Autonomous Agent Executing Investigation...
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Cross-referencing sensor stream, evaluating statistical deviations, and formulating explainable causal hypotheses.
            </p>
          </div>
        </div>
      )}

      {/* No Report Selected State */}
      {!isInvestigating && !report && (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px dashed var(--border-medium)',
            borderRadius: '10px',
            color: 'var(--text-secondary)',
          }}
        >
          <Activity size={36} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#ffffff', marginBottom: '6px' }}>
            No Active Anomaly Investigation
          </h3>
          <p style={{ fontSize: '13px', maxWidth: '440px', margin: '0 auto', lineHeight: 1.5 }}>
            Select an anomaly from the left panel and click{' '}
            <strong style={{ color: '#10b981' }}>"Investigate with AI"</strong> to launch the autonomous reasoning agent.
          </p>
        </div>
      )}

      {/* Structured Investigation Report */}
      {!isInvestigating && report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Executive Summary */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              borderLeft: '4px solid #10b981',
              background: 'rgba(16, 185, 129, 0.05)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <FileText size={16} color="#10b981" />
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>
                Executive Technical Diagnosis
              </h4>
            </div>
            <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>{report.executiveSummary}</p>
          </div>

          {/* Mathematical Ground Truth Evidence */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Deterministic Mathematical Evidence (Ground Truth)
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Baseline Level</span>
                <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: '#38bdf8' }}>
                  {report.calculations.baselineConsumption.toLocaleString()} {report.calculations.unit}
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Observed Level</span>
                <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: '#fb7185' }}>
                  {report.calculations.actualConsumption.toLocaleString()} {report.calculations.unit}
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Net Overconsumption</span>
                <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>
                  +{report.calculations.netOverconsumption.toLocaleString()} {report.calculations.unit}
                </div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '8px 10px', borderRadius: '6px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Avoidable Cost/Mo</span>
                <div className="tabular-nums" style={{ fontSize: '14px', fontWeight: 700, color: '#f59e0b' }}>
                  ${report.calculations.totalAvoidableCost.toLocaleString()}
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '8px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                color: '#94a3b8',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <strong style={{ color: '#34d399' }}>Formula Verified:</strong> {report.calculations.formulaUsed}
            </div>
          </div>

          {/* Root Cause Hypotheses */}
          <div className="glass-card" style={{ padding: '16px' }}>
            <h4
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                marginBottom: '10px',
              }}
            >
              Evaluated Root Cause Hypotheses
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {report.rootCauses.map((rc, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    borderLeft: `3px solid ${rc.probability > 0.7 ? '#10b981' : '#06b6d4'}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 700, color: '#ffffff', fontSize: '13px' }}>{rc.cause}</span>
                    <span
                      className={`badge ${rc.probability > 0.7 ? 'badge-emerald' : 'badge-teal'}`}
                      style={{ fontSize: '10px' }}
                    >
                      {Math.round(rc.probability * 100)}% Probability
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    {rc.rationale}
                  </p>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                    Evidence: {rc.evidenceSupport}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Risks & Verification Guardrails */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div className="glass-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <AlertOctagon size={15} color="#fbbf24" />
                <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase' }}>
                  Safety & Operational Guardrails
                </h5>
              </div>
              <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {report.risks.map((risk, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card" style={{ padding: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <ShieldCheck size={15} color="#10b981" />
                <h5 style={{ fontSize: '12px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                  Suggested Verification Steps
                </h5>
              </div>
              <ul style={{ paddingLeft: '16px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {report.verificationSteps.map((step, i) => (
                  <li key={i} style={{ marginBottom: '4px' }}>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action Trigger Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              onClick={onSelectIntervention}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '13px' }}
            >
              <span>Review Formulated Operational Plans ({report.recommendedInterventions.length})</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
