import React, { useState } from 'react'
import { Sparkles, Key, CheckCircle, Shield, X, AlertCircle } from 'lucide-react'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
  hasGeminiKey: boolean
  activeMode: string
  onSaveKey: (key: string) => Promise<boolean>
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  hasGeminiKey,
  activeMode,
  onSaveKey,
}) => {
  const [inputKey, setInputKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSave = async () => {
    setIsSubmitting(true)
    setFeedback(null)
    const success = await onSaveKey(inputKey)
    setIsSubmitting(false)
    if (success) {
      setFeedback('API Key updated successfully!')
      setTimeout(() => {
        setFeedback(null)
        onClose()
      }, 1200)
    } else {
      setFeedback('Failed to update API key.')
    }
  }

  const handleClear = async () => {
    setIsSubmitting(true)
    await onSaveKey('')
    setIsSubmitting(false)
    setInputKey('')
    setFeedback('Reverted to Deterministic Rule Engine fallback mode.')
    setTimeout(() => {
      setFeedback(null)
      onClose()
    }, 1200)
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '20px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '24px',
          background: '#0a101d',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Key size={20} color="#06b6d4" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff' }}>
              AI Engine & Google Gemini Configuration
            </h3>
          </div>
          <button onClick={onClose} className="btn-secondary" style={{ padding: '6px', borderRadius: '50%' }}>
            <X size={14} />
          </button>
        </div>

        {/* Current Active Mode */}
        <div
          style={{
            background: hasGeminiKey ? 'rgba(16, 185, 129, 0.1)' : 'rgba(6, 182, 212, 0.1)',
            border: hasGeminiKey
              ? '1px solid rgba(16, 185, 129, 0.3)'
              : '1px solid rgba(6, 182, 212, 0.3)',
            borderRadius: '8px',
            padding: '12px 14px',
            marginBottom: '16px',
            fontSize: '12px',
          }}
        >
          <div style={{ color: 'var(--text-muted)', marginBottom: '2px' }}>Current Operational Mode:</div>
          <strong style={{ color: hasGeminiKey ? '#34d399' : '#38bdf8', fontSize: '13px' }}>
            {activeMode}
          </strong>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
          ImpactOps AI functions seamlessly <strong>out of the box</strong> using its transparent deterministic
          mathematical engine. If you have a Google Gemini API Key, you can enter it below to experience live LLM
          reasoning.
        </p>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Google Gemini API Key:
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#ffffff',
              padding: '8px 12px',
              fontSize: '13px',
              outline: 'none',
              fontFamily: 'var(--font-mono)',
            }}
          />
        </div>

        {feedback && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '14px',
            }}
          >
            {feedback}
          </div>
        )}

        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '18px',
          }}
        >
          <Shield size={13} color="#10b981" />
          <span>Security Notice: Key is processed exclusively by the local backend proxy.</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {hasGeminiKey ? (
            <button
              onClick={handleClear}
              disabled={isSubmitting}
              className="btn-secondary"
              style={{ fontSize: '11px', color: '#fb7185' }}
            >
              Disconnect Key (Use Fallback)
            </button>
          ) : (
            <span />
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} className="btn-secondary" style={{ padding: '8px 14px' }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting || inputKey.trim().length === 0}
              className="btn-primary"
              style={{ padding: '8px 16px' }}
            >
              {isSubmitting ? 'Connecting...' : 'Apply Key'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
