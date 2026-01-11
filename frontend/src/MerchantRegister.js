import React, { useState } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function MerchantRegister() {
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
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
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
