import { useState, useEffect } from 'react';
import { portalAPI } from '../../services/api';
import {
  Globe,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Building,
  GraduationCap,
  FileCheck2,
  Trash2,
  Edit2,
  Search,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function VerifyPortalsPage() {
  const [portals, setPortals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Live browser mode persisted state
  const [liveBrowserMode, setLiveBrowserMode] = useState(() => {
    return localStorage.getItem('bgverify_live_browser_mode') === 'true';
  });

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPortal, setEditingPortal] = useState(null);
  const [testingPortalId, setTestingPortalId] = useState(null);
  const [testResultModal, setTestResultModal] = useState(null);

  // Masked passwords visible map
  const [visiblePasswordMap, setVisiblePasswordMap] = useState({});
  const [copiedKey, setCopiedKey] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: 'education',
    loginUrl: '',
    searchUrl: '',
    username: '',
    password: '',
    email: '',
    apiKey: '',
    authNotes: '',
    isActive: true,
  });

  useEffect(() => {
    loadPortals();
  }, []);

  const loadPortals = async () => {
    setLoading(true);
    try {
      const res = await portalAPI.list();
      setPortals(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load portals:', err);
      toast.error('Failed to load verification portals');
    } finally {
      setLoading(false);
    }
  };

  const toggleLiveBrowserMode = () => {
    const nextMode = !liveBrowserMode;
    setLiveBrowserMode(nextMode);
    localStorage.setItem('bgverify_live_browser_mode', String(nextMode));
    toast(
      nextMode
        ? '👁️ Live Headed Browser Mode ON: Playwright will launch an actual visible Chromium window on your screen to test portal logins and verify student data.'
        : '⚡ Background Mode ON: Playwright tests will run quietly in background without popping windows.',
      {
        icon: nextMode ? '👁️' : '⚡',
        duration: 4000,
      }
    );
  };

  const handleOpenAdd = () => {
    setEditingPortal(null);
    setFormData({
      name: '',
      category: 'education',
      loginUrl: '',
      searchUrl: '',
      username: '',
      password: '',
      email: '',
      apiKey: '',
      authNotes: '',
      isActive: true,
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (portal) => {
    setEditingPortal(portal);
    setFormData({
      name: portal.name || '',
      category: portal.category || 'education',
      loginUrl: portal.loginUrl || '',
      searchUrl: portal.searchUrl || '',
      username: portal.username || '',
      password: portal.password || '',
      email: portal.email || '',
      apiKey: portal.apiKey || '',
      authNotes: portal.authNotes || '',
      isActive: portal.isActive !== undefined ? portal.isActive : true,
    });
    setIsFormModalOpen(true);
  };

  const handleSavePortal = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.loginUrl.trim() || !formData.username.trim()) {
      toast.error('Please fill in portal name, login URL, and username');
      return;
    }

    try {
      if (editingPortal) {
        await portalAPI.update(editingPortal._id, formData);
        toast.success(`Portal "${formData.name}" updated successfully!`);
      } else {
        await portalAPI.create(formData);
        toast.success(`Portal "${formData.name}" added to automated vault!`);
      }
      setIsFormModalOpen(false);
      await loadPortals();
    } catch (err) {
      console.error('Save portal error:', err);
      toast.error(err.response?.data?.error?.message || 'Failed to save portal');
    }
  };

  const handleDeletePortal = async (portal) => {
    if (!window.confirm(`Are you sure you want to delete "${portal.name}"?`)) return;
    try {
      await portalAPI.delete(portal._id);
      toast.success(`Portal "${portal.name}" removed`);
      await loadPortals();
    } catch (err) {
      console.error('Delete portal error:', err);
      toast.error(err.response?.data?.error?.message || 'Failed to delete portal');
    }
  };

  const handleTestLogin = async (portal) => {
    setTestingPortalId(portal._id);
    const toastId = toast.loading(
      liveBrowserMode
        ? `🤖 Launching visible Chromium window to log into ${portal.name}...`
        : `🤖 Connecting Playwright bot to ${portal.name} in background...`
    );

    try {
      const res = await portalAPI.testLogin(portal._id, {
        headless: !liveBrowserMode,
      });

      const data = res.data?.data;
      toast.success(
        `✓ Authentication successful! Playwright logged into ${portal.name}`,
        { id: toastId }
      );

      setTestResultModal({
        portalName: portal.name,
        screenshotBase64: data?.screenshotBase64,
        logs: data?.logs || [],
        isLiveSnapshot: Boolean(data?.isLiveSnapshot),
        captureType: data?.captureType,
      });

      await loadPortals();
    } catch (err) {
      console.error('Test login error:', err);
      toast.error(
        err.response?.data?.error?.message || `Failed to log into ${portal.name}`,
        { id: toastId }
      );
    } finally {
      setTestingPortalId(null);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const togglePasswordVisibility = (portalId) => {
    setVisiblePasswordMap((prev) => ({
      ...prev,
      [portalId]: !prev[portalId],
    }));
  };

  // Filter Portals
  const filteredPortals = portals.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.loginUrl.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = portals.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-row" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 38,
                  height: 38,
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
              <h2 style={{ margin: 0 }}>Verify Portals & Automated Bot Credentials</h2>
            </div>
            <p style={{ marginTop: '6px', color: 'var(--text-secondary)', maxWidth: '720px' }}>
              Manage external registrar websites, employer clearinghouses, and government verification portals. Playwright autonomous browser bot uses these credentials to log in, search student roll numbers or employee IDs, and capture cryptographic evidence.
            </p>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Live Headed Browser Mode Toggle */}
            <button
              type="button"
              onClick={toggleLiveBrowserMode}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '12px',
                border: liveBrowserMode
                  ? '1px solid #10b981'
                  : '1px solid rgba(255, 255, 255, 0.15)',
                background: liveBrowserMode
                  ? 'rgba(16, 185, 129, 0.15)'
                  : 'rgba(30, 41, 59, 0.7)',
                color: liveBrowserMode ? '#34d399' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: liveBrowserMode
                  ? '0 0 16px rgba(16, 185, 129, 0.25)'
                  : 'none',
              }}
              title="When ON, Playwright opens a visible Chromium browser window on your screen to log in and inspect candidate information."
            >
              {liveBrowserMode ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{liveBrowserMode ? '👁️ Live Browser: Visible Window' : '⚡ Live Browser: Background'}</span>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: liveBrowserMode ? '#10b981' : '#64748b',
                  boxShadow: liveBrowserMode ? '0 0 8px #10b981' : 'none',
                }}
              />
            </button>

            {/* Add New Portal */}
            <button
              className="btn btn-primary"
              onClick={handleOpenAdd}
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(14, 165, 233, 0.3)',
              }}
            >
              <Plus size={16} />
              <span>Add Verify Portal</span>
            </button>

            {/* Refresh */}
            <button
              className="btn btn-secondary"
              onClick={loadPortals}
              disabled={loading}
              title="Refresh portal vault"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
        }}
      >
        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Configured Portals
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#f8fafc', marginTop: '4px' }}>
            {portals.length}
          </div>
          <div style={{ fontSize: '12px', color: '#38bdf8', marginTop: '2px' }}>
            Across {Object.keys(categoryCounts).length} Verification Sectors
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Active Automated Gates
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#10b981', marginTop: '4px' }}>
            {portals.filter((p) => p.isActive).length}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            Ready for candidate verification
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Tested Handshakes
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#a78bfa', marginTop: '4px' }}>
            {portals.filter((p) => p.testStatus === 'success').length}
          </div>
          <div style={{ fontSize: '12px', color: '#34d399', marginTop: '2px' }}>
            Verified with full DOM snapshot
          </div>
        </div>

        <div
          style={{
            background: 'var(--bg-elevated)',
            borderRadius: '14px',
            padding: '16px 20px',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            Playwright Execution Engine
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: liveBrowserMode ? '#34d399' : '#38bdf8', marginTop: '8px' }}>
            {liveBrowserMode ? '👁️ Live Visible Window' : '⚡ Silent Background'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {liveBrowserMode ? 'SlowMo 600ms on desktop' : 'Headless sandbox worker'}
          </div>
        </div>
      </div>

      {/* Filter and Category Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: `All Portals (${portals.length})` },
            { id: 'education', label: `Education (${categoryCounts.education || 0})` },
            { id: 'employment', label: `Employment (${categoryCounts.employment || 0})` },
            { id: 'identity', label: `Identity & KYC (${categoryCounts.identity || 0})` },
            { id: 'criminal', label: `Court & Police (${categoryCounts.criminal || 0})` },
            { id: 'custom', label: `Custom (${categoryCounts.custom || 0})` },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                border: activeCategory === cat.id ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                background: activeCategory === cat.id ? 'rgba(56, 189, 248, 0.15)' : 'rgba(30, 41, 59, 0.4)',
                color: activeCategory === cat.id ? '#38bdf8' : 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px' }}>
          <Search size={15} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ margin: 0, padding: '7px 12px', fontSize: '13px' }}
            placeholder="Search portal name, username, URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Portals Grid */}
      {loading ? (
        <div className="loading-inline" style={{ padding: '60px 0' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Loading portal credentials vault...
          </p>
        </div>
      ) : filteredPortals.length === 0 ? (
        <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div
            className="empty-state-icon"
            style={{
              background: 'rgba(14, 165, 233, 0.1)',
              color: '#0ea5e9',
              margin: '0 auto 16px auto',
              width: 54,
              height: 54,
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Globe size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
            {searchQuery || activeCategory !== 'all' ? 'No Matching Portals Found' : 'No Verification Portals Configured'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '480px', margin: '0 auto 20px auto' }}>
            Add institutional registrar websites, employer clearinghouses, or state portals with credentials so the Playwright browser bot can automate candidate inquiries.
          </p>
          <button
            className="btn btn-primary"
            onClick={handleOpenAdd}
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
              fontWeight: 600,
            }}
          >
            <Plus size={16} /> Add Your First Portal
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredPortals.map((portal) => {
            const isTesting = testingPortalId === portal._id;
            const isPasswordVisible = !!visiblePasswordMap[portal._id];

            return (
              <div
                key={portal._id}
                style={{
                  background: 'var(--bg-elevated)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-subtle)',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                  position: 'relative',
                }}
              >
                {/* Card Header */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background:
                            portal.category === 'education'
                              ? 'rgba(56, 189, 248, 0.15)'
                              : portal.category === 'employment'
                              ? 'rgba(16, 185, 129, 0.15)'
                              : portal.category === 'identity'
                              ? 'rgba(168, 85, 247, 0.15)'
                              : 'rgba(245, 158, 11, 0.15)',
                          color:
                            portal.category === 'education'
                              ? '#38bdf8'
                              : portal.category === 'employment'
                              ? '#34d399'
                              : portal.category === 'identity'
                              ? '#c084fc'
                              : '#f59e0b',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {portal.category === 'education' ? (
                          <GraduationCap size={18} />
                        ) : portal.category === 'employment' ? (
                          <Building size={18} />
                        ) : (
                          <Globe size={18} />
                        )}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#f8fafc', lineHeight: 1.3 }}>
                          {portal.name}
                        </h4>
                        <span
                          style={{
                            fontSize: '10px',
                            textTransform: 'uppercase',
                            fontWeight: 700,
                            letterSpacing: '0.05em',
                            color:
                              portal.category === 'education'
                                ? '#38bdf8'
                                : portal.category === 'employment'
                                ? '#34d399'
                                : '#c084fc',
                          }}
                        >
                          {portal.category} Check
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          padding: '3px 8px',
                          borderRadius: '12px',
                          background:
                            portal.testStatus === 'success'
                              ? portal.isLiveSnapshot
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)'
                              : 'rgba(148, 163, 184, 0.12)',
                          color:
                            portal.testStatus === 'success'
                              ? portal.isLiveSnapshot
                                ? '#34d399'
                                : '#f59e0b'
                              : '#94a3b8',
                          border:
                            portal.testStatus === 'success'
                              ? portal.isLiveSnapshot
                                ? '1px solid rgba(16, 185, 129, 0.3)'
                                : '1px solid rgba(245, 158, 11, 0.3)'
                              : '1px solid rgba(148, 163, 184, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background:
                              portal.testStatus === 'success'
                                ? portal.isLiveSnapshot
                                  ? '#10b981'
                                  : '#f59e0b'
                                : '#94a3b8',
                          }}
                        />
                        {portal.testStatus === 'success'
                          ? portal.isLiveSnapshot
                            ? 'Live Online'
                            : 'Offline / Simulated'
                          : 'Untested'}
                      </span>
                    </div>
                  </div>

                  {portal.authNotes && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '6px 0 12px 0', lineHeight: 1.4 }}>
                      {portal.authNotes}
                    </p>
                  )}

                  {/* Endpoints & Links */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: 'var(--text-muted)', width: '75px', flexShrink: 0 }}>Login URL:</span>
                      <a
                        href={portal.loginUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: '#38bdf8',
                          textDecoration: 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span>{portal.loginUrl}</span>
                        <ExternalLink size={11} style={{ flexShrink: 0 }} />
                      </a>
                    </div>

                    {portal.searchUrl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: 'var(--text-muted)', width: '75px', flexShrink: 0 }}>Search URL:</span>
                        <span
                          style={{
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {portal.searchUrl}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stored Credentials Box */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.65)',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '12px',
                  }}
                >
                  {/* Username */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Username / ID:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <code style={{ color: '#a78bfa', fontWeight: 600 }}>{portal.username}</code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(portal.username, `user_${portal._id}`)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                        title="Copy Username"
                      >
                        {copiedKey === `user_${portal._id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Password */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Password:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <code style={{ color: '#f8fafc', letterSpacing: isPasswordVisible ? 'normal' : '2px' }}>
                        {isPasswordVisible ? portal.password || '(empty)' : '••••••••••••'}
                      </code>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(portal._id)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                        title={isPasswordVisible ? 'Hide password' : 'Show password'}
                      >
                        {isPasswordVisible ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(portal.password || '', `pass_${portal._id}`)}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                        title="Copy Password"
                      >
                        {copiedKey === `pass_${portal._id}` ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  {portal.email && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Auth Email:</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{portal.email}</span>
                    </div>
                  )}

                  {/* Last Tested */}
                  {portal.lastTestedAt && (
                    <div style={{ fontSize: '11px', color: '#64748b', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px', marginTop: '2px' }}>
                      Last authenticated: {new Date(portal.lastTestedAt).toLocaleDateString()} {new Date(portal.lastTestedAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px' }}>
                  {/* Test Playwright Login */}
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleTestLogin(portal)}
                    disabled={isTesting}
                    style={{
                      background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '12px',
                    }}
                    title={`Test real Playwright Chromium login automation (${liveBrowserMode ? 'Headed window open on screen' : 'Silent background'})`}
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <Bot size={13} />
                        <span>Test Playwright Login</span>
                      </>
                    )}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {/* View Screenshot if tested */}
                    {portal.testScreenshot && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setTestResultModal({
                            portalName: portal.name,
                            screenshotBase64: portal.testScreenshot,
                            logs: portal.testLogs || [],
                            isLiveSnapshot: Boolean(portal.isLiveSnapshot),
                            captureType: portal.captureType,
                          })
                        }
                        title={`View authenticated dashboard screenshot (${portal.isLiveSnapshot ? 'Live Portal Capture' : 'Simulated Fallback Docket'})`}
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                      >
                        <FileCheck2 size={13} style={{ color: portal.isLiveSnapshot ? '#10b981' : '#f59e0b' }} />
                      </button>
                    )}

                    {/* Edit */}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleOpenEdit(portal)}
                      title="Edit credentials"
                      style={{ padding: '6px 8px', fontSize: '12px' }}
                    >
                      <Edit2 size={13} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDeletePortal(portal)}
                      title="Delete portal"
                      style={{ padding: '6px 8px', fontSize: '12px', color: '#f87171' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Portal Modal */}
      {isFormModalOpen && (
        <div className="modal-overlay" onClick={() => setIsFormModalOpen(false)}>
          <div
            className="modal"
            style={{ maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                  }}
                >
                  <Globe size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {editingPortal ? `Edit "${editingPortal.name}"` : 'Register Verification Portal'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Enter the login URL and credentials Playwright will use to authenticate and query candidate records.
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setIsFormModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePortal} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Portal / Registry Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. DigiLocker NAD / SPPU Registrar / EPFO Employer Portal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Check Category *</label>
                  <select
                    className="form-input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="education">Education Verification</option>
                    <option value="employment">Employment Verification</option>
                    <option value="identity">Identity & KYC Verification</option>
                    <option value="criminal">Court & Criminal Records</option>
                    <option value="custom">Custom Organization Portal</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Contact / Notification Email</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="verifications@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Portal Login Page URL *</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://nad.digitallocker.gov.in/institution/login"
                  value={formData.loginUrl}
                  onChange={(e) => setFormData({ ...formData, loginUrl: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Candidate Search / Verification URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://nad.digitallocker.gov.in/academic/verify"
                  value={formData.searchUrl}
                  onChange={(e) => setFormData({ ...formData, searchUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Login Username / Client ID *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. hr_verify_agent_42"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '12px' }}>Login Password / Access Secret</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>API Key / Client Certificate (Optional)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Bearer token or client secret if portal uses API gate"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '12px' }}>Portal Notes & Guidelines</label>
                <textarea
                  className="form-input"
                  rows={2}
                  placeholder="Describe portal jurisdiction, degree levels covered, or contact person notes..."
                  value={formData.authNotes}
                  onChange={(e) => setFormData({ ...formData, authNotes: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsFormModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    fontWeight: 600,
                  }}
                >
                  {editingPortal ? 'Save Changes' : 'Register Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Playwright Test Login Evidence Modal */}
      {testResultModal && (
        <div className="modal-overlay" onClick={() => setTestResultModal(null)}>
          <div
            className="modal"
            style={{ maxWidth: '820px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: testResultModal.isLiveSnapshot
                      ? 'rgba(16, 185, 129, 0.15)'
                      : 'rgba(245, 158, 11, 0.15)',
                    color: testResultModal.isLiveSnapshot ? '#10b981' : '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {testResultModal.isLiveSnapshot ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {testResultModal.isLiveSnapshot
                      ? 'Playwright Live Portal Verification Complete'
                      : 'Simulated Institutional Docket (Offline Fallback)'}
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
                    Target: <strong>{testResultModal.portalName}</strong> •{' '}
                    {testResultModal.isLiveSnapshot
                      ? 'Real-Time External DOM Engine Capture'
                      : 'Portal Unreachable — Executed Sandbox Fallback'}
                  </p>
                </div>
              </div>
              <button className="modal-close" onClick={() => setTestResultModal(null)}>
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Playwright Console Logs */}
              <div
                style={{
                  background: '#090d16',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  border: '1px solid #1e293b',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '12px',
                  lineHeight: 1.8,
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                <div style={{ color: '#38bdf8', fontWeight: 600, borderBottom: '1px solid #1e293b', paddingBottom: '4px', marginBottom: '8px' }}>
                  🤖 Playwright Chromium Bot Authentication Console
                </div>
                {testResultModal.logs.map((line, idx) => (
                  <div
                    key={idx}
                    style={{
                      color:
                        line.includes('HTTP 200') || line.includes('successfully')
                          ? '#34d399'
                          : line.includes('Entering') || line.includes('Username')
                          ? '#a78bfa'
                          : line.includes('Chromium') || line.includes('Playwright')
                          ? '#38bdf8'
                          : '#94a3b8',
                    }}
                  >
                    {line}
                  </div>
                ))}
              </div>

              {/* Full-Page Authenticated Screenshot */}
              {testResultModal.screenshotBase64 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FileCheck2 size={16} style={{ color: testResultModal.isLiveSnapshot ? '#10b981' : '#f59e0b' }} />
                      <span>Authenticated Session Evidence Capture (Raw PNG)</span>
                    </div>
                    {testResultModal.isLiveSnapshot ? (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#34d399',
                          fontWeight: 600,
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Globe size={12} />
                        ✓ Verified Live Portal Snapshot
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#f59e0b',
                          fontWeight: 600,
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid rgba(245, 158, 11, 0.3)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertTriangle size={12} />
                        ⚠️ Simulated / Offline Fallback (Not Live)
                      </span>
                    )}
                  </div>

                  {/* Informational Banner */}
                  <div
                    style={{
                      fontSize: '11px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      marginBottom: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: testResultModal.isLiveSnapshot
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'rgba(245, 158, 11, 0.08)',
                      border: testResultModal.isLiveSnapshot
                        ? '1px solid rgba(16, 185, 129, 0.2)'
                        : '1px solid rgba(245, 158, 11, 0.2)',
                      color: testResultModal.isLiveSnapshot ? '#a7f3d0' : '#fde68a',
                      lineHeight: 1.5,
                    }}
                  >
                    {testResultModal.isLiveSnapshot ? (
                      <span>
                        <strong>Live Evidence Confirmed:</strong> Playwright navigated directly to the external target website, interacted with live DOM input fields, and took this screenshot directly from the live web server.
                      </span>
                    ) : (
                      <span>
                        <strong>Target Portal Offline / Unreachable:</strong> Playwright was unable to reach the live external host. An institutional clearance docket was generated in sandboxed offline mode. This is <strong>not</strong> a real web screenshot.
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid var(--border-subtle)',
                      maxHeight: '340px',
                      overflowY: 'auto',
                      background: '#0f172a',
                    }}
                  >
                    <img
                      src={testResultModal.screenshotBase64}
                      alt="Authenticated Portal Capture"
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setTestResultModal(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
