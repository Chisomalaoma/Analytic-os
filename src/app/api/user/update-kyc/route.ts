import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { bvn, nin } = body

    if (!bvn && !nin) {
      return NextResponse.json(
        { error: 'Either BVN or NIN is required' },
        { status: 400 }
      )
    }

    // Update user with BVN/NIN
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        bvn: bvn || undefined,
        nin: nin || undefined
      }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[UPDATE-KYC] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update KYC' },
      { status: 500 }
    )
  }
}
