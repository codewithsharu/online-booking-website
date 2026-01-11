import React, { useState, useEffect } from 'react';

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
    area: '',
    fullAddress: '',
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
      
      // Fetch merchant status
      const statusResponse = await fetch(`${API_URL}/merchant/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const statusData = await statusResponse.json();
      setMerchantData(statusData);

      // If approved, fetch profile
      if (statusData.approved) {
        const profileResponse = await fetch(`${API_URL}/merchant/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const profile = await profileResponse.json();
        setProfileData(profile);
        
        // Populate form with existing data
        if (profile) {
          setFormData({
            shopName: profile.shopName || '',
            shopCategory: profile.shopCategory || '',
            shopImage: profile.shopImage || '',
            pincode: profile.pincode || '',
            area: profile.area || '',
            fullAddress: profile.fullAddress || '',
            openingTime: profile.openingTime || '',
            closingTime: profile.closingTime || '',
            slotDuration: profile.slotDuration || '',
            services: profile.services || []
          });
        }
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
        shopImage: profileData.shopImage || '',
        pincode: profileData.pincode || '',
        area: profileData.area || '',
        fullAddress: profileData.fullAddress || '',
        openingTime: profileData.openingTime || '',
        closingTime: profileData.closingTime || '',
        slotDuration: profileData.slotDuration || '',
        services: profileData.services || []
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

      {!merchantData || !merchantData.approved ? (
        <div style={{ 
          padding: '40px', 
          textAlign: 'center', 
          backgroundColor: '#f8f9fa', 
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <h2>Please complete merchant application first</h2>
          <p>Your merchant account is pending approval or not yet registered.</p>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '8px' }}>
            <p><strong>Merchant ID:</strong> {merchantData.merchantId}</p>
            <p><strong>Business Name:</strong> {profileData?.shopName || 'Not set'}</p>
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
                    <strong>Location:</strong> {profileData?.area || 'Not set'}, Pincode: {profileData?.pincode || 'Not set'}
                  </div>
                  <div>
                    <strong>Full Address:</strong> {profileData?.fullAddress || 'Not set'}
                  </div>
                  <div>
                    <strong>Working Hours:</strong> {profileData?.openingTime || 'Not set'} - {profileData?.closingTime || 'Not set'}
                  </div>
                  <div>
                    <strong>Slot Duration:</strong> {profileData?.slotDuration ? `${profileData.slotDuration} minutes` : 'Not set'}
                  </div>
                  <div>
                    <strong>Services:</strong>
                    {profileData?.services && profileData.services.length > 0 ? (
                      <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
                        {profileData.services.map((service, index) => (
                          <li key={index}>{service}</li>
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
                    <option value="Clinic">Clinic</option>
                    <option value="Repair">Repair</option>
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
                    Area:
                  </label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
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
                    Full Address:
                  </label>
                  <textarea
                    name="fullAddress"
                    value={formData.fullAddress}
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
        </div>
      )}
    </div>
  );
}

export default MerchantDashboard;
