import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

function MerchantSearch() {
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [updatingId, setUpdatingId] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    if (inputRef.current) inputRef.current.focus();
  }, [navigate]);

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

  const lookupBooking = async () => {
    const id = lookupId.trim().toUpperCase();
    if (!id) return;

    setLookupLoading(true);
    setLookupResult(null);
    setMessage({ text: '', type: '' });
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_URL}/bookings/${encodeURIComponent(id)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.booking) {
        setLookupResult({ booking: data.booking });
      } else {
        setLookupResult({ error: data.error || 'Booking not found' });
      }
    } catch (err) {
      setLookupResult({ error: 'Network error. Try again.' });
    } finally {
      setLookupLoading(false);
    }
  };

  const clearLookup = () => {
    setLookupId('');
    setLookupResult(null);
    setMessage({ text: '', type: '' });
    if (inputRef.current) inputRef.current.focus();
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
          setMessage({ text: '✅ Booking confirmed! OTP has been generated.', type: 'success' });
        } else {
          setMessage({ text: `Booking ${newStatus} successfully`, type: 'success' });
        }
        // Re-lookup to show updated status
        setTimeout(() => lookupBooking(), 500);
      } else {
        setMessage({ text: data.error || 'Update failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Unable to update booking', type: 'error' });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 pt-24 pb-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Search Booking</h1>
          <p className="text-blue-100 text-sm mt-1">Look up any booking by its ID</p>
        </div>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div className="max-w-2xl mx-auto px-4 mt-4">
          <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
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

      {/* Search Input */}
      <div className="max-w-2xl mx-auto px-4 -mt-5">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-5">
            <form onSubmit={(e) => { e.preventDefault(); lookupBooking(); }} className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm font-bold">#</span>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter Booking ID (e.g. WS-260302-A7K3)"
                  value={lookupId}
                  onChange={(e) => { setLookupId(e.target.value.toUpperCase()); setLookupResult(null); }}
                  className="w-full pl-8 pr-4 py-3.5 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-0 outline-none text-sm font-mono tracking-wide uppercase"
                />
              </div>
              <button
                type="submit"
                disabled={!lookupId.trim() || lookupLoading}
                className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 flex-shrink-0"
              >
                {lookupLoading ? (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
                Find
              </button>
              {lookupId && (
                <button
                  type="button"
                  onClick={clearLookup}
                  className="px-3 py-3.5 border border-gray-200 hover:bg-gray-50 text-gray-500 rounded-xl transition-colors flex-shrink-0"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Result Area */}
      <div className="max-w-2xl mx-auto px-4 mt-4">
        {lookupResult ? (
          lookupResult.error ? (
            /* Not Found */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Booking Not Found</h3>
                <p className="text-sm text-gray-500">No booking matches ID "<span className="font-mono font-semibold">{lookupId}</span>". Check the ID and try again.</p>
                <button
                  onClick={clearLookup}
                  className="mt-4 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  Try Another
                </button>
              </div>
            </div>
          ) : lookupResult.booking && (
            /* Booking Found */
            <div className="bg-white rounded-2xl shadow-sm border-2 border-indigo-200 overflow-hidden">
              {/* Found Header */}
              <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-200 flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  BOOKING FOUND
                </span>
                <span className="font-mono text-xs font-bold text-indigo-800 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
                  {lookupResult.booking.bookingId}
                </span>
              </div>

              {/* Customer Info */}
              <div className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                      {lookupResult.booking.userName?.charAt(0)?.toUpperCase() || 'C'}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">{lookupResult.booking.userName}</p>
                      <p className="text-sm text-gray-500">{lookupResult.booking.userPhone}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-semibold border ${getStatusColor(lookupResult.booking.status)}`}>
                    <span>{getStatusIcon(lookupResult.booking.status)}</span>
                    {lookupResult.booking.status.charAt(0).toUpperCase() + lookupResult.booking.status.slice(1)}
                  </span>
                </div>

                {/* Booking Details */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3.5 py-2.5 rounded-xl">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    <span className="text-sm font-medium truncate">{lookupResult.booking.service?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3.5 py-2.5 rounded-xl">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">{formatDate(lookupResult.booking.bookingDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 px-3.5 py-2.5 rounded-xl">
                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">{formatTime(lookupResult.booking.timeSlot)}</span>
                  </div>
                  {lookupResult.booking.service?.price > 0 && (
                    <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3.5 py-2.5 rounded-xl">
                      <span className="text-sm font-bold">₹{lookupResult.booking.service.price}</span>
                    </div>
                  )}
                </div>

                {/* User Note */}
                {lookupResult.booking.userNote && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <p className="text-xs text-yellow-600 font-medium mb-0.5">Customer Note</p>
                    <p className="text-sm text-gray-700">{lookupResult.booking.userNote}</p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-4 flex flex-wrap gap-2">
                  {lookupResult.booking.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateBookingStatus(lookupResult.booking.bookingId, 'confirmed')}
                        disabled={updatingId === lookupResult.booking.bookingId}
                        className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        ✅ Accept Booking
                      </button>
                      <button
                        onClick={() => updateBookingStatus(lookupResult.booking.bookingId, 'cancelled')}
                        disabled={updatingId === lookupResult.booking.bookingId}
                        className="flex-1 px-4 py-3 border-2 border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  {lookupResult.booking.status === 'confirmed' && (
                    <button
                      onClick={() => navigate(`/merchant-bookings`)}
                      className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-colors"
                    >
                      🔐 Verify OTP in Bookings
                    </button>
                  )}
                  {lookupResult.booking.status === 'ongoing' && (
                    <button
                      onClick={() => updateBookingStatus(lookupResult.booking.bookingId, 'completed')}
                      disabled={updatingId === lookupResult.booking.bookingId}
                      className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      ✔️ Mark Complete
                    </button>
                  )}
                </div>

                {/* Search Again */}
                <button
                  onClick={clearLookup}
                  className="mt-3 w-full px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl transition-colors"
                >
                  Search Another Booking
                </button>
              </div>
            </div>
          )
        ) : (
          /* Empty State */
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-2">
            <div className="w-20 h-20 mx-auto bg-indigo-50 rounded-full flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Search by Booking ID</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Enter a booking ID like <span className="font-mono font-semibold text-indigo-600">WS-260302-A7K3</span> to quickly find and manage any booking.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                <span>✅</span> Accept / Decline
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                <span>🔐</span> Verify OTP
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                <span>✔️</span> Mark Complete
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MerchantSearch;
