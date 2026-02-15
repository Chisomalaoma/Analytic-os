# Quick Switch Guide: Monnify → SafeHaven

## 🚀 3-Step Setup

### Step 1: Get SafeHaven Credentials
1. Login: https://online.safehavenmfb.com/dashboard
2. Go to: Settings → API Keys
3. Copy:
   - Client ID
   - Client Secret  
   - Account ID (your main account number)

### Step 2: Add to Vercel
Go to: https://vercel.com/[your-project]/settings/environment-variables

Add these 6 variables:

| Variable | Value | Example |
|----------|-------|---------|
| `PAYMENT_PROVIDER` | `safehaven` | `safehaven` |
| `SAFEHAVEN_CLIENT_ID` | Your Client ID | `abc123xyz` |
| `SAFEHAVEN_CLIENT_SECRET` | Your Client Secret | `secret_key_here` |
| `SAFEHAVEN_ACCOUNT_ID` | Your Account ID | `1234567890` |
| `SAFEHAVEN_BASE_URL` | API URL | `https://api.safehavenmfb.com` |
| `SAFEHAVEN_WEBHOOK_SECRET` | Webhook Secret | `webhook_secret_here` |

**Important:** Select all three environments:
- ✅ Production
- ✅ Preview  
- ✅ Development

### Step 3: Configure Webhook
1. In SafeHaven dashboard: Settings → Webhooks
2. Add webhook URL: `https://yourdomain.com/api/webhooks/safehaven`
3. Select events:
   - ✅ Account Credited
   - ✅ Transfer Successful
   - ✅ Transfer Failed
4. Save webhook secret to `SAFEHAVEN_WEBHOOK_SECRET` in Vercel

## ✅ Deploy & Test

### Deploy
```bash
# Vercel will auto-deploy when you save env variables
# Or manually trigger:
vercel --prod
```

### Test
1. Create a new user account
2. Check wallet creation in logs
3. Fund wallet (test deposit)
4. Try withdrawal

### Verify Logs
Look for:
```
[PAYMENT-PROVIDER] Using safehaven to create account
[SafeHaven Webhook] Received notification
```

## 🔄 Rollback (If Needed)

Change one variable in Vercel:
```
PAYMENT_PROVIDER=monnify
```

Redeploy. Done! ✅

## 📊 What Changes?

| Feature | Before (Monnify) | After (SafeHaven) |
|---------|------------------|-------------------|
| Virtual Accounts | ✅ Reserved Accounts | ✅ Sub-Accounts |
| Deposits | ✅ Webhook | ✅ Webhook |
| Withdrawals | ✅ Disbursement | ✅ Transfer |
| Bank Verification | ✅ Name Enquiry | ✅ Name Enquiry |
| Transaction History | ✅ Search API | ✅ Transactions API |

## 🎯 Testing Checklist

- [ ] Environment variables added to Vercel
- [ ] Webhook URL configured in SafeHaven
- [ ] Create test user → Virtual account created
- [ ] Fund wallet → Balance updated
- [ ] Withdraw funds → Transfer successful
- [ ] Check webhook logs → Events received
- [ ] Monitor for 24 hours → No errors

## 🆘 Quick Fixes

**"Authentication failed"**
→ Check CLIENT_ID and CLIENT_SECRET

**"Account creation failed"**  
→ Verify ACCOUNT_ID is correct

**"Webhook not working"**
→ Check webhook URL and secret match

**"Transfer failed"**
→ Ensure source account has balance

## 📞 Support

- SafeHaven: https://online.safehavenmfb.com (dashboard support)
- Your logs: https://vercel.com/[project]/logs

---

**That's it!** Your app now uses SafeHaven for all payments. 🎉
