import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { smileIDClient } from '@/lib/smileid'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    
    const idType = formData.get('idType') as string
    const idNumber = formData.get('idNumber') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const dob = formData.get('dob') as string
    const selfieFile = formData.get('selfie') as File

    if (!idType || !idNumber || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!selfieFile) {
      return NextResponse.json(
        { error: 'Selfie image is required' },
        { status: 400 }
      )
    }

    // Generate unique job ID
    const jobId = `KYC_${session.user.id}_${Date.now()}`

    // Convert selfie to base64
    const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer())
    const selfieBase64 = selfieBuffer.toString('base64')

    console.log('[KYC-SUBMIT] Submitting job:', {
      userId: session.user.id,
      jobId,
      idType,
      idNumber,
    })

    // Submit job using SmileID SDK
    const result = await smileIDClient.submitBiometricKYC({
      idType,
      idNumber,
      firstName,
      lastName,
      dob,
      country: 'NG',
      userId: session.user.id,
      jobId,
      selfieImage: selfieBase64,
    })

    console.log('[KYC-SUBMIT] Job submitted:', {
      smileJobId: result.smile_job_id,
      code: result.code,
    })

    // Update user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        kycStatus: 'in_progress',
        smileJobId: result.smile_job_id,
        idType,
        idNumber,
        firstName,
        lastName,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'KYC submitted successfully',
      smileJobId: result.smile_job_id,
    })
  } catch (error: any) {
    console.error('[KYC-SUBMIT] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit KYC' },
      { status: 500 }
    )
  }
}
