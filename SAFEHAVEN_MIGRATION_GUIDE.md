# SafeHaven MFB Migration Guide

## Overview
This guide will help you migrate from Monnify to SafeHaven MFB for payment processing in your application.

## Current Setup (Monnify)
Your app currently uses:
- **Monnify** for virtual account creation and payment collection
- **Monnify Disbursement** for withdrawals
- **Webhook integration** for real-time payment notifications
- **Vercel** for hosting
- **Custom domain** on Ghost (DNS)

## SafeHaven MFB Setup

### Step 1: Get SafeHaven API Credentials

1. **Create SafeHaven Account**
   - Production: https://online.safehavenmfb.com/dashboard
   - Sandbox (Testing): https://online.sandbox.safehavenmfb.com

2. **Get API Credentials**
   - Login to your SafeHaven dashboard
   - Navigate to Settings → API Keys
   - Copy your:
     - Client ID
     - Client Secret
     - Account ID (your main SafeHaven account)

3. **API Endpoints**
   - Production: `https://api.safehavenmfb.com`
   - Sandbox: `https://api.sandbox.safehavenmfb.com`

### Step 2: Update Environment Variables

Add these to your Vercel project (replace Monnify variables):

```env
# SafeHaven API Configuration
SAFEHAVEN_CLIENT_ID=your_client_id_here
SAFEHAVEN_CLIENT_SECRET=your_client_secret_here
SAFEHAVEN_ACCOUNT_ID=your_account_id_here
SAFEHAVEN_BASE_URL=https://api.safehavenmfb.com
SAFEHAVEN_WEBHOOK_SECRET=your_webhook_secret_here

# Keep these for backward compatibility during migration
# MONNIFY_API_KEY=...
# MONNIFY_SECRET_KEY=...
# MONNIFY_CONTRACT_CODE=...
# MONNIFY_BASE_URL=...
```

**How to add to Vercel:**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable for Production, Preview, and Development
5. Redeploy your application

### Step 3: Create SafeHaven Integration Library

Create a new file: `src/lib/safehaven.ts`

This will handle:
- OAuth authentication
- Virtual account creation (sub-accounts)
- Transaction verification
- Transfer/disbursement

### Step 4: Update Wallet Service

Modify `src/lib/wallet-service.ts` to use SafeHaven instead of Monnify for:
- Creating virtual accounts for users
- Checking account balances
- Processing transactions

### Step 5: Create SafeHaven Webhook Handler

Create: `src/app/api/webhooks/safehaven/route.ts`

SafeHaven will send webhooks for:
- Successful deposits (credit notifications)
- Failed transactions
- Transfer status updates

### Step 6: Update Withdrawal Logic

Modify `src/app/api/wallet/withdraw/route.ts` to use SafeHaven's transfer API instead of Monnify disbursement.

### Step 7: Configure Webhook URL

In your SafeHaven dashboard:
1. Go to Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/safehaven`
3. Select events to receive:
   - Account credited
   - Transfer completed
   - Transfer failed

### Step 8: DNS Configuration (Ghost Domain)

If your domain is managed by Ghost:
1. Ensure your domain points to Vercel
2. Add these DNS records (if not already set):
   ```
   Type: CNAME
   Name: @ (or www)
   Value: cname.vercel-dns.com
   ```

### Step 9: Testing Strategy

1. **Use Sandbox First**
   - Set `SAFEHAVEN_BASE_URL=https://api.sandbox.safehavenmfb.com`
   - Test account creation
   - Test deposits (use sandbox test accounts)
   - Test withdrawals

2. **Parallel Testing**
   - Keep Monnify active
   - Create new test users with SafeHaven
   - Compare results

3. **Gradual Migration**
   - New users → SafeHaven
   - Existing users → Keep Monnify (or migrate gradually)

### Step 10: Go Live Checklist

- [ ] SafeHaven production credentials added to Vercel
- [ ] Webhook URL configured in SafeHaven dashboard
- [ ] Test deposit to virtual account
- [ ] Test withdrawal to bank account
- [ ] Monitor logs for errors
- [ ] Update user documentation (if any)

## Key Differences: Monnify vs SafeHaven

| Feature | Monnify | SafeHaven |
|---------|---------|-----------|
| **Authentication** | Basic Auth (API Key + Secret) | OAuth 2.0 (Client Credentials) |
| **Virtual Accounts** | Reserved Accounts | Sub-Accounts |
| **Account Creation** | `/api/v2/bank-transfer/reserved-accounts` | `/accounts/sub-account` |
| **Webhooks** | HMAC-SHA512 signature | Webhook secret verification |
| **Transfers** | Disbursement API | Transfer API |
| **Amount Format** | NGN (Naira) | Kobo (1 NGN = 100 kobo) |

## Migration Timeline

**Week 1: Setup & Development**
- Get SafeHaven credentials
- Create integration library
- Update wallet service
- Create webhook handler

**Week 2: Testing**
- Sandbox testing
- Create test accounts
- Test all flows (deposit, withdraw, webhook)

**Week 3: Deployment**
- Add production credentials to Vercel
- Deploy to production
- Monitor for 48 hours
- Gradual user migration

**Week 4: Complete Migration**
- Migrate all users to SafeHaven
- Remove Monnify dependencies (optional - keep for backup)

## Support & Resources

- **SafeHaven API Docs**: https://safehavenmfb.readme.io/reference/introduction
- **SafeHaven Support**: Contact through dashboard
- **Postman Collection**: Available in SafeHaven docs

## Next Steps

Would you like me to:
1. ✅ Create the SafeHaven integration library (`src/lib/safehaven.ts`)
2. ✅ Update the wallet service to use SafeHaven
3. ✅ Create the SafeHaven webhook handler
4. ✅ Update withdrawal API to use SafeHaven

Let me know and I'll implement the code changes!
