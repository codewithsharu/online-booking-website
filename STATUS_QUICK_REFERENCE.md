# Quick Reference: Merchant Application Status System

## 📋 Status Values

| Status | Description | Color Theme |
|--------|-------------|-------------|
| `pending` | Application submitted, awaiting admin review | 🟡 Yellow |
| `approved` | Application approved, merchant account active | 🟢 Green |
| `rejected` | Application rejected by admin | 🔴 Red |

## 🔍 Tracking Fields

### Core Status Fields
```javascript
status: "pending" | "approved" | "rejected"
appliedAt: "2026-01-12T04:00:00.000Z"    // Always set
approvedAt: "2026-01-12T05:00:00.000Z"   // Set on approval
rejectedAt: "2026-01-12T05:00:00.000Z"   // Set on rejection
rejectionReason: "Reason text"           // Optional, for rejected apps
merchantId: "MER12345678"                // Generated on approval
```

## 🎯 What Merchants See

### No Application
```
📋 No Application Found
Please submit a merchant application to get started.
[Apply as Merchant Button]
```

### Pending Status
```
⏳ Application Under Review
Status: PENDING
Your merchant application is being reviewed by our admin team.

Applied on: Jan 12, 2026, 4:00 AM

Application Details:
- Business Name: ABC Shop
- Owner Name: John Doe
- Category: Barber
- Location: Area Name, 123456
```

### Approved Status
```
✅ Approved Merchant
Status: APPROVED
Merchant ID: MER12345678
Business Name: ABC Shop

Applied: Jan 12, 2026
Approved: Jan 12, 2026

[Full Dashboard with Profile Editor]
```

### Rejected Status
```
❌ Application Rejected
Status: REJECTED
Unfortunately, your merchant application was not approved.

Reason: Incomplete business information
Rejected on: Jan 12, 2026, 5:00 AM
```

## 🛠️ Admin Actions

### View Pending Applications
```
GET /api/admin/merchants/pending
→ Returns array of all pending applications
```

### Approve Application
```
POST /api/admin/merchants/approve
Body: { applicationId: "123456789" }

Result:
✓ status → "approved"
✓ approvedAt → current timestamp
✓ merchantId → generated (MER + timestamp)
✓ user role → "merchant"
```

### Reject Application
```
POST /api/admin/merchants/reject
Body: { 
  applicationId: "123456789",
  reason: "Incomplete information"
}

Result:
✓ status → "rejected"
✓ rejectedAt → current timestamp
✓ rejectionReason → provided reason
```

## 📊 Status Query (Merchant Dashboard)

```javascript
GET /api/merchant/status
Headers: { Authorization: Bearer <token> }

Response:
{
  hasApplication: true,
  status: "pending",
  merchantId: null,
  application: {
    id: "123456789",
    businessName: "ABC Shop",
    status: "pending",
    appliedAt: "2026-01-12T04:00:00.000Z",
    approvedAt: null,
    rejectedAt: null,
    rejectionReason: null
    // ... other fields
  }
}
```

## ✅ Benefits of This System

1. **Complete Traceability**
   - Every status change has a timestamp
   - Rejection reasons are recorded
   - Full audit trail available

2. **Clear Communication**
   - Merchants know exactly where they stand
   - Visual indicators (colors, icons) improve UX
   - Contextual information shown for each status

3. **Admin Efficiency**
   - Easy to filter pending applications
   - Actions are logged
   - Status changes are trackable

4. **Future-Proof**
   - Ready for analytics (approval time, rejection rate)
   - Can add more statuses if needed
   - Timestamps enable SLA tracking

## 🔄 Complete Flow Example

```
1. User submits application
   → status = "pending"
   → appliedAt = "2026-01-12T04:00:00Z"

2. Admin reviews and approves
   → status = "approved"
   → approvedAt = "2026-01-12T05:00:00Z"
   → merchantId = "MER12345678"
   → user.role = "merchant"

3. Merchant logs in
   → Sees green "Approved" banner
   → Can access full dashboard
   → Can manage profile and services
```

## 🎨 Color Scheme Reference

```css
/* Pending */
background: #fff3cd
border: #ffc107
text: #ff9800

/* Approved */
background: #d4edda
border: #28a745
text: #155724

/* Rejected */
background: #f8d7da
border: #dc3545
text: #721c24

/* No Application */
background: #fff3cd
border: #ffc107
```

---
**Version:** 2.0  
**Last Updated:** January 12, 2026  
**Status:** ✅ Production Ready
