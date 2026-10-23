import { useState, useEffect } from 'react';
import { verificationAPI, walletAPI } from '../../services/api';
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
} from 'lucide-react';
import NewVerificationModal from '../../components/NewVerificationModal';
import TopUpModal from '../../components/TopUpModal';
import EvidenceViewerModal from '../../components/EvidenceViewerModal';
import toast from 'react-hot-toast';

export default function CompanyDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [wallet, setWallet] = useState(null);
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
      const [statsRes, walletRes] = await Promise.all([
        verificationAPI.getStats(),
        walletAPI.getBalance(),
      ]);
      setStats(statsRes.data.data);
      setWallet(walletRes.data.data);
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
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>HR Verification Workspace</h2>
            <p>Initiate automated checks, track verification progress, and manage your BGCoin credits</p>
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
      <div className="grid-3" style={{ marginBottom: '28px' }}>
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
