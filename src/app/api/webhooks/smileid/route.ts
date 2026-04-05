import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[SMILEID-WEBHOOK] Received:', JSON.stringify(body, null, 2))

    const {
      SmileJobID,
      PartnerParams,
      ResultCode,
      ResultText,
      Actions,
    } = body

    if (!SmileJobID || !PartnerParams?.user_id) {
      return NextResponse.json(
        { error: 'Invalid webhook payload' },
        { status: 400 }
      )
    }

    const userId = PartnerParams.user_id

    // Find user by SmileJobID
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        smileJobId: SmileJobID,
      },
    })

    if (!user) {
      console.error('[SMILEID-WEBHOOK] User not found:', userId, SmileJobID)
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Determine KYC status based on ResultCode
    let kycStatus: 'verified' | 'rejected' | 'in_progress' = 'in_progress'
    let livenessCheckPassed = false
    let addressVerified = false

    // Approved result codes: 1210 (Enroll User), 1012 (ID Validated)
    if (['1210', '1012'].includes(ResultCode)) {
      kycStatus = 'verified'
      livenessCheckPassed = Actions?.Liveness_Check === 'Passed' || 
                           Actions?.Selfie_Check === 'Passed'
    }
    // Rejected result codes
    else if (ResultCode.startsWith('2') || ResultCode.startsWith('3')) {
      kycStatus = 'rejected'
    }

    // Check if this is an address verification callback
    if (body.job_type === 'address_verification') {
      addressVerified = ResultCode === '1012'
    }

    // Update user KYC status
    await prisma.user.update({
      where: { id: userId },
      data: {
        kycStatus,
        kycVerifiedAt: kycStatus === 'verified' ? new Date() : undefined,
        livenessCheckPassed: kycStatus === 'verified' ? livenessCheckPassed : false,
        addressVerified: addressVerified || user.addressVerified,
        kycRejectionReason: kycStatus === 'rejected' ? ResultText : null,
      },
    })

    // Send notification to user
    await prisma.notification.create({
      data: {
        userId,
        type: 'alert',
        title: kycStatus === 'verified' ? 'KYC Verified' : 'KYC Update',
        message:
          kycStatus === 'verified'
            ? 'Your KYC verification is complete. You can now withdraw funds.'
            : kycStatus === 'rejected'
            ? `KYC verification failed: ${ResultText}`
            : 'Your KYC verification is being processed.',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[SMILEID-WEBHOOK] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
