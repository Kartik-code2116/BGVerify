import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verificationAPI, walletAPI, roleAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FileCheck2,
  Clock,
  ShieldAlert,
  Coins,
  Plus,
  ArrowUpRight,
  Eye,
  Sparkles,
  Briefcase,
  Flame,
  Layers,
  ChevronRight,
  Users,
  CheckCircle2,
} from 'lucide-react';
import NewVerificationModal from '../../components/NewVerificationModal';
import TopUpModal from '../../components/TopUpModal';
import EvidenceViewerModal from '../../components/EvidenceViewerModal';
import toast from 'react-hot-toast';

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [rolesSummary, setRolesSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isVerifModalOpen, setIsVerifModalOpen] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [selectedVerification, setSelectedVerification] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, walletRes, rolesRes] = await Promise.all([
        verificationAPI.getStats(),
        walletAPI.getBalance(),
        roleAPI.getSummary().catch(() => ({ data: { data: null } })),
      ]);
      setStats(statsRes.data.data);
      setWallet(walletRes.data.data);
      if (rolesRes.data?.data) {
        setRolesSummary(rolesRes.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-inline">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const overview = stats?.overview || {
    total: 0,
    completed: 0,
    pending: 0,
    needsReview: 0,
  };

  const recentList = stats?.recentVerifications || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 flex items-center gap-1">
                <Briefcase size={12} /> HR Talent & Verification Portal
              </span>
            </div>
            <h2>HR Verification & Hiring Workspace</h2>
            <p>Manage multi-sector hiring roles, expedite urgent background verifications, and monitor your BGCoin credits.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setIsTopUpOpen(true)}
            >
              <Coins size={16} color="#f59e0b" />
              Top Up Credits
            </button>
            <button
              className="btn btn-primary"
              onClick={() => setIsVerifModalOpen(true)}
            >
              <Plus size={16} />
              New Verification
            </button>
          </div>
        </div>
      </div>

      {/* Top Banner: BGCoin Balance Card & KPI Summary */}
      <div className="grid-3">
        <div className="wallet-card" style={{ gridColumn: 'span 1' }}>
          <div className="wallet-balance-label">Available Balance</div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className="wallet-balance-value">{wallet?.balance ?? 0}</span>
            <span className="wallet-balance-unit">BGCoins</span>
          </div>
          <div className="wallet-stats">
            <div className="wallet-stat-item">
              <span>Total Purchased</span>
              <strong>{wallet?.totalPurchased ?? 0}</strong>
            </div>
            <div className="wallet-stat-item">
              <span>Total Utilized</span>
              <strong>{wallet?.totalSpent ?? 0}</strong>
            </div>
          </div>
        </div>

        <div style={{ gridColumn: 'span 2', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div className="stat-card blue">
            <div className="stat-icon blue">
              <FileCheck2 size={20} />
            </div>
            <div className="stat-value">{overview.total}</div>
            <div className="stat-label">Total Verifications</div>
          </div>

          <div className="stat-card green">
            <div className="stat-icon green">
              <Sparkles size={20} />
            </div>
            <div className="stat-value">{overview.completed}</div>
            <div className="stat-label">Verified & Passed</div>
          </div>

          <div className="stat-card amber">
            <div className="stat-icon amber">
              <ShieldAlert size={20} />
            </div>
            <div className="stat-value">{overview.needsReview}</div>
            <div className="stat-label">Requires Review</div>
          </div>
        </div>
      </div>

      {/* Sectors & Urgent Hiring Requisitions Widget */}
      {rolesSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Urgent Hiring Banner */}
          <div className="card p-5 border-rose-500/40 bg-gradient-to-br from-slate-900 to-rose-950/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                  <Flame size={13} className="text-rose-400" />
                  🚨 URGENT HIRING DRIVES
                </span>
                <span className="text-xs font-semibold text-rose-300">24h SLA</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                {rolesSummary.urgentRoles} Urgent Job Requisitions Active
              </h3>
              <p className="text-xs text-slate-300/80 mt-1 leading-relaxed">
                You have {rolesSummary.urgentCandidatesCount} candidates in priority 24-hour turnaround background check pipeline.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-500/20 flex items-center gap-2">
              <button
                onClick={() => navigate('/company/candidates?urgency=urgent')}
                className="btn btn-sm bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs py-1.5 px-3 flex-1 flex items-center justify-center gap-1 shadow-md shadow-rose-600/30"
              >
                View Urgent Candidates <ChevronRight size={13} />
              </button>
              <button
                onClick={() => navigate('/company/roles')}
                className="btn btn-sm btn-secondary text-xs py-1.5 px-3"
              >
                Roles Engine
              </button>
            </div>
          </div>

          {/* Multi-Sector Breakdown */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers size={17} className="text-primary-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Company Hiring Distribution by Sector
                </h3>
              </div>
              <button
                onClick={() => navigate('/company/roles')}
                className="text-xs text-primary-400 hover:text-primary-300 font-medium flex items-center gap-1"
              >
                Manage All Sectors <ArrowUpRight size={13} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {rolesSummary.sectors?.slice(0, 4).map((s) => (
                <div
                  key={s.sector}
                  onClick={() => navigate(`/company/candidates?sector=${encodeURIComponent(s.sector)}`)}
                  className="p-3 rounded-lg border border-slate-700/80 bg-slate-800/40 hover:bg-slate-800 transition cursor-pointer group"
                >
                  <p className="text-xs font-semibold text-slate-300 line-clamp-1 group-hover:text-primary-300">
                    {s.sector.split('&')[0]}
                  </p>
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-lg font-bold text-white">{s.openings}</span>
                    <span className="text-[10px] text-slate-400">vacancies</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {s.candidatesCount} in pipeline
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Verifications Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Recent Candidate Verifications</span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsVerifModalOpen(true)}
          >
            <Plus size={14} /> Request Check
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Verification Type</th>
                  <th>Status</th>
                  <th>Outcome</th>
                  <th>Confidence</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {recentList.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '30px' }}>
                      No verification checks submitted yet
                    </td>
                  </tr>
                ) : (
                  recentList.map((v) => (
                    <tr key={v._id}>
                      <td style={{ fontWeight: 600 }}>
                        {v.candidateId?.firstName} {v.candidateId?.lastName}
                      </td>
                      <td>
                        <span className="type-badge">{v.verificationType}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${v.status}`}>
                          {v.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${v.result}`}>
                          {v.result}
                        </span>
                      </td>
                      <td>
                        {v.aiAnalysis?.confidence ? (
                          <span style={{ fontWeight: 700, color: '#34d399' }}>
                            {Math.round(v.aiAnalysis.confidence * 100)}%
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {new Date(v.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedVerification(v)}
                        >
                          <Eye size={14} /> View Evidence
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <NewVerificationModal
        isOpen={isVerifModalOpen}
        onClose={() => setIsVerifModalOpen(false)}
        onSuccess={loadData}
      />

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={loadData}
      />

      {selectedVerification && (
        <EvidenceViewerModal
          verification={selectedVerification}
          isOpen={!!selectedVerification}
          onClose={() => setSelectedVerification(null)}
          onUpdated={loadData}
        />
      )}
    </div>
  );
}
