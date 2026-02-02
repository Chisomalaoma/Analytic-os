# Forgot Password Flow Diagram

## Complete User Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                         SIGN IN PAGE                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Email: [________________]                              │    │
│  │  Password: [________________]  👁                       │    │
│  │                                                          │    │
│  │  [Forgot password?] ← Click here                        │    │
│  │                                                          │    │
│  │  [Sign In]                                              │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   FORGOT PASSWORD MODAL                          │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Reset Password                                         │    │
│  │  Enter your email to receive a reset code              │    │
│  │                                                          │    │
│  │  Email Address: [________________]                      │    │
│  │                                                          │    │
│  │  [Send Reset Code]                                      │    │
│  │                                                          │    │
│  │  Remember your password? Sign In                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    API: POST /api/auth/forgot-password
                    { email: "user@example.com" }
                              ↓
                    📧 Email sent with 6-digit OTP
                    (Expires in 10 minutes)
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   VERIFY OTP MODAL                               │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Verify Your Identity                                   │    │
│  │  Enter the code sent to user@example.com               │    │
│  │                                                          │    │
│  │  Verification Code: [_][_][_][_][_][_]                 │    │
│  │                                                          │    │
│  │  [Verify Code]                                          │    │
│  │                                                          │    │
│  │  Did not receive the code? Resend                       │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    API: POST /api/auth/verify-reset-otp
                    { email: "user@example.com", token: "123456" }
                              ↓
                    ✅ OTP Verified
                    Reset Token Generated (1 hour expiry)
                              ↓
                    Redirect to /reset-password?token=xxx&email=xxx
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                   RESET PASSWORD PAGE                            │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Create New Password                                    │    │
│  │  Enter a strong password for your account              │    │
│  │                                                          │    │
│  │  New Password: [________________] 👁                    │    │
│  │  Confirm Password: [________________] 👁                │    │
│  │                                                          │    │
│  │  Password must contain:                                 │    │
│  │  ✓ At least 8 characters                               │    │
│  │  ✓ One uppercase letter (A-Z)                          │    │
│  │  ✓ One lowercase letter (a-z)                          │    │
│  │  ✓ One number (0-9)                                    │    │
│  │  ✓ One symbol (!@#$%^&*...)                           │    │
│  │  ✓ Passwords match                                     │    │
│  │                                                          │    │
│  │  [Reset Password]                                       │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    API: POST /api/auth/reset-password
                    { email: "user@example.com", 
                      token: "xxx", 
                      password: "NewP@ssw0rd!" }
                              ↓
                    ✅ Password Updated
                    📧 Confirmation email sent
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SUCCESS SCREEN                              │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                                                          │    │
│  │                    ✅                                   │    │
│  │                                                          │    │
│  │         Password Reset Successful!                      │    │
│  │         Redirecting to sign in...                       │    │
│  │                                                          │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
                    Auto-redirect after 2 seconds
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         SIGN IN PAGE                             │
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Email: [user@example.com]                              │    │
│  │  Password: [NewP@ssw0rd!]  👁                          │    │
│  │                                                          │    │
│  │  [Sign In] ← Sign in with new password                 │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Technical Flow

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │
       │ 1. Click "Forgot password?"
       ↓
┌──────────────────────┐
│ ForgotPasswordModal  │
│ (Email Input)        │
└──────┬───────────────┘
       │
       │ 2. POST /api/auth/forgot-password
       ↓
┌──────────────────────┐
│   API Route          │
│ - Validate email     │
│ - Generate OTP       │
│ - Store in DB        │
│ - Send email         │
└──────┬───────────────┘
       │
       │ 3. OTP sent to email
       ↓
┌──────────────────────┐
│ ForgotPasswordModal  │
│ (OTP Input)          │
└──────┬───────────────┘
       │
       │ 4. POST /api/auth/verify-reset-otp
       ↓
┌──────────────────────┐
│   API Route          │
│ - Verify OTP         │
│ - Generate token     │
│ - Store in DB        │
│ - Return token       │
└──────┬───────────────┘
       │
       │ 5. Redirect with token
       ↓
┌──────────────────────┐
│ ResetPasswordModal   │
│ (Password Input)     │
└──────┬───────────────┘
       │
       │ 6. POST /api/auth/reset-password
       ↓
┌──────────────────────┐
│   API Route          │
│ - Verify token       │
│ - Validate password  │
│ - Hash password      │
│ - Update user        │
│ - Send confirmation  │
└──────┬───────────────┘
       │
       │ 7. Success + redirect
       ↓
┌──────────────────────┐
│   Sign In Page       │
└──────────────────────┘
```

## Database Flow

```
┌─────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  VerificationToken                                       │
│  ┌────────────────────────────────────────────────┐    │
│  │ id: "cuid123"                                   │    │
│  │ identifier: "user@example.com"                  │    │
│  │ token: "123456"                                 │    │
│  │ expires: 2026-02-02T13:27:00Z                  │    │
│  └────────────────────────────────────────────────┘    │
│                    ↓ (After OTP verified)               │
│                    ↓ (Token deleted)                    │
│                                                          │
│  PasswordResetToken                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │ id: "cuid456"                                   │    │
│  │ email: "user@example.com"                       │    │
│  │ token: "abc123def456..."                        │    │
│  │ expires: 2026-02-02T14:17:00Z                  │    │
│  │ used: false                                     │    │
│  └────────────────────────────────────────────────┘    │
│                    ↓ (After password reset)             │
│                    ↓ (Token deleted)                    │
│                                                          │
│  User                                                    │
│  ┌────────────────────────────────────────────────┐    │
│  │ id: "user123"                                   │    │
│  │ email: "user@example.com"                       │    │
│  │ passwordHash: "$2a$12$..." ← Updated           │    │
│  │ updatedAt: 2026-02-02T13:17:00Z                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Email Flow

```
┌─────────────────────────────────────────────────────────┐
│                    EMAIL SEQUENCE                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  1. Password Reset OTP Email                             │
│  ┌────────────────────────────────────────────────┐    │
│  │ From: WTXONLINE <support@wtxonline.com>        │    │
│  │ To: user@example.com                            │    │
│  │ Subject: Reset your AnalytiOS password          │    │
│  │                                                  │    │
│  │ Verify your email                               │    │
│  │ Enter this code to reset your password:         │    │
│  │                                                  │    │
│  │         123456                                   │    │
│  │                                                  │    │
│  │ This code expires in 10 minutes.                │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  2. Password Change Confirmation Email                   │
│  ┌────────────────────────────────────────────────┐    │
│  │ From: WTXONLINE <support@wtxonline.com>        │    │
│  │ To: user@example.com                            │    │
│  │ Subject: Your AnalytiOS password has been       │    │
│  │          changed                                │    │
│  │                                                  │    │
│  │ Password changed                                │    │
│  │ Your password has been changed successfully.    │    │
│  │                                                  │    │
│  │ If you didn't make this change, please          │    │
│  │ contact support immediately.                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Mobile Responsive Flow

```
┌─────────────────┐
│  Mobile Device  │
│                 │
│  ┌───────────┐ │
│  │ Sign In   │ │
│  │           │ │
│  │ Email     │ │
│  │ [_______] │ │
│  │           │ │
│  │ Password  │ │
│  │ [_______] │ │
│  │           │ │
│  │ Forgot?   │ │ ← Tap
│  │           │ │
│  │ [Sign In] │ │
│  └───────────┘ │
└─────────────────┘
        ↓
┌─────────────────┐
│  Mobile Modal   │
│                 │
│  ┌───────────┐ │
│  │ Reset     │ │
│  │ Password  │ │
│  │           │ │
│  │ Email     │ │
│  │ [_______] │ │
│  │           │ │
│  │ [Send]    │ │
│  └───────────┘ │
└─────────────────┘
        ↓
   (Same flow as desktop,
    optimized for touch)
```

## Legend

- `[Button]` - Clickable button
- `[_____]` - Input field
- `👁` - Show/hide password toggle
- `✓` - Validation check (green when met)
- `📧` - Email sent
- `✅` - Success state
- `→` - User action
- `↓` - System flow

---

**Note**: All modals are dismissible and include proper error handling at each step.
