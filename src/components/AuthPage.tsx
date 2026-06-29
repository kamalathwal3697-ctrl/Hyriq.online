import React, { useState } from 'react';
import { User, Briefcase, Mail, Lock, Sparkles, LogIn, UserPlus, Shield, CheckCircle, CreditCard } from 'lucide-react';

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
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin, onSignup }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'candidate' | 'recruiter'>('candidate');
  
  // Shared Form inputs
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Payment flow states
  const [showPayment, setShowPayment] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Coupon flow states
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponSuccessMsg, setCouponSuccessMsg] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);

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

  const handleRazorpayPayment = async () => {
    setPaymentProcessing(true);
    setErrorMsg('');

    try {
      // Step 1: Create order on backend
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error((errData.error || 'Failed to create payment order.') + (errData.details ? ` (${errData.details})` : ''));
      }

      const orderData = await orderRes.json();

      // Step 2: Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Hyriq',
        description: 'Job Seeker Registration — 1 Year Access',
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
              paymentId: response.razorpay_payment_id
            });

            setShowPayment(false);
            setPaymentProcessing(false);
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
        minHeight: '80vh',
        padding: '40px 0'
      }}>
        <div className="glass-panel animate-glow" style={{
          width: '100%',
          maxWidth: '480px',
          padding: '40px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background glow orbs */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: 'rgba(6, 182, 212, 0.15)',
            filter: 'blur(30px)',
            pointerEvents: 'none'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-40px',
            left: '-40px',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.12)',
            filter: 'blur(25px)',
            pointerEvents: 'none'
          }}></div>

          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CreditCard size={28} color="#fff" />
            </div>
            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
              Complete Registration
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
              One-time registration fee for job seekers
            </p>
          </div>

          {/* Pricing Card */}
          <div className="glass-panel" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(6, 182, 212, 0.08))',
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            textAlign: 'center',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>REGISTRATION FEE</span>
            <div style={{ margin: '8px 0' }}>
              <span style={{ fontSize: '40px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>₹99</span>
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)', marginLeft: '4px' }}>/ year</span>
            </div>
            <span className="badge badge-success" style={{ fontSize: '10px' }}>
              <CheckCircle size={10} style={{ marginRight: '4px' }} />
              Valid for 12 months
            </span>
          </div>

          {/* Features list */}
          <div style={{ marginBottom: '24px' }}>
            {[
              'Apply to unlimited job listings',
              'Direct chat with recruiters',
              'Fair Work Pact legal protection',
              'Priority visibility to employers'
            ].map((feature, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 0',
                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none'
              }}>
                <CheckCircle size={14} color="var(--success)" />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{feature}</span>
              </div>
            ))}
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{
              background: 'var(--danger-bg)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#fda4af',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px',
              fontWeight: 500
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          {/* Coupon Code Input */}
          <div className="glass-panel" style={{
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(255,255,255,0.02)',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Have a Coupon Code?
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="e.g. FREE100"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={couponApplied || paymentProcessing}
                className="glass-input"
                style={{ flex: 1, padding: '8px 12px', fontSize: '13px', textTransform: 'uppercase', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px' }}
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponApplied || paymentProcessing || couponChecking || !couponCode.trim()}
                className="btn btn-outline"
                style={{ padding: '0 16px', fontSize: '12px', borderRadius: '8px' }}
              >
                {couponChecking ? 'Checking...' : 'Apply'}
              </button>
            </div>
            {couponSuccessMsg && (
              <div style={{ color: '#22c55e', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>
                ✓ {couponSuccessMsg}
              </div>
            )}
          </div>

          {/* Action button */}
          {couponApplied ? (
            <button
              type="button"
              onClick={handleCouponSignup}
              className="btn animate-glow"
              style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: 700, background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
              disabled={paymentProcessing}
            >
              {paymentProcessing ? 'Registering...' : 'Avail Free Registration & Register'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleRazorpayPayment}
              className="btn btn-secondary animate-glow"
              style={{ width: '100%', padding: '16px', fontSize: '15px', fontWeight: 700, position: 'relative', overflow: 'hidden' }}
              disabled={paymentProcessing || paymentSuccess}
            >
              {paymentProcessing ? (
                <>Processing Payment...</>
              ) : paymentSuccess ? (
                <>
                  <CheckCircle size={16} style={{ marginRight: '6px' }} />
                  Payment Successful — Creating Account...
                </>
              ) : (
                <>
                  <Shield size={16} style={{ marginRight: '6px' }} />
                  Pay ₹99 & Register
                </>
              )}
            </button>
          )}

          {/* Security badges */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            marginTop: '16px'
          }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Shield size={10} /> Secured by Razorpay
            </span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>•</span>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>UPI · Cards · Net Banking</span>
          </div>

          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              setShowPayment(false);
              setErrorMsg('');
              setPaymentProcessing(false);
              setPaymentSuccess(false);
            }}
            className="btn btn-ghost"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={paymentProcessing}
          >
            ← Back to Sign Up
          </button>
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
      <div className="glass-panel animate-glow" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '40px',
        position: 'relative',
        overflow: 'hidden'
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
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span className="badge badge-primary" style={{ marginBottom: '12px' }}>
            <Sparkles size={12} style={{ marginRight: '6px' }} />
            Join the Vibe
          </span>
          <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: 'Outfit' }}>
            {isLogin ? 'Welcome to ' : 'Create Account on '}<span className="text-gradient-primary">Hyriq</span>
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>
            {isLogin ? 'Sign in to access your direct career matches' : 'Choose your role and start networking instantly'}
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
                  ₹99/year Registration for Job Seekers
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
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Email Address / Username</label>
            <div style={{ position: 'relative' }}>
              <Mail size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@domain.com or username"
                className="glass-input"
                style={{ paddingLeft: '44px', width: '100%' }}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '16px', top: '15px' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input"
                style={{ paddingLeft: '44px', width: '100%' }}
                required
              />
            </div>
          </div>

          {/* Bio Field (Sign Up only) */}
          {!isLogin && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
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
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Phone Number</label>
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
            style={{ width: '100%', marginTop: '12px', padding: '14px' }}
            disabled={loading}
          >
            {loading ? (
              'Processing...'
            ) : isLogin ? (
              <>
                Sign In <LogIn size={16} />
              </>
            ) : role === 'recruiter' ? (
              <>
                Create Free Account <UserPlus size={16} />
              </>
            ) : (
              <>
                Continue to Payment — ₹99 <UserPlus size={16} />
              </>
            )}
          </button>
        </form>

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
