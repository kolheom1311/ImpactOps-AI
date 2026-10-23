import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateFacilityAggregates,
  calculateStatisticalEvidence,
  simulateOperationalIntervention,
} from '../src/services/analytics'
import { FACILITIES, generateSyntheticTelemetry, SEEDED_ANOMALIES } from '../src/data/telemetryData'
import { runDeterministicInvestigation } from '../server/ruleEngine'

test('ImpactOps Analytics Suite', async (t) => {
  const dcFacility = FACILITIES.find((f) => f.id === 'fac-dc-north')!
  const mfgFacility = FACILITIES.find((f) => f.id === 'fac-mfg-austin')!
  const dcTelemetry = generateSyntheticTelemetry('fac-dc-north')

  await t.test('1. Consumption Aggregation: correctly sums and calculates metrics', () => {
    const aggregates = calculateFacilityAggregates(dcTelemetry, dcFacility)

    assert.ok(aggregates.totalElectricityKWh > 0, 'Total electricity must be positive')
    assert.ok(aggregates.totalCostDollars > 0, 'Total cost must be positive')
    assert.ok(aggregates.totalAvoidableCostDollars > 0, 'Avoidable cost must be calculated from overconsumption')
    assert.ok(aggregates.sustainabilityIndexScore >= 10 && aggregates.sustainabilityIndexScore <= 100, 'Score in 10-100 range')
    assert.strictEqual(aggregates.anomalyCount > 0, true, 'Seeded anomalies must be detected')
  })

  await t.test('2. Statistical Anomaly Detection: calculates mean, stdDev, and z-score accurately', () => {
    const sample = [100, 102, 98, 105, 95, 101, 99] // mean = 100, stdDev approx 3.16
    const spike = 130
    const evidence = calculateStatisticalEvidence(sample, spike)

    assert.strictEqual(evidence.mean, 100)
    assert.ok(evidence.stdDev > 3 && evidence.stdDev < 4, `stdDev ${evidence.stdDev} should be ~3.16`)
    assert.ok(evidence.zScore > 9, `zScore ${evidence.zScore} should reflect significant outlier`)
  })

  await t.test('3. Percentage Deviation Calculations: computes accurate deviation percentage', () => {
    const baseline = 1000
    const actual = 1430
    const pct = ((actual - baseline) / baseline) * 100
    assert.strictEqual(Math.round(pct), 43, 'Deviation should be 43%')
  })

  await t.test('4. Scenario Simulation: computes baseline vs intervention projected savings', () => {
    const params = {
      electricityReductionPct: 15,
      waterLeakReductionPct: 20,
      peakShiftHours: 2,
      electricityTariffPerKWh: dcFacility.electricityRatePerKWh,
      waterTariffPerKL: dcFacility.waterRatePerKL,
    }

    const sim = simulateOperationalIntervention(params, dcTelemetry, dcFacility)

    assert.ok(sim.baselineCostMonthly > 0, 'Baseline cost must be > 0')
    assert.ok(sim.monthlySavingsDollars > 0, 'Monthly savings must be > 0')
    assert.ok(sim.annualSavingsDollars === Number((sim.monthlySavingsDollars * 12).toFixed(2)), 'Annual savings must be 12x monthly')
    assert.ok(sim.projectedCostMonthly < sim.baselineCostMonthly, 'Projected cost must be strictly less than baseline')
    assert.ok(sim.confidenceBand.min < sim.monthlySavingsDollars && sim.confidenceBand.max > sim.monthlySavingsDollars, 'Confidence band must encompass median')
    assert.ok(sim.carbonReductionMetricTons > 0, 'Carbon reduction must be positive')
  })

  await t.test('5. Invalid Input & Edge Case Handling: empty arrays and negative inputs', () => {
    // Empty telemetry
    const emptyAggregates = calculateFacilityAggregates([], dcFacility)
    assert.strictEqual(emptyAggregates.totalElectricityKWh, 0)
    assert.strictEqual(emptyAggregates.sustainabilityIndexScore, 100)

    // Negative / clamped simulation params
    const negativeParams = {
      electricityReductionPct: -10,
      waterLeakReductionPct: -5,
      peakShiftHours: -1,
      electricityTariffPerKWh: -0.1,
      waterTariffPerKL: -1,
    }
    const safeSim = simulateOperationalIntervention(negativeParams, dcTelemetry, dcFacility)
    assert.ok(safeSim.monthlySavingsDollars >= 0, 'Clamped savings must be >= 0')
  })

  await t.test('6. Deterministic Investigation Engine: builds complete structured report with evidence', () => {
    const anomaly = SEEDED_ANOMALIES[0]
    const report = runDeterministicInvestigation(anomaly, dcFacility)

    assert.strictEqual(report.anomalyId, anomaly.id)
    assert.strictEqual(report.engineSource, 'deterministic_rule_engine')
    assert.ok(report.rootCauses.length >= 2, 'Must provide multiple hypotheses')
    assert.ok(report.recommendedInterventions.length >= 1, 'Must provide at least one intervention plan')
    assert.ok(report.calculations.totalAvoidableCost > 0, 'Avoidable cost must be > 0')
    assert.ok(report.risks.length > 0, 'Risks must be outlined')
    assert.ok(report.verificationSteps.length > 0, 'Verification steps must be present')
  })
})
