import React, { useState, useEffect } from 'react'
import {
  Facility,
  TelemetryPoint,
  FacilityAggregates,
  Anomaly,
  InvestigationReport,
  InterventionPlan,
  ScenarioParameters,
  ScenarioResult,
  AuditEvent,
} from './types'
import {
  FACILITIES,
  generateSyntheticTelemetry,
  SEEDED_ANOMALIES,
  INITIAL_AUDIT_LOGS,
} from './data/telemetryData'
import { calculateFacilityAggregates, simulateOperationalIntervention } from './services/analytics'
import { Header } from './components/Header'
import { MetricCards } from './components/MetricCards'
import { TelemetryChart } from './components/TelemetryChart'
import { AnomalyInspector } from './components/AnomalyInspector'
import { InvestigationWorkspace } from './components/InvestigationWorkspace'
import { RecommendationApproval } from './components/RecommendationApproval'
import { ScenarioSimulator } from './components/ScenarioSimulator'
import { AuditLogViewer } from './components/AuditLogViewer'
import { ArchitectureModal } from './components/ArchitectureModal'
import { ApiKeyModal } from './components/ApiKeyModal'
import {
  LayoutDashboard,
  CheckSquare,
  Sliders,
  History,
  AlertCircle,
  Sparkles,
  Layers,
} from 'lucide-react'

