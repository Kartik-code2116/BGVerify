import { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api';
import { ShieldAlert, CheckCircle2, AlertTriangle, Eye, RefreshCw } from 'lucide-react';
import EvidenceViewerModal from '../../components/EvidenceViewerModal';
import toast from 'react-hot-toast';

export default function CompanyReviewQueuePage() {
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
            <h2>Discrepancy Review Queue</h2>
            <p>Verification results flagged for HR review due to discrepancies between candidate CV and source evidence</p>
          </div>
          <button className="btn btn-secondary" onClick={loadQueue}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

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
              <h3>No Discrepancies Flagged</h3>
              <p>All candidates submitted by your company have matched automated verification sources.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Check Type</th>
                    <th>Flagged Discrepancy</th>
                    <th>Confidence</th>
                    <th>Recommended Next Step</th>
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
                      <td style={{ maxWidth: '300px' }}>
                        <div style={{ color: '#fb923c', fontSize: '13px', fontWeight: 500 }}>
                          {item.aiAnalysis?.summary}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 700, color: '#f59e0b' }}>
                          {Math.round((item.aiAnalysis?.confidence || 0.68) * 100)}%
                        </span>
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {item.aiAnalysis?.recommendedAction}
                      </td>
                      <td>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => setSelectedVerification(item)}
                        >
                          <Eye size={14} /> Review & Act
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
