import { useState, useEffect } from 'react';
import { candidateAPI, verificationAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { NavLink } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  UploadCloud,
  Camera,
  FileText,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const [candidate, setCandidate] = useState(null);
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCandidateData();
  }, []);

  const loadCandidateData = async () => {
    setLoading(true);
    try {
      const [candRes, verifRes] = await Promise.all([
        candidateAPI.getMyRecord(),
        verificationAPI.list(),
      ]);
      setCandidate(candRes.data.data);
      setVerifications(verifRes.data.data.verifications || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-inline">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const consentDone = candidate?.consentGiven;
  const docsUploaded = (candidate?.documents?.length || 0) > 0;
  const selfieDone = !!candidate?.liveSelfieUrl;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Candidate Verification Hub</h2>
            <p>Welcome, {candidate?.firstName || user?.firstName}. Complete your onboarding tasks to finalize verification.</p>
          </div>
          <NavLink to="/candidate/tasks" className="btn btn-primary">
            Complete Tasks <ArrowRight size={16} />
          </NavLink>
        </div>
      </div>

      {/* Verification Steps Progress Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <span className="card-title">Verification Readiness Checklist</span>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Governed under Indian DPDP & Employment Verification Standards
          </span>
        </div>
        <div className="card-body">
          <div className="grid-3">
            {/* Step 1: Consent */}
            <div style={{
              padding: '18px',
              borderRadius: '12px',
              background: consentDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
              border: consentDone ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: consentDone ? '#34d399' : 'var(--text-muted)' }}>
                  Step 1: Consent
                </span>
                {consentDone ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <Clock size={18} color="#f59e0b" />
                )}
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                Legal Background Check Consent
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {consentDone ? 'Consent signed & digitally stamped.' : 'Action Required: Give consent to begin.'}
              </p>
            </div>

            {/* Step 2: Documents */}
            <div style={{
              padding: '18px',
              borderRadius: '12px',
              background: docsUploaded ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
              border: docsUploaded ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: docsUploaded ? '#34d399' : 'var(--text-muted)' }}>
                  Step 2: Uploads
                </span>
                {docsUploaded ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <UploadCloud size={18} color="#f59e0b" />
                )}
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                Credentials & ID Proof
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {docsUploaded ? `${candidate?.documents?.length} document(s) uploaded & encrypted.` : 'Upload Aadhaar, Degree or Experience letter.'}
              </p>
            </div>

            {/* Step 3: Live Selfie */}
            <div style={{
              padding: '18px',
              borderRadius: '12px',
              background: selfieDone ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-elevated)',
              border: selfieDone ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-default)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: selfieDone ? '#34d399' : 'var(--text-muted)' }}>
                  Step 3: Biometric
                </span>
                {selfieDone ? (
                  <CheckCircle2 size={18} color="#10b981" />
                ) : (
                  <Camera size={18} color="#f59e0b" />
                )}
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                Live Selfie & Face Match
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {selfieDone ? 'Facial liveness captured successfully.' : 'Capture live selfie for identity matching.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ongoing Verifications */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Checks Requested by Employer</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Verification Category</th>
                  <th>Current Status</th>
                  <th>Outcome</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {verifications.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '30px' }}>
                      No checks active right now
                    </td>
                  </tr>
                ) : (
                  verifications.map((v) => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        <span className="type-badge">{v.verificationType}</span>
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
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {new Date(v.updatedAt || v.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
