import React from 'react'
import { FacilityAggregates, Facility } from '../types'
import { Zap, Droplets, DollarSign, Leaf, Gauge, ArrowUpRight, ArrowDownRight, HelpCircle } from 'lucide-react'

interface MetricCardsProps {
  aggregates: FacilityAggregates
  facility: Facility
}

export const MetricCards: React.FC<MetricCardsProps> = ({ aggregates, facility }) => {
  const isOverBaseline = aggregates.baselineComparisonPercent > 0

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        margin: '0 24px 20px 24px',
      }}
    >
      {/* 1. Electricity Card */}
      <div className="glass-panel" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Electricity Load
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(6, 182, 212, 0.12)',
              border: '1px solid rgba(6, 182, 212, 0.25)',
            }}
          >
            <Zap size={16} color="#06b6d4" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
            {aggregates.totalElectricityKWh.toLocaleString()}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>kWh</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Baseline Variance</span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              fontWeight: 700,
              color: isOverBaseline ? '#f59e0b' : '#10b981',
            }}
          >
            {isOverBaseline ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(aggregates.baselineComparisonPercent)}% vs model
          </span>
        </div>
      </div>

      {/* 2. Water Usage Card */}
      <div className="glass-panel" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Water Consumption
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
            }}
          >
            <Droplets size={16} color="#38bdf8" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
            {aggregates.totalWaterKL.toLocaleString()}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>kL (m³)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Water Cost</span>
          <span className="tabular-nums" style={{ fontWeight: 600, color: '#ffffff' }}>
            ${(aggregates.totalWaterKL * facility.waterRatePerKL).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      {/* 3. Avoidable Waste Cost Card (CRITICAL) */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 20px',
          border: aggregates.totalAvoidableCostDollars > 0 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
          background: aggregates.totalAvoidableCostDollars > 0 ? 'rgba(30, 24, 15, 0.75)' : 'var(--bg-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase' }}>
              Avoidable Waste Cost
            </span>
          </div>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <DollarSign size={16} color="#f59e0b" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: '#fbbf24' }}>
            ${aggregates.totalAvoidableCostDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 7 days</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Annualized Run-rate</span>
          <span className="tabular-nums" style={{ fontWeight: 700, color: '#fb7185' }}>
            ${Math.round(aggregates.totalAvoidableCostDollars * 52).toLocaleString()}/yr
          </span>
        </div>
      </div>

      {/* 4. Carbon Footprint Abatement */}
      <div className="glass-panel" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Carbon Footprint
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <Leaf size={16} color="#10b981" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
          <span className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: '#ffffff' }}>
            {(aggregates.totalCarbonKgCO2e / 1000).toFixed(1)}
          </span>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Metric Tons CO₂e</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>EPA Grid Factor</span>
          <span className="tabular-nums" style={{ fontWeight: 600, color: '#34d399' }}>
            {facility.carbonGridFactorKgPerKWh} kg/kWh
          </span>
        </div>
      </div>

      {/* 5. Sustainability Performance Index */}
      <div className="glass-panel" style={{ padding: '18px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            Sustainability Index
          </span>
          <div
            style={{
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
            }}
          >
            <Gauge size={16} color="#10b981" />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
          <span className="tabular-nums" style={{ fontSize: '24px', fontWeight: 800, color: '#10b981' }}>
            {aggregates.sustainabilityIndexScore}
          </span>
          <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ 100</span>
          <span
            className={
              aggregates.sustainabilityIndexScore >= 80
                ? 'badge badge-emerald'
                : aggregates.sustainabilityIndexScore >= 60
                ? 'badge badge-amber'
                : 'badge badge-rose'
            }
            style={{ marginLeft: 'auto', fontSize: '10px' }}
          >
            {aggregates.sustainabilityIndexScore >= 80 ? 'Optimal' : 'Needs Optimization'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Cost Incurred</span>
          <span className="tabular-nums" style={{ fontWeight: 700, color: '#ffffff' }}>
            ${aggregates.totalCostDollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>
    </div>
  )
}
