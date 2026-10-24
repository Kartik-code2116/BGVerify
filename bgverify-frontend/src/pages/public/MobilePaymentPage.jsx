import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { paymentAPI } from '../../services/api';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Building2,
  Lock,
  ArrowRight,
  Clock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  Coins,
  ChevronRight,
} from 'lucide-react';

export default function MobilePaymentPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('pending'); // 'pending' | 'confirmed' | 'rejected' | 'expired'
  const [paymentId, setPaymentId] = useState(null);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      const res = await paymentAPI.getSession(sessionId);
      if (res.data.success) {
        setSession(res.data.data);
        setStatus(res.data.data.status || 'pending');
        if (res.data.data.paymentId) {
          setPaymentId(res.data.data.paymentId);
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error?.message || 'Payment session not found or expired');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      const res = await paymentAPI.confirmSession(sessionId);
      if (res.data.success) {
        setStatus('confirmed');
        setPaymentId(res.data.data?.paymentId || 'pay_success');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error?.message || 'Failed to approve payment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const res = await paymentAPI.rejectSession(sessionId);
      if (res.data.success) {
        setStatus('rejected');
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error?.message || 'Failed to reject payment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-3" />
        <p className="text-sm text-slate-300 font-medium">Opening Razorpay UPI Gateway...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-4 border border-rose-500/30">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Invalid or Expired Payment</h2>
        <p className="text-sm text-slate-400 max-w-xs mb-6">
          {error || 'This payment session is no longer active. Please generate a new QR code on your computer.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-semibold hover:bg-slate-700 transition"
        >
          Refresh Page
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 font-sans pb-6">
      {/* Top Mobile App Header */}
      <div className="bg-[#0c2340] px-5 py-4 border-b border-[#13335a] sticky top-0 z-20 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-white tracking-tight">
                  Razorpay UPI Pay
                </span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  SECURE
                </span>
              </div>
              <p className="text-[10px] text-slate-300 font-mono">
                Order: {session.orderId}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
            <ShieldCheck size={14} />
            <span>256-bit</span>
          </div>
        </div>
      </div>

      {/* Main Payment Container */}
      <div className="p-4 sm:p-6 max-w-md w-full mx-auto flex-1 flex flex-col justify-center">
        {/* PENDING STATE — The Requested Confirm & Reject UI */}
        {status === 'pending' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in duration-200">
            {/* Merchant Identity */}
            <div className="text-center space-y-1.5 pb-2 border-b border-slate-800">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/15 text-blue-400 mx-auto flex items-center justify-center text-2xl font-bold border border-blue-500/30 shadow-inner">
                ⚡
              </div>
              <div className="flex items-center justify-center gap-1">
                <h3 className="font-bold text-base text-white">
                  BGVerify Technologies Pvt Ltd
                </h3>
                <CheckCircle2 size={15} className="text-blue-400 fill-blue-500/20" />
              </div>
              <p className="text-xs text-slate-400 font-mono">
                UPI ID: bgverify.payments@icicibank
              </p>
              <div className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 bg-blue-950/60 border border-blue-800/60 px-2.5 py-0.5 rounded-full">
                <Coins size={12} />
                <span>Recharge: {session.coins} BGCoins</span>
              </div>
            </div>

            {/* Huge Amount Callout */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                Amount to Transfer
              </span>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                ₹{session.amount.toLocaleString('en-IN')}.00
              </div>
              <span className="text-[10px] text-emerald-400 font-medium block">
                Instant credit on desktop screen
              </span>
            </div>

            {/* Debited Bank Account Simulation */}
            <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center text-slate-300">
                  <Building2 size={16} />
                </div>
                <div>
                  <span className="font-bold text-white block text-xs">
                    HDFC Bank •••• 5821
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Primary UPI Savings Account
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold text-blue-400 uppercase">
                Linked
              </span>
            </div>

            {/* THE TWO CORE BUTTONS: CONFIRM AND REJECT */}
            <div className="space-y-2.5 pt-1">
              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleConfirm}
                disabled={actionLoading}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition duration-150 disabled:opacity-50"
              >
                {actionLoading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={18} />
                )}
                <span>
                  {actionLoading
                    ? 'Authorizing with Bank...'
                    : `Confirm & Pay ₹${session.amount.toLocaleString('en-IN')}`}
                </span>
              </button>

              {/* Reject Button */}
              <button
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                className="w-full py-3 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-400 border border-rose-500/30 font-bold text-xs flex items-center justify-center gap-2 transition duration-150 disabled:opacity-50"
              >
                <XCircle size={16} />
                <span>Decline / Reject Payment</span>
              </button>
            </div>

            <p className="text-[11px] text-center text-slate-500">
              Tapping either button instantly synchronizes with your computer screen.
            </p>
          </div>
        )}

        {/* CONFIRMED / APPROVED STATE */}
        {status === 'confirmed' && (
          <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={36} className="stroke-[2.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                Transfer Approved
              </span>
              <h2 className="text-2xl font-black text-white">
                Payment Successful!
              </h2>
              <p className="text-xs text-slate-400">
                ₹{session.amount.toLocaleString('en-IN')} paid to BGVerify Technologies.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Payment ID:</span>
                <span className="font-mono font-bold text-slate-200">{paymentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Coins Credited:</span>
                <span className="font-bold text-emerald-400">+{session.coins} BGCoins</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-emerald-400 font-bold">Completed ✓</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/40 border border-emerald-800/40 rounded-xl text-emerald-300 text-xs">
              🎉 <strong>Check your computer screen!</strong> The Razorpay checkout has registered your approval and credited your BGCoins.
            </div>
          </div>
        )}

        {/* REJECTED / DECLINED STATE */}
        {status === 'rejected' && (
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border-2 border-rose-500/40 mx-auto flex items-center justify-center">
              <XCircle size={36} />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white">
                Payment Declined
              </h2>
              <p className="text-xs text-slate-400">
                You declined this transaction on your mobile device.
              </p>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-xs">
              No money has been debited. Your desktop screen has been notified of the cancellation.
            </div>
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <div className="text-center text-xs text-slate-500 space-y-1">
        <div className="flex items-center justify-center gap-1">
          <Lock size={12} className="text-slate-400" />
          <span>Secured by Razorpay Standard Checkout</span>
        </div>
        <p className="text-[10px] text-slate-600">
          BGVerify Technologies Pvt Ltd • Verified Merchant
        </p>
      </div>
    </div>
  );
}
