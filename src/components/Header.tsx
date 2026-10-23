import React, { useState } from 'react'
import { Facility } from '../types'
import {
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  Info,
  Key,
  Building2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

interface HeaderProps {
  facilities: Facility[]
  selectedFacility: Facility
  onSelectFacility: (facility: Facility) => void
  activeAnomalyCount: number
  aiMode: string
  hasGeminiKey: boolean
  onOpenArchitecture: () => void
  onOpenApiKeyModal: () => void
  onRefreshTelemetry: () => void
  isRefreshing: boolean
}

export const Header: React.FC<HeaderProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  activeAnomalyCount,
  aiMode,
  hasGeminiKey,
  onOpenArchitecture,
  onOpenApiKeyModal,
  onRefreshTelemetry,
  isRefreshing,
}) => {
  return (
    <header className="glass-panel" style={{ margin: '16px 24px', padding: '14px 24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Brand & Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
            }}
          >
            <ShieldCheck size={24} color="#10b981" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '20px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                ImpactOps <span style={{ color: '#10b981' }}>AI</span>
              </h1>
              <span className="badge badge-emerald">Autonomous Agent</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              Intelligent Sustainability & Operational Decision System
            </p>
          </div>
        </div>

        {/* Center: Facility Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '6px 12px',
            }}
          >
            <Building2 size={16} color="#06b6d4" />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Facility:
            </span>
            <select
              value={selectedFacility.id}
              onChange={(e) => {
                const fac = facilities.find((f) => f.id === e.target.value)
                if (fac) onSelectFacility(fac)
              }}
              style={{
                background: 'transparent',
                color: '#ffffff',
                border: 'none',
                outline: 'none',
                fontFamily: 'var(--font-display)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id} style={{ background: '#0c1424', color: '#fff' }}>
                  {fac.name} ({fac.code})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRefreshTelemetry}
            disabled={isRefreshing}
            className="btn-secondary"
            title="Refresh Telemetry Stream"
            style={{ padding: '8px 12px' }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Right Status Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Active Anomalies Beacon */}
          {activeAnomalyCount > 0 ? (
            <div className="badge badge-amber" style={{ padding: '6px 10px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                }}
                className="pulse-beacon"
              />
              <AlertTriangle size={12} />
              <span>{activeAnomalyCount} Abnormalities Detected</span>
            </div>
          ) : (
            <div className="badge badge-emerald" style={{ padding: '6px 10px' }}>
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#10b981',
                }}
              />
              <span>Telemetry Normal</span>
            </div>
          )}

          {/* AI Mode Badge & Setup */}
          <button
            onClick={onOpenApiKeyModal}
            className="btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              border: hasGeminiKey
                ? '1px solid rgba(16, 185, 129, 0.4)'
                : '1px solid rgba(6, 182, 212, 0.3)',
              background: hasGeminiKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(6, 182, 212, 0.08)',
            }}
          >
            {hasGeminiKey ? (
              <Sparkles size={14} color="#10b981" />
            ) : (
              <Cpu size={14} color="#06b6d4" />
            )}
            <span style={{ color: hasGeminiKey ? '#34d399' : '#38bdf8', fontWeight: 600 }}>
              {hasGeminiKey ? 'Google Gemini AI' : 'Deterministic Engine'}
            </span>
            <Key size={12} color="var(--text-muted)" />
          </button>

          {/* Architecture / Judges Visualizer */}
          <button
            onClick={onOpenArchitecture}
            className="btn-primary"
            style={{ padding: '7px 14px', fontSize: '12px' }}
          >
            <Layers size={14} />
            <span>Architecture & Security</span>
          </button>
        </div>
      </div>

      {/* Facility Description & Location bar */}
      <div
        style={{
          marginTop: '12px',
          paddingTop: '10px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          gap: '8px',
        }}
      >
        <div>
          <span style={{ color: '#ffffff', fontWeight: 600 }}>{selectedFacility.name}</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>{selectedFacility.type}</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>{selectedFacility.location}</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <span>{selectedFacility.squareFeet.toLocaleString()} sq ft</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span>
            Tariff Rate:{' '}
            <strong style={{ color: '#ffffff' }}>${selectedFacility.electricityRatePerKWh}/kWh</strong>
          </span>
          <span>
            Water Rate:{' '}
            <strong style={{ color: '#ffffff' }}>${selectedFacility.waterRatePerKL}/kL</strong>
          </span>
          <span className="badge badge-slate" style={{ fontSize: '10px' }}>
            Simulated Sensor Stream (7 Days / 168h)
          </span>
        </div>
      </div>
    </header>
  )
}
