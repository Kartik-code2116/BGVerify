import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { roleAPI, sectorAPI } from '../../services/api';
import toast from 'react-hot-toast';
import {
  Briefcase,
  Plus,
  Flame,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sparkles,
  Calendar,
  X,
  Search,
  ExternalLink,
  Layers,
  GraduationCap,
  FileCheck2,
  Settings2,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';

const COLOR_OPTIONS = [
  { id: 'cyan', label: 'Cyan / Tech', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/40' },
  { id: 'emerald', label: 'Emerald / Finance', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/40' },
  { id: 'rose', label: 'Rose / Healthcare', bg: 'bg-rose-500/20', text: 'text-rose-300', border: 'border-rose-500/40' },
  { id: 'amber', label: 'Amber / Logistics', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/40' },
  { id: 'purple', label: 'Purple / HR', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/40' },
  { id: 'indigo', label: 'Indigo / Sales', bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/40' },
  { id: 'blue', label: 'Blue / Operations', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/40' },
  { id: 'orange', label: 'Orange / Manufacturing', bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/40' },
];

const CHECK_OPTIONS = [
  { id: 'education', label: '🎓 Education & University Check', desc: 'Degree, Roll/PRN number check' },
  { id: 'employment', label: '💼 Employment History Check', desc: 'Previous tenure & designations' },
  { id: 'identity', label: '🆔 National ID (Aadhaar / PAN)', desc: 'Government database match' },
  { id: 'criminal_record', label: '🛡️ Criminal Record Verification', desc: 'Court record search' },
  { id: 'credit_history', label: '💳 Credit & Financial Risk Check', desc: 'CIBIL & debt default check' },
  { id: 'driving_license', label: '🚗 Commercial Driving License', desc: 'RTO records lookup' },
  { id: 'address', label: '📍 Physical Address Verification', desc: 'Geo-tagged residency verification' },
];

const PRESET_TEMPLATES = [
  {
    title: 'Full-Stack AI Engineer',
    sector: 'Technology & IT',
    department: 'Engineering & AI',
    urgency: 'urgent',
    openPositions: 3,
    experienceLevel: 'senior',
    locationType: 'hybrid',
    location: 'Bangalore / Remote',
    requiredChecks: ['education', 'employment', 'identity'],
    description: 'Urgent hiring for full stack AI platform engineer. Immediate 24h background clearance required.',
  },
  {
    title: 'Risk & Compliance Analyst',
    sector: 'Financial Services & BFSI',
    department: 'Risk Management',
    urgency: 'high',
    openPositions: 2,
    experienceLevel: 'mid',
    locationType: 'onsite',
    location: 'Mumbai BKC',
    requiredChecks: ['education', 'employment', 'identity', 'criminal_record', 'credit_history'],
    description: 'Mandatory CIBIL, credit history, criminal record and degree verification required.',
  },
  {
    title: 'Fleet & Logistics Supervisor',
    sector: 'Logistics & Supply Chain',
    department: 'Supply Chain Operations',
    urgency: 'urgent',
    openPositions: 5,
    experienceLevel: 'mid',
    locationType: 'onsite',
    location: 'Navi Mumbai Hub',
    requiredChecks: ['identity', 'criminal_record', 'driving_license'],
    description: 'Urgent 24h check required for warehouse & dispatch shift operations.',
  },
  {
    title: 'Clinical Lab Technologist',
    sector: 'Healthcare & Pharmaceuticals',
    department: 'Diagnostics QA',
    urgency: 'medium',
    openPositions: 2,
    experienceLevel: 'mid',
    locationType: 'onsite',
    location: 'Pune Tech Center',
    requiredChecks: ['education', 'identity', 'employment'],
    description: 'Healthcare diagnostics accreditation and credential check required.',
  },
];

export default function HiringRolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState('All Sectors');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Role Form Modal State
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    sector: 'Technology & IT',
    department: '',
    urgency: 'urgent',
    openPositions: 2,
    experienceLevel: 'mid',
    locationType: 'hybrid',
    location: '',
    requiredChecks: ['education', 'employment', 'identity'],
    targetJoiningDate: '',
    description: '',
  });

  // Sector Management Modal State
  const [showSectorModal, setShowSectorModal] = useState(false);
  const [editingSector, setEditingSector] = useState(null);
  const [sectorFormData, setSectorFormData] = useState({
    name: '',
    color: 'cyan',
    description: '',
    defaultChecks: ['education', 'employment', 'identity'],
  });

  const fetchSectors = async () => {
    try {
      const res = await sectorAPI.list();
      if (res.data.success) {
        setSectors(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load sectors', err);
    }
  };

  const fetchRolesAndSummary = async () => {
    try {
      setLoading(true);
      const [rolesRes, summaryRes] = await Promise.all([
        roleAPI.list({
          sector: selectedSector === 'All Sectors' ? undefined : selectedSector,
          urgency: selectedUrgency === 'all' ? undefined : selectedUrgency,
          search: searchQuery || undefined,
        }),
        roleAPI.getSummary(),
      ]);

      if (rolesRes.data.success) {
        setRoles(rolesRes.data.data);
      }
      if (summaryRes.data.success) {
        setSummary(summaryRes.data.data);
      }
    } catch (err) {
      toast.error('Failed to load hiring roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  useEffect(() => {
    fetchRolesAndSummary();
  }, [selectedSector, selectedUrgency, searchQuery]);

  // ─── Sector Creation & Editing Handlers ─────────────────────────
  const handleOpenSectorModal = () => {
    setEditingSector(null);
    setSectorFormData({
      name: '',
      color: 'cyan',
      description: '',
      defaultChecks: ['education', 'employment', 'identity'],
    });
    setShowSectorModal(true);
  };

  const handleEditSector = (sec) => {
    setEditingSector(sec);
    setSectorFormData({
      name: sec.name,
      color: sec.color || 'cyan',
      description: sec.description || '',
      defaultChecks: sec.defaultChecks || ['education', 'employment', 'identity'],
    });
  };

  const handleSaveSector = async (e) => {
    e.preventDefault();
    if (!sectorFormData.name.trim()) {
      toast.error('Sector name cannot be empty');
      return;
    }

    try {
      if (editingSector) {
        await sectorAPI.update(editingSector._id, sectorFormData);
        toast.success(`Sector updated to "${sectorFormData.name}" and cascaded across records!`);
      } else {
        await sectorAPI.create(sectorFormData);
        toast.success(`Custom sector "${sectorFormData.name}" created!`);
      }
      setEditingSector(null);
      setSectorFormData({
        name: '',
        color: 'cyan',
        description: '',
        defaultChecks: ['education', 'employment', 'identity'],
      });
      await fetchSectors();
      await fetchRolesAndSummary();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to save sector');
    }
  };

  const handleDeleteSector = async (sec) => {
    if (!window.confirm(`Are you sure you want to delete sector "${sec.name}"?`)) return;

    try {
      await sectorAPI.delete(sec._id);
      toast.success(`Sector "${sec.name}" deleted.`);
      if (editingSector?._id === sec._id) setEditingSector(null);
      await fetchSectors();
      await fetchRolesAndSummary();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to delete sector');
    }
  };

  // ─── Role Creation & Editing Handlers ───────────────────────────
  const handleOpenNewRoleModal = () => {
    setEditingRoleId(null);
    const defaultSector = sectors[0]?.name || 'Technology & IT';
    setFormData({
      title: '',
      sector: defaultSector,
      department: '',
      urgency: 'urgent',
      openPositions: 2,
      experienceLevel: 'mid',
      locationType: 'hybrid',
      location: '',
      requiredChecks: ['education', 'employment', 'identity'],
      targetJoiningDate: '',
      description: '',
    });
    setShowRoleModal(true);
  };

  const handleOpenEditRoleModal = (role) => {
    setEditingRoleId(role._id);
    setFormData({
      title: role.title,
      sector: role.sector || 'Technology & IT',
      department: role.department || '',
      urgency: role.urgency || 'medium',
      openPositions: role.openPositions || 1,
      experienceLevel: role.experienceLevel || 'mid',
      locationType: role.locationType || 'hybrid',
      location: role.location || '',
      requiredChecks: role.requiredChecks || ['education', 'employment', 'identity'],
      targetJoiningDate: role.targetJoiningDate ? new Date(role.targetJoiningDate).toISOString().split('T')[0] : '',
      description: role.description || '',
    });
    setShowRoleModal(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.sector) {
      toast.error('Please enter Role Title and Sector');
      return;
    }

    try {
      if (editingRoleId) {
        await roleAPI.update(editingRoleId, formData);
        toast.success(`Role "${formData.title}" updated successfully!`);
      } else {
        await roleAPI.create(formData);
        toast.success(`Hiring role "${formData.title}" created successfully!`);
      }
      setShowRoleModal(false);
      fetchRolesAndSummary();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Error saving role');
    }
  };

  const applyTemplate = (tpl) => {
    setEditingRoleId(null);
    setFormData({
      ...tpl,
      targetJoiningDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    });
    setShowRoleModal(true);
  };

  const getSectorStyle = (sectorName) => {
    const sec = sectors.find((s) => s.name === sectorName);
    const col = sec?.color || 'cyan';
    const opt = COLOR_OPTIONS.find((c) => c.id === col) || COLOR_OPTIONS[0];
    return `${opt.bg} ${opt.text} ${opt.border}`;
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'urgent':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            <Flame size={13} className="text-rose-400" />
            URGENT (24h Turnaround)
          </span>
        );
      case 'high':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock size={13} className="text-amber-400" />
            HIGH PRIORITY
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600">
            Standard Hiring
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
              <Briefcase size={13} />
              HR Department Workspace
            </span>
            <span className="text-xs text-slate-400">Custom Sector & Requisition Engine</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">Hiring Roles & Sector Requisitions</h1>
          <p className="text-sm text-slate-400">
            Create, edit, and organize sectors for your organization, configure mandatory checks, and manage urgent roles.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenSectorModal}
            className="btn btn-secondary flex items-center gap-2 text-xs py-2 px-3.5"
            title="Add, rename, or customize company hiring sectors"
          >
            <Settings2 size={16} />
            Manage Sectors ({sectors.length})
          </button>

          <button
            onClick={handleOpenNewRoleModal}
            className="btn btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20 text-xs py-2 px-3.5"
          >
            <Plus size={16} />
            Create Hiring Role
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Active Roles Across Sectors</p>
            <p className="text-2xl font-bold text-white mt-1">{summary?.activeRoles ?? roles.length}</p>
            <p className="text-xs text-slate-500 mt-1">{summary?.totalOpenings ?? 0} total vacancies</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
            <Layers size={22} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between border-rose-500/30 bg-gradient-to-br from-slate-900 to-rose-950/20">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <p className="text-xs font-semibold text-rose-400 uppercase tracking-wide">Urgent 24h Drives</p>
            </div>
            <p className="text-2xl font-bold text-rose-200 mt-1">{summary?.urgentRoles ?? 0} Roles</p>
            <p className="text-xs text-rose-300/70 mt-1">{summary?.urgentCandidatesCount ?? 0} candidates expedited</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
            <Flame size={24} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400">Candidates in Pipeline</p>
            <p className="text-2xl font-bold text-white mt-1">
              {roles.reduce((acc, r) => acc + (r.totalCandidates || 0), 0)} Candidates
            </p>
            <p className="text-xs text-slate-500 mt-1">Undergoing background verification</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
            <Users size={22} />
          </div>
        </div>

        <div className="card p-4 flex items-center justify-between border-emerald-500/30 bg-gradient-to-br from-slate-900 to-emerald-950/20">
          <div>
            <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">Ready to Hire</p>
            <p className="text-2xl font-bold text-emerald-200 mt-1">{summary?.clearedCandidatesCount ?? 0} Cleared</p>
            <p className="text-xs text-emerald-300/70 mt-1">100% verified & approved</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <CheckCircle2 size={24} />
          </div>
        </div>
      </div>

      {/* Quick Launch Pre-configured Sector Templates */}
      <div className="card p-4 border border-slate-700/60 bg-slate-800/40">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
              Quick-Launch Sector Templates (Pre-configured Checks)
            </span>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">Click any role to instantiate instantly</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TEMPLATES.map((tpl) => (
            <button
              key={tpl.title}
              onClick={() => applyTemplate(tpl)}
              className="text-left p-3 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-800/80 hover:border-primary-500/40 transition group"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getSectorStyle(tpl.sector)}`}>
                  {tpl.sector.split('&')[0]}
                </span>
                {tpl.urgency === 'urgent' && (
                  <span className="text-[10px] text-rose-400 font-bold flex items-center gap-0.5">
                    <Flame size={11} /> Urgent
                  </span>
                )}
              </div>
              <p className="font-medium text-white text-sm mt-1.5 group-hover:text-primary-300 transition line-clamp-1">
                {tpl.title}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                <span>{tpl.openPositions} Openings</span>
                <span>•</span>
                <span>{tpl.requiredChecks.length} Checks</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Dynamic Sector Tabs */}
      <div className="card p-4 space-y-4">
        {/* Sector Tabs (dynamically populated from company's sectors) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setSelectedSector('All Sectors')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              selectedSector === 'All Sectors'
                ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Sectors ({sectors.length})
          </button>

          {sectors.map((sec) => (
            <button
              key={sec._id || sec.name}
              onClick={() => setSelectedSector(sec.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                selectedSector === sec.name
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <span>{sec.name}</span>
              {sec.roleCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900/60 font-semibold">
                  {sec.roleCount}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={handleOpenSectorModal}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 text-primary-400 hover:text-white hover:bg-primary-600 transition flex items-center gap-1 whitespace-nowrap border border-primary-500/30"
          >
            <Plus size={13} /> New Sector
          </button>
        </div>

        {/* Search & Urgency Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-700/60">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles, sectors, departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input text-xs w-full"
              style={{ paddingLeft: '34px', paddingBottom: '8px', paddingTop: '8px' }}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
              <Filter size={14} /> Priority:
            </span>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="form-select text-xs py-1.5"
              style={{ width: 'auto' }}
            >
              <option value="all">All Hiring Priorities</option>
              <option value="urgent">🚨 Urgent 24h Turnaround Only</option>
              <option value="high">High Priority</option>
              <option value="medium">Standard / Medium</option>
            </select>
          </div>
        </div>
      </div>

      {/* Roles Cards Grid */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="loading-spinner mx-auto mb-3"></div>
          <p className="text-slate-400 text-sm">Loading multi-sector hiring roles...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="card p-12 text-center border-dashed">
          <Briefcase size={40} className="mx-auto text-slate-600 mb-3" />
          <h3 className="text-base font-semibold text-white">No Hiring Roles Found</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">
            No roles match the selected sector or urgency filter. Click "Create Hiring Role" or use one of the quick templates above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const fillPercentage = Math.min(
              100,
              Math.round(((role.hiredCandidates || 0) / (role.openPositions || 1)) * 100)
            );

            return (
              <div
                key={role._id}
                className={`card p-5 flex flex-col justify-between transition border hover:border-slate-500 relative ${
                  role.urgency === 'urgent'
                    ? 'border-rose-500/40 bg-gradient-to-b from-slate-900 to-rose-950/10'
                    : 'border-slate-800'
                }`}
              >
                <div>
                  {/* Top Badges & Edit Button */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getSectorStyle(role.sector)}`}>
                      {role.sector}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getUrgencyBadge(role.urgency)}
                      <button
                        onClick={() => handleOpenEditRoleModal(role)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        title="Edit this role"
                      >
                        <Edit2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Title & Department */}
                  <h3 className="text-lg font-bold text-white group-hover:text-primary-300 transition">
                    {role.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    {role.department && (
                      <span className="flex items-center gap-1">
                        <Building2 size={12} />
                        {role.department}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {role.location || 'Headquarters'} ({role.locationType})
                    </span>
                  </div>

                  {role.description && (
                    <p className="text-xs text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {role.description}
                    </p>
                  )}

                  {/* Mandatory Background Checks Required */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <p className="text-[11px] font-medium text-slate-400 mb-1.5 flex items-center gap-1">
                      <ShieldCheck size={12} className="text-primary-400" />
                      Required Verification Checks:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {role.requiredChecks?.map((chk) => (
                        <span
                          key={chk}
                          className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700"
                        >
                          {chk === 'education' && '🎓 Education'}
                          {chk === 'employment' && '💼 Employment'}
                          {chk === 'identity' && '🆔 ID Verification'}
                          {chk === 'criminal_record' && '🛡️ Criminal Record'}
                          {chk === 'credit_history' && '💳 Credit History'}
                          {chk === 'driving_license' && '🚗 Driving License'}
                          {chk === 'address' && '📍 Address'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Openings Progress */}
                  <div className="mt-4 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-400">Positions Filled</span>
                      <span className="font-semibold text-white">
                        {role.hiredCandidates || 0} / {role.openPositions} Hired ({fillPercentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          fillPercentage >= 100
                            ? 'bg-emerald-500'
                            : role.urgency === 'urgent'
                            ? 'bg-rose-500'
                            : 'bg-primary-500'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Pipeline Counts */}
                  <div className="grid grid-cols-2 gap-2 mt-3 p-2 rounded-lg bg-slate-800/40 text-center text-xs">
                    <div>
                      <p className="text-slate-400 text-[10px]">In Verification</p>
                      <p className="font-bold text-white mt-0.5">{role.totalCandidates || 0}</p>
                    </div>
                    <div>
                      <p className="text-emerald-400 text-[10px]">Ready to Hire</p>
                      <p className="font-bold text-emerald-300 mt-0.5">{role.clearedCandidates || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      navigate(`/company/candidates?role=${encodeURIComponent(role.title)}&sector=${encodeURIComponent(role.sector)}`);
                    }}
                    className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 flex-1 justify-center"
                  >
                    <Users size={13} />
                    Pipeline ({role.totalCandidates || 0})
                  </button>

                  <button
                    onClick={() => {
                      navigate(`/company/candidates?new=true&targetRole=${encodeURIComponent(role.title)}&sector=${encodeURIComponent(role.sector)}&urgency=${role.urgency}&jobRoleId=${role._id}`);
                    }}
                    className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 flex-1 justify-center"
                  >
                    <Plus size={13} />
                    Add Candidate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── CREATE / EDIT ROLE MODAL ──────────────────────────────── */}
      {showRoleModal && (
        <div className="modal-overlay" onClick={() => setShowRoleModal(false)}>
          <div
            className="modal"
            style={{
              maxWidth: '740px',
              width: '95%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>{editingRoleId ? 'Edit Hiring Role Requisition' : 'Create Multi-Sector Hiring Role'}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Configure role sector, urgency level, and standard background verification package.
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowRoleModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Role Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Full-Stack AI Engineer, Financial Analyst, Shift Lead"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Sector / Industry *</span>
                      <span
                        onClick={handleOpenSectorModal}
                        style={{ fontSize: '11px', color: '#3b82f6', cursor: 'pointer' }}
                      >
                        + Manage Sectors
                      </span>
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      className="form-select"
                    >
                      {sectors.map((s) => (
                        <option key={s._id || s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Engineering, Risk & Audit, Fleet Operations"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Hiring Urgency / Priority *</label>
                    <select
                      value={formData.urgency}
                      onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                      className="form-select"
                    >
                      <option value="urgent">🚨 Urgent (Immediate 24h Turnaround)</option>
                      <option value="high">⚡ High Priority (48h Turnaround)</option>
                      <option value="medium">Standard Priority (3 - 5 Days)</option>
                      <option value="low">Low Priority (Flexible Pipeline)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Open Vacancies (Target Count) *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={formData.openPositions}
                      onChange={(e) => setFormData({ ...formData, openPositions: parseInt(e.target.value) || 1 })}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Experience Level</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                      className="form-select"
                    >
                      <option value="entry">Entry Level (0 - 2 yrs)</option>
                      <option value="mid">Mid Level (2 - 5 yrs)</option>
                      <option value="senior">Senior (5 - 8 yrs)</option>
                      <option value="lead">Lead / Staff (8+ yrs)</option>
                      <option value="executive">Executive / Director</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Work Mode & Location</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        value={formData.locationType}
                        onChange={(e) => setFormData({ ...formData, locationType: e.target.value })}
                        className="form-select"
                        style={{ width: '40%' }}
                      >
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">On-Site</option>
                        <option value="remote">Remote</option>
                      </select>
                      <input
                        type="text"
                        placeholder="e.g. Pune, Mumbai, Bangalore"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="form-input"
                        style={{ width: '60%' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Mandatory Checks Checkbox Group */}
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Mandatory Background Verification Checks for this Role:</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 'normal' }}>
                      {formData.requiredChecks.length} checks selected
                    </span>
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px', marginTop: '6px' }}>
                    {CHECK_OPTIONS.map((chk) => {
                      const checked = formData.requiredChecks.includes(chk.id);
                      return (
                        <label
                          key={chk.id}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            padding: '10px 12px',
                            borderRadius: '10px',
                            border: checked ? '1px solid #3b82f6' : '1px solid var(--border-default)',
                            background: checked ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-elevated)',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  requiredChecks: [...formData.requiredChecks, chk.id],
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  requiredChecks: formData.requiredChecks.filter((c) => c !== chk.id),
                                });
                              }
                            }}
                            style={{ marginTop: '2px' }}
                          />
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{chk.label}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{chk.desc}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Role Notes / Requisition Details</label>
                  <textarea
                    rows={2}
                    placeholder="Notes on hiring urgency, special clearance requirements, or interview stages..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    style={{ resize: 'vertical' }}
                  ></textarea>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={16} />
                  {editingRoleId ? 'Update Hiring Role' : 'Save & Publish Hiring Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MANAGE & EDIT SECTORS MODAL ───────────────────────────── */}
      {showSectorModal && (
        <div className="modal-overlay" onClick={() => setShowSectorModal(false)}>
          <div
            className="modal"
            style={{
              maxWidth: '740px',
              width: '95%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3>Manage Company Hiring Sectors</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Create, rename, or customize sectors. Renaming cascades across all associated job roles and candidates.
                </p>
              </div>
              <button className="modal-close" onClick={() => setShowSectorModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '24px' }}>
              {/* Form to Add / Edit Sector */}
              <form
                onSubmit={handleSaveSector}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {editingSector ? `Edit Sector: "${editingSector.name}"` : 'Add New Custom Sector'}
                  </h4>
                  {editingSector && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingSector(null);
                        setSectorFormData({
                          name: '',
                          color: 'cyan',
                          description: '',
                          defaultChecks: ['education', 'employment', 'identity'],
                        });
                      }}
                      style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Cancel Editing
                    </button>
                  )}
                </div>

                <div className="grid-2">
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Sector Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. EdTech & Academics / Automotive & EV"
                      value={sectorFormData.name}
                      onChange={(e) => setSectorFormData({ ...sectorFormData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label className="form-label">Sector Badge Color Theme</label>
                    <select
                      value={sectorFormData.color}
                      onChange={(e) => setSectorFormData({ ...sectorFormData, color: e.target.value })}
                      className="form-select"
                    >
                      {COLOR_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label">Sector Description (Optional)</label>
                  <input
                    type="text"
                    placeholder="Brief description of the industry or department..."
                    value={sectorFormData.description}
                    onChange={(e) => setSectorFormData({ ...sectorFormData, description: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button type="submit" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} />
                    {editingSector ? 'Save Sector Changes' : 'Create Sector'}
                  </button>
                </div>
              </form>

              {/* Existing Sectors Table / List */}
              <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                Configured Sectors for Your Company ({sectors.length})
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sectors.map((sec) => (
                  <div
                    key={sec._id || sec.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: editingSector?._id === sec._id ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-elevated)',
                      border: editingSector?._id === sec._id ? '1px solid #3b82f6' : '1px solid var(--border-default)',
                      borderRadius: '10px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getSectorStyle(sec.name)}`}>
                          {sec.name}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {sec.roleCount || 0} active roles • {sec.candidateCount || 0} candidates
                        </span>
                      </div>
                      {sec.description && (
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          {sec.description}
                        </p>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => handleEditSector(sec)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        title="Edit sector name or color"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSector(sec)}
                        className="btn btn-sm"
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        title="Delete sector"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" onClick={() => setShowSectorModal(false)} className="btn btn-primary">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
