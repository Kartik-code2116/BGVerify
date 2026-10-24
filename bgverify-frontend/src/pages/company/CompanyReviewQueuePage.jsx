import { useState, useEffect } from 'react';
import { verificationAPI, walletAPI } from '../../services/api';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff,
  RefreshCw,
  Bot,
  Play,
  Sparkles,
  Coins,
  ArrowRight,
  Search,
  Filter,
  Layers,
  Cpu,
  ShieldCheck,
  Check,
  ExternalLink,
  Globe,
} from 'lucide-react';
import EvidenceViewerModal from '../../components/EvidenceViewerModal';
import NewVerificationModal from '../../components/NewVerificationModal';
import CrossCheckPortalModal from '../../components/CrossCheckPortalModal';
import toast from 'react-hot-toast';

export default function CompanyReviewQueuePage() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [initialTab, setInitialTab] = useState('review');
  const [isNewVerificationModalOpen, setIsNewVerificationModalOpen] = useState(false);
  const [crossCheckVerification, setCrossCheckVerification] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [rerunningMap, setRerunningMap] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Live browser mode persisted state
  const [liveBrowserMode, setLiveBrowserMode] = useState(() => {
    return localStorage.getItem('bgverify_live_browser_mode') === 'true';
  });

  useEffect(() => {
    loadQueue();
    loadWallet();
  }, []);

  const loadQueue = async () => {
    setLoading(true);
    try {
      const res = await verificationAPI.list({ status: 'manual_review' });
      setQueue(res.data?.data?.verifications || []);
    } catch (err) {
      console.error('Queue load error:', err);
      toast.error('Failed to load discrepancy review queue');
    } finally {
      setLoading(false);
    }
  };

  const loadWallet = async () => {
    try {
      const res = await walletAPI.getBalance();
      setWalletBalance(res.data?.data?.balance ?? 0);
    } catch (err) {
      console.error('Wallet fetch error:', err);
    }
  };

  const toggleLiveBrowserMode = () => {
    const nextMode = !liveBrowserMode;
    setLiveBrowserMode(nextMode);
    localStorage.setItem('bgverify_live_browser_mode', String(nextMode));
    toast(
      nextMode
        ? '👁️ Live Headed Browser Mode ON: Playwright will open a visible Chromium window on your screen with slow-motion execution.'
        : '⚡ Background Mode ON: Playwright verifications will run quietly in background without popping browser windows.',
      {
        icon: nextMode ? '👁️' : '⚡',
        duration: 4000,
      }
    );
  };

  const handleRerunBot = async (item) => {
    setRerunningMap((prev) => ({ ...prev, [item._id]: true }));
    const candidateName = `${item.candidateId?.firstName || 'Candidate'} ${item.candidateId?.lastName || ''}`.trim();
    const toastId = toast.loading(
      liveBrowserMode
        ? `🤖 Launching visible Chromium window to verify ${candidateName}...`
        : `🤖 Running Playwright browser bot in background for ${candidateName}...`
    );

    try {
      const res = await verificationAPI.rerunBot(item._id, {
        headless: !liveBrowserMode,
      });

      const updated = res.data?.data?.verification;
      const statusText = updated?.status === 'manual_review'
        ? 'Discrepancy reaffirmed & retained in review queue'
        : `Verification completed with result: ${updated?.result || 'clean match'}`;

      toast.success(
        `Playwright bot completed for ${candidateName}! ${statusText}`,
        { id: toastId }
      );

      await loadQueue();
      await loadWallet();
    } catch (err) {
      console.error('Rerun bot error:', err);
      toast.error(
        err.response?.data?.error?.message || 'Failed to re-run Playwright bot',
        { id: toastId }
      );
    } finally {
      setRerunningMap((prev) => ({ ...prev, [item._id]: false }));
    }
  };

  const openEvidenceModal = (item, tab = 'review') => {
    setSelectedVerification(item);
    setInitialTab(tab);
  };

  const filteredQueue = queue.filter((item) => {
    const candidateName = `${item.candidateId?.firstName || ''} ${item.candidateId?.lastName || ''}`.toLowerCase();
    const email = (item.candidateId?.email || '').toLowerCase();
    const summary = (item.aiAnalysis?.summary || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = !searchTerm || candidateName.includes(search) || email.includes(search) || summary.includes(search);
    const matchesType = typeFilter === 'all' || item.verificationType === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0 }}>
        <div className="page-header-row" style={{ alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                }}
              >
                <ShieldAlert size={20} />
              </div>
              <h2 style={{ margin: 0 }}>Discrepancy Review Queue</h2>
            </div>
            <p style={{ marginTop: '6px', color: 'var(--text-secondary)', maxWidth: '680px' }}>
              Central HR triage hub for claims flagged by Playwright autonomous browser agents. Inspect real source evidence, compare submitted CV data against university & employer records, and authorize decisions.
            </p>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Live Headed Browser Toggle Button */}
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
              title="Toggle Playwright Headed Mode: When ON, an actual Chromium browser window will open on your screen in slow-motion so you can watch automated verifications."
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

            {/* Wallet Balance Pill */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '12px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                color: '#f59e0b',
                fontWeight: 700,
                fontSize: '13px',
              }}
              title="BGCoin Balance: 1 BGCoin is deducted per Playwright verification"
            >
              <Coins size={16} />
              <span>{walletBalance !== null ? `${walletBalance} BGCoin` : 'Loading...'}</span>
            </div>

            {/* Launch Playwright Verification Button */}
            <button
              className="btn btn-primary"
              onClick={() => setIsNewVerificationModalOpen(true)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: '#ffffff',
                fontWeight: 600,
                padding: '8px 18px',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Sparkles size={16} />
              <span>Launch Playwright Verification (1 BGCoin)</span>
            </button>

            {/* Refresh Queue */}
            <button
              className="btn btn-secondary"
              onClick={() => {
                loadQueue();
                loadWallet();
              }}
              disabled={loading}
              title="Reload discrepancy queue"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Playwright Browser Agent Architecture & Pipeline Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%)',
          borderRadius: '16px',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>
                Playwright Autonomous Verification Agent & Pipeline
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Active Execution Mode:{' '}
                <strong style={{ color: liveBrowserMode ? '#34d399' : '#38bdf8' }}>
                  {liveBrowserMode ? '👁️ Headed Chromium (Visible Window with 500ms SlowMo)' : '⚡ Headless Chromium (Background Sandboxed Worker)'}
                </strong>{' '}
                • Cost: <strong>1 BGCoin per Verification</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Flagged for Review
              </div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: queue.length > 0 ? '#f59e0b' : '#10b981' }}>
                {queue.length} Cases
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Step Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '12px 14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              1. Claim Ingestion
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Extracts university, roll number, graduation year, past employer, or Aadhaar / PAN claims from candidate CV.
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '12px 14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              2. Browser Automation
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Spawns Chromium browser ({liveBrowserMode ? 'Headed on your screen' : 'Headless in background'}), types queries & queries databases.
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '12px 14px',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#34d399', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              3. Evidence Cryptography
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Captures full-page DOM screenshot & computes SHA-256 digest for non-repudiation audit trails.
            </div>
          </div>

          <div
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '10px',
              padding: '12px 14px',
              border: '1px solid rgba(245, 158, 11, 0.3)',
            }}
          >
            <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
              4. Discrepancy Triage
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Any mismatch (e.g. graduation year or job title mismatch) halts auto-approval and lands directly in this queue.
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap',
          background: 'var(--bg-elevated)',
          padding: '12px 16px',
          borderRadius: '12px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ margin: 0, padding: '7px 12px', fontSize: '13px' }}
            placeholder="Search candidate name, email, or discrepancy keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <select
            className="form-input"
            style={{ margin: 0, padding: '7px 12px', fontSize: '13px', width: 'auto' }}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Verification Types</option>
            <option value="education">Education Checks</option>
            <option value="employment">Employment Checks</option>
            <option value="identity">Identity Checks</option>
            <option value="criminal">Criminal Records</option>
          </select>
        </div>
      </div>

      {/* Queue Table Card */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-inline" style={{ padding: '60px 0' }}>
              <div className="loading-spinner"></div>
              <p style={{ marginTop: '12px', color: 'var(--text-secondary)', fontSize: '13px' }}>
                Loading flagged discrepancy records...
              </p>
            </div>
          ) : filteredQueue.length === 0 ? (
            <div className="empty-state" style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div
                className="empty-state-icon"
                style={{
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  margin: '0 auto 16px auto',
                  width: 54,
                  height: 54,
                  borderRadius: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#f8fafc', marginBottom: '8px' }}>
                {searchTerm || typeFilter !== 'all' ? 'No Matching Discrepancies Found' : 'No Discrepancies In Queue'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', maxWidth: '480px', margin: '0 auto 20px auto' }}>
                {searchTerm || typeFilter !== 'all'
                  ? 'Try clearing your search filters to view all pending cases.'
                  : 'All candidate verifications for your organization have matched automated institutional records cleanly.'}
              </p>

              {!searchTerm && typeFilter === 'all' && (
                <div
                  style={{
                    display: 'inline-flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    background: 'rgba(30, 41, 59, 0.6)',
                    borderRadius: '12px',
                    border: '1px dashed rgba(245, 158, 11, 0.3)',
                    maxWidth: '520px',
                  }}
                >
                  <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: 600 }}>
                    💡 Want to test how Playwright discrepancy triage works?
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Launch a verification with <strong>&quot;Inject Test Discrepancy&quot;</strong> checked. Playwright will detect the mismatch and route it right here!
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsNewVerificationModalOpen(true)}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      fontWeight: 600,
                    }}
                  >
                    <Sparkles size={14} /> Launch Playwright Verification (1 BGCoin)
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Check Type</th>
                    <th>Flagged Discrepancy</th>
                    <th>Confidence</th>
                    <th>Recommended Next Step</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQueue.map((item) => {
                    const isRerunning = !!rerunningMap[item._id];
                    const candidateName = `${item.candidateId?.firstName || 'Candidate'} ${item.candidateId?.lastName || ''}`.trim();
                    const initials = `${(item.candidateId?.firstName || 'C')[0]}${(item.candidateId?.lastName || '')[0] || ''}`.toUpperCase();

                    return (
                      <tr key={item._id}>
                        {/* Candidate Column */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '12px',
                                flexShrink: 0,
                              }}
                            >
                              {initials}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                                {candidateName}
                              </div>
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {item.candidateId?.email || 'No email registered'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Check Type */}
                        <td>
                          <span
                            className="type-badge"
                            style={{
                              textTransform: 'capitalize',
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: '#60a5fa',
                              border: '1px solid rgba(59, 130, 246, 0.25)',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 600,
                            }}
                          >
                            {item.verificationType?.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Flagged Discrepancy */}
                        <td style={{ maxWidth: '300px' }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '6px',
                              color: '#fb923c',
                              fontSize: '13px',
                              fontWeight: 500,
                              lineHeight: 1.4,
                            }}
                          >
                            <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: '2px', color: '#f59e0b' }} />
                            <span>{item.aiAnalysis?.summary || 'Mismatch detected against automated database'}</span>
                          </div>
                          {item.aiAnalysis?.flags && item.aiAnalysis.flags.length > 0 && (
                            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '6px' }}>
                              {item.aiAnalysis.flags.map((flag, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    fontSize: '10px',
                                    background: 'rgba(239, 68, 68, 0.15)',
                                    color: '#f87171',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    borderRadius: '4px',
                                    padding: '1px 6px',
                                  }}
                                >
                                  {flag}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* AI Confidence */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '45px',
                                height: '6px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '3px',
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.round((item.aiAnalysis?.confidence || 0.68) * 100)}%`,
                                  height: '100%',
                                  background: item.aiAnalysis?.confidence >= 0.85 ? '#10b981' : '#f59e0b',
                                }}
                              />
                            </div>
                            <span style={{ fontWeight: 700, color: '#f59e0b', fontSize: '12px' }}>
                              {Math.round((item.aiAnalysis?.confidence || 0.68) * 100)}%
                            </span>
                          </div>
                        </td>

                        {/* Recommended Action */}
                        <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                          {item.aiAnalysis?.recommendedAction || 'Review secondary records before approval.'}
                        </td>

                        {/* Actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            {/* Review & Act */}
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => openEvidenceModal(item, 'review')}
                              title="Inspect evidence & record review decision"
                              style={{ padding: '6px 12px', fontSize: '12px' }}
                            >
                              <Eye size={13} />
                              <span>Review & Act</span>
                            </button>

                            {/* Inspect Bot Trail */}
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => openEvidenceModal(item, 'bot')}
                              title="View Playwright bot execution console logs & screenshot"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                            >
                              <Bot size={13} style={{ color: '#38bdf8' }} />
                              <span>Bot Trail</span>
                            </button>

                            {/* Cross-Check Other Portal */}
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => setCrossCheckVerification(item)}
                              title="Cross-verify candidate on external / secondary institutional portal"
                              style={{
                                padding: '6px 10px',
                                fontSize: '12px',
                                background: 'rgba(14, 165, 233, 0.12)',
                                border: '1px solid rgba(14, 165, 233, 0.35)',
                                color: '#38bdf8',
                              }}
                            >
                              <Globe size={13} />
                              <span>Other Portal</span>
                            </button>

                            {/* Re-run Bot */}
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleRerunBot(item)}
                              disabled={isRerunning}
                              title={`Re-run Playwright Bot (${liveBrowserMode ? 'Live Visible Window' : 'Background Headless'})`}
                              style={{
                                padding: '6px 10px',
                                fontSize: '12px',
                                border: liveBrowserMode ? '1px solid rgba(16, 185, 129, 0.4)' : undefined,
                              }}
                            >
                              {isRerunning ? (
                                <RefreshCw size={13} className="animate-spin" style={{ color: '#38bdf8' }} />
                              ) : (
                                <Play size={13} style={{ color: liveBrowserMode ? '#34d399' : '#a78bfa' }} />
                              )}
                              <span>{isRerunning ? 'Running...' : 'Re-run'}</span>
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
      </div>

      {/* New Verification Modal (Launched with 1 BGCoin) */}
      <NewVerificationModal
        isOpen={isNewVerificationModalOpen}
        onClose={() => setIsNewVerificationModalOpen(false)}
        onSuccess={() => {
          loadQueue();
          loadWallet();
        }}
      />

      {/* Evidence Viewer & HR Action Modal */}
      {selectedVerification && (
        <EvidenceViewerModal
          verification={selectedVerification}
          isOpen={!!selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onUpdated={() => {
            loadQueue();
            loadWallet();
          }}
          initialTab={initialTab}
        />
      )}

      {/* External / Secondary Portal Cross-Check Modal */}
      {crossCheckVerification && (
        <CrossCheckPortalModal
          isOpen={!!crossCheckVerification}
          onClose={() => setCrossCheckVerification(null)}
          verification={crossCheckVerification}
          onVerificationUpdated={() => {
            loadQueue();
            loadWallet();
          }}
        />
      )}
    </div>
  );
}
