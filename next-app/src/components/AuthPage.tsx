import React, { useState } from 'react';
import { User, Briefcase, Sparkles, Shield, CheckCircle, CreditCard, Eye, EyeOff, MessageSquare, Rocket, Wallet, Layers, Gavel, Landmark } from 'lucide-react';
import { BrainNLogo } from './BrainNLogo';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface AuthPageProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onSignup: (details: {
    email: string;
    username?: string;
    pass: string;
    role: 'candidate' | 'recruiter';
    name: string;
    phone?: string;
    bio?: string;
    paymentId?: string;
    couponCode?: string;
  }) => Promise<void>;
  googleAutofill?: {
    email: string;
    name: string;
    googlePicture?: string;
  } | null;
  onClearGoogleAutofill?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignup, googleAutofill, onClearGoogleAutofill }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  
  // Shared Form inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Payment flow states
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState('launch');
  const [planPrice, setPlanPrice] = useState(149);

  React.useEffect(() => {
    const plan = localStorage.getItem('hyriq_selected_plan') || 'launch';
    setSelectedPlan(plan);
    setPlanPrice(plan === 'regular' ? 299 : plan === 'premium' ? 499 : 149);
  }, [showPayment]);

  // Coupon flow states
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);

  React.useEffect(() => {
    if (googleAutofill) {
      setEmail(googleAutofill.email);
      setName(googleAutofill.name);
      setIsLogin(false);
      setRole('candidate');
      setShowPayment(true);
    } else {
      const stored = localStorage.getItem('hyriq_google_autofill');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setEmail(parsed.email);
          setName(parsed.name);
          setIsLogin(false);
          setRole('candidate');
          setShowPayment(true);
          localStorage.removeItem('hyriq_google_autofill');
        } catch (e) {}
      }
    }
  }, [googleAutofill]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponChecking(true);
    setErrorMsg('');
    setCouponSuccessMsg('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponCode.trim() })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to validate coupon code.');
      }
      setCouponApplied(true);
      setCouponSuccessMsg(data.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid coupon code.');
      setCouponApplied(false);
    } finally {
      setCouponChecking(false);
    }
  };

  const handleCouponSignup = async () => {
    setPaymentProcessing(true);
    setErrorMsg('');
    try {
      setPaymentSuccess(true);
      await onSignup({
        email,
        username,
        pass: password,
        role,
        name,
        phone,
        bio,
        couponCode: couponCode.trim()
      });
      setShowPayment(false);
      setPaymentProcessing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed. Please try again.');
      setPaymentProcessing(false);
      setPaymentSuccess(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (isLogin) {
        await onLogin(email, password);
      } else {
        if (role === 'recruiter') {
          // Recruiters register FREE — no payment needed
          await onSignup({ email, username, pass: password, role, name, phone, bio });
        } else {
          // Candidates need to pay ₹99
          setShowPayment(true);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      if (err.requiresPayment) {
        setShowPayment(true);
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    localStorage.setItem('hyriq_oauth_role', role);
    if (couponCode) {
      localStorage.setItem('hyriq_oauth_coupon', couponCode);
    } else {
      localStorage.removeItem('hyriq_oauth_coupon');
    }
    
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '981768832340-95h41crnsb9b1s6eu2nvbc1iqlt4cpmd.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = encodeURIComponent('openid profile email');
    const state = encodeURIComponent(role);
    
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
  };

  const handleRazorpayPayment = async () => {
    setPaymentProcessing(true);
    setErrorMsg('');

    try {
      const selectedPlan = localStorage.getItem('hyriq_selected_plan') || 'launch';
      // Step 1: Create order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan })
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error((errData.error || 'Failed to create payment order.') + (errData.details ? ` (${errData.details})` : ''));
      }

      const orderData = await orderRes.json();

      // If no Razorpay keys are configured, bypass the real SDK for testing
      if (orderData.isMock) {
        setPaymentSuccess(true);
        await onSignup({
          email,
          username,
          pass: password,
          role,
          name,
          phone,
          bio,
          paymentId: `pay_mock_${Date.now()}`,
          plan: selectedPlan
        } as any);
        setShowPayment(false);
        setPaymentProcessing(false);
        onClearGoogleAutofill?.();
        return;
      }

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Hyriq',
        description: `Lifetime Job Seeker Plan — ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            // Step 3: Verify payment on backend
            const verifyRes = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok || !verifyData.verified) {
              setErrorMsg('Payment verification failed. Please contact support.');
              setPaymentProcessing(false);
              return;
            }

            // Step 4: Complete signup with verified payment ID
            setPaymentSuccess(true);
            await onSignup({
              email,
              username,
              pass: password,
              role,
              name,
              phone,
              bio,
              paymentId: response.razorpay_payment_id,
              plan: selectedPlan
            } as any);

            setShowPayment(false);
            setPaymentProcessing(false);
            onClearGoogleAutofill?.();
          } catch (err: any) {
            setErrorMsg(err.message || 'Signup failed after payment. Please contact support with your payment ID.');
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: name,
          email: email,
          contact: phone || ''
        },
        theme: {
          color: '#6366f1'
        },
        modal: {
          ondismiss: function () {
            setPaymentProcessing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setErrorMsg(`Payment failed: ${response.error.description || 'Please try again.'}`);
        setPaymentProcessing(false);
      });
      rzp.open();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not initiate payment. Please try again.');
      setPaymentProcessing(false);
    }
  };

  // Payment screen for candidates
  if (showPayment) {
    return (
      <div className="container animate-fade-in" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '40px 20px',
        backgroundColor: '#ffffff'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '460px',
          padding: '24px 16px',
          position: 'relative'
        }}>
          {/* Top Icon */}
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 4px 14px rgba(6, 182, 212, 0.2)'
          }}>
            <CreditCard size={28} color="#fff" />
          </div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, letterSpacing: '1px' }}>JOB SEEKER ACCESS</span>
            <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', marginTop: '4px', textTransform: 'uppercase', fontFamily: 'Inter' }}>
              ONE-TIME REGISTRATION FEE
            </h2>
          </div>

          {/* Pricing Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)',
            border: '1px solid #bae6fd',
            borderRadius: '16px',
            padding: '24px',
            gap: '16px',
            position: 'relative',
            boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.08)',
            marginBottom: '32px'
          }}>
            {/* Gray checked icon on the left */}
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              flexShrink: 0
            }}>
              <CheckCircle size={18} color="#ffffff" style={{ fill: '#94a3b8' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'center', paddingRight: '28px' }}>
              <span style={{
                fontSize: '9px',
                fontWeight: 800,
                color: '#1e40af',
                backgroundColor: '#dbeafe',
                padding: '2px 8px',
                borderRadius: '4px',
                letterSpacing: '0.5px'
              }}>
                LIMITED OFFER
              </span>
              <div style={{ fontSize: '48px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1, marginTop: '6px', fontFamily: 'Inter' }}>
                ₹{planPrice}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e293b', fontFamily: 'Inter' }}>
                One-Time Payment
              </div>
              <div style={{ fontSize: '10px', color: '#475569', fontWeight: 800, marginTop: '4px', letterSpacing: '0.5px' }}>
                LIFETIME UNLIMITED ACCESS
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', paddingLeft: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '3px solid #e2e8f0', paddingLeft: '16px' }}>
              <div style={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
                <Layers size={20} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px', fontFamily: 'Inter' }}>
                APPLY TO UNLIMITED JOB LISTINGS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '3px solid #e2e8f0', paddingLeft: '16px' }}>
              <div style={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
                <MessageSquare size={20} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px', fontFamily: 'Inter' }}>
                DIRECT CHAT WITH RECRUITERS
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '3px solid #e2e8f0', paddingLeft: '16px' }}>
              <div style={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
                <Gavel size={20} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px', fontFamily: 'Inter' }}>
                FAIR WORK PACT LEGAL PROTECTION
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '3px solid #e2e8f0', paddingLeft: '16px' }}>
              <div style={{ color: '#475569', display: 'flex', alignItems: 'center' }}>
                <Rocket size={20} />
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px', fontFamily: 'Inter' }}>
                PRIORITY VISIBILITY TO EMPLOYERS
              </span>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              fontWeight: 500
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            onClick={handleRazorpayPayment}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '15px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
            disabled={paymentProcessing || paymentSuccess}
          >
            {paymentProcessing ? (
              'Processing Payment...'
            ) : paymentSuccess ? (
              'Payment Successful — Creating Account...'
            ) : (
              <>
                <Wallet size={18} />
                Pay ₹{planPrice} & Register
              </>
            )}
          </button>

          {/* Organized Security & Payment Badges */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', marginTop: '20px' }}>
            <div style={{ fontSize: '11px', color: '#0f172a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Shield size={14} color="#10b981" style={{ fill: 'rgba(16, 185, 129, 0.1)' }} />
              Secured by <span style={{ fontWeight: 800 }}>Razorpay</span>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', alignItems: 'center', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Rocket size={12} /> UPI
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CreditCard size={12} /> Cards
              </div>
              <span>•</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Landmark size={12} /> Net Banking
              </div>
            </div>
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setShowPayment(false);
              setErrorMsg('');
              setPaymentProcessing(false);
              setPaymentSuccess(false);
              onClearGoogleAutofill?.();
            }}
            className="btn btn-ghost"
            style={{ width: '100%', marginTop: '16px', padding: '12px', fontSize: '13px', fontWeight: 700 }}
            disabled={paymentProcessing}
          >
            ← Back to Sign Up
          </button>

          {/* Footer Logo */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px', opacity: 0.5 }}>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⚡ logo
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '40px 0'
    }}>
      <div className="card-flat" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        {/* Background glow bubble */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.15)',
          filter: 'blur(30px)',
          pointerEvents: 'none'
        }}></div>

        {/* Brand Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <BrainNLogo />
          </div>
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            {isLogin ? 'Welcome Back' : 'Get Started'}
          </span>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', fontFamily: 'Inter', textAlign: 'center' }}>
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p style={{ color: '#475569', fontSize: '13px', marginTop: '6px', textAlign: 'center' }}>
            {isLogin ? 'Enter your email and password to access your dashboard' : 'Choose your role and start networking instantly'}
          </p>
        </div>

        {/* Role Switcher (Sign Up only) */}
        {!isLogin && (
          <div style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            padding: '4px',
            borderRadius: '12px',
            marginBottom: '16px'
          }}>
            <button
              type="button"
              onClick={() => setRole('candidate')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: role === 'candidate' ? 'var(--primary)' : 'transparent',
                color: role === 'candidate' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              <User size={14} /> Job Seeker
            </button>
            <button
              type="button"
              onClick={() => setRole('recruiter')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: role === 'recruiter' ? 'var(--secondary)' : 'transparent',
                color: role === 'recruiter' ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
            >
              <Briefcase size={14} /> Recruiter
            </button>
          </div>
        )}

        {/* Role-based pricing hint */}
        {!isLogin && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '8px',
            marginBottom: '20px',
            background: role === 'recruiter'
              ? 'rgba(16, 185, 129, 0.08)'
              : 'rgba(99, 102, 241, 0.08)',
            border: `1px solid ${role === 'recruiter'
              ? 'rgba(16, 185, 129, 0.2)'
              : 'rgba(99, 102, 241, 0.2)'}`,
          }}>
            {role === 'recruiter' ? (
              <>
                <CheckCircle size={13} color="var(--success)" />
                <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>
                  Free Registration for Recruiters
                </span>
              </>
            ) : (
              <>
                <CreditCard size={13} color="var(--primary)" />
                <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                  ₹{planPrice} One-Time Payment for Lifetime Job Alerts
                </span>
              </>
            )}
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            marginBottom: '20px',
            fontWeight: 500
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Name Field (Sign Up only) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                {role === 'candidate' ? 'Full Name' : 'Recruiter Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Mercer"
                className="glass-input"
                required
              />
            </div>
          )}

          {/* Username Field (Sign Up only) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Username (Optional)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. alex_mercer"
                className="glass-input"
              />
            </div>
          )}

          {/* Email Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Email Address / Username</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@domain.com or username"
              className="glass-input"
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPasswordText ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input"
                style={{ width: '100%', paddingRight: '44px' }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPasswordText(!showPasswordText)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#64748b',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {isLogin && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2px' }}>
                <button
                  type="button"
                  onClick={() => alert("Password reset link will be sent to your email.")}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>

          {/* Bio Field (Sign Up only) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                {role === 'candidate' ? 'Short Professional Bio' : 'Company Intro'}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={role === 'candidate' ? 'What makes you unique?' : 'What does your organization build?'}
                className="glass-input"
                rows={3}
                style={{ resize: 'none' }}
              />
            </div>
          )}

          {/* Phone Field (Sign Up only) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="glass-input"
              />
            </div>
          )}

          {/* Action Button */}
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px', padding: '14px', fontSize: '14px' }}
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : isLogin ? (
              'Sign In'
            ) : role === 'recruiter' ? (
              'Create Free Account'
            ) : (
              `Continue to Payment — ₹${planPrice}`
            )}
          </button>
        </form>

        {/* Separator */}
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
          <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>or</span>
          <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }}></div>
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="btn"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#475569',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: '4px' }}>
            <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.37 3.68 1.34 7.6l3.85 3C6.12 7.74 8.84 5.04 12 5.04z"/>
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.48-1.12 2.74-2.38 3.59l3.71 2.87c2.17-2 3.42-4.94 3.42-8.56z"/>
            <path fill="#FBBC05" d="M5.19 14.4c-.24-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29L1.34 7.6C.49 9.32 0 11.23 0 13.23s.49 3.91 1.34 5.63l3.85-3z"/>
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.71-2.87c-1.03.69-2.35 1.1-4.25 1.1-3.16 0-5.88-2.7-6.81-6.05L1.34 15.27C3.37 19.19 7.35 23 12 23z"/>
          </svg>
          Continue with Google
        </button>

        {/* Auth Toggle */}
        <div style={{
          textAlign: 'center',
          marginTop: '28px',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px',
          fontSize: '13px'
        }}>
          <span style={{ color: 'var(--text-secondary)' }}>
            {isLogin ? "Don't have an account yet?" : 'Already registered?'}
          </span>{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
              setShowPayment(false);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