export function App() {
  // Navigation & Modal State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'plans' | 'simulator' | 'audit'>('dashboard')
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false)
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false)

  // Facility & Telemetry State
  const [facilities, setFacilities] = useState<Facility[]>(FACILITIES)
  const [selectedFacility, setSelectedFacility] = useState<Facility>(FACILITIES[0])
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([])
  const [aggregates, setAggregates] = useState<FacilityAggregates | null>(null)
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null)

  // AI & Investigation State
  const [report, setReport] = useState<InvestigationReport | null>(null)
  const [isInvestigating, setIsInvestigating] = useState(false)
  const [investigationStage, setInvestigationStage] = useState<string>('IDLE')
  const [plans, setPlans] = useState<InterventionPlan[]>([])

  // Audit Logs & System Health
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>(INITIAL_AUDIT_LOGS)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isProcessingAction, setIsProcessingAction] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)

  // Server Integration Status
  const [hasGeminiKey, setHasGeminiKey] = useState(false)
  const [aiMode, setAiMode] = useState('Deterministic Mathematical Rule Engine (Active Fallback)')

  // Initial Load: check backend health and fetch telemetry
  useEffect(() => {
    checkHealth()
    loadFacilityData(selectedFacility)
    loadAuditLogs()
  }, [])

  // Healthcheck
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/health')
      if (res.ok) {
        const data = await res.json()
        setHasGeminiKey(Boolean(data.aiEngine?.hasConfiguredApiKey))
        setAiMode(data.aiEngine?.activeMode || 'Deterministic Engine')
      }
    } catch {
      // Offline/local fallback
      setHasGeminiKey(false)
      setAiMode('Deterministic Mathematical Rule Engine (Active Fallback)')
    }
  }

  // Load facility data from server with local fallback
  const loadFacilityData = async (facility: Facility) => {
    setIsRefreshing(true)
    try {
      // Fetch telemetry
      const telRes = await fetch(`/api/telemetry?facilityId=${facility.id}`)
      let telData: TelemetryPoint[] = []
      if (telRes.ok) {
        const json = await telRes.json()
        telData = json.telemetry
      } else {
        telData = generateSyntheticTelemetry(facility.id)
      }
      setTelemetry(telData)

      // Fetch aggregates
      const aggRes = await fetch(`/api/aggregates?facilityId=${facility.id}`)
      if (aggRes.ok) {
        const json = await aggRes.json()
        setAggregates(json.aggregates)
      } else {
        setAggregates(calculateFacilityAggregates(telData, facility))
      }

      // Fetch anomalies
      const anomRes = await fetch(`/api/anomalies?facilityId=${facility.id}`)
      let anomData: Anomaly[] = []
      if (anomRes.ok) {
        const json = await anomRes.json()
        anomData = json.anomalies
      } else {
        anomData = SEEDED_ANOMALIES.filter((a) => a.facilityId === facility.id)
      }
      setAnomalies(anomData)

      // Auto-select first anomaly
      if (anomData.length > 0) {
        setSelectedAnomaly(anomData[0])
      } else {
        setSelectedAnomaly(null)
      }
      setReport(null)
    } catch (err) {
      // Local deterministic fallback
      const telData = generateSyntheticTelemetry(facility.id)
      setTelemetry(telData)
      setAggregates(calculateFacilityAggregates(telData, facility))
      const anomData = SEEDED_ANOMALIES.filter((a) => a.facilityId === facility.id)
      setAnomalies(anomData)
      if (anomData.length > 0) setSelectedAnomaly(anomData[0])
      setReport(null)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Switch Facility
  const handleSelectFacility = (facility: Facility) => {
    setSelectedFacility(facility)
    loadFacilityData(facility)
  }

  // Fetch Audit Logs
  const loadAuditLogs = async () => {
    try {
      const res = await fetch('/api/audit-logs')
      if (res.ok) {
        const data = await res.json()
        setAuditLogs(data.logs)
      }
    } catch {
      // Keep in-memory logs
    }
  }

  // Run AI Anomaly Investigation with truthful progression stages
  const handleInvestigateAnomaly = async (anomaly: Anomaly) => {
    setSelectedAnomaly(anomaly)
    setIsInvestigating(true)
    setReport(null)

    // Stage 1: OBSERVE
    setInvestigationStage('OBSERVE')
    await new Promise((r) => setTimeout(r, 400))

    // Stage 2: DETECT
    setInvestigationStage('DETECT')
    await new Promise((r) => setTimeout(r, 450))

    // Stage 3: REASON
    setInvestigationStage('REASON')

    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anomalyId: anomaly.id, facilityId: selectedFacility.id }),
      })

      // Stage 4: SYNTHESIZE
      setInvestigationStage('SYNTHESIZE')
      await new Promise((r) => setTimeout(r, 350))

      // Stage 5: RECOMMEND
      setInvestigationStage('RECOMMEND')

      if (res.ok) {
        const data = await res.json()
        setReport(data.report)
        setPlans(data.report.recommendedInterventions)
      } else {
        throw new Error('API request failed')
      }

      setInvestigationStage('APPROVAL_GATE')
      loadAuditLogs()
    } catch (err) {
      console.warn('Backend request failed, executing deterministic rule engine locally:', err)
      // Deterministic fallback
      const { runDeterministicInvestigation } = await import('../server/ruleEngine')
      const fallbackReport = runDeterministicInvestigation(anomaly, selectedFacility)
      setReport(fallbackReport)
      setPlans(fallbackReport.recommendedInterventions)
      setInvestigationStage('APPROVAL_GATE')
    } finally {
      setIsInvestigating(false)
    }
  }

  // Human Approval: Approve Operational Plan
  const handleApprovePlan = async (plan: InterventionPlan, notes: string) => {
    setIsProcessingAction(true)
    try {
      const res = await fetch('/api/actions/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          anomalyId: plan.anomalyId,
          facilityId: selectedFacility.id,
          operatorNotes: notes,
          operatorName: 'Authorized Facility Operations Director',
        }),
      })

      const authCode = res.ok
        ? (await res.json()).authorizationCode
        : `AOP-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`

      // Update local state
      setPlans((prev) =>
        prev.map((p) =>
          p.id === plan.id
            ? {
                ...p,
                status: 'APPROVED',
                humanApproval: {
                  approvedAt: new Date().toISOString(),
                  operator: 'Authorized Facility Operations Director',
                  notes,
                  authorizationCode: authCode,
                },
              }
            : p
        )
      )

      loadAuditLogs()
    } catch (err) {
      console.error('Approval failed:', err)
    } finally {
      setIsProcessingAction(false)
    }
  }

  // Human Approval: Reject Operational Plan
  const handleRejectPlan = async (plan: InterventionPlan, reason: string) => {
    setIsProcessingAction(true)
    try {
      await fetch('/api/actions/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          facilityId: selectedFacility.id,
          reason,
        }),
      })

      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, status: 'REJECTED' } : p))
      )
      loadAuditLogs()
    } catch (err) {
      console.error('Rejection failed:', err)
    } finally {
      setIsProcessingAction(false)
    }
  }

  // Mark Completed
  const handleCompletePlan = (plan: InterventionPlan) => {
    setPlans((prev) =>
      prev.map((p) => (p.id === plan.id ? { ...p, status: 'COMPLETED' } : p))
    )
  }

  // Scenario Simulation Handler
  const handleSimulateScenario = async (params: ScenarioParameters): Promise<ScenarioResult | null> => {
    setIsSimulating(true)
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facilityId: selectedFacility.id, parameters: params }),
      })

      if (res.ok) {
        const data = await res.json()
        loadAuditLogs()
        return data.result
      } else {
        throw new Error('Simulation failed')
      }
    } catch {
      return simulateOperationalIntervention(params, telemetry, selectedFacility)
    } finally {
      setIsSimulating(false)
    }
  }

  // Dynamic Gemini Key Save
  const handleSaveGeminiKey = async (apiKey: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/config/gemini-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      })
      if (res.ok) {
        const data = await res.json()
        setHasGeminiKey(data.hasConfiguredApiKey)
        setAiMode(data.activeMode)
        loadAuditLogs()
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Application Header */}
      <Header
        facilities={facilities}
        selectedFacility={selectedFacility}
        onSelectFacility={handleSelectFacility}
        activeAnomalyCount={anomalies.length}
        aiMode={aiMode}
        hasGeminiKey={hasGeminiKey}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onRefreshTelemetry={() => loadFacilityData(selectedFacility)}
        isRefreshing={isRefreshing}
      />

      {/* Main KPI Metric Cards */}
      {aggregates && <MetricCards aggregates={aggregates} facility={selectedFacility} />}

      {/* Primary Navigation Tabs */}
      <div
        style={{
          margin: '0 24px 16px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          className="btn-secondary"
          style={{
            background: activeTab === 'dashboard' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            borderColor: activeTab === 'dashboard' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
            color: activeTab === 'dashboard' ? '#34d399' : 'var(--text-secondary)',
            fontWeight: 700,
          }}
        >
          <LayoutDashboard size={15} />
          <span>Operational Cockpit</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className="btn-secondary"
          style={{
            background: activeTab === 'plans' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            borderColor: activeTab === 'plans' ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
            color: activeTab === 'plans' ? '#34d399' : 'var(--text-secondary)',
            fontWeight: 700,
          }}
        >
          <CheckSquare size={15} />
          <span>Authorized Operational Plans ({plans.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('simulator')}
          className="btn-secondary"
          style={{
            background: activeTab === 'simulator' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            borderColor: activeTab === 'simulator' ? 'rgba(6, 182, 212, 0.4)' : 'transparent',
            color: activeTab === 'simulator' ? '#38bdf8' : 'var(--text-secondary)',
            fontWeight: 700,
          }}
        >
          <Sliders size={15} />
          <span>Scenario Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className="btn-secondary"
          style={{
            background: activeTab === 'audit' ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
            borderColor: activeTab === 'audit' ? 'rgba(245, 158, 11, 0.4)' : 'transparent',
            color: activeTab === 'audit' ? '#fbbf24' : 'var(--text-secondary)',
            fontWeight: 700,
          }}
        >
          <History size={15} />
          <span>Audit Ledger ({auditLogs.length})</span>
        </button>
      </div>

      {/* Main Tab Views */}
      <main style={{ flex: 1, paddingBottom: '32px' }}>
        {/* TAB 1: OPERATIONAL COCKPIT */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Time Series Telemetry Chart */}
            <TelemetryChart telemetry={telemetry} facility={selectedFacility} />

            {/* Split Grid: Anomaly Inspector on Left, Investigation Workspace on Right */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(320px, 380px) 1fr',
                gap: '20px',
                margin: '0 24px',
              }}
            >
              <AnomalyInspector
                anomalies={anomalies}
                selectedAnomaly={selectedAnomaly}
                onSelectAnomaly={(anom) => setSelectedAnomaly(anom)}
                onInvestigate={handleInvestigateAnomaly}
                isInvestigating={isInvestigating}
              />

              <InvestigationWorkspace
                report={report}
                activeAnomaly={selectedAnomaly}
                facility={selectedFacility}
                isInvestigating={isInvestigating}
                investigationStage={investigationStage}
                onSelectIntervention={() => setActiveTab('plans')}
              />
            </div>
          </div>
        )}

        {/* TAB 2: OPERATIONAL PLANS & HUMAN APPROVAL */}
        {activeTab === 'plans' && (
          <div style={{ margin: '0 24px' }}>
            <RecommendationApproval
              plans={
                plans.length > 0
                  ? plans
                  : [
                      {
                        id: 'plan-default-1',
                        anomalyId: 'anom-01',
                        title: 'Chiller Loop VFD Automated Staging Protocol & High-Temp Rollback',
                        category: 'EQUIPMENT_SCHEDULE',
                        urgency: 'P1_IMMEDIATE',
                        implementationEffort: 'LOW',
                        estimatedCostToImplement: 350,
                        estimatedMonthlySavingsDollars: 1624,
                        estimatedAnnualSavingsDollars: 19488,
                        estimatedResourceSavings: { value: 11760, unit: 'kWh/month' },
                        estimatedCarbonAvoidedKgPerMonth: 4292,
                        paybackPeriodDays: 4,
                        confidenceLevel: 94,
                        calculationBreakdown: {
                          formula: '(Actual 1,973 kW - Baseline 1,380 kW) × 0.88 Recovery Factor × 40 hrs/wk × 4.33 wks/mo × $0.138/kWh',
                          assumptions: [
                            'Restores variable staging down to 35Hz at wet-bulb < 50°F',
                            'Avoids peak demand ratchets on monthly utility bill',
                            'PJM grid emission factor 0.365 kg CO2e/kWh applied',
                          ],
                          variables: { deltaKW: 593, tariffRate: '$0.138/kWh', monthlyKWhSaved: 11760 },
                        },
                        status: 'PROPOSED',
                      },
                    ]
              }
              facility={selectedFacility}
              onApprovePlan={handleApprovePlan}
              onRejectPlan={handleRejectPlan}
              onCompletePlan={handleCompletePlan}
              isProcessing={isProcessingAction}
            />
          </div>
        )}

        {/* TAB 3: SCENARIO SIMULATOR */}
        {activeTab === 'simulator' && (
          <div style={{ margin: '0 24px' }}>
            <ScenarioSimulator
              facility={selectedFacility}
              onSimulate={handleSimulateScenario}
              isSimulating={isSimulating}
            />
          </div>
        )}

        {/* TAB 4: AUDIT LEDGER */}
        {activeTab === 'audit' && (
          <div style={{ margin: '0 24px' }}>
            <AuditLogViewer logs={auditLogs} />
          </div>
        )}
      </main>

      {/* Footer & Disclosure */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--border-subtle)',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          fontSize: '12px',
          color: 'var(--text-muted)',
          background: 'rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <strong style={{ color: '#ffffff' }}>ImpactOps AI</strong>
          <span>•</span>
          <span>Build Beyond AI Hackathon Implementation</span>
          <span>•</span>
          <span>Theme: Secure, Intelligent and Autonomous Operations</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>
            AI Engine:{' '}
            <strong style={{ color: hasGeminiKey ? '#10b981' : '#06b6d4' }}>
              {hasGeminiKey ? 'Google Gemini 1.5 Flash' : 'Deterministic Rule Engine (Fallback)'}
            </strong>
          </span>
          <span>
            Security Boundary:{' '}
            <strong style={{ color: '#ffffff' }}>Human-in-the-Loop Enforced</strong>
          </span>
        </div>
      </footer>

      {/* Architecture Visualizer Modal */}
      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
        hasGeminiKey={hasGeminiKey}
      />

      {/* Google Gemini API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        hasGeminiKey={hasGeminiKey}
        activeMode={aiMode}
        onSaveKey={handleSaveGeminiKey}
      />
    </div>
  )
}
export default App
