import React, { useState, useEffect } from 'react'
import { Facility, ScenarioParameters, ScenarioResult } from '../types'
import { Sliders, TrendingDown, DollarSign, Leaf, ShieldCheck, RefreshCw, Calculator, HelpCircle } from 'lucide-react'

interface ScenarioSimulatorProps {
  facility: Facility
  onSimulate: (params: ScenarioParameters) => Promise<ScenarioResult | null>
  isSimulating: boolean
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  facility,
  onSimulate,
  isSimulating,
}) => {
  const [params, setParams] = useState<ScenarioParameters>({
    electricityReductionPct: 15,
    waterLeakReductionPct: 25,
    peakShiftHours: 3,
    electricityTariffPerKWh: facility.electricityRatePerKWh,
    waterTariffPerKL: facility.waterRatePerKL,
  })

  const [result, setResult] = useState<ScenarioResult | null>(null)

  // Sync tariffs if facility changes
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      electricityTariffPerKWh: facility.electricityRatePerKWh,
      waterTariffPerKL: facility.waterRatePerKL,
    }))
  }, [facility])

  // Run initial simulation
  useEffect(() => {
    runSimulation()
  }, [params.electricityReductionPct, params.waterLeakReductionPct, params.peakShiftHours, facility])

  const runSimulation = async () => {
    const res = await onSimulate(params)
    if (res) setResult(res)
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
          <Sliders size={18} color="#06b6d4" />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
            Operational Intervention Scenario Simulation
          </h2>
        </div>

        <button
          onClick={runSimulation}
          disabled={isSimulating}
          className="btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          <RefreshCw size={13} className={isSimulating ? 'animate-spin' : ''} />
          <span>Recalculate Projections</span>
        </button>
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.4 }}>
        Model potential operational adjustments against the 30-day baseline. Modify levers below to observe
        deterministic before-and-after financial savings, carbon abatement, and empirical uncertainty bands.
      </p>

      {/* Main Grid: Controls on Left, Side-by-Side Results on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {/* Left Column: Interactive Levers */}
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
          }}
        >
          <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff', textTransform: 'uppercase' }}>
            Scenario Control Levers
          </h3>

          {/* Lever 1: Electricity Reduction */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>HVAC & Chiller Setpoint Reduction:</span>
              <strong className="tabular-nums" style={{ color: '#10b981' }}>
                {params.electricityReductionPct}%
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              value={params.electricityReductionPct}
              onChange={(e) => setParams({ ...params, electricityReductionPct: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#10b981', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>0% (Status Quo)</span>
              <span>40% (Aggressive Setback)</span>
            </div>
          </div>

          {/* Lever 2: Water Leak Elimination */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Process Water Recovery / Leak Isolation:</span>
              <strong className="tabular-nums" style={{ color: '#06b6d4' }}>
                {params.waterLeakReductionPct}%
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              step="5"
              value={params.waterLeakReductionPct}
              onChange={(e) => setParams({ ...params, waterLeakReductionPct: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#06b6d4', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>0% (Unmitigated)</span>
              <span>60% (Zero Bypass Leakage)</span>
            </div>
          </div>

          {/* Lever 3: Peak Load Shifting */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Peak Demand Shifting:</span>
              <strong className="tabular-nums" style={{ color: '#fbbf24' }}>
                {params.peakShiftHours} Hours Shifted
              </strong>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={params.peakShiftHours}
              onChange={(e) => setParams({ ...params, peakShiftHours: Number(e.target.value) })}
              style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>0h (Standard Tariffs)</span>
              <span>6h (Thermal Storage Pre-cooling)</span>
            </div>
          </div>

          {/* Editable Tariffs */}
          <div
            style={{
              paddingTop: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '10px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Electricity Tariff ($/kWh)
              </label>
              <input
                type="number"
                step="0.005"
                min="0.05"
                max="0.5"
                value={params.electricityTariffPerKWh}
                onChange={(e) => setParams({ ...params, electricityTariffPerKWh: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '6px 8px',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                Water Tariff ($/kL)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="10.0"
                value={params.waterTariffPerKL}
                onChange={(e) => setParams({ ...params, waterTariffPerKL: Number(e.target.value) })}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#ffffff',
                  padding: '6px 8px',
                  fontSize: '12px',
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Side-by-Side Projections & Impacts */}
        {result && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Side-by-Side Cost Comparison */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <div
                className="glass-card"
                style={{
                  padding: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.02)',
                }}
              >
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Current Monthly Baseline
                </span>
                <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#94a3b8', marginTop: '4px' }}>
                  ${result.baselineCostMonthly.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Unmitigated 30-day operating cost
                </div>
              </div>

              <div
                className="glass-card"
                style={{
                  padding: '14px',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  background: 'rgba(16, 185, 129, 0.08)',
                }}
              >
                <span style={{ fontSize: '11px', color: '#34d399', textTransform: 'uppercase' }}>
                  Projected Optimized Spend
                </span>
                <div className="tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  ${result.projectedCostMonthly.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '4px' }}>
                  -${result.monthlySavingsDollars.toLocaleString()}/mo yield (
                  {(((result.baselineCostMonthly - result.projectedCostMonthly) / (result.baselineCostMonthly || 1)) * 100).toFixed(1)}% reduction)
                </div>
              </div>
            </div>

            {/* Impact Highlights Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '10px',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '11px',
              }}
            >
              <div>
                <div style={{ color: 'var(--text-muted)' }}>Annual Cost Savings</div>
                <strong className="tabular-nums" style={{ fontSize: '15px', color: '#38bdf8' }}>
                  ${result.annualSavingsDollars.toLocaleString()}/yr
                </strong>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)' }}>Carbon Abated</div>
                <strong className="tabular-nums" style={{ fontSize: '15px', color: '#34d399' }}>
                  {result.carbonReductionMetricTons} MT CO₂e/mo
                </strong>
              </div>

              <div>
                <div style={{ color: 'var(--text-muted)' }}>Est. Payback Timeline</div>
                <strong className="tabular-nums" style={{ fontSize: '15px', color: '#fbbf24' }}>
                  {result.roiMonths} Months
                </strong>
              </div>
            </div>

            {/* Confidence Band & Formulas */}
            <div
              className="glass-card"
              style={{
                padding: '12px 14px',
                fontSize: '11px',
                background: 'rgba(0, 0, 0, 0.35)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 700, color: '#cbd5e1' }}>Empirical Confidence Band (±6%):</span>
                <span className="tabular-nums" style={{ color: '#10b981', fontWeight: 700 }}>
                  ${result.confidenceBand.min.toLocaleString()} – ${result.confidenceBand.max.toLocaleString()} /mo
                </span>
              </div>

              <div style={{ color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {result.formulaNotes.map((note, i) => (
                  <div key={i} style={{ marginBottom: '2px', fontFamily: 'var(--font-mono)' }}>
                    • {note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
