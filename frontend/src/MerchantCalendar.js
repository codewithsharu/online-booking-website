import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function MerchantCalendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-based
  const [calendarData, setCalendarData] = useState({});
  const [summary, setSummary] = useState({ total: 0, pending: 0, confirmed: 0, ongoing: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null); // day number
  const [dayBookings, setDayBookings] = useState([]);
  const [dayLoading, setDayLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [updatingId, setUpdatingId] = useState(null);
  const initialLoadDone = useRef(false);

  // Fetch calendar overview for the month
  const fetchCalendar = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/merchant/calendar?year=${currentYear}&month=${currentMonth + 1}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.clear(); navigate('/login'); return;
      }
      const data = await res.json();
      if (res.ok) {
        setCalendarData(data.calendar || {});
        setSummary(data.summary || { total: 0, pending: 0, confirmed: 0, ongoing: 0, completed: 0, cancelled: 0 });
      }
    } catch (err) {
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [currentYear, currentMonth, navigate]);

  useEffect(() => {
    fetchCalendar();
    setSelectedDay(null);
    setDayBookings([]);
    initialLoadDone.current = false;
  }, [fetchCalendar]);

  // Auto-select today only on first load of the current month
  useEffect(() => {
    if (initialLoadDone.current) return;
    if (!loading && currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
      initialLoadDone.current = true;
      handleDayClick(today.getDate());
    }
    // eslint-disable-next-line
  }, [loading]);

  // Fetch bookings for a specific day
  const fetchDayBookings = useCallback(async (day) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setDayLoading(true);
    try {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const res = await fetch(`${API_URL}/merchant/bookings?date=${dateStr}&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        const bks = data.bookings || [];
        setDayBookings(bks);

        // Sync calendarData from actual bookings (fixes stale/empty calendar data)
        if (bks.length > 0) {
          const counts = { total: bks.length, pending: 0, confirmed: 0, ongoing: 0, completed: 0, cancelled: 0 };
          bks.forEach(b => { if (counts[b.status] !== undefined) counts[b.status]++; });
          setCalendarData(prev => ({ ...prev, [day]: counts }));
          // Update month summary
          setSummary(prev => {
            const updated = { ...prev };
            const old = prev[`_day${day}`] || { total: 0, pending: 0, confirmed: 0, ongoing: 0, completed: 0, cancelled: 0 };
            Object.keys(counts).forEach(k => { updated[k] = (updated[k] || 0) - old[k] + counts[k]; });
            updated[`_day${day}`] = counts;
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Day bookings fetch error:', err);
    } finally {
      setDayLoading(false);
    }
  }, [currentYear, currentMonth]);

  const handleDayClick = (day) => {
    setSelectedDay(day);
    fetchDayBookings(day);
  };

  // Navigation
  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  const goToToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth());
    setSelectedDay(today.getDate());
    fetchDayBookings(today.getDate());
  };

  // Update booking status
  const updateBookingStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/merchant/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: newStatus === 'confirmed' ? '✅ Booking confirmed! OTP generated.' : `Booking ${newStatus} successfully`, type: 'success' });
        if (selectedDay) fetchDayBookings(selectedDay);
        fetchCalendar();
      } else {
        setMessage({ text: data.error || 'Update failed', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Unable to update booking', type: 'error' });
    } finally {
      setUpdatingId(null);
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };

  // Calendar grid helpers
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();

  const isToday = (day) => {
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const isPast = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t;
  };

  const isFuture = (day) => {
    const d = new Date(currentYear, currentMonth, day);
    const t = new Date(); t.setHours(0,0,0,0);
    return d > t;
  };

  // Format helpers
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusStyle = (status) => {
    const styles = {
      pending: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-400' },
      confirmed: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-400' },
      ongoing: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
      completed: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
      cancelled: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700', dot: 'bg-red-400' },
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    const icons = { pending: '⏳', confirmed: '✅', ongoing: '🔄', completed: '✔️', cancelled: '❌', 'no-show': '👻' };
    return icons[status] || '📋';
  };

  // Build calendar grid
  const calendarCells = [];
  // Previous month trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarCells.push({ day: prevMonthDays - i, type: 'prev' });
  }
  // Current month days  
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({ day: d, type: 'current' });
  }
  // Next month leading days
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({ day: i, type: 'next' });
  }

  const selectedDateStr = selectedDay
    ? new Date(currentYear, currentMonth, selectedDay).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 pt-24 pb-6 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-blue-200 text-sm mt-0.5">Track all your bookings day by day</p>
        </div>
      </div>

      {/* Month Summary Bar */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
          <div className="grid grid-cols-5 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-gray-800">{summary.total}</div>
              <div className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Total</div>
            </div>
            <div>
              <div className="text-lg font-bold text-amber-600">{summary.pending}</div>
              <div className="text-[10px] text-amber-500 font-medium uppercase tracking-wide">Pending</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">{summary.confirmed}</div>
              <div className="text-[10px] text-blue-500 font-medium uppercase tracking-wide">Confirmed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">{summary.ongoing}</div>
              <div className="text-[10px] text-purple-500 font-medium uppercase tracking-wide">Ongoing</div>
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-600">{summary.completed}</div>
              <div className="text-[10px] text-emerald-500 font-medium uppercase tracking-wide">Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Toast */}
      {message.text && (
        <div className="max-w-4xl mx-auto px-4 mt-3">
          <div className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            <span>{message.text}</span>
            <button onClick={() => setMessage({ text: '', type: '' })} className="text-current opacity-50 hover:opacity-100">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      )}

      {/* Calendar Card */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Month Navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button onClick={goToPrevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="text-center">
              <h2 className="text-lg font-bold text-gray-800">{MONTH_NAMES[currentMonth]} {currentYear}</h2>
              <button onClick={goToToday} className="text-xs text-indigo-600 font-medium hover:underline mt-0.5">
                Today
              </button>
            </div>
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="p-2 sm:p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAY_LABELS.map(d => (
                  <div key={d} className="text-center text-[11px] font-semibold text-gray-400 uppercase py-2">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {calendarCells.map((cell, i) => {
                  const dayData = cell.type === 'current' ? calendarData[cell.day] : null;
                  const hasBookings = dayData && dayData.total > 0;
                  const isSelected = cell.type === 'current' && selectedDay === cell.day;
                  const dayIsToday = cell.type === 'current' && isToday(cell.day);
                  const dayIsPast = cell.type === 'current' && isPast(cell.day);

                  return (
                    <button
                      key={i}
                      disabled={cell.type !== 'current'}
                      onClick={() => cell.type === 'current' && handleDayClick(cell.day)}
                      className={`
                        relative flex flex-col items-center justify-center rounded-lg aspect-square transition-all duration-150 border
                        ${cell.type !== 'current' ? 'opacity-0 pointer-events-none border-transparent' : 'cursor-pointer border-gray-100'}
                        ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 !border-indigo-600' : ''}
                        ${!isSelected && cell.type === 'current' ? 'hover:bg-indigo-50 hover:border-indigo-200' : ''}
                        ${dayIsToday && !isSelected ? 'bg-indigo-50 !border-indigo-400 ring-1 ring-indigo-400' : ''}
                        ${dayIsPast && !isSelected && !dayIsToday ? 'text-gray-300' : ''}
                        ${!dayIsPast && !isSelected && !dayIsToday && cell.type === 'current' ? 'text-gray-700' : ''}
                      `}
                    >
                      <span className={`text-[13px] font-semibold ${
                        isSelected ? 'text-white' : dayIsToday ? 'text-indigo-600 font-bold' : ''
                      }`}>
                        {cell.day}
                      </span>

                      {/* Badge count on date */}
                      {hasBookings && dayData.total > 0 && (
                        <span className={`absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full text-[9px] font-bold flex items-center justify-center px-[3px] leading-none shadow-sm ${
                          isSelected
                            ? 'bg-white text-indigo-600'
                            : dayData.pending > 0
                              ? 'bg-amber-400 text-white'
                              : dayData.confirmed > 0
                                ? 'bg-blue-500 text-white'
                                : dayData.ongoing > 0
                                  ? 'bg-purple-500 text-white'
                                  : 'bg-emerald-500 text-white'
                        }`}>
                          {dayData.total}
                        </span>
                      )}

                      {hasBookings && (
                        <div className="flex items-center gap-[3px] mt-1">
                          {dayData.pending > 0 && (
                            <span className={`w-[5px] h-[5px] rounded-full ${isSelected ? 'bg-amber-300' : 'bg-amber-400'}`}></span>
                          )}
                          {dayData.confirmed > 0 && (
                            <span className={`w-[5px] h-[5px] rounded-full ${isSelected ? 'bg-blue-300' : 'bg-blue-500'}`}></span>
                          )}
                          {dayData.ongoing > 0 && (
                            <span className={`w-[5px] h-[5px] rounded-full ${isSelected ? 'bg-purple-300' : 'bg-purple-500'}`}></span>
                          )}
                          {dayData.completed > 0 && (
                            <span className={`w-[5px] h-[5px] rounded-full ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`}></span>
                          )}
                          {dayData.cancelled > 0 && (
                            <span className={`w-[5px] h-[5px] rounded-full ${isSelected ? 'bg-red-300' : 'bg-red-400'}`}></span>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-3 sm:gap-5 mt-3 pt-3 border-t border-gray-100">
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium"><span className="w-[6px] h-[6px] rounded-full bg-amber-400"></span>Pending</span>
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium"><span className="w-[6px] h-[6px] rounded-full bg-blue-500"></span>Confirmed</span>
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium"><span className="w-[6px] h-[6px] rounded-full bg-purple-500"></span>Ongoing</span>
                <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium"><span className="w-[6px] h-[6px] rounded-full bg-emerald-500"></span>Done</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Day Detail Panel */}
      {selectedDay && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Day Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-800">{selectedDateStr}</h3>
                <div className="flex gap-2 mt-1 flex-wrap">
                  {(() => {
                    // Compute stats from actual loaded bookings (reliable)
                    const dayCounts = { pending: 0, confirmed: 0, ongoing: 0, completed: 0, cancelled: 0 };
                    dayBookings.forEach(b => { if (dayCounts[b.status] !== undefined) dayCounts[b.status]++; });
                    const hasAny = dayBookings.length > 0;
                    if (dayLoading) return <span className="text-[10px] text-gray-400 font-medium">Loading...</span>;
                    if (!hasAny) return <span className="text-[10px] text-gray-400 font-medium">No bookings</span>;
                    return (
                      <>
                        {dayCounts.pending > 0 && (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">
                            {dayCounts.pending} Pending
                          </span>
                        )}
                        {dayCounts.confirmed > 0 && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                            {dayCounts.confirmed} Confirmed
                          </span>
                        )}
                        {dayCounts.ongoing > 0 && (
                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-medium">
                            {dayCounts.ongoing} Ongoing
                          </span>
                        )}
                        {dayCounts.completed > 0 && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                            {dayCounts.completed} Done
                          </span>
                        )}
                        {dayCounts.cancelled > 0 && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded font-medium">
                            {dayCounts.cancelled} Cancelled
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <button
                onClick={() => { setSelectedDay(null); setDayBookings([]); }}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-gray-400"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Day Bookings Timeline */}
            <div className="p-4">
              {dayLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              ) : dayBookings.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-500">No bookings for this day</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {isFuture(selectedDay) ? 'No appointments scheduled yet' : 'No activity recorded'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dayBookings.map((booking) => {
                    const s = getStatusStyle(booking.status);
                    return (
                      <div
                        key={booking.bookingId}
                        className={`rounded-xl border ${s.border} ${s.bg} overflow-hidden transition-all hover:shadow-sm`}
                      >
                        <div className="p-3.5">
                          {/* Top row: time + ID + status */}
                          <div className="flex items-center justify-between mb-2.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800">
                                {formatTime(booking.timeSlot)}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-100">
                                {booking.bookingId}
                              </span>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold ${s.badge}`}>
                              {getStatusIcon(booking.status)} {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </div>

                          {/* Customer info */}
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {booking.userName?.charAt(0)?.toUpperCase() || 'C'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{booking.userName}</p>
                              <p className="text-xs text-gray-500">{booking.userPhone}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-xs font-medium text-gray-600 truncate max-w-[100px]">{booking.service?.name}</p>
                              {booking.service?.price > 0 && (
                                <p className="text-xs font-bold text-gray-700">₹{booking.service.price}</p>
                              )}
                            </div>
                          </div>

                          {/* Note */}
                          {booking.userNote && (
                            <div className="mt-2 px-2.5 py-1.5 bg-white/50 rounded-lg border border-gray-100">
                              <p className="text-[11px] text-gray-500 italic">"{booking.userNote}"</p>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="mt-2.5 flex gap-2">
                            {booking.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateBookingStatus(booking.bookingId, 'confirmed')}
                                  disabled={updatingId === booking.bookingId}
                                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {updatingId === booking.bookingId ? '...' : '✅ Accept'}
                                </button>
                                <button
                                  onClick={() => updateBookingStatus(booking.bookingId, 'cancelled')}
                                  disabled={updatingId === booking.bookingId}
                                  className="px-3 py-2 border border-red-200 text-red-600 text-xs font-semibold rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {booking.status === 'confirmed' && (
                              <button
                                onClick={() => navigate('/merchant-bookings')}
                                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                🔐 Verify OTP
                              </button>
                            )}
                            {booking.status === 'ongoing' && (
                              <button
                                onClick={() => updateBookingStatus(booking.bookingId, 'completed')}
                                disabled={updatingId === booking.bookingId}
                                className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                              >
                                {updatingId === booking.bookingId ? '...' : '✔️ Mark Complete'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MerchantCalendar;
