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
      <div className="min-h-screen bg-gradient-to-b from-blue-600 to-white flex items-center justify-center pt-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-500 mt-4 text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-24">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Merchant Dashboard</h1>
              <p className="text-blue-200 mt-1">Manage your shop and services</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-xl font-medium transition-colors text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-8">
      {!merchantData || !merchantData.hasApplication ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-20 h-20 mx-auto bg-yellow-50 rounded-full flex items-center justify-center mb-4 text-4xl">📋</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No Application Found</h2>
          <p className="text-gray-500 mb-6">Please submit a merchant application to get started.</p>
          <a href="/merchant-register" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
            Apply as Merchant
          </a>
        </div>
      ) : merchantData.status === 'pending' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-yellow-200 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 text-center border-b border-yellow-200">
            <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-3xl">⏳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Application Under Review</h2>
            <span className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold border border-yellow-200">PENDING</span>
            <p className="text-gray-500 mt-3">Your merchant application is being reviewed by our admin team.</p>
            <p className="text-sm text-gray-400 mt-2">Applied on: {new Date(merchantData.application.appliedAt).toLocaleString()}</p>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Shop Name</p>
                <p className="font-medium text-gray-800">{merchantData.application.shopName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Owner Name</p>
                <p className="font-medium text-gray-800">{merchantData.application.ownerName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Pincode</p>
                <p className="font-medium text-gray-800">{merchantData.application.pincode}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Shop Address</p>
                <p className="font-medium text-gray-800">{merchantData.application.shopAddress}</p>
              </div>
            </div>
          </div>
        </div>
      ) : merchantData.status === 'rejected' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-10 text-center">
          <div className="w-16 h-16 mx-auto bg-red-50 rounded-full flex items-center justify-center mb-4 text-3xl">❌</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Application Rejected</h2>
          <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold border border-red-200">REJECTED</span>
          <p className="text-gray-500 mt-3">Unfortunately, your merchant application was not approved.</p>
          {merchantData.application.rejectionReason && (
            <p className="mt-4 font-semibold text-gray-700">Reason: {merchantData.application.rejectionReason}</p>
          )}
          <p className="text-sm text-gray-400 mt-3">Rejected on: {new Date(merchantData.application.rejectedAt).toLocaleString()}</p>
        </div>
      ) : (
        <div>
          {/* Approved Status Banner */}
          <div className="bg-white rounded-2xl shadow-sm border border-green-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">✅</div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Approved Merchant</h3>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full font-semibold border border-green-200">APPROVED</span>
                    <span className="text-gray-500">ID: <span className="font-mono text-blue-600">{merchantData.merchantId}</span></span>
                    <span className="text-gray-500">{merchantData.application.shopName}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-400 text-right">
                <p>Applied: {new Date(merchantData.application.appliedAt).toLocaleDateString()}</p>
                {merchantData.application.approvedAt && (
                  <p>Approved: {new Date(merchantData.application.approvedAt).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Shop Profile</h2>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {profileData?.shopImage && (
                  <div className="relative h-48 bg-gray-100">
                    <img src={profileData.shopImage} alt="Shop" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Shop Name</p>
                    <p className="text-gray-800 font-medium">{profileData?.shopName || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Category</p>
                    <p className="text-gray-800 font-medium">{profileData?.shopCategory || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Location</p>
                    <p className="text-gray-800 font-medium">{profileData?.location?.city || 'Not set'}, {profileData?.location?.state || 'N/A'} - {profileData?.pincode || ''}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Working Hours</p>
                    <p className="text-gray-800 font-medium">{profileData?.workingHours?.openingTime || 'Not set'} - {profileData?.workingHours?.closingTime || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Slot Duration</p>
                    <p className="text-gray-800 font-medium">{profileData?.slotDuration ? `${profileData.slotDuration} minutes` : 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Shop Address</p>
                    <p className="text-gray-800 font-medium">{profileData?.shopAddress || 'Not set'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wide font-medium">Services</p>
                    {profileData?.services && profileData.services.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {profileData.services.map((service, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                            {service.name || service}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">No services added</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Edit Profile</h2>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
                {/* Shop Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
                  <input type="text" name="shopName" value={formData.shopName} onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors text-sm" />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Category</label>
                  <select name="shopCategory" value={formData.shopCategory} onChange={handleInputChange}
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none bg-white text-sm">
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

                {/* Shop Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Image</label>
                  {formData.shopImage && !imageFile && (
                    <div className="mb-3">
                      <img src={formData.shopImage} alt="Current shop" className="w-48 h-36 object-cover rounded-xl border border-gray-200" />
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={handleImageChange}
                    className="w-full p-3 rounded-xl border-2 border-gray-200 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100" />
                  {imageFile && <p className="mt-2 text-xs text-gray-500">New image: {imageFile.name}</p>}
                </div>

                {/* Location Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleInputChange} maxLength="6"
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input type="text" name="city" value={formData.city} onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors text-sm" />
                  </div>
                </div>

                {/* Shop Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shop Address</label>
                  <textarea name="shopAddress" value={formData.shopAddress} onChange={handleInputChange} rows="3"
                    className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors resize-none text-sm" />
                </div>

                {/* Working Hours */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time</label>
                    <input type="time" name="openingTime" value={formData.openingTime} onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time</label>
                    <input type="time" name="closingTime" value={formData.closingTime} onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Slot Duration</label>
                    <select name="slotDuration" value={formData.slotDuration} onChange={handleInputChange}
                      className="w-full p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none bg-white text-sm">
                      <option value="">Select Duration</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                    </select>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Services</label>
                  <div className="flex gap-2 mb-3">
                    <input type="text" value={newService} onChange={(e) => setNewService(e.target.value)} placeholder="Enter service name"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddService())}
                      className="flex-1 p-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors text-sm" />
                    <button type="button" onClick={handleAddService}
                      className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors text-sm">
                      Add
                    </button>
                  </div>
                  {formData.services.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.services.map((service, index) => (
                        <span key={index} className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-100">
                          {service}
                          <button type="button" onClick={() => handleRemoveService(index)}
                            className="w-5 h-5 bg-red-100 text-red-600 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors text-xs font-bold">
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button onClick={handleSave}
                    className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors">
                    Save Profile
                  </button>
                  <button onClick={handleCancel}
                    className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Service Publishing Section */}
          <div className="mt-8">
            <MerchantServices />
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default MerchantDashboard;
