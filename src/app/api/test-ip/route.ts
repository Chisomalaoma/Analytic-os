import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  // Get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const real = request.headers.get('x-real-ip')
  const vercelForwarded = request.headers.get('x-vercel-forwarded-for')
  
  return NextResponse.json({
    'x-forwarded-for': forwarded,
    'x-real-ip': real,
    'x-vercel-forwarded-for': vercelForwarded,
    message: 'Add these IPs to Monnify IP whitelist'
  })
}
