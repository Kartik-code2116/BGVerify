import { useState, useEffect } from 'react';
import { verificationAPI, candidateAPI } from '../services/api';
import { X, ShieldCheck, AlertCircle, Coins, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const verificationTypes = [
  { value: 'employment', label: 'Employment Verification' },
  { value: 'education', label: 'Education Verification' },
  { value: 'identity', label: 'Identity Verification (Aadhaar/PAN)' },
  { value: 'address', label: 'Physical Address Check' },
  { value: 'criminal', label: 'Criminal Records Check' },
  { value: 'court_records', label: 'Court & Legal Records' },
  { value: 'passport', label: 'Passport Verification' },
  { value: 'driving_license', label: 'Driving License Check' },
  { value: 'credit_check', label: 'Credit History Check' },
  { value: 'social_media', label: 'Social Media & Media Scan' },
  { value: 'reference_check', label: 'Professional Reference Check' },
  { value: 'global_sanctions', label: 'Global Sanctions & Watchlist' },
];

export default function NewVerificationModal({ isOpen, onClose, onSuccess, initialCandidateId }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    candidateId: initialCandidateId || '',
    verificationType: 'employment',
    priority: 'medium',
    company: '',
    designation: '',
    institution: '',
    degree: '',
    idNumber: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCandidates();
      if (initialCandidateId) {
        setFormData((prev) => ({ ...prev, candidateId: initialCandidateId }));
      }
    }
  }, [isOpen, initialCandidateId]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await candidateAPI.list({ limit: 50 });
      setCandidates(res.data.data.candidates || []);
      if (!formData.candidateId && res.data.data.candidates?.length > 0) {
        setFormData((prev) => ({ ...prev, candidateId: res.data.data.candidates[0]._id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate list');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.candidateId) {
      toast.error('Please select a candidate');
      return;
    }

    setSubmitting(true);
    try {
      const inputData = {};
      if (formData.verificationType === 'employment') {
        inputData.company = formData.company;
        inputData.designation = formData.designation;
      } else if (formData.verificationType === 'education') {
        inputData.institution = formData.institution;
        inputData.degree = formData.degree;
      } else if (formData.idNumber) {
        inputData.idNumber = formData.idNumber;
      }

      await verificationAPI.create({
        candidateId: formData.candidateId,
        verificationType: formData.verificationType,
        priority: formData.priority,
        inputData,
      });

      toast.success('Verification job dispatched! 1 BGCoin deducted.');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || 'Failed to submit verification request';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3b82f6',
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3>New AI Verification Request</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Powered by Playwright bots & AI evidence extraction
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* BGCoin notice badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '12px',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '13px', fontWeight: 500 }}>
                <Coins size={18} />
                <span>Standard Charge: <strong>1 BGCoin</strong></span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Deducted upon job dispatch</span>
            </div>

            <div className="form-group">
              <label className="form-label">Select Candidate *</label>
              {loading ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading candidates...</div>
              ) : (
                <select
                  className="form-select"
                  value={formData.candidateId}
                  onChange={(e) => setFormData({ ...formData, candidateId: e.target.value })}
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.firstName} {c.lastName} ({c.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Verification Type *</label>
              <select
                className="form-select"
                value={formData.verificationType}
                onChange={(e) => setFormData({ ...formData, verificationType: e.target.value })}
              >
                {verificationTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.verificationType === 'employment' && (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Infosys Ltd"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Designation / Role</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior Software Engineer"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              </div>
            )}

            {formData.verificationType === 'education' && (
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">University / College</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pune University"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Degree / Qualification</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MBA Finance"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  />
                </div>
              </div>
            )}

            {(['identity', 'passport', 'driving_license'].includes(formData.verificationType)) && (
              <div className="form-group">
                <label className="form-label">Identifier / Document Reference Number</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. XXXX-XXXX-1234 or DL/Passport Number"
                  value={formData.idNumber}
                  onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Execution Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Standard / Low (within 24 hrs)</option>
                <option value="medium">Medium (within 4 hrs)</option>
                <option value="high">High (within 1 hr)</option>
                <option value="urgent">Urgent / Real-Time Bot Dispatch</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Dispatching Bot...' : 'Dispatch Verification (1 BGCoin)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
