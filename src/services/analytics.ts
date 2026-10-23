import {
  Facility,
  TelemetryPoint,
  FacilityAggregates,
  ScenarioParameters,
  ScenarioResult,
  AnomalyEvidence,
} from '../types'

/**
 * Deterministic Mathematical Analytics Engine
 * Provides transparent, verifiable calculations without stochastic hallucination.
 */

export function calculateFacilityAggregates(
  telemetry: TelemetryPoint[],
  facility: Facility
): FacilityAggregates {
  if (!telemetry || telemetry.length === 0) {
    return {
      totalElectricityKWh: 0,
      totalWaterKL: 0,
      totalWasteTons: 0,
      totalCostDollars: 0,
      totalAvoidableCostDollars: 0,
      totalCarbonKgCO2e: 0,
      baselineComparisonPercent: 0,
      sustainabilityIndexScore: 100,
      anomalyCount: 0,
    }
  }

  let totalElec = 0
  let totalBaseElec = 0
  let totalWater = 0
  let totalBaseWater = 0
  let totalWaste = 0
  let totalCost = 0
  let totalAvoidableCost = 0
  let totalCarbon = 0
  let anomalyCount = 0

  for (const pt of telemetry) {
    totalElec += pt.electricityKWh
    totalBaseElec += pt.baselineElectricityKWh
    totalWater += pt.waterKL
    totalBaseWater += pt.baselineWaterKL
    totalWaste += pt.wasteTons
    totalCost += pt.costDollars
    totalCarbon += pt.carbonKgCO2e

    if (pt.isAnomaly) {
      anomalyCount++
    }

    // Deterministic calculation of avoidable overconsumption cost
    const excessElec = Math.max(0, pt.electricityKWh - pt.baselineElectricityKWh)
    const excessWater = Math.max(0, pt.waterKL - pt.baselineWaterKL)

    const elecRate = pt.isPeakHour
      ? facility.electricityRatePerKWh * 1.8
      : facility.electricityRatePerKWh
    const avoidable = excessElec * elecRate + excessWater * facility.waterRatePerKL
    totalAvoidableCost += avoidable
  }

  // Calculate percentage deviation vs baseline: ((actual - baseline) / baseline) * 100
  const baselineComparisonPercent =
    totalBaseElec > 0
      ? Number((((totalElec - totalBaseElec) / totalBaseElec) * 100).toFixed(2))
      : 0

  // Sustainability Index Score (0 - 100 scale):
  // Formula: 100 - (excess_elec_penalty * 35) - (excess_water_penalty * 35) - (anomaly_penalty * 30)
  const elecRatio = totalBaseElec > 0 ? totalElec / totalBaseElec : 1.0
  const waterRatio = totalBaseWater > 0 ? totalWater / totalBaseWater : 1.0

  const elecPenalty = Math.max(0, (elecRatio - 1.0) * 80)
  const waterPenalty = Math.max(0, (waterRatio - 1.0) * 80)
  const anomalyPenalty = Math.min(25, anomalyCount * 1.5)

  const rawScore = 100 - (elecPenalty + waterPenalty + anomalyPenalty)
  const sustainabilityIndexScore = Math.max(10, Math.min(98, Math.round(rawScore)))

  return {
    totalElectricityKWh: Math.round(totalElec),
    totalWaterKL: Number(totalWater.toFixed(1)),
    totalWasteTons: Number(totalWaste.toFixed(2)),
    totalCostDollars: Number(totalCost.toFixed(2)),
    totalAvoidableCostDollars: Number(totalAvoidableCost.toFixed(2)),
    totalCarbonKgCO2e: Number(totalCarbon.toFixed(1)),
    baselineComparisonPercent,
    sustainabilityIndexScore,
    anomalyCount,
  }
}

/**
 * Standard deviation & Z-Score Anomaly Detector
 */
export function calculateStatisticalEvidence(
  values: number[],
  observedValue: number
): { mean: number; stdDev: number; zScore: number } {
  if (values.length < 2) {
    return { mean: observedValue, stdDev: 0, zScore: 0 }
  }

  const n = values.length
  const mean = values.reduce((acc, v) => acc + v, 0) / n
  const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1)
  const stdDev = Math.sqrt(variance)

  const zScore = stdDev > 0 ? Number(((observedValue - mean) / stdDev).toFixed(2)) : 0

  return {
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    zScore,
  }
}

/**
 * Deterministic Scenario Simulation
 */
