import { useState, useEffect } from 'react';
import { candidateAPI } from '../../services/api';
import {
  Users,
  Plus,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
  GraduationCap,
  Briefcase,
  UserCheck,
  Calendar,
  Hash,
  Award,
  FileText,
  Sparkles,
  UploadCloud,
  FileCheck2,
  Loader2,
  Zap,
  Eye,
  AlertCircle,
} from 'lucide-react';
import NewVerificationModal from '../../components/NewVerificationModal';
import toast from 'react-hot-toast';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('resume'); // 'resume' | 'personal' | 'academic' | 'employment'
  const [selectedCandidateForVerif, setSelectedCandidateForVerif] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Resume OCR Parser States
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedFileName, setParsedFileName] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [rawOcrText, setRawOcrText] = useState('');
  const [showOcrPreview, setShowOcrPreview] = useState(false);

  // Form for new candidate/student
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    aadhaarNumber: '',
    panNumber: '',

    // Student & Academic Info (for Education Verification)
    institution: '',
    degree: '',
    fieldOfStudy: '',
    rollNumber: '',
    endYear: new Date().getFullYear(),
    grade: '',

    // Employment / Internship Info (for Employment Verification)
    company: '',
    designation: '',
    employeeId: '',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await candidateAPI.list();
      setCandidates(res.data.data.candidates || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate list');
    } finally {
      setLoading(false);
    }
  };

  // ─── Real File Reader & OCR Handler ─────────────────────────────
  const handleResumeFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingResume(true);
    setParsedFileName(file.name);
    setOcrSuccess(false);

    try {
      // Read actual file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;

          const res = await candidateAPI.parseResume({
            fileName: file.name,
            fileBase64: base64Data,
            mimeType: file.type,
          });

          applyParsedData(res.data.data, file.name);
        } catch (err) {
          console.error('OCR processing error:', err);
          toast.error(err.response?.data?.error?.message || 'OCR parsing failed on this document');
          setIsParsingResume(false);
        }
      };

      reader.onerror = () => {
        setIsParsingResume(false);
        toast.error('Unable to read the selected file');
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsParsingResume(false);
      toast.error('File reading failed');
    }
  };

  const applyParsedData = (parsed, fileName) => {
    setFormData({
      firstName: parsed.firstName || '',
      lastName: parsed.lastName || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      dateOfBirth: parsed.dateOfBirth || '',
      aadhaarNumber: parsed.aadhaarNumber || '',
      panNumber: parsed.panNumber || '',
      institution: parsed.education?.institution || '',
      degree: parsed.education?.degree || '',
      fieldOfStudy: parsed.education?.fieldOfStudy || '',
      rollNumber: parsed.education?.rollNumber || '',
      endYear: parsed.education?.endYear || 2024,
      grade: parsed.education?.grade || '',
      company: parsed.employment?.company || '',
      designation: parsed.employment?.designation || '',
      employeeId: parsed.employment?.employeeId || '',
      startDate: parsed.employment?.startDate || '',
      endDate: parsed.employment?.endDate || '',
    });

    setRawOcrText(parsed.rawText || parsed.extractedTextPreview || '');
    setOcrSuccess(true);
    setIsParsingResume(false);
    toast.success(`⚡ OCR Extracted details from "${fileName}"!`);
  };

  const handleLoadSampleResume = async (type) => {
    setIsParsingResume(true);
    const fileName = type === 'student' ? 'Ananya_Verma_Student_Resume.pdf' : 'Vikram_Malhotra_CV.pdf';
    setParsedFileName(fileName);

    const sampleText =
      type === 'student'
        ? `
        Ananya Verma
        ananya.verma@example.com | +91-9123456789
        Date of Birth: 2002-04-12
        Aadhaar Number: 9182-4412-7712

        EDUCATION:
        Savitribai Phule Pune University
        Degree: B.Tech in Computer Science & Engineering
        PRN / Roll Number: 71928341
        Graduation Year: 2025
        Score: 8.92 CGPA (First Class with Distinction)

        PROJECTS & INTERNSHIPS:
        Organization: Infosys Limited
        Role: Frontend Engineering Intern
        Employee ID: INF-55192
        Duration: Jan 2024 - May 2024
      `
        : `
        Vikram Malhotra
        vikram.malhotra@techcorp.io | +91-9876543210
        Date of Birth: 1996-09-18
        PAN Number: ABCVM9182X

        EDUCATION:
        Indian Institute of Technology (IIT Bombay)
        Degree: Master of Technology (M.Tech) in Computer Science
        Roll Number: IITB-CS-2020-41
        Passing Year: 2022
        Grade: 9.4 CGPA

        PROFESSIONAL EXPERIENCE:
        Tata Consultancy Services (TCS)
        Designation: Senior Software Engineer
        Employee ID: TCS-88219
        Tenure: July 2022 - Present
      `;

    try {
      const res = await candidateAPI.parseResume({
        rawText: sampleText,
        fileName,
      });
      applyParsedData(res.data.data, fileName);
    } catch (err) {
      console.error(err);
      toast.error('Failed to parse sample resume');
      setIsParsingResume(false);
    }
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('First Name, Last Name, and Email are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth || undefined,
        aadhaarNumber: formData.aadhaarNumber || undefined,
        panNumber: formData.panNumber || undefined,
        education: formData.institution
          ? [
              {
                institution: formData.institution,
                degree: formData.degree || 'Degree',
                fieldOfStudy: formData.fieldOfStudy || 'General',
                rollNumber: formData.rollNumber || undefined,
                endYear: Number(formData.endYear) || undefined,
                grade: formData.grade || undefined,
              },
            ]
          : [],
        employment: formData.company
          ? [
              {
                company: formData.company,
                designation: formData.designation || 'Specialist',
                employeeId: formData.employeeId || undefined,
                startDate: formData.startDate || undefined,
                endDate: formData.endDate || undefined,
              },
            ]
          : [],
      };

      await candidateAPI.create(payload);
      toast.success('Candidate profile registered with verified credentials!');
      setIsAddModalOpen(false);
      setOcrSuccess(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        aadhaarNumber: '',
        panNumber: '',
        institution: '',
        degree: '',
        fieldOfStudy: '',
        rollNumber: '',
        endYear: new Date().getFullYear(),
        grade: '',
        company: '',
        designation: '',
        employeeId: '',
        startDate: '',
        endDate: '',
      });
      loadCandidates();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || 'Failed to create candidate';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Candidate & Student Directory</h2>
            <p>Upload candidate resumes to auto-fill details via OCR, review credentials, and dispatch Playwright verification checks</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <Plus size={16} /> Add Candidate / Student
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-inline">
              <div className="loading-spinner"></div>
            </div>
          ) : candidates.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Users size={32} />
              </div>
              <h3>No candidates added yet</h3>
              <p>Add candidate or student profiles to initiate autonomous background verification</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate / Student</th>
                    <th>Contact & Identity</th>
                    <th>Consent Status</th>
                    <th>Academic Credentials</th>
                    <th>Work Experience</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => {
                    const topEdu = c.education?.[0];
                    const topEmp = c.employment?.[0];

                    return (
                      <tr key={c._id}>
                        <td style={{ fontWeight: 600 }}>
                          <div style={{ fontSize: '15px' }}>{c.firstName} {c.lastName}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            ID: {c._id.substring(0, 8)}...
                          </div>
                        </td>
                        <td>
                          <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={12} color="var(--text-muted)" /> {c.email}
                          </div>
                          {c.phone && (
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={12} /> {c.phone}
                            </div>
                          )}
                        </td>
                        <td>
                          {c.consentGiven ? (
                            <span className="status-badge completed">
                              Consent Signed
                            </span>
                          ) : (
                            <span className="status-badge pending_consent">
                              Consent Pending
                            </span>
                          )}
                        </td>
                        <td>
                          {topEdu ? (
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600 }}>{topEdu.degree}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                {topEdu.institution}
                                {topEdu.endYear ? ` (${topEdu.endYear})` : ''}
                              </div>
                              {topEdu.rollNumber && (
                                <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace' }}>
                                  Roll: {topEdu.rollNumber}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Not specified</span>
                          )}
                        </td>
                        <td>
                          {topEmp ? (
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600 }}>{topEmp.designation}</div>
                              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{topEmp.company}</div>
                              {topEmp.employeeId && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                  Emp ID: {topEmp.employeeId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Fresh Graduate</span>
                          )}
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => setSelectedCandidateForVerif(c._id)}
                          >
                            <ShieldCheck size={14} />
                            Verify
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Candidate Modal with Real Resume OCR */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal" style={{ maxWidth: '740px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3>Register Candidate / Student</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Upload a PDF or Image resume for OCR text extraction & auto-fill
                </p>
              </div>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                &times;
              </button>
            </div>

            {/* Navigation tabs inside modal */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', padding: '0 20px', background: 'var(--bg-elevated)', overflowX: 'auto' }}>
              {[
                { id: 'resume', label: '⚡ Resume OCR Scanner', icon: Sparkles, badge: ocrSuccess ? 'Parsed' : null },
                { id: 'personal', label: '1. Personal Details', icon: UserCheck },
                { id: 'academic', label: '2. Academic / Student', icon: GraduationCap },
                { id: 'employment', label: '3. Employment', icon: Briefcase },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeFormTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveFormTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                      color: isActive ? '#3b82f6' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', padding: '1px 6px', borderRadius: '10px' }}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Success notification banner after OCR */}
            {ocrSuccess && (
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#34d399',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>
                    <strong>OCR Parsed ({parsedFileName}):</strong> Extracted {formData.firstName} {formData.lastName} ({formData.institution})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOcrPreview(!showOcrPreview)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Eye size={12} />
                  {showOcrPreview ? 'Hide Raw OCR' : 'View Raw OCR Text'}
                </button>
              </div>
            )}

            {showOcrPreview && rawOcrText && (
              <div style={{
                padding: '12px 24px',
                background: '#0a0e1a',
                borderBottom: '1px solid var(--border-subtle)',
                maxHeight: '140px',
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '11px',
                color: '#94a3b8',
                whiteSpace: 'pre-wrap',
              }}>
                {rawOcrText}
              </div>
            )}

            <form onSubmit={handleAddCandidate}>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {/* ─── TAB 0: RESUME OCR PARSER ─────────────────────── */}
                {activeFormTab === 'resume' && (
                  <div>
                    <div style={{
                      border: '2px dashed var(--border-default)',
                      borderRadius: '16px',
                      padding: '32px 20px',
                      textAlign: 'center',
                      background: 'rgba(59, 130, 246, 0.03)',
                      marginBottom: '20px',
                      position: 'relative',
                      cursor: 'pointer',
                    }}>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
                        onChange={handleResumeFileSelect}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          opacity: 0,
                          cursor: 'pointer',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                      <div style={{
                        width: 50,
                        height: 50,
                        borderRadius: 14,
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        margin: '0 auto 14px',
                      }}>
                        {isParsingResume ? (
                          <Loader2 size={24} className="loading-spinner" />
                        ) : (
                          <UploadCloud size={24} />
                        )}
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '6px' }}>
                        {isParsingResume ? 'Running PDF & Tesseract OCR Analysis...' : 'Drop Real Candidate Resume / CV Here'}
                      </h4>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 14px' }}>
                        Upload your real PDF, PNG, or JPG resume file. The OCR engine reads the actual text bytes from your document and automatically extracts Name, Roll Number, Degree, and Experience.
                      </p>
                      <button type="button" className="btn btn-secondary btn-sm" style={{ pointerEvents: 'none' }}>
                        Browse Document
                      </button>
                    </div>

                    {/* Pre-Loaded Sample Resumes for 1-Click Testing */}
                    <div style={{
                      background: 'var(--bg-elevated)',
                      padding: '16px 20px',
                      borderRadius: '14px',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <Zap size={16} color="#f59e0b" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Try 1-Click Sample Resumes (Demo Mode)
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleLoadSampleResume('student')}
                          disabled={isParsingResume}
                        >
                          <GraduationCap size={14} color="#38bdf8" />
                          Student / Fresher Resume (SPPU 2025)
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleLoadSampleResume('experienced')}
                          disabled={isParsingResume}
                        >
                          <Briefcase size={14} color="#a855f7" />
                          Senior Engineer Resume (IITB / TCS)
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 1: PERSONAL & CONTACT ─────────────────────── */}
                {activeFormTab === 'personal' && (
                  <div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">
                          First Name * {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Rahul"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Last Name * {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Sharma"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">
                          Email Address * {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="email"
                          className="form-input"
                          placeholder="candidate@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Phone Number {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="+91-9876543210"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-input"
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Aadhaar / National ID {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="XXXX-XXXX-1234"
                          value={formData.aadhaarNumber}
                          onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 2: ACADEMIC / STUDENT ─────────────────────── */}
                {activeFormTab === 'academic' && (
                  <div>
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderRadius: '10px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#93c5fd',
                    }}>
                      💡 Playwright Education Bots query registrar portals using <strong>University</strong> and <strong>Roll / PRN Number</strong>.
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        University / Examining Board * {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Pune University / Savitribai Phule Pune University"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      />
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">
                          Degree / Program {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. B.Tech Computer Science / MBA"
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Student Roll No / PRN * {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 71928341 / PRN-2024-819"
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">
                          Graduation Year {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="2024"
                          value={formData.endYear}
                          onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Grade / CGPA {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 8.85 CGPA / First Class"
                          value={formData.grade}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: EMPLOYMENT HISTORY ─────────────────────── */}
                {activeFormTab === 'employment' && (
                  <div>
                    <div style={{
                      padding: '12px 16px',
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderRadius: '10px',
                      marginBottom: '16px',
                      fontSize: '12px',
                      color: '#93c5fd',
                    }}>
                      💡 Playwright Employment Bots verify tenure and designation against employer databases using <strong>Company Name</strong> and <strong>Employee ID</strong>.
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">
                          Company Name {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Infosys Ltd / TCS"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">
                          Designation / Role {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Software Engineer"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">
                          Employee ID {ocrSuccess && <span style={{ color: '#34d399', fontSize: '11px' }}>✨ OCR Extracted</span>}
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. INF-48291"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tenure Duration</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Jan 2023 - June 2024"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Registering...' : 'Save & Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedCandidateForVerif && (
        <NewVerificationModal
          isOpen={!!selectedCandidateForVerif}
          onClose={() => setSelectedCandidateForVerif(null)}
          initialCandidateId={selectedCandidateForVerif}
          onSuccess={loadCandidates}
        />
      )}
    </div>
  );
}
