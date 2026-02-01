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

  // Get today's date
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, statusFilter]);

  const fetchBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    try {
      let url = `${API_URL}/merchant/bookings?`;
      if (selectedDate) url += `date=${selectedDate}&`;
      if (statusFilter) url += `status=${statusFilter}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

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
        setMessage({ text: `Booking ${newStatus} successfully`, type: 'success' });
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

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
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
      'completed': 'bg-green-100 text-green-700 border-green-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200',
      'no-show': 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const clearFilters = () => {
    setSelectedDate('');
    setStatusFilter('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Manage Bookings</h1>
          <p className="text-blue-100">View and manage customer appointments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats.todayBookings}</p>
                <p className="text-sm text-gray-500">Today's Bookings</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats.pendingCount}</p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-800">{stats.totalCompleted}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message */}
      {message.text && (
        <div className="max-w-6xl mx-auto px-4 mt-4">
          <div className={`p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
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
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
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
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
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
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        {booking.service?.name}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(booking.bookingDate)}
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(booking.timeSlot)}
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>

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
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Confirm
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

                      {booking.status === 'confirmed' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateBookingStatus(booking.bookingId, 'completed')}
                            disabled={updatingId === booking.bookingId}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                          >
                            Complete
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
                    </div>
                  </div>

                  {/* Booking ID & Note */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-gray-400">
                      ID: <span className="font-mono text-gray-600">{booking.bookingId}</span>
                    </span>
                    {booking.userNote && (
                      <span className="text-gray-500 italic bg-gray-50 px-3 py-1 rounded-lg">
                        Note: "{booking.userNote}"
                      </span>
                    )}
                    {booking.service?.price && (
                      <span className="font-semibold text-gray-800">₹{booking.service.price}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MerchantBookings;
