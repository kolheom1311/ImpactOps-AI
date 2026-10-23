import { Facility, TelemetryPoint, Anomaly, AuditEvent } from '../types'

export const FACILITIES: Facility[] = [
  {
    id: 'fac-dc-north',
    name: 'North Data Center',
    code: 'NDC-01',
    location: 'Ashburn, VA',
    type: 'Hyperscale Computing & AI Cluster',
    squareFeet: 120000,
    baselinePowerKW: 1450,
    baselineWaterKLPerDay: 48,
    description: 'High-density GPU/CPU compute facility with closed-loop adiabatic chillers and 2N redundancy.',
    carbonGridFactorKgPerKWh: 0.365, // PJM Interconnection factor
    electricityRatePerKWh: 0.138,
    waterRatePerKL: 4.15,
    wasteRatePerTon: 92.0,
  },
  {
    id: 'fac-mfg-austin',
    name: 'Austin Advanced Manufacturing',
    code: 'AAM-04',
    location: 'Austin, TX',
    type: 'Semiconductor Cleanroom & Packaging',
    squareFeet: 240000,
    baselinePowerKW: 2850,
    baselineWaterKLPerDay: 320,
    description: 'ISO-Class 4 cleanroom fabrication line with ultra-pure water recycling and nitrogen delivery.',
    carbonGridFactorKgPerKWh: 0.412, // ERCOT grid factor
    electricityRatePerKWh: 0.145,
    waterRatePerKL: 4.5,
    wasteRatePerTon: 110.0,
  },
  {
    id: 'fac-hq-seattle',
    name: 'HQ Innovation Campus',
    code: 'SEA-HQ',
    location: 'Seattle, WA',
    type: 'Corporate Headquarters & R&D Labs',
    squareFeet: 360000,
    baselinePowerKW: 880,
    baselineWaterKLPerDay: 85,
    description: 'Multi-tenant high-efficiency office complex with dynamic VAV air handling and cafeteria composting.',
    carbonGridFactorKgPerKWh: 0.125, // Seattle City Light hydro-dominant grid
    electricityRatePerKWh: 0.112,
    waterRatePerKL: 3.9,
    wasteRatePerTon: 88.0,
  },
]

