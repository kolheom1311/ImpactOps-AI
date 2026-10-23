import React, { useState, useMemo } from 'react'
import { TelemetryPoint, Facility } from '../types'
import { Activity, AlertCircle, Info } from 'lucide-react'

interface TelemetryChartProps {
  telemetry: TelemetryPoint[]
  facility: Facility
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ telemetry, facility }) => {
  const [metricMode, setMetricMode] = useState<'electricity' | 'water' | 'cost'>('electricity')
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  // Extract values based on metric mode
  const { dataPoints, maxVal, minVal, unitLabel, metricTitle } = useMemo(() => {
    let pts: { actual: number; baseline: number; isAnomaly?: boolean; raw: TelemetryPoint }[] = []
    let max = 0
    let min = Infinity
    let unit = 'kWh'
    let title = 'Electricity Demand vs Baseline Model'

    if (metricMode === 'electricity') {
      unit = 'kWh'
      title = 'Hourly Electricity Load vs Dynamic Baseline Envelope'
      pts = telemetry.map((pt) => {
        max = Math.max(max, pt.electricityKWh, pt.baselineElectricityKWh)
        min = Math.min(min, pt.electricityKWh, pt.baselineElectricityKWh)
        return {
          actual: pt.electricityKWh,
          baseline: pt.baselineElectricityKWh,
          isAnomaly: pt.isAnomaly,
          raw: pt,
        }
      })
    } else if (metricMode === 'water') {
      unit = 'kL/hr'
      title = 'Water Flow Telemetry vs Standard Operating Profile'
      pts = telemetry.map((pt) => {
        max = Math.max(max, pt.waterKL, pt.baselineWaterKL)
        min = Math.min(min, pt.waterKL, pt.baselineWaterKL)
        return {
          actual: pt.waterKL,
          baseline: pt.baselineWaterKL,
          isAnomaly: pt.isAnomaly,
          raw: pt,
        }
      })
    } else {
      unit = 'USD ($)'
      title = 'Operational Energy & Resource Cost Accrual'
      pts = telemetry.map((pt) => {
        const baseCost = pt.baselineElectricityKWh * facility.electricityRatePerKWh
        max = Math.max(max, pt.costDollars, baseCost)
        min = Math.min(min, pt.costDollars, baseCost)
        return {
          actual: pt.costDollars,
          baseline: Number(baseCost.toFixed(2)),
          isAnomaly: pt.isAnomaly,
          raw: pt,
        }
      })
    }

    // Safety margins
    max = Math.ceil(max * 1.1)
    min = Math.max(0, Math.floor(min * 0.9))

    return { dataPoints: pts, maxVal: max, minVal: min, unitLabel: unit, metricTitle: title }
  }, [telemetry, metricMode, facility])

  // SVG Chart Geometry
  const width = 1000
  const height = 260
  const padLeft = 60
  const padRight = 30
  const padTop = 20
  const padBottom = 35

  const chartW = width - padLeft - padRight
  const chartH = height - padTop - padBottom

  // Coordinates helper
  const getX = (idx: number) => padLeft + (idx / Math.max(1, dataPoints.length - 1)) * chartW
  const getY = (val: number) => {
    const range = maxVal - minVal || 1
    return padTop + chartH - ((val - minVal) / range) * chartH
  }

  // Generate SVG path strings
  const actualPath = useMemo(() => {
    if (dataPoints.length === 0) return ''
    return dataPoints
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.actual).toFixed(1)}`)
      .join(' ')
  }, [dataPoints, maxVal, minVal])

  const baselinePath = useMemo(() => {
    if (dataPoints.length === 0) return ''
    return dataPoints
      .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)} ${getY(pt.baseline).toFixed(1)}`)
      .join(' ')
  }, [dataPoints, maxVal, minVal])

  const activeHoverPt = hoverIndex !== null ? dataPoints[hoverIndex] : null

  return (
    <div className="glass-panel" style={{ margin: '0 24px 20px 24px', padding: '20px 24px' }}>
      {/* Header & Controls */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Activity size={18} color="#10b981" />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>{metricTitle}</h2>
          <span className="badge badge-slate" style={{ fontSize: '10px' }}>
            168 Hourly Telemetry Points
          </span>
        </div>

        {/* Metric Mode Switcher */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '8px',
            padding: '3px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <button
            onClick={() => setMetricMode('electricity')}
            style={{
              background: metricMode === 'electricity' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              color: metricMode === 'electricity' ? '#34d399' : 'var(--text-secondary)',
              border: metricMode === 'electricity' ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Electricity (kWh)
          </button>
          <button
            onClick={() => setMetricMode('water')}
            style={{
              background: metricMode === 'water' ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
              color: metricMode === 'water' ? '#38bdf8' : 'var(--text-secondary)',
              border: metricMode === 'water' ? '1px solid rgba(6, 182, 212, 0.4)' : 'none',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Water (kL)
          </button>
          <button
            onClick={() => setMetricMode('cost')}
            style={{
              background: metricMode === 'cost' ? 'rgba(245, 158, 11, 0.2)' : 'transparent',
              color: metricMode === 'cost' ? '#fbbf24' : 'var(--text-secondary)',
              border: metricMode === 'cost' ? '1px solid rgba(245, 158, 11, 0.4)' : 'none',
              borderRadius: '6px',
              padding: '5px 12px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Cost ($)
          </button>
        </div>
      </div>

      {/* SVG Chart */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: '100%', height: 'auto', display: 'block', minWidth: '600px' }}
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = padTop + chartH * (1 - pct)
            const val = minVal + (maxVal - minVal) * pct
            return (
              <g key={idx}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="rgba(255, 255, 255, 0.05)"
                  strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  fill="var(--text-muted)"
                  fontSize="10"
                  textAnchor="end"
                  fontFamily="var(--font-mono)"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toFixed(0)}
                </text>
              </g>
            )
          })}

          {/* Baseline Curve (Dashed Cyan) */}
          <path
            d={baselinePath}
            fill="none"
            stroke="rgba(6, 182, 212, 0.45)"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />

          {/* Actual Consumption Curve (Solid Emerald) */}
          <path
            d={actualPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Anomaly Highlight Markers */}
          {dataPoints.map((pt, i) => {
            if (!pt.isAnomaly) return null
            const cx = getX(i)
            const cy = getY(pt.actual)
            return (
              <g key={`anom-${i}`}>
                <circle cx={cx} cy={cy} r="7" fill="rgba(245, 158, 11, 0.25)" className="pulse-beacon" />
                <circle cx={cx} cy={cy} r="4" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            )
          })}

          {/* Interactive Mouse Hover Crosshair */}
          {hoverIndex !== null && (
            <g>
              <line
                x1={getX(hoverIndex)}
                y1={padTop}
                x2={getX(hoverIndex)}
                y2={padTop + chartH}
                stroke="rgba(255, 255, 255, 0.3)"
                strokeDasharray="2 2"
              />
              <circle
                cx={getX(hoverIndex)}
                cy={getY(dataPoints[hoverIndex].actual)}
                r="5"
                fill="#ffffff"
                stroke="#10b981"
                strokeWidth="2"
              />
            </g>
          )}

          {/* Invisible hover collision bands */}
          {dataPoints.map((_, i) => (
            <rect
              key={`band-${i}`}
              x={getX(i) - (chartW / dataPoints.length) / 2}
              y={padTop}
              width={chartW / dataPoints.length}
              height={chartH}
              fill="transparent"
              style={{ cursor: 'crosshair' }}
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}

          {/* X Axis Day Labels */}
          {[0, 24, 48, 72, 96, 120, 144, 167].map((hrIndex) => {
            if (hrIndex >= dataPoints.length) return null
            const pt = dataPoints[hrIndex].raw
            return (
              <text
                key={hrIndex}
                x={getX(hrIndex)}
                y={height - 10}
                fill="var(--text-muted)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="var(--font-mono)"
              >
                Day {Math.floor(hrIndex / 24) + 1} ({pt.hour}:00)
              </text>
            )
          })}
        </svg>

        {/* Hover Floating Details Card */}
        {activeHoverPt && hoverIndex !== null && (
          <div
            style={{
              position: 'absolute',
              top: '10px',
              right: '20px',
              background: 'rgba(11, 19, 33, 0.92)',
              border: '1px solid var(--border-medium)',
              borderRadius: '8px',
              padding: '10px 14px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
              fontSize: '12px',
              zIndex: 10,
              minWidth: '220px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: '#ffffff' }}>
                Hour {activeHoverPt.raw.hour}:00 • {activeHoverPt.raw.day}
              </span>
              {activeHoverPt.isAnomaly && (
                <span className="badge badge-amber" style={{ fontSize: '9px' }}>
                  Anomaly
                </span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Actual:</span>
              <strong className="tabular-nums" style={{ color: '#10b981' }}>
                {activeHoverPt.actual.toLocaleString()} {unitLabel}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Baseline:</span>
              <strong className="tabular-nums" style={{ color: '#38bdf8' }}>
                {activeHoverPt.baseline.toLocaleString()} {unitLabel}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Variance:</span>
              <strong
                className="tabular-nums"
                style={{
                  color: activeHoverPt.actual > activeHoverPt.baseline ? '#f59e0b' : '#34d399',
                }}
              >
                {(
                  ((activeHoverPt.actual - activeHoverPt.baseline) / (activeHoverPt.baseline || 1)) *
                  100
                ).toFixed(1)}
                %
              </strong>
            </div>
            <div
              style={{
                marginTop: '4px',
                paddingTop: '4px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ color: 'var(--text-muted)' }}>Estimated Cost:</span>
              <strong className="tabular-nums" style={{ color: '#ffffff' }}>
                ${activeHoverPt.raw.costDollars.toFixed(2)}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Legend & Transparent Math Annotation */}
      <div
        style={{
          marginTop: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '3px', background: '#10b981', borderRadius: '2px' }} />
            <span>Actual Telemetry Stream</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '12px',
                height: '0px',
                borderTop: '2px dashed #06b6d4',
              }}
            />
            <span>Dynamic Operational Baseline Envelope</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f59e0b',
                display: 'inline-block',
              }}
            />
            <span>Statistical Outlier / Anomaly Spike</span>
          </div>
        </div>

        <div>
          <span>Peak Demand Window: 12:00 – 18:00 Local (1.8× Demand Surcharge Enforced)</span>
        </div>
      </div>
    </div>
  )
}
