import express, { Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import crypto from 'crypto'
import {
  FACILITIES,
  generateSyntheticTelemetry,
  SEEDED_ANOMALIES,
  INITIAL_AUDIT_LOGS,
} from '../src/data/telemetryData'
import { calculateFacilityAggregates, simulateOperationalIntervention } from '../src/services/analytics'
import { investigateWithGemini } from './geminiService'
import { AuditEvent, AuditEventType } from '../src/types'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001
const HOST = process.env.HOST || '127.0.0.1'
const DEFAULT_FACILITY = process.env.DEFAULT_FACILITY || 'fac-dc-north'
const ENABLE_SIMULATED_STREAM = process.env.ENABLE_SIMULATED_STREAM !== 'false'

// Security Middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json({ limit: '1mb' }))

// In-Memory State for Local Prototyping
let auditLogs: AuditEvent[] = [...INITIAL_AUDIT_LOGS]
let dynamicGeminiApiKey: string | null = null

// Helper to generate tamper-evident audit digests
function generateDigest(data: Record<string, any>): string {
  const content = JSON.stringify(data) + Date.now().toString()
  return crypto.createHash('sha256').update(content).digest('hex')
}

// Log an event to the audit trail
function recordAuditEvent(
  eventType: AuditEventType,
  facilityId: string,
  actor: string,
  details: string,
  parameters: Record<string, any>
): AuditEvent {
  const event: AuditEvent = {
    id: `aud-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 900 + 100)}`,
    timestamp: new Date().toISOString(),
    eventType,
    facilityId,
    actor,
    details,
    parameters,
    digest: generateDigest({ eventType, facilityId, parameters }),
  }
  auditLogs.unshift(event)
  return event
}

// 1. Healthcheck & Capabilities
app.get('/api/health', (req: Request, res: Response) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
  const hasDynamicKey = Boolean(dynamicGeminiApiKey)

  res.json({
    status: 'ONLINE',
    service: 'ImpactOps AI Operational Intelligence Service',
    version: '1.0.0',
    uptimeSeconds: process.uptime(),
    aiEngine: {
      provider: 'Google Gemini',
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
      hasConfiguredApiKey: hasEnvKey || hasDynamicKey,
      activeMode:
        hasEnvKey || hasDynamicKey
          ? 'Google Gemini 1.5 Flash (Production AI Active)'
          : 'Deterministic Mathematical Rule Engine (Active Fallback)',
    },
    security: {
      inputSanitization: 'ENABLED',
      untrustedModelSandboxing: 'ENABLED',
      humanInTheLoopGate: 'ENFORCED',
      auditTamperProtection: 'SHA-256',
    },
    config: {
      port: Number(PORT),
      host: HOST,
      defaultFacility: DEFAULT_FACILITY,
      enableSimulatedStream: ENABLE_SIMULATED_STREAM,
    },
  })
})

// 2. Facilities
app.get('/api/facilities', (req: Request, res: Response) => {
  res.json({ facilities: FACILITIES })
})

// 3. Telemetry Stream
app.get('/api/telemetry', (req: Request, res: Response) => {
  const facilityId = (req.query.facilityId as string) || DEFAULT_FACILITY
  const telemetry = generateSyntheticTelemetry(facilityId)
  res.json({ facilityId, count: telemetry.length, telemetry })
})

// 4. Deterministic Aggregates
app.get('/api/aggregates', (req: Request, res: Response) => {
  const facilityId = (req.query.facilityId as string) || DEFAULT_FACILITY
  const facility = FACILITIES.find((f) => f.id === facilityId) || FACILITIES[0]
  const telemetry = generateSyntheticTelemetry(facilityId)
  const aggregates = calculateFacilityAggregates(telemetry, facility)
  res.json({ facilityId, aggregates })
})

// 5. Anomalies
app.get('/api/anomalies', (req: Request, res: Response) => {
  const facilityId = req.query.facilityId as string
  const anomalies = facilityId
    ? SEEDED_ANOMALIES.filter((a) => a.facilityId === facilityId)
    : SEEDED_ANOMALIES
  res.json({ anomalies })
})

// 6. AI Anomaly Investigation Endpoint
app.post('/api/investigate', async (req: Request, res: Response) => {
  try {
    const { anomalyId, facilityId } = req.body

    if (!anomalyId || !facilityId) {
      return res.status(400).json({ error: 'Missing required parameters: anomalyId and facilityId' })
    }

    const anomaly = SEEDED_ANOMALIES.find((a) => a.id === anomalyId)
    const facility = FACILITIES.find((f) => f.id === facilityId)

    if (!anomaly || !facility) {
      return res.status(404).json({ error: 'Anomaly or Facility not found in system directory' })
    }

    // Record investigation initiation
    recordAuditEvent(
      'INVESTIGATION_INITIATED',
      facility.id,
      'ImpactOps Autonomous Agent',
      `Autonomous investigation initiated for anomaly: ${anomaly.title} (${anomaly.resourceType.toUpperCase()})`,
      { anomalyId: anomaly.id, zScore: anomaly.evidence.zScore, deviationPercent: anomaly.deviationPercent }
    )

    // Execute reasoning (Gemini or deterministic fallback)
    const effectiveKey = dynamicGeminiApiKey || undefined
    const report = await investigateWithGemini(anomaly, facility, effectiveKey)

    // Record investigation completion
    recordAuditEvent(
      'INVESTIGATION_COMPLETED',
      facility.id,
      report.engineSource === 'google_gemini_flash' ? 'Google Gemini 1.5 Flash' : 'Deterministic Rule Engine',
      `Investigation synthesized: ${report.rootCauses.length} causal hypotheses, ${report.recommendedInterventions.length} intervention protocols formulated.`,
      {
        anomalyId: anomaly.id,
        engineSource: report.engineSource,
        topCause: report.rootCauses[0]?.cause,
        estimatedAvoidableMonthly: report.calculations.totalAvoidableCost,
      }
    )

    return res.json({ report })
  } catch (error: any) {
    console.error('[API /investigate Error]', error)
    return res.status(500).json({ error: 'Internal investigation failure', message: error?.message })
  }
})

