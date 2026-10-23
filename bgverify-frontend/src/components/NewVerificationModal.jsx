import { useState, useEffect } from 'react';
import { verificationAPI, candidateAPI } from '../services/api';
import { X, ShieldCheck, Coins, Bot, Sparkles, Building, GraduationCap, Hash, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const verificationTypes = [
  { value: 'education', label: 'Education Verification (University / Board)' },
  { value: 'employment', label: 'Employment Verification (Past Company / EPFO)' },
  { value: 'identity', label: 'Identity Verification (Aadhaar / PAN)' },
  { value: 'criminal', label: 'Criminal & Police Records Check' },
  { value: 'address', label: 'Physical Address Check' },
  { value: 'court_records', label: 'Court & Legal Case Records' },
  { value: 'passport', label: 'Passport Validation' },
  { value: 'credit_check', label: 'Credit History Check' },
  { value: 'reference_check', label: 'Professional Reference Check' },
];

export default function NewVerificationModal({ isOpen, onClose, onSuccess, initialCandidateId }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    candidateId: initialCandidateId || '',
    verificationType: 'education',
    priority: 'medium',

    // Education fields
    institution: '',
    degree: '',
    rollNumber: '',
    endYear: '',

    // Employment fields
    company: '',
    designation: '',
    employeeId: '',

    // Identity fields
    idNumber: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCandidates();
    }
  }, [isOpen]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await candidateAPI.list({ limit: 50 });
      const list = res.data.data.candidates || [];
      setCandidates(list);

      const targetId = initialCandidateId || (list.length > 0 ? list[0]._id : '');
      if (targetId) {
        handleCandidateSelect(targetId, list);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate list');
    } finally {
      setLoading(false);
    }
  };

  const handleCandidateSelect = (candidateId, list = candidates) => {
    const sel = list.find((c) => c._id === candidateId);
    if (sel) {
      const edu = sel.education?.[0] || {};
      const emp = sel.employment?.[0] || {};
      setFormData((prev) => ({
        ...prev,
        candidateId,
        priority: sel.urgency || prev.priority || 'medium',
        institution: edu.institution || '',
        degree: edu.degree || '',
        rollNumber: edu.rollNumber || '',
        endYear: edu.endYear || '',
        company: emp.company || '',
        designation: emp.designation || '',
        employeeId: emp.employeeId || '',
        idNumber: sel.aadhaarNumber || sel.panNumber || '',
      }));
    } else {
      setFormData((prev) => ({ ...prev, candidateId }));
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
      if (formData.verificationType === 'education') {
        inputData.institution = formData.institution;
        inputData.degree = formData.degree;
        inputData.rollNumber = formData.rollNumber;
        inputData.endYear = formData.endYear;
      } else if (formData.verificationType === 'employment') {
        inputData.company = formData.company;
        inputData.designation = formData.designation;
        inputData.employeeId = formData.employeeId;
      } else if (formData.idNumber) {
        inputData.idNumber = formData.idNumber;
      }

      await verificationAPI.create({
        candidateId: formData.candidateId,
        verificationType: formData.verificationType,
        priority: formData.priority,
        inputData,
      });

      toast.success('Verification check dispatched & Playwright bot query completed!');
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

  const selectedCandidate = candidates.find((c) => c._id === formData.candidateId);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
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
              <h3>Dispatch AI Verification Check</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Autonomous Playwright bot searches official databases & performs AI match
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Cost banner */}
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
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Atomic deduction from org wallet</span>
            </div>

            <div className="form-group">
              <label className="form-label">Select Candidate / Student *</label>
              {loading ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading directory...</div>
              ) : (
                <select
                  className="form-select"
                  value={formData.candidateId}
                  onChange={(e) => handleCandidateSelect(e.target.value)}
                  required
                >
                  <option value="">-- Choose Candidate --</option>
                  {candidates.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.firstName} {c.lastName} {c.targetRole ? `— ${c.targetRole}` : ''} {c.sector ? `(${c.sector.split('&')[0].trim()})` : ''} {c.urgency === 'urgent' ? '🚨 [URGENT 24h]' : ''}
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

            {/* Dynamic Bot Query Parameters */}
            {formData.verificationType === 'education' && (
              <div style={{
                background: 'var(--bg-elevated)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                  <GraduationCap size={16} />
                  <span>Parameters for University Portal Bot</span>
                </div>

                <div className="form-group">
                  <label className="form-label">University / Examining Board</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Pune University / SPPU"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    required
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Degree / Program</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. B.Tech Computer Science"
                      value={formData.degree}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Roll Number / PRN (Bot Search Key)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 71928341"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Passing / Graduation Year</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="2024"
                    value={formData.endYear}
                    onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                  />
                </div>
              </div>
            )}

            {formData.verificationType === 'employment' && (
              <div style={{
                background: 'var(--bg-elevated)',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>
                  <Building size={16} />
                  <span>Parameters for Employer Verification Bot</span>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Employer Company</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Infosys Ltd"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Designation / Role</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Software Engineer"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Employee ID (if available)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. INF-45678"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>
              </div>
            )}

            {(['identity', 'passport', 'criminal'].includes(formData.verificationType)) && (
              <div className="form-group">
                <label className="form-label">Identifier (Aadhaar / PAN / National ID Reference)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. XXXX-XXXX-1234"
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
              {submitting ? 'Running Bot...' : 'Launch Playwright Verification (1 BGCoin)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
