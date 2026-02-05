import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Facebook Data Deletion Callback
 * Required for Facebook Login to go live
 * https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { signed_request } = body

    if (!signed_request) {
      return NextResponse.json(
        { error: 'Missing signed_request parameter' },
        { status: 400 }
      )
    }

    // Parse the signed request
    const [encodedSig, payload] = signed_request.split('.')
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf-8'))
    
    const userId = data.user_id
    const appId = data.app_id

    // Verify app ID matches
    if (appId !== process.env.FACEBOOK_CLIENT_ID) {
      return NextResponse.json(
        { error: 'Invalid app ID' },
        { status: 400 }
      )
    }

    // Find and delete user data associated with this Facebook ID
    const account = await prisma.account.findFirst({
      where: {
        provider: 'facebook',
        providerAccountId: userId,
      },
      include: {
        user: true,
      },
    })

    if (account) {
      // Delete user's wallet
      await prisma.wallet.deleteMany({
        where: { userId: account.userId },
      })

      // Delete user's transactions
      await prisma.transaction.deleteMany({
        where: { userId: account.userId },
      })

      // Delete user's watchlist
      await prisma.watchlist.deleteMany({
        where: { userId: account.userId },
      })

      // Delete user's notification settings
      await prisma.notificationSettings.deleteMany({
        where: { userId: account.userId },
      })

      // Delete user's price alerts
      await prisma.priceAlert.deleteMany({
        where: { userId: account.userId },
      })

      // Delete OAuth accounts
      await prisma.account.deleteMany({
        where: { userId: account.userId },
      })

      // Delete sessions
      await prisma.session.deleteMany({
        where: { userId: account.userId },
      })

      // Finally, delete the user
      await prisma.user.delete({
        where: { id: account.userId },
      })

      console.log(`[FACEBOOK] Deleted user data for Facebook ID: ${userId}`)
    }

    // Return confirmation URL as required by Facebook
    const confirmationCode = `${userId}_${Date.now()}`
    const statusUrl = `https://wtxonline.com/data-deletion-status?code=${confirmationCode}`

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    })
  } catch (error) {
    console.error('[FACEBOOK] Data deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to process data deletion request' },
      { status: 500 }
    )
  }
}

// Also support GET requests for the callback URL page
export async function GET() {
  return new NextResponse(
    `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Data Deletion Instructions - WTX Online</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            line-height: 1.6;
          }
          h1 { color: #1877F2; }
          .info { background: #f0f2f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <h1>Data Deletion Instructions</h1>
        <div class="info">
          <h2>How to Delete Your Data</h2>
          <p>If you want to delete your data from WTX Online:</p>
          <ol>
            <li>Log in to your WTX Online account at <a href="https://wtxonline.com">wtxonline.com</a></li>
            <li>Go to Account Settings</li>
            <li>Click on "Delete Account" at the bottom of the page</li>
            <li>Confirm the deletion</li>
          </ol>
          <p>All your data including profile information, wallet, transactions, and preferences will be permanently deleted within 30 days.</p>
          <h3>What Data We Collect</h3>
          <ul>
            <li>Profile information (name, email, profile picture)</li>
            <li>Wallet and transaction data</li>
            <li>Notification preferences</li>
            <li>Watchlist and price alerts</li>
          </ul>
          <h3>Contact Us</h3>
          <p>If you need assistance with data deletion, please contact us through our support chat on the website.</p>
        </div>
      </body>
    </html>
    `,
    {
      headers: {
        'Content-Type': 'text/html',
      },
    }
  )
}
