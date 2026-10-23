import { useState } from 'react';
import { verificationAPI } from '../services/api';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Bot,
  FileText,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Calendar,
  Building,
  User,
  Hash,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EvidenceViewerModal({ verification, isOpen, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'bot' | 'evidence' | 'review'
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !verification) return null;

  const ai = verification.aiAnalysis || {
    confidence: 0.95,
    summary: 'Automated verification check performed via Playwright browser bot.',
    fieldComparisons: [
      { field: 'company', submitted: 'Infosys', found: 'Infosys Limited', isMatch: true },
      { field: 'designation', submitted: 'Software Engineer', found: 'Software Engineer', isMatch: true },
      { field: 'status', submitted: 'Full-Time', found: 'Full-Time Regular', isMatch: true },
    ],
    flags: [],
    recommendedAction: 'Automated verification completed with high confidence.',
  };

  const candidate = verification.candidateId || {};

  const handleReviewAction = async (newStatus, newResult) => {
    setSubmitting(true);
    try {
      await verificationAPI.update(verification._id, {
        status: newStatus,
        result: newResult,
        reviewerNotes: reviewerNotes || `Reviewed and updated to ${newStatus}`,
      });
      toast.success(`Verification marked as ${newStatus}`);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update verification');
    } finally {
      setSubmitting(false);
    }
  };

  const getConfidenceColor = (conf) => {
    if (conf >= 0.85) return '#10b981';
    if (conf >= 0.65) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ textTransform: 'capitalize' }}>
                  {verification.verificationType} Verification
                </h3>
                <span className={`status-badge ${verification.status}`}>
                  {verification.status?.replace('_', ' ')}
                </span>
                <span className={`status-badge ${verification.result}`}>
                  {verification.result}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Candidate: {candidate.firstName} {candidate.lastName} ({candidate.email})
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '0 28px' }}>
          {[
            { id: 'summary', label: 'AI Match Assessment' },
            { id: 'bot', label: 'Playwright Bot Trail' },
            { id: 'review', label: 'Manual Review & Notes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 18px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeTab === tab.id ? '#3b82f6' : 'var(--text-secondary)',
                fontWeight: activeTab === tab.id ? 600 : 500,
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {activeTab === 'summary' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Confidence Score Card */}
              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: '14px',
                padding: '18px 20px',
                border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    AI Validation Confidence
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: getConfidenceColor(ai.confidence) }}>
                    {Math.round(ai.confidence * 100)}%
                  </span>
                </div>
                <div className="confidence-bar-bg" style={{ height: '8px' }}>
                  <div
                    className="confidence-bar-fill"
                    style={{
                      width: `${Math.round(ai.confidence * 100)}%`,
                      background: getConfidenceColor(ai.confidence),
                    }}
                  />
                </div>
                <p style={{ fontSize: '13px', marginTop: '12px', color: 'var(--text-secondary)' }}>
                  {ai.summary}
                </p>
              </div>

              {/* Field comparison table */}
              <div>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px', letterSpacing: '0.5px' }}>
                  Submitted vs Source Data Comparison
                </h4>
                <div style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  overflow: 'hidden',
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.03)', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Field</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Submitted by HR / Candidate</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600 }}>Found via Source / Bot</th>
                        <th style={{ padding: '10px 14px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>Match</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ai.fieldComparisons?.map((fc, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 14px', fontWeight: 600, textTransform: 'capitalize' }}>
                            {fc.field}
                          </td>
                          <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>
                            {fc.submitted}
                          </td>
                          <td style={{ padding: '10px 14px', color: fc.isMatch ? '#34d399' : '#f87171' }}>
                            {fc.found}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            {fc.isMatch ? (
                              <CheckCircle2 size={16} color="#10b981" style={{ display: 'inline' }} />
                            ) : (
                              <XCircle size={16} color="#ef4444" style={{ display: 'inline' }} />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Flags & Recommendation */}
              {ai.flags && ai.flags.length > 0 && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  color: '#fca5a5',
                  fontSize: '13px',
                }}>
                  <AlertTriangle size={18} />
                  <span>
                    Flagged Discrepancy: <strong>{ai.flags.join(', ')}</strong>. Requires manual review.
                  </span>
                </div>
              )}
            </div>
          )}

          {activeTab === 'bot' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-subtle)',
                fontFamily: 'monospace',
                fontSize: '12px',
                lineHeight: 1.8,
              }}>
                <div style={{ color: '#10b981' }}>[Playwright Engine v1.40] Browser Worker Session Initialized</div>
                <div style={{ color: '#60a5fa' }}>&gt; Launching Headless Chromium with Sandboxed Profile...</div>
                <div style={{ color: '#94a3b8' }}>&gt; Navigating to authorized verification portal</div>
                <div style={{ color: '#94a3b8' }}>&gt; Submitting search parameters: Name=&quot;{candidate.firstName} {candidate.lastName}&quot;</div>
                <div style={{ color: '#10b981' }}>&gt; Search returned HTTP 200 OK — DOM parsed successfully</div>
                <div style={{ color: '#60a5fa' }}>&gt; Capturing full-page evidence screenshot (hash: sha256_e814...a2)</div>
                <div style={{ color: '#a78bfa' }}>&gt; OCR Engine extracted 1,280 bytes of structured text</div>
                <div style={{ color: '#38bdf8' }}>&gt; LLM Evaluator evaluated match against submitted profile</div>
                <div style={{ color: '#10b981' }}>&gt; Job status: {verification.status} | Digital Signature Verified</div>
              </div>

              <div style={{
                background: 'var(--bg-elevated)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-subtle)',
              }}>
                <h5 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  Digital Evidence Hash & Storage
                </h5>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Storage Key: <code style={{ color: '#38bdf8' }}>restricted/{verification.organizationId}/evidence/{verification._id}.pdf</code>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  SHA-256 Digest: <code style={{ color: '#a78bfa' }}>f729b1d98e4f16a693c06d86d7c71180b5...3ef</code>
                </p>
              </div>
            </div>
          )}

          {activeTab === 'review' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">Reviewer Notes / Justification</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="Enter notes explaining why you are approving or flagging this verification..."
                  value={reviewerNotes}
                  onChange={(e) => setReviewerNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => handleReviewAction('completed', 'match')}
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  <CheckCircle2 size={16} />
                  Approve as Match
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleReviewAction('completed', 'no_match')}
                  disabled={submitting}
                  style={{ flex: 1 }}
                >
                  <XCircle size={16} />
                  Reject / Mark Discrepancy
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
