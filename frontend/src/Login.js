import React, { useEffect, useState } from 'react';

// Use environment variable from .env (REACT_APP_API_URL)
// For mobile testing: set REACT_APP_API_URL=http://YOUR_PC_IP:3000 in .env
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Login() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [notify, setNotify] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [remaining, setRemaining] = useState(0);

  // start a 60s cooldown after OTP is sent
  useEffect(() => {
    if (step === 'otp' && cooldown && remaining > 0) {
      const t = setTimeout(() => setRemaining((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (remaining === 0) {
      setCooldown(false);
    }
  }, [step, cooldown, remaining]);

  const sendOTP = async () => {
    if (!phone) {
      setMessage('Enter phone number');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Sending OTP request to', `${API_URL}/send-otp`, { phone: '91' + phone });
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + phone })
      });
      console.log('OTP send response status:', res.status);
      const data = await res.json().catch(() => ({}));
      console.log('OTP send response data:', data);

      if (res.ok) {
        setStep('otp');
        setMessage('');
        setCooldown(true);
        setRemaining(60);
        // For testing: show OTP if returned by server
        if (data.otp) {
          console.log('🔐 TEST OTP (from server):', data.otp);
          // Optional: show in UI during development
          // setMessage(`Test OTP: ${data.otp}`);
        }
      } else {
        setMessage(data.error || `Failed to send OTP (status ${res.status})`);
      }
    } catch (error) {
      console.error('Network error sending OTP:', error);
      setMessage('Network error: ' + error.message + '. If testing on mobile, set REACT_APP_API_URL to your PC IP (e.g. http://192.168.x.x:3000) or use /api with a proxy.');
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (cooldown) return;
    setResendLoading(true);
    setMessage('');
    try {
      console.log('Resending OTP to', `${API_URL}/send-otp`, { phone: '91' + phone });
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + phone })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCooldown(true);
        setRemaining(60);
        if (data.otp) {
          console.log('🔐 TEST OTP (resend):', data.otp);
        }
      } else {
        setMessage(data.error || `Failed to resend OTP (status ${res.status})`);
      }
    } catch (error) {
      console.error('Network error resending OTP:', error);
      setMessage('Network error: ' + error.message);
    } finally {
      setResendLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (!otp) {
      setMessage('Enter OTP');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Verifying OTP to', `${API_URL}/verify-otp`, { phone: '91' + phone, otp });
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + phone, otp })
      });
      console.log('OTP verify response status:', res.status);
      const data = await res.json().catch(() => ({}));
      console.log('OTP verify response data:', data);

      if (res.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setStep('verified');
        setTimeout(() => {
          // Redirect based on role
          if (data.role === 'merchant') {
            window.location.href = '/merchant-dashboard';
          } else if (data.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/home';
          }
        }, 2000);
      } else {
        setMessage(data.error || `Invalid OTP (status ${res.status})`);
      }
    } catch (error) {
      console.error('Network error verifying OTP:', error);
      setMessage('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        {/* Phone Step */}
        {step === 'phone' && (
          <div className="login-form fade-in">
            <h1 className="login-title">Login / Signup</h1>
            
            <div className="phone-input-group">
              <div className="country-code">
                <img src="/assets/flag.png" alt="IN" className="country-flag" />
                <span className="code">+91</span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter Mobile Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                    e.preventDefault();
                  }
                }}
                onKeyPress={(e) => e.key === 'Enter' && sendOTP()}
                className="phone-input"
                maxLength="10"
              />
            </div>

            <label className="checkbox-label">
              <input 
                type="checkbox" 
                checked={notify}
                onChange={(e) => setNotify(e.target.checked)}
              />
              <span>Notify me for any updates & offers</span>
            </label>

            {message && <p className="error-msg">{message}</p>}

            <button onClick={sendOTP} disabled={loading || phone.length !== 10} className="submit-btn">
              {loading ? 'Sending...' : 'Submit'}
            </button>

            <div className="login-footer">
              <p className="policy-text">
                I accept that I have read & understood Appointment Booking's<br/>
                <button type="button" className="policy-link">Privacy Policy and T&Cs.</button>
              </p>
              <button type="button" className="trouble-link">Trouble logging in?</button>
            </div>
          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="login-form fade-in">
            <h1 className="login-title">Verify OTP</h1>
            <p className="otp-subtitle">Enter 6 digit verification code sent to +91{phone}</p>
            
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={(e) => e.key === 'Enter' && verifyOTP()}
              className="otp-input"
              maxLength="6"
            />

                {message && <p className="error-msg">{message}</p>}

                <button onClick={verifyOTP} disabled={loading} className="submit-btn">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="resend-row">
                  {!cooldown ? (
                    <button type="button" className="resend-btn" onClick={resendOTP} disabled={resendLoading} aria-disabled={resendLoading}>
                      {resendLoading ? 'Resending…' : 'Resend Code'}
                    </button>
                  ) : (
                    <p className="resend-text">Resend in {remaining}s</p>
                  )}
                </div>
              </div>
            )}

            {/* Verified Step */}
        {step === 'verified' && (
          <div className="login-form verified fade-in">
            <div className="success-icon">
              <svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
                <circle className="check-circle" cx="26" cy="26" r="24" fill="none" stroke="#667eea" strokeWidth="2" />
                <path className="check-path" fill="none" stroke="#fff" strokeWidth="4" d="M14 27 L22 34 L38 18" />
              </svg>
            </div>
            <h2>Phone Number Verified</h2>
            <p>You will be redirected to the main page shortly</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
