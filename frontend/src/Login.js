import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import SimpleCaptcha from './SimpleCaptcha';
import smartwaitLogo from './smartwait-logo.png';
import './Login.css';

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
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [currentBadge, setCurrentBadge] = useState(0);

  // Security badges that flip/rotate
  const securityBadges = [
    { icon: 'https://dev.pdp.gokwik.co/kwikpass/assets/icons/carousel_icon.svg', text: '100% Secure & Spam Free' },
    { icon: 'https://dev.pdp.gokwik.co/kwikpass/assets/icons/carousel_icon.svg', text: 'Instant OTP Verification' },
    { icon: 'https://dev.pdp.gokwik.co/kwikpass/assets/icons/carousel_icon.svg', text: 'Trusted by Thousands' }
  ];

  // Rotate security badges
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBadge((prev) => (prev + 1) % securityBadges.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [securityBadges.length]);

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

  // Handle CAPTCHA change from SimpleCaptcha component
  const handleCaptchaChange = (userInput, correctAnswer) => {
    setCaptchaInput(userInput);
    setCaptchaAnswer(correctAnswer);
  };

  const handleCaptchaVerified = (verified) => {
    setCaptchaVerified(verified);
  };

  const verifyCaptcha = () => {
    // If already verified via component, return true
    if (captchaVerified) {
      return true;
    }
    
    // Case-insensitive comparison
    if (captchaInput.toLowerCase() !== captchaAnswer.toLowerCase()) {
      setMessage('Captcha is incorrect');
      return false;
    }
    return true;
  };

  const sendOTP = async () => {
    // Verify CAPTCHA first
    if (!verifyCaptcha()) {
      return;
    }

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
    <>
      <style>{`
        /* Login Component Styles */
        .login-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 20px;
          background: linear-gradient(135deg, #4E71FF 0%, #4E71FF 100%);
          position: relative;
          overflow: hidden;
        }

        .security-badge {
          background: linear-gradient(135deg, rgba(78, 113, 255, 0.15) 0%, rgba(78, 113, 255, 0.1) 100%);
          backdrop-filter: blur(10px);
          border: 1.5px solid rgba(78, 113, 255, 0.25);
          padding: 11px 20px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          margin-bottom: 18px;
          box-shadow: 0 6px 24px rgba(78, 113, 255, 0.1);
          position: relative;
          width: 100%;
          max-width: 340px;
        }

        .security-badge-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          animation: fadeInText 0.5s ease;
        }

        .security-badge-icon {
          width: 20px;
          height: 20px;
          object-fit: contain;
          flex-shrink: 0;
          opacity: 0.9;
        }

        .security-badge-text {
          font-size: 12px;
          font-weight: 600;
          color: #2d3748;
          text-align: center;
          letter-spacing: 0.2px;
        }

        .security-badge-dots {
          display: flex;
          gap: 6px;
          align-items: center;
          justify-content: center;
          position: absolute;
          bottom: -14px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10;
        }

        .security-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(78, 113, 255, 0.3);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .security-dot.active {
          background: rgba(78, 113, 255, 0.8);
          width: 14px;
          border-radius: 3px;
        }

        @keyframes fadeInText {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .login-container {
          width: 100%;
          max-width: 380px;
          background: white;
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.18);
          overflow: hidden;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .logo-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px 24px 14px 24px;
          background: linear-gradient(180deg, rgba(78, 113, 255, 0.05) 0%, transparent 100%);
          border-bottom: 1px solid rgba(78, 113, 255, 0.08);
        }

        .waitsmart-logo {
          height: 110px;
          width: auto;
          object-fit: contain;
          animation: logoFadeIn 0.6s ease;
          margin-bottom: 4px;
        }

        @keyframes logoFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .login-form {
          padding: 28px 24px;
          position: relative;
          transition: transform 0.45s cubic-bezier(.2,.9,.2,1), box-shadow 0.3s ease, opacity 0.45s ease;
          will-change: transform, opacity;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 14px;
          flex: 1;
        }

        .login-title {
          font-size: 22px;
          font-weight: 600;
          text-align: center;
          color: #1a202c;
          letter-spacing: -0.5px;
          margin: 0 0 6px 0;
        }

        .phone-input-group {
          display: flex;
          gap: 0;
          margin-bottom: 0;
          border: 2px solid #e2e8f0;
          border-radius: 10px;
          overflow: hidden;
          background: #f8fafc;
          transition: all 0.3s ease;
          width: 100%;
          max-width: 340px;
        }

        .phone-input-group:focus-within {
          border-color: #4E71FF;
          box-shadow: 0 4px 20px rgba(78, 113, 255, 0.15);
          background: white;
        }

        .country-code {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0 14px;
          background: #f7fafc;
          border-right: 2px solid #e2e8f0;
          font-weight: 400;
          color: #2d3748;
          min-width: 85px;
        }

        .country-flag {
          width: 22px;
          height: 14px;
          object-fit: cover;
          border-radius: 2px;
          display: block;
        }

        .code {
          font-size: 14px;
          letter-spacing: 0.5px;
        }

        .phone-input {
          flex: 1;
          border: none;
          padding: 11px 14px;
          font-size: 14px;
          outline: none;
          background: white;
          color: #2d3748;
          font-weight: 400;
          transition: box-shadow 0.25s ease, transform 0.25s ease;
        }

        .phone-input::placeholder {
          color: #a0aec0;
        }

        .phone-input:focus {
          background: white;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 8px;
          cursor: pointer;
          font-size: 12px;
          line-height: 1.4;
          color: #4a5568;
          font-weight: 400;
          width: 100%;
          max-width: 360px;
        }

        .checkbox-label input {
          width: 16px;
          height: 16px;
          cursor: pointer;
          accent-color: #4E71FF;
          border-radius: 4px;
          margin-top: 2px;
        }

        .checkbox-label span {
          display: inline-block;
          line-height: 1.4;
        }

        .otp-subtitle {
          text-align: center;
          color: #718096;
          font-size: 13px;
          margin-bottom: 28px;
          line-height: 1.6;
          font-weight: 400;
        }

        .submit-btn {
          width: 100%;
          max-width: 340px;
          padding: 12px 14px;
          font-size: 14px;
          font-weight: 600;
          color: #ffffff;
          background: linear-gradient(135deg, #4E71FF 0%, #4E71FF 100%);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 4px;
          box-shadow: 0 4px 15px rgba(78, 113, 255, 0.4);
          letter-spacing: 0.3px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(78, 113, 255, 0.5);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .error-msg {
          color: #f56565;
          font-size: 13px;
          text-align: center;
          margin: 16px 0;
          font-weight: 400;
        }

        .resend-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
        }

        .resend-hint {
          font-size: 13px;
          color: #718096;
        }

        .resend-link-btn {
          background: transparent;
          border: none;
          color: #667eea;
          font-weight: 600;
          cursor: pointer;
          padding: 0 2px;
        }

        .resend-link-btn:hover:not(:disabled) {
          text-decoration: underline;
        }

        .resend-link-btn:disabled,
        .resend-link-btn[aria-disabled='true'] {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .resend-timer {
          font-size: 12px;
          color: #A0AEC0;
        }

        .otp-input-wrapper {
          width: 100%;
          display: flex;
          justify-content: center;
          margin: 0 auto 20px auto;
        }

        .otp-input-wrapper .ant-input-otp {
          display: flex;
          justify-content: center;
          gap: 12px;
        }

        .otp-input-wrapper .ant-input {
          width: 52px;
          height: 60px;
          text-align: center;
          font-size: 22px;
          font-weight: 600;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: none;
          transition: all 0.2s ease;
        }

        .otp-input-wrapper .ant-input:focus {
          border-color: #4E71FF;
          box-shadow: 0 4px 18px rgba(78, 113, 255, 0.2);
          background: #f9fafb;
        }

        .login-form.verified {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }

        .success-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #4E71FF 0%, #4E71FF 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          color: white;
          margin-bottom: 25px;
          animation: scaleIn 0.5s ease;
          box-shadow: 0 8px 24px rgba(78, 113, 255, 0.4);
        }

        .success-icon svg {
          width: 80px;
          height: 80px;
        }

        .check-circle {
          stroke-dasharray: 240;
          stroke-dashoffset: 240;
          animation: drawCircle 0.7s ease forwards;
        }

        .check-path {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: drawCheck 0.45s ease 0.6s forwards;
        }

        @keyframes drawCircle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes drawCheck {
          to {
            stroke-dashoffset: 0;
          }
        }

        .login-form.verified h2 {
          font-size: 20px;
          color: #2d3748;
          margin-bottom: 12px;
          font-weight: 500;
        }

        .login-form.verified p {
          color: #718096;
          font-size: 14px;
          font-weight: 400;
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .fade-in {
          animation: fadeIn 0.4s ease;
        }

        .powered-by-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          margin-top: 6px;
          padding-bottom: 2px;
        }

        .powered-text {
          font-size: 9px;
          font-weight: 400;
          color: #a0a8b8;
          letter-spacing: 0.2px;
        }

        .smshub-brand {
          font-size: 9px;
          font-weight: 600;
          background: linear-gradient(135deg, #4E71FF 0%, #7B68FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: 0.3px;
        }

        @media (max-width: 600px) {
          .login-wrapper {
            padding: 12px;
          }

          .login-container {
            width: 100%;
            max-width: 100%;
            border-radius: 20px;
          }

          .logo-container {
            padding: 16px 16px 12px 16px;
          }

          .waitsmart-logo {
            height: 85px;
          }

          .login-form {
            padding: 20px 16px;
            gap: 12px;
          }

          .security-badge {
            max-width: 100%;
            padding: 9px 16px;
            margin-bottom: 14px;
          }

          .security-badge-text {
            font-size: 11px;
          }

          .security-badge-icon {
            width: 18px;
            height: 18px;
          }

          .login-title {
            font-size: 20px;
            margin-bottom: 2px;
          }

          .phone-input-group {
            max-width: 100%;
          }

          .submit-btn {
            max-width: 100%;
            padding: 13px 16px;
            font-size: 15px;
          }

          .powered-text {
            font-size: 8px;
          }

          .smshub-brand {
            font-size: 8px;
          }

          .checkbox-label {
            font-size: 11px;
          }

          .otp-input-wrapper .ant-input {
            width: 48px;
            height: 56px;
            font-size: 20px;
          }
        }
      `}</style>
      <div className="login-wrapper">
        <div className="login-container">
          {/* WaitSmart Logo */}
          <div className="logo-container">
            <img src={smartwaitLogo} alt="WaitSmart" className="waitsmart-logo" />
            {/* Powered by SMSHUB */}
            <div className="powered-by-footer">
              <span className="powered-text">powered by</span>
              <span className="smshub-brand">SMSHUB</span>
            </div>
          </div>

        {/* Phone Step */}
        {step === 'phone' && (
          <div className="login-form fade-in">
            {/* Animated Security Badge with Dots Below On Border */}
            <div className="security-badge">
              <div className="security-badge-content" key={currentBadge}>
                <img 
                  src={securityBadges[currentBadge].icon} 
                  alt="security" 
                  className="security-badge-icon" 
                />
                <span className="security-badge-text">{securityBadges[currentBadge].text}</span>
              </div>
              <div className="security-badge-dots">
                {securityBadges.map((_, index) => (
                  <div 
                    key={index} 
                    className={`security-dot ${index === currentBadge ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>

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

            {/* SimpleCaptcha Component - Show only after phone is filled */}
            {phone.length === 10 && (
              <>
                <SimpleCaptcha 
                  onCaptchaChange={handleCaptchaChange}
                  onVerified={handleCaptchaVerified}
                />

                {/* Accept & Agree checkbox (required) now below the captcha */}
                <label className="checkbox-label" style={{marginBottom: '12px'}}>
                  <input 
                    type="checkbox" 
                    checked={notify}
                    onChange={(e) => setNotify(e.target.checked)}
                  />
                  <span>I accept and agree to the Privacy Policy & Terms.</span>
                </label>
              </>
            )}

            {message && <p className="error-msg">{message}</p>}

            <button 
              onClick={sendOTP} 
              disabled={loading || phone.length !== 10 || !notify || !captchaVerified} 
              className="submit-btn"
            >
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
    </>
  );
}

export default Login;
