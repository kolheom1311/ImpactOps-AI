import React, { useState } from 'react'
import { AuditEvent, AuditEventType } from '../types'
import { History, Shield, Filter, Search, CheckCircle2, ChevronRight, Hash } from 'lucide-react'

interface AuditLogViewerProps {
  logs: AuditEvent[]
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ logs }) => {
  const [filterType, setFilterType] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [selectedLog, setSelectedLog] = useState<AuditEvent | null>(null)

  const filteredLogs = logs.filter((log) => {
    const matchesFilter = filterType === 'ALL' || log.eventType === filterType
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.digest.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getEventBadge = (type: AuditEventType) => {
    switch (type) {
      case 'PLAN_APPROVED':
        return 'badge-emerald'
      case 'PLAN_REJECTED':
        return 'badge-rose'
      case 'ANOMALY_DETECTED':
        return 'badge-amber'
      case 'INVESTIGATION_INITIATED':
      case 'INVESTIGATION_COMPLETED':
        return 'badge-teal'
      case 'SIMULATION_EXECUTED':
        return 'badge-slate'
      default:
        return 'badge-slate'
    }
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
          <History size={18} color="#10b981" />
          <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
            Enterprise Audit Trail & Governance Ledger
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-emerald">
            <Shield size={12} />
            SHA-256 Digest Verified
          </span>
          <span className="badge badge-slate">{logs.length} Total Records</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '240px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 10px',
              width: '100%',
              maxWidth: '320px',
            }}
          >
            <Search size={14} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Filter by actor, details, or hash..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ffffff',
                fontSize: '12px',
                width: '100%',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '6px 10px',
              fontSize: '12px',
              outline: 'none',
            }}
          >
            <option value="ALL">All Event Types</option>
            <option value="ANOMALY_DETECTED">Anomaly Detected</option>
            <option value="INVESTIGATION_INITIATED">Investigation Initiated</option>
            <option value="INVESTIGATION_COMPLETED">Investigation Completed</option>
            <option value="PLAN_APPROVED">Plan Approved</option>
            <option value="PLAN_REJECTED">Plan Rejected</option>
            <option value="SIMULATION_EXECUTED">Simulation Executed</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Event Type</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Actor / Agent</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Operational Details</th>
              <th style={{ padding: '8px 12px', fontWeight: 600 }}>Tamper Digest</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log) => (
              <tr
                key={log.id}
                onClick={() => setSelectedLog(log)}
                style={{
                  borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                }}
                className="glass-card"
              >
                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }} className="tabular-nums">
                  {new Date(log.timestamp).toLocaleTimeString()} •{' '}
                  <span style={{ color: 'var(--text-muted)' }}>
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </td>

                <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                  <span className={`badge ${getEventBadge(log.eventType)}`} style={{ fontSize: '10px' }}>
                    {log.eventType.replace('_', ' ')}
                  </span>
                </td>

                <td style={{ padding: '10px 12px', fontWeight: 600, color: '#ffffff', whiteSpace: 'nowrap' }}>
                  {log.actor}
                </td>

                <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: '380px' }}>
                  <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {log.details}
                  </div>
                </td>

                <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <span title={log.digest}>{log.digest.slice(0, 12)}...</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Inspect Log Modal */}
      {selectedLog && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              background: '#0c1424',
              border: '1px solid var(--border-medium)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#10b981" />
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>Audit Record Details</h3>
              </div>
              <span className={`badge ${getEventBadge(selectedLog.eventType)}`}>
                {selectedLog.eventType}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '16px' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Timestamp: </span>
                <strong style={{ color: '#ffffff' }}>{selectedLog.timestamp}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Actor / Entity: </span>
                <strong style={{ color: '#10b981' }}>{selectedLog.actor}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Facility: </span>
                <strong style={{ color: '#ffffff' }}>{selectedLog.facilityId}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Summary Description: </span>
                <p style={{ color: '#e2e8f0', marginTop: '4px' }}>{selectedLog.details}</p>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Structured Event Parameters:</span>
                <pre
                  style={{
                    background: 'rgba(0, 0, 0, 0.5)',
                    padding: '10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: '#38bdf8',
                    overflowX: 'auto',
                    marginTop: '4px',
                  }}
                >
                  {JSON.stringify(selectedLog.parameters, null, 2)}
                </pre>
              </div>

              <div>
                <span style={{ color: 'var(--text-muted)' }}>Cryptographic SHA-256 Digest:</span>
                <div
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#94a3b8',
                    wordBreak: 'break-all',
                    background: 'rgba(0, 0, 0, 0.3)',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    marginTop: '2px',
                  }}
                >
                  {selectedLog.digest}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedLog(null)} className="btn-secondary" style={{ padding: '8px 16px' }}>
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
