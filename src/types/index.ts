/**
 * ImpactOps AI Core Data Types & Schemas
 * Enterprise Sustainable Operations Intelligence System
 */

export type ResourceType = 'electricity' | 'water' | 'waste'

export interface Facility {
  id: string
  name: string
  code: string
  location: string
  type: string
  squareFeet: number
  baselinePowerKW: number
  baselineWaterKLPerDay: number
  description: string
  carbonGridFactorKgPerKWh: number // EPA eGRID regional emission factor
  electricityRatePerKWh: number
  waterRatePerKL: number
  wasteRatePerTon: number
}

export interface TelemetryPoint {
  timestamp: string
  hour: number
  day: string
  electricityKWh: number
  waterKL: number
  wasteTons: number
  costDollars: number
  carbonKgCO2e: number
  isPeakHour: boolean
  isOffHours: boolean
  isAnomaly?: boolean
  baselineElectricityKWh: number
  baselineWaterKL: number
}

export interface AnomalyEvidence {
  zScore: number
  sampleSize: number
  offHoursRatio: number
  metricUnit: string
  confidenceScore: number // 0-100
  dataWindowStart: string
  dataWindowEnd: string
  observedPatterns: string[]
}

export interface Anomaly {
  id: string
  facilityId: string
  title: string
  resourceType: ResourceType
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  detectedAt: string
  durationHours: number
  baselineValue: number
  actualValue: number
  deviationPercent: number
  estimatedAvoidableCostPerWeek: number
  description: string
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED'
  evidence: AnomalyEvidence
}

export interface RootCauseHypothesis {
  cause: string
  probability: number // 0-1
  rationale: string
  evidenceSupport: string
}

export interface CalculationBreakdown {
  formula: string
  assumptions: string[]
  variables: Record<string, number | string>
}

export interface InterventionPlan {
  id: string
  anomalyId: string
  title: string
  category: 'EQUIPMENT_SCHEDULE' | 'LEAK_ISOLATION' | 'PEAK_SHAVING' | 'MAINTENANCE_WORK_ORDER'
  urgency: 'P1_IMMEDIATE' | 'P2_HIGH' | 'P3_MEDIUM'
  implementationEffort: 'LOW' | 'MEDIUM' | 'HIGH'
  estimatedCostToImplement: number
  estimatedMonthlySavingsDollars: number
  estimatedAnnualSavingsDollars: number
  estimatedResourceSavings: {
    value: number
    unit: string
  }
  estimatedCarbonAvoidedKgPerMonth: number
  paybackPeriodDays: number
  confidenceLevel: number // 0-100
  calculationBreakdown: CalculationBreakdown
  status: 'PROPOSED' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  humanApproval?: {
    approvedAt?: string
    operator?: string
    notes?: string
    authorizationCode?: string
  }
}

export interface InvestigationReport {
  anomalyId: string
  facilityId: string
  generatedAt: string
  engineSource: 'google_gemini_flash' | 'deterministic_rule_engine'
  modelIdentifier?: string
  executiveSummary: string
  rootCauses: RootCauseHypothesis[]
  calculations: {
    baselineConsumption: number
    actualConsumption: number
    netOverconsumption: number
    unit: string
    tariffRate: number
    totalAvoidableCost: number
    carbonIntensityFactor: number
    totalCarbonExcessKg: number
    formulaUsed: string
  }
  recommendedInterventions: InterventionPlan[]
  risks: string[]
  verificationSteps: string[]
}

export interface ScenarioParameters {
  electricityReductionPct: number
  waterLeakReductionPct: number
  peakShiftHours: number
  electricityTariffPerKWh: number
  waterTariffPerKL: number
}

export interface ScenarioResult {
  baselineCostMonthly: number
  projectedCostMonthly: number
  monthlySavingsDollars: number
  annualSavingsDollars: number
  carbonReductionMetricTons: number
  confidenceBand: {
    min: number
    max: number
  }
  roiMonths: number
  formulaNotes: string[]
}

export interface FacilityAggregates {
  totalElectricityKWh: number
  totalWaterKL: number
  totalWasteTons: number
  totalCostDollars: number
  totalAvoidableCostDollars: number
  totalCarbonKgCO2e: number
  baselineComparisonPercent: number
  sustainabilityIndexScore: number // 0 - 100
  anomalyCount: number
}

export type AuditEventType =
  | 'ANOMALY_DETECTED'
  | 'INVESTIGATION_INITIATED'
  | 'INVESTIGATION_COMPLETED'
  | 'SIMULATION_EXECUTED'
  | 'PLAN_APPROVED'
  | 'PLAN_REJECTED'
  | 'PLAN_COMPLETED'

export interface AuditEvent {
  id: string
  timestamp: string
  eventType: AuditEventType
  facilityId: string
  actor: string
  details: string
  parameters: Record<string, any>
  digest: string
}
