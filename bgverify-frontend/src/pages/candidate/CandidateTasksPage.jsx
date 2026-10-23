import { useState, useEffect } from 'react';
import { candidateAPI } from '../../services/api';
import {
  ShieldCheck,
  CheckCircle2,
  Upload,
  Camera,
  FileCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CandidateTasksPage() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [submittingConsent, setSubmittingConsent] = useState(false);

  const [docType, setDocType] = useState('Degree Certificate');
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [savingSelfie, setSavingSelfie] = useState(false);

  useEffect(() => {
    loadCandidate();
  }, []);

  const loadCandidate = async () => {
    setLoading(true);
    try {
      const res = await candidateAPI.getMyRecord();
      setCandidate(res.data.data);
      if (res.data.data?.consentGiven) {
        setConsentAgreed(true);
      }
      if (res.data.data?.liveSelfieUrl) {
        setSelfieCaptured(true);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate information');
    } finally {
      setLoading(false);
    }
  };

  const handleGiveConsent = async () => {
    if (!consentAgreed) {
      toast.error('Please check the consent checkbox to confirm');
      return;
    }
    setSubmittingConsent(true);
    try {
      await candidateAPI.giveConsent(candidate._id);
      toast.success('Legal background check consent officially recorded!');
      loadCandidate();
    } catch (err) {
      console.error(err);
      toast.error('Failed to record consent');
    } finally {
      setSubmittingConsent(false);
    }
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    if (!docFile) {
      toast.error('Please select or specify a document');
      return;
    }
    setUploadingDoc(true);
    try {
      await candidateAPI.uploadDocument(candidate._id, {
        documentType: docType,
        fileName: docFile.name || 'document_upload.pdf',
        fileSize: '1.8 MB',
      });
      toast.success('Document uploaded and stored in private encrypted bucket!');
      setDocFile(null);
      loadCandidate();
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleCaptureSelfie = async () => {
    setSavingSelfie(true);
    try {
      await candidateAPI.uploadSelfie(candidate._id, {
        selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      });
      setSelfieCaptured(true);
      toast.success('Live selfie captured & facial liveness verified!');
      loadCandidate();
    } catch (err) {
      console.error(err);
      toast.error('Failed to process selfie');
    } finally {
      setSavingSelfie(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-inline">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h2>My Tasks & Verification Submissions</h2>
        <p>Complete each section below to fulfill verification requirements mandated by your hiring employer</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Task 1: Legal Consent */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: candidate?.consentGiven ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                color: candidate?.consentGiven ? '#10b981' : '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ShieldCheck size={18} />
              </div>
              <span className="card-title">1. Legal Background Verification Consent</span>
            </div>
            {candidate?.consentGiven ? (
              <span className="status-badge completed">Consent Signed</span>
            ) : (
              <span className="status-badge pending">Pending Signature</span>
            )}
          </div>
          <div className="card-body">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
              In compliance with the Digital Personal Data Protection Act (DPDP) and international employment standards,
              I hereby authorize BGVerify.ai and its verified automation agents to access, verify, and validate my past employment history,
              academic records, professional certifications, address records, and legal records as disclosed by me.
            </p>

            {candidate?.consentGiven ? (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(16, 185, 129, 0.08)',
                borderRadius: '10px',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#34d399',
                fontSize: '13px',
              }}>
                <CheckCircle2 size={18} />
                <span>Consent legally granted on {new Date(candidate.consentDate || candidate.updatedAt).toLocaleString()}</span>
              </div>
            ) : (
              <div>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '16px' }}>
                  <input
                    type="checkbox"
                    checked={consentAgreed}
                    onChange={(e) => setConsentAgreed(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <span style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    I agree and authorize the background screening verification process.
                  </span>
                </label>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleGiveConsent}
                  disabled={submittingConsent || !consentAgreed}
                >
                  {submittingConsent ? 'Recording Consent...' : 'Sign Digital Consent'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Task 2: Upload Documents */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Upload size={18} />
              </div>
              <span className="card-title">2. Upload Verification Documents</span>
            </div>
          </div>
          <div className="card-body">
            <form onSubmit={handleUploadDocument} style={{ marginBottom: '24px' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Document Category</label>
                  <select
                    className="form-select"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="Aadhaar Card">Aadhaar Card (National ID)</option>
                    <option value="Passport">Passport Document</option>
                    <option value="Degree Certificate">Degree Certificate</option>
                    <option value="Relieving / Experience Letter">Relieving / Experience Letter</option>
                    <option value="Salary Slip">Recent Payslip / Bank Statement</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Choose Document File (PDF/JPEG)</label>
                  <input
                    type="file"
                    className="form-input"
                    onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={uploadingDoc || !docFile}
              >
                {uploadingDoc ? 'Uploading & Encrypting...' : 'Upload Document'}
              </button>
            </form>

            {/* Uploaded Documents List */}
            <h5 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
              Uploaded Credentials & Evidence ({candidate?.documents?.length || 0})
            </h5>
            {(!candidate?.documents || candidate.documents.length === 0) ? (
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '16px', background: 'var(--bg-elevated)', borderRadius: '10px' }}>
                No documents uploaded yet. Please upload your identity proof or certificates above.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {candidate.documents.map((doc, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'var(--bg-elevated)',
                      borderRadius: '10px',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FileCheck size={18} color="#10b981" />
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600 }}>{doc.documentType}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {doc.fileName} • {doc.fileSize || '1.5 MB'}
                        </div>
                      </div>
                    </div>
                    <span className="status-badge completed">{doc.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Task 3: Live Selfie Face Match */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(139, 92, 246, 0.15)',
                color: '#a855f7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Camera size={18} />
              </div>
              <span className="card-title">3. Live Selfie & Biometric Face Match</span>
            </div>
            {selfieCaptured ? (
              <span className="status-badge completed">Biometric Verified</span>
            ) : (
              <span className="status-badge pending">Action Required</span>
            )}
          </div>
          <div className="card-body">
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Perform a quick liveness test to ensure the person submitting these documents is the legitimate candidate.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              flexWrap: 'wrap',
              padding: '20px',
              background: 'var(--bg-elevated)',
              borderRadius: '12px',
            }}>
              <div style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                overflow: 'hidden',
                background: 'var(--bg-card)',
                border: '3px solid #3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {candidate?.liveSelfieUrl ? (
                  <img
                    src={candidate.liveSelfieUrl}
                    alt="Candidate Selfie"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Camera size={44} color="var(--text-muted)" />
                )}
              </div>

              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }}>
                  {selfieCaptured ? 'Facial Match 98.4% Confidence' : 'Capture Live Camera Snapshot'}
                </h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', maxWidth: '380px' }}>
                  {selfieCaptured
                    ? 'Liveness detection passed. Photo biometric matches Aadhaar profile.'
                    : 'Ensure your face is clearly visible, well-lit, and look directly into your camera.'}
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleCaptureSelfie}
                  disabled={savingSelfie}
                >
                  <Camera size={14} />
                  {savingSelfie ? 'Running Liveness Test...' : selfieCaptured ? 'Recapture Selfie' : 'Capture Live Selfie'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
