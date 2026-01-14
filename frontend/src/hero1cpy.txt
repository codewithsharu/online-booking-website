import React from 'react';
import { useNavigate } from 'react-router-dom';
import smartwaitLogo from './smartwait-logo.png';

function Hero() {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        .hero-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: linear-gradient(135deg, #4E71FF 0%, #4E71FF 100%);
        }

        .hero-container {
          width: 100%;
          max-width: 980px;
          background: white;
          border-radius: 20px;
          box-shadow: 0 24px 60px rgba(0,0,0,0.18);
          overflow: hidden;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
        }

        .hero-left {
          padding: 40px 40px 32px 40px;
          background: linear-gradient(180deg, rgba(78,113,255,0.06) 0%, transparent 100%);
          border-right: 1px solid rgba(78,113,255,0.08);
        }

        .hero-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }

        .hero-logo {
          height: 70px;
          width: auto;
        }

        .hero-title {
          font-size: 34px;
          font-weight: 700;
          color: #1a202c;
          line-height: 1.2;
          margin: 16px 0 12px 0;
          letter-spacing: -0.5px;
        }

        .hero-subtitle {
          font-size: 16px;
          color: #4a5568;
          line-height: 1.7;
          margin-bottom: 26px;
        }

        .hero-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-primary {
          background: linear-gradient(135deg, #4E71FF 0%, #4E71FF 100%);
          color: #fff;
          border: none;
          padding: 12px 18px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(78,113,255,0.35);
        }

        .btn-secondary {
          background: #f7fafc;
          color: #2d3748;
          border: 2px solid #e2e8f0;
          padding: 12px 18px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
        }

        .hero-right {
          padding: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(1200px 600px at 80% -100%, rgba(78,113,255,0.15) 0%, transparent 60%);
        }

        .stats-card {
          width: 100%;
          max-width: 360px;
          background: rgba(78,113,255,0.06);
          border: 1px solid rgba(78,113,255,0.15);
          border-radius: 16px;
          padding: 18px;
        }

        .stats-title {
          font-size: 14px;
          color: #2d3748;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-radius: 10px;
          background: #fff;
          border: 1px solid #edf2f7;
          margin-bottom: 10px;
        }

        .stat-label {
          color: #4a5568;
          font-size: 13px;
        }

        .stat-value {
          color: #4E71FF;
          font-weight: 700;
        }

        .powered {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 10px;
          color: #a0a8b8;
          font-size: 11px;
        }

        .powered strong {
          background: linear-gradient(135deg, #4E71FF 0%, #7B68FF 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @media (max-width: 900px) {
          .hero-container { grid-template-columns: 1fr; }
          .hero-left { border-right: none; border-bottom: 1px solid rgba(78,113,255,0.08); }
        }
      `}</style>

      <div className="hero-wrapper">
        <div className="hero-container">
          <div className="hero-left">
            <div className="hero-brand">
              <img src={smartwaitLogo} alt="WaitSmart" className="hero-logo" />
            </div>
            <h1 className="hero-title">Simplify Appointments with WaitSmart</h1>
            <p className="hero-subtitle">Fast OTP login, secure merchant onboarding, and a modern, mobile-first booking experience. Start now or explore merchants near you.</p>
            <div className="hero-ctas">
              <button className="btn-primary" onClick={() => navigate('/login')}>Login / Signup</button>
              <button className="btn-secondary" onClick={() => navigate('/search')}>Search Merchants</button>
            </div>
            <div className="powered">
              <span>powered by</span>
              <strong>SMSHUB</strong>
            </div>
          </div>

          <div className="hero-right">
            <div className="stats-card">
              <div className="stats-title">Trusted & Secure</div>
              <div className="stats-row">
                <span className="stat-label">Instant OTP Verification</span>
                <span className="stat-value">4-digit</span>
              </div>
              <div className="stats-row">
                <span className="stat-label">Merchant Onboarding</span>
                <span className="stat-value">Minutes</span>
              </div>
              <div className="stats-row">
                <span className="stat-label">Data Security</span>
                <span className="stat-value">AES-256</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Hero;
