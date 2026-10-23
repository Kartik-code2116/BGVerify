import { useState, useEffect } from 'react';
import { verificationAPI } from '../../services/api';
import { FileSearch, Filter, Eye, RefreshCw } from 'lucide-react';
import EvidenceViewerModal from '../../components/EvidenceViewerModal';
import toast from 'react-hot-toast';

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
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
            <h2>Global Verifications Directory</h2>
            <p>Inspect and audit background checks executed across all tenant accounts</p>
          </div>
          <button className="btn btn-secondary" onClick={loadVerifications}>
            <RefreshCw size={16} />
            Refresh
          </button>
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
          <option value="manual_review">Manual Review</option>
          <option value="in_progress">In Progress</option>
          <option value="pending">Pending</option>
        </select>

        <select
          className="form-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="">All Verification Types</option>
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
              <h3>No verifications found</h3>
              <p>Try adjusting your search filters</p>
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
                    <th>Created</th>
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
                      </td>
                      <td>
                        <span className="type-badge">{v.verificationType}</span>
                      </td>
                      <td>
                        <span style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          color: v.priority === 'urgent' ? '#ef4444' : v.priority === 'high' ? '#f59e0b' : 'var(--text-secondary)'
                        }}>
                          {v.priority}
                        </span>
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
                          <Eye size={14} />
                          Review Evidence
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
          onUpdated={loadVerifications}
        />
      )}
    </div>
  );
}
