import { useState, useEffect } from 'react';
import { walletAPI } from '../../services/api';
import { Coins, Plus, ArrowUpRight, ArrowDownLeft, Shield, Sparkles, RefreshCw } from 'lucide-react';
import TopUpModal from '../../components/TopUpModal';
import toast from 'react-hot-toast';

export default function CompanyWalletPage() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    setLoading(true);
    try {
      const [wRes, txRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions({ limit: 50 }),
      ]);
      setWallet(wRes.data.data);
      setTransactions(txRes.data.data.transactions || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load wallet information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h2>BGCoin Wallet & Billing</h2>
            <p>1 BGCoin = 1 verification check. View your balance, buy coin packages, and review transactions.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsTopUpOpen(true)}>
            <Plus size={16} /> Buy BGCoins
          </button>
        </div>
      </div>

      {/* Wallet Card & Packages */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        <div className="wallet-card">
          <div className="wallet-balance-label">Current BGCoin Balance</div>
          <div style={{ display: 'flex', alignItems: 'baseline' }}>
            <span className="wallet-balance-value">{wallet?.balance ?? 0}</span>
            <span className="wallet-balance-unit">BGCoins</span>
          </div>
          <div className="wallet-stats">
            <div className="wallet-stat-item">
              <span>Lifetime Purchased</span>
              <strong>{wallet?.totalPurchased ?? 0} Coins</strong>
            </div>
            <div className="wallet-stat-item">
              <span>Lifetime Dispatched</span>
              <strong>{wallet?.totalSpent ?? 0} Checks</strong>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Commercial Packages</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Never Expire</span>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: '10px',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>100 BGCoins (Starter)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹90 / verification</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsTopUpOpen(true)}>
                  Buy for ₹9,000
                </button>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: '10px',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#60a5fa' }}>500 BGCoins (Growth)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹85 / verification (Save 6%)</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setIsTopUpOpen(true)}>
                  Buy for ₹42,500
                </button>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px 14px',
                background: 'var(--bg-elevated)',
                borderRadius: '10px',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px' }}>1,000 BGCoins (Enterprise)</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹80 / verification (Save 11%)</div>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsTopUpOpen(true)}>
                  Buy for ₹80,000
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Ledger Table */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Auditable Transaction Ledger</span>
          <button className="btn btn-secondary btn-sm" onClick={loadWalletData}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading-inline">
              <div className="loading-spinner"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Coins size={32} />
              </div>
              <h3>No transaction activity recorded</h3>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date & Time</th>
                    <th>Transaction Type</th>
                    <th>Amount</th>
                    <th>Balance After</th>
                    <th>Description</th>
                    <th>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                        {new Date(tx.createdAt).toLocaleString()}
                      </td>
                      <td>
                        {tx.type === 'purchase' || tx.type === 'credit' ? (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#34d399',
                            fontWeight: 600,
                            fontSize: '13px',
                          }}>
                            <ArrowDownLeft size={14} /> Credit
                          </span>
                        ) : (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#fb7185',
                            fontWeight: 600,
                            fontSize: '13px',
                          }}>
                            <ArrowUpRight size={14} /> Debit
                          </span>
                        )}
                      </td>
                      <td style={{ fontWeight: 700, fontSize: '14px' }}>
                        {tx.type === 'purchase' || tx.type === 'credit' ? '+' : '-'}
                        {tx.amount} BGCoin
                      </td>
                      <td style={{ color: '#f59e0b', fontWeight: 600 }}>
                        {tx.balanceAfter} Coins
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {tx.description}
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {tx._id.substring(0, 10)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        onSuccess={loadWalletData}
      />
    </div>
  );
}
