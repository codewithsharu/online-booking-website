import React, { useEffect, useState } from 'react';
import { Input } from 'antd';

// Use environment variable from .env (REACT_APP_API_URL)
// For mobile testing: set REACT_APP_API_URL=http://YOUR_PC_IP:3000 in .env
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// SMS Error code messages mapping
const SMS_ERROR_CODES = {
  '000': 'OTP sent successfully',
  '001': 'Login details cannot be blank',
  '003': 'Sender cannot be blank',
  '004': 'Message text cannot be blank',
  '005': 'Message data cannot be blank',
  '006': 'Generic error occurred',
  '007': 'Username or password is invalid',
  '008': 'Account not active',
  '009': 'Account locked, contact your account manager',
  '010': 'API restriction - please contact support',
  '011': 'IP address restriction - try again',
  '012': 'Invalid message length',
  '013': 'Mobile number not valid',
  '014': 'Account locked due to spam - contact support',
  '015': 'Sender ID not valid',
  '017': 'Group ID not valid',
  '018': 'Multi message to group not supported',
  '019': 'Schedule date not valid',
  '020': 'Message or mobile number cannot be blank',
  '021': 'Insufficient SMS credits - try again later',
  '022': 'Invalid job ID',
  '023': 'Parameter missing',
  '024': 'Invalid template',
  '025': 'Field cannot be blank',
  '026': 'Invalid date range',
  '027': 'Invalid opt-in user',
  '028': 'Invalid data',
  '029': 'Email cannot be blank',
  '030': 'Password cannot be blank',
  '031': 'Username cannot be blank',
  '032': 'Mobile number cannot be blank',
  '033': 'Username already exists',
  '034': 'Mobile number already exists',
  '035': 'Email already exists',
  '036': 'Email cannot be blank'
};

function Login() {
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [notify, setNotify] = useState(false); // repurposed as accept & agree
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
    // Trim phone and validate
    const trimmedPhone = phone.trim();
    
    if (!trimmedPhone) {
      setMessage('Enter phone number');
      return;
    }

    if (trimmedPhone.length !== 10) {
      setMessage(`Enter valid 10-digit phone number (current: ${trimmedPhone.length} digits)`);
      return;
    }

    if (!/^\d{10}$/.test(trimmedPhone)) {
      setMessage('Phone number must contain only digits');
      return;
    }
    
    setLoading(true);
    try {
      console.log('📱 Sending OTP to:', trimmedPhone);
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + trimmedPhone })
      });
      console.log('OTP send response status:', res.status);
      const data = await res.json().catch(() => ({}));
      console.log('OTP send response data:', data);

      if (res.ok) {
        setStep('otp');
        setMessage('');
        setCooldown(true);
        setRemaining(60);
        
        // Auto-fill OTP for test accounts
        if (data.isTestAccount) {
          setOtp('1111');
          setMessage('🧪 Test account detected - OTP pre-filled (1111)');
        }
        
        // For testing: show OTP if returned by server
        if (data.otp) {
          console.log('🔐 TEST OTP (from server):', data.otp);
        }
      } else {
        // Handle error codes from backend
        const errorMsg = data.error || 'Failed to send OTP';
        const errorCode = data.errorCode;
        const userMessage = errorCode && SMS_ERROR_CODES[errorCode] ? SMS_ERROR_CODES[errorCode] : errorMsg;
        setMessage(userMessage);
      }
    } catch (error) {
      console.error('❌ Network error sending OTP:', error);
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
      const trimmedPhone = phone.trim();
      console.log('📱 Resending OTP to:', trimmedPhone);
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + trimmedPhone })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setCooldown(true);
        setRemaining(60);
        if (data.otp) {
          console.log('🔐 TEST OTP (resend):', data.otp);
        }
      } else {
        // Handle error codes from backend
        const errorMsg = data.error || 'Failed to resend OTP';
        const errorCode = data.errorCode;
        const userMessage = errorCode && SMS_ERROR_CODES[errorCode] ? SMS_ERROR_CODES[errorCode] : errorMsg;
        setMessage(userMessage);
      }
    } catch (error) {
      console.error('❌ Network error resending OTP:', error);
      setMessage('Network error: ' + error.message);
    } finally {
      setResendLoading(false);
    }
  };

  const verifyOTP = async () => {
    const trimmedOTP = otp.trim();
    
    if (!trimmedOTP) {
      setMessage('Enter OTP');
      return;
    }

    if (trimmedOTP.length !== 4) {
      setMessage(`Enter valid 4-digit OTP (current: ${trimmedOTP.length} digits)`);
      return;
    }

    if (!/^\d{4}$/.test(trimmedOTP)) {
      setMessage('OTP must contain only 4 digits');
      return;
    }
    
    setLoading(true);
    try {
      const trimmedPhone = phone.trim();
      console.log('🔐 Verifying OTP for phone:', trimmedPhone);
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + trimmedPhone, otp: trimmedOTP })
      });
      console.log('OTP verify response status:', res.status);
      const data = await res.json().catch(() => ({}));
      console.log('OTP verify response data:', data);

      if (res.ok) {
        // Store only JWT token; derive role from token payload
        localStorage.setItem('token', data.token);

        let roleFromToken = data.role;
        try {
          const payload = JSON.parse(atob(data.token.split('.')[1]));
          roleFromToken = payload.role;
        } catch (e) {
          console.warn('⚠️ Could not decode role from token, falling back to API role');
        }

        setStep('verified');
        setTimeout(() => {
          // Redirect based on role
          if (roleFromToken === 'merchant') {
            window.location.href = '/merchant-dashboard';
          } else if (roleFromToken === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/home';
          }
        }, 2000);
      } else {
        setMessage(data.error || `Invalid OTP (status ${res.status})`);
      }
    } catch (error) {
      console.error('❌ Network error verifying OTP:', error);
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
            <img src="/assets/login.svg" alt="Login" className="login-hero" />
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

              {/* Accept & Agree checkbox (required) now below the number input */}
              <label className="checkbox-label" style={{marginBottom: '12px'}}>
                <input 
                  type="checkbox" 
                  checked={notify}
                  onChange={(e) => setNotify(e.target.checked)}
                />
                <span>I accept and agree to the Privacy Policy & Terms.</span>
              </label>

            {message && <p className="error-msg">{message}</p>}

            <button onClick={sendOTP} disabled={loading || phone.length !== 10 || !notify} className="submit-btn">
              {loading ? 'Sending...' : 'Submit'}
            </button>
          </div>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <div className="login-form fade-in">
            <h1 className="login-title">Verify OTP</h1>
            <p className="otp-subtitle">Enter 4 digit verification code sent to +91{phone}</p>
            
            <div className="otp-input-wrapper">
              <Input.OTP
                length={4}
                size="large"
                value={otp}
                formatter={(str = '') => str.replace(/\D/g, '')}
                onChange={(text = '') => setOtp(text)}
                inputMode="numeric"
                variant="filled"
                autoFocus
              />
            </div>

                {message && <p className="error-msg">{message}</p>}

                <button onClick={verifyOTP} disabled={loading || otp.length !== 4} className="submit-btn">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <div className="resend-row">
                  <span className="resend-hint">Didn't receive the code?</span>
                  <button
                    type="button"
                    className="resend-link-btn"
                    onClick={resendOTP}
                    disabled={resendLoading || cooldown}
                    aria-disabled={resendLoading || cooldown}
                  >
                    {resendLoading ? 'Resending…' : 'Resend'}
                  </button>
                  {cooldown && <span className="resend-timer">{remaining}s</span>}
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
