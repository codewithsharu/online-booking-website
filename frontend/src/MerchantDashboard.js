import React, { useState, useEffect } from 'react';
import MerchantServices from './MerchantServices';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function MerchantDashboard() {
  const [loading, setLoading] = useState(true);
  const [merchantData, setMerchantData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    shopCategory: '',
    shopImage: '',
    pincode: '',
    shopAddress: '',
    city: '',
    state: '',
    openingTime: '',
    closingTime: '',
    slotDuration: '',
    services: []
  });
  const [imageFile, setImageFile] = useState(null);
  const [newService, setNewService] = useState('');

  useEffect(() => {
    fetchMerchantData();
  }, []);

  const fetchMerchantData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let role = null;
      try {
        role = token ? JSON.parse(atob(token.split('.')[1])).role : null;
      } catch (e) {
        console.warn('❌ Failed to decode token role');
      }
      
      // Verify user is logged in and is a merchant
      if (!token || role !== 'merchant') {
        console.log('❌ Not authorized to access merchant dashboard');
        window.location.href = '/login';
        return;
      }
      
      // Fetch merchant status
      const statusResponse = await fetch(`${API_URL}/merchant/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // If unauthorized, clear and redirect
      if (statusResponse.status === 401 || statusResponse.status === 403) {
        console.log('❌ Session expired or unauthorized');
        localStorage.clear();
        window.location.href = '/login';
        return;
      }
      
      const statusData = await statusResponse.json();
      setMerchantData(statusData);

      // If approved, fetch profile
      const isApproved = statusData.status === 'approved';
      if (isApproved) {
        const profileResponse = await fetch(`${API_URL}/merchant/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const profile = await profileResponse.json();
        const info = profile?.details || {};
        setProfileData(info);
        
        // Populate form with existing data
        setFormData({
          shopName: info.shopName || '',
          shopCategory: info.shopCategory || '',
          shopImage: (info.images && info.images[0]) || '',
          pincode: info.pincode || '',
          shopAddress: info.shopAddress || '',
          city: info.location?.city || '',
          state: info.location?.state || '',
          openingTime: info.workingHours?.openingTime || '',
          closingTime: info.workingHours?.closingTime || '',
          slotDuration: info.slotDuration || '',
          services: (info.services || []).map(s => s.name || s)
        });
      }
    } catch (error) {
      console.error('Error fetching merchant data:', error);
      alert('Failed to load merchant data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleAddService = () => {
    if (newService.trim()) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService('');
    }
  };

  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      let updatedFormData = { ...formData };

      // Upload image to Cloudinary if a new file is selected
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);

        const uploadResponse = await fetch(`${API_URL}/merchant/upload-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: imageFormData
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload image');
        }

        const uploadData = await uploadResponse.json();
        updatedFormData.shopImage = uploadData.imageUrl;
      }

      // Save profile
      const response = await fetch(`${API_URL}/merchant/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      alert('Profile saved successfully!');
      setIsEditing(false);
      setImageFile(null);
      fetchMerchantData();
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile: ' + error.message);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImageFile(null);
    // Reset form to current profile data
    if (profileData) {
      setFormData({
        shopName: profileData.shopName || '',
        shopCategory: profileData.shopCategory || '',
        shopImage: (profileData.images && profileData.images[0]) || '',
        pincode: profileData.pincode || '',
        shopAddress: profileData.shopAddress || '',
        city: profileData.location?.city || '',
        state: profileData.location?.state || '',
        openingTime: profileData.workingHours?.openingTime || '',
        closingTime: profileData.workingHours?.closingTime || '',
        slotDuration: profileData.slotDuration || '',
        services: (profileData.services || []).map(s => s.name || s)
      });
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Merchant Dashboard</h1>
        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {!merchantData || !merchantData.hasApplication ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          border: '2px solid #ffc107'
        }}>
          <h2>📋 No Application Found</h2>
          <p>Please submit a merchant application to get started.</p>
          <a href="/merchant-register" style={{ 
            display: 'inline-block',
            marginTop: '20px',
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}>Apply as Merchant</a>
        </div>
      ) : merchantData.status === 'pending' ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#fff3cd', 
          borderRadius: '8px',
          border: '2px solid #ffc107'
        }}>
          <h2>⏳ Application Under Review</h2>
          <p><strong>Status:</strong> <span style={{ color: '#ff9800' }}>PENDING</span></p>
          <p>Your merchant application is being reviewed by our admin team.</p>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>Applied on: {new Date(merchantData.application.appliedAt).toLocaleString()}</p>
          <div style={{ 
            marginTop: '30px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
            textAlign: 'left'
          }}>
            <h3>Application Details:</h3>
            <p><strong>Shop Name:</strong> {merchantData.application.shopName}</p>
            <p><strong>Owner Name:</strong> {merchantData.application.ownerName}</p>
            <p><strong>Pincode:</strong> {merchantData.application.pincode}</p>
            <p><strong>Shop Address:</strong> {merchantData.application.shopAddress}</p>
          </div>
        </div>
      ) : merchantData.status === 'rejected' ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f8d7da', 
          borderRadius: '8px',
          border: '2px solid #dc3545'
        }}>
          <h2>❌ Application Rejected</h2>
          <p><strong>Status:</strong> <span style={{ color: '#dc3545' }}>REJECTED</span></p>
          <p>Unfortunately, your merchant application was not approved.</p>
          {merchantData.application.rejectionReason && (
            <p style={{ marginTop: '15px', fontWeight: 'bold' }}>
              Reason: {merchantData.application.rejectionReason}
            </p>
          )}
          <p style={{ fontSize: '14px', color: '#666', marginTop: '20px' }}>Rejected on: {new Date(merchantData.application.rejectedAt).toLocaleString()}</p>
        </div>
      ) : (
        <div>
          <div style={{ 
            marginBottom: '20px', 
            padding: '20px', 
            backgroundColor: '#d4edda', 
            borderRadius: '8px',
            border: '2px solid #28a745'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ Approved Merchant</h3>
                <p style={{ margin: '5px 0' }}><strong>Status:</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>APPROVED</span></p>
                <p style={{ margin: '5px 0' }}><strong>Merchant ID:</strong> {merchantData.merchantId}</p>
                <p style={{ margin: '5px 0' }}><strong>Shop Name:</strong> {merchantData.application.shopName}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
                <p>Applied: {new Date(merchantData.application.appliedAt).toLocaleDateString()}</p>
                {merchantData.application.approvedAt && (
                  <p>Approved: {new Date(merchantData.application.approvedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Profile View</h2>
                <button 
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Edit Profile
                </button>
              </div>

              <div style={{ 
                border: '1px solid #dee2e6', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: 'white'
              }}>
                {profileData?.shopImage && (
                  <div style={{ marginBottom: '20px' }}>
                    <img 
                      src={profileData.shopImage} 
                      alt="Shop" 
                      style={{ 
                        maxWidth: '300px', 
                        maxHeight: '300px', 
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }} 
                    />
                  </div>
                )}

                <div style={{ display: 'grid', gap: '15px' }}>
                  <div>
                    <strong>Shop Name:</strong> {profileData?.shopName || 'Not set'}
                  </div>
                  <div>
                    <strong>Category:</strong> {profileData?.shopCategory || 'Not set'}
                  </div>
                  <div>
                    <strong>Location:</strong> {profileData?.location?.city || 'Not set'}, State: {profileData?.location?.state || 'Not set'}, Pincode: {profileData?.pincode || 'Not set'}
                  </div>
                  <div>
                    <strong>Shop Address:</strong> {profileData?.shopAddress || 'Not set'}
                  </div>
                  <div>
                    <strong>Working Hours:</strong> {profileData?.workingHours?.openingTime || 'Not set'} - {profileData?.workingHours?.closingTime || 'Not set'}
                  </div>
                  <div>
                    <strong>Slot Duration:</strong> {profileData?.slotDuration ? `${profileData.slotDuration} minutes` : 'Not set'}
                  </div>
                  <div>
                    <strong>Services:</strong>
                    {profileData?.services && profileData.services.length > 0 ? (
                      <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                        {profileData.services.map((service, index) => (
                          <li key={index}>{service.name || service}</li>
                        ))}
                      </ul>
                    ) : (
                      <span> No services added</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 style={{ marginBottom: '20px' }}>Edit Profile</h2>
              
              <div style={{ 
                border: '1px solid #dee2e6', 
                borderRadius: '8px', 
                padding: '20px',
                backgroundColor: 'white'
              }}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Shop Name:
                  </label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Shop Category:
                  </label>
                  <select
                    name="shopCategory"
                    value={formData.shopCategory}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Category</option>
                    <option value="Barber">Barber</option>
                    <option value="Salon">Salon</option>
                    <option value="Hospital">Hospital</option>
                    <option value="Gym">Gym</option>
                    <option value="Clinic">Clinic</option>
                    <option value="Spa">Spa</option>
                    <option value="Dental">Dental</option>
                    <option value="Physiotherapy">Physiotherapy</option>
                    <option value="Repair">Repair</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Photography">Photography</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Shop Image:
                  </label>
                  {formData.shopImage && !imageFile && (
                    <div style={{ marginBottom: '10px' }}>
                      <img 
                        src={formData.shopImage} 
                        alt="Current shop" 
                        style={{ 
                          maxWidth: '200px', 
                          maxHeight: '200px', 
                          borderRadius: '8px',
                          objectFit: 'cover'
                        }} 
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                  {imageFile && (
                    <p style={{ marginTop: '5px', fontSize: '12px', color: '#6c757d' }}>
                      New image selected: {imageFile.name}
                    </p>
                  )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Pincode:
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    maxLength="6"
                    pattern="[0-9]{6}"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Shop Address:
                  </label>
                  <textarea
                    name="shopAddress"
                    value={formData.shopAddress}
                    onChange={handleInputChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  ></textarea>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    City:
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    State:
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Opening Time:
                  </label>
                  <input
                    type="time"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Closing Time:
                  </label>
                  <input
                    type="time"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Slot Duration:
                  </label>
                  <select
                    name="slotDuration"
                    value={formData.slotDuration}
                    onChange={handleInputChange}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Duration</option>
                    <option value="10">10 minutes</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Services:
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="text"
                      value={newService}
                      onChange={(e) => setNewService(e.target.value)}
                      placeholder="Enter service name"
                      style={{
                        flex: 1,
                        padding: '8px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddService}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {formData.services.length > 0 && (
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {formData.services.map((service, index) => (
                        <li 
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px',
                            marginBottom: '5px',
                            backgroundColor: '#f8f9fa',
                            borderRadius: '4px',
                            border: '1px solid #dee2e6'
                          }}
                        >
                          <span>{service}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(index)}
                            style={{
                              padding: '4px 12px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button
                    onClick={handleSave}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#6c757d',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Service Publishing Section */}
          <MerchantServices />
        </div>
      )}
    </div>
  );
}

export default MerchantDashboard;
