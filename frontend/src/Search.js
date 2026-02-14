import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const CATEGORIES = [
  'Barber', 'Salon', 'Hospital', 'Gym', 'Clinic', 'Spa',
  'Dental', 'Physiotherapy', 'Repair', 'Tutor', 'Photography', 'Consulting'
];

const CATEGORY_ICONS = {
  Barber: '💈', Salon: '💇', Hospital: '🏥', Gym: '🏋️',
  Clinic: '🩺', Spa: '🧖', Dental: '🦷', Physiotherapy: '🏃',
  Repair: '🔧', Tutor: '📚', Photography: '📷', Consulting: '💼'
};

function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('pincode');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState([]);
  const [serviceResults, setServiceResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState([]);

  // Booking modal state
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [allSlots, setAllSlots] = useState([]);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [bookingNote, setBookingNote] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [merchantAvailableDays, setMerchantAvailableDays] = useState([]);
  const [closedDayWarning, setClosedDayWarning] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 14);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  // Search services by pincode (and optionally category)
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setResults([]);
    setServiceResults([]);
    setMessage({ text: '', type: '' });

    try {
      // Search published services
      const serviceParams = new URLSearchParams({
        pincode: searchQuery.trim(),
        ...(selectedCategory !== 'All' && { category: selectedCategory })
      });
      const serviceRes = await fetch(`${API_URL}/services/search?${serviceParams}`);
      const serviceData = await serviceRes.json();

      if (serviceRes.ok) {
        setServiceResults(serviceData.services || []);
        setCategoryCounts(serviceData.categoryCounts || []);
      }

      // Also search merchants (existing flow)
      const merchantParams = new URLSearchParams({
        type: searchType,
        value: searchQuery.trim()
      });
      const merchantRes = await fetch(`${API_URL}/merchants/search-advanced?${merchantParams}`);
      const merchantData = await merchantRes.json();

      if (merchantRes.ok) {
        setResults(merchantData.merchants || []);
      }
    } catch (err) {
      console.error('Search error:', err);
      setMessage({ text: 'Unable to connect. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Re-search when category changes (if already searched)
  useEffect(() => {
    if (searched && searchQuery.trim()) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory]);

  const openBookingModal = (item) => {
    const merchant = {
      merchantId: item.merchantId,
      shopName: item.shopName,
      services: item.services || [{ name: item.serviceName, price: item.price, duration: item.duration }],
      shopAddress: item.shopAddress,
      phone: item.phone || item.merchantPhone
    };
    setSelectedMerchant(merchant);
    if (item.serviceName) {
      setSelectedService({ name: item.serviceName, price: item.price, duration: item.duration });
    } else {
      setSelectedService(null);
    }
    // Store available days from the service/merchant
    setMerchantAvailableDays(item.availableDays || []);
    setClosedDayWarning('');
    setSelectedDate('');
    setSelectedSlot('');
    setAvailableSlots([]);
    setBookingNote('');
  };

  const closeBookingModal = () => {
    setSelectedMerchant(null);
    setSelectedDate('');
    setSelectedSlot('');
    setSelectedService(null);
    setAvailableSlots([]);
    setAllSlots([]);
    setBookedSlots([]);
    setBookingNote('');
    setMerchantAvailableDays([]);
    setClosedDayWarning('');
  };

  // Check if a date falls on an available working day
  const isDayAvailable = (dateStr) => {
    if (!merchantAvailableDays || merchantAvailableDays.length === 0) return true;
    const date = new Date(dateStr + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[date.getDay()];
    return merchantAvailableDays.includes(dayName);
  };

  const getDayName = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const fetchSlots = async (date) => {
    if (!selectedMerchant || !date) return;
    setSlotsLoading(true);
    try {
      const res = await fetch(`${API_URL}/merchants/${selectedMerchant.merchantId}/slots?date=${date}`);
      const data = await res.json();
      if (res.ok) {
        setAllSlots(data.allSlots || []);
        setBookedSlots(data.bookedSlots || []);
        setAvailableSlots(data.availableSlots || []);
      } else {
        setAllSlots([]);
        setBookedSlots([]);
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
      setAllSlots([]);
      setBookedSlots([]);
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedMerchant]);

  const handleBooking = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage({ text: 'Please login to book an appointment', type: 'error' });
      return;
    }
    if (!selectedService || !selectedDate || !selectedSlot) {
      setMessage({ text: 'Please select service, date and time slot', type: 'error' });
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          merchantId: selectedMerchant.merchantId,
          service: selectedService,
          bookingDate: selectedDate,
          timeSlot: selectedSlot,
          userNote: bookingNote || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: 'Booking confirmed! Check your bookings page.', type: 'success' });
        closeBookingModal();
      } else {
        setMessage({ text: data.error || 'Booking failed', type: 'error' });
      }
    } catch (err) {
      console.error('Booking error:', err);
      setMessage({ text: 'Unable to complete booking. Please try again.', type: 'error' });
    } finally {
      setBookingLoading(false);
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

  const getCategoryCount = (cat) => {
    const found = categoryCounts.find(c => c._id === cat);
    return found ? found.count : 0;
  };

  const totalServiceCount = categoryCounts.reduce((sum, c) => sum + c.count, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Find & Book Services
          </h1>
          <p className="text-blue-100 text-lg mb-8">
            Discover local businesses and book appointments instantly
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-2 flex flex-col md:flex-row gap-2">
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-3 rounded-xl text-gray-700 bg-gray-50 border-0 focus:ring-2 focus:ring-blue-400 outline-none md:w-40"
              >
                <option value="pincode">Pincode</option>
                <option value="merchantId">Merchant ID</option>
              </select>
              
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchType === 'pincode' ? 'Enter pincode (e.g., 560001)' : 'Enter merchant ID'}
                className="flex-1 px-4 py-3 rounded-xl text-gray-700 bg-gray-50 border-0 focus:ring-2 focus:ring-blue-400 outline-none"
              />
              
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Filter Bar - Horizontal Slider */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Browse by Category</h3>
            {searched && totalServiceCount > 0 && (
              <span className="text-xs text-gray-500">{totalServiceCount} services found</span>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
            <style>{`.category-slider::-webkit-scrollbar { display: none; }`}</style>
            {/* All button */}
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 whitespace-nowrap flex-shrink-0 ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              All {searched && totalServiceCount > 0 ? `(${totalServiceCount})` : ''}
            </button>

            {CATEGORIES.map(cat => {
              const count = getCategoryCount(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border-2 whitespace-nowrap flex-shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {CATEGORY_ICONS[cat]} {cat} {searched && count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Message Banner */}
      {message.text && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className={`p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        </div>
      )}

      {/* Results Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Searching...</p>
          </div>
        )}

        {!loading && searched && serviceResults.length === 0 && results.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No services found</h3>
            <p className="text-gray-500">
              {selectedCategory !== 'All' 
                ? `No ${selectedCategory} services in this area. Try selecting "All" categories.`
                : 'Try searching with a different pincode or merchant ID'}
            </p>
          </div>
        )}

        {/* Published Services Results */}
        {!loading && serviceResults.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {serviceResults.length} {serviceResults.length === 1 ? 'Service' : 'Services'} Available
                {selectedCategory !== 'All' ? ` in ${selectedCategory}` : ''}
              </h2>
            </div>

            <div className="grid gap-4">
              {serviceResults.map((service) => (
                <div
                  key={service._id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                          {CATEGORY_ICONS[service.category] || '📋'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {service.serviceName}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
                              {service.category}
                            </span>
                            {service.price > 0 && (
                              <span className="inline-block px-3 py-1 bg-green-50 text-green-600 text-sm font-medium rounded-full">
                                ₹{service.price}
                              </span>
                            )}
                            <span className="inline-block px-3 py-1 bg-purple-50 text-purple-600 text-sm font-medium rounded-full">
                              {service.duration} min
                            </span>
                          </div>
                        </div>
                      </div>

                      {service.description && (
                        <p className="mt-3 text-sm text-gray-500">{service.description}</p>
                      )}

                      <div className="mt-4 space-y-2 text-gray-600">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <span className="text-sm font-medium">{service.shopName}</span>
                        </div>
                        {service.shopAddress && (
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-sm">{service.shopAddress} - {service.pincode}</span>
                          </div>
                        )}
                        {service.availableDays?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">{service.availableDays.map(d => d.slice(0, 3)).join(', ')}</span>
                          </div>
                        )}
                        {service.timeSlots?.length > 0 && (
                          <div className="flex items-center gap-2">
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm">
                              {service.timeSlots.map(ts => `${formatTime(ts.startTime)} - ${formatTime(ts.endTime)}`).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => openBookingModal(service)}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Merchant Results (shown when no published services found) */}
        {!loading && results.length > 0 && serviceResults.length === 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                {results.length} {results.length === 1 ? 'Business' : 'Businesses'} Found
              </h2>
            </div>

            <div className="grid gap-4">
              {results.map((merchant) => (
                <div
                  key={merchant.merchantId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                          {merchant.shopName?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {merchant.shopName}
                          </h3>
                          {merchant.shopCategory && (
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
                              {merchant.shopCategory}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-gray-600">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm">{merchant.shopAddress}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          <span className="text-sm">{merchant.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          <span className="text-sm font-mono text-blue-600">{merchant.merchantId}</span>
                        </div>
                      </div>

                      {merchant.shopDescription && (
                        <p className="mt-3 text-sm text-gray-500">{merchant.shopDescription}</p>
                      )}
                    </div>

                    <button
                      onClick={() => openBookingModal(merchant)}
                      className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!searched && !loading && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Search for services</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Enter a pincode to find nearby services or search by merchant ID. Use categories to filter results.
            </p>
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {selectedMerchant && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Book Appointment</h3>
                <p className="text-sm text-gray-500">{selectedMerchant.shopName}</p>
              </div>
              <button
                onClick={closeBookingModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Service Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Service</label>
                {selectedMerchant.services && selectedMerchant.services.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMerchant.services.map((service, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedService(typeof service === 'string' ? { name: service } : service)}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedService?.name === (service.name || service)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="font-medium text-gray-800">{service.name || service}</div>
                        {service.price > 0 && (
                          <div className="text-sm text-blue-600 mt-1">₹{service.price}</div>
                        )}
                        {service.duration && (
                          <div className="text-sm text-gray-500 mt-1">{service.duration} min</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedService({ name: 'General Appointment' })}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedService?.name === 'General Appointment'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-medium text-gray-800">General Appointment</div>
                      <div className="text-sm text-gray-500 mt-1">Standard consultation</div>
                    </button>
                  </div>
                )}
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                {merchantAvailableDays.length > 0 && (
                  <p className="text-xs text-gray-500 mb-2">
                    Open on: {merchantAvailableDays.map(d => d.slice(0, 3)).join(', ')}
                  </p>
                )}
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedSlot('');
                    setClosedDayWarning('');
                    if (val && !isDayAvailable(val)) {
                      setSelectedDate('');
                      setAvailableSlots([]);
                      setClosedDayWarning(`Shop is closed on ${getDayName(val)}. Please select another date.`);
                    } else {
                      setSelectedDate(val);
                    }
                  }}
                  min={today}
                  max={maxDateStr}
                  className={`w-full p-4 rounded-xl border-2 focus:ring-0 outline-none transition-colors ${
                    closedDayWarning ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
                  }`}
                />
                {closedDayWarning && (
                  <div className="mt-2 flex items-center gap-2 text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-sm font-medium">{closedDayWarning}</span>
                  </div>
                )}
              </div>

              {/* Time Slot Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Time</label>
                  {/* Legend */}
                  <div className="flex items-center gap-4 mb-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
                      <span className="text-gray-600">Available</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
                      <span className="text-gray-600">Booked</span>
                    </div>
                  </div>
                  {slotsLoading ? (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                      <p className="text-sm text-gray-500 mt-2">Loading available slots...</p>
                    </div>
                  ) : allSlots.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {allSlots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            onClick={() => !isBooked && setSelectedSlot(slot)}
                            disabled={isBooked}
                            className={`p-3 rounded-xl text-sm font-medium transition-all ${
                              isBooked
                                ? 'bg-red-100 text-red-600 border-2 border-red-200 cursor-not-allowed opacity-80'
                                : isSelected
                                  ? 'bg-green-600 text-white border-2 border-green-600 shadow-md'
                                  : 'bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100 hover:border-green-400'
                            }`}
                            title={isBooked ? 'This slot is already booked' : 'Click to select'}
                          >
                            {formatTime(slot)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500">No slots available for this date</p>
                    </div>
                  )}
                </div>
              )}

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                <textarea
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  placeholder="Any special requests..."
                  rows={3}
                  className="w-full p-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 outline-none transition-colors resize-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4">
              <button
                onClick={handleBooking}
                disabled={!selectedService || !selectedDate || !selectedSlot || bookingLoading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
              >
                {bookingLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Booking...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Confirm Booking
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Search;
