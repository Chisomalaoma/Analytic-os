import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function GET(request: NextRequest) {
  try {
    const partnerId = process.env.SMILEID_PARTNER_ID || ''
    const apiKey = process.env.SMILEID_API_KEY || ''
    const sandbox = process.env.SMILEID_SANDBOX === 'true'

    if (!partnerId || !apiKey) {
      return NextResponse.json({
        error: 'SmileID credentials not configured',
        partnerId: !!partnerId,
        apiKey: !!apiKey,
      }, { status: 500 })
    }

    // Generate signature
    const timestamp = new Date().toISOString()
    const hmac = crypto.createHmac('sha256', apiKey)
    hmac.update(timestamp, 'utf8')
    hmac.update(partnerId, 'utf8')
    hmac.update('sid_request', 'utf8')
    const signature = hmac.digest().toString('base64')

    // Test with a simple services endpoint
    const baseUrl = sandbox
      ? 'https://testapi.smileidentity.com/v1'
      : 'https://api.smileidentity.com/v1'

    const testPayload = {
      smile_client_id: partnerId,
      timestamp,
      signature,
    }

    console.log('[SMILEID-TEST] Testing credentials:', {
      partnerId,
      apiKeyPrefix: apiKey.substring(0, 8) + '...',
      sandbox,
      baseUrl,
      timestamp,
      signaturePrefix: signature.substring(0, 20) + '...',
    })

    const response = await fetch(`${baseUrl}/services`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload),
    })

    const responseText = await response.text()
    
    console.log('[SMILEID-TEST] Response:', {
      status: response.status,
      body: responseText,
    })

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    return NextResponse.json({
      success: response.ok,
      status: response.status,
      config: {
        partnerId,
        apiKeyPrefix: apiKey.substring(0, 8) + '...',
        sandbox,
        baseUrl,
      },
      response: responseData,
    })
  } catch (error: any) {
    console.error('[SMILEID-TEST] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Test failed' },
      { status: 500 }
    )
  }
}
