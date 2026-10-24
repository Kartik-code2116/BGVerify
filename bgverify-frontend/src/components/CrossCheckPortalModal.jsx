import { useState, useEffect } from 'react';
import { verificationAPI, portalAPI } from '../services/api';
import {
  X,
  Globe,
  Bot,
  Play,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building,
  GraduationCap,
  Hash,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Curated list of popular institutional portals across sectors
const PORTAL_PRESETS = {
  education: [
    {
      name: 'DigiLocker National Academic Depository (NAD)',
      url: 'https://nad.digitallocker.gov.in/academic/verify',
      badge: 'National Central Repository',
      description: 'Official Government of India academic depository holding 2.5B+ accredited certificates.',
    },
    {
      name: 'Savitribai Phule Pune University (SPPU Portal)',
      url: 'https://unipune.ac.in/electronic-verify',
      badge: 'State University',
      description: 'Online degree verification system for SPPU affiliated colleges and autonomous institutes.',
    },
    {
      name: 'University of Mumbai (e-Suvidha Portal)',
      url: 'https://mum.digitaluniversity.ac/verify',
      badge: 'State University',
      description: 'Digital transcript and mark-sheet electronic registry for Mumbai University.',
    },
    {
      name: 'Visvesvaraya Technological University (VTU Registrar)',
      url: 'https://vtu.ac.in/electronic-transcript',
      badge: 'Engineering University',
      description: 'VTU Electronic Document Verification System for engineering degrees.',
    },
    {
      name: 'Delhi University (DU Examination Branch)',
      url: 'https://exam.du.ac.in/student-records',
      badge: 'Central University',
      description: 'Official registrar records and degree ledger for University of Delhi.',
    },
    {
      name: 'Anna University (COE Verification Portal)',
      url: 'https://coe1.annauniv.edu/verify-degree',
      badge: 'State University',
      description: 'Controller of Examinations automated candidate verification gateway.',
    },
    {
      name: 'World Education Services (WES Gateway)',
      url: 'https://applications.wes.org/credential-eval',
      badge: 'International / WES',
      description: 'International academic equivalence clearinghouse and global transcript validation.',
    },
  ],
  employment: [
    {
      name: 'EPFO Member Portal (UAN Service History)',
      url: 'https://unifiedportal-mem.epfindia.gov.in/service-history',
      badge: 'Government EPFO',
      description: 'Universal Account Number (UAN) passbook and authenticated EPF monthly contribution records.',
    },
    {
      name: 'MCA21 Company & Director Registry',
      url: 'https://mca.gov.in/mcafoportal/verify-director',
      badge: 'Ministry of Corporate Affairs',
      description: 'MCA company registration, signatory details, and incorporation ledger.',
    },
    {
      name: 'NASSCOM National Skills Registry (NSR)',
      url: 'https://nationalskillsregistry.com/verify-credentials',
      badge: 'IT & ITES Industry',
      description: 'Centralised information registry of verified professionals in the IT/BPM sector.',
    },
    {
      name: 'Corporate Alumni & Ex-Employee Portal',
      url: 'https://portal.alumni-verify.com/employment-check',
      badge: 'Corporate HR',
      description: 'Standardised enterprise clearinghouse for past employment duration and designation validation.',
    },
    {
      name: 'Workday Enterprise Verification Gateway',
      url: 'https://workday.com/verify-credentials',
      badge: 'Enterprise HRMS',
      description: 'Enterprise API portal verifying live and past corporate payroll employment entries.',
    },
  ],
  identity: [
    {
      name: 'UIDAI Resident Portal (Aadhaar Offline Verification)',
      url: 'https://myaadhaar.uidai.gov.in/verify-identity',
      badge: 'National UIDAI',
      description: 'Offline Aadhaar XML and QR cryptographic signature verification service.',
    },
    {
      name: 'Income Tax Department (NSDL PAN Registry)',
      url: 'https://eportal.incometax.gov.in/pan-verify',
      badge: 'CBDT / Income Tax',
      description: 'Verify PAN status and legal name matching against the central tax database.',
    },
    {
      name: 'Passport Seva Online (Ministry of External Affairs)',
      url: 'https://passportindia.gov.in/track-passport',
      badge: 'Ministry of External Affairs',
      description: 'Passport file status, issue date, and nationality validation portal.',
    },
  ],
  criminal: [
    {
      name: 'eCourts Services India (National Case Status)',
      url: 'https://services.ecourts.gov.in/case-search',
      badge: 'Supreme Court & High Courts',
      description: 'Pan-India district and high courts judicial case history and civil/criminal litigation records.',
    },
    {
      name: 'CCTNS (Crime & Criminal Tracking Network)',
      url: 'https://cctns.gov.in/police-verification',
      badge: 'Ministry of Home Affairs',
      description: 'National Police FIR and background records clearinghouse.',
    },
  ],
};

export default function CrossCheckPortalModal({
  isOpen,
  onClose,
  verification,
  onVerificationUpdated,
}) {
  if (!isOpen || !verification) return null;

  const candidate = verification.candidateId || {};
  const vType = verification.verificationType || 'education';
  const [dbPortals, setDbPortals] = useState([]);

  useEffect(() => {
    if (isOpen) {
      portalAPI.list().then((res) => {
        setDbPortals(res.data?.data || []);
      }).catch((err) => console.error('Failed to load user portals:', err));
    }
  }, [isOpen]);

  const defaultPresets = PORTAL_PRESETS[vType] || PORTAL_PRESETS.education;
  const orgPortalsForType = dbPortals
    .filter((p) => p.isActive)
    .sort((a, b) => (a.category === vType ? -1 : 1))
    .map((p) => ({
      name: p.name,
      url: p.searchUrl || p.loginUrl,
      badge: `${p.category?.toUpperCase()} • Vault Credentials`,
      description: `Configured credentials for username "${p.username}". ${p.authNotes || ''}`,
      isOrgVault: true,
      category: p.category,
    }));

  const presets = [...orgPortalsForType, ...defaultPresets];

  // Selected preset index or 'custom'
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [isCustomPortal, setIsCustomPortal] = useState(false);

  // Form State
  const [portalName, setPortalName] = useState(presets[0]?.name || '');
  const [portalUrl, setPortalUrl] = useState(presets[0]?.url || '');
  const [liveBrowserMode, setLiveBrowserMode] = useState(() => {
    return localStorage.getItem('bgverify_live_browser_mode') === 'true';
  });
  const [simulateDiscrepancy, setSimulateDiscrepancy] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Override credentials
  const [customData, setCustomData] = useState({
    institution: verification.inputData?.institution || candidate.education?.[0]?.institution || '',
    degree: verification.inputData?.degree || candidate.education?.[0]?.degree || '',
    rollNumber: verification.inputData?.rollNumber || candidate.education?.[0]?.rollNumber || '',
    endYear: verification.inputData?.endYear || candidate.education?.[0]?.endYear || '2024',
    company: verification.inputData?.company || candidate.employment?.[0]?.company || '',
    designation: verification.inputData?.designation || candidate.employment?.[0]?.designation || '',
    employeeId: verification.inputData?.employeeId || candidate.employment?.[0]?.employeeId || '',
    idNumber: verification.inputData?.idNumber || candidate.aadhaarNumber || candidate.panNumber || '',
  });

  const handleSelectPreset = (index) => {
    setSelectedPresetIndex(index);
    setIsCustomPortal(false);
    const item = presets[index];
    if (item) {
      setPortalName(item.name);
      setPortalUrl(item.url);
    }
  };

  const handleSelectCustom = () => {
    setIsCustomPortal(true);
    setSelectedPresetIndex(-1);
    setPortalName('');
    setPortalUrl('https://');
  };

  const handleExecute = async (e) => {
    e.preventDefault();
    if (!portalName.trim()) {
      toast.error('Please specify a portal name');
      return;
    }
    if (!portalUrl.trim() || !portalUrl.startsWith('http')) {
      toast.error('Please enter a valid portal URL starting with http:// or https://');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(
      liveBrowserMode
        ? `Launching visible Chromium window targeting ${portalName}...`
        : `Connecting Playwright bot to ${portalName} in background...`
    );

    try {
      const res = await verificationAPI.rerunBot(verification._id, {
        headless: !liveBrowserMode,
        simulateDiscrepancy,
        portalName,
        portalUrl,
        customInputData: customData,
      });

      const updated = res.data?.data?.verification;
      toast.success(
        `Cross-verification completed on "${portalName}"! Status: ${updated?.status || 'Done'}`,
        { id: toastId }
      );

      if (onVerificationUpdated) {
        onVerificationUpdated(updated || verification);
      }
      onClose();
    } catch (err) {
      console.error('Portal cross-verification error:', err);
      toast.error(
        err.response?.data?.error?.message || 'Failed to verify on target portal',
        { id: toastId }
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
              }}
            >
              <Globe size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ margin: 0 }}>Cross-Verify on External / Secondary Portal</h3>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.15)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                  }}
                >
                  {vType} Check
                </span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Candidate: <strong>{candidate.firstName} {candidate.lastName}</strong> ({candidate.email})
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleExecute} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Explanation Banner */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(14, 165, 233, 0.08)',
              border: '1px solid rgba(14, 165, 233, 0.25)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <Bot size={18} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
            <div>
              Select an authoritative alternate registry or specify a custom institutional URL. Playwright will launch against that exact portal, query the candidate credentials, capture full-page evidence, and update this verification docket.
            </div>
          </div>

          {/* Preset Portals vs Custom Tabs */}
          <div>
            <label className="form-label" style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Select Destination Verification Portal</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {presets.length} Curated Registries for {vType.replace('_', ' ')}
              </span>
            </label>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '10px',
                marginBottom: '14px',
              }}
            >
              {presets.map((item, idx) => {
                const isSelected = !isCustomPortal && selectedPresetIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectPreset(idx)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      border: isSelected
                        ? '2px solid #38bdf8'
                        : '1px solid var(--border-subtle)',
                      background: isSelected
                        ? 'rgba(56, 189, 248, 0.12)'
                        : 'rgba(30, 41, 59, 0.5)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '80px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            color: '#94a3b8',
                            fontWeight: 600,
                          }}
                        >
                          {item.badge}
                        </span>
                        {isSelected && <CheckCircle2 size={14} style={{ color: '#38bdf8' }} />}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                        {item.name}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.url}
                    </div>
                  </div>
                );
              })}

              {/* Custom Portal Card */}
              <div
                onClick={handleSelectCustom}
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: isCustomPortal
                    ? '2px solid #a855f7'
                    : '1px dashed rgba(255, 255, 255, 0.2)',
                  background: isCustomPortal
                    ? 'rgba(168, 85, 247, 0.12)'
                    : 'rgba(30, 41, 59, 0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: '80px',
                  textAlign: 'center',
                }}
              >
                <div style={{ color: isCustomPortal ? '#c084fc' : '#94a3b8', fontWeight: 600, fontSize: '13px', marginBottom: '4px' }}>
                  + Custom Portal URL
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Enter any university or employer website
                </div>
              </div>
            </div>
          </div>

          {/* Custom Portal Inputs (Shown if custom or editable) */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ExternalLink size={15} style={{ color: '#38bdf8' }} />
              <span>Target Portal Endpoint Configuration</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Portal Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Harvard University Registrar / SPPU Portal"
                  value={portalName}
                  onChange={(e) => setPortalName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Portal Web URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://registrar.institution.ac.in/verify"
                  value={portalUrl}
                  onChange={(e) => setPortalUrl(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Credential Query Parameters (Pre-filled, editable) */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Hash size={15} style={{ color: '#a78bfa' }} />
              <span>Query Parameters to Submit on Target Portal</span>
            </div>

            {vType === 'education' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>University / Board Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customData.institution}
                    onChange={(e) => setCustomData({ ...customData, institution: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Degree / Program</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customData.degree}
                    onChange={(e) => setCustomData({ ...customData, degree: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Roll Number / Registration PRN</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customData.rollNumber}
                    onChange={(e) => setCustomData({ ...customData, rollNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Graduation Year</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customData.endYear}
                    onChange={(e) => setCustomData({ ...customData, endYear: e.target.value })}
                  />
                </div>
              </div>
            )}

            {vType === 'employment' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Employer Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customData.company}
                    onChange={(e) => setCustomData({ ...customData, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Designation / Job Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customData.designation}
                    onChange={(e) => setCustomData({ ...customData, designation: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Employee ID / Staff Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customData.employeeId}
                    onChange={(e) => setCustomData({ ...customData, employeeId: e.target.value })}
                  />
                </div>
              </div>
            )}

            {vType === 'identity' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Aadhaar / PAN / ID Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={customData.idNumber}
                    onChange={(e) => setCustomData({ ...customData, idNumber: e.target.value })}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Execution Settings Toolbar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(30, 41, 59, 0.4)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {/* Live Browser Mode Switch */}
            <button
              type="button"
              onClick={() => {
                const next = !liveBrowserMode;
                setLiveBrowserMode(next);
                localStorage.setItem('bgverify_live_browser_mode', String(next));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '20px',
                border: liveBrowserMode ? '1px solid #10b981' : '1px solid #475569',
                background: liveBrowserMode ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                color: liveBrowserMode ? '#34d399' : '#94a3b8',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {liveBrowserMode ? <Eye size={14} /> : <EyeOff size={14} />}
              <span>{liveBrowserMode ? '👁️ Live Headed Browser Window' : '⚡ Background Headless'}</span>
            </button>

            {/* Test Discrepancy Toggle */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: simulateDiscrepancy ? '#f59e0b' : '#94a3b8',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              <input
                type="checkbox"
                checked={simulateDiscrepancy}
                onChange={(e) => setSimulateDiscrepancy(e.target.checked)}
                style={{ accentColor: '#f59e0b' }}
              />
              <span>Simulate Portal Discrepancy</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                fontWeight: 600,
                padding: '10px 20px',
                boxShadow: '0 4px 16px rgba(14, 165, 233, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {submitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Executing Playwright on Portal...</span>
                </>
              ) : (
                <>
                  <Play size={15} />
                  <span>Launch Verification on {portalName || 'Target Portal'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
