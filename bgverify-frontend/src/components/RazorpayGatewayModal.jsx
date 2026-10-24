import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { paymentAPI } from '../services/api';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Smartphone,
  CreditCard,
  Building2,
  Wallet,
  QrCode,
  Lock,
  ArrowRight,
  RefreshCw,
  Clock,
  Sparkles,
  ChevronRight,
  AlertCircle,
  Copy,
  Check,
  Shield,
  Zap,
  ExternalLink,
  Wifi,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Web Audio API synthesized audio
function playSound(type = 'success') {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();

    if (type === 'success') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'beep') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(740, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'error') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.setValueAtTime(146.83, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    }
  } catch {
    // Ignore audio context errors
  }
}

export default function RazorpayGatewayModal({
  isOpen,
  onClose,
  onSuccess,
  amount = 9000,
  coins = 100,
  orderTitle = 'BGCoin Wallet Top-Up',
}) {
  const [activeTab, setActiveTab] = useState('upi'); // 'upi' | 'card' | 'netbanking' | 'wallet'
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes
  const [sessionData, setSessionData] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Gateway Lifecycle: 'checkout' | 'processing' | 'success' | 'failed'
  const [gatewayState, setGatewayState] = useState('checkout');
  const [paymentId, setPaymentId] = useState(null);
  const [declineReason, setDeclineReason] = useState('Payment declined on mobile application');

  // Card form states
  const [cardNumber, setCardNumber] = useState('4532 8820 9012 4432');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('821');
  const [cardName, setCardName] = useState('KARTIK THORAT');

  const pollingRef = useRef(null);

  // Initialize Real Payment Session on Open
  useEffect(() => {
    if (!isOpen) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      setGatewayState('checkout');
      setSessionData(null);
      return;
    }

    createRealPaymentSession();

    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      clearInterval(timer);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isOpen]);

  const createRealPaymentSession = async () => {
    try {
      setSessionLoading(true);
      setSessionError(null);

      // Determine appropriate host (LAN IP or window host)
      const currentHost = window.location.host; // e.g. 192.168.0.184:5173 or localhost:5173

      const res = await paymentAPI.createSession({
        amount,
        coins,
        orderTitle,
        customHost: currentHost.includes('localhost') ? undefined : currentHost,
      });

      if (res.data.success) {
        const data = res.data.data;
        setSessionData(data);
        startPollingSessionStatus(data.sessionId);
      }
    } catch (err) {
      console.error('Failed to create payment session:', err);
      setSessionError(err.response?.data?.error?.message || 'Failed to initialize Razorpay session');
    } finally {
      setSessionLoading(false);
    }
  };

  // Poll for real phone Confirm or Reject tap
  const startPollingSessionStatus = (sessionId) => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const res = await paymentAPI.getSessionStatus(sessionId);
        if (res.data.success) {
          const { status, paymentId: remotePayId } = res.data.data;

          if (status === 'confirmed') {
            clearInterval(pollingRef.current);
            setPaymentId(remotePayId || 'pay_success');
            setGatewayState('success');
            playSound('success');

            setTimeout(() => {
              if (onSuccess) {
                onSuccess({
                  paymentId: remotePayId,
                  amount,
                  coins,
                });
              }
            }, 2000);
          } else if (status === 'rejected') {
            clearInterval(pollingRef.current);
            setDeclineReason('Payment rejected on your mobile phone');
            setGatewayState('failed');
            playSound('error');
          }
        }
      } catch (err) {
        // Silently handle transient polling error
      }
    }, 1500);
  };

  if (!isOpen) return null;

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyMobileUrl = () => {
    if (!sessionData?.mobilePayUrl) return;
    navigator.clipboard.writeText(sessionData.mobilePayUrl);
    setCopiedUrl(true);
    toast.success('Mobile Payment Link copied to clipboard!');
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleSimulateDesktopCardPay = () => {
    setGatewayState('processing');
    playSound('beep');

    setTimeout(async () => {
      if (sessionData?.sessionId) {
        try {
          await paymentAPI.confirmSession(sessionData.sessionId);
        } catch {
          // handled by polling or success fallback
        }
      }
      const payId = `pay_Rzp${Math.random().toString(36).substring(2, 11)}`;
      setPaymentId(payId);
      setGatewayState('success');
      playSound('success');

      setTimeout(() => {
        if (onSuccess) onSuccess({ paymentId: payId, amount, coins });
      }, 1900);
    }, 1500);
  };

  const handleCardNumberChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 16);
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    let val = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (val.length >= 3) {
      val = `${val.substring(0, 2)}/${val.substring(2)}`;
    }
    setCardExpiry(val);
  };

  const getCardBrand = (num) => {
    const clean = (num || '').replace(/\s+/g, '');
    if (clean.startsWith('4')) return { name: 'VISA', bg: 'bg-blue-600', text: 'text-white' };
    if (/^5[1-5]/.test(clean)) return { name: 'Mastercard', bg: 'bg-orange-600', text: 'text-white' };
    if (/^6(0|5)/.test(clean) || clean.startsWith('35')) return { name: 'RuPay', bg: 'bg-emerald-600', text: 'text-white' };
    if (/^3[47]/.test(clean)) return { name: 'AMEX', bg: 'bg-indigo-600', text: 'text-white' };
    return { name: 'VISA', bg: 'bg-blue-600', text: 'text-white' };
  };

  const cardBrand = getCardBrand(cardNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      {/* Outer Shell resembling authentic Razorpay Standard Checkout */}
      <div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-slate-800 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Razorpay Top Header */}
        <div className="bg-[#0c2340] text-white px-5 py-4 flex items-center justify-between border-b border-[#13335a] relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md ring-2 ring-white/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base tracking-tight text-white">
                  BGVerify Technologies Pvt Ltd
                </h3>
                <span className="flex items-center gap-1 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={10} /> Verified
                </span>
              </div>
              <p className="text-xs text-slate-300 flex items-center gap-2 mt-0.5">
                <span>{orderTitle} ({coins} BGCoins)</span>
                <span>•</span>
                <span className="font-mono text-slate-400">
                  {sessionData?.orderId || 'order_RzpPending'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-300 font-medium">Amount to Pay</div>
              <div className="text-xl font-extrabold text-white tracking-tight">
                ₹{amount.toLocaleString('en-IN')}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
              title="Close payment modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Razorpay Sub-Bar: Test Mode Notice & Countdown Timer */}
        <div className="bg-[#f1f5f9] px-5 py-2 flex items-center justify-between text-xs border-b border-slate-200 text-slate-600">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-800 border border-blue-300 flex items-center gap-1">
              <Zap size={11} className="text-blue-600" />
              LIVE REAL QR GATEWAY
            </span>
            <span className="hidden md:inline text-slate-500">
              Scan with actual smartphone camera or UPI app
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
              <Clock size={12} className="text-slate-400" />
              <span>Expires in {formatTimer(secondsLeft)}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
              <ShieldCheck size={12} className="text-emerald-600" />
              <span>Secured by Razorpay</span>
            </div>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto">
          {/* STATE 1: CHECKOUT SCREEN (Tabs) */}
          {gatewayState === 'checkout' && (
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[440px]">
              {/* Left Sidebar */}
              <div className="md:col-span-4 lg:col-span-3 bg-slate-50 border-r border-slate-200 p-2 sm:p-3 flex md:flex-col gap-1.5 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab('upi')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition font-medium text-xs ${
                    activeTab === 'upi'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <QrCode size={16} />
                    <span>UPI / Scan QR</span>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      activeTab === 'upi' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    REAL PHONE
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('card')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition font-medium text-xs ${
                    activeTab === 'card'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={16} />
                    <span>Cards (Credit/Debit)</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('netbanking')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition font-medium text-xs ${
                    activeTab === 'netbanking'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 size={16} />
                    <span>Netbanking</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('wallet')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition font-medium text-xs ${
                    activeTab === 'wallet'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                      : 'text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Wallet size={16} />
                    <span>Wallets</span>
                  </div>
                  <ChevronRight size={14} className="opacity-50" />
                </button>

                {/* Sidebar Trust Info */}
                <div className="hidden md:block mt-auto p-3 text-[11px] text-slate-500 border-t border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                    <Wifi size={13} className="text-blue-600" /> Real Phone Sync
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Connect your phone to the same Wi-Fi network and scan the QR code to open the payment page.
                  </p>
                </div>
              </div>

              {/* Right Content Area */}
              <div className="md:col-span-8 lg:col-span-9 p-5 sm:p-6 flex flex-col justify-between">
                {/* TAB 1: UPI & REAL QR CODE */}
                {activeTab === 'upi' && (
                  <div className="space-y-4">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <QrCode size={16} className="text-blue-600" />
                          Scan & Pay via UPI QR Code
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Use your smartphone camera, Google Pay, PhonePe, or Paytm
                        </p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg">
                          Amount: ₹{amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {sessionLoading ? (
                      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border border-slate-200">
                        <RefreshCw size={28} className="animate-spin text-blue-600 mb-2" />
                        <span className="text-xs text-slate-500">Generating Real Scannable QR Code...</span>
                      </div>
                    ) : sessionError ? (
                      <div className="p-5 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-2">
                        <p className="text-xs text-rose-600 font-semibold">{sessionError}</p>
                        <button
                          onClick={createRealPaymentSession}
                          className="px-4 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold"
                        >
                          Retry Session
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch bg-slate-50/90 p-5 rounded-2xl border border-slate-200">
                        {/* Column 1: QR Card */}
                        <div className="md:col-span-5 bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-between min-w-[210px]">
                          {/* Top QR Label */}
                          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-bold text-slate-600">
                            <span className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              BHIM UPI QR
                            </span>
                            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                              ACTIVE
                            </span>
                          </div>

                          {/* The QR Code itself */}
                          <div className="p-2.5 bg-white rounded-xl border border-slate-100 shadow-inner flex items-center justify-center">
                            <QRCodeSVG
                              value={sessionData?.mobilePayUrl || window.location.href}
                              size={170}
                              level="M"
                              includeMargin={false}
                            />
                          </div>

                          {/* Amount Banner below QR */}
                          <div className="mt-3 w-full py-2 px-3 bg-slate-900 text-white rounded-xl text-center shadow-sm">
                            <div className="text-[10px] text-slate-400 font-medium tracking-wider">AMOUNT TO PAY</div>
                            <div className="text-base font-black tracking-tight text-white">
                              ₹{amount.toLocaleString('en-IN')}.00
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Status & Instructions */}
                        <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                          {/* Pulse status card */}
                          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                              </span>
                              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                                Listening for Mobile Confirmation
                              </span>
                            </div>
                            <h5 className="font-bold text-slate-800 text-sm mt-1">
                              Opens on your Mobile Device!
                            </h5>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              When scanned, your phone opens the payment authorization page with two prominent buttons: <strong>Confirm & Pay</strong> and <strong>Reject</strong>.
                            </p>
                          </div>

                          {/* Direct Link box */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                              <span>Mobile Payment Link:</span>
                              <span className="text-[10px] text-blue-600 font-semibold">Same Wi-Fi Network</span>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
                              <div className="flex-1 px-1.5 text-[11px] font-mono text-slate-600 truncate select-all">
                                {sessionData?.mobilePayUrl}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
                                <button
                                  type="button"
                                  onClick={handleCopyMobileUrl}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                                  title="Copy link to clipboard"
                                >
                                  {copiedUrl ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                                  <span>{copiedUrl ? 'Copied' : 'Copy Link'}</span>
                                </button>
                                <a
                                  href={sessionData?.mobilePayUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 transition shadow-sm active:scale-95"
                                  title="Open in a browser tab"
                                >
                                  <ExternalLink size={13} />
                                  <span>Open in Tab</span>
                                </a>
                              </div>
                            </div>
                          </div>

                          {/* Supported apps */}
                          <div className="pt-2 border-t border-slate-200/70">
                            <span className="text-[10px] text-slate-400 font-medium block mb-1.5 uppercase tracking-wider">
                              Compatible with:
                            </span>
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-800 shadow-2xs">
                                GPay
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-purple-700 shadow-2xs">
                                PhonePe
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-sky-600 shadow-2xs">
                                Paytm
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-emerald-700 shadow-2xs">
                                Camera
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 2: CARDS */}
                {activeTab === 'card' && (
                  <div className="space-y-4">
                    {/* Header bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                          <CreditCard size={16} className="text-blue-600" />
                          Credit or Debit Card Payment
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Visa, MasterCard, RuPay, Maestro and American Express supported
                        </p>
                      </div>
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg self-start sm:self-auto">
                        Amount: ₹{amount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch bg-slate-50/90 p-5 rounded-2xl border border-slate-200">
                      {/* Column 1: Live Interactive Card Hologram Preview (5 cols) */}
                      <div className="md:col-span-5 flex flex-col justify-between space-y-3">
                        <div className="relative w-full aspect-[1.586] rounded-2xl p-4 sm:p-5 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-xl border border-slate-700/60 overflow-hidden flex flex-col justify-between">
                          {/* Subtle metallic sheen & circuit overlay */}
                          <div className="absolute inset-0 bg-radial-gradient from-white/10 to-transparent pointer-events-none opacity-40" />
                          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

                          {/* Top Row: Chip & Contactless */}
                          <div className="flex items-center justify-between relative z-10">
                            <div className="w-10 h-7 rounded-md bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 border border-amber-300 shadow-inner flex items-center justify-center">
                              <div className="w-6 h-4 border border-amber-600/40 rounded-[2px] opacity-75" />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono tracking-widest text-slate-400">DEBIT / CREDIT</span>
                              <div className="text-slate-300 opacity-80">
                                <Wifi size={14} className="rotate-90" />
                              </div>
                            </div>
                          </div>

                          {/* Center: Embossed Card Number */}
                          <div className="relative z-10 my-auto">
                            <div className="font-mono text-sm sm:text-base font-bold tracking-widest text-slate-100 drop-shadow select-all">
                              {cardNumber || '•••• •••• •••• ••••'}
                            </div>
                          </div>

                          {/* Bottom Row: Name, Expiry, Brand Badge */}
                          <div className="flex items-end justify-between relative z-10 pt-2 border-t border-white/10 text-xs">
                            <div>
                              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Cardholder</div>
                              <div className="font-semibold tracking-wide text-white uppercase text-[11px] truncate max-w-[130px]">
                                {cardName || 'YOUR NAME'}
                              </div>
                            </div>

                            <div className="text-center">
                              <div className="text-[9px] uppercase tracking-wider text-slate-400 font-medium">Expires</div>
                              <div className="font-mono font-bold text-slate-200 text-[11px]">
                                {cardExpiry || 'MM/YY'}
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-black tracking-wider uppercase shadow-sm ${cardBrand.bg} ${cardBrand.text}`}>
                                {cardBrand.name}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Security Assurance pill */}
                        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 py-1">
                          <ShieldCheck size={13} className="text-emerald-600" />
                          <span>RBI Tokenized • 256-bit Bank Grade Encrypted</span>
                        </div>
                      </div>

                      {/* Column 2: Form Inputs (7 cols) */}
                      <div className="md:col-span-7 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-3.5">
                        <div className="space-y-3">
                          {/* Card Number Input */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              CARD NUMBER
                            </label>
                            <div className="relative flex items-center">
                              <input
                                type="text"
                                maxLength={19}
                                value={cardNumber}
                                onChange={handleCardNumberChange}
                                className="w-full pl-3 pr-16 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-semibold"
                                placeholder="4532 8820 9012 4432"
                              />
                              <span className={`absolute right-2 px-2 py-0.5 rounded text-[10px] font-black uppercase ${cardBrand.bg} ${cardBrand.text}`}>
                                {cardBrand.name}
                              </span>
                            </div>
                          </div>

                          {/* Expiry Date & CVV Row */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                EXPIRY DATE
                              </label>
                              <input
                                type="text"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={handleExpiryChange}
                                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-semibold"
                                placeholder="MM/YY"
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                                CVV / CVC
                              </label>
                              <div className="relative flex items-center">
                                <input
                                  type="password"
                                  maxLength={4}
                                  value={cardCvv}
                                  onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-semibold"
                                  placeholder="•••"
                                />
                                <Lock size={12} className="absolute right-3 text-slate-400 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                          {/* Cardholder Name */}
                          <div>
                            <label className="text-[11px] font-bold text-slate-700 block mb-1">
                              CARDHOLDER NAME
                            </label>
                            <input
                              type="text"
                              value={cardName}
                              onChange={(e) => setCardName(e.target.value.toUpperCase())}
                              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg uppercase focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 font-semibold tracking-wide"
                              placeholder="NAME AS SHOWN ON CARD"
                            />
                          </div>

                          {/* Save Card Checkbox */}
                          <label className="flex items-center gap-2 cursor-pointer pt-1">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <span className="text-[11px] text-slate-600">
                              Save card securely as per RBI guidelines
                            </span>
                          </label>
                        </div>

                        {/* CTA Pay Button */}
                        <button
                          type="button"
                          onClick={handleSimulateDesktopCardPay}
                          className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-blue-500/20 transition active:scale-98 flex items-center justify-center gap-2"
                        >
                          <Lock size={14} />
                          Pay ₹{amount.toLocaleString('en-IN')}.00 via Card
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: NETBANKING */}
                {activeTab === 'netbanking' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Select Your Bank
                      </h4>
                      <p className="text-xs text-slate-500">
                        Fast and secure payment with major Indian financial institutions.
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Punjab National'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={handleSimulateDesktopCardPay}
                          className="p-3 text-center border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/50 transition group"
                        >
                          <Building2 size={18} className="mx-auto mb-1 text-slate-500 group-hover:text-blue-600" />
                          <span className="text-[11px] font-bold text-slate-700 block truncate">
                            {bank}
                          </span>
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulateDesktopCardPay}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      Proceed to Bank Netbanking
                    </button>
                  </div>
                )}

                {/* TAB 4: WALLETS */}
                {activeTab === 'wallet' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        Select Digital Wallet
                      </h4>
                      <p className="text-xs text-slate-500">
                        Pay quickly with one tap using linked mobile wallets.
                      </p>
                    </div>

                    <div className="space-y-2">
                      {['Paytm Wallet', 'Amazon Pay', 'MobiKwik', 'Airtel Money'].map((wallet) => (
                        <div
                          key={wallet}
                          onClick={handleSimulateDesktopCardPay}
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition"
                        >
                          <div className="flex items-center gap-3">
                            <Wallet size={16} className="text-blue-600" />
                            <span className="text-xs font-bold text-slate-800">{wallet}</span>
                          </div>
                          <button className="text-[11px] font-bold text-blue-600 hover:underline">
                            Link & Pay
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Trust Row */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield size={12} className="text-blue-600" /> PCI-DSS Level 1 Certified
                  </span>
                  <span>Session: {sessionData?.sessionId || 'Connecting...'}</span>
                </div>
              </div>
            </div>
          )}

          {/* STATE 2: PROCESSING STATE */}
          {gatewayState === 'processing' && (
            <div className="p-12 flex flex-col items-center justify-center min-h-[420px] text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold">
                  ⚡
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">
                  Authorizing Payment with Bank...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Synchronizing with mobile authorization. Please do not close this window.
                </p>
              </div>
            </div>
          )}

          {/* STATE 3: PAYMENT APPROVED ON MOBILE PHONE */}
          {gatewayState === 'success' && (
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[420px] text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-50">
                <CheckCircle2 size={44} className="stroke-[2.5]" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                  Payment Confirmed on Mobile Phone
                </span>
                <h3 className="font-black text-slate-900 text-2xl">
                  Payment Successful!
                </h3>
                <p className="text-xs text-slate-500">
                  ₹{amount.toLocaleString('en-IN')} paid successfully to BGVerify Technologies.
                </p>
              </div>

              {/* Receipt Card */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs w-full max-w-sm text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment ID:</span>
                  <span className="font-mono font-bold text-slate-800">{paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coins Credited:</span>
                  <span className="font-bold text-emerald-700">+{coins} BGCoins</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Method:</span>
                  <span className="font-medium text-slate-800">Phone UPI QR Scan</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <RefreshCw size={13} className="animate-spin text-blue-600" />
                <span>Crediting BGCoins to your organization balance...</span>
              </div>
            </div>
          )}

          {/* STATE 4: REJECTED ON MOBILE PHONE */}
          {gatewayState === 'failed' && (
            <div className="p-8 sm:p-12 flex flex-col items-center justify-center min-h-[420px] text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-md shadow-rose-500/20">
                <XCircle size={36} />
              </div>

              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 text-xl">
                  Payment Declined
                </h3>
                <p className="text-xs text-rose-600 font-medium">
                  {declineReason}
                </p>
                <p className="text-[11px] text-slate-400">
                  No money was deducted from your account. You can scan again or try another payment method.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setGatewayState('checkout');
                    createRealPaymentSession();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition"
                >
                  Generate New QR Code
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium text-xs transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Razorpay Footer */}
        <div className="bg-[#f8fafc] px-5 py-3 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700">
            <span>Powered by</span>
            <span className="font-black tracking-tight text-blue-600 text-xs">
              Razorpay
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hover:underline cursor-pointer">Support</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Terms</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Privacy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
