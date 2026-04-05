import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { smileIDClient } from '@/lib/smileid'
import JSZip from 'jszip'

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
    const address = formData.get('address') as string
    const utilityNumber = formData.get('utilityNumber') as string
    const documentFile = formData.get('document') as File
    const selfieFile = formData.get('selfie') as File

    if (!idType || !idNumber || !firstName || !lastName || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique job ID
    const jobId = `KYC_${session.user.id}_${Date.now()}`

    // Step 1: Prepare upload with SmileID
    const prepUploadResponse = await smileIDClient.prepareUpload({
      idType,
      idNumber,
      firstName,
      lastName,
      dob,
      country: 'NG',
      userId: session.user.id,
      jobId,
    })

    const { upload_url, smile_job_id } = prepUploadResponse

    // Step 2: Create ZIP file with info.json and images
    const zip = new JSZip()

    // Convert files to base64
    const documentBuffer = documentFile ? Buffer.from(await documentFile.arrayBuffer()) : null
    const selfieBuffer = selfieFile ? Buffer.from(await selfieFile.arrayBuffer()) : null

    const infoJson = {
      package_information: {
        apiVersion: {
          buildNumber: 0,
          majorVersion: 2,
          minorVersion: 0,
        },
      },
      id_info: {
        country: 'NG',
        id_type: idType,
        id_number: idNumber,
        first_name: firstName,
        last_name: lastName,
        dob: dob || '',
        entered: true,
      },
      images: [
        ...(selfieBuffer
          ? [
              {
                image_type_id: 2,
                image: selfieBuffer.toString('base64'),
                file_name: '',
              },
            ]
          : []),
      ],
    }

    zip.file('info.json', JSON.stringify(infoJson))

    const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })

    // Step 3: Upload to SmileID
    await smileIDClient.uploadJob(upload_url, zipBuffer)

    // Step 4: Update user record
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        kycStatus: 'in_progress',
        smileJobId: smile_job_id,
        idType,
        idNumber,
        firstName,
        lastName,
      },
    })

    // Step 5: Optionally trigger address verification
    if (utilityNumber) {
      try {
        await smileIDClient.verifyAddress({
          country: 'NG',
          address,
          fullName: `${firstName} ${lastName}`,
          utilityNumber,
          utilityProvider: 'PHEDC', // You can make this dynamic
          utilityType: 'PrePaid',
          userId: session.user.id,
          jobId: `ADDR_${jobId}`,
        })
      } catch (error) {
        console.error('[KYC] Address verification failed:', error)
        // Don't fail the whole KYC if address verification fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'KYC submitted successfully',
      smileJobId: smile_job_id,
    })
  } catch (error: any) {
    console.error('[KYC-SUBMIT] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit KYC' },
      { status: 500 }
    )
  }
}