// Generate 7 days (168 hours) of realistic synthetic hourly telemetry
export function generateSyntheticTelemetry(facilityId: string): TelemetryPoint[] {
  const facility = FACILITIES.find((f) => f.id === facilityId) || FACILITIES[0]
  const points: TelemetryPoint[] = []

  const now = new Date('2026-10-23T12:00:00Z')
  const startTime = new Date(now.getTime() - 168 * 3600 * 1000)

  for (let i = 0; i < 168; i++) {
    const time = new Date(startTime.getTime() + i * 3600 * 1000)
    const hour = time.getUTCHours()
    const dayOfWeek = time.getUTCDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isPeakHour = hour >= 12 && hour <= 18 && !isWeekend
    const isOffHours = hour >= 22 || hour <= 5

    // Base diurnal profiles
    let powerMultiplier = 1.0
    if (facility.id === 'fac-dc-north') {
      // Data center: steady baseline with slight daytime thermal chiller lift
      powerMultiplier = 0.95 + Math.sin((hour / 24) * 2 * Math.PI - 1) * 0.12
    } else if (facility.id === 'fac-mfg-austin') {
      // Manufacturing: 3 shifts, weekend minor dip
      powerMultiplier = isWeekend ? 0.72 : 1.0 + (hour >= 8 && hour <= 20 ? 0.22 : -0.05)
    } else {
      // Office: high daytime occupancy, low nighttime
      powerMultiplier = isWeekend ? 0.35 : 0.4 + (hour >= 7 && hour <= 19 ? 0.65 : 0.05)
    }

    // Baseline calculation
    const baselineKWh = Math.round(facility.baselinePowerKW * powerMultiplier)
    const baselineWater = Number(
      ((facility.baselineWaterKLPerDay / 24) * (powerMultiplier * 0.8 + 0.2)).toFixed(2)
    )

    // Add normal stochastic variation (+/- 3%)
    const pseudoNoise = (Math.sin(i * 1.7) * 0.5 + Math.cos(i * 0.8) * 0.5) * 0.04
    let actualKWh = Math.round(baselineKWh * (1 + pseudoNoise))
    let actualWater = Number((baselineWater * (1 + pseudoNoise * 0.8)).toFixed(2))
    let isAnomaly = false

    // Inject identifiable real-world anomalies
    if (facility.id === 'fac-dc-north') {
      // Anomaly: Chiller VFD frequency stuck on high during overnight off-hours (Hours 120-144, 2-3 days ago)
      if (i >= 122 && i <= 140 && isOffHours) {
        actualKWh = Math.round(baselineKWh * 1.43) // +43% overnight spike
        isAnomaly = true
      }
    } else if (facility.id === 'fac-mfg-austin') {
      // Anomaly: Cleanroom RO Water bypass solenoid stuck open during weekend non-operational period (Hours 72-108)
      if (i >= 74 && i <= 104) {
        actualWater = Number((baselineWater + 18.2).toFixed(2)) // +18.2 kL/hr steady leak
        isAnomaly = true
      }
    } else if (facility.id === 'fac-hq-seattle') {
      // Anomaly: Floor 4 AHU Schedule override running cooling/heating simultaneously at night (Hours 140-164)
      if (i >= 142 && i <= 166 && isOffHours) {
        actualKWh = Math.round(baselineKWh * 1.85) // +85% off-hours HVAC run
        isAnomaly = true
      }
    }

    // Tariff rates: peak hours have 1.8x demand charge
    const effectiveElectricityRate = isPeakHour
      ? facility.electricityRatePerKWh * 1.8
      : facility.electricityRatePerKWh
    const costDollars = Number(
      (actualKWh * effectiveElectricityRate + actualWater * facility.waterRatePerKL).toFixed(2)
    )

    // Carbon emissions (kg CO2e)
    const carbonKgCO2e = Number(
      (
        actualKWh * facility.carbonGridFactorKgPerKWh +
        actualWater * 0.298 // municipal water distribution factor
      ).toFixed(2)
    )

    // Waste metric tons (hourly share)
    const wasteTons = Number(
      (
        (facility.squareFeet / 100000) *
        0.008 *
        (isWeekend ? 0.2 : hour >= 8 && hour <= 18 ? 1.5 : 0.3)
      ).toFixed(3)
    )

    points.push({
      timestamp: time.toISOString(),
      hour,
      day: time.toISOString().split('T')[0],
      electricityKWh: actualKWh,
      waterKL: actualWater,
      wasteTons,
      costDollars,
      carbonKgCO2e,
      isPeakHour,
      isOffHours,
      isAnomaly,
      baselineElectricityKWh: baselineKWh,
      baselineWaterKL: baselineWater,
    })
  }

  return points
}

