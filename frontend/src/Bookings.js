import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showOTPModal, setShowOTPModal] = useState(null); // booking object for OTP/QR display

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      const res = await fetch(`${API_URL}/bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setCancellingId(bookingId);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Cancelled by user' })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: 'Booking cancelled successfully', type: 'success' });
        fetchBookings();
      } else {
        setMessage({ text: data.error || 'Failed to cancel', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Unable to cancel booking', type: 'error' });
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusConfig = (status) => {
    const config = {
      'pending': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: '⏳', label: 'Pending' },
      'confirmed': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '✅', label: 'Confirmed' },
      'ongoing': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🔄', label: 'Ongoing' },
      'completed': { color: 'bg-green-100 text-green-700 border-green-200', icon: '✔️', label: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-700 border-red-200', icon: '❌', label: 'Cancelled' },
      'no-show': { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: '👻', label: 'No Show' }
    };
    return config[status] || config['pending'];
  };

  // Tab-based filtering
  const pendingBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
  const ongoingBookings = bookings.filter(b => b.status === 'ongoing');
  const completedBookings = bookings.filter(b => ['completed', 'cancelled', 'no-show'].includes(b.status));

  const tabBookings = {
    pending: pendingBookings,
    ongoing: ongoingBookings,
    completed: completedBookings
  };

  const displayBookings = tabBookings[activeTab] || [];

  // Generate simple QR-like visual (ASCII art pattern from QR data)
  const generateQRPattern = (data) => {
    if (!data) return null;
    // Create a deterministic pattern from the data string
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      hash = ((hash << 5) - hash) + data.charCodeAt(i);
      hash |= 0;
    }
    const size = 11;
    const grid = [];
    for (let r = 0; r < size; r++) {
      const row = [];
      for (let c = 0; c < size; c++) {
        // Fixed patterns for corners (finder patterns)
        if ((r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3)) {
          row.push((r === 1 && c === 1) || (r === 1 && c === size - 2) || (r === size - 2 && c === 1) ? true : (r === 0 || r === 2 || c === 0 || c === 2 || r === size - 3 || r === size - 1 || c === size - 3 || c === size - 1));
        } else {
          const seed = (hash + r * 31 + c * 17) & 0xFFFFFF;
          row.push(seed % 3 !== 0);
        }
      }
      grid.push(row);
    }
    return grid;
  };

  const renderBookingCard = (booking) => {
    const statusConfig = getStatusConfig(booking.status);

    return (
      <div
        key={booking.bookingId}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-5">
          {/* Top: Shop info + Status */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                {booking.shopName?.charAt(0)?.toUpperCase() || 'M'}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{booking.shopName}</h3>
                <p className="text-sm text-gray-500">{booking.service?.name}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.color} flex-shrink-0`}>
              <span>{statusConfig.icon}</span>
              {statusConfig.label}
            </span>
          </div>

          {/* Date, Time, Price row */}
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {formatDate(booking.bookingDate)}
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(booking.timeSlot)}
            </div>
            {booking.service?.price > 0 && (
              <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg font-semibold">
                ₹{booking.service.price}
              </div>
            )}
          </div>

          {booking.shopAddress && (
            <div className="mt-3 flex items-start gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span>{booking.shopAddress}</span>
            </div>
          )}

          {/* OTP & QR Section - Show when confirmed (like BookMyShow ticket) */}
          {booking.status === 'confirmed' && booking.verificationOTP && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                <span className="text-sm font-semibold text-blue-800">Your Booking Pass</span>
              </div>
              <p className="text-xs text-blue-600 mb-3">Share this OTP or QR with the merchant to start your service</p>
              
              <div className="flex items-center gap-4">
                {/* OTP Display */}
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Verification OTP</p>
                  <div className="flex gap-2">
                    {booking.verificationOTP.split('').map((digit, i) => (
                      <div key={i} className="w-10 h-12 bg-white rounded-lg border-2 border-blue-300 flex items-center justify-center text-xl font-bold text-blue-700 shadow-sm">
                        {digit}
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Button */}
                <button
                  onClick={() => setShowOTPModal(booking)}
                  className="flex flex-col items-center gap-1 px-4 py-3 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 transition-colors"
                >
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                  <span className="text-xs font-medium text-blue-600">Show QR</span>
                </button>
              </div>
            </div>
          )}

          {/* Ongoing indicator */}
          {booking.status === 'ongoing' && (
            <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-purple-500 rounded-full absolute top-0 left-0 animate-ping"></div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-purple-800">Service In Progress</p>
                  <p className="text-xs text-purple-600">Your appointment is currently active</p>
                </div>
              </div>
            </div>
          )}

          {/* Completed badge */}
          {booking.status === 'completed' && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-green-700">Service completed successfully</span>
            </div>
          )}

          {/* Footer: Booking ID + Actions */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              ID: <span className="font-mono text-gray-500">{booking.bookingId}</span>
            </span>

            <div className="flex items-center gap-2">
              {booking.userNote && (
                <span className="text-xs text-gray-400 italic hidden sm:inline">"{booking.userNote}"</span>
              )}

              {['pending', 'confirmed'].includes(booking.status) && (
                <button
                  onClick={() => handleCancel(booking.bookingId)}
                  disabled={cancellingId === booking.bookingId}
                  className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  {cancellingId === booking.bookingId ? (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-blue-100">View and manage your appointments</p>
        </div>
      </div>

      {/* Message */}
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

      {/* 3 Tabs: Pending | Ongoing | Completed */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 flex">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm text-center ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Pending ({pendingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('ongoing')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm text-center ${
              activeTab === 'ongoing'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Ongoing ({ongoingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-3 rounded-xl font-semibold transition-all text-sm text-center ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            Completed ({completedBookings.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Loading bookings...</p>
          </div>
        ) : displayBookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4 text-lg font-bold text-blue-600">
              {activeTab === 'pending' ? 'P' : activeTab === 'ongoing' ? 'O' : 'C'}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {activeTab === 'pending' ? 'No pending bookings' : activeTab === 'ongoing' ? 'No ongoing services' : 'No completed bookings'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'pending' 
                ? 'Book an appointment to see it here' 
                : activeTab === 'ongoing'
                  ? 'Active services will appear here when verified'
                  : 'Your completed appointments will appear here'}
            </p>
            {activeTab === 'pending' && (
              <a href="/search" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Services
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayBookings.map(renderBookingCard)}
          </div>
        )}
      </div>

      {/* OTP/QR Full Screen Modal (BookMyShow style) */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Booking Pass</h3>
                  <p className="text-blue-200 text-sm">Show this to the merchant</p>
                </div>
                <button onClick={() => setShowOTPModal(null)} className="p-2 hover:bg-white/20 rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="px-6 py-6">
              {/* Shop & Service */}
              <div className="text-center mb-6">
                <h4 className="text-xl font-bold text-gray-800">{showOTPModal.shopName}</h4>
                <p className="text-gray-500 mt-1">{showOTPModal.service?.name}</p>
                <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-600">
                  <span>{formatDate(showOTPModal.bookingDate)}</span>
                  <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                  <span>{formatTime(showOTPModal.timeSlot)}</span>
                </div>
              </div>

              {/* Dashed divider */}
              <div className="border-t-2 border-dashed border-gray-200 my-5 relative">
                <div className="absolute -left-9 -top-3 w-6 h-6 bg-black/60 rounded-full"></div>
                <div className="absolute -right-9 -top-3 w-6 h-6 bg-black/60 rounded-full"></div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-5">
                <div className="bg-white p-3 rounded-xl border-2 border-gray-200">
                  <div className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(11, 1fr)` }}>
                    {generateQRPattern(showOTPModal.verificationQR)?.flat().map((filled, i) => (
                      <div
                        key={i}
                        className={`w-3 h-3 rounded-sm ${filled ? 'bg-gray-900' : 'bg-white'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* OTP */}
              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Verification OTP</p>
                <div className="flex justify-center gap-3">
                  {showOTPModal.verificationOTP?.split('').map((digit, i) => (
                    <div key={i} className="w-12 h-14 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl border-2 border-blue-300 flex items-center justify-center text-2xl font-bold text-blue-700 shadow-sm">
                      {digit}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-center text-xs text-gray-400 mt-4">
                Booking ID: {showOTPModal.bookingId}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Bookings;
