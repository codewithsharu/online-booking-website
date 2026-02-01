import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [cancellingId, setCancellingId] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'confirmed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'completed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'cancelled':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      default:
        return null;
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingBookings = bookings.filter(b => {
    const bookingDate = new Date(b.bookingDate);
    return bookingDate >= today && !['cancelled', 'completed', 'no-show'].includes(b.status);
  });

  const pastBookings = bookings.filter(b => {
    const bookingDate = new Date(b.bookingDate);
    return bookingDate < today || ['cancelled', 'completed', 'no-show'].includes(b.status);
  });

  const displayBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1 inline-flex">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'upcoming'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 rounded-xl font-medium transition-all ${
              activeTab === 'past'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Past ({pastBookings.length})
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
            <div className="w-20 h-20 mx-auto bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </h3>
            <p className="text-gray-500 mb-6">
              {activeTab === 'upcoming' 
                ? 'Book an appointment to see it here' 
                : 'Your completed and cancelled bookings will appear here'}
            </p>
            {activeTab === 'upcoming' && (
              <a
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Find Services
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayBookings.map((booking) => (
              <div
                key={booking.bookingId}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left Side - Shop & Service Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          {booking.shopName?.charAt(0)?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">
                            {booking.shopName}
                          </h3>
                          <p className="text-sm text-gray-500">{booking.service?.name}</p>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {formatDate(booking.bookingDate)}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTime(booking.timeSlot)}
                        </div>
                      </div>

                      {booking.shopAddress && (
                        <div className="mt-3 flex items-start gap-2 text-sm text-gray-500">
                          <svg className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                          <span>{booking.shopAddress}</span>
                        </div>
                      )}
                    </div>

                    {/* Right Side - Status & Actions */}
                    <div className="flex flex-col items-end gap-3">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>

                      {booking.service?.price && (
                        <span className="text-lg font-semibold text-gray-800">
                          ₹{booking.service.price}
                        </span>
                      )}

                      {['pending', 'confirmed'].includes(booking.status) && (
                        <button
                          onClick={() => handleCancel(booking.bookingId)}
                          disabled={cancellingId === booking.bookingId}
                          className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1 disabled:opacity-50"
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

                  {/* Booking ID */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      Booking ID: <span className="font-mono text-gray-600">{booking.bookingId}</span>
                    </span>
                    {booking.userNote && (
                      <span className="text-gray-500 italic">"{booking.userNote}"</span>
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

export default Bookings;
