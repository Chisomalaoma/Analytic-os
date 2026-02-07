# Google OAuth Testing Guide

## Quick Test Checklist

### Before Testing
- [ ] Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set in `.env`
- [ ] Database is running and migrations are applied
- [ ] Development server is running with `npm run dev`

### Test 1: New User Sign-Up (Fresh Account)
**Goal:** Verify firstName and lastName are captured from Google profile

1. Open browser in Incognito/Private mode
2. Navigate to your app's sign-in page
3. Click "Sign in with Google"
4. Select a Google account that has NEVER signed in to your app before
5. Complete the Google OAuth flow

**Expected Results:**
- Console shows: `[GOOGLE-PROFILE] Raw profile data: { given_name: 'FirstName', family_name: 'LastName' }`
- Console shows: `[OAUTH-SIGNIN] Extracted names: { firstName: 'FirstName', lastName: 'LastName' }`
- User is redirected to dashboard
- Profile page shows correct first and last name (not "User User")
- Database `User` table has correct `firstName` and `lastName` values

**Check Database:**
```sql
SELECT email, firstName, lastName, username, userId 
FROM "User" 
WHERE email = 'your-test-email@gmail.com';
```

### Test 2: Existing User Sign-In
**Goal:** Verify no caching issues with existing users

1. Sign out from the app
2. Close browser completely
3. Open browser again (normal mode, not incognito)
4. Navigate to sign-in page
5. Click "Sign in with Google"
6. You should see Google account picker (not auto-sign-in)
7. Select your account

**Expected Results:**
- Google shows account picker (due to `prompt: 'select_account'`)
- Console shows fresh profile data being fetched
- Correct email and name displayed
- No old/cached data from previous sessions

### Test 3: Multiple Account Switching
**Goal:** Verify no cross-contamination between accounts

1. Sign in with Google Account A
2. Note the email and name displayed
3. Sign out
4. Sign in with Google Account B (different account)
5. Verify Account B's data is shown (not Account A's)

**Expected Results:**
- Each account's data is correctly isolated
- No mixing of emails, names, or usernames
- JWT tokens are properly refreshed

### Test 4: Name Change Propagation
**Goal:** Verify name updates from Google are reflected

1. Go to your Google Account settings
2. Change your first name or last name
3. Return to your app and sign out
4. Sign in again with Google
5. Check if the new name is displayed

**Expected Results:**
- Updated name from Google is shown in the app
- Database is updated with new firstName/lastName
- Console shows: `[OAUTH-SIGNIN] Updated user with OAuth data: { firstName: 'NewName' }`

### Test 5: Missing Profile Data Handling
**Goal:** Verify fallback logic works

**Note:** This is hard to test with real Google accounts, but you can check the code logic:
- If `given_name` is missing, it falls back to parsing `name`
- If `name` is missing, it uses 'User' as default

### Test 6: Concurrent Sign-Ins
**Goal:** Verify race conditions are handled

1. Open two browser tabs
2. In both tabs, start Google sign-in simultaneously
3. Complete OAuth flow in both

**Expected Results:**
- Both sign-ins complete successfully
- No database errors
- User data is consistent across both sessions

## Debugging Failed Tests

### If firstName/lastName show as "User User"

**Check:**
1. Console logs for `[GOOGLE-PROFILE]` - Does it show `given_name` and `family_name`?
2. Google OAuth consent screen - Is "profile" scope included?
3. Google Cloud Console - Is the OAuth app properly configured?

**Fix:**
- Ensure scope includes `openid email profile`
- Check that Google OAuth consent screen has access to profile information

### If old email persists

**Check:**
1. Browser cookies - Clear all cookies for your domain
2. Console logs - Look for `[JWT] Fetched fresh OAuth user data`
3. Database - Check if multiple users exist with similar emails

**Fix:**
- Clear browser cache and cookies
- The `prompt: 'select_account'` should prevent this
- Check for duplicate user records in database

### If username is missing

**Check:**
1. Console logs for `[OAUTH-SIGNIN] Updated user with OAuth data`
2. Database - Check `username` column

**Fix:**
- The code now auto-generates username from email
- Check that the signIn callback is executing (look for logs)

### If wallet is not created

**Check:**
1. Console logs for `[OAUTH-SIGNIN] Creating wallet for OAuth user`
2. Check wallet service logs
3. Database - Check `Wallet` table

**Fix:**
- Ensure wallet service is properly configured
- Check Monnify API credentials if using external wallet service

## Console Log Examples

### Successful Sign-In Flow
```
[GOOGLE-PROFILE] Raw profile data: {
  sub: 'google-user-id',
  name: 'John Doe',
  email: 'john@example.com',
  given_name: 'John',
  family_name: 'Doe',
  picture: 'https://...'
}

[OAUTH-SIGNIN] Starting OAuth sign-in for: john@example.com Provider: google

[OAUTH-SIGNIN] Profile data available: {
  given_name: 'John',
  family_name: 'Doe',
  first_name: undefined,
  last_name: undefined,
  name: 'John Doe'
}

[OAUTH-SIGNIN] Extracted names: { firstName: 'John', lastName: 'Doe' }

[OAUTH-SIGNIN] Found user: {
  email: 'john@example.com',
  hasWallet: true,
  hasUserId: true,
  hasUsername: true,
  currentFirstName: 'John',
  currentLastName: 'Doe'
}

[OAUTH-SIGNIN] Updated user with OAuth data: {
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  username: 'john_abc123'
}

[JWT] Initial sign in, user data: {
  id: 'user-id',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe'
}

[JWT] Fetched fresh OAuth user data: {
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  username: 'john_abc123'
}
```

### New User Creation Flow
```
[GOOGLE-PROFILE] Raw profile data: { ... }

[OAUTH-CREATE-EVENT] New user created by PrismaAdapter: {
  id: 'new-user-id',
  email: 'newuser@example.com',
  name: 'New User'
}

[OAUTH-SIGNIN] Starting OAuth sign-in for: newuser@example.com Provider: google

[OAUTH-SIGNIN] User not found, waiting for PrismaAdapter...

[OAUTH-SIGNIN] Found user: { ... }

[OAUTH-SIGNIN] Creating wallet for OAuth user: newuser@example.com

[OAUTH-SIGNIN] Wallet created successfully
```

## Performance Considerations

The fixes include delays (300ms + 500ms) to handle race conditions. This adds ~800ms to the OAuth flow, which is acceptable for the following reasons:

1. **Only affects OAuth sign-in** - Not regular page loads
2. **Ensures data consistency** - Prevents missing data issues
3. **Happens once per session** - Not on every request
4. **User doesn't notice** - They're already waiting for OAuth redirect

If you need to optimize:
- Monitor database query performance
- Consider using database triggers instead of delays
- Implement proper event-driven architecture with message queues

## Production Monitoring

Set up alerts for:
1. OAuth errors (check for `[OAUTH-SIGNIN] Error in signIn callback`)
2. Missing firstName/lastName (search for `firstName: 'User'` in logs)
3. Wallet creation failures (check for `Failed to create wallet`)
4. High OAuth latency (> 2 seconds)

## Additional Resources

- Check `GOOGLE_OAUTH_FIX_SUMMARY.md` for detailed technical explanation
- Review NextAuth.js documentation for advanced configuration
- Monitor Google Cloud Console for OAuth usage and errors
