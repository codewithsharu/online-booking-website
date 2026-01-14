import React, { useState, useEffect, useRef } from 'react';
import './SimpleCaptcha.css';

const SimpleCaptcha = ({ onCaptchaChange, onVerified }) => {
  const [captcha, setCaptcha] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const canvasRef = useRef(null);

  // Generate random captcha
  const generateCaptcha = () => {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    let newCaptcha = '';
    for (let i = 0; i < 4; i++) {
      newCaptcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(newCaptcha);
    setUserInput('');
    onCaptchaChange('', newCaptcha);
    drawCaptcha(newCaptcha);
  };

  // Draw captcha on canvas with distortion
  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas with light background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Add noise lines
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.lineTo(Math.random() * width, Math.random() * height);
      ctx.stroke();
    }

    // Draw text with rotation and distortion
    ctx.font = 'bold 26px Arial';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333';

    for (let i = 0; i < text.length; i++) {
      ctx.save();
      
      // Position
      const x = 20 + i * 40;
      const y = height / 2;

      ctx.translate(x, y);
      
      // Random rotation
      ctx.rotate((Math.random() - 0.5) * 0.35);
      
      // Random color for each character
      const colors = ['#1a1a1a', '#4E71FF', '#333', '#555'];
      ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];

      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }

    // Add colored dots as noise
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(200, 200, 200, ${Math.random() * 0.5})`;
      ctx.fillRect(
        Math.random() * width,
        Math.random() * height,
        2,
        2
      );
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    
    // Check if captcha is correct (case-insensitive)
    if (value.toLowerCase() === captcha.toLowerCase()) {
      setIsVerified(true);
      if (onVerified) {
        onVerified(true);
      }
    }
    
    // Notify parent about validation status
    onCaptchaChange(value, captcha);
  };

  // Initialize captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  return (
    <div className="captcha-container">
      <label className="captcha-label">Verify you're human</label>
      
      {!isVerified ? (
        <>
          <div className="captcha-wrapper">
            <div className="captcha-box">
              <canvas
                ref={canvasRef}
                width={160}
                height={50}
                className="captcha-canvas"
              />
            </div>
            <button
              type="button"
              className="captcha-refresh-btn"
              onClick={generateCaptcha}
              title="Generate new captcha"
            >
              ↻
            </button>
          </div>

          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            placeholder="Enter text above"
            maxLength="4"
            className="captcha-input"
            autoComplete="off"
            autoCapitalize="none"
          />
        </>
      ) : (
        <div className="captcha-verified">
          <div className="checkmark-circle">
            <svg viewBox="0 0 52 52" className="checkmark">
              <circle className="checkmark-circle-anim" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <span className="verified-text">Verified </span>
        </div>
      )}
    </div>
  );
};

export default SimpleCaptcha;
