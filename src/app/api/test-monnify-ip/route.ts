import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Hit a service that returns our outgoing IP
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    
    return NextResponse.json({
      success: true,
      outgoingIP: data.ip,
      message: 'This is the IP address that Monnify will see from your Vercel deployment',
      instructions: 'Add this IP to Monnify IP whitelist in your Monnify dashboard'
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch IP',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