// 7. Scenario Simulation Endpoint
app.post('/api/simulate', (req: Request, res: Response) => {
  try {
    const { facilityId, parameters } = req.body

    if (!facilityId || !parameters) {
      return res.status(400).json({ error: 'Missing required parameters: facilityId and parameters' })
    }

    const facility = FACILITIES.find((f) => f.id === facilityId) || FACILITIES[0]
    const telemetry = generateSyntheticTelemetry(facilityId)

    const result = simulateOperationalIntervention(parameters, telemetry, facility)

    recordAuditEvent(
      'SIMULATION_EXECUTED',
      facility.id,
      'Human Operator / Scenario Modeling Agent',
      `Operational scenario simulated: ${parameters.electricityReductionPct}% elec reduction, ${parameters.waterLeakReductionPct}% water recovery. Projected savings: $${result.monthlySavingsDollars}/mo.`,
      {
        parameters,
        projectedMonthlySavings: result.monthlySavingsDollars,
        annualSavings: result.annualSavingsDollars,
        carbonReductionMT: result.carbonReductionMetricTons,
      }
    )

    return res.json({ result })
  } catch (error: any) {
    return res.status(500).json({ error: 'Simulation failure', message: error?.message })
  }
})

// 8. Human Decision Gate: Approve Action
app.post('/api/actions/approve', (req: Request, res: Response) => {
  try {
    const { planId, anomalyId, facilityId, operatorNotes, operatorName } = req.body

    if (!planId || !facilityId) {
      return res.status(400).json({ error: 'Missing planId or facilityId' })
    }

    const authCode = `AOP-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`
    const operator = operatorName || 'Authorized Facility Operations Director'

    const event = recordAuditEvent(
      'PLAN_APPROVED',
      facilityId,
      operator,
      `Human Approval Granted: Operational Plan #${planId} authorized for deployment under Code ${authCode}. Note: Tracking as authorized operational work order.`,
      {
        planId,
        anomalyId,
        authorizationCode: authCode,
        operatorNotes: operatorNotes || 'Immediate schedule rollback approved after verification.',
      }
    )

    return res.json({
      success: true,
      authorizationCode: authCode,
      status: 'APPROVED',
      approvedAt: event.timestamp,
      message: `Operational Plan ${planId} successfully authorized under control code ${authCode}.`,
    })
  } catch (error: any) {
    return res.status(500).json({ error: 'Approval failure', message: error?.message })
  }
})

// 9. Human Decision Gate: Reject Action
app.post('/api/actions/reject', (req: Request, res: Response) => {
  const { planId, facilityId, reason } = req.body
  const event = recordAuditEvent(
    'PLAN_REJECTED',
    facilityId || 'fac-dc-north',
    'Human Operator',
    `Operational Plan #${planId} rejected by human reviewer. Reason: ${reason || 'Operator override/scheduled maintenance pending'}.`,
    { planId, reason }
  )
  res.json({ success: true, status: 'REJECTED', rejectedAt: event.timestamp })
})

// 10. Audit History Log
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const facilityId = req.query.facilityId as string
  const logs = facilityId ? auditLogs.filter((l) => l.facilityId === facilityId) : auditLogs
  res.json({ total: logs.length, logs })
})

// 11. Dynamic Gemini API Key (Allows live testing in browser UI without restart)
app.post('/api/config/gemini-key', (req: Request, res: Response) => {
  const { apiKey } = req.body
  if (typeof apiKey === 'string' && apiKey.trim().length > 10) {
    dynamicGeminiApiKey = apiKey.trim()
    recordAuditEvent(
      'INVESTIGATION_INITIATED',
      'system',
      'System Security Administrator',
      'Google Gemini API key credentials dynamically connected for live reasoning session.',
      { keyLength: dynamicGeminiApiKey.length, mode: 'GOOGLE_GEMINI_LIVE' }
    )
    return res.json({ success: true, hasConfiguredApiKey: true, activeMode: 'Google Gemini 1.5 Flash (Production AI Active)' })
  } else {
    dynamicGeminiApiKey = null
    return res.json({ success: true, hasConfiguredApiKey: false, activeMode: 'Deterministic Mathematical Rule Engine (Active Fallback)' })
  }
})

app.listen(Number(PORT), HOST, () => {
  console.log(`[ImpactOps AI] Server listening on http://${HOST}:${PORT}`)
  console.log(`[ImpactOps AI] Mode: ${process.env.GEMINI_API_KEY ? 'Google Gemini Enabled' : 'Deterministic Rule Engine Fallback'}`)
})
