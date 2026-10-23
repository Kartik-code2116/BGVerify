import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { candidateAPI, roleAPI, sectorAPI } from '../../services/api';
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
  Flame,
  Clock,
  Layers,
  Filter,
  Check,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  X,
  Edit2,
  Trash2,
  Save,
} from 'lucide-react';
import NewVerificationModal from '../../components/NewVerificationModal';
import toast from 'react-hot-toast';

const SECTORS = [
  'All Sectors',
  'Technology & IT',
  'Financial Services & BFSI',
  'Healthcare & Pharmaceuticals',
  'Logistics & Supply Chain',
  'Sales & Marketing',
  'Human Resources',
  'Operations & Administration',
];

export default function CandidatesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [activeRoles, setActiveRoles] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState('resume'); // 'resume' | 'role' | 'personal' | 'academic' | 'employment'
  const [selectedCandidateForVerif, setSelectedCandidateForVerif] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Edit Candidate Modal State
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editActiveTab, setEditActiveTab] = useState('role');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editFormData, setEditFormData] = useState({
    targetRole: '',
    sector: '',
    urgency: 'medium',
    hiringStage: 'applied',
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
    endYear: '',
    grade: '',
    company: '',
    designation: '',
    employeeId: '',
    startDate: '',
    endDate: '',
  });

  // Filters
  const [sectorFilter, setSectorFilter] = useState(searchParams.get('sector') || 'All Sectors');
  const [urgencyFilter, setUrgencyFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  // Resume OCR Parser States
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [parsedFileName, setParsedFileName] = useState('');
  const [ocrSuccess, setOcrSuccess] = useState(false);
  const [rawOcrText, setRawOcrText] = useState('');
  const [showOcrPreview, setShowOcrPreview] = useState(false);

  // Form for new candidate
  const [formData, setFormData] = useState({
    // Role & Sector Assignment
    targetRole: searchParams.get('targetRole') || '',
    sector: searchParams.get('sector') || 'Technology & IT',
    urgency: searchParams.get('urgency') || 'urgent',
    jobRoleId: searchParams.get('jobRoleId') || '',
    hiringStage: 'applied',

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
    loadRoles();

    if (searchParams.get('new') === 'true') {
      setIsAddModalOpen(true);
      setActiveFormTab('role');
    }
  }, [sectorFilter, urgencyFilter, stageFilter]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (sectorFilter && sectorFilter !== 'All Sectors') params.sector = sectorFilter;
      if (urgencyFilter && urgencyFilter !== 'all') params.urgency = urgencyFilter;
      if (stageFilter && stageFilter !== 'all') params.hiringStage = stageFilter;

      const res = await candidateAPI.list(params);
      setCandidates(res.data.data.candidates || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load candidate list');
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      const res = await roleAPI.list({ status: 'active' });
      if (res.data.success) {
        setActiveRoles(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load open roles', err);
    }
  };

  const loadSectors = async () => {
    try {
      const res = await sectorAPI.list();
      if (res.data.success) {
        setSectors(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load sectors', err);
    }
  };

  useEffect(() => {
    loadSectors();
  }, []);

  const handleOpenEditCandidate = (c) => {
    setEditingCandidate(c);
    setConfirmDeleteId(null);
    setEditActiveTab('role');
    setEditFormData({
      // Role & Requisition
      targetRole: c.targetRole || '',
      sector: c.sector || (sectors[0]?.name || 'Technology & IT'),
      urgency: c.urgency || 'medium',
      hiringStage: c.hiringStage || 'applied',
      // Personal Details
      firstName: c.firstName || '',
      lastName: c.lastName || '',
      email: c.email || '',
      phone: c.phone || '',
      dateOfBirth: c.dateOfBirth ? new Date(c.dateOfBirth).toISOString().split('T')[0] : '',
      aadhaarNumber: c.aadhaarNumber || '',
      panNumber: c.panNumber || '',
      // Academic / Student Info
      institution: c.education?.[0]?.institution || '',
      degree: c.education?.[0]?.degree || '',
      fieldOfStudy: c.education?.[0]?.fieldOfStudy || '',
      rollNumber: c.education?.[0]?.rollNumber || '',
      endYear: c.education?.[0]?.endYear || '',
      grade: c.education?.[0]?.grade || '',
      // Employment Info
      company: c.employment?.[0]?.company || '',
      designation: c.employment?.[0]?.designation || '',
      employeeId: c.employment?.[0]?.employeeId || '',
      startDate: c.employment?.[0]?.startDate || '',
      endDate: c.employment?.[0]?.endDate || '',
    });
  };

  const handleSaveCandidateEdit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phone: editFormData.phone || undefined,
        dateOfBirth: editFormData.dateOfBirth || undefined,
        aadhaarNumber: editFormData.aadhaarNumber || undefined,
        panNumber: editFormData.panNumber || undefined,
        targetRole: editFormData.targetRole,
        sector: editFormData.sector,
        urgency: editFormData.urgency,
        hiringStage: editFormData.hiringStage,
        education: editFormData.institution
          ? [
              {
                institution: editFormData.institution,
                degree: editFormData.degree || 'Bachelor of Technology',
                fieldOfStudy: editFormData.fieldOfStudy || undefined,
                rollNumber: editFormData.rollNumber || undefined,
                endYear: editFormData.endYear ? parseInt(editFormData.endYear) : undefined,
                grade: editFormData.grade || undefined,
              },
            ]
          : [],
        employment: editFormData.company
          ? [
              {
                company: editFormData.company,
                designation: editFormData.designation || 'Specialist',
                employeeId: editFormData.employeeId || undefined,
                startDate: editFormData.startDate || undefined,
                endDate: editFormData.endDate || undefined,
              },
            ]
          : [],
      };

      await candidateAPI.update(editingCandidate._id, payload);
      toast.success(`Candidate ${editFormData.firstName} ${editFormData.lastName} updated successfully!`);
      setEditingCandidate(null);
      loadCandidates();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || 'Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async () => {
    if (!editingCandidate) return;
    setIsDeleting(true);
    try {
      await candidateAPI.delete(editingCandidate._id);
      toast.success(`Candidate ${editingCandidate.firstName} ${editingCandidate.lastName} deleted from database!`);
      setEditingCandidate(null);
      setConfirmDeleteId(null);
      loadCandidates();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || 'Failed to delete candidate');
    } finally {
      setIsDeleting(false);
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
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result;
          const res = await candidateAPI.parseResume({
            fileBase64: base64Data,
            fileName: file.name,
            mimeType: file.type,
          });

          if (res.data && res.data.data) {
            applyParsedData(res.data.data, file.name);
          } else {
            toast.error('Could not extract text from document');
            setIsParsingResume(false);
          }
        } catch (apiErr) {
          console.error('OCR Parsing API Error:', apiErr);
          toast.error(apiErr.response?.data?.error?.message || 'OCR parsing failed on this document');
          setIsParsingResume(false);
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read file from disk');
        setIsParsingResume(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error(err);
      setIsParsingResume(false);
      toast.error('File reading failed');
    }
  };

  const applyParsedData = (parsed, fileName) => {
    setFormData((prev) => ({
      ...prev,
      firstName: parsed.firstName || '',
      lastName: parsed.lastName || '',
      email: parsed.email || '',
      phone: parsed.phone || '',
      dateOfBirth: parsed.dateOfBirth || '',
      aadhaarNumber: parsed.aadhaarNumber || '',
      panNumber: parsed.panNumber || '',
      // Academic
      institution: parsed.education?.institution || '',
      degree: parsed.education?.degree || '',
      fieldOfStudy: parsed.education?.fieldOfStudy || '',
      rollNumber: parsed.education?.rollNumber || '',
      endYear: parsed.education?.endYear || 2024,
      grade: parsed.education?.grade || '',
      // Employment
      company: parsed.employment?.company || '',
      designation: parsed.employment?.designation || '',
      employeeId: parsed.employment?.employeeId || '',
      startDate: parsed.employment?.startDate || '',
      endDate: parsed.employment?.endDate || '',
      // Auto-suggested Role and Sector from OCR
      sector: prev.sector && prev.sector !== 'Technology & IT' ? prev.sector : (parsed.suggestedSector || 'Technology & IT'),
      targetRole: prev.targetRole ? prev.targetRole : (parsed.suggestedRole || parsed.employment?.designation || 'Software Engineer'),
    }));

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

        EDUCATION
        B.Tech Computer Science, Savitribai Phule Pune University
        Roll Number / PRN: 71928341
        Graduation Year: 2024 | Grade: 9.1 / 10

        EXPERIENCE
        Full Stack Intern, TechStart Solutions
        Employee ID: TS-9921
        Duration: Jan 2024 - June 2024
        Skills: React.js, Node.js, Python, TypeScript
      `
        : `
        Vikram Malhotra
        vikram.malhotra@example.com | +91-9876543210
        Date of Birth: 1996-08-20
        PAN Number: ABCPM9921K

        EDUCATION
        Master of Business Administration (Finance), Symbiosis University
        Roll Number: SYM-MBA-2018-442
        Passing Year: 2020 | Grade: 8.8 / 10

        PROFESSIONAL EXPERIENCE
        Senior Financial Analyst, Tata Consultancy Services (TCS)
        Employee ID: TCS-88219
        Tenure: July 2022 - Present
        Skills: Financial Modeling, Risk Audit, Portfolio Management, GST
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

  const handleSelectRolePreset = (role) => {
    setFormData((prev) => ({
      ...prev,
      targetRole: role.title,
      sector: role.sector,
      urgency: role.urgency,
      jobRoleId: role._id,
    }));
    toast.success(`Assigned to "${role.title}" (${role.sector})`);
  };

  const handleMarkHired = async (candidateId, name) => {
    try {
      await candidateAPI.updateHiringStage(candidateId, 'hired');
      toast.success(`🎉 ${name} has been officially marked as HIRED!`);
      loadCandidates();
    } catch (err) {
      toast.error('Failed to update candidate hiring stage');
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
        targetRole: formData.targetRole || 'Software Engineer',
        sector: formData.sector || 'Technology & IT',
        urgency: formData.urgency || 'medium',
        jobRoleId: formData.jobRoleId || undefined,
        hiringStage: formData.hiringStage || 'applied',
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
      loadCandidates();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || 'Failed to create candidate';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const getSectorBadge = (sector) => {
    if (!sector) return null;
    let color = 'bg-slate-700 text-slate-300 border-slate-600';
    if (sector.includes('Tech')) color = 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    else if (sector.includes('Finan') || sector.includes('BFSI')) color = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    else if (sector.includes('Health')) color = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    else if (sector.includes('Logis')) color = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    else if (sector.includes('Sales')) color = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${color}`}>
        <Layers size={10} />
        {sector.split('&')[0].trim()}
      </span>
    );
  };

  const getUrgencyBadge = (urgency) => {
    if (urgency === 'urgent') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
          <Flame size={11} className="text-rose-400" />
          URGENT (24h)
        </span>
      );
    }
    if (urgency === 'high') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Clock size={11} className="text-amber-400" />
          HIGH PRIORITY
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] text-slate-400 bg-slate-800 border border-slate-700">
        Standard
      </span>
    );
  };

  const getHiringStageBadge = (stage) => {
    switch (stage) {
      case 'cleared':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Cleared for Hire
          </span>
        );
      case 'hired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Check size={12} className="text-blue-400" />
            Hired & Onboarded
          </span>
        );
      case 'verifying':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock size={12} className="text-amber-400" />
            Under Verification
          </span>
        );
      case 'flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertCircle size={12} className="text-rose-400" />
            Discrepancy Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs text-slate-400 bg-slate-800 border border-slate-700">
            Applied / In Review
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 flex items-center gap-1">
              <Users size={13} />
              Candidate & Student Directory
            </span>
            <span className="text-xs text-slate-400">Multi-Sector Hiring Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Candidates & Sector Requisitions</h1>
          <p className="text-sm text-slate-400">
            Auto-fill candidate credentials with OCR, review education/employment verification, and expedite urgent hires.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/company/roles')}
            className="btn btn-secondary flex items-center gap-1.5 text-xs"
          >
            <Briefcase size={15} />
            Manage Roles & Sectors
          </button>

          <button
            onClick={() => {
              setIsAddModalOpen(true);
              setActiveFormTab('resume');
            }}
            className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 text-xs"
          >
            <Plus size={16} />
            Add Candidate / Student
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="card p-4 space-y-3">
        {/* Sector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSectorFilter('All Sectors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              sectorFilter === 'All Sectors'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Sectors
          </button>
          {(sectors.length > 0 ? sectors : SECTORS.filter(s => s !== 'All Sectors').map(s => ({ name: s }))).map((sec) => (
            <button
              key={sec._id || sec.name}
              onClick={() => setSectorFilter(sec.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                sectorFilter === sec.name
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>

        {/* Priority & Stage Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700/60 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Filter size={13} /> Urgency:
              </span>
              <select
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="form-select py-1 px-2 text-xs"
                style={{ width: 'auto' }}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">🚨 Urgent (24h) Only</option>
                <option value="high">High Priority</option>
                <option value="medium">Standard</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400">Stage:</span>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="form-select py-1 px-2 text-xs"
                style={{ width: 'auto' }}
              >
                <option value="all">All Stages</option>
                <option value="cleared">Ready to Hire (Cleared)</option>
                <option value="hired">Hired & Onboarded</option>
                <option value="verifying">Under Verification</option>
                <option value="flagged">Discrepancy Flagged</option>
              </select>
            </div>
          </div>

          <div className="text-slate-400 text-xs">
            Showing <strong className="text-white">{candidates.length}</strong> candidates
          </div>
        </div>
      </div>

      {/* Candidates Data Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="loading-spinner mx-auto mb-3"></div>
            <p className="text-slate-400 text-sm">Loading candidates across sectors...</p>
          </div>
        ) : candidates.length === 0 ? (
          <div className="p-12 text-center border-dashed">
            <Users size={40} className="mx-auto text-slate-600 mb-3" />
            <h3 className="text-base font-semibold text-white">No Candidates Found</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
              No candidates match the selected sector or urgency filter. Click "Add Candidate" or reset the filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role & Sector</th>
                  <th>Urgency</th>
                  <th>Verification Stage</th>
                  <th>Academic / PRN</th>
                  <th>Work Experience</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((c) => {
                  const topEdu = c.education?.[0];
                  const topEmp = c.employment?.[0];

                  return (
                    <tr
                      key={c._id}
                      style={{
                        background: c.urgency === 'urgent' ? 'rgba(244, 63, 94, 0.04)' : undefined,
                      }}
                    >
                      {/* Candidate Column */}
                      <td>
                        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {c.firstName} {c.lastName}
                          {c.consentGiven && (
                            <CheckCircle2 size={13} color="#34d399" title="DPDP Consent Signed" />
                          )}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          <Mail size={11} /> {c.email}
                        </div>
                        {c.phone && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Phone size={10} /> {c.phone}
                          </div>
                        )}
                      </td>

                      {/* Role & Sector Column */}
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>
                          {c.targetRole || 'Software Engineer'}
                        </div>
                        <div style={{ marginTop: '4px' }}>{getSectorBadge(c.sector || 'Technology & IT')}</div>
                      </td>

                      {/* Urgency Column */}
                      <td>{getUrgencyBadge(c.urgency)}</td>

                      {/* Hiring & Verification Stage */}
                      <td>
                        {getHiringStageBadge(c.hiringStage)}
                        {c.clearanceScore > 0 && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                            Score: <strong style={{ color: '#34d399' }}>{c.clearanceScore}%</strong> match
                          </div>
                        )}
                      </td>

                      {/* Academic / PRN */}
                      <td>
                        {topEdu ? (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{topEdu.degree}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              {topEdu.institution} {topEdu.endYear ? `(${topEdu.endYear})` : ''}
                            </div>
                            {topEdu.rollNumber && (
                              <div style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'monospace', marginTop: '2px' }}>
                                PRN/Roll: {topEdu.rollNumber}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Not provided</span>
                        )}
                      </td>

                      {/* Work Experience */}
                      <td>
                        {topEmp ? (
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600 }}>{topEmp.designation}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{topEmp.company}</div>
                            {topEmp.employeeId && (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                                ID: {topEmp.employeeId}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Fresh Graduate</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          {c.hiringStage === 'cleared' && (
                            <button
                              onClick={() => handleMarkHired(c._id, `${c.firstName} ${c.lastName}`)}
                              className="btn btn-sm"
                              style={{
                                background: '#059669',
                                color: 'white',
                                fontSize: '12px',
                                padding: '4px 10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title="Officially hire candidate and update requisition filled headcount"
                            >
                              <Check size={13} />
                              Hire Now
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditCandidate(c)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '12px', padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Edit candidate sector, role, or hiring stage"
                          >
                            <Edit2 size={12} />
                            Edit
                          </button>

                          <button
                            onClick={() => setSelectedCandidateForVerif(c._id)}
                            className="btn btn-secondary btn-sm"
                            style={{ fontSize: '12px', padding: '4px 10px' }}
                          >
                            <ShieldCheck size={13} color="#38bdf8" />
                            Verify
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── REGISTER CANDIDATE & ASSIGN ROLE MODAL ────────────────── */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div
            className="modal"
            style={{
              maxWidth: '780px',
              width: '95%',
              maxHeight: '92vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header">
              <div>
                <h3>Register Candidate & Assign Role</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Upload resume for OCR auto-extraction, configure job requisition sector & credentials
                </p>
              </div>
              <button className="modal-close" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'var(--bg-elevated)',
                padding: '0 16px',
                overflowX: 'auto',
                gap: '4px',
              }}
            >
              {[
                { id: 'resume', label: '⚡ Resume OCR Scanner', icon: Sparkles, badge: ocrSuccess ? 'Parsed' : null },
                { id: 'role', label: '🎯 Sector & Role', icon: Briefcase },
                { id: 'personal', label: '1. Personal Details', icon: UserCheck },
                { id: 'academic', label: '2. Academic / PRN', icon: GraduationCap },
                { id: 'employment', label: '3. Employment', icon: Layers },
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
                    <Icon size={15} />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span
                        style={{
                          fontSize: '10px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          color: '#34d399',
                          padding: '1px 6px',
                          borderRadius: '10px',
                        }}
                      >
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* OCR Extracted Notification Banner */}
            {ocrSuccess && (
              <div
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderBottom: '1px solid rgba(16, 185, 129, 0.2)',
                  padding: '10px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  color: '#34d399',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>
                    <strong>OCR Parsed:</strong> {formData.firstName} {formData.lastName} ({formData.institution})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOcrPreview(!showOcrPreview)}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#34d399',
                    padding: '2px 8px',
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
              <div
                style={{
                  padding: '12px 20px',
                  background: '#0a0e1a',
                  borderBottom: '1px solid var(--border-subtle)',
                  maxHeight: '130px',
                  overflowY: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                  color: '#94a3b8',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {rawOcrText}
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleAddCandidate} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
                {/* ─── TAB 0: RESUME OCR PARSER ─────────────────────── */}
                {activeFormTab === 'resume' && (
                  <div>
                    <div
                      style={{
                        border: '2px dashed var(--border-default)',
                        borderRadius: '16px',
                        padding: '32px 20px',
                        textAlign: 'center',
                        background: 'rgba(59, 130, 246, 0.03)',
                        marginBottom: '20px',
                        position: 'relative',
                        cursor: 'pointer',
                      }}
                    >
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
                      <div
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 14,
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          margin: '0 auto 12px auto',
                        }}
                      >
                        {isParsingResume ? <Loader2 size={24} className="animate-spin" /> : <UploadCloud size={24} />}
                      </div>
                      <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {isParsingResume ? 'Scanning Resume with OCR Engine...' : 'Drop Candidate Resume (PDF / Image)'}
                      </h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                        Supports native PDF text and Tesseract image OCR. Automatically extracts candidate name, education, roll/PRN, previous jobs, and suggests sector.
                      </p>
                    </div>

                    {/* Quick Sample Resume Buttons */}
                    <div style={{ marginTop: '16px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Zap size={14} color="#f59e0b" /> Or test with pre-built candidate resumes:
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleLoadSampleResume('student')}
                          disabled={isParsingResume}
                          style={{ fontSize: '12px', justifyContent: 'flex-start', padding: '10px 14px' }}
                        >
                          <GraduationCap size={15} color="#38bdf8" />
                          <span>Ananya Verma (Student — VIT Pune)</span>
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleLoadSampleResume('professional')}
                          disabled={isParsingResume}
                          style={{ fontSize: '12px', justifyContent: 'flex-start', padding: '10px 14px' }}
                        >
                          <Briefcase size={15} color="#34d399" />
                          <span>Vikram Malhotra (Senior Analyst — TCS)</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('role')}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        Assign Job Role & Sector <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── TAB 1: SECTOR & ROLE ASSIGNMENT ───────────────── */}
                {activeFormTab === 'role' && (
                  <div>
                    {/* Active Requisitions Quick-Picker */}
                    {activeRoles.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>Select from Active Company Requisitions:</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Click to auto-populate</span>
                        </label>
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                            gap: '10px',
                            maxHeight: '160px',
                            overflowY: 'auto',
                            padding: '4px',
                          }}
                        >
                          {activeRoles.map((r) => {
                            const isSelected = formData.jobRoleId === r._id;
                            return (
                              <div
                                key={r._id}
                                onClick={() => handleSelectRolePreset(r)}
                                style={{
                                  padding: '10px 12px',
                                  borderRadius: '10px',
                                  border: isSelected ? '1px solid #3b82f6' : '1px solid var(--border-default)',
                                  background: isSelected ? 'rgba(59, 130, 246, 0.12)' : 'var(--bg-elevated)',
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {r.title}
                                  </span>
                                  {r.urgency === 'urgent' && (
                                    <span style={{ fontSize: '10px', color: '#f43f5e', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                      <Flame size={10} /> Urgent
                                    </span>
                                  )}
                                </div>
                                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                                  <span>{r.sector}</span>
                                  <span>•</span>
                                  <span>{r.openPositions} Openings</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Target Job Role *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Lead AI Engineer, Financial Analyst, Shift Lead"
                          value={formData.targetRole}
                          onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Sector / Industry *</label>
                        <select
                          className="form-select"
                          value={formData.sector}
                          onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                        >
                          {(sectors.length > 0 ? sectors.map((s) => s.name) : SECTORS.filter((s) => s !== 'All Sectors')).map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Hiring Urgency / Priority *</label>
                        <select
                          className="form-select"
                          value={formData.urgency}
                          onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        >
                          <option value="urgent">🚨 Urgent (Immediate 24h Turnaround)</option>
                          <option value="high">⚡ High Priority (48h Turnaround)</option>
                          <option value="medium">Standard Priority (3 - 5 Days)</option>
                          <option value="low">Low Priority (Flexible Pipeline)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Candidate Hiring Stage</label>
                        <select
                          className="form-select"
                          value={formData.hiringStage}
                          onChange={(e) => setFormData({ ...formData, hiringStage: e.target.value })}
                        >
                          <option value="applied">Applied / Candidate Review</option>
                          <option value="verifying">Initiate Verification</option>
                          <option value="cleared">Pre-Approved / Cleared</option>
                        </select>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('resume')}
                        className="btn btn-secondary btn-sm"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('personal')}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        Continue to Personal Info <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── TAB 2: PERSONAL DETAILS ──────────────────────── */}
                {activeFormTab === 'personal' && (
                  <div>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Rahul"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Sharma"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          required
                          className="form-input"
                          placeholder="candidate@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Phone Number</label>
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
                        <label className="form-label">Aadhaar / National ID</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="XXXX-XXXX-1234"
                          value={formData.aadhaarNumber}
                          onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('role')}
                        className="btn btn-secondary btn-sm"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('academic')}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        Next: Academic Details <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── TAB 3: ACADEMIC / STUDENT ─────────────────────── */}
                {activeFormTab === 'academic' && (
                  <div>
                    <div
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        borderRadius: '10px',
                        marginBottom: '16px',
                        fontSize: '12px',
                        color: '#93c5fd',
                      }}
                    >
                      💡 Playwright Education Bots query registrar portals using <strong>University</strong> and <strong>Roll / PRN Number</strong>.
                    </div>

                    <div className="form-group">
                      <label className="form-label">University / Examining Board</label>
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
                        <label className="form-label">Degree / Program</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. B.Tech Computer Science / MBA"
                          value={formData.degree}
                          onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Student Roll Number / PRN *</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 71928341 / PRN-2024-819"
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                          style={{ fontFamily: 'monospace', color: '#38bdf8' }}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Passing Year</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="2024"
                          value={formData.endYear}
                          onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Grade / CGPA</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 8.5 / 10"
                          value={formData.grade}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('personal')}
                        className="btn btn-secondary btn-sm"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('employment')}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        Next: Employment <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* ─── TAB 4: EMPLOYMENT ─────────────────────────────── */}
                {activeFormTab === 'employment' && (
                  <div>
                    <div
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        borderRadius: '10px',
                        marginBottom: '16px',
                        fontSize: '12px',
                        color: '#93c5fd',
                      }}
                    >
                      💡 Playwright Employment Bots verify tenure and designation against employer databases using <strong>Company Name</strong> and <strong>Employee ID</strong>.
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Previous Company Name</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Infosys Ltd / TCS"
                          value={formData.company}
                          onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Employee ID</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. INF-48291"
                          value={formData.employeeId}
                          onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                          style={{ fontFamily: 'monospace' }}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Start Date / Joining</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Jan 2023 / 2023-01-15"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Date / Relieving</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Present / Current / June 2024"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <button
                        type="button"
                        onClick={() => setActiveFormTab('academic')}
                        className="btn btn-secondary btn-sm"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        <CheckCircle2 size={16} />
                        {submitting ? 'Registering...' : 'Save & Register Candidate'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAddModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <CheckCircle2 size={16} />
                  {submitting ? 'Registering...' : 'Save & Register Candidate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Comprehensive Edit Candidate Modal */}
      {editingCandidate && (
        <div className="modal-overlay" onClick={() => setEditingCandidate(null)}>
          <div className="modal" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Edit Candidate Profile</h3>
                <p className="modal-subtitle">
                  Update candidate personal details, academic credentials, employment, or role assignment
                </p>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setEditingCandidate(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Candidate Identity Header */}
            <div
              style={{
                margin: '0 24px 12px 24px',
                padding: '12px 16px',
                background: 'var(--bg-elevated)',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  {editingCandidate.firstName?.[0]}
                  {editingCandidate.lastName?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>
                    {editingCandidate.firstName} {editingCandidate.lastName}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    ID: {editingCandidate._id} • {editingCandidate.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                {getSectorBadge(editingCandidate.sector)}
                {getUrgencyBadge(editingCandidate.urgency)}
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '0 24px',
                gap: '8px',
              }}
            >
              {[
                { id: 'role', label: 'Role & Requisition', icon: Briefcase },
                { id: 'personal', label: 'Personal Info', icon: Users },
                { id: 'academic', label: 'Academic & PRN', icon: GraduationCap },
                { id: 'employment', label: 'Employment Record', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = editActiveTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setEditActiveTab(tab.id)}
                    style={{
                      padding: '10px 14px',
                      background: 'none',
                      border: 'none',
                      borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
                      color: isActive ? '#3b82f6' : 'var(--text-secondary)',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSaveCandidateEdit}>
              <div className="modal-body" style={{ maxHeight: '55vh', overflowY: 'auto', padding: '20px 24px' }}>
                {/* TAB 1: Role & Requisition */}
                {editActiveTab === 'role' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Sector / Industry *</label>
                        <select
                          className="form-select"
                          value={editFormData.sector}
                          onChange={(e) => setEditFormData({ ...editFormData, sector: e.target.value })}
                        >
                          {(sectors.length > 0 ? sectors.map((s) => s.name) : SECTORS.filter((s) => s !== 'All Sectors')).map((secName) => (
                            <option key={secName} value={secName}>
                              {secName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Target Role *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          placeholder="e.g. Senior Backend Engineer"
                          value={editFormData.targetRole}
                          onChange={(e) => setEditFormData({ ...editFormData, targetRole: e.target.value })}
                        />
                      </div>
                    </div>

                    {activeRoles.filter((r) => !editFormData.sector || r.sector === editFormData.sector).length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Quick pick active opening:</span>
                        {activeRoles
                          .filter((r) => !editFormData.sector || r.sector === editFormData.sector)
                          .slice(0, 4)
                          .map((r) => (
                            <button
                              key={r._id}
                              type="button"
                              onClick={() =>
                                setEditFormData({
                                  ...editFormData,
                                  targetRole: r.title,
                                  urgency: r.urgency || editFormData.urgency,
                                })
                              }
                              className="btn btn-ghost btn-xs"
                              style={{
                                fontSize: '11px',
                                padding: '2px 7px',
                                background: 'var(--bg-elevated)',
                                border: '1px solid var(--border-subtle)',
                              }}
                            >
                              {r.title}
                            </button>
                          ))}
                      </div>
                    )}

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Hiring Urgency</label>
                        <select
                          className="form-select"
                          value={editFormData.urgency}
                          onChange={(e) => setEditFormData({ ...editFormData, urgency: e.target.value })}
                        >
                          <option value="urgent">🚨 Urgent (Immediate 24h)</option>
                          <option value="high">⚡ High Priority (48h)</option>
                          <option value="medium">Standard Priority</option>
                          <option value="low">Low Priority</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Hiring Stage</label>
                        <select
                          className="form-select"
                          value={editFormData.hiringStage}
                          onChange={(e) => setEditFormData({ ...editFormData, hiringStage: e.target.value })}
                        >
                          <option value="applied">Applied</option>
                          <option value="screening">Screening</option>
                          <option value="interviewing">Interviewing</option>
                          <option value="verifying">Verifying</option>
                          <option value="cleared">Cleared for Hire</option>
                          <option value="hired">Hired & Onboarded</option>
                          <option value="flagged">Flagged</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Personal Details */}
                {editActiveTab === 'personal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={editFormData.firstName}
                          onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Last Name *</label>
                        <input
                          type="text"
                          required
                          className="form-input"
                          value={editFormData.lastName}
                          onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Email Address *</label>
                        <input
                          type="email"
                          required
                          className="form-input"
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mobile Phone</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="+91 9876543210"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Date of Birth</label>
                        <input
                          type="date"
                          className="form-input"
                          value={editFormData.dateOfBirth}
                          onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">PAN Number</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="ABCDE1234F"
                          style={{ fontFamily: 'monospace' }}
                          value={editFormData.panNumber}
                          onChange={(e) => setEditFormData({ ...editFormData, panNumber: e.target.value.toUpperCase() })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Aadhaar Number</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="12-digit Aadhaar"
                        style={{ fontFamily: 'monospace' }}
                        value={editFormData.aadhaarNumber}
                        onChange={(e) => setEditFormData({ ...editFormData, aadhaarNumber: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: Academic / Student Credentials */}
                {editActiveTab === 'academic' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      💡 Playwright automated education verification bots query college databases using <strong>College Name</strong> and <strong>Student Roll / PRN Number</strong>.
                    </div>

                    <div className="form-group">
                      <label className="form-label">College / University Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Vishwakarma Institute of Technology, SPPU Pune"
                        value={editFormData.institution}
                        onChange={(e) => setEditFormData({ ...editFormData, institution: e.target.value })}
                      />
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Degree / Qualification</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. B.Tech / Bachelor of Technology"
                          value={editFormData.degree}
                          onChange={(e) => setEditFormData({ ...editFormData, degree: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Branch / Field of Study</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Artificial Intelligence & Data Science"
                          value={editFormData.fieldOfStudy}
                          onChange={(e) => setEditFormData({ ...editFormData, fieldOfStudy: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Student Roll Number / PRN</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. 12210087 / PRN-2023-4819"
                          style={{ fontFamily: 'monospace', fontWeight: 600, color: '#38bdf8' }}
                          value={editFormData.rollNumber}
                          onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Graduation Year</label>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="e.g. 2026"
                          value={editFormData.endYear}
                          onChange={(e) => setEditFormData({ ...editFormData, endYear: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Grade / CGPA</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 8.9 CGPA / 85%"
                        value={editFormData.grade}
                        onChange={(e) => setEditFormData({ ...editFormData, grade: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* TAB 4: Employment Records */}
                {editActiveTab === 'employment' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(59, 130, 246, 0.08)',
                        border: '1px solid rgba(59, 130, 246, 0.25)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      💡 Playwright employment bots verify candidate designation and tenure using <strong>Company Name</strong> and <strong>Employee ID</strong>.
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Previous / Current Employer</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Infosys Ltd / TCS / Google"
                          value={editFormData.company}
                          onChange={(e) => setEditFormData({ ...editFormData, company: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Designation / Role</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Software Engineer / Lead Data Analyst"
                          value={editFormData.designation}
                          onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid-2">
                      <div className="form-group">
                        <label className="form-label">Employee ID</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. INF-48291"
                          style={{ fontFamily: 'monospace' }}
                          value={editFormData.employeeId}
                          onChange={(e) => setEditFormData({ ...editFormData, employeeId: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Start Date / Joining</label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. Jan 2023 / 2023-01-15"
                          value={editFormData.startDate}
                          onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">End Date / Relieving</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Present / Current / June 2024"
                        value={editFormData.endDate}
                        onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer with Delete & Save */}
              <div
                className="modal-footer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                {/* Delete Candidate Option */}
                <div>
                  {confirmDeleteId !== editingCandidate._id ? (
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => setConfirmDeleteId(editingCandidate._id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Permanently remove candidate and their verification records"
                    >
                      <Trash2 size={14} /> Delete Candidate
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#f87171', fontWeight: 600 }}>
                        ⚠️ Confirm permanent deletion?
                      </span>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={handleDeleteCandidate}
                        disabled={isDeleting}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setConfirmDeleteId(null)}
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Save & Cancel */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setEditingCandidate(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Save size={16} /> Save All Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Modal */}
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
