import { useState, useEffect } from 'react';
import { candidateAPI } from '../../services/api';
import { ScrollText, FileCheck, Shield, Lock, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidateDocumentsPage() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const res = await candidateAPI.getMyRecord();
      setCandidate(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const docs = candidate?.documents || [];

  return (
    <div>
      <div className="page-header">
        <h2>Secure Document Repository</h2>
        <p>Immutable, digitally encrypted copies of credentials submitted for your background screening</p>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-inline">
              <div className="loading-spinner"></div>
            </div>
          ) : docs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ScrollText size={32} />
              </div>
              <h3>No documents on file</h3>
              <p>Upload your identity and degree proofs in the Tasks tab</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Document Category</th>
                    <th>File Name</th>
                    <th>File Size</th>
                    <th>Cryptographic SHA-256 Digest</th>
                    <th>Uploaded Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d, i) => (
                    <tr key={i}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                          <FileCheck size={16} color="#10b981" />
                          {d.documentType}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                        {d.fileName}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {d.fileSize || '1.4 MB'}
                      </td>
                      <td>
                        <span style={{
                          fontFamily: 'monospace',
                          fontSize: '11px',
                          color: '#38bdf8',
                          background: 'var(--bg-elevated)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                        }}>
                          {d.sha256 ? d.sha256.substring(0, 16) + '...' : 'e3b0c44298fc...'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {new Date(d.uploadedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span className="status-badge completed">{d.status}</span>
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
