import { useState, useEffect } from 'react';
import { verificationAPI, candidateAPI, portalAPI } from '../services/api';
import { X, ShieldCheck, Coins, Bot, Sparkles, Building, GraduationCap, Hash, Calendar, Eye, EyeOff, AlertTriangle, Globe } from 'lucide-react';
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
  const [liveBrowserMode, setLiveBrowserMode] = useState(() => {
    return localStorage.getItem('bgverify_live_browser_mode') === 'true';
  });
  const [simulateDiscrepancy, setSimulateDiscrepancy] = useState(false);
  const [dbPortals, setDbPortals] = useState([]);
  const [selectedPortalName, setSelectedPortalName] = useState('');
  const [selectedPortalUrl, setSelectedPortalUrl] = useState('');
  const [isCustomPortal, setIsCustomPortal] = useState(false);

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
      loadPortals();
    }
  }, [isOpen]);

  const loadPortals = async () => {
    try {
      const res = await portalAPI.list();
      const list = res.data?.data || [];
      setDbPortals(list);
      // Pre-select portal for current verification type
      const match = list.find((p) => p.category === formData.verificationType);
      if (match) {
        setSelectedPortalName(match.name);
        setSelectedPortalUrl(match.searchUrl || match.loginUrl);
      }
    } catch (err) {
      console.error('Failed to load portals:', err);
    }
  };

  useEffect(() => {
    if (dbPortals.length > 0 && !isCustomPortal) {
      const match = dbPortals.find((p) => p.category === formData.verificationType);
      if (match) {
        setSelectedPortalName(match.name);
        setSelectedPortalUrl(match.searchUrl || match.loginUrl);
      }
    }
  }, [formData.verificationType, dbPortals]);

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

      if (selectedPortalName) {
        inputData.portalName = selectedPortalName;
      }
      if (selectedPortalUrl) {
        inputData.portalUrl = selectedPortalUrl;
      }

      await verificationAPI.create({
        candidateId: formData.candidateId,
        verificationType: formData.verificationType,
        priority: formData.priority,
        headless: !liveBrowserMode,
        inputData: {
          ...inputData,
          simulateDiscrepancy,
          headless: !liveBrowserMode,
        },
      });

      toast.success(
        liveBrowserMode
          ? '🚀 Playwright Chromium window launched & verification executed!'
          : '✅ Verification check dispatched & Playwright bot query completed!'
      );
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

            {/* Target Portal Selector */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={14} style={{ color: '#38bdf8' }} />
                  <span>Target Verification Portal (Playwright Automation Gate) *</span>
                </label>
                <span style={{ fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
                  ✓ Stored Credentials Linked
                </span>
              </div>
              <select
                className="form-select"
                value={isCustomPortal ? 'custom' : selectedPortalName}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setIsCustomPortal(true);
                    setSelectedPortalName('');
                    setSelectedPortalUrl('https://');
                  } else {
                    setIsCustomPortal(false);
                    const match = dbPortals.find((p) => p.name === e.target.value);
                    if (match) {
                      setSelectedPortalName(match.name);
                      setSelectedPortalUrl(match.searchUrl || match.loginUrl);
                    } else {
                      setSelectedPortalName(e.target.value);
                    }
                  }
                }}
              >
                {dbPortals
                  .filter((p) => p.category === formData.verificationType || p.category === 'custom')
                  .map((p) => (
                    <option key={p._id} value={p.name}>
                      🏛️ {p.name} (Vault Login: {p.username})
                    </option>
                  ))}
                <option value="National Academic Registrar Clearinghouse (NAD)">
                  🏛️ National Academic Depository (Central Government Clearinghouse)
                </option>
                <option value="Corporate Verification Clearinghouse & Employer Registry">
                  🏢 Corporate Employment Clearinghouse & EPFO Registry
                </option>
                <option value="custom">🌐 Enter Custom Portal / Website URL...</option>
              </select>

              {isCustomPortal && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Portal Name (e.g. SPPU / Anna Univ)"
                    value={selectedPortalName}
                    onChange={(e) => setSelectedPortalName(e.target.value)}
                    required
                  />
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://portal.university.ac.in/verify"
                    value={selectedPortalUrl}
                    onChange={(e) => setSelectedPortalUrl(e.target.value)}
                    required
                  />
                </div>
              )}
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

            {/* Playwright Automation Browser & Scenario Controls */}
            <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-950/20 space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot size={16} className="text-blue-400" />
                  <span className="text-xs font-bold text-white">Playwright Browser Agent Settings</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">
                  Chromium Engine
                </span>
              </div>

              {/* Toggle 1: Live Headed Chromium Window vs Headless */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    {liveBrowserMode ? <Eye size={14} className="text-emerald-400" /> : <EyeOff size={14} className="text-slate-400" />}
                    <span>Watch Real Chromium Browser Window</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {liveBrowserMode
                      ? 'Opens real visible Chromium window on your screen to watch the bot verify credentials.'
                      : 'Runs silently in background (headless sandbox).'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !liveBrowserMode;
                    setLiveBrowserMode(next);
                    localStorage.setItem('bgverify_live_browser_mode', String(next));
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    liveBrowserMode
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {liveBrowserMode ? 'LIVE: ON' : 'BACKGROUND'}
                </button>
              </div>

              {/* Toggle 2: Discrepancy Injection (Clean Pass vs Discrepancy Queue) */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <AlertTriangle size={13} className={simulateDiscrepancy ? 'text-amber-400' : 'text-slate-400'} />
                    <span>Test Discrepancy Simulation</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {simulateDiscrepancy
                      ? 'Flags date/title mismatch and routes candidate directly to Discrepancy Review Queue.'
                      : 'Executes standard match with high AI confidence score.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSimulateDiscrepancy(!simulateDiscrepancy)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    simulateDiscrepancy
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {simulateDiscrepancy ? 'DISCREPANCY' : 'CLEAN MATCH'}
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Mode: <strong style={{ color: liveBrowserMode ? '#34d399' : '#94a3b8' }}>{liveBrowserMode ? 'Headed (Watch Live)' : 'Headless (Background)'}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <Bot size={16} />
                {submitting ? 'Running Playwright Bot...' : 'Launch Playwright Verification (1 BGCoin)'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
