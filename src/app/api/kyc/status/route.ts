import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        kycStatus: true,
        kycVerifiedAt: true,
        idType: true,
        livenessCheckPassed: true,
        addressVerified: true,
        kycRejectionReason: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      status: user.kycStatus,
      verifiedAt: user.kycVerifiedAt,
      idType: user.idType,
      livenessCheckPassed: user.livenessCheckPassed,
      addressVerified: user.addressVerified,
      rejectionReason: user.kycRejectionReason,
      canWithdraw: user.kycStatus === 'verified',
    })
  } catch (error: any) {
    console.error('[KYC-STATUS] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get KYC status' },
      { status: 500 }
    )
  }
}
