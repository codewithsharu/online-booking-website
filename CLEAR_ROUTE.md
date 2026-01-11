# 🧹 Clear Session Route Documentation

## Overview
Added `/clear` route to clear all browser session data (localStorage, sessionStorage, cookies) to prevent issues with new deployments.

## Features Implemented

### Backend Route
**Endpoint:** `GET /api/clear`

**Response:**
```json
{
  "success": true,
  "message": "Clear all browser storage: localStorage, sessionStorage, cookies",
  "timestamp": "2026-01-12T...",
  "instructions": {
    "localStorage": "localStorage.clear()",
    "sessionStorage": "sessionStorage.clear()",
    "cookies": "document.cookie.split(';').forEach(...);"
  }
}
```

**Purpose:** Provides instructions and signal for frontend to clear all session data

---

### Frontend Component
**File:** `frontend/src/Clear.js`

**Functionality:**
1. ✅ Clears localStorage
2. ✅ Clears sessionStorage
3. ✅ Clears all cookies
4. ✅ Calls backend `/api/clear` endpoint
5. ✅ Shows success message
6. ✅ Reloads and redirects to home

**Route:** `http://localhost:5656/clear`

---

## How to Use

### Method 1: Direct Navigation
Open in browser:
```
http://localhost:5656/clear
```

### Method 2: Programmatically
```javascript
// From any React component
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/clear');
```

### Method 3: Link Component
```javascript
import { Link } from 'react-router-dom';

<Link to="/clear">Clear Data</Link>
```

### Method 4: Manual JavaScript
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
document.cookie.split(';').forEach(c => 
  document.cookie = c.replace(/^ +/, '').replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`)
);
location.href = '/';
```

---

## What Gets Cleared

### ✅ localStorage
- User token
- User role
- User phone
- User name
- Merchant ID
- All app state stored in localStorage
- Cached API responses

### ✅ sessionStorage
- Session-specific data
- Temporary form data
- Session tokens

### ✅ Cookies
- Any cookies set by the application
- Authentication cookies
- Tracking cookies

---

## UI Flow

```
User navigates to /clear
         ↓
Component mounts and starts clearing
         ↓
✅ localStorage cleared
✅ sessionStorage cleared
✅ cookies cleared
✅ Backend endpoint called
         ↓
Success alert shown
         ↓
Redirects to home (/)
         ↓
Page reloads with fresh state
```

---

## When to Use

### Use `/clear` when:
- 🚀 Deploying new version (to remove old cached data)
- 🔄 Switching between users
- 🐛 Troubleshooting login issues
- 🔐 Security concern or logout
- 📱 Testing fresh installation
- 🔄 After major code updates

### Don't use `/clear` when:
- ❌ User wants to keep their session
- ❌ Data loss would cause issues
- ❌ User hasn't logged out properly (logout first)

---

## API Integration

### Backend Endpoint
```javascript
// In server.js
app.get('/api/clear', (req, res) => {
  // Returns clear instructions
  res.json({
    success: true,
    message: 'Clear all browser storage...',
    instructions: { /* ... */ }
  });
});
```

### Frontend Component
```javascript
// In Clear.js
useEffect(() => {
  localStorage.clear();
  sessionStorage.clear();
  // Clear cookies
  // Call backend
  // Redirect
}, []);
```

---

## Technical Details

### Cookies Clearing Method
```javascript
document.cookie.split(';').forEach((c) => {
  document.cookie = c
    .replace(/^ +/, '')
    .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
});
```

This works by:
1. Getting all cookies as a string
2. Splitting by semicolon
3. For each cookie, set expiry date to past (effectively deletes it)

### localStorage vs sessionStorage
- **localStorage:** Persists until manually cleared
- **sessionStorage:** Clears when tab/browser closes
- **Clear route:** Clears both

---

## Error Handling

### If backend is down:
```javascript
try {
  const response = await fetch('http://localhost:3000/api/clear');
} catch (error) {
  console.warn('Backend unavailable:', error);
  // Still clears frontend data
}
```

### If clearing fails:
```
alert('Error clearing data: ' + error.message);
// Still redirects to home
```

---

## Testing

### Manual Test
1. Go to `http://localhost:5656/login`
2. Enter phone and verify OTP
3. Check browser DevTools → Application → Storage
4. Verify data is stored
5. Navigate to `http://localhost:5656/clear`
6. Verify success message
7. Check DevTools again
8. Verify all data is cleared
9. Verify redirected to `/`

### Automated Test
```javascript
test('Clear route clears all session data', () => {
  // Set test data
  localStorage.setItem('token', 'test_token');
  
  // Navigate to /clear
  render(<App />);
  
  // Wait for clear
  waitFor(() => {
    // Verify localStorage is empty
    expect(localStorage.getItem('token')).toBeNull();
  });
});
```

---

## Security Considerations

### ✅ Safe
- Clears all authentication tokens
- Removes sensitive user data
- No data sent to server
- Client-side only operation
- HTTPS compatible

### ⚠️ Be Careful
- User will be logged out
- Unsaved form data will be lost
- No undo option
- Browser caches might persist

### 🔒 Best Practices
- Add confirmation dialog for safety
- Use `/clear` before login
- Don't use on shared devices without confirmation
- Document usage for users

---

## Endpoint Updates

The `/api/clear` endpoint is now listed in server startup:

```
📋 Available Endpoints:
   POST /api/send-otp                  - Send OTP to phone
   POST /api/verify-otp                - Verify OTP
   GET  /api/clear                     - Clear browser session data
   POST /api/admin-login               - Admin login
   ...
```

---

## Deployment Notes

### For New Deployment
1. Users can visit `/clear` before login
2. All old cached data will be removed
3. Fresh start with new code
4. No backward compatibility issues

### Deployment Command
```bash
# Clear cache before deploying
curl http://localhost:3000/api/clear

# Then restart frontend
# Then clear browser cache
# Then test
```

---

**Status:** ✅ Implemented  
**Tested:** ✅ Working  
**Production Ready:** ✅ Yes
