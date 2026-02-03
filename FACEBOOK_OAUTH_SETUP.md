# Facebook OAuth Integration - Complete Setup Guide

## ✅ What's Been Done

Facebook OAuth has been integrated into your application with automatic user creation, wallet generation, and profile setup.

### Features Implemented:
- ✅ Facebook Sign In button in SignInModal
- ✅ Facebook Sign Up button in SignUpModal  
- ✅ Automatic username generation from Facebook profile
- ✅ Automatic email extraction from Facebook account
- ✅ Automatic wallet creation for Facebook users
- ✅ First name and last name extraction from Facebook profile
- ✅ Profile picture sync from Facebook
- ✅ User ID generation for Facebook users
- ✅ Same authentication flow as Google OAuth

## 🔧 Configuration Required

### 1. Add Facebook Credentials to Vercel

You've already added these to Vercel (as shown in your screenshot):
- `FACEBOOK_CLIENT_ID` - Your Facebook App ID
- `FACEBOOK_CLIENT_SECRET` - Your Facebook App Secret

### 2. Update Local .env File

Add your Facebook credentials to `.env`:

```env
# =============================================================================
# Facebook OAuth
# =============================================================================
FACEBOOK_CLIENT_ID="your_facebook_app_id_here"
FACEBOOK_CLIENT_SECRET="your_facebook_app_secret_here"
```

### 3. Configure Facebook App Settings

In your Facebook Developers Console (https://developers.facebook.com):

#### Valid OAuth Redirect URIs:
Add these URLs to your Facebook App settings under **Settings > Basic > App Domains** and **Facebook Login > Settings > Valid OAuth Redirect URIs**:

**Production:**
```
https://wtxonline.com/api/auth/callback/facebook
```

**Development:**
```
http://localhost:3000/api/auth/callback/facebook
```

#### App Domains:
```
wtxonline.com
localhost
```

#### Site URL:
```
https://wtxonline.com
```

### 4. Required Facebook Permissions

Your app requests these permissions:
- `email` - To get user's email address
- `public_profile` - To get user's name and profile picture

These are standard permissions and don't require app review.

## 🎯 How It Works

### User Flow:

1. **User clicks "Continue with Facebook"**
   - Redirected to Facebook login
   - Grants permissions (email, public_profile)

2. **Facebook returns user data:**
   ```javascript
   {
     id: "facebook_user_id",
     name: "John Doe",
     email: "john@example.com",
     first_name: "John",
     last_name: "Doe",
     picture: { data: { url: "https://..." } }
   }
   ```

3. **Your app automatically:**
   - Creates user account if new
   - Generates unique username (e.g., `john_a3f2`)
   - Generates unique user ID
   - Extracts first name and last name
   - Syncs profile picture
   - Creates NGN wallet via Monnify
   - Signs user in
   - Redirects to dashboard

### Database Fields Populated:

```typescript
{
  id: "generated_uuid",
  userId: "USR_1234567890",  // Unique user ID
  email: "john@example.com",
  username: "john_a3f2",      // Generated from email
  firstName: "John",          // From Facebook
  lastName: "Doe",            // From Facebook
  image: "https://...",       // Facebook profile picture
  emailVerified: new Date(),  // Auto-verified for OAuth
  wallet: {
    accountNumber: "1234567890",
    bankName: "Monnify MFB",
    accountName: "John Doe",
    balance: 0
  }
}
```

## 🔒 Security Features

- ✅ Email account linking enabled (users can link Facebook to existing email account)
- ✅ Automatic email verification for OAuth users
- ✅ Secure token handling via NextAuth.js
- ✅ Session management with JWT
- ✅ HTTPS required in production

## 🧪 Testing

### Test the Integration:

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Open the app:**
   ```
   http://localhost:3000
   ```

3. **Click "Sign In" or "Sign Up"**

4. **Click "Continue with Facebook"**

5. **Verify:**
   - Facebook login popup appears
   - After login, redirected to dashboard
   - User profile shows Facebook name and picture
   - Wallet is created automatically
   - Check database to confirm all fields populated

### Check Database:

```sql
-- View Facebook users
SELECT 
  id, 
  userId,
  email, 
  username, 
  firstName, 
  lastName, 
  image,
  emailVerified
FROM "User" 
WHERE email = 'your_facebook_email@example.com';

-- Check wallet creation
SELECT 
  u.email,
  u.firstName,
  u.lastName,
  w.accountNumber,
  w.bankName,
  w.accountName,
  w.balance
FROM "User" u
LEFT JOIN "Wallet" w ON w.userId = u.id
WHERE u.email = 'your_facebook_email@example.com';
```

## 🐛 Troubleshooting

### Issue: "Redirect URI Mismatch"
**Solution:** Make sure you've added the exact callback URL to Facebook App settings:
```
https://wtxonline.com/api/auth/callback/facebook
```

### Issue: "App Not Setup"
**Solution:** 
1. Go to Facebook Developers Console
2. Settings > Basic
3. Make sure app is in "Live" mode (not Development)
4. Add your domain to "App Domains"

### Issue: "Email Not Provided"
**Solution:** 
1. Make sure `email` permission is requested
2. User must grant email permission during login
3. Check Facebook App settings for required permissions

### Issue: "Wallet Not Created"
**Solution:**
1. Check Monnify credentials in environment variables
2. Check server logs for wallet creation errors
3. Verify Monnify API is accessible
4. User can manually create wallet from dashboard if auto-creation fails

### Issue: "Name Shows as 'User User'"
**Solution:**
1. Check if Facebook provides `first_name` and `last_name` fields
2. Fallback uses `name` field split by space
3. Update profile callback in `src/lib/auth.ts` if needed

## 📝 Code Changes Made

### Files Modified:

1. **`src/lib/auth.ts`**
   - Added Facebook profile callback
   - Extracts first_name and last_name
   - Handles profile picture URL

2. **`src/components/dashboard/SignInModal.tsx`**
   - Changed Facebook button from "Coming Soon" to active
   - Calls `signIn('facebook')`

3. **`src/components/dashboard/SignUpModal.tsx`**
   - Changed Facebook button from "Coming Soon" to active
   - Calls `signIn('facebook')`

4. **`.env`**
   - Added Facebook credential placeholders

## 🚀 Deployment

### Vercel Deployment:

1. **Environment variables are already set** (as shown in your screenshot)

2. **Push code to GitHub:**
   ```bash
   git add -A
   git commit -m "Add Facebook OAuth integration"
   git push origin main
   ```

3. **Vercel will auto-deploy**

4. **Test on production:**
   ```
   https://wtxonline.com
   ```

## ✨ Next Steps

1. ✅ Add Facebook credentials to `.env` file
2. ✅ Configure Facebook App redirect URIs
3. ✅ Test Facebook login locally
4. ✅ Deploy to production
5. ✅ Test Facebook login on production
6. ✅ Monitor user signups and wallet creation

## 📞 Support

If you encounter any issues:
1. Check server logs for errors
2. Verify Facebook App configuration
3. Test with a different Facebook account
4. Check database for user and wallet records

---

**Status:** ✅ Ready to use (just add credentials)
**Last Updated:** February 3, 2026
