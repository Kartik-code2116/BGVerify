import { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Bot,
  Play,
} from 'lucide-react';
import EvidenceViewerModal from '../../components/EvidenceViewerModal';
import toast from 'react-hot-toast';

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [initialTab, setInitialTab] = useState('review');
  const [rerunningMap, setRerunningMap] = useState({});

  const [liveBrowserMode, setLiveBrowserMode] = useState(() => {
    return localStorage.getItem('bgverify_live_browser_mode') === 'true';
  });

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await verificationAPI.list({ status: 'manual_review' });
      setQueue(res.data?.data?.verifications || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  const toggleLiveBrowserMode = () => {
    const nextMode = !liveBrowserMode;
    setLiveBrowserMode(nextMode);
    localStorage.setItem('bgverify_live_browser_mode', String(nextMode));
    toast(
      nextMode
        ? '👁️ Live Headed Browser Mode ON: Playwright will open a visible Chromium window on your screen with slow-motion execution.'
        : '⚡ Background Mode ON: Playwright verifications will run quietly in background without popping windows.',
      {
        icon: nextMode ? '👁️' : '⚡',
        duration: 4000,
      }
    );
  };

  const handleRerunBot = async (item) => {
    setRerunningMap((prev) => ({ ...prev, [item._id]: true }));
    const candidateName = `${item.candidateId?.firstName || 'Candidate'} ${item.candidateId?.lastName || ''}`.trim();
    const toastId = toast.loading(
      liveBrowserMode
        ? `🤖 Launching visible Chromium window to verify ${candidateName}...`
        : `🤖 Running Playwright browser bot in background for ${candidateName}...`
    );

    try {
      const res = await verificationAPI.rerunBot(item._id, {
        headless: !liveBrowserMode,
      });

      const updated = res.data?.data?.verification;
      const statusText = updated?.status === 'manual_review'
        ? 'Discrepancy retained in review queue'
        : `Verification resolved with result: ${updated?.result || 'clean match'}`;

      toast.success(
        `Playwright bot completed for ${candidateName}! ${statusText}`,
        { id: toastId }
      );

      await loadQueue();
    } catch (err) {
      console.error('Rerun bot error:', err);
      toast.error(
        err.response?.data?.error?.message || 'Failed to re-run Playwright bot',
        { id: toastId }
      );
    } finally {
      setRerunningMap((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  const openEvidenceModal = (item, tab = 'review') => {
    setSelectedVerification(item);
    setInitialTab(tab);
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row" style={{ alignItems: 'flex-start' }}>
          <div>
            <h2>Human-in-the-Loop Review Queue</h2>
            <p>
              Cases flagged by Playwright bots with date discrepancies, partial name matches, or ambiguous evidence
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Live Headed Browser Toggle Button */}
            <button
              type="button"
              onClick={toggleLiveBrowserMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                border: liveBrowserMode
                  ? '1px solid #10b981'
                  : '1px solid rgba(255, 255, 255, 0.15)',
                background: liveBrowserMode
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(30, 41, 59, 0.7)',
                color: liveBrowserMode ? '#34d399' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              title="Toggle Playwright Headed Mode: When ON, an actual Chromium browser window will open on your screen with slow-motion execution."
            >
              {liveBrowserMode ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{liveBrowserMode ? '👁️ Live Browser: Visible Window' : '⚡ Live Browser: Background'}</span>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: liveBrowserMode ? '#10b981' : '#64748b',
                  boxShadow: liveBrowserMode ? '0 0 8px #10b981' : 'none',
                }}
              />
            </button>

            <button className="btn btn-secondary" onClick={loadQueue} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Queue</span>
            </button>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{
        padding: '16px 20px',
        background: 'rgba(245, 158, 11, 0.08)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
        borderRadius: '14px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: 'rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#f59e0b',
          flexShrink: 0,
        }}>
          <AlertTriangle size={20} />
        </div>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#fcd34d' }}>
            Responsible AI Policy Enforced
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            An LLM or autonomous bot never independently disqualifies a candidate. Ambiguous evidence or discrepancies trigger human-review workflows with auditable rationale and cryptographic proof.
          </div>
        </div>
      </div>

      {/* Review Queue Items */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-inline">
              <div className="loading-spinner"></div>
            </div>
          ) : queue.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                <CheckCircle2 size={32} />
              </div>
              <h3>Review Queue is Clear!</h3>
              <p>All automated verification jobs have been successfully resolved.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Type</th>
                    <th>Flagged Issue / Discrepancy</th>
                    <th>Confidence</th>
                    <th>Recommendation</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => {
                    const isRerunning = !!rerunningMap[item._id];
                    return (
                      <tr key={item._id}>
                        <td style={{ fontWeight: 600 }}>
                          {item.candidateId?.firstName} {item.candidateId?.lastName}
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {item.candidateId?.email}
                          </div>
                        </td>
                        <td>
                          <span className="type-badge">{item.verificationType}</span>
                        </td>
                        <td style={{ maxWidth: '280px' }}>
                          <span style={{ color: '#fb923c', fontSize: '13px', fontWeight: 500 }}>
                            {item.aiAnalysis?.summary || 'Date mismatch or partial match detected'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                            {Math.round((item.aiAnalysis?.confidence || 0.68) * 100)}%
                          </span>
                        </td>
                        <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                          {item.aiAnalysis?.recommendedAction || 'Requires manual review'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => openEvidenceModal(item, 'review')}
                              title="Review evidence & decide"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              <Eye size={13} />
                              <span>Review & Decide</span>
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEvidenceModal(item, 'bot')}
                              title="Inspect bot logs"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                            >
                              <Bot size={13} style={{ color: '#38bdf8' }} />
                              <span>Trail</span>
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleRerunBot(item)}
                              disabled={isRerunning}
                              title={`Re-run Playwright Bot (${liveBrowserMode ? 'Live Visible Window' : 'Background Headless'})`}
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                            >
                              {isRerunning ? (
                                <RefreshCw size={13} className="animate-spin" style={{ color: '#38bdf8' }} />
                              ) : (
                                <Play size={13} style={{ color: liveBrowserMode ? '#34d399' : '#a78bfa' }} />
                              )}
                              <span>{isRerunning ? 'Running...' : 'Re-run'}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedVerification && (
        <EvidenceViewerModal
          verification={selectedVerification}
          isOpen={!!selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onUpdated={loadQueue}
          initialTab={initialTab}
        />
      )}
    </div>
  );
}
