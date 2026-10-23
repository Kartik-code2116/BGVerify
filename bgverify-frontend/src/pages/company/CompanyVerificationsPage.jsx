import { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api';
import { FileSearch, Plus, Filter, Eye, RefreshCw } from 'lucide-react';
import NewVerificationModal from '../../components/NewVerificationModal';
import EvidenceViewerModal from '../../components/EvidenceViewerModal';
import toast from 'react-hot-toast';

export default function CompanyVerificationsPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);

  useEffect(() => {
    loadVerifications();
  }, [statusFilter, typeFilter]);

  const loadVerifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.verificationType = typeFilter;
      const res = await verificationAPI.list(params);
      setVerifications(res.data.data.verifications || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load verifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Verification Requests</h2>
            <p>Track automated background verification pipelines across all candidate checks</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={loadVerifications}>
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="btn btn-primary" onClick={() => setIsNewModalOpen(true)}>
              <Plus size={16} /> New Verification
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="manual_review">Manual Review</option>
          <option value="pending">Pending</option>
        </select>

        <select
          className="form-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Check Types</option>
          <option value="employment">Employment</option>
          <option value="education">Education</option>
          <option value="identity">Identity</option>
          <option value="criminal">Criminal Check</option>
          <option value="address">Address Check</option>
          <option value="credit_check">Credit Check</option>
        </select>
      </div>

      {/* Verifications Table */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-inline">
              <div className="loading-spinner"></div>
            </div>
          ) : verifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileSearch size={32} />
              </div>
              <h3>No verification requests found</h3>
              <p>Click &quot;New Verification&quot; to initiate your first automated check</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Type</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Result</th>
                    <th>Confidence</th>
                    <th>Submitted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {verifications.map((v) => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 600 }}>
                        {v.candidateId?.firstName} {v.candidateId?.lastName}
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {v.candidateId?.email}
                        </div>
                        {v.candidateId?.targetRole && (
                          <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
                            {v.candidateId?.targetRole} {v.candidateId?.sector ? `• ${v.candidateId.sector.split('&')[0].trim()}` : ''}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="type-badge">{v.verificationType}</span>
                      </td>
                      <td>
                        {v.priority === 'urgent' ? (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#f43f5e',
                            background: 'rgba(244, 63, 94, 0.15)',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            border: '1px solid rgba(244, 63, 94, 0.3)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}>
                            🚨 URGENT (24h)
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            color: v.priority === 'high' ? '#f59e0b' : 'var(--text-secondary)'
                          }}>
                            {v.priority}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`status-badge ${v.status}`}>
                          {v.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${v.result}`}>
                          {v.result}
                        </span>
                      </td>
                      <td>
                        {v.aiAnalysis?.confidence ? (
                          <span style={{ fontWeight: 700, color: '#34d399' }}>
                            {Math.round(v.aiAnalysis.confidence * 100)}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {new Date(v.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedVerification(v)}
                        >
                          <Eye size={14} /> View Report
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

      <NewVerificationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={loadVerifications}
      />

      {selectedVerification && (
        <EvidenceViewerModal
          verification={selectedVerification}
          isOpen={!!selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onUpdated={loadVerifications}
        />
      )}
    </div>
  );
}
