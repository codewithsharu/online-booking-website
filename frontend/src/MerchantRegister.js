import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function MerchantRegister() {
  const [step, setStep] = useState('phone'); // phone, otp, form
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    businessName: '',
    businessCategory: '',
    businessDescription: '',
    pincode: '',
    area: '',
    fullAddress: ''
  });
  const [submitted, setSubmitted] = useState(false);

  // Check if user is already logged in (redirect them)
  useEffect(() => {
    const loggedInToken = localStorage.getItem('token');
    let role = null;
    try {
      role = loggedInToken ? JSON.parse(atob(loggedInToken.split('.')[1])).role : null;
    } catch (e) {
      console.warn('⚠️ Unable to decode role from token');
    }

    if (loggedInToken) {
      console.log('✅ User already logged in, redirecting');
      // If they're already a merchant, go to merchant dashboard
      if (role === 'merchant') {
        window.location.href = '/merchant-dashboard';
      } else if (role === 'admin') {
        window.location.href = '/admin';
      } else {
        // Regular users can't access merchant register directly
        window.location.href = '/home';
      }
    }
  }, []);

  // Cooldown timer
  useEffect(() => {
    if (cooldown && remaining > 0) {
      const t = setTimeout(() => setRemaining((s) => s - 1), 1000);
      return () => clearTimeout(t);
    }
    if (remaining === 0) {
      setCooldown(false);
    }
  }, [cooldown, remaining]);

  const sendOTP = async () => {
    // Trim and validate phone
    const trimmedPhone = phone.trim();
    
    if (!trimmedPhone || trimmedPhone.length !== 10) {
      setMessage(`Enter valid 10-digit phone number (current: ${trimmedPhone.length} digits)`);
      console.log('❌ Invalid phone:', trimmedPhone, 'Length:', trimmedPhone.length);
      return;
    }

    // Double-check phone contains only digits
    if (!/^\d{10}$/.test(trimmedPhone)) {
      setMessage('Phone number must contain only digits');
      return;
    }

    // Check if it's a test merchant account - skip OTP
    if (trimmedPhone === '7816072522') {
      console.log('🧪 Test merchant account detected - skipping OTP');
      // Auto-verify with test OTP
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: '91' + trimmedPhone, otp: '111111' })
        });
        const data = await res.json();

        if (res.ok) {
          setToken(data.token);
          setStep('form');
          setMessage('');
          console.log('✅ Test account auto-verified');
        } else {
          setMessage(data.error || 'Test account verification failed');
        }
      } catch (error) {
        setMessage('Network error: ' + error.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      console.log('📱 Sending OTP to:', trimmedPhone);
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + trimmedPhone })
      });
      const data = await res.json();

      if (res.ok) {
        setStep('otp');
        setCooldown(true);
        setRemaining(60);
        if (data.otp) {
          console.log('🔐 TEST OTP:', data.otp);
        }
      } else {
        setMessage(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
      console.error('❌ Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    if (cooldown) return;
    
    const trimmedPhone = phone.trim();
    if (!trimmedPhone || trimmedPhone.length !== 10) {
      setMessage('Invalid phone number');
      return;
    }

    setResendLoading(true);
    setMessage('');
    try {
      console.log('📱 Resending OTP to:', trimmedPhone);
      const res = await fetch(`${API_URL}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + trimmedPhone })
      });
      const data = await res.json();
      if (res.ok) {
        setCooldown(true);
        setRemaining(60);
        if (data.otp) {
          console.log('🔐 TEST OTP (resend):', data.otp);
        }
      } else {
        setMessage(data.error || 'Failed to resend OTP');
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
      console.error('❌ Network error:', error);
    } finally {
      setResendLoading(false);
    }
  };

  const verifyOTP = async () => {
    const trimmedOTP = otp.trim();
    
    if (!trimmedOTP || trimmedOTP.length !== 6) {
      setMessage(`Enter valid 6-digit OTP (current: ${trimmedOTP.length} digits)`);
      return;
    }

    // Double-check OTP contains only digits
    if (!/^\d{6}$/.test(trimmedOTP)) {
      setMessage('OTP must contain only 6 digits');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      console.log('🔐 Verifying OTP for phone:', phone);
      const res = await fetch(`${API_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: '91' + phone, otp: trimmedOTP })
      });
      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        setStep('form');
        setMessage('');
        console.log('✅ OTP verified successfully');
      } else {
        setMessage(data.error || 'Invalid OTP');
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
      console.error('❌ Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_URL}/merchant/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setMessage('Application submitted successfully! Wait for admin approval.');
      } else {
        setMessage(data.error || 'Failed to submit application');
      }
    } catch (error) {
      setMessage('Network error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Phone Step
  if (step === 'phone') {
    return (
      <div style={{ padding: '20px', maxWidth: '500px', margin: '50px auto' }}>
        <h1>Merchant Registration</h1>
        <p>Enter your phone number to get started</p>

        <label>
          Mobile Number
          <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
            <input
              type="text"
              value="+91"
              disabled
              style={{ width: '60px', padding: '8px', backgroundColor: '#f5f5f5' }}
            />
            <input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter 10-digit number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onKeyPress={(e) => e.key === 'Enter' && sendOTP()}
              style={{ flex: 1, padding: '8px' }}
              autoFocus
            />
          </div>
        </label>

        {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

        <button
          onClick={sendOTP}
          disabled={loading || phone.length !== 10}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading || phone.length !== 10 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: loading || phone.length !== 10 ? 0.6 : 1
          }}
        >
          {loading ? 'Sending OTP...' : 'Send OTP'}
        </button>
      </div>
    );
  }

  // OTP Step
  if (step === 'otp') {
    return (
      <div style={{ padding: '20px', maxWidth: '500px', margin: '50px auto' }}>
        <h1>Verify OTP</h1>
        <p>Enter 6-digit code sent to +91{phone}</p>

        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          onKeyPress={(e) => e.key === 'Enter' && verifyOTP()}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '10px',
            fontSize: '24px',
            textAlign: 'center',
            letterSpacing: '8px',
            border: '2px solid #ddd',
            borderRadius: '5px'
          }}
          autoFocus
        />

        {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}

        <button
          onClick={verifyOTP}
          disabled={loading || otp.length !== 6}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading || otp.length !== 6 ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            opacity: loading || otp.length !== 6 ? 0.6 : 1
          }}
        >
          {loading ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          {!cooldown ? (
            <button
              onClick={resendOTP}
              disabled={resendLoading}
              style={{
                padding: '8px 16px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '5px',
                cursor: resendLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {resendLoading ? 'Resending...' : 'Resend OTP'}
            </button>
          ) : (
            <p style={{ color: '#666' }}>Resend in {remaining}s</p>
          )}
        </div>
      </div>
    );
  }

  // Form submitted
  if (submitted) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '50px auto' }}>
        <h2>Application Submitted!</h2>
        <p>Your merchant application has been submitted successfully.</p>
        <p>You will be notified once an admin reviews and approves your application.</p>
        <button onClick={() => window.location.href = '/home'}>Go to Home</button>
      </div>
    );
  }

  // Registration Form Step
  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '20px auto' }}>
      <h1>Merchant Registration</h1>
      <p>Fill out the form below to register your business</p>

      <form onSubmit={handleSubmit}>
        {/* SECTION 1: OWNER DETAILS */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
          <legend><strong>Section 1: Owner Details</strong></legend>
          
          <label>
            Owner Full Name *
            <input
              type="text"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0 15px 0' }}
            />
          </label>

          <label>
            Email ID (Optional)
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', margin: '5px 0 15px 0' }}
            />
          </label>

          <p style={{ fontSize: '12px', color: '#666' }}>
            Note: Your mobile number is already verified
          </p>
        </fieldset>

        {/* SECTION 2: BUSINESS DETAILS */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
          <legend><strong>Section 2: Business Details</strong></legend>
          
          <label>
            Business / Shop Name *
            <input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0 15px 0' }}
            />
          </label>

          <label>
            Business Category *
            <select
              name="businessCategory"
              value={formData.businessCategory}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0 15px 0' }}
            >
              <option value="">Select Category</option>
              <option value="Barber">Barber</option>
              <option value="Salon">Salon</option>
              <option value="Clinic">Clinic</option>
              <option value="Repair">Repair</option>
              <option value="Other">Other</option>
            </select>
          </label>

          <label>
            Business Description
            <textarea
              name="businessDescription"
              value={formData.businessDescription}
              onChange={handleChange}
              placeholder="Short description about your services"
              rows="3"
              style={{ width: '100%', padding: '8px', margin: '5px 0 15px 0' }}
            />
          </label>
        </fieldset>

        {/* SECTION 3: LOCATION DETAILS */}
        <fieldset style={{ border: '1px solid #ddd', padding: '15px', marginBottom: '20px' }}>
          <legend><strong>Section 3: Location Details</strong></legend>
          
          <label>
            Pincode *
            <input
              type="text"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
              maxLength="6"
              pattern="[0-9]{6}"
              style={{ width: '100%', padding: '8px', margin: '5px 0 15px 0' }}
            />
          </label>

          <label>
            Area / Locality Name *
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '8px', margin: '5px 0 15px 0' }}
            />
          </label>

          <label>
            Full Address (Street, Landmark) *
            <textarea
              name="fullAddress"
              value={formData.fullAddress}
              onChange={handleChange}
              required
              rows="3"
              style={{ width: '100%', padding: '8px', margin: '5px 0 15px 0' }}
            />
          </label>
        </fieldset>

        {message && <p style={{ color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

export default MerchantRegister;
