import React, { useState } from 'react';
import { User, Briefcase, Sparkles, Shield, CheckCircle, CreditCard, Eye, EyeOff } from 'lucide-react';
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
    
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1041935825227-tq62r7432j3h4l56u7m2b7q1c9d2f3s4.apps.googleusercontent.com';
    const redirectUri = `${window.location.origin}/auth/google/callback`;
    const scope = encodeURIComponent('openid profile email');
    const state = encodeURIComponent(role);
    
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&state=${state}`;
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
          paymentId: `pay_mock_${Date.now()}`
        });
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

          {/* Action button */}
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
              onClearGoogleAutofill?.();
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
              'Continue to Payment — ₹99'
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