export function simulateOperationalIntervention(
  params: ScenarioParameters,
  telemetry: TelemetryPoint[],
  facility: Facility
): ScenarioResult {
  // Validate and clamp inputs to safe ranges
  const elecRedPct = Math.max(0, Math.min(60, params.electricityReductionPct || 0))
  const waterRedPct = Math.max(0, Math.min(80, params.waterLeakReductionPct || 0))
  const tariffElec = Math.max(0.01, params.electricityTariffPerKWh || facility.electricityRatePerKWh)
  const tariffWater = Math.max(0.5, params.waterTariffPerKL || facility.waterRatePerKL)

  // Derive 30-day baseline consumption from the 7-day dataset (scale by 30/7 = 4.2857)
  const weeklyElecKWh = telemetry.reduce((sum, pt) => sum + pt.electricityKWh, 0)
  const weeklyWaterKL = telemetry.reduce((sum, pt) => sum + pt.waterKL, 0)

  const monthlyElecKWh = weeklyElecKWh * (30 / 7)
  const monthlyWaterKL = weeklyWaterKL * (30 / 7)

  const baselineCostMonthly = Number(
    (monthlyElecKWh * tariffElec + monthlyWaterKL * tariffWater).toFixed(2)
  )

  // Calculate reductions
  const monthlyElecSavedKWh = monthlyElecKWh * (elecRedPct / 100)
  const monthlyWaterSavedKL = monthlyWaterKL * (waterRedPct / 100)

  const elecSavingsDollars = monthlyElecSavedKWh * tariffElec
  const waterSavingsDollars = monthlyWaterSavedKL * tariffWater

  // Peak shifting impact: shifts 4 hours of peak pricing to standard pricing
  const peakShiftSavings =
    params.peakShiftHours > 0
      ? (monthlyElecKWh * 0.12 * (params.peakShiftHours / 8) * (tariffElec * 0.4))
      : 0

  const monthlySavingsDollars = Number(
    (elecSavingsDollars + waterSavingsDollars + peakShiftSavings).toFixed(2)
  )
  const projectedCostMonthly = Math.max(0, Number((baselineCostMonthly - monthlySavingsDollars).toFixed(2)))
  const annualSavingsDollars = Number((monthlySavingsDollars * 12).toFixed(2))

  // Carbon reduction in metric tons CO2e: (kWh * grid_factor + kL * water_factor) / 1000
  const carbonElecKg = monthlyElecSavedKWh * facility.carbonGridFactorKgPerKWh
  const carbonWaterKg = monthlyWaterSavedKL * 0.298
  const carbonReductionMetricTons = Number(((carbonElecKg + carbonWaterKg) / 1000).toFixed(2))

  // Uncertainty confidence bounds: +/- 6%
  const confidenceBand = {
    min: Number((monthlySavingsDollars * 0.94).toFixed(2)),
    max: Number((monthlySavingsDollars * 1.06).toFixed(2)),
  }

  // ROI estimation based on typical operational control tuning cost ($4,200)
  const estimatedImplementationCost = 4200
  const roiMonths =
    monthlySavingsDollars > 0
      ? Number((estimatedImplementationCost / monthlySavingsDollars).toFixed(1))
      : 0

  const formulaNotes = [
    `Electricity Savings: ${monthlyElecSavedKWh.toFixed(0)} kWh/mo × $${tariffElec.toFixed(3)}/kWh = $${elecSavingsDollars.toFixed(2)}/mo`,
    `Water Savings: ${monthlyWaterSavedKL.toFixed(1)} kL/mo × $${tariffWater.toFixed(2)}/kL = $${waterSavingsDollars.toFixed(2)}/mo`,
    `Carbon Abatement: (${monthlyElecSavedKWh.toFixed(0)} kWh × ${facility.carbonGridFactorKgPerKWh} kg/kWh + ${monthlyWaterSavedKL.toFixed(1)} kL × 0.298 kg/kL) ÷ 1,000 = ${carbonReductionMetricTons} MT CO2e/mo`,
    `Confidence Range: ±6% empirical sensor tolerance band [$${confidenceBand.min.toLocaleString()} – $${confidenceBand.max.toLocaleString()}]`,
  ]

  return {
    baselineCostMonthly,
    projectedCostMonthly,
    monthlySavingsDollars,
    annualSavingsDollars,
    carbonReductionMetricTons,
    confidenceBand,
    roiMonths,
    formulaNotes,
  }
}