// Injected anomalies with deterministic statistical parameters
export const SEEDED_ANOMALIES: Anomaly[] = [
  {
    id: 'anom-01',
    facilityId: 'fac-dc-north',
    title: 'Chiller Loop #3 VFD Controller Resonance Lockup',
    resourceType: 'electricity',
    severity: 'HIGH',
    detectedAt: '2026-10-22T04:15:00Z',
    durationHours: 18,
    baselineValue: 1380,
    actualValue: 1973,
    deviationPercent: 42.97,
    estimatedAvoidableCostPerWeek: 1845.5,
    description:
      'Chiller #3 variable frequency drive remained pinned at 60Hz during ambient wet-bulb drop (41°F). IT thermal load remained flat at 980 kW, indicating no physical cooling demand for full compressor staging.',
    status: 'ACTIVE',
    evidence: {
      zScore: 3.42,
      sampleSize: 168,
      offHoursRatio: 1.48,
      metricUnit: 'kWh/hr',
      confidenceScore: 96,
      dataWindowStart: '2026-10-16T12:00:00Z',
      dataWindowEnd: '2026-10-23T12:00:00Z',
      observedPatterns: [
        'Off-hours power draw exceeded baseline by +43.0% (p < 0.001)',
        'Server compute workload delta was +0.2% (thermal demand decoupled)',
        'Wet-bulb outdoor temperature dropped to 41°F without expected economizer transition',
      ],
    },
  },
  {
    id: 'anom-02',
    facilityId: 'fac-mfg-austin',
    title: 'Cleanroom RO Water System Bypass Solenoid Valve Leak',
    resourceType: 'water',
    severity: 'CRITICAL',
    detectedAt: '2026-10-21T02:30:00Z',
    durationHours: 32,
    baselineValue: 5.2,
    actualValue: 23.4,
    deviationPercent: 350.0,
    estimatedAvoidableCostPerWeek: 3120.0,
    description:
      'Continuous 18.2 kL/hr water baseline consumption persisted through non-operational shift windows. Flow meters downstream of Reverse Osmosis skid B indicate bypass valve stuck at 22% open port.',
    status: 'ACTIVE',
    evidence: {
      zScore: 4.88,
      sampleSize: 168,
      offHoursRatio: 4.5,
      metricUnit: 'kL/hr',
      confidenceScore: 99,
      dataWindowStart: '2026-10-16T12:00:00Z',
      dataWindowEnd: '2026-10-23T12:00:00Z',
      observedPatterns: [
        'Nighttime flow remained clamped at 23.4 kL/hr despite tool lines in standby',
        'Pressure differential across RO Membrane Skid B dropped by 1.8 bar',
        'Cumulative unaccounted water loss totaled 582.4 kL over 32 hours',
      ],
    },
  },
  {
    id: 'anom-03',
    facilityId: 'fac-hq-seattle',
    title: 'Zone 4 AHU Dual-Duct Simultaneous Heating & Cooling Override',
    resourceType: 'electricity',
    severity: 'MEDIUM',
    detectedAt: '2026-10-22T21:45:00Z',
    durationHours: 24,
    baselineValue: 390,
    actualValue: 721,
    deviationPercent: 84.87,
    estimatedAvoidableCostPerWeek: 924.3,
    description:
      'BACnet scheduler in Zone 4 (Floors 3-4 Executive Suites) placed in manual 24/7 OVERRIDE mode. Terminal box variable air volume reheaters and central chiller valves fighting each other.',
    status: 'ACTIVE',
    evidence: {
      zScore: 2.85,
      sampleSize: 168,
      offHoursRatio: 1.85,
      metricUnit: 'kWh/hr',
      confidenceScore: 92,
      dataWindowStart: '2026-10-16T12:00:00Z',
      dataWindowEnd: '2026-10-23T12:00:00Z',
      observedPatterns: [
        'Off-hours electrical power sustained at 721 kWh/hr vs 390 kWh/hr expected',
        'PIR occupancy sensors reported zero motion across 12 consecutive hours',
        'Mixed air temperature sensor oscillating +/- 9°F every 14 minutes',
      ],
    },
  },
]

// Pre-seeded audit history for enterprise traceability
export const INITIAL_AUDIT_LOGS: AuditEvent[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-21T02:30:15Z',
    eventType: 'ANOMALY_DETECTED',
    facilityId: 'fac-mfg-austin',
    actor: 'ImpactOps Autonomous Stream Monitor',
    details: 'Anomaly detected: Cleanroom RO Water System Bypass Valve Leak (+350.0% deviation, z=4.88).',
    parameters: { anomalyId: 'anom-02', metric: 'waterKL', zScore: 4.88, baseline: 5.2, observed: 23.4 },
    digest: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
  {
    id: 'aud-002',
    timestamp: '2026-10-22T04:15:22Z',
    eventType: 'ANOMALY_DETECTED',
    facilityId: 'fac-dc-north',
    actor: 'ImpactOps Autonomous Stream Monitor',
    details: 'Anomaly detected: Chiller Loop #3 VFD Resonance Lockup (+42.97% deviation, z=3.42).',
    parameters: { anomalyId: 'anom-01', metric: 'electricityKWh', zScore: 3.42, baseline: 1380, observed: 1973 },
    digest: 'a7c88b9e64e1c312891bf7d3496fb92427ae41e4649b934ca495991b7852b12a',
  },
  {
    id: 'aud-003',
    timestamp: '2026-10-22T21:45:08Z',
    eventType: 'ANOMALY_DETECTED',
    facilityId: 'fac-hq-seattle',
    actor: 'ImpactOps Autonomous Stream Monitor',
    details: 'Anomaly detected: Zone 4 AHU Dual-Duct Simultaneous Heating & Cooling (+84.87% deviation, z=2.85).',
    parameters: { anomalyId: 'anom-03', metric: 'electricityKWh', zScore: 2.85, baseline: 390, observed: 721 },
    digest: 'f1a943c220fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852c491',
  },
]
