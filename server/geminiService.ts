import { Anomaly, Facility, InvestigationReport } from '../src/types'
import { runDeterministicInvestigation } from './ruleEngine'

/**
 * Google Gemini Model Integration Service
 * Connects to Google Gemini 1.5 Flash / 2.0 Flash with secure prompt engineering,
 * ground-truth evidence injection, untrusted output validation, and seamless deterministic fallback.
 */

export async function investigateWithGemini(
  anomaly: Anomaly,
  facility: Facility,
  customApiKey?: string
): Promise<InvestigationReport> {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY

  if (!apiKey || apiKey.trim() === '') {
    // Transparent fallback
    return runDeterministicInvestigation(anomaly, facility)
  }

  const deterministicReport = runDeterministicInvestigation(anomaly, facility)

  try {
    const prompt = `You are ImpactOps AI, a Senior Sustainability & Industrial Reliability Engineering Agent.
Analyze this operational resource consumption anomaly and produce an explainable investigation report with actionable interventions.

CRITICAL INSTRUCTIONS:
1. Ground Truth Evidence: You must use the provided mathematical figures as trusted ground truth. Do not invent contradictory numbers.
2. Formulate realistic engineering hypotheses explaining the root cause based on equipment physics.
3. Formulate prioritized, realistic operational intervention plans with clear payback and risk considerations.
4. Output must be strictly valid JSON without preamble, conforming to the schema below.

GROUND TRUTH EVIDENCE:
- Facility: "${facility.name}" (${facility.type}, ${facility.location})
- Resource: ${anomaly.resourceType.toUpperCase()}
- Anomaly Title: "${anomaly.title}"
- Observed Value: ${anomaly.actualValue} ${deterministicReport.calculations.unit}
- Baseline Value: ${anomaly.baselineValue} ${deterministicReport.calculations.unit}
- Baseline Deviation: +${anomaly.deviationPercent.toFixed(1)}%
- Statistical Z-Score: ${anomaly.evidence.zScore} (p < 0.01)
- Off-Hours Ratio: ${anomaly.evidence.offHoursRatio}x
- Active Duration: ${anomaly.durationHours} hours
- Applicable Tariff: $${deterministicReport.calculations.tariffRate} per unit
- Calculated Avoidable Monthly Cost: $${deterministicReport.calculations.totalAvoidableCost}
- Grid / Municipal Carbon Factor: ${deterministicReport.calculations.carbonIntensityFactor}
- Observed Patterns:
${anomaly.evidence.observedPatterns.map((p) => `  * ${p}`).join('\n')}

REQUIRED JSON SCHEMA:
{
  "executiveSummary": "Concise 2-3 sentence technical diagnosis of the anomaly and operational impact",
  "rootCauses": [
    {
      "cause": "Specific mechanical, pneumatic, or algorithmic failure mode",
      "probability": 0.75,
      "rationale": "Why this cause explains the telemetry pattern",
      "evidenceSupport": "Sensor/log evidence supporting this hypothesis"
    }
  ],
  "recommendedInterventions": [
    {
      "id": "plan-${anomaly.id}-1",
      "anomalyId": "${anomaly.id}",
      "title": "Actionable intervention title",
      "category": "EQUIPMENT_SCHEDULE" | "LEAK_ISOLATION" | "PEAK_SHAVING" | "MAINTENANCE_WORK_ORDER",
      "urgency": "P1_IMMEDIATE" | "P2_HIGH" | "P3_MEDIUM",
      "implementationEffort": "LOW" | "MEDIUM" | "HIGH",
      "estimatedCostToImplement": 500,
      "estimatedMonthlySavingsDollars": ${deterministicReport.recommendedInterventions[0]?.estimatedMonthlySavingsDollars || 1500},
      "estimatedAnnualSavingsDollars": ${(deterministicReport.recommendedInterventions[0]?.estimatedMonthlySavingsDollars || 1500) * 12},
      "estimatedResourceSavings": { "value": ${deterministicReport.recommendedInterventions[0]?.estimatedResourceSavings.value || 1000}, "unit": "${deterministicReport.calculations.unit.replace('/hr', '/month')}" },
      "estimatedCarbonAvoidedKgPerMonth": ${deterministicReport.recommendedInterventions[0]?.estimatedCarbonAvoidedKgPerMonth || 500},
      "paybackPeriodDays": 7,
      "confidenceLevel": 92,
      "calculationBreakdown": {
        "formula": "Transparent formula string",
        "assumptions": ["Assumption 1", "Assumption 2"],
        "variables": { "key": "value" }
      },
      "status": "PROPOSED"
    }
  ],
  "risks": ["Operational or safety risk 1", "Operational or safety risk 2"],
  "verificationSteps": ["Step 1 to verify resolution", "Step 2 using sensors"]
}`

    const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey.trim()}`

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12000)

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2, // Low temperature for factual precision
          responseMimeType: 'application/json',
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const errText = await response.text()
      console.warn(`[Gemini API] Request returned status ${response.status}. Using deterministic fallback.`)
      return runDeterministicInvestigation(anomaly, facility)
    }

    const data = await response.json()
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

    if (!rawText) {
      console.warn('[Gemini API] Empty response content. Using deterministic fallback.')
      return runDeterministicInvestigation(anomaly, facility)
    }

    // Clean JSON fences if present
    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(cleaned)

    // Security & Schema validation: Ensure critical arrays and fields exist
    if (!parsed.executiveSummary || !Array.isArray(parsed.rootCauses)) {
      console.warn('[Gemini API] Response failed schema integrity validation. Using fallback.')
      return runDeterministicInvestigation(anomaly, facility)
    }

    return {
      anomalyId: anomaly.id,
      facilityId: facility.id,
      generatedAt: new Date().toISOString(),
      engineSource: 'google_gemini_flash',
      modelIdentifier: `Google Gemini 1.5 Flash (Production AI Reasoning)`,
      executiveSummary: String(parsed.executiveSummary),
      rootCauses: parsed.rootCauses.map((rc: any) => ({
        cause: String(rc.cause || 'Unspecified anomaly contributor'),
        probability: Number(rc.probability || 0.5),
        rationale: String(rc.rationale || ''),
        evidenceSupport: String(rc.evidenceSupport || ''),
      })),
      // Retain ground-truth deterministic calculations for mathematical integrity
      calculations: deterministicReport.calculations,
      recommendedInterventions: Array.isArray(parsed.recommendedInterventions) && parsed.recommendedInterventions.length > 0
        ? parsed.recommendedInterventions.map((item: any, idx: number) => ({
            id: `plan-${anomaly.id}-${idx + 1}`,
            anomalyId: anomaly.id,
            title: String(item.title || `Intervention Protocol #${idx + 1}`),
            category: item.category || 'EQUIPMENT_SCHEDULE',
            urgency: item.urgency || 'P1_IMMEDIATE',
            implementationEffort: item.implementationEffort || 'MEDIUM',
            estimatedCostToImplement: Number(item.estimatedCostToImplement || 500),
            estimatedMonthlySavingsDollars: Number(item.estimatedMonthlySavingsDollars || deterministicReport.recommendedInterventions[0]?.estimatedMonthlySavingsDollars || 1000),
            estimatedAnnualSavingsDollars: Number(item.estimatedAnnualSavingsDollars || (deterministicReport.recommendedInterventions[0]?.estimatedMonthlySavingsDollars || 1000) * 12),
            estimatedResourceSavings: {
              value: Number(item.estimatedResourceSavings?.value || 500),
              unit: String(item.estimatedResourceSavings?.unit || deterministicReport.calculations.unit),
            },
            estimatedCarbonAvoidedKgPerMonth: Number(item.estimatedCarbonAvoidedKgPerMonth || 200),
            paybackPeriodDays: Number(item.paybackPeriodDays || 14),
            confidenceLevel: Number(item.confidenceLevel || 90),
            calculationBreakdown: item.calculationBreakdown || deterministicReport.recommendedInterventions[0]?.calculationBreakdown,
            status: 'PROPOSED',
          }))
        : deterministicReport.recommendedInterventions,
      risks: Array.isArray(parsed.risks) ? parsed.risks : deterministicReport.risks,
      verificationSteps: Array.isArray(parsed.verificationSteps) ? parsed.verificationSteps : deterministicReport.verificationSteps,
    }
  } catch (error) {
    console.warn('[Gemini Service] Encountered exception or timeout. Safely activating deterministic fallback:', error)
    return runDeterministicInvestigation(anomaly, facility)
  }
}
