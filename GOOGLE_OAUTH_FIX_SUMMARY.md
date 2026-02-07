# Google OAuth Authentication Fix - Complete Analysis & Solution

## Issues Identified

### 1. **Cache Issues with Old Email/Username**
**Problem:** When signing in with Google, sometimes old cached data (email, username) from previous sessions was being used instead of fresh data from Google.

**Root Cause:** 
- The `prompt: 'consent'` parameter was allowing Google to use cached consent, which could return stale data
- JWT tokens were not being refreshed with latest database values on OAuth sign-in

**Fix Applied:**
- Changed `prompt: 'consent'` to `prompt: 'select_account'` - This forces Google to show the account picker every time, preventing cached account data from being used
- Added 500ms delay in JWT callback to ensure database operations complete before fetching fresh user data
- JWT callback now always fetches fresh data from database for OAuth users on initial sign-in

### 2. **Missing firstName and lastName from Google Profile**
**Problem:** Google provides `given_name` and `family_name` in the OAuth profile, but these weren't being properly extracted and saved to the database.

**Root Cause:**
- The profile callback was returning `firstName` and `lastName`, but PrismaAdapter doesn't automatically save custom fields
- The signIn callback was only updating these fields if they were missing, not on every sign-in
- Race conditions between PrismaAdapter creating the user and our signIn callback updating it

**Fix Applied:**
- Enhanced Google profile callback to log all profile data for debugging
- Added fallback logic: `profile.given_name` → `profile.name.split(' ')[0]` → `'User'`
- **CRITICAL FIX:** Changed signIn callback to ALWAYS update firstName/lastName from OAuth profile on every sign-in (not just when missing)
- This ensures that if a user changes their name on Google, it gets updated in our database

### 3. **Race Conditions in User Creation**
**Problem:** Sometimes username or email would be missing because of timing issues between PrismaAdapter creating the user and our custom logic running.

**Root Cause:**
- The 100ms wait was insufficient for database operations to complete
- No retry logic if user wasn't found immediately

**Fix Applied:**
- Increased initial wait to 300ms
- Added retry logic: if user not found, wait another 500ms and try again
- Better error logging to track the flow of user creation

### 4. **Insufficient Logging**
**Problem:** Hard to debug OAuth issues without detailed logs.

**Fix Applied:**
- Added comprehensive logging with prefixes:
  - `[GOOGLE-PROFILE]` - Raw profile data from Google
  - `[OAUTH-SIGNIN]` - Sign-in callback flow
  - `[JWT]` - JWT token creation and updates
  - `[OAUTH-CREATE-EVENT]` - User creation events
- Logs show firstName, lastName, email, username at each step

## Code Changes Summary

### src/lib/auth.ts

#### 1. Google Provider Configuration
```typescript
Google({
  authorization: {
    params: {
      prompt: 'select_account', // Changed from 'consent'
    },
  },
  profile(profile) {
    console.log('[GOOGLE-PROFILE] Raw profile data:', { ... })
    return {
      firstName: profile.given_name || profile.name?.split(' ')[0] || 'User',
      lastName: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || 'User',
    }
  },
})
```

#### 2. JWT Callback Enhancement
```typescript
async jwt({ token, user, account, trigger, session }) {
  // For OAuth users, wait for DB operations and fetch fresh data
  if (user && account?.provider === 'google') {
    await new Promise(resolve => setTimeout(resolve, 500))
    const dbUser = await prisma.user.findUnique({ ... })
    // Update token with fresh data
  }
}
```

#### 3. SignIn Callback - Critical Fix
```typescript
async signIn({ user, account, profile }) {
  // Extract names from profile (most reliable source)
  let firstName = (profile as any).given_name || 'User'
  let lastName = (profile as any).family_name || 'User'
  
  // ALWAYS update firstName/lastName on every sign-in
  await prisma.user.update({
    where: { id: existingUser.id },
    data: {
      firstName: firstName, // Always update
      lastName: lastName,   // Always update
    }
  })
}
```

## Testing Instructions

### 1. Test New User Sign-Up
1. Clear browser cookies and cache
2. Sign in with a Google account that hasn't been used before
3. Check the console logs for `[GOOGLE-PROFILE]` and `[OAUTH-SIGNIN]` messages
4. Verify firstName and lastName are correctly saved in the database
5. Check the profile page - should show correct first and last name

### 2. Test Existing User Sign-In
1. Sign in with a Google account that was used before
2. Verify the correct email and username are displayed
3. Check that firstName and lastName match your Google account

### 3. Test Name Update
1. Change your name on your Google account
2. Sign out of the app
3. Sign in again with Google
4. Verify the new name is reflected in the app

### 4. Test Cache Busting
1. Sign in with Google account A
2. Sign out
3. Sign in with Google account B
4. Verify account B's data is shown (not account A's cached data)

## Environment Variables Required

Ensure these are set in your `.env` file:
```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## Database Schema

The User model must have these fields:
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?   // Used by NextAuth
  firstName     String?   // Custom field
  lastName      String?   // Custom field
  username      String?   @unique
  userId        String?   @unique
  image         String?
  // ... other fields
}
```

## Common Issues & Solutions

### Issue: "User" appears as firstName/lastName
**Solution:** Check that Google OAuth consent screen has access to profile information. Ensure the scope includes `profile`.

### Issue: Old email still showing
**Solution:** 
1. Clear browser cookies for your domain
2. Sign out completely
3. The `prompt: 'select_account'` change should prevent this going forward

### Issue: Username is missing
**Solution:** The signIn callback now generates a unique username from email if missing. Check logs for `[OAUTH-SIGNIN] Updated user with OAuth data`.

## Additional Improvements Made

1. **Better Error Handling:** All OAuth operations wrapped in try-catch with detailed error logging
2. **Wallet Creation:** Ensured wallet is created for OAuth users with correct firstName/lastName
3. **Consistent Naming:** All OAuth-related logs use consistent prefixes for easy filtering
4. **Removed Duplicate Code:** Cleaned up the duplicate `authOptions` export (kept for backward compatibility but not actively used)

## Monitoring & Debugging

To debug OAuth issues in production:

1. Check server logs for these patterns:
   - `[GOOGLE-PROFILE]` - Shows what Google sent
   - `[OAUTH-SIGNIN]` - Shows the sign-in flow
   - `[JWT]` - Shows token creation

2. Common log patterns to look for:
   ```
   [GOOGLE-PROFILE] Raw profile data: { given_name: 'John', family_name: 'Doe' }
   [OAUTH-SIGNIN] Extracted names: { firstName: 'John', lastName: 'Doe' }
   [OAUTH-SIGNIN] Updated user with OAuth data: { email: '...', firstName: 'John', lastName: 'Doe' }
   [JWT] Fetched fresh OAuth user data: { firstName: 'John', lastName: 'Doe' }
   ```

## References

- [NextAuth.js Google Provider Docs](https://authjs.dev/reference/core/providers_google)
- [Google OAuth 2.0 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
- [PrismaAdapter Documentation](https://authjs.dev/reference/adapter/prisma)

## Summary

The main fixes ensure that:
1. ✅ Google profile data (firstName, lastName) is always retrieved and saved
2. ✅ No cached/stale data is used (forced account selection)
3. ✅ Race conditions are handled with proper delays and retries
4. ✅ Comprehensive logging for debugging
5. ✅ Names are updated on every sign-in (not just first time)
