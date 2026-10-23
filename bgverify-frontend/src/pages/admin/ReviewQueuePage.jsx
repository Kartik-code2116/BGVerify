import { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api';
import { ShieldAlert, CheckCircle2, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import EvidenceViewerModal from '../../components/EvidenceViewerModal';
import toast from 'react-hot-toast';

export default function ReviewQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);

  useEffect(() => {
    loadQueue();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await verificationAPI.list({ status: 'manual_review' });
      setQueue(res.data.data.verifications || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load review queue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Human-in-the-Loop Review Queue</h2>
            <p>
              Cases flagged by AI bots with date discrepancies, partial name matches, or ambiguous evidence
            </p>
          </div>
          <button className="btn btn-secondary" onClick={loadQueue}>
            <RefreshCw size={16} />
            Refresh Queue
          </button>
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
            An LLM never independently disqualifies a candidate. Ambiguous evidence triggers human-review workflows with auditable rationale.
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {queue.map((item) => (
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
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedVerification(item)}
                        >
                          <Eye size={14} />
                          Review & Decide
                        </button>
                      </td>
                    </tr>
                  ))}
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
        />
      )}
    </div>
  );
}
