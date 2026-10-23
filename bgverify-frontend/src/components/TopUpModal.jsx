import { useState } from 'react';
import { walletAPI } from '../services/api';
import { X, Coins, Check, Zap, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const packages = [
  {
    coins: 100,
    price: 9000,
    badge: 'Starter',
    perCoin: '₹90/check',
    popular: false,
  },
  {
    coins: 500,
    price: 42500,
    badge: 'Growth — Most Popular',
    perCoin: '₹85/check (Save 6%)',
    popular: true,
  },
  {
    coins: 1000,
    price: 80000,
    badge: 'Enterprise',
    perCoin: '₹80/check (Save 11%)',
    popular: false,
  },
];

export default function TopUpModal({ isOpen, onClose, onSuccess }) {
  const [selectedPack, setSelectedPack] = useState(500);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const currentPkg = packages.find((p) => p.coins === selectedPack);

  const handlePurchase = async () => {
    setSubmitting(true);
    try {
      await walletAPI.purchase({ packageAmount: selectedPack });
      toast.success(`🎉 Successfully added ${selectedPack} BGCoins to your wallet!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error?.message || 'Failed to process BGCoin purchase';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f59e0b',
            }}>
              <Coins size={20} />
            </div>
            <div>
              <h3>Top Up BGCoins</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                1 BGCoin = 1 background check. Unused coins never expire.
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
            {packages.map((pkg) => {
              const isSelected = selectedPack === pkg.coins;
              return (
                <div
                  key={pkg.coins}
                  onClick={() => setSelectedPack(pkg.coins)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    border: isSelected
                      ? '2px solid #3b82f6'
                      : '1px solid var(--border-default)',
                    background: isSelected
                      ? 'rgba(59, 130, 246, 0.08)'
                      : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      border: isSelected ? '6px solid #3b82f6' : '2px solid var(--text-muted)',
                      background: isSelected ? 'white' : 'transparent',
                    }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700 }}>
                          {pkg.coins} BGCoins
                        </span>
                        {pkg.popular && (
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: 'rgba(139, 92, 246, 0.2)',
                            color: '#c084fc',
                          }}>
                            {pkg.badge}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {pkg.perCoin}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#38bdf8' }}>
                      ₹{pkg.price.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>+ GST inclusive</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{
            padding: '14px 18px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '12px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#6ee7b7',
          }}>
            <Zap size={18} />
            <span>
              Selected: <strong>{currentPkg?.coins} Coins</strong> for <strong>₹{currentPkg?.price.toLocaleString('en-IN')}</strong>. Instant credit upon payment confirmation.
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePurchase}
            disabled={submitting}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Sparkles size={16} />
            {submitting ? 'Processing...' : `Pay ₹${currentPkg?.price.toLocaleString('en-IN')} & Recharge`}
          </button>
        </div>
      </div>
    </div>
  );
}
