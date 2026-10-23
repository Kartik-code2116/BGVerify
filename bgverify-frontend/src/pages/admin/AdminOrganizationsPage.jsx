import { useState, useEffect } from 'react';
import { organizationAPI, walletAPI } from '../../services/api';
import { Building2, Plus, Coins, ShieldCheck, Mail, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrganizationsPage() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState(100);
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    setLoading(true);
    try {
      const res = await organizationAPI.list();
      setOrganizations(res.data.data.organizations || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminTopUp = async (e) => {
    e.preventDefault();
    if (!selectedOrg || !topUpAmount) return;

    setSubmitting(true);
    try {
      await walletAPI.topUp({
        organizationId: selectedOrg._id,
        amount: Number(topUpAmount),
        description: `Admin manual grant of ${topUpAmount} BGCoins`,
      });
      toast.success(`Granted ${topUpAmount} BGCoins to ${selectedOrg.name}`);
      setTopUpModalOpen(false);
      loadOrganizations();
    } catch (err) {
      console.error(err);
      toast.error('Failed to top up organization wallet');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>Registered Company Accounts</h2>
            <p>Manage corporate client accounts, KYC verification status, and BGCoin credit balances</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-inline">
              <div className="loading-spinner"></div>
            </div>
          ) : organizations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Building2 size={32} />
              </div>
              <h3>No organizations registered yet</h3>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organization</th>
                    <th>Industry / Size</th>
                    <th>KYC Status</th>
                    <th>BGCoin Balance</th>
                    <th>Total Purchased</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizations.map((org) => (
                    <tr key={org._id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{org.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {org.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{org.industry || 'Technology'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{org.size || '51-200'} employees</div>
                      </td>
                      <td>
                        {org.isKycVerified ? (
                          <span className="status-badge completed">KYC Verified</span>
                        ) : (
                          <span className="status-badge pending">Pending KYC</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#f59e0b' }}>
                          {org.wallet?.balance ?? 0}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '4px' }}>Coins</span>
                      </td>
                      <td>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {org.wallet?.totalPurchased ?? 0} Coins
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {new Date(org.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setSelectedOrg(org);
                            setTopUpModalOpen(true);
                          }}
                        >
                          <Coins size={14} />
                          Grant BGCoins
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin Top-Up Modal */}
      {topUpModalOpen && selectedOrg && (
        <div className="modal-overlay" onClick={() => setTopUpModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Grant BGCoins to {selectedOrg.name}</h3>
              <button className="modal-close" onClick={() => setTopUpModalOpen(false)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleAdminTopUp}>
              <div className="modal-body">
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Current Balance: <strong style={{ color: '#f59e0b' }}>{selectedOrg.wallet?.balance ?? 0} BGCoins</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Number of BGCoins to Grant *</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setTopUpModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Granting...' : `Grant ${topUpAmount} BGCoins`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
