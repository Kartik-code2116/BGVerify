import { useState, useEffect } from 'react';
import { auditAPI } from '../../services/api';
import { ScrollText, ShieldCheck, Lock, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuditLogs();
  }, []);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const res = await auditAPI.list();
      setLogs(res.data.data.logs || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load audit trail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Audit & Security Trail</h2>
            <p>Cryptographically hashed, append-only ledger of compliance and system operations</p>
          </div>
          <button className="btn btn-secondary" onClick={loadAuditLogs}>
            <RefreshCw size={16} />
            Refresh Trail
          </button>
        </div>
      </div>

      <div style={{
        padding: '14px 18px',
        background: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '13px',
        color: '#93c5fd',
      }}>
        <Lock size={18} />
        <span>
          Compliance Notice: All operations, BGCoin debits, and verification reviews are logged with immutable actor timestamps conforming to DPDP standards.
        </span>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-inline">
              <div className="loading-spinner"></div>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ScrollText size={32} />
              </div>
              <h3>No audit entries recorded yet</h3>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Resource Type</th>
                    <th>Resource ID</th>
                    <th>Actor ID</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'var(--bg-elevated)',
                          color: '#38bdf8',
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ textTransform: 'capitalize', fontSize: '13px' }}>
                        {log.resourceType}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {log.resourceId?.substring(0, 10)}...
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {log.userId?.substring(0, 10)}...
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
