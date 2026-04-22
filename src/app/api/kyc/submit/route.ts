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
    const livenessVideo = formData.get('livenessVideo') as File

    if (!idType || !idNumber || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Accept either selfie image OR liveness video
    if (!selfieFile && !livenessVideo) {
      return NextResponse.json(
        { error: 'Selfie image or liveness video is required' },
        { status: 400 }
      )
    }

    // Generate unique job ID
    const jobId = `KYC_${session.user.id}_${Date.now()}`

    // Convert selfie/video to base64
    let selfieBase64 = ''
    let hasLivenessVideo = false
    
    if (livenessVideo) {
      // Use liveness video (preferred)
      const videoBuffer = Buffer.from(await livenessVideo.arrayBuffer())
      selfieBase64 = videoBuffer.toString('base64')
      hasLivenessVideo = true
    } else if (selfieFile) {
      // Fallback to selfie image
      const selfieBuffer = Buffer.from(await selfieFile.arrayBuffer())
      selfieBase64 = selfieBuffer.toString('base64')
    }

    console.log('[KYC-SUBMIT] Submitting job:', {
      userId: session.user.id,
      jobId,
      idType,
      idNumber,
      hasLivenessVideo,
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
