import React from 'react'
import {
  Layers,
  ShieldCheck,
  Cpu,
  Sparkles,
  Lock,
  Zap,
  CheckCircle2,
  FileCheck,
  Server,
  ArrowRight,
  Database,
  ExternalLink,
  X,
} from 'lucide-react'

interface ArchitectureModalProps {
  isOpen: boolean
  onClose: () => void
  hasGeminiKey: boolean
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({
  isOpen,
  onClose,
  hasGeminiKey,
}) => {
  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '860px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          background: '#090f1a',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.9)',
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Layers size={22} color="#10b981" />
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                ImpactOps AI Architecture & Autonomous Safety Specification
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              Hackathon Evaluation Blueprint: Security, Measurable Efficiency, Agentic Decision Loop, and Google Technologies
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary"
            style={{ padding: '6px', borderRadius: '50%' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* 1. Problem Solved */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#34d399', textTransform: 'uppercase', marginBottom: '6px' }}>
            Problem Solved
          </h3>
          <p style={{ fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>
            Enterprise facilities waste millions annually due to fragmented telemetry, delayed anomaly identification,
            and unprioritized maintenance interventions. ImpactOps AI continuously monitors 168-hour streaming telemetry,
            quantifies financial and carbon waste with deterministic mathematical rigor, employs Google Gemini to reason
            over mechanical failure modes, and enforces a zero-trust Human Decision Gate before authorizing operational actions.
          </p>
        </div>

        {/* 2. Visual Architecture Pipeline */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase', marginBottom: '10px' }}>
            Multi-Tier Agentic Architecture Flow
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '8px',
              background: 'rgba(0, 0, 0, 0.4)',
              padding: '14px',
              borderRadius: '10px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* Step 1 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Server size={14} color="#06b6d4" />
                <strong style={{ fontSize: '12px', color: '#06b6d4' }}>1. Ingestion</strong>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Synthetic multi-day hourly sensor stream (kWh, kL, tons, tariffs, EPA grid factors).
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Zap size={14} color="#38bdf8" />
                <strong style={{ fontSize: '12px', color: '#38bdf8' }}>2. Analytics</strong>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Deterministic rolling z-score (&gt;2.2σ), baseline deviation %, avoidable cost formulas.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Sparkles size={14} color="#10b981" />
                <strong style={{ fontSize: '12px', color: '#10b981' }}>3. AI Agent</strong>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Google Gemini 1.5 Flash reasons over mechanical physics, ranking actionable protocols.
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <ShieldCheck size={14} color="#f59e0b" />
                <strong style={{ fontSize: '12px', color: '#f59e0b' }}>4. Human Gate</strong>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Zero direct execution. Human approval creates an Authorized Operational Plan (AOP).
              </p>
            </div>

            {/* Step 5 */}
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '10px', borderRadius: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <FileCheck size={14} color="#a7f3d0" />
                <strong style={{ fontSize: '12px', color: '#a7f3d0' }}>5. Audit Ledger</strong>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Immutable event stream with SHA-256 tamper-evident cryptographic digests.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Google Technologies Used (Transparently Disclosed) */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Google Technologies Implemented & Verified
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px', borderRadius: '6px' }}>
              <strong style={{ color: '#ffffff' }}>Google Gemini 1.5 Flash API</strong>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                Integrated on backend proxy (`server/geminiService.ts`). Receives trusted deterministic math as evidence,
                performs technical causal deduction, and emits structured JSON schema reports.
              </div>
              <div style={{ marginTop: '6px' }}>
                <span className={hasGeminiKey ? 'badge badge-emerald' : 'badge badge-teal'}>
                  {hasGeminiKey ? 'Active (API Key Connected)' : 'Fallback Ready (Deterministic Mode Active)'}
                </span>
              </div>
            </div>

            <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '10px', borderRadius: '6px' }}>
              <strong style={{ color: '#ffffff' }}>Google Stitch MCP Design System</strong>
              <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
                Stitch project initialized (`17567247451732840146`). Design tokens (Plus Jakarta Sans, Inter, deep obsidian
                canvas #070B12, emerald #10B981, surgical cyan #06B6D4) integrated directly into the design system.
              </div>
              <div style={{ marginTop: '6px' }}>
                <span className="badge badge-emerald">Stitch Project Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Security & Safety Controls */}
        <div className="glass-card" style={{ padding: '16px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '8px' }}>
            Enterprise Security Engineering Controls
          </h3>

          <ul style={{ paddingLeft: '18px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <li>
              <strong style={{ color: '#ffffff' }}>Zero Secret Leakage:</strong> Gemini API keys are never bundled in
              frontend client code. All LLM calls pass through the Express backend proxy via environment variables.
            </li>
            <li>
              <strong style={{ color: '#ffffff' }}>Untrusted Model Sandboxing:</strong> All model outputs are strictly validated
              against TypeScript schemas. Hallucinated arithmetic is prohibited; ground truth numbers are computed in trusted
              application code.
            </li>
            <li>
              <strong style={{ color: '#ffffff' }}>Human-in-the-Loop Governance:</strong> The autonomous agent cannot actuate
              hardware or modify building management systems autonomously. Decisions require explicit human operator authorization.
            </li>
            <li>
              <strong style={{ color: '#ffffff' }}>Tamper-Evident Ledger:</strong> Every event, simulation, and approval is
              recorded with a SHA-256 cryptographic digest.
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn-primary" style={{ padding: '8px 18px' }}>
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
