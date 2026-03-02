import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    hasAuthTwitterId: !!process.env.AUTH_TWITTER_ID,
    hasAuthTwitterSecret: !!process.env.AUTH_TWITTER_SECRET,
    hasTwitterClientId: !!process.env.TWITTER_CLIENT_ID,
    hasTwitterClientSecret: !!process.env.TWITTER_CLIENT_SECRET,
    authTwitterIdLength: process.env.AUTH_TWITTER_ID?.length || 0,
    authTwitterSecretLength: process.env.AUTH_TWITTER_SECRET?.length || 0,
    twitterClientIdLength: process.env.TWITTER_CLIENT_ID?.length || 0,
    twitterClientSecretLength: process.env.TWITTER_CLIENT_SECRET?.length || 0,
    // Show first 10 chars to verify it's the right credential
    authTwitterIdPreview: process.env.AUTH_TWITTER_ID?.substring(0, 10) || 'not set',
    twitterClientIdPreview: process.env.TWITTER_CLIENT_ID?.substring(0, 10) || 'not set',
  })
}
