# Forgot Password Feature - Complete Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Features](#features)
4. [Architecture](#architecture)
5. [User Flow](#user-flow)
6. [Technical Details](#technical-details)
7. [Security](#security)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Overview

Complete forgot password implementation with OTP verification, strong password requirements, and mobile-responsive design.

### Key Features
- ✅ OTP-based email verification
- ✅ Strong password requirements (alphanumeric + symbols)
- ✅ Mobile-responsive design
- ✅ Real-time password validation
- ✅ Secure token management
- ✅ Email notifications
- ✅ Rate limiting

## Quick Start

### For Users
1. Click "Forgot password?" on sign-in page
2. Enter your email
3. Check email for 6-digit code
4. Enter code to verify
5. Create new password
6. Sign in with new password

### For Developers
```bash
# Run tests
npx tsx scripts/test-forgot-password.ts

# Start development server
npm run dev

# Test the flow
# Navigate to http://localhost:3000
# Click "Forgot password?" and test
```

## Features

### Password Requirements
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one symbol (!@#$%^&*(),.?":{}|<>_-+=[]\/`~)

### Security Features
- OTP expires in 10 minutes
- Reset token expires in 1 hour
- Rate limiting prevents abuse
- Tokens consumed after use
- Email privacy maintained
- Confirmation emails sent

### User Experience
- Real-time password validation
- Visual feedback on requirements
- Show/hide password toggles
- Resend OTP functionality
- Mobile-optimized interface
- Smooth animations

## Architecture

### Components
```
src/components/dashboard/
├── ForgotPasswordModal.tsx    # Email + OTP verification
└── ResetPasswordModal.tsx     # Password reset with validation
```

### API Routes
```
src/app/api/auth/
├── forgot-password/route.ts   # Send OTP
├── verify-reset-otp/route.ts  # Verify OTP
└── reset-password/route.ts    # Update password
```

### Database Models
```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  email     String
  token     String   @unique
  expires   DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

## User Flow

```
Sign In → Forgot Password? → Enter Email → Receive OTP
    ↓
Check Email → Enter OTP → Verify → Reset Password
    ↓
Create Password → Confirm → Success → Sign In
```

## Technical Details

### API Endpoints

#### 1. Forgot Password
```typescript
POST /api/auth/forgot-password
Body: { email: string }
Response: { success: boolean, message: string }
```

#### 2. Verify Reset OTP
```typescript
POST /api/auth/verify-reset-otp
Body: { email: string, token: string }
Response: { success: boolean, resetToken: string }
```

#### 3. Reset Password
```typescript
POST /api/auth/reset-password
Body: { email: string, token: string, password: string }
Response: { success: boolean, message: string }
```

### Password Validation

#### Client-Side
```typescript
const hasMinLength = password.length >= 8
const hasUpperCase = /[A-Z]/.test(password)
const hasLowerCase = /[a-z]/.test(password)
const hasNumber = /[0-9]/.test(password)
const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)
```

#### Server-Side
```typescript
z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase')
  .regex(/[a-z]/, 'Must contain lowercase')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/, 'Must contain symbol')
```

## Security

### Token Management
- **OTP**: 6-digit code, 10-minute expiry
- **Reset Token**: 32-byte hex, 1-hour expiry
- **Consumption**: Tokens deleted after use

### Rate Limiting
- Max 10 OTP requests per hour per email
- 60-second delay between requests
- Inherited from existing OTP system

### Email Privacy
- Doesn't reveal if email exists
- Returns success message regardless
- Prevents user enumeration

### Password Security
- Bcrypt hashing with 12 rounds
- Server-side validation
- Client-side validation
- Real-time feedback

## Testing

### Automated Tests
```bash
npx tsx scripts/test-forgot-password.ts
```

### Manual Testing
1. **Happy Path**
   - Enter valid email
   - Receive OTP
   - Enter correct OTP
   - Create valid password
   - Sign in successfully

2. **Error Cases**
   - Invalid email format
   - Expired OTP
   - Invalid OTP
   - Weak password
   - Mismatched passwords
   - Expired reset token

3. **Edge Cases**
   - Non-existent email
   - Multiple OTP requests
   - Rate limiting
   - Network errors

### Test Credentials
```
Email: test@example.com
Password: Test123!@#
```

## Deployment

### Prerequisites
```bash
# Environment variables
RESEND_API_KEY=your_api_key
NEXTAUTH_URL=your_app_url
DATABASE_URL=your_database_url
```

### Steps
```bash
# 1. Generate Prisma client
npx prisma generate

# 2. Run migrations
npx prisma migrate deploy

# 3. Build application
npm run build

# 4. Deploy
# (Platform-specific)
```

### Post-Deployment
1. Test forgot password flow
2. Verify email delivery
3. Check error logs
4. Monitor metrics

## Troubleshooting

### OTP Not Received
**Symptoms**: User doesn't receive OTP email

**Solutions**:
1. Check spam/junk folder
2. Verify RESEND_API_KEY is set
3. Check email service status
4. Review email logs
5. Test with different email provider

### OTP Expired
**Symptoms**: "Invalid or expired verification code"

**Solutions**:
1. Request new OTP
2. Complete within 10 minutes
3. Check system time sync

### Password Validation Fails
**Symptoms**: Can't submit password

**Solutions**:
1. Check all validation indicators
2. Ensure all requirements met
3. Verify passwords match
4. Try different password

### Reset Token Expired
**Symptoms**: "Reset token has expired"

**Solutions**:
1. Start over from forgot password
2. Complete within 1 hour
3. Don't refresh page during flow

### Email Delivery Issues
**Symptoms**: Emails not being sent

**Solutions**:
1. Verify RESEND_API_KEY
2. Check domain verification
3. Review Resend dashboard
4. Check rate limits
5. Test with curl/Postman

## Documentation Files

- `FORGOT_PASSWORD_IMPLEMENTATION.md` - Technical implementation details
- `FORGOT_PASSWORD_USER_GUIDE.md` - User-facing guide
- `FORGOT_PASSWORD_FLOW_DIAGRAM.md` - Visual flow diagrams
- `FORGOT_PASSWORD_DEPLOYMENT_CHECKLIST.md` - Deployment checklist
- `FORGOT_PASSWORD_SUMMARY.md` - Quick summary
- `FORGOT_PASSWORD_README.md` - This file

## Support

### For Users
- Check user guide: `FORGOT_PASSWORD_USER_GUIDE.md`
- Contact support via chat widget
- Email: support@wtxonline.com

### For Developers
- Review implementation: `FORGOT_PASSWORD_IMPLEMENTATION.md`
- Check flow diagram: `FORGOT_PASSWORD_FLOW_DIAGRAM.md`
- Run tests: `npx tsx scripts/test-forgot-password.ts`

## Contributing

### Adding Features
1. Follow existing patterns
2. Update documentation
3. Add tests
4. Submit PR

### Reporting Issues
1. Check existing issues
2. Provide reproduction steps
3. Include error logs
4. Specify environment

## License

Same as main project

## Changelog

### Version 1.0.0 (2026-02-02)
- Initial implementation
- OTP-based verification
- Strong password requirements
- Mobile-responsive design
- Email notifications
- Security features

## Credits

Developed by: [Your Team]
Date: February 2, 2026
Version: 1.0.0

---

**Status**: ✅ Production Ready
**Last Updated**: February 2, 2026
**Maintained By**: Development Team
