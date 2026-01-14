# CSS File Organization

## Overview
The CSS has been reorganized into separate, independent files for better maintainability and scalability. Each component now has its own CSS file.

## File Structure

### 1. **index.css** (Global Styles)
- **Location**: `frontend/src/index.css`
- **Purpose**: Global application styles (fonts, reset, general containers)
- **Contains**:
  - Font imports
  - Global element resets (*reset)
  - Body styling (background, font-family)
  - Common container/page styles
  - Utility styles for other pages

### 2. **Login.css** (Login Component Styles)
- **Location**: `frontend/src/Login.css`
- **Purpose**: All styles specific to the Login component
- **Contains**:
  - `.login-wrapper` - Main login container
  - `.login-container` - Login form container
  - `.login-form` - Form styling
  - `.login-hero` - Hero image styling
  - `.login-title` - Title styling
  - Phone input styles (`.phone-input-group`, `.country-code`, `.phone-input`)
  - Checkbox styles (`.checkbox-label`)
  - OTP input styles (`.otp-input`, `.otp-input-wrapper`, `.otp-subtitle`)
  - Submit button styles (`.submit-btn`)
  - Success verification styles (`.success-icon`, `.check-circle`, `.check-path`)
  - Error message styles (`.error-msg`)
  - Resend OTP styles (`.resend-row`, `.resend-link-btn`, `.resend-timer`)
  - Footer/policy link styles
  - Fade-in animation keyframes
  - Mobile responsive styles (@media queries)
- **Imported In**: `Login.js`

### 3. **SimpleCaptcha.css** (CAPTCHA Component Styles)
- **Location**: `frontend/src/SimpleCaptcha.css`
- **Purpose**: All styles specific to the SimpleCaptcha component
- **Contains**:
  - `.captcha-container` - Main CAPTCHA container
  - `.captcha-label` - CAPTCHA instruction text
  - `.captcha-wrapper` - Flex wrapper for canvas and refresh button
  - `.captcha-box` - Canvas container
  - `.captcha-canvas` - Canvas element styling
  - `.captcha-refresh-btn` - Refresh button styling
  - `.captcha-input` - CAPTCHA input field
  - `.captcha-verified` - Verified state container
  - `.checkmark-circle` - Checkmark circle styling
  - `.checkmark` - SVG checkmark styling
  - `.checkmark-circle-anim` - Checkmark circle animation
  - `.checkmark-check` - Checkmark path animation
  - `.verified-text` - Verified text styling
  - Animation keyframes (`stroke`, `scaleIn`, `fadeInScale`)
- **Imported In**: `SimpleCaptcha.js`

## Import Structure

```
index.js
├── index.css (global styles + Ant Design reset)
└── Login.js
    ├── Login.css (component-specific styles)
    ├── SimpleCaptcha.js
    │   └── SimpleCaptcha.css (component-specific styles)
    └── Ant Design components
```

## Benefits of This Organization

✅ **Modularity**: Each component's styles are isolated and independent
✅ **Maintainability**: Easy to find and update component styles
✅ **Scalability**: New components can have their own CSS files
✅ **Clarity**: No CSS conflicts between components
✅ **Performance**: Unused component styles won't load if component isn't used
✅ **Reusability**: Component CSS travels with its component

## How to Add New Components

When adding a new component:

1. Create component file: `MyComponent.js`
2. Create styles file: `MyComponent.css`
3. Import styles at the top of component:
   ```javascript
   import './MyComponent.css';
   ```
4. Use CSS class names in your component's JSX

## Current CSS File Sizes (Approximate)

- `index.css`: ~3KB (global styles)
- `Login.css`: ~18KB (login component)
- `SimpleCaptcha.css`: ~3.5KB (captcha component)
- **Total**: ~24.5KB (compared to ~25KB in single file)
