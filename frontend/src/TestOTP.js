import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function TestOTP() {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const lookupOTP = async () => {
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/test-otp/${cleaned}`);
      const data = await res.json();
      if (res.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Lookup failed');
      }
    } catch (e) {
      setError('Network error - is the server running?');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: "'Inter', -apple-system, sans-serif"
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: '28px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.4)'
          }}>🔐</div>
          <h1 style={{
            color: '#fff', fontSize: '24px', fontWeight: 700,
            margin: '0 0 4px', letterSpacing: '-0.5px'
          }}>OTP Test Console</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Look up active OTPs by mobile number
          </p>
        </div>

        {/* Search Card */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          {/* Input */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <div style={{
              position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
              color: '#64748b', fontSize: '16px', pointerEvents: 'none'
            }}>+91</div>
            <input
              type="tel"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onKeyDown={(e) => e.key === 'Enter' && lookupOTP()}
              placeholder="Enter mobile number"
              style={{
                width: '100%',
                padding: '14px 14px 14px 52px',
                borderRadius: '14px',
                border: '2px solid rgba(255,255,255,0.1)',
                background: 'rgba(0,0,0,0.3)',
                color: '#fff',
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '2px',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#6366f1'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {/* Button */}
          <button
            onClick={lookupOTP}
            disabled={loading || phone.length < 10}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: phone.length === 10
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'rgba(255,255,255,0.1)',
              color: phone.length === 10 ? '#fff' : '#64748b',
              fontSize: '15px',
              fontWeight: 600,
              cursor: phone.length === 10 ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: phone.length === 10 ? '0 4px 20px rgba(99,102,241,0.4)' : 'none'
            }}
          >
            {loading ? (
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff',
                animation: 'spin 0.6s linear infinite'
              }}></div>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                Lookup OTP
              </>
            )}
          </button>

          {/* Error */}
          {error && (
            <div style={{
              marginTop: '16px', padding: '12px 16px',
              borderRadius: '12px',
              background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              color: '#fca5a5', fontSize: '13px', fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div style={{ marginTop: '20px' }}>
              {result.found ? (
                <div style={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {/* OTP Display */}
                  <div style={{
                    background: result.isExpired
                      ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(239,68,68,0.1))'
                      : 'linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.1))',
                    padding: '24px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      color: '#94a3b8', fontSize: '11px', fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px'
                    }}>
                      {result.isExpired ? '⏰ Expired OTP' : '✅ Active OTP'}
                    </div>
                    <div style={{
                      fontSize: '48px',
                      fontWeight: 800,
                      letterSpacing: '12px',
                      color: result.isExpired ? '#f87171' : '#4ade80',
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      textShadow: result.isExpired
                        ? '0 0 30px rgba(248,113,113,0.4)'
                        : '0 0 30px rgba(74,222,128,0.4)',
                      textDecoration: result.isExpired ? 'line-through' : 'none'
                    }}>
                      {result.otp}
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Phone */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Phone</span>
                        <span style={{ color: '#e2e8f0', fontSize: '14px', fontWeight: 600, fontFamily: 'monospace' }}>
                          +91 {result.phone}
                        </span>
                      </div>

                      {/* Timer */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Time Left</span>
                        <span style={{
                          fontSize: '14px', fontWeight: 700, fontFamily: 'monospace',
                          color: result.isExpired ? '#f87171' : result.remainingSeconds < 60 ? '#fbbf24' : '#4ade80',
                          padding: '2px 10px', borderRadius: '6px',
                          background: result.isExpired ? 'rgba(248,113,113,0.15)' : result.remainingSeconds < 60 ? 'rgba(251,191,36,0.15)' : 'rgba(74,222,128,0.15)'
                        }}>
                          {result.isExpired ? 'Expired' : formatTime(result.remainingSeconds)}
                        </span>
                      </div>

                      {/* Attempts */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Attempts</span>
                        <span style={{
                          color: result.attempts > 3 ? '#f87171' : '#e2e8f0',
                          fontSize: '14px', fontWeight: 600
                        }}>
                          {result.attempts} / 5
                        </span>
                      </div>

                      {/* Created */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>Created</span>
                        <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                          {formatDate(result.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  padding: '24px', textAlign: 'center',
                  borderRadius: '16px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>🤷</div>
                  <div style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
                    No OTP found for +91 {result.phone}
                  </div>
                  <div style={{ color: '#475569', fontSize: '12px', marginTop: '4px' }}>
                    OTP may have expired or been used
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', color: '#475569', fontSize: '11px',
          marginTop: '24px'
        }}>
          ⚡ Development tool — OTPs auto-expire after 10 minutes
        </p>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: #475569;
          letter-spacing: 0px;
          font-weight: 400;
        }
      `}</style>
    </div>
  );
}

export default TestOTP;
