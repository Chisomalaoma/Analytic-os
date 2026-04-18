# Forgot Password Not Working - Fix Required

## Issue
The forgot password functionality is not working because the **RESEND_API_KEY** environment variable is missing.

## Root Cause
The application uses Resend (https://resend.com) to send password reset emails, but the API key is not configured in the environment variables.

## Solution
You need to add the Resend API key to your environment variables:

### 1. Get Resend API Key
- Go to https://resend.com
- Sign in or create an account
- Navigate to API Keys section
- Create a new API key or copy your existing one

### 2. Add to Local Environment
Add this line to your `.env` file:
```
RESEND_API_KEY=re_your_api_key_here
```

### 3. Add to Vercel Environment Variables
1. Go to https://vercel.com/xt-es-limited/analytic-os/settings/environment-variables
2. Add a new variable:
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_your_api_key_here` (your actual Resend API key)
   - **Environment:** Production, Preview, Development (select all)
3. Save and redeploy

## How Forgot Password Works
1. User clicks "Forgot password?" on sign-in page
2. User enters their email
3. System generates a 6-digit OTP code
4. System sends OTP via email using Resend
5. User enters OTP to verify
6. User is redirected to reset password page
7. User sets new password

## Current Status
- ✅ All API endpoints are correctly implemented
- ✅ Frontend components are working
- ✅ Database schema is correct
- ❌ Email sending is failing due to missing RESEND_API_KEY

## Alternative (Temporary)
If you don't want to use Resend, you can:
1. Use a different email service (SendGrid, Mailgun, etc.)
2. Update `src/lib/auth/email.ts` to use your preferred service
3. Or temporarily disable email verification for testing (not recommended for production)
