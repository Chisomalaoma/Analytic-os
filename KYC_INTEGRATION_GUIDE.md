# KYC Integration Guide - Quick Start

## 🚀 How to Integrate New KYC Components

### Step 1: Update Header Component

**File**: `src/common/Header.tsx`

Replace the old KYC modal import with the new one:

```tsx
// OLD - Remove this
import { SmileIDKYCModal } from '@/components/dashboard/SmileIDKYCModal'

// NEW - Add these
import { ImprovedKYCModal } from '@/components/dashboard/ImprovedKYCModal'
import { KYCStatusBanner } from '@/components/dashboard/KYCStatusBanner'
```

Then update the modal component:

```tsx
// OLD - Replace this
<SmileIDKYCModal
  open={showKYCModal}
  onClose={() => setShowKYCModal(false)}
  onSuccess={handleKYCSuccess}
/>

// NEW - With this
<ImprovedKYCModal
  open={showKYCModal}
  onClose={() => setShowKYCModal(false)}
  onSuccess={handleKYCSuccess}
/>
```

---

### Step 2: Add Status Banner to Dashboard Pages

Add the KYC status banner to pages where users need to see their verification status.

#### Portfolio Page Example:

```tsx
// src/app/portfolio/page.tsx or similar
import { KYCStatusBanner } from '@/components/dashboard/KYCStatusBanner'
import { ImprovedKYCModal } from '@/components/dashboard/ImprovedKYCModal'

export default function PortfolioPage() {
  const [showKYCModal, setShowKYCModal] = useState(false)

  return (
    <div>
      {/* Add KYC Status Banner at the top */}
      <KYCStatusBanner onStartKYC={() => setShowKYCModal(true)} />
      
      {/* Your existing portfolio content */}
      <PortfolioSummary />
      <PortfolioTable />
      
      {/* KYC Modal */}
      <ImprovedKYCModal
        open={showKYCModal}
        onClose={() => setShowKYCModal(false)}
        onSuccess={() => {
          setShowKYCModal(false)
          // Optionally refresh data
          window.location.reload()
        }}
      />
    </div>
  )
}
```

#### Dashboard Page Example:

```tsx
// src/app/dashboard/page.tsx or similar
import { KYCStatusBanner } from '@/components/dashboard/KYCStatusBanner'

export default function DashboardPage() {
  const [showKYCModal, setShowKYCModal] = useState(false)

  return (
    <div>
      {/* Add banner here */}
      <KYCStatusBanner onStartKYC={() => setShowKYCModal(true)} />
      
      {/* Dashboard content */}
      <DashboardStats />
      <TokenList />
    </div>
  )
}
```

---

### Step 3: Add to Wallet/Withdrawal Pages

For pages where KYC is required for actions (like withdrawals):

```tsx
// src/app/wallet/page.tsx or withdrawal modal
import { KYCStatusBanner } from '@/components/dashboard/KYCStatusBanner'

export default function WalletPage() {
  const [showKYCModal, setShowKYCModal] = useState(false)

  return (
    <div>
      {/* Show banner prominently */}
      <KYCStatusBanner onStartKYC={() => setShowKYCModal(true)} />
      
      {/* Wallet content */}
      <WalletBalance />
      <WithdrawButton />
    </div>
  )
}
```

---

## 📱 Banner Behavior by Status

### Status: `pending`
- **Shows**: Yellow banner
- **Message**: "Complete Your KYC Verification"
- **Action**: "Start Verification" button
- **When**: User hasn't started KYC yet

### Status: `in_progress`
- **Shows**: Blue banner with pulse animation
- **Message**: "KYC Verification Pending - Your verification is being reviewed. This usually takes 24-48 hours."
- **Action**: None (just informational)
- **When**: User submitted KYC, waiting for approval

### Status: `verified`
- **Shows**: Nothing (banner hidden)
- **When**: User is verified, no action needed

### Status: `rejected`
- **Shows**: Red banner
- **Message**: "KYC Verification Failed" + rejection reason
- **Action**: "Try Again" button
- **When**: Verification was rejected by SmileID

### Status: `expired`
- **Shows**: Orange banner
- **Message**: "KYC Verification Expired"
- **Action**: "Renew Verification" button
- **When**: Verification expired and needs renewal

---

## 🎥 Video Recording Features

### What Users Will See:

1. **Camera Access Request**
   - Browser prompts for camera permission
   - User must allow to proceed

2. **Live Camera Preview**
   - Real-time video feed
   - User sees themselves before recording

3. **Recording Interface**
   - "Start Recording" button
   - Timer showing seconds (0-10s)
   - Red pulse indicator during recording
   - Auto-stops at 10 seconds

4. **Video Preview**
   - Playback of recorded video
   - "Retake" button if not satisfied
   - "Continue" button to proceed

### Instructions to Show Users:

```
📹 Liveness Check - Video Recording

Record a 5-10 second video of your face:
1. Look directly at the camera
2. Slowly turn your head left
3. Slowly turn your head right
4. Keep your face clearly visible
```

---

## 🔧 Testing Checklist

### Desktop Testing:
- [ ] Camera access works
- [ ] Video recording starts/stops correctly
- [ ] Timer displays properly
- [ ] Video preview plays
- [ ] Retake functionality works
- [ ] Video submits successfully

### Mobile Testing:
- [ ] Camera access works on iOS
- [ ] Camera access works on Android
- [ ] Front camera is used
- [ ] Recording works smoothly
- [ ] Video quality is acceptable
- [ ] Submission works on mobile

### Status Banner Testing:
- [ ] Pending status shows yellow banner
- [ ] In-progress status shows blue banner
- [ ] Rejected status shows red banner with reason
- [ ] Verified status hides banner
- [ ] "Start Verification" button opens modal
- [ ] "Try Again" button opens modal

### End-to-End Testing:
- [ ] Submit KYC with video
- [ ] Status changes to "in_progress"
- [ ] Blue banner appears
- [ ] Webhook updates status (simulate)
- [ ] Approved: Banner disappears
- [ ] Rejected: Red banner shows reason

---

## 🐛 Troubleshooting

### Camera Not Working:
- Check browser permissions
- Ensure HTTPS (camera requires secure context)
- Try different browser
- Check if camera is being used by another app

### Video Not Recording:
- Check MediaRecorder support
- Verify WebM codec support
- Check console for errors
- Try different video format

### Status Not Updating:
- Check API endpoint `/api/kyc/status`
- Verify user is authenticated
- Check database for KYC status
- Verify webhook is receiving callbacks

### Banner Not Showing:
- Check if component is imported
- Verify `onStartKYC` prop is passed
- Check console for errors
- Verify API returns status correctly

---

## 📞 Support

If you encounter issues:

1. Check browser console for errors
2. Verify API endpoints are working
3. Check database for user KYC status
4. Review SmileID webhook logs
5. Test with different browsers/devices

---

## ✅ Quick Checklist

Before deploying:

- [ ] Import new components in Header
- [ ] Add KYCStatusBanner to dashboard
- [ ] Add KYCStatusBanner to portfolio
- [ ] Add KYCStatusBanner to wallet
- [ ] Test video recording on desktop
- [ ] Test video recording on mobile
- [ ] Test all status states
- [ ] Test rejection reason display
- [ ] Verify webhook updates work
- [ ] Test complete user flow

---

## 🎉 You're Done!

The new KYC system is now integrated with:
- ✅ Real-time video recording
- ✅ Clear status indicators
- ✅ Rejection reason display
- ✅ Professional user experience
