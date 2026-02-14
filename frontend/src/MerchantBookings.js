import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function MerchantBookings() {
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ todayBookings: 0, pendingCount: 0, totalCompleted: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [verifyModal, setVerifyModal] = useState(null); // booking object for OTP verification
  const [otpInput, setOtpInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, statusFilter]);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }

    setLoading(true);
    try {
      let url = `${API_URL}/merchant/bookings?`;
      if (selectedDate) url += `date=${selectedDate}&`;
      if (statusFilter) url += `status=${statusFilter}`;

      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });

      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      if (res.ok) {
        setBookings(data.bookings || []);
        setStats(data.stats || { todayBookings: 0, pendingCount: 0, totalCompleted: 0 });
      }
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/merchant/bookings/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();

      if (res.ok) {
        if (newStatus === 'confirmed') {
          setMessage({ text: '✅ Booking confirmed! OTP has been generated for the customer.', type: 'success' });
        } else {
          setMessage({ text: `Booking ${newStatus} successfully`, type: 'success' });
        }
        fetchBookings();
      } else {
        setMessage({ text: data.error || 'Update failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Unable to update booking', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleVerifyOTP = async () => {
    if (!verifyModal || otpInput.length !== 4) {
      setMessage({ text: 'Please enter the 4-digit OTP', type: 'error' });
      return;
    }

    setVerifying(true);
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/merchant/bookings/${verifyModal.bookingId}/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp: otpInput })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: '✅ OTP Verified! Service started.', type: 'success' });
        setVerifyModal(null);
        setOtpInput('');
        fetchBookings();
      } else {
        setMessage({ text: data.error || 'OTP verification failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Unable to verify OTP', type: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short'
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

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'confirmed': 'bg-blue-100 text-blue-700 border-blue-200',
      'ongoing': 'bg-purple-100 text-purple-700 border-purple-200',
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'no-show': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': '⏳', 'confirmed': '✅', 'ongoing': '🔄',
      'completed': '✔️', 'cancelled': '❌', 'no-show': '👻'
    };
    return icons[status] || '📋';
  };

  const clearFilters = () => {
    setSelectedDate('');
    setStatusFilter('');
  };

  // Count stats for ongoing
  const ongoingCount = bookings.filter(b => b.status === 'ongoing').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Manage Bookings</h1>
          <p className="text-blue-100">View and manage customer appointments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">📅</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.todayBookings}</p>
                <p className="text-xs text-gray-500">Today</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-xl">⏳</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.pendingCount}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">🔄</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{ongoingCount}</p>
                <p className="text-xs text-gray-500">Ongoing</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">✔️</div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalCompleted}</p>
                <p className="text-xs text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className={`p-4 rounded-xl flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ text: '', type: '' })} className="text-current opacity-50 hover:opacity-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-0 outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-0 outline-none bg-white"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no-show">No Show</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6 md:mt-0">
              <button
                onClick={() => setSelectedDate(today)}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Today
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-500 mt-4">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4 text-4xl">📋</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings found</h3>
            <p className="text-gray-500">
              {selectedDate || statusFilter 
                ? 'Try changing your filters' 
                : 'Bookings will appear here when customers make appointments'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.bookingId}
                className={`bg-white rounded-2xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                  booking.status === 'ongoing' ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-100'
                }`}
              >
                <div className="p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Customer Info */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                        {booking.userName?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{booking.userName}</h3>
                        <p className="text-sm text-gray-500">{booking.userPhone}</p>
                      </div>
                    </div>

                    {/* Booking Details */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {booking.service?.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(booking.bookingDate)}
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(booking.timeSlot)}
                      </div>
                      {booking.service?.price > 0 && (
                        <span className="font-semibold text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">₹{booking.service.price}</span>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        <span>{getStatusIcon(booking.status)}</span>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>

                      {/* PENDING → Confirm / Decline */}
                      {booking.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking.bookingId, 'confirmed')}
                            disabled={updatingId === booking.bookingId}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                          >
                            {updatingId === booking.bookingId ? (
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : '✅'}
                            Accept
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.bookingId, 'cancelled')}
                            disabled={updatingId === booking.bookingId}
                            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {/* CONFIRMED → Verify OTP (start service) / No Show */}
                      {booking.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setVerifyModal(booking); setOtpInput(''); }}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1"
                          >
                            🔐 Verify OTP
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.bookingId, 'no-show')}
                            disabled={updatingId === booking.bookingId}
                            className="px-4 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            No Show
                          </button>
                        </div>
                      )}

                      {/* ONGOING → Complete */}
                      {booking.status === 'ongoing' && (
                        <button
                          onClick={() => updateBookingStatus(booking.bookingId, 'completed')}
                          disabled={updatingId === booking.bookingId}
                          className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {updatingId === booking.bookingId ? (
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                          ) : '✔️'}
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ongoing progress bar */}
                  {booking.status === 'ongoing' && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center gap-3">
                      <div className="relative">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-purple-500 rounded-full absolute top-0 left-0 animate-ping"></div>
                      </div>
                      <span className="text-sm font-medium text-purple-700">Service in progress — OTP verified at {booking.otpVerifiedAt ? new Date(booking.otpVerifiedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                  )}

                  {/* Booking ID & Note */}
                  <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-gray-400">
                      ID: <span className="font-mono text-gray-600">{booking.bookingId}</span>
                    </span>
                    {booking.userNote && (
                      <span className="text-gray-500 italic bg-gray-50 px-3 py-1 rounded-lg">
                        Note: "{booking.userNote}"
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OTP Verification Modal */}
      {verifyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 text-white px-6 py-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">🔐 Verify Customer OTP</h3>
                  <p className="text-purple-200 text-sm">Ask the customer for their 4-digit OTP</p>
                </div>
                <button
                  onClick={() => { setVerifyModal(null); setOtpInput(''); }}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Customer Info */}
              <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold">
                  {verifyModal.userName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{verifyModal.userName}</p>
                  <p className="text-sm text-gray-500">{verifyModal.service?.name} • {formatTime(verifyModal.timeSlot)}</p>
                </div>
              </div>

              {/* OTP Input */}
              <label className="block text-sm font-medium text-gray-700 mb-3">Enter Customer's OTP</label>
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    type="text"
                    maxLength={1}
                    value={otpInput[idx] || ''}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      const newOtp = otpInput.split('');
                      newOtp[idx] = val;
                      setOtpInput(newOtp.join(''));
                      // Auto-focus next input
                      if (val && idx < 3) {
                        const next = e.target.parentElement.children[idx + 1];
                        if (next) next.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otpInput[idx] && idx > 0) {
                        const prev = e.target.parentElement.children[idx - 1];
                        if (prev) prev.focus();
                      }
                    }}
                    className="w-14 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-0 outline-none transition-colors"
                    autoFocus={idx === 0}
                  />
                ))}
              </div>

              {/* Action buttons */}
              <button
                onClick={handleVerifyOTP}
                disabled={otpInput.length !== 4 || verifying}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <>✅ Verify & Start Service</>
                )}
              </button>

              <p className="text-center text-xs text-gray-400 mt-4">
                The customer received this OTP when you confirmed the booking
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MerchantBookings;
