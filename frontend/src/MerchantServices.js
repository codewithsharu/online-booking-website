import React, { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CATEGORIES = [
  'Barber', 'Salon', 'Hospital', 'Gym', 'Clinic', 'Spa',
  'Dental', 'Physiotherapy', 'Repair', 'Tutor', 'Photography', 'Consulting'
];

const CATEGORY_ICONS = {
  Barber: '💈', Salon: '💇', Hospital: '🏥', Gym: '🏋️',
  Clinic: '🩺', Spa: '🧖', Dental: '🦷', Physiotherapy: '🏃',
  Repair: '🔧', Tutor: '📚', Photography: '📷', Consulting: '💼'
};

function MerchantServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [merchantProfile, setMerchantProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    serviceName: '',
    description: '',
    category: '',
    price: '',
    duration: '30',
    slotDuration: '30',
    maxBookingsPerSlot: '1',
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    timeSlots: [{ startTime: '09:00', endTime: '18:00' }]
  });

  const token = localStorage.getItem('token');

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/merchant/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setServices(data.services || []);
      }
    } catch (err) {
      console.error('Error fetching services:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/merchant/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.details) {
        setMerchantProfile(data.details);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchServices();
    fetchProfile();
  }, [fetchServices, fetchProfile]);

  const resetForm = () => {
    setFormData({
      serviceName: '',
      description: '',
      category: '',
      price: '',
      duration: '30',
      slotDuration: '30',
      maxBookingsPerSlot: '1',
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: [{ startTime: '09:00', endTime: '18:00' }]
    });
    setEditingService(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
    setMessage({ text: '', type: '' });
  };

  const openEditForm = (service) => {
    setFormData({
      serviceName: service.serviceName,
      description: service.description || '',
      category: service.category,
      price: service.price?.toString() || '',
      duration: service.duration?.toString() || '30',
      slotDuration: service.slotDuration?.toString() || '30',
      maxBookingsPerSlot: service.maxBookingsPerSlot?.toString() || '1',
      availableDays: service.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      timeSlots: service.timeSlots?.length > 0 ? service.timeSlots : [{ startTime: '09:00', endTime: '18:00' }]
    });
    setEditingService(service);
    setShowForm(true);
    setMessage({ text: '', type: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleTimeSlotChange = (index, field, value) => {
    const updated = [...formData.timeSlots];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(prev => ({ ...prev, timeSlots: updated }));
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      timeSlots: [...prev.timeSlots, { startTime: '09:00', endTime: '18:00' }]
    }));
  };

  const removeTimeSlot = (index) => {
    if (formData.timeSlots.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      timeSlots: prev.timeSlots.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.serviceName.trim() || !formData.category) {
      setMessage({ text: 'Service name and category are required', type: 'error' });
      return;
    }

    if (formData.availableDays.length === 0) {
      setMessage({ text: 'Select at least one available day', type: 'error' });
      return;
    }

    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        serviceName: formData.serviceName.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        duration: parseInt(formData.duration) || 30,
        slotDuration: parseInt(formData.slotDuration) || 30,
        maxBookingsPerSlot: parseInt(formData.maxBookingsPerSlot) || 1,
        availableDays: formData.availableDays,
        timeSlots: formData.timeSlots
      };

      let url = `${API_URL}/merchant/services`;
      let method = 'POST';

      if (editingService) {
        url = `${API_URL}/merchant/services/${editingService._id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({
          text: editingService ? 'Service updated successfully!' : 'Service published successfully!',
          type: 'success'
        });
        setShowForm(false);
        resetForm();
        fetchServices();
      } else {
        setMessage({ text: data.error || 'Failed to save service', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const toggleService = async (serviceId) => {
    try {
      const res = await fetch(`${API_URL}/merchant/services/${serviceId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: 'success' });
        fetchServices();
      } else {
        setMessage({ text: data.error || 'Failed to toggle service', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    }
  };

  const deleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) return;

    try {
      const res = await fetch(`${API_URL}/merchant/services/${serviceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Service deleted successfully', type: 'success' });
        fetchServices();
      } else {
        setMessage({ text: data.error || 'Failed to delete service', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '30px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', flexWrap: 'wrap', gap: '10px'
      }}>
        <div>
          <h2 style={{ margin: '0 0 5px 0' }}>📋 My Services</h2>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            Publish and manage your service listings
          </p>
        </div>
        <button
          onClick={openCreateForm}
          style={{
            padding: '12px 24px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '15px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          ➕ Publish New Service
        </button>
      </div>

      {/* Auto-fetched profile info */}
      {merchantProfile && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#e8f4fd',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #bee5eb',
          fontSize: '14px'
        }}>
          <strong>📍 Your Profile:</strong> {merchantProfile.shopName} | Pincode: <strong>{merchantProfile.pincode}</strong>
          {merchantProfile.location?.city && <> | City: <strong>{merchantProfile.location.city}</strong></>}
          {merchantProfile.location?.state && <>, {merchantProfile.location.state}</>}
        </div>
      )}

      {/* Message */}
      {message.text && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '15px',
          borderRadius: '8px',
          backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
          color: message.type === 'success' ? '#155724' : '#721c24',
          border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message.text}
        </div>
      )}

      {/* Publish/Edit Form */}
      {showForm && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fff',
          border: '2px solid #007bff',
          borderRadius: '10px',
          marginBottom: '25px'
        }}>
          <h3 style={{ marginTop: 0 }}>
            {editingService ? '✏️ Edit Service' : '📢 Publish New Service'}
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Service Name */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Service Name *
              </label>
              <input
                type="text"
                name="serviceName"
                value={formData.serviceName}
                onChange={handleInputChange}
                placeholder="e.g., Haircut, Full Body Checkup, Personal Training"
                required
                style={inputStyle}
              />
            </div>

            {/* Category */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Category *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                gap: '8px'
              }}>
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                    style={{
                      padding: '10px 12px',
                      border: `2px solid ${formData.category === cat ? '#007bff' : '#dee2e6'}`,
                      borderRadius: '8px',
                      backgroundColor: formData.category === cat ? '#e7f1ff' : '#fff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: formData.category === cat ? 'bold' : 'normal',
                      textAlign: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    {CATEGORY_ICONS[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your service in detail..."
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>

            {/* Price & Duration row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Duration (mins)
                </label>
                <select name="duration" value={formData.duration} onChange={handleInputChange} style={inputStyle}>
                  <option value="10">10 min</option>
                  <option value="15">15 min</option>
                  <option value="20">20 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                  Slot Duration
                </label>
                <select name="slotDuration" value={formData.slotDuration} onChange={handleInputChange} style={inputStyle}>
                  <option value="10">10 min</option>
                  <option value="15">15 min</option>
                  <option value="20">20 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </div>
            </div>

            {/* Max bookings per slot */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>
                Max Bookings Per Slot
              </label>
              <input
                type="number"
                name="maxBookingsPerSlot"
                value={formData.maxBookingsPerSlot}
                onChange={handleInputChange}
                min="1"
                max="50"
                style={{ ...inputStyle, maxWidth: '120px' }}
              />
            </div>

            {/* Available Days */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                Available Days *
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {ALL_DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(day)}
                    style={{
                      padding: '8px 14px',
                      border: `2px solid ${formData.availableDays.includes(day) ? '#28a745' : '#dee2e6'}`,
                      borderRadius: '20px',
                      backgroundColor: formData.availableDays.includes(day) ? '#d4edda' : '#fff',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: formData.availableDays.includes(day) ? 'bold' : 'normal',
                      color: formData.availableDays.includes(day) ? '#155724' : '#666'
                    }}
                  >
                    {formData.availableDays.includes(day) ? '✓ ' : ''}{day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>
                Operating Hours
              </label>
              {formData.timeSlots.map((slot, index) => (
                <div key={index} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '8px', flexWrap: 'wrap'
                }}>
                  <span style={{ fontSize: '13px', color: '#666', minWidth: '40px' }}>From</span>
                  <input
                    type="time"
                    value={slot.startTime}
                    onChange={(e) => handleTimeSlotChange(index, 'startTime', e.target.value)}
                    style={{ ...inputStyle, maxWidth: '150px' }}
                  />
                  <span style={{ fontSize: '13px', color: '#666' }}>To</span>
                  <input
                    type="time"
                    value={slot.endTime}
                    onChange={(e) => handleTimeSlotChange(index, 'endTime', e.target.value)}
                    style={{ ...inputStyle, maxWidth: '150px' }}
                  />
                  {formData.timeSlots.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addTimeSlot}
                style={{
                  padding: '6px 14px',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                + Add Time Slot
              </button>
            </div>

            {/* Auto-fetched info */}
            {merchantProfile && (
              <div style={{
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                marginBottom: '15px',
                fontSize: '13px'
              }}>
                <strong>Auto-filled from your profile:</strong>
                <div style={{ marginTop: '5px', color: '#555' }}>
                  📍 Pincode: <strong>{merchantProfile.pincode}</strong> | 
                  🏪 Shop: <strong>{merchantProfile.shopName}</strong> |
                  📫 Address: {merchantProfile.shopAddress}
                </div>
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: saving ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {saving ? 'Saving...' : (editingService ? '💾 Update Service' : '📢 Publish Service')}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                style={{
                  padding: '14px 24px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      {services.length === 0 && !showForm ? (
        <div style={{
          padding: '40px', textAlign: 'center',
          backgroundColor: '#f8f9fa', borderRadius: '10px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '15px' }}>📋</div>
          <h3 style={{ color: '#495057' }}>No Services Published Yet</h3>
          <p style={{ color: '#6c757d', marginBottom: '20px' }}>
            Start by publishing your first service to attract customers
          </p>
          <button
            onClick={openCreateForm}
            style={{
              padding: '12px 24px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: 'bold'
            }}
          >
            ➕ Publish Your First Service
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {services.map(service => (
            <div
              key={service._id}
              style={{
                padding: '16px 20px',
                backgroundColor: service.isPublished ? '#fff' : '#f8f9fa',
                border: `2px solid ${service.isPublished ? '#28a745' : '#ffc107'}`,
                borderRadius: '10px',
                opacity: service.isPublished ? 1 : 0.8
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{CATEGORY_ICONS[service.category] || '📋'}</span>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '18px' }}>{service.serviceName}</h3>
                      <span style={{
                        fontSize: '12px',
                        padding: '2px 8px',
                        backgroundColor: service.isPublished ? '#d4edda' : '#fff3cd',
                        color: service.isPublished ? '#155724' : '#856404',
                        borderRadius: '12px',
                        fontWeight: 'bold'
                      }}>
                        {service.isPublished ? '● Live' : '● Stopped'}
                      </span>
                    </div>
                  </div>

                  {service.description && (
                    <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>{service.description}</p>
                  )}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', marginTop: '8px', fontSize: '13px', color: '#555' }}>
                    <span>🏷️ {service.category}</span>
                    <span>💰 ₹{service.price || 'Free'}</span>
                    <span>⏱️ {service.duration} min</span>
                    <span>📍 {service.pincode}</span>
                  </div>

                  <div style={{ marginTop: '8px', fontSize: '13px', color: '#666' }}>
                    📅 {service.availableDays?.map(d => d.slice(0, 3)).join(', ')}
                    {service.timeSlots?.length > 0 && (
                      <span> | 🕐 {service.timeSlots.map(ts =>
                        `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)}`
                      ).join(', ')}</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => toggleService(service._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: service.isPublished ? '#ffc107' : '#28a745',
                      color: service.isPublished ? '#000' : '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: 'bold'
                    }}
                  >
                    {service.isPublished ? '⏸ Stop' : '▶ Resume'}
                  </button>
                  <button
                    onClick={() => openEditForm(service)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => deleteService(service._id)}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = {
  width: '100%',
  padding: '10px',
  border: '1px solid #ced4da',
  borderRadius: '6px',
  fontSize: '14px',
  boxSizing: 'border-box'
};

export default MerchantServices;
